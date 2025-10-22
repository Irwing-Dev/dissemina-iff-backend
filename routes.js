import express from 'express'   //pegando o express q eu baixei
import jogador from './src/controllers/jogador.js' //importando o arquivo global.js
import mestre from './src/controllers/mestre.js' //importando o arquivo mestre.js
// import { dados } from './src/controllers/dados.js' //importando o arquivo dados.js

const route = express.Router()

// Rotas da raiz do site
// route.get('/', jogador.logIn)

//rotas do mestre para dados
route.post('/mestre/:jogador/exibeRolagem', mestre.exibeRolagem)
route.get('/mestre/:jogador/iniciaRolagens', mestre.iniciaRolagens)

//rotas do mestre para escolhas
route.post('/mestre/:jogador/criaVotacao', mestre.criaVotacao)
route.get('/mestre/:jogador/exibeVotacao', mestre.votacaoEstado)

//rotas do jogador para rolar dados
route.post('/jogador/:jogador', jogador.jogador)
route.get('/jogador/:jogador', jogador.jogador)
route.get('/jogador/:jogador/rolaTodos', jogador.rollAll)


//rotas do jogador para escolhas
route.post('/jogador/:jogador/votacao', jogador.votacao)
route.post('/jogador/:jogador/votacao/:voto', jogador.depositaVoto)


export default route