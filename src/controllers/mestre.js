import { personagens } from '../models/Jogadores.js';
import { Dado } from "../models/Dado.js"
import { OpcaoComDado } from '../models/OpcaoComDado.js';

//rotas do mestre para dados
const iniciaRolagens = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    if(req.body.dados && Array.isArray(req.body.dados)) {
        jogador.dados = req.body.dados.map((dado, index) => {
            const lados = dado.lados;
            const quantidade = dado.quantidade;
            const bonus = dado.bonus || 0;
            const name = dado.name;

            if (typeof lados !== 'number' || typeof quantidade !== 'number' || lados <= 0 || quantidade <= 0) {
                 throw new Error(`Configuração de dado inválida: lados=${lados}, quantidade=${quantidade}`);
            }

            return new Dado(lados, quantidade, name, bonus);
        });
    } else {
        jogador.dados = [];
    }
    
    jogador.dado_acao.bonus = req.body.bonus_acao;
    jogador.rolagemAberta = true;

    return res.json({ jogador: key });
}

const exibeRolagem = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.rolagemAberta = false;

    const acao = jogador.dado_acao.moda();
    let mult = 1
    if(acao == jogador.dado_acao.lados) {
        mult = 2
    }
    const bonus = jogador.dado_acao.bonus | 0
    const totalNumerico = acao + bonus;
    const modas = [
        {
            name: jogador.dado_acao.name,
            valor: acao,
            bonus: bonus,
            total: `${acao} + ${bonus} = ${totalNumerico}`
        }
    ]

    if(jogador.dados) {
        jogador.dados.forEach(dado => {
            let valor = dado.moda();
            if(Array.isArray(valor))
            modas.push({
                name: dado.name, 
                valor: valor, 
                bonus: dado.bonus | 0,
                total: `${valor} + ${dado.bonus} = ${(valor)+dado.bonus}`
            })
        });
    }
    jogador.dados = null
   
    return res.json({
        modas: modas,
        total_de_rolagens: jogador.numRolagens,
        jogador: req.params.jogador
    });
}

//rotas do mestre para escolhas

const votacaoMaisDado = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    jogador.opcoesComDado = req.body.opcoes.map(op => new OpcaoComDado(
        op.name,
        op.dados.map(dado => new Dado(dado.lados, dado.quantidade, dado.name, dado.bonus | 0)),
    ));


    for(let i = 0; i < jogador.opcoesComDado.length; i++) {
        jogador.votacao[i] = 0
    }
    jogador.votosTotal = 0
    jogador.votacaoAberta = true;
    return res.status(200).json({jogador: key});
}

const criaVotacao = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.votacaoAberta = true;
    jogador.opcoes = req.body.opcoes
    

    for(let i=0; i<jogador.opcoes.length; i++) {
        jogador.votacao[i] = 0
    }

    jogador.votosTotal = 0;
    jogador.votantes = [];
    res.json({jogador: req.params.jogador})
}

const getOpcoesSalvas = (req, res) => {
    const jogador = personagens[String(req.params.jogador)]
    if(!jogador) return res.status(400).json({"message": "jogador invalido"})
    return res.status(200).json({opcoesSalvas: jogador.opcoesPadrao})
}

const votacaoEstado = (req, res) => {
    const jogador = personagens[String(req.params.jogador)]
    
    let opcoesComDado = jogador.opcoesComDado;
    // Verifica se opcoesComDado existe E tem elementos
    let opcoes = (opcoesComDado && opcoesComDado.length > 0) ? opcoesComDado : jogador.opcoes

    console.log('DEBUG - opcoes escolhidas:', opcoes)
    
    const result = opcoes.map((op, index) => ({
        name: op.name,
        votos: jogador.votacao[index],
        // Clean code é pros fracos coda-fofo
        rolagens: (op.dado && op.dado.length> 0) ? op.dado.map((d, index) => {return {name: d.name, moda: d.moda()}}) : null
    }))

    
    jogador.opcoesComDado = undefined
    jogador.opcoes = undefined      
    jogador.votacaoAberta = false
    opcoes.forEach(op => delete op.dado.forEach(d => delete d.rolagem))
    jogador.opcoesPadrao.push(...opcoes)
    res.json({ votosTotal: jogador.votosTotal, result })
}

// Registrar vida do jogador
const postVidaJogador = (req,res) => {
  console.log('Passei aqui')
  const jogador = personagens[String(req.params.jogador)];
  const vidaNova = req.body.vidaNova
  jogador.vidaAtual = vidaNova;
  return res.json({
    vidaAtual:vidaNova
  })
}


export default {
    iniciaRolagens,
    exibeRolagem,
    criaVotacao,
    votacaoEstado,
    votacaoMaisDado,
    postVidaJogador,
    getOpcoesSalvas
}
