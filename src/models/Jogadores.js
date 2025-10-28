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

export const personagens = {
  jogador1: novoJogador(["Atacar com Espada", "Atacar de Longe", "Invocar Ilusão", "Ajudar", "Usar Item", "Fugir",]),
  jogador2: novoJogador(["Atacar Corpo-a-Corpo", "Atacar de Longe", "Fingir", "Usar Item", "Fugir"]),
  jogador3: novoJogador(["Atacar com Espada", "Atacar de Longe", "Defender", "Usar Item", "Fugir"])
};