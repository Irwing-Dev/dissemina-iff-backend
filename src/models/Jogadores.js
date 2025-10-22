class Jogador {
  constructor(
      opcoesPadrao = ["Ataque meelee", "Ataque ranged", "Usar item", "Fugir"]
    ) {
    this.dado_acao = Array(20).fill(0),
    this.numRolagens= 0

    this.rolagemAberta = false;
    this.votacaoAberta = false;

    this.mensagemVotacao = ""
    this.votacao = [];
    this.opcoes = [];
    this.opcoesPadrao = opcoesPadrao;
    this.votosTotal = 0;
  }

  resetaDado(dado) {
    if (!Array.isArray(dado)) return;
    for (let i = 0; i < dado.length; i++) {
      dado[i] = 0;
    }
  }

  moda(dado) {
    if (!Array.isArray(dado) || dado.length === 0) return 0;
    let resultado = 0;
    let check = 0;

    for (let i = 0; i < dado.length; i++) {
      if (dado[i] >= check) {
        check = dado[i];
        resultado = i;
      }
    }
    resultado++;
    return resultado
  }
}

function novoJogador(opcoesPadrao = []) {
  return new Jogador(opcoesPadrao);
}

export const personagens = {
  jogador1: novoJogador(),
  jogador2: novoJogador(),
  jogador3: novoJogador()
};