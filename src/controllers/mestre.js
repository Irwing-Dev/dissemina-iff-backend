import personagens from './global';

//rotas gerais do mestre
const index = (req, res) => {
    res.json({jogador: req.params.jogador})
}

const controle = (req, res) => {
    res.json({jogador: req.params.jogador})
}


//rotas do mestre para dados
const resetaDados = (req, res) => {
    personagens[String(req.params.jogador)].resetaDado(personagens[String(req.params.jogador)].d6, 6)
    personagens[String(req.params.jogador)].rolagensD6 = 0
    personagens[String(req.params.jogador)].resetaDado(personagens[String(req.params.jogador)].d10_1, 10)
    personagens[String(req.params.jogador)].rolagensD10_1 = 0
    personagens[String(req.params.jogador)].resetaDado(personagens[String(req.params.jogador)].d10_2, 10)
    personagens[String(req.params.jogador)].rolagensD10_2 = 0
    personagens[String(req.params.jogador)].rolagemAberta = true
    res.json({jogador: req.params.jogador})
}

const rolagensEstado = (req, res) => {
    console.log(`Rolagens: ${personagens[String(req.params.jogador)].rolagensD6}`)
    res.json({ rolagens: personagens[String(req.params.jogador)].rolagensD6 })
}

const exibeRolgem = (req, res) => {
    console.log(personagens[String(req.params.jogador)])
    personagens[String(req.params.jogador)].rolagemAberta = false
    const acao = personagens[String(req.params.jogador)].moda(personagens[String(req.params.jogador)].d6, 6)
    const desafio1 = personagens[String(req.params.jogador)].moda(personagens[String(req.params.jogador)].d10_1, 10)
    const desafio2 = personagens[String(req.params.jogador)].moda(personagens[String(req.params.jogador)].d10_2, 10)
    const bonus = parseInt(req.body.bonus)
    let total = acao + bonus
    let resolucao = personagens[String(req.params.jogador)].resolucaoIronsworn(total, desafio1, desafio2)
    total = `${acao} + ${bonus} = ${total}`
    console.log(`Ação: ${acao}, Desafio 1: ${desafio1}, Desafio 2: ${desafio2}, Total: ${total}, Resolução: ${resolucao}`)
    res.json({total, desafio1, desafio2, resolucao, d6, jogador: req.params.jogador})
}

const voltar = (req, res) => {
    res.redirect(`/mestre/${req.params.jogador}`)
}




//rotas do mestre para escolhas
const criaVotacao = (req, res) => {
    res.json({jogador: req.params.jogador})

}

const esperaVotacao = (req, res) => {
    personagens[String(req.params.jogador)].votacaoAberta = true
    personagens[String(req.params.jogador)].opcoes = req.body.opcao

    for(let i=0; i<personagens[String(req.params.jogador)].opcoes.length; i++) {
        personagens[String(req.params.jogador)].votacao[i] = 0
    }

    personagens[String(req.params.jogador)].votacaoAtual = 0
    res.json({jogador: req.params.jogador})
}

const votacaoEstado = (req, res) => {
    res.json({ votosTotal: personagens[String(req.params.jogador)].votosTotal })
}

export default {
    index,
    controle,
    resetaDados,
    rolagensEstado,
    exibeRolgem,
    voltar,
    criaVotacao,
    esperaVotacao,
    votacaoEstado
}