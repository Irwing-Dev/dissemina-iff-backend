import { personagens } from './global';

const logIn = (req, res) => {
  res.json({ mensagem: 'Login endpoint ativo. Envie dados via POST se necessário.' })
}

// 📜 Retorna estado atual do jogador
const jogador = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  res.json({
    nomeDado: 'Dados',
    passoAtual: jogador.passoAtual,
    votacaoAtual: jogador.votacaoAtual,
    votacaoAberta: jogador.votacaoAberta,
    resultadoVotacao: jogador.mensagemVotacao,
    jogador: req.params.jogador
  })
}

// 🎲 Rola todos os dados
const full = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (jogador.rolagemAberta) {
    const rollD6 = Math.floor(Math.random() * 6) + 1
    const rollD10_1 = Math.floor(Math.random() * 10) + 1
    const rollD10_2 = Math.floor(Math.random() * 10) + 1

    jogador.rolagensD6++
    jogador.rolagensD10_1++
    jogador.rolagensD10_2++

    const resultado = {
      D6: rollD6,
      D10_1: rollD10_1,
      D10_2: rollD10_2
    }

    const resolucao = jogador.resolucaoIronsworn(rollD6, rollD10_1, rollD10_2)

    res.json({
      dado: 'full',
      resultado,
      resolucao,
      rolagem: jogador.rolagensD6,
      passoAtual: jogador.passoAtual,
      votacaoAberta: jogador.votacaoAberta,
      votacaoAtual: jogador.votacaoAtual,
      jogador: req.params.jogador
    })
  } else {
    res.status(403).json({
      mensagem: 'Rolagem de dados bloqueada pelo mestre do jogo.',
      jogador: req.params.jogador
    })
  }
}

// 🗳️ Retorna opções de votação
const votacao = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (jogador.votacaoAberta) {
    res.json({
      jogador: req.params.jogador,
      opcoes: jogador.opcoes,
      votacaoAberta: true
    })
  } else {
    res.json({
      jogador: req.params.jogador,
      mensagem: 'Nenhuma votação ativa.'
    })
  }
}

// ✅ Registrar voto
const depositaVoto = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  const voto = req.params.voto
  let votoValido = false

  for (let i = 0; i < jogador.opcoes.length; i++) {
    if (voto === jogador.opcoes[i]) {
      jogador.votacao[i]++
      jogador.votacaoAtual++
      votoValido = true
      break
    }
  }

  if (votoValido) {
    res.json({
      mensagem: 'Voto computado com sucesso.',
      jogador: req.params.jogador,
      votacaoAtual: jogador.votacaoAtual
    })
  } else {
    res.status(400).json({
      erro: 'Opção de voto inválida.',
      jogador: req.params.jogador
    })
  }
}

export default {
  logIn,
  jogador,
  full,
  votacao, 
  depositaVoto
}