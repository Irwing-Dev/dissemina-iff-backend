export class Dado {
    constructor(lados, quantidade, name = quantidade+"D"+lados, bonus = 0) {
        this.lados = lados;
        this.quantidade = quantidade;
        this.rolagem = Array(quantidade)
        for(let i =0 ; i< this.rolagem.length; i++) {
            this.rolagem[i] = Array(this.lados).fill(0)
        }
        
        this.name = name;
        this.bonus = bonus;
    }

    roll() {
        const rolls = []
        for(let i = 0; i<this.quantidade; i++) {
            
            const roll = Math.floor(Math.random() * this.lados)
            this.rolagem[i][roll]++;
            rolls.push(roll+1);
        }
        
        return this.quantidade == 1 ? rolls[0] : rolls;
    }

    resetaRolagens() {

        for(let j = 0; j<this.quantidade; j++) {
            for (let i = 0; i < this.lados; i++) {
                this.rolagem[j][i] = 0;
            }
        }        
    }

    moda() {
        let resultado = Array(this.quantidade).fill(0);
        let check = Array(this.quantidade).fill(0);
        
        for(let j = 0; j< this.quantidade; j++) {
            for (let i = this.lados; i > -1; i--) {
                if (this.rolagem[j][i] > check[j]) {
                    check[j] = this.rolagem[j][i];
                    resultado[j] = i+1;
                }
            }
        }
        
        return this.quantidade == 1 ? resultado[0]: resultado 
    }
}