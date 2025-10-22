import { personagens } from './global.js';

//rotas gerais do mestre
const index = (req, res) => {
    res.json({jogador: req.params.jogador})
}

const controle = (req, res) => {
    res.json({jogador: req.params.jogador})
}

//rotas do mestre para dados
const resetaDados = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    jogador.resetaDado(jogador.d6, 6);
    jogador.rolagensD6 = 0;
    jogador.resetaDado(jogador.d10_1, 10);
    jogador.rolagensD10_1 = 0;
    jogador.resetaDado(jogador.d10_2, 10);
    jogador.rolagensD10_2 = 0;
    jogador.rolagemAberta = true;

    return res.json({ jogador: key });
}

const rolagensEstado = (req, res) => {
    console.log(`Rolagens: ${personagens[String(req.params.jogador)].rolagensD6}`)
    res.json({ rolagens: personagens[String(req.params.jogador)].rolagensD6 })
}

const exibeRolagem = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.rolagemAberta = false;
    const acao = jogador.moda(jogador.d6, 6);
    const desafio1 = jogador.moda(jogador.d10_1, 10);
    const desafio2 = jogador.moda(jogador.d10_2, 10);
    const bonus = Number(req.body.bonus) || 0;
    const totalNumerico = acao + bonus;
    const resolucao = jogador.resolucaoIronsworn(totalNumerico, desafio1, desafio2);

    res.json({
        total: `${acao} + ${bonus} = ${totalNumerico}`,
        desafio1,
        desafio2,
        resolucao,
        d6_rolls: jogador.d6,
        d10_1: jogador.d10_1,
        d10_2: jogador.d10_2,
        jogador: req.params.jogador
    });
}

//rotas do mestre para escolhas
const criaVotacao = (req, res) => {
    res.json({jogador: req.params.jogador})

}

const esperaVotacao = (req, res) => {
    const jogador = personagens[String(req.params.jogador)]
    jogador.votacaoAberta = true
    jogador.opcoes = req.body.opcao

    if (jogador.opcoes.length == 0) throw new Error("Sem opcoes")

    for(let i = 0; i < jogador.opcoes.length; i++) {
        jogador.votacao[i] = 0
    }

    jogador.votacaoAtual = 0
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
    index,
    controle,
    resetaDados,
    rolagensEstado,
    exibeRolagem,
    criaVotacao,
    esperaVotacao,
    votacaoEstado
}
