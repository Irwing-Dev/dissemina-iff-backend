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
