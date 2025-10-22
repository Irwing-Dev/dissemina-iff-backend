import { personagens } from '../models/Jogadores.js';

// const logIn = (req, res) => {
//   res.json({ mensagem: 'Login endpoint ativo. Envie dados via POST se necessário.' })
// }


// Retorna estado atual do jogador
const jogador = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  res.json({
    votacaoAberta: jogador.votacaoAberta,
    rolagemAberta: jogador.rolagemAberta,
    resultadoVotacao: jogador.mensagemVotacao,
    jogador: req.params.jogador
  })
}

const rollDice = (sides, player= null) => {
  const roll = Math.floor(Math.random() * sides) +1;
  // em algum momento receber o player aqui para guardar as rolagens
  return roll;
}

// Rola todos os dados
const rollAll = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (!jogador.rolagemAberta){
      return res.status(403).json({
        mensagem: 'Rolagem de dados bloqueada pelo mestre do jogo.',
        jogador: req.params.jogador
      })
  } 
  
  const rollAcao = rollDice(20);
  jogador.dado_acao[rollAcao - 1]++;
  jogador.numRolagens

  // jogador.d6[rollD6 - 1] += 1
  // //rollD6 += 1
  // jogador.rolagensD6++
  
  // jogador.d10_1[rollD10_1 - 1] += 1
  // //rollD10_1 += 1
  // jogador.rolagensD10_1++
  
  // jogador.d10_2[rollD10_2 - 1] += 1
  // //rollD10_2 += 1
  // jogador.rolagensD10_2++


  const resultado = {
    dado_acao: rollAcao,
    numRolagens: jogador.numRolagens,
    rolagens: jogador.dado_acao,
  }

  return res.json({
    resultado,
    jogador: req.params.jogador
  })

}

// Retorna opções de votação
const votacao = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (jogador.votacaoAberta) {
    return res.json({
      jogador: req.params.jogador,
      opcoes: jogador.opcoes,
      votacaoAberta: true
    })
  }
    
  return res.json({
    jogador: req.params.jogador,
    mensagem: 'Nenhuma votação ativa.'
  });
}

// Registrar voto
const depositaVoto = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  const voto = req.params.voto
  
  for (let opcao in jogador.opcoes) {
    if (voto == jogador.opcoes[opcao]) {
        jogador.votacao[opcao]++
      }
    }
    
  jogador.votosTotal++

  res.json({mensagem: "Voto computado com sucesso", 
    jogador: req.params.jogador, 
    votosTotal: jogador.votosTotal
  })
}

export default {
  // logIn,
  jogador,
  rollAll,
  votacao, 
  depositaVoto
}
