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
    jogador.votantes = [];
    jogador.votosTotal = 0;
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
    const votosTotal = jogador.votosTotal
    jogador.votosTotal = 0
    let opcoesComDado = jogador.opcoesComDado;
    // Verifica se opcoesComDado existe E tem elementos
    let opcoes = (opcoesComDado && opcoesComDado.length > 0) ? opcoesComDado : jogador.opcoes
    
    console.log('DEBUG - opcoes escolhidas:', opcoes)

    const numeroInimigos = jogador.numeroInimigos ?? 0;
    
    const result = opcoes.map((op, index) => {
        const isDiceVote = opcoesComDado && op.dado; 
        const votosDaOpcao = jogador.votacao[index] ?? 0;

        // Porcentagem: evita divisão por zero
        const porcentagem = votosTotal > 0
            ? Math.round((votosDaOpcao / votosTotal) * 100)
            : 0;

        // Quantidade de ataques: proporcional ao número de inimigos
        // Usa Math.round — em casos exatos (40% de 10) resulta em 4;
        // em decimais (33.3% de 10) resulta em 3 (arredondamento padrão)
        const quantidadeAtaques = votosTotal > 0
            ? Math.round((votosDaOpcao / votosTotal) * numeroInimigos)
            : 0;

        if (isDiceVote) {
            // Gera quantidadeAtaques rolagens individuais
            const ataques = [];
            for (let a = 0; a < quantidadeAtaques; a++) {
                const rolagens = op.dado.map(d => {
                    // roll() retorna number (1 dado) ou number[] (múltiplos dados)
                    const resultado = d.roll();
                    // Soma se for array (ex: 3d4 = [2,3,4] → 9)
                    const valorBruto = Array.isArray(resultado)
                        ? resultado.reduce((acc, n) => acc + n, 0)
                        : resultado;
                    const total = valorBruto + (d.bonus ?? 0);
                    return {
                        name: d.name,
                        resultado: resultado,
                        bonus: d.bonus ?? 0,
                        total: total
                    };
                });
                ataques.push({ rolagens });
            }

            return {
                name: op.name,
                votos: votosDaOpcao,
                porcentagem,
                quantidadeAtaques,
                ataques
            };
        } else {
            return {
                name: op,
                votos: votosDaOpcao,
                porcentagem,
                quantidadeAtaques
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
    res.json({ votosTotal, numeroInimigos, result });
}


const postVidaJogador = (req, res) => {
  const jogadorId = String(req.params.jogador);
  const numeroInimigos = req.body.numeroInimigos;

  console.log('Recebendo numeroInimigos:', numeroInimigos, 'para', jogadorId);

  // Atualiza no personagens
  if (personagens[jogadorId]) {
    personagens[jogadorId].numeroInimigos = numeroInimigos;
  } else {
    return res.status(404).json({ error: 'Jogador não encontrado' });
  }

  // Envia para todos os clientes SSE conectados
  if (conexoes[jogadorId]) {
    console.log(`Enviando sse para ${conexoes[jogadorId].length} clientes`);
    conexoes[jogadorId].forEach(res => {
      try {
        res.write(`data: ${JSON.stringify({ numeroInimigos })}\n\n`);
      } catch (err) {
        console.error('Erro ao enviar sse:', err);
      }
    });
  }

  return res.json({ numeroInimigos });
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
