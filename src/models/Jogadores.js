import { Dado } from "./Dado.js";
class Jogador {
  constructor(
      opcoesPadrao = ["Ataque meelee", "Ataque ranged", "Usar item", "Fugir"],
      numeroInimigosInicial = 10
    ) {
    this.dado_acao = new Dado(20, 1, "Dado de Ação"),
    this.numRolagens = 0

    this.dados = [];

    this.rolagemAberta = false;
    this.votacaoAberta = false;
    
    this.numeroInimigos = numeroInimigosInicial

    this.mensagemVotacao = ""
    this.votacao = [];
    this.opcoes = [];
    this.opcoesComDado = []
    this.opcoesPadrao = opcoesPadrao;
    this.votosTotal = 0;
  }
}

function novoJogador(opcoesPadrao = [], numeroInimigosInicial = 10) {
  return new Jogador(opcoesPadrao, numeroInimigosInicial);
}

export const personagens = {
  jogador1: novoJogador(["Atacar com Katana", "Golpe Certeiro", "Invocar Ilusão", "Mãos Flamejantes", "Misseis Mágicos", "Recuperar Fôlego", "Ajudar", "Usar Item", "Fugir", ], 10),
  jogador2: novoJogador(["Atacar com Espada Curta", "Ataque Furtivo", "Fingir", "Esconder", "Usar Item", "Fugir"], 10),
  jogador3: novoJogador(["Atacar com Espada", "Raio de Fogo", "Defender", "Usar Item", "Fugir"], 10)
};
