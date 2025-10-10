d6 = (req, res) => {
    if (rolagemAberta) {
        roll = Math.floor(Math.random()*6)
        d6[roll] = d6[roll] + 1
        rolagensD6++
        res.send('rolagem', {dado:'d6', nomeDado: 'Dado de Ação', resultado: roll+1, rolagem: rolagensD6})
    } else {
        res.send('rolagem', {dado:'d6', nomeDado: 'Dado de Ação', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.'})
    }
}

desafio1 = (req, res) => {
    res.send({dado:'d10_1', nomeDado: 'Dado de Desafio 1'})
}

d10_1 = (req, res) => {
    if (rolagemAberta) {
        roll = Math.floor(Math.random()*10)
        d10_1[roll] = d10_1[roll] + 1
        rolagensD10_1++
        res.send({dado:'d10_1', nomeDado: 'Dado de Desafio 1', resultado: roll+1, rolagem: rolagensD10_1})
    } else {
        res.send({dado:'d10_1', nomeDado: 'Dado de Desafio 1', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.'})
    }
}

desafio2 = (req, res) => {
    res.send({dado:'d10_2', nomeDado: 'Dado de Desafio 2'})
}

d10_2 = (req, res) => {
    if (rolagemAberta) {
        roll = Math.floor(Math.random()*10)
        d10_2[roll] = d10_2[roll] + 1
        rolagensD10_2++
        res.send({dado:'d10_2', nomeDado: 'Dado de Desafio 2', resultado: roll+1, rolagem: rolagensD10_2})
    } else {
        res.send({dado:'d10_2', nomeDado: 'Dado de Desafio 2', mensagem:'Rolagem de dados bloqueada pelo mestre do jogo.'})
    }
}

module.exports.dados = {
    d6,
    d10_1,
    d10_2,
    desafio1,
    desafio2
}