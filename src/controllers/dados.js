let rolagemAberta = true // exemplo: variável de controle
let rolagensD6 = 0
let rolagensD10_1 = 0
let rolagensD10_2 = 0

// Arrays de contagem
let d6 = Array(6).fill(0)
let d10_1 = Array(10).fill(0)
let d10_2 = Array(10).fill(0)

const d6Handler = (req, res) => {
  if (rolagemAberta) {
    const roll = Math.floor(Math.random() * 6)
    d6[roll]++
    rolagensD6++

    return res.json({
      dado: 'd6',
      nomeDado: 'Dado de Ação',
      resultado: roll + 1,
      totalRolagens: rolagensD6
    })
  } else {
    return res.status(403).json({
      dado: 'd6',
      nomeDado: 'Dado de Ação',
      mensagem: 'Rolagem de dados bloqueada pelo mestre do jogo.'
    })
  }
}

const d10_1Handler = (req, res) => {
  if (rolagemAberta) {
    const roll = Math.floor(Math.random() * 10)
    d10_1[roll]++
    rolagensD10_1++

    return res.json({
      dado: 'd10_1',
      nomeDado: 'Dado de Desafio 1',
      resultado: roll + 1,
      totalRolagens: rolagensD10_1
    })
  } else {
    return res.status(403).json({
      dado: 'd10_1',
      nomeDado: 'Dado de Desafio 1',
      mensagem: 'Rolagem de dados bloqueada pelo mestre do jogo.'
    })
  }
}

const d10_2Handler = (req, res) => {
  if (rolagemAberta) {
    const roll = Math.floor(Math.random() * 10)
    d10_2[roll]++
    rolagensD10_2++

    return res.json({
      dado: 'd10_2',
      nomeDado: 'Dado de Desafio 2',
      resultado: roll + 1,
      totalRolagens: rolagensD10_2
    })
  } else {
    return res.status(403).json({
      dado: 'd10_2',
      nomeDado: 'Dado de Desafio 2',
      mensagem: 'Rolagem de dados bloqueada pelo mestre do jogo.'
    })
  }
}

const desafio1 = (req, res) => {
  return res.json({
    dado: 'd10_1',
    nomeDado: 'Dado de Desafio 1',
    mensagem: 'Rolagem de desafio 1 iniciada.'
  })
}

const desafio2 = (req, res) => {
  return res.json({
    dado: 'd10_2',
    nomeDado: 'Dado de Desafio 2',
    mensagem: 'Rolagem de desafio 2 iniciada.'
  })
}

export const dados = {
  d6: d6Handler,
  d10_1: d10_1Handler,
  d10_2: d10_2Handler,
  desafio1,
  desafio2
}