class Jogador {
  constructor(
    d6 = Array(6).fill(0),
    d10_1 = Array(10).fill(0),
    d10_2 = Array(10).fill(0),
    rolagensD6 = 0,
    rolagensD10_1 = 0,
    rolagensD10_2 = 0,
    rolagemAberta = false,
    votacaoAberta = false,
    passoAtual = -1,
    votacaoAtual = 0,
    mensagemVotacao = '',
    votacao = [],
    opcoes = [],
    votosTotal = 0
  ) {
    this.d6 = d6;
    this.d10_1 = d10_1;
    this.d10_2 = d10_2;
    this.rolagensD6 = rolagensD6;
    this.rolagensD10_1 = rolagensD10_1;
    this.rolagensD10_2 = rolagensD10_2;
    this.rolagemAberta = rolagemAberta;
    this.votacaoAberta = votacaoAberta;
    this.passoAtual = passoAtual;
    this.votacaoAtual = votacaoAtual;
    this.mensagemVotacao = mensagemVotacao;
    this.votacao = votacao;
    this.opcoes = opcoes;
    this.votosTotal = votosTotal;
  }

  // --- Funções principais ---

  maioria() {
    // Exemplo de votação — valores devem vir da lógica do jogo
    const votosItem = this.votacao[0] || 0;
    const votosFugir = this.votacao[1] || 0;
    const votosMeele = this.votacao[2] || 0;
    const votosRanged = this.votacao[3] || 0;

    const maior = Math.max(votosItem, votosFugir, votosMeele, votosRanged);

    if (maior === votosRanged) return 'Ataque à distância';
    if (maior === votosMeele) return 'Ataque corpo-a-corpo';
    if (maior === votosItem) return 'Usar Item';
    return 'Fugir';
  }

  resetaDado(dado, lados) {
    if (!Array.isArray(dado)) return;
    for (let i = 0; i < lados; i++) {
      dado[i] = 0;
    }
  }

  moda(dado, lados) {
    if (!Array.isArray(dado) || dado.length === 0) return 1;
    let resultado = 0;
    let check = 0;

    for (let i = 0; i < lados; i++) {
      if (lados === 6 && dado[i] >= check) {
        check = dado[i];
        resultado = i;
      }
      if (lados === 10 && dado[i] > check) {
        check = dado[i];
        resultado = i;
      }
    }
    resultado++;
    return resultado
  }

  resolucaoIronsworn(total, desafio1, desafio2) {
    if (total > desafio1 && total > desafio2 && desafio1 === desafio2)
      return 'Acerto Crítico!';
    if (total > desafio1 && total > desafio2)
      return 'Acerto Forte!';
    if (total <= desafio1 && total <= desafio2 && desafio1 === desafio2)
      return 'Erro Crítico!';
    if (total <= desafio1 && total <= desafio2)
      return 'Erro!';
    return 'Acerto Fraco.';
  }
}

function novoJogador() {
  return new Jogador();
}

export const personagens = {
  jogador1: novoJogador(),
  jogador2: novoJogador(),
  jogador3: novoJogador()
};
