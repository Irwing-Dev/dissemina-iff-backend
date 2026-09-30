/**
 * Testes do fluxo: numeroInimigos → votos → porcentagem → quantidadeAtaques → rolagens
 *
 * Estratégia: testa a lógica pura extraída de votacaoEstado() sem subir o servidor.
 * O estado de cada teste é construído localmente para evitar dependência do estado
 * global de `personagens`.
 */

import { Dado } from '../models/Dado.js';
import { OpcaoComDado } from '../models/OpcaoComDado.js';

// ---------------------------------------------------------------------------
// Função extraída de mestre.js — replica exatamente a lógica de votacaoEstado
// Recebe o estado do jogador e retorna { votosTotal, numeroInimigos, result }
// ---------------------------------------------------------------------------
function calcularResultadoVotacao(jogador) {
  const votosTotal = jogador.votosTotal;
  const opcoesComDado = jogador.opcoesComDado;
  const opcoes = (opcoesComDado && opcoesComDado.length > 0)
    ? opcoesComDado
    : jogador.opcoes;

  const numeroInimigos = jogador.numeroInimigos ?? 0;

  const result = opcoes.map((op, index) => {
    const isDiceVote = opcoesComDado && op.dado;
    const votosDaOpcao = jogador.votacao[index] ?? 0;

    const porcentagem = votosTotal > 0
      ? Math.round((votosDaOpcao / votosTotal) * 100)
      : 0;

    const quantidadeAtaques = votosTotal > 0
      ? Math.round((votosDaOpcao / votosTotal) * numeroInimigos)
      : 0;

    if (isDiceVote) {
      const ataques = [];
      for (let a = 0; a < quantidadeAtaques; a++) {
        const rolagens = op.dado.map(d => {
          const resultado = d.roll();
          const valorBruto = Array.isArray(resultado)
            ? resultado.reduce((acc, n) => acc + n, 0)
            : resultado;
          const total = valorBruto + (d.bonus ?? 0);
          return { name: d.name, resultado, bonus: d.bonus ?? 0, total };
        });
        ataques.push({ rolagens });
      }
      return { name: op.name, votos: votosDaOpcao, porcentagem, quantidadeAtaques, ataques };
    } else {
      return { name: op, votos: votosDaOpcao, porcentagem, quantidadeAtaques };
    }
  });

  return { votosTotal, numeroInimigos, result };
}

// ---------------------------------------------------------------------------
// Helper: monta um estado de jogador para os testes
// ---------------------------------------------------------------------------
function criarEstadoJogador({ numeroInimigos, opcoesComDado, votacao, votosTotal }) {
  return { numeroInimigos, opcoesComDado, opcoes: undefined, votacao, votosTotal };
}

