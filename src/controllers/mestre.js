import { personagens } from '../models/Jogadores.js';
import { Dado } from "../models/Dado.js"

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

const exibeRolagem = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.rolagemAberta = false;

    const acao = jogador.dado_acao.moda();
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
            const valor = dado.moda();
            modas.push({
                name: dado.name, 
                valor: valor, 
                bonus: dado.bonus | 0,
                total: `${valor} + ${dado.bonus} = ${valor+dado.bonus}`
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
    const result = jogador.opcoes.map((opcao, index) => ({
        opcao,
        votos: jogador.votacao[index]
    }))
    res.json({ votosTotal: jogador.votosTotal, result })
}

export default {
    iniciaRolagens,
    exibeRolagem,
    criaVotacao,
    votacaoEstado
}
