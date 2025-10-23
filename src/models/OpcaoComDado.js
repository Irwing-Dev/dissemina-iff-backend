import { Dado } from "./Dado.js";

export class OpcaoComDado {
    constructor(name = "", dado = new Dado(1,2)) {
        this.name = name;
        this.dado = dado;
    }
}