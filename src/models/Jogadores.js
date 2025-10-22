import { Dado } from "./Dado.js";
class Jogador {
  constructor(
      opcoesPadrao = ["Ataque meelee", "Ataque ranged", "Usar item", "Fugir"]
    ) {
    this.dado_acao = new Dado(20, 1, "Dado de Ação"),
    this.numRolagens= 0

    this.dados = [];

    this.rolagemAberta = false;
    this.votacaoAberta = false;

    this.mensagemVotacao = ""
    this.votacao = [];
    this.opcoes = [];
    this.opcoesPadrao = opcoesPadrao;
    this.votosTotal = 0;
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