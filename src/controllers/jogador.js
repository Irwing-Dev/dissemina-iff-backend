import { Dado } from '../models/Dado.js';
import { personagens } from '../models/Jogadores.js';

// const logIn = (req, res) => {
//   res.json({ mensagem: 'Login endpoint ativo. Envie dados via POST se necessário.' })
// }

// Retorna estado atual do jogador
const player = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  res.json({
    votacaoAberta: jogador.votacaoAberta,
    rolagemAberta: jogador.rolagemAberta,
    resultadoVotacao: jogador.mensagemVotacao,
    jogador: req.params.jogador,
    vidaAtual:jogador.vidaAtual
  })
}


// delayzinho
const delay = (delay) => new Promise(resolve => setTimeout(resolve, delay))

// Rola todos os dados
const rollAll = async(req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (!jogador.rolagemAberta){
      return res.status(403).json({
        mensagem: 'Rolagem de dados bloqueada pelo mestre do jogo.',
        jogador: req.params.jogador
      })
  } 
  
  await delay(1000);

  const rollAcao = jogador.dado_acao.roll();
  console.log("passou acao")
  const resultados = []

  if(jogador.dados) {
    jogador.dados.forEach(dado => {
      resultados.push({
        name: dado.name, 
        todas_rolagem: dado.rolagem, 
        rolagem_atual: dado.roll()
      });
    });
  }


  jogador.numRolagens++

  const resultado_acao = {
    rolagem_atual: rollAcao,
    todas_rolagens: jogador.dado_acao.rolagem,
  }

  return res.json({ 
    resultados,
    resultado_acao,
    jogador: req.params.jogador
  })

}

// Retorna opções de votação

const depositaVotoComDado = (req, res) => {
  const voto = req.params.voto;
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })
  if (!voto) return res.status(400).json({message: "Não enviou o voto paisão"})
  if (jogador.jaVotou) return res.status(403).json({ erro: "Você já votou nessa rodada!" });
  
  jogador.jaVotou = true;

    let rolada;
    let votos;
    for(let i = 0; i < jogador.opcoesComDado.length; i++) {
        if(jogador.opcoesComDado[i].name == voto) {
          rolada = jogador.opcoesComDado[i].dado.roll();

          jogador.votacao[i]++
          votos = jogador.votacao[i];
          jogador.votosTotal++
          break;
        }
    }
  
  return res.status(200).json({valorRolagem: rolada, votos: votos});
}


const votacao = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (jogador.votacaoAberta) {
    return res.json({
      jogador: req.params.jogador,
      opcoes: jogador.opcoes,
      opcoesComDado: jogador.opcoesComDado,
      opcoesPadrao: jogador.opcoesPadrao,
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
  if (jogador.jaVotou) return res.status(403).json({ erro: "Você já votou nessa rodada!" });

  const voto = req.params.voto
  
  // O output vai mudar a exibição das opções se o voto for com dado ou sem
  for (let i = 0; i < jogador.opcoes.length; i++) {
    if (voto == jogador.opcoes[i]) {
        jogador.votacao[i]++
        break;
      }
    }
    
  jogador.votosTotal++
  jogador.jaVotou = true

  res.json({mensagem: "Voto computado com sucesso", 
    jogador: req.params.jogador, 
    votosTotal: jogador.votosTotal
  })
}

// Mostrar vida do jogador
const getVidaJogador = (req,res) => {
  const jogador = personagens[String(req.params.jogador)];
  return res.json({vidaAtual:jogador.vidaAtual})
}

export default {
  // logIn,
  player,
  rollAll,
  votacao,
  depositaVoto,
  depositaVotoComDado,
  getVidaJogador
};
