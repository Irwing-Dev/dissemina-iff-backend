import { Dado } from '../models/Dado.js';
import { personagens } from '../models/Jogadores.js';

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

// Vota nas opções com rolagem de dado
const depositaVotoComDado = (req, res) => {
  const voto = req.params.voto;
  const jogador = personagens[String(req.params.jogador)];
  const uid = req.body.uid;
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' });
  if (!voto) return res.status(400).json({message: "Não enviou o voto paisão"});
  
  if (!Array.isArray(jogador.votantes)) jogador.votantes = [];
  if (jogador.votantes.includes(uid)) return res.status(403).json({ erro: "Você já votou nessa rodada!"});

  jogador.votantes.push(uid);

    const roladas = [];
    let votos;
    for(let i = 0; i < jogador.opcoesComDado.length; i++) {
      const opcao = jogador.opcoesComDado[i]
        if(opcao.name == voto) {

            jogador.votacao[i]++
            votos = jogador.votacao[i];
            jogador.votosTotal++;
            if(!opcao.dado || opcao.dado.length < 1) break;
            for(let j in opcao.dado) {
              roladas.push({
                name: opcao.dado[j].name, 
                rolagem: opcao.dado[j].roll()
              });
          }
          break;
          }
      }
  
  return res.status(200).json({valoresDasRolagem: roladas, votos: votos});
}

// Mostra a votação atual
const votacao = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  if (jogador.votacaoAberta) {
    return res.json({
      jogador: req.params.jogador,
      opcoes: jogador.opcoes,
      opcoesComDado: jogador.opcoesComDado,
      votacaoAberta: true
    })
  }
    
  return res.json({
    jogador: req.params.jogador,
    mensagem: 'Nenhuma votação ativa.'
  });
}

// Vota nas opções sem dado
const depositaVoto = (req, res) => {
  const jogador = personagens[String(req.params.jogador)]
  if (!jogador) return res.status(404).json({ erro: 'Jogador não encontrado' })

  const voto = req.params.voto;
  const uid = req.body.uid;

  if (!Array.isArray(jogador.votantes)) jogador.votantes = [];
  if (jogador.votantes.includes(uid)) return res.status(403).json({ erro: "Você já votou nessa rodada!"});
  
  jogador.votantes.push(uid);
  
  for (let i in jogador.opcoes) {
    if (voto == jogador.opcoes[i]) {  
        jogador.votacao[i]++
      }
    }
    
  jogador.votosTotal++

  res.json({mensagem: "Voto computado com sucesso", 
    jogador: req.params.jogador, 
    votosTotal: jogador.votosTotal
  })
}

export const conexoes = {};


// Mostrar vida do jogador
const getVidaJogador = (req,res) => {
  const jogador = personagens[String(req.params.jogador)];
  return res.json({vidaAtual:jogador.vidaAtual})
}

const vidaStream = (req, res) => {
  const jogadorId = String(req.params.jogador); 
  
  console.log(`nova conexão SSE para jogador: ${jogadorId}`);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Inicializa array de conexões se não existir
  if (!conexoes[jogadorId]) {
    conexoes[jogadorId] = [];
  }

  conexoes[jogadorId].push(res);

  // Envia vida atual imediatamente
  const vidaAtual = personagens[jogadorId]?.vidaAtual || 0;
  console.log(`Enviando vida inicial: ${vidaAtual} para ${jogadorId}`);
  res.write(`data: ${JSON.stringify({ vidaAtual })}\n\n`);

  // Remove conexão quando fechar
  req.on('close', () => {
    console.log(`Conexão SSE fechada para: ${jogadorId}`);
    if (conexoes[jogadorId]) {
      conexoes[jogadorId] = conexoes[jogadorId].filter(connection => connection !== res);
      
      // Limpa array vazio
      if (conexoes[jogadorId].length === 0) {
        delete conexoes[jogadorId];
      }
    }
  });

  const keepAlive = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (err) {
      clearInterval(keepAlive);
    }
  }, 30000);

  req.on('close', () => {
    clearInterval(keepAlive);
  });
};


export default {
  // logIn,
  player,
  rollAll,
  votacao,
  depositaVoto,
  depositaVotoComDado,
  getVidaJogador,
  vidaStream,
  conexoes
};
