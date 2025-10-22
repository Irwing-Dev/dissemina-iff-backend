import { personagens } from '../models/Jogadores.js';

//rotas do mestre para dados
const iniciaRolagens = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    jogador.resetaDado(jogador.dado_acao);
    jogador.numRolagens = 0;
    
    jogador.rolagemAberta = true;

    return res.json({ jogador: key });
}

const exibeRolagem = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.rolagemAberta = false;
    const acao = jogador.moda(jogador.dado_acao);
    
    const bonus = Number(req.body.bonus) || 0;
    const totalNumerico = acao + bonus;

    res.json({
        total: `${acao} + ${bonus} = ${totalNumerico}`,
        valor_acao: acao,
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