// ---------------------------------------------------------------------------
// CENÁRIO PRINCIPAL
// 10 inimigos, 10 votos totais
// Atacar com Katana: 4 votos   → 40% → 4 ataques
// Golpe Certeiro:    3 votos   → 30% → 3 ataques
// Mãos Flamejantes:  2 votos   → 20% → 2 ataques
// Fugir:             1 voto    → 10% → 1 ataque
// ---------------------------------------------------------------------------
describe('Cenário principal — 10 inimigos, 10 votos', () => {
  let jogador;
  let resultado;

  beforeEach(() => {
    jogador = criarEstadoJogador({
      numeroInimigos: 10,
      votosTotal: 10,
      votacao: [4, 3, 2, 1],
      opcoesComDado: [
        new OpcaoComDado('Atacar com Katana', [
          new Dado(20, 1, 'Teste', 5),
          new Dado(8,  1, 'Dano',  3),
        ]),
        new OpcaoComDado('Golpe Certeiro', [
          new Dado(20, 1, 'Teste', 5),
          new Dado(8,  1, 'Dano',  5),
        ]),
        new OpcaoComDado('Mãos Flamejantes', [
          new Dado(6, 3, 'Dano (acerto automático)', 0),
        ]),
        new OpcaoComDado('Fugir', [
          new Dado(20, 1, 'Dado Padrão', 0),
        ]),
      ],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('votosTotal retornado é 10', () => {
    expect(resultado.votosTotal).toBe(10);
  });

  test('numeroInimigos retornado é 10', () => {
    expect(resultado.numeroInimigos).toBe(10);
  });

  // --- Atacar com Katana ---
  test('Atacar com Katana → 40%', () => {
    expect(resultado.result[0].porcentagem).toBe(40);
  });

  test('Atacar com Katana → 4 ataques', () => {
    expect(resultado.result[0].quantidadeAtaques).toBe(4);
  });

  test('Atacar com Katana → array ataques tem 4 itens', () => {
    expect(resultado.result[0].ataques).toHaveLength(4);
  });

  // --- Golpe Certeiro ---
  test('Golpe Certeiro → 30%', () => {
    expect(resultado.result[1].porcentagem).toBe(30);
  });

  test('Golpe Certeiro → 3 ataques', () => {
    expect(resultado.result[1].quantidadeAtaques).toBe(3);
  });

  test('Golpe Certeiro → array ataques tem 3 itens', () => {
    expect(resultado.result[1].ataques).toHaveLength(3);
  });

  // --- Mãos Flamejantes ---
  test('Mãos Flamejantes → 20%', () => {
    expect(resultado.result[2].porcentagem).toBe(20);
  });

  test('Mãos Flamejantes → 2 ataques', () => {
    expect(resultado.result[2].quantidadeAtaques).toBe(2);
  });

  test('Mãos Flamejantes → array ataques tem 2 itens', () => {
    expect(resultado.result[2].ataques).toHaveLength(2);
  });

  // --- Fugir ---
  test('Fugir → 10%', () => {
    expect(resultado.result[3].porcentagem).toBe(10);
  });

  test('Fugir → 1 ataque', () => {
    expect(resultado.result[3].quantidadeAtaques).toBe(1);
  });

  test('Fugir → array ataques tem 1 item', () => {
    expect(resultado.result[3].ataques).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// DADO 3d4+3: cada ataque deve ter 3 resultados e total correto
// ---------------------------------------------------------------------------
describe('Dado 3d4+3 — Dado.quantidade representa dados por ataque, não ataques', () => {
  let jogador;
  let resultado;

  beforeEach(() => {
    jogador = criarEstadoJogador({
      numeroInimigos: 10,
      votosTotal: 10,
      votacao: [4, 6],
      opcoesComDado: [
        new OpcaoComDado('Mísseis Mágicos', [
          new Dado(4, 3, 'Dano', 3), // 3d4+3
        ]),
        new OpcaoComDado('Fugir', [
          new Dado(20, 1, 'Dado Padrão', 0),
        ]),
      ],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('4 votos → 4 ataques com 3d4+3', () => {
    expect(resultado.result[0].quantidadeAtaques).toBe(4);
  });

  test('Dado.quantidade=3 significa 3 dados por ataque (resultado é array de 3)', () => {
    const ataque = resultado.result[0].ataques[0];
    // roll() com quantidade=3 retorna array de 3 números
    expect(Array.isArray(ataque.rolagens[0].resultado)).toBe(true);
    expect(ataque.rolagens[0].resultado).toHaveLength(3);
  });

  test('Total de cada ataque = soma dos 3 dados + bonus 3', () => {
    resultado.result[0].ataques.forEach((ataque, i) => {
      const r = ataque.rolagens[0];
      const somaResultado = r.resultado.reduce((acc, n) => acc + n, 0);
      expect(r.total).toBe(somaResultado + 3);
    });
  });

  test('Cada dado d4 resulta entre 1 e 4', () => {
    resultado.result[0].ataques.forEach(ataque => {
      ataque.rolagens[0].resultado.forEach(valor => {
        expect(valor).toBeGreaterThanOrEqual(1);
        expect(valor).toBeLessThanOrEqual(4);
      });
    });
  });

  test('Total mínimo por ataque é 6 (3×1 + 3) e máximo é 15 (3×4 + 3)', () => {
    resultado.result[0].ataques.forEach(ataque => {
      const total = ataque.rolagens[0].total;
      expect(total).toBeGreaterThanOrEqual(6);
      expect(total).toBeLessThanOrEqual(15);
    });
  });

  test('Cada ataque é independente (rolagens diferentes entre si)', () => {
    // Com 4 ataques e valores entre 6-15, é estatisticamente improvável que todos sejam iguais
    // Mas não garantido — esse teste apenas verifica que são 4 objetos separados
    const totais = resultado.result[0].ataques.map(a => a.rolagens[0].total);
    expect(totais).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// CASO: 0 votos em uma opção → 0% → 0 ataques → nenhuma rolagem
// ---------------------------------------------------------------------------
describe('Opção com 0 votos', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstadoJogador({
      numeroInimigos: 10,
      votosTotal: 10,
      votacao: [10, 0],
      opcoesComDado: [
        new OpcaoComDado('Atacar', [new Dado(20, 1, 'Teste', 0)]),
        new OpcaoComDado('Fugir',  [new Dado(20, 1, 'Teste', 0)]),
      ],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('Fugir com 0 votos → 0%', () => {
    expect(resultado.result[1].porcentagem).toBe(0);
  });

  test('Fugir com 0 votos → 0 ataques', () => {
    expect(resultado.result[1].quantidadeAtaques).toBe(0);
  });

  test('Fugir com 0 votos → array ataques vazio', () => {
    expect(resultado.result[1].ataques).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// CASO: 0 votos totais → sem divisão por zero
// ---------------------------------------------------------------------------
describe('0 votos totais — sem divisão por zero', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstadoJogador({
      numeroInimigos: 10,
      votosTotal: 0,
      votacao: [0, 0],
      opcoesComDado: [
        new OpcaoComDado('Atacar', [new Dado(20, 1, 'Teste', 0)]),
        new OpcaoComDado('Fugir',  [new Dado(20, 1, 'Teste', 0)]),
      ],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('porcentagem é 0 para todas as opções', () => {
    resultado.result.forEach(op => {
      expect(op.porcentagem).toBe(0);
    });
  });

  test('quantidadeAtaques é 0 para todas as opções', () => {
    resultado.result.forEach(op => {
      expect(op.quantidadeAtaques).toBe(0);
    });
  });

  test('nenhuma rolagem é gerada', () => {
    resultado.result.forEach(op => {
      expect(op.ataques).toHaveLength(0);
    });
  });

  test('não lança exceção', () => {
    const jogador = criarEstadoJogador({
      numeroInimigos: 10,
      votosTotal: 0,
      votacao: [0],
      opcoesComDado: [new OpcaoComDado('X', [new Dado(6, 1, 'D', 0)])],
    });
    expect(() => calcularResultadoVotacao(jogador)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// CASO: numeroInimigos diferente de 10 (ex: 20)
// ---------------------------------------------------------------------------
describe('numeroInimigos = 20 — quantidade de ataques depende de numeroInimigos', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstadoJogador({
      numeroInimigos: 20,
      votosTotal: 10,
      votacao: [4, 6],
      opcoesComDado: [
        new OpcaoComDado('Atacar', [new Dado(20, 1, 'Teste', 0)]),
        new OpcaoComDado('Fugir',  [new Dado(20, 1, 'Teste', 0)]),
      ],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('4 votos de 10 com 20 inimigos → 8 ataques', () => {
    // Math.round(4/10 * 20) = Math.round(8) = 8
    expect(resultado.result[0].quantidadeAtaques).toBe(8);
  });

  test('6 votos de 10 com 20 inimigos → 12 ataques', () => {
    // Math.round(6/10 * 20) = Math.round(12) = 12
    expect(resultado.result[1].quantidadeAtaques).toBe(12);
  });

  test('array ataques tem 8 itens para a opção com 4 votos', () => {
    expect(resultado.result[0].ataques).toHaveLength(8);
  });

  test('porcentagem não é afetada pelo número de inimigos', () => {
    // porcentagem depende só de votos, não de inimigos
    expect(resultado.result[0].porcentagem).toBe(40);
    expect(resultado.result[1].porcentagem).toBe(60);
  });
});

// ---------------------------------------------------------------------------
// MODELO Dado — testes unitários isolados
// ---------------------------------------------------------------------------
describe('Dado — Dado.quantidade representa dados por rolagem, não ataques', () => {
  test('Dado(4, 3) → roll() retorna array de 3 valores', () => {
    const d = new Dado(4, 3, 'Dano', 0);
    const resultado = d.roll();
    expect(Array.isArray(resultado)).toBe(true);
    expect(resultado).toHaveLength(3);
  });

  test('Dado(4, 1) → roll() retorna number, não array', () => {
    const d = new Dado(4, 1, 'Dano', 0);
    const resultado = d.roll();
    expect(typeof resultado).toBe('number');
  });

  test('Dado(6, 3) → cada valor entre 1 e 6', () => {
    const d = new Dado(6, 3, 'Dano', 0);
    const resultado = d.roll();
    resultado.forEach(v => {
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
    });
  });

  test('Dado.quantidade não determina ataques — é responsabilidade do loop externo', () => {
    // 1 dado d20, chamado 3 vezes = 3 ataques, cada um com 1 rolagem
    const d = new Dado(20, 1, 'Teste', 5);
    const ataque1 = d.roll();
    const ataque2 = d.roll();
    const ataque3 = d.roll();
    // Cada chamada de roll() é um ataque independente
    expect(typeof ataque1).toBe('number');
    expect(typeof ataque2).toBe('number');
    expect(typeof ataque3).toBe('number');
    // Não espera que sejam iguais — são rolagens independentes
    // (exceto por coincidência estatística)
  });
});


// ===========================================================================
// NOVOS TESTES — Atividade: "Quem será atacado?" com 5 jogadores
// ===========================================================================

// ---------------------------------------------------------------------------
// Helper para montar estado com 5 jogadores-alvo
// ---------------------------------------------------------------------------
function criarEstado5Jogadores({ numeroInimigos, votacao, votosTotal }) {
  const nomes = ['Zenchi', 'Atnos', 'Sam', 'Jogador 4', 'Jogador 5'];
  return {
    numeroInimigos,
    votosTotal,
    votacao,
    opcoesComDado: nomes.map(nome =>
      new OpcaoComDado(nome, [
        new Dado(20, 1, 'Ataque', 0),
        new Dado(6,  1, 'Dano',   0),
      ])
    ),
    opcoes: undefined,
  };
}

// ---------------------------------------------------------------------------
// EXEMPLO DA ATIVIDADE
// 100 inimigos, votos proporcionais a 30/10/25/20/15%
// Zenchi   → 30 votos → 30% → 30 inimigos
// Atnos    → 10 votos → 10% → 10 inimigos
// Sam      → 25 votos → 25% → 25 inimigos
// Jogador 4 → 20 votos → 20% → 20 inimigos
// Jogador 5 → 15 votos → 15% → 15 inimigos
// ---------------------------------------------------------------------------
describe('5 jogadores — exemplo exato da atividade (100 inimigos, 100 votos)', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstado5Jogadores({
      numeroInimigos: 100,
      votosTotal: 100,
      votacao: [30, 10, 25, 20, 15],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  // --- votosTotal e numeroInimigos ---
  test('votosTotal retornado é 100', () => {
    expect(resultado.votosTotal).toBe(100);
  });

  test('numeroInimigos retornado é 100', () => {
    expect(resultado.numeroInimigos).toBe(100);
  });

  // --- Identificação dos jogadores ---
  test('result[0].name é Zenchi', () => {
    expect(resultado.result[0].name).toBe('Zenchi');
  });

  test('result[1].name é Atnos', () => {
    expect(resultado.result[1].name).toBe('Atnos');
  });

  test('result[2].name é Sam', () => {
    expect(resultado.result[2].name).toBe('Sam');
  });

  test('result[3].name é Jogador 4', () => {
    expect(resultado.result[3].name).toBe('Jogador 4');
  });

  test('result[4].name é Jogador 5', () => {
    expect(resultado.result[4].name).toBe('Jogador 5');
  });

  // --- Porcentagens ---
  test('Zenchi → 30%', () => {
    expect(resultado.result[0].porcentagem).toBe(30);
  });

  test('Atnos → 10%', () => {
    expect(resultado.result[1].porcentagem).toBe(10);
  });

  test('Sam → 25%', () => {
    expect(resultado.result[2].porcentagem).toBe(25);
  });

  test('Jogador 4 → 20%', () => {
    expect(resultado.result[3].porcentagem).toBe(20);
  });

  test('Jogador 5 → 15%', () => {
    expect(resultado.result[4].porcentagem).toBe(15);
  });

  // --- Quantidade de inimigos direcionados ---
  test('Zenchi → 30 inimigos atacam', () => {
    expect(resultado.result[0].quantidadeAtaques).toBe(30);
  });

  test('Atnos → 10 inimigos atacam', () => {
    expect(resultado.result[1].quantidadeAtaques).toBe(10);
  });

  test('Sam → 25 inimigos atacam', () => {
    expect(resultado.result[2].quantidadeAtaques).toBe(25);
  });

  test('Jogador 4 → 20 inimigos atacam', () => {
    expect(resultado.result[3].quantidadeAtaques).toBe(20);
  });

  test('Jogador 5 → 15 inimigos atacam', () => {
    expect(resultado.result[4].quantidadeAtaques).toBe(15);
  });

  // --- Rolagens geradas ---
  test('Zenchi tem 30 rolagens de inimigo', () => {
    expect(resultado.result[0].ataques).toHaveLength(30);
  });

  test('Atnos tem 10 rolagens de inimigo', () => {
    expect(resultado.result[1].ataques).toHaveLength(10);
  });

  // --- Soma coerente com o total de inimigos ---
  test('soma dos quantidadeAtaques é igual ao número total de inimigos (100)', () => {
    const soma = resultado.result.reduce((acc, r) => acc + r.quantidadeAtaques, 0);
    // Math.round pode causar desvio de ±1 em casos com decimais; aqui todos são exatos
    expect(soma).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// CASO: um jogador com 0 votos — não recebe nenhum inimigo
// ---------------------------------------------------------------------------
describe('5 jogadores — um jogador com 0 votos', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstado5Jogadores({
      numeroInimigos: 100,
      votosTotal: 100,
      // Jogador 5 com 0 votos
      votacao: [40, 20, 25, 15, 0],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('Jogador 5 com 0 votos → 0%', () => {
    expect(resultado.result[4].porcentagem).toBe(0);
  });

  test('Jogador 5 com 0 votos → 0 inimigos', () => {
    expect(resultado.result[4].quantidadeAtaques).toBe(0);
  });

  test('Jogador 5 com 0 votos → array de ataques vazio', () => {
    expect(resultado.result[4].ataques).toHaveLength(0);
  });

  test('jogadores com votos ainda recebem inimigos normalmente', () => {
    // Math.round(40/100 * 100) = 40
    expect(resultado.result[0].quantidadeAtaques).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// CASO: 0 votos totais com 5 jogadores — sem divisão por zero
// ---------------------------------------------------------------------------
describe('5 jogadores — 0 votos totais', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstado5Jogadores({
      numeroInimigos: 100,
      votosTotal: 0,
      votacao: [0, 0, 0, 0, 0],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('não lança exceção', () => {
    expect(() => calcularResultadoVotacao({
      numeroInimigos: 100,
      votosTotal: 0,
      votacao: [0, 0, 0, 0, 0],
      opcoesComDado: ['Zenchi', 'Atnos', 'Sam', 'Jogador 4', 'Jogador 5'].map(
        nome => new OpcaoComDado(nome, [new Dado(20, 1, 'Ataque', 0)])
      ),
      opcoes: undefined,
    })).not.toThrow();
  });

  test('todos os jogadores têm 0% de votos', () => {
    resultado.result.forEach(r => {
      expect(r.porcentagem).toBe(0);
    });
  });

  test('todos os jogadores têm 0 inimigos direcionados', () => {
    resultado.result.forEach(r => {
      expect(r.quantidadeAtaques).toBe(0);
    });
  });

  test('nenhuma rolagem é gerada', () => {
    resultado.result.forEach(r => {
      expect(r.ataques).toHaveLength(0);
    });
  });
});

// ---------------------------------------------------------------------------
// CASO: quantidade diferente de inimigos (ex: 50)
// Votos: 30/10/25/20/15 (total 100)
// Zenchi   → 30% de 50 = 15
// Atnos    → 10% de 50 = 5
// Sam      → 25% de 50 = Math.round(12.5) = 13
// Jogador 4 → 20% de 50 = 10
// Jogador 5 → 15% de 50 = Math.round(7.5) = 8
// ---------------------------------------------------------------------------
describe('5 jogadores — 50 inimigos', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstado5Jogadores({
      numeroInimigos: 50,
      votosTotal: 100,
      votacao: [30, 10, 25, 20, 15],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('numeroInimigos retornado é 50', () => {
    expect(resultado.numeroInimigos).toBe(50);
  });

  test('Zenchi → 30% de 50 = 15 inimigos', () => {
    expect(resultado.result[0].quantidadeAtaques).toBe(15);
  });

  test('Atnos → 10% de 50 = 5 inimigos', () => {
    expect(resultado.result[1].quantidadeAtaques).toBe(5);
  });

  test('porcentagem não é afetada pelo número de inimigos', () => {
    expect(resultado.result[0].porcentagem).toBe(30);
    expect(resultado.result[1].porcentagem).toBe(10);
    expect(resultado.result[2].porcentagem).toBe(25);
    expect(resultado.result[3].porcentagem).toBe(20);
    expect(resultado.result[4].porcentagem).toBe(15);
  });

  test('soma dos inimigos distribuídos é coerente com Math.round (desvio máx ±2)', () => {
    // Math.round pode gerar desvio por arredondamento; aceitamos ±(nJogadores/2)
    const soma = resultado.result.reduce((acc, r) => acc + r.quantidadeAtaques, 0);
    expect(soma).toBeGreaterThanOrEqual(48);
    expect(soma).toBeLessThanOrEqual(52);
  });
});

// ---------------------------------------------------------------------------
// CASO: todos os votos concentrados em um único jogador
// ---------------------------------------------------------------------------
describe('5 jogadores — todos os votos em um jogador', () => {
  let resultado;

  beforeEach(() => {
    const jogador = criarEstado5Jogadores({
      numeroInimigos: 100,
      votosTotal: 50,
      votacao: [50, 0, 0, 0, 0],
    });
    resultado = calcularResultadoVotacao(jogador);
  });

  test('Zenchi com 100% dos votos → 100 inimigos', () => {
    expect(resultado.result[0].quantidadeAtaques).toBe(100);
  });

  test('Zenchi → 100%', () => {
    expect(resultado.result[0].porcentagem).toBe(100);
  });

  test('demais jogadores → 0 inimigos', () => {
    [1, 2, 3, 4].forEach(i => {
      expect(resultado.result[i].quantidadeAtaques).toBe(0);
    });
  });
});
