import { Dado } from "./Dado.js";
class Jogador {
  constructor(
      opcoesPadrao = ["Ataque meelee", "Ataque ranged", "Usar item", "Fugir"]
    ) {
    this.dado_acao = new Dado(20, 1, "Dado de Ação"),
    this.numRolagens = 0

    this.dados = [];

    this.rolagemAberta = false;
    this.votacaoAberta = false;
    this.jaVotou = false

   this.vidaAtual = 0

    this.mensagemVotacao = ""
    this.votacao = [];
    this.opcoes = [];
    this.opcoesComDado = []
    this.opcoesPadrao = opcoesPadrao;
    this.votosTotal = 0;
  }
}

function novoJogador(opcoesPadrao = []) {
  return new Jogador(opcoesPadrao);
}

// Apenas para efeito de teste, pode apagar
const acoesGerais = ["Atacar meelee", "Atacar ranged", "Usar Item", "Fugir"]

export const personagens = {
  jogador1: novoJogador(acoesGerais),
  jogador2: novoJogador(acoesGerais),
  jogador3: novoJogador(acoesGerais)
};