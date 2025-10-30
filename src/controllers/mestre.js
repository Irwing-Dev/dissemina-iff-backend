import { personagens } from '../models/Jogadores.js';
import { Dado } from "../models/Dado.js"
import { OpcaoComDado } from '../models/OpcaoComDado.js';
import { conexoes } from './jogador.js';

//rotas do mestre para dados
const iniciaRolagens = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    if(req.body.dados && Array.isArray(req.body.dados)) {
        jogador.dados = req.body.dados.map((dado, index) => {
            const lados = dado.lados;
            const quantidade = dado.quantidade;
            const bonus = dado.bonus || 0;
            const name = dado.name;

            if (typeof lados !== 'number' || typeof quantidade !== 'number' || lados <= 0 || quantidade <= 0) {
                 throw new Error(`Configuração de dado inválida: lados=${lados}, quantidade=${quantidade}`);
            }

            return new Dado(lados, quantidade, name, bonus);
        });
    } else {
        jogador.dados = [];
    }
    
    jogador.dado_acao.bonus = req.body.bonus_acao;
    jogador.rolagemAberta = true;

    return res.json({ jogador: key, bonus_acao: jogador.dado_acao.bonus, acoes: jogador.dado_acao });
}

const exibeRolagem = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.rolagemAberta = false;

    const modas = []

    if(jogador.dados) {
        jogador.dados.forEach(dado => {
            let valor = dado.moda();
            let bonus_dado = dado.bonus | 0;
            const bonus_geral = jogador.dado_acao.bonus

            // Soma os valores em uma variável se houver mais de um dado rolado ou mantém o valor se só houver um
            let valorAcumulado = Array.isArray(valor) ? valor.reduce((soma, num) => soma + num, 0) : valor;

            let total = valorAcumulado + bonus_dado + bonus_geral;

            modas.push({
                name: dado.name, 
                valor: valor, 
                bonus: dado.bonus | 0,
                bonus_acao: bonus_geral | 0,
                total: `${valorAcumulado} + ${bonus_dado} + ${bonus_geral} = ${total}`
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

const votacaoMaisDado = (req, res) => {
    const key = String(req.params.jogador);
    const jogador = personagens[key];
    if (!jogador) return res.status(404).json({ error: 'Jogador não encontrado' });

    jogador.opcoesComDado = req.body.opcoes.map(op => new OpcaoComDado(
        op.name,
        op.dados.map(dado => new Dado(dado.lados, dado.quantidade, dado.name, dado.bonus | 0))
    ));

    for(let i = 0; i < jogador.opcoesComDado.length; i++) {
        jogador.votacao[i] = 0
    }

    jogador.opcoes = undefined; 
    jogador.votacao = Array(jogador.opcoesComDado.length).fill(0);
    jogador.votosTotal = 0
    jogador.votantes = [];
    jogador.votacaoAberta = true;
    return res.status(200).json({jogador: key});
}

const criaVotacao = (req, res) => {
    const jogador = personagens[String(req.params.jogador)];
    jogador.votacaoAberta = true;
    jogador.opcoes = req.body.opcoes
    

    for(let i=0; i<jogador.opcoes.length; i++) {
        jogador.votacao[i] = 0
    }

    jogador.votosTotal = 0;
    jogador.votantes = [];
    res.json({jogador: req.params.jogador})
}

const getOpcoesSalvas = (req, res) => {
    const jogador = personagens[String(req.params.jogador)]
    if(!jogador) return res.status(400).json({"message": "jogador invalido"})
    return res.status(200).json({opcoesSalvas: jogador.opcoesPadrao})
}

const votacaoEstado = (req, res) => {
    const jogador = personagens[String(req.params.jogador)]
    
    let opcoesComDado = jogador.opcoesComDado;
    // Verifica se opcoesComDado existe E tem elementos
    let opcoes = (opcoesComDado && opcoesComDado.length > 0) ? opcoesComDado : jogador.opcoes
    
    console.log('DEBUG - opcoes escolhidas:', opcoes)
    
    const result = opcoes.map((op, index) => {
        const isDiceVote = opcoesComDado && op.dado; 
        
        let rolagensResultado = null;
        if (isDiceVote) {
            rolagensResultado = op.dado.map(d => ({
                name: d.name,
                moda: d.moda(),
                bonus: d.bonus,
                moda_geral: ((Array.isArray(d.moda())) ? d.moda().reduce((acc, num) => acc + num, 0) : d.moda()),
                total: (((Array.isArray(d.moda())) ? d.moda().reduce((acc, num) => acc + num, 0) : d.moda()) + d.bonus)
            })) 

            return {
                name: op.name,
                votos: jogador.votacao[index],
                rolagens: rolagensResultado
            };
        } else {
            return {
                name: op,
                votos: jogador.votacao[index]
            }
        }
    })

    if (opcoesComDado && opcoesComDado.length > 0) {
        opcoes.forEach(op => {
            if (op.dado && Array.isArray(op.dado)) {
                op.dado.forEach(dado => {
                    dado.resetaRolagens();
                });
            }
        });
    }
    
    jogador.opcoesComDado = undefined;
    jogador.opcoes = undefined;
    jogador.votacaoAberta = false;
    jogador.opcoesPadrao.push(...opcoes);
    res.json({ votosTotal: jogador.votosTotal, result });
}


const postVidaJogador = (req, res) => {
  const jogadorId = String(req.params.jogador);
  const vidaNova = req.body.vidaNova;

  console.log('Recebendo vida:', vidaNova, 'para', jogadorId);

  // Atualiza no personagens
  if (personagens[jogadorId]) {
    personagens[jogadorId].vidaAtual = vidaNova;
  } else {
    return res.status(404).json({ error: 'Jogador não encontrado' });
  }

  // Envia para todos os clientes SSE conectados
  if (conexoes[jogadorId]) {
    console.log(`Enviando sse para ${conexoes[jogadorId].length} clientes`);
    conexoes[jogadorId].forEach(res => {
      try {
        res.write(`data: ${JSON.stringify({ vidaAtual: vidaNova })}\n\n`);
      } catch (err) {
        console.error('Erro ao enviar sse:', err);
      }
    });
  }

  return res.json({ vidaAtual: vidaNova });
};

const votosStream = (req, res) => {
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

  // Envia votosTotal atual imediatamente
  const votosTotal = personagens[jogadorId]?.votosTotal || 0;
  console.log(`Enviando votosTotal: ${votosTotal} para ${jogadorId}`);
  res.write(`data: ${JSON.stringify({ votosTotal })}\n\n`);

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
    iniciaRolagens,
    exibeRolagem,
    criaVotacao,
    votacaoEstado,
    votacaoMaisDado,
    postVidaJogador,
    getOpcoesSalvas,
    votosStream
}
