class Jogador {
    constructor(d6, d10_1, d10_2, rolagensD6, rolagensD10_1, rolagensD10_2, rolagemAberta, votacaoAberta, passoAtual, votacaoAtual, mensagemVotacao, votacao, opcoes, votosTotal) {
        this.d6 = d6
        this.d10_1 = d10_1
        this.d10_2 = d10_2
        this.rolagensD6 = rolagensD6
        this.rolagensD10_1 = rolagensD10_1
        this.rolagensD10_2 = rolagensD10_2
        this.rolagemAberta = rolagemAberta
        this.votacaoAberta = votacaoAberta
        this.passoAtual = passoAtual
        this.votacaoAtual = votacaoAtual
        this.mensagemVotacao = mensagemVotacao
        this.votacao = votacao
        this.opcoes = opcoes
        this.votosTotal = votosTotal
    }

    maioria() {
        const maior = Math.max(votosItem, votosFugir, votosMeele, votosRanged)
        if (maior === votosRanged) { 
            return `Ataque à distância`
        } else if (maior === votosMeele) { 
            return `Ataque corpo-a-corpo`
        } else if (maior === votosItem) { 
            return `Usar Item`
        } else { 
            return `Fugir`
        }
    }

    resetaDado(dado, lados) {
        for (let i=0; i<lados; i++) {
            dado[i] = 0
        }
    }
    
    moda(dado, lados) {
        let resultado = 0, check = 0
        for (let i=0; i<lados; i++) {
            if (lados==6 && dado[i] >= check) {
                check = dado[i]
                resultado = i
            }
            if (lados==10 && dado[i] > check) {
                check = dado[i]
                resultado = i
            }
        }
        resultado++
        return resultado
    }
    
    resolucaoIronsworn(total, desafio1, desafio2) {
        let resolucao
        if (total > desafio1 && total > desafio2 && desafio1 == desafio2)
            resolucao = 'Acerto Crítico!' 
        else if (total > desafio1 && total > desafio2)
            resolucao = 'Acerto Forte!'
        else if (total <= desafio1 && total <= desafio2 && desafio1 == desafio2)
            resolucao = 'Erro Crítico!'
        else if (total <= desafio1 && total <= desafio2)
            resolucao = 'Erro!'
        else
            resolucao = 'Acerto Fraco.'
        return resolucao
    }
    
}

// Vou fazer do meu jeito essa budega, minha preguiça me impede de ver isso e não deixar mais fácil
function novoJogador() {
    return new Jogador([], [], [], 0, 0, 0, false, false, -1, 0, '', [], [], 0)
}

let jogador1 = novoJogador()

let jogador2 = novoJogador()

let jogador3 = novoJogador()

export const personagens = { 
    jogador1, 
    jogador2, 
    jogador3 
}