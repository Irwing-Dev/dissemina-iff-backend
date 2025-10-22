export class Dado {
    constructor(lados, quantidade, name = quantidade+"D"+lados, bonus = 0) {
        this.lados = lados;
        this.quantidade = quantidade;
        this.rolagem = Array(lados).fill(0);
        this.name = name;
        this.bonus = bonus
    }

    roll() {
        const rolls = []
        for(let i = 0; i<this.quantidade; i++) {
            const roll = Math.floor(Math.random() * this.lados)
            this.rolagem[roll]++;
            rolls.push(roll+1);
        }
        return this.quantidade == 1 ? rolls[0] : rolls;
    }

    resetaRolagens() {
        for (let i = 0; i < this.lados; i++) {
            this.rolagem[i] = 0;
        }
    }

    moda() {
        let resultado = 0;
        let check = 0;

        for (let i = 0; i < this.lados; i++) {
        if (this.rolagem[i] >= check) {
            check = this.rolagem[i];
            resultado = i;
        }
        }
        resultado++;
        return resultado
    }
}