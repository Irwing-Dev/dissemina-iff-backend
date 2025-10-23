import { personagens } from '../models/Jogadores.js';
import { Dado } from "../models/Dado.js"
import { OpcaoComDado } from '../models/OpcaoComDado.js';

//rotas do mestre para dados
const iniciaRolagens = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    jogador.dado_acao.resetaRolagens();
    jogador.numRolagens = 0;
    if(req.body.dados) {
        jogador.dados = req.body.dados.map((dado, index) => new Dado(dado.lados, dado.quantidade, dado.name, dado.bonus | 0));
    }
    jogador.dado_acao.bonus = req.body.bonus_acao;
    jogador.rolagemAberta = true;

    return res.json({ jogador: key });
}

const votacaoMaisDado = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    jogador.opcoesComDado = req.body.opcoes.map((op, index) => new OpcaoComDado(
        op.name, 
        new Dado(op.dado.lados, op.dado.quantidade, op.dado.name, op.dado.bonus | 0),
    ));


    for(let i = 0; i < jogador.opcoesComDado.length; i++) {
        jogador.votacao[i] = 0
    }
    jogador.votosTotal = 0
    jogador.votacaoAberta = true;
    return res.status(200).json({jogador: key});
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
    const modas = [
        {
            name: jogador.dado_acao.name,
            valor: acao,
            bonus: bonus,
            mult: mult,
        }
    ]

    if(jogador.dados) {
        jogador.dados.forEach(dado => {
            const valor = dado.moda();

            modas.push({
                name: dado.name, 
                valor: valor, 
                bonus: dado.bonus | 0,
                mult: mult,
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

const criaVotacao = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.votacaoAberta = true;
    jogador.opcoes = req.body.opcoes
    

    for(let i=0; i<jogador.opcoes.length; i++) {
        jogador.votacao[i] = 0
    }

    jogador.votosTotal = 0
    res.json({jogador: req.params.jogador})
}

const votacaoEstado = (req, res) => {
    const jogador = personagens[String(req.params.jogador)]
    let opcoesComDado = jogador.opcoesComDado;
    let opcoes =  opcoesComDado ? opcoesComDado: jogador.opcoes 

    const result = opcoes.map((op, index) => ({
        name: op.name,
        votos: jogador.votacao[index],
        moda: opcoesComDado ? opcoesComDado[index].dado.moda() : undefined
    }))
    jogador.opcoesComDado = undefined
    jogador.opcoes = undefined
    jogador.votacaoAberta = false
    res.json({ votosTotal: jogador.votosTotal, result })
}

export default {
    iniciaRolagens,
    exibeRolagem,
    criaVotacao,
    votacaoEstado,
    votacaoMaisDado
}
