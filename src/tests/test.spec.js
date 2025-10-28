import mestre from '../controllers/mestre.js';
import jogador from '../controllers/jogador.js';
import request from 'supertest';

// O Jest executa todos os testes dentro de 'describe'
describe('Teste de Fumaça - Rolagem de Dados', () => {
    const playerKey = 'jogador1';
    
    // Testa o fluxo completo de configuração e execução da rolagem
    test('1. Deve configurar e executar uma rolagem customizada com sucesso', async () => {
        
        // --- AÇÃO DO MESTRE: CONFIGURAR DADOS (POST /mestre/:jogador/iniciaRolagens) ---
        const setupPayload = {
            "bonus_acao": 5, // Bônus D20
            "bonus_geral": 2, // Bônus para dados customizados
            "dados": [
                { "lados": 4, "quantidade": 2 }, // 2D4
                { "lados": 6, "quantidade": 1 }  // 1D6
            ]
        };

        let response = await request(mestre.iniciaRolagens)
            .post(`/mestre/${playerKey}/iniciaRolagens`)
            .send(setupPayload)
            .expect(200);

        // Verifica o status do jogador após a configuração
        response = await request(jogador.player)
            .get(`/jogador/${playerKey}`)
            .expect(200);

        expect(response.body.rolagemAberta).toBe(true);


        // --- AÇÃO DO JOGADOR: EXECUTAR ROLAGEM (POST /jogador/:jogador/roll) ---
        response = await request(jogador.rollAll)
            .post(`/jogador/${playerKey}/rolaTodos`)
            .expect(200); // 200 OK
        
        // Verifica se a estrutura de resposta está correta
        expect(response.body).toHaveProperty('total_rolagem_customizada');
        expect(response.body.resultados).toHaveLength(2); // Verifica 2D4 e 1D6

        const total = response.body.total_rolagem_customizada;
        // O valor mínimo de 2D4+1D6+2 é 2+1+2 = 5. O valor máximo é 8+6+2 = 16.
        expect(total).toBeGreaterThanOrEqual(5); 
        expect(total).toBeLessThanOrEqual(16);

        // --- AÇÃO DO MESTRE: OBTER RESULTADOS (GET /mestre/:jogador/roll/results) ---
        response = await request(mestre.exibeRolagem)
            .get(`/mestre/${playerKey}/exibeRolagem`)
            .expect(200);
            
        // Verifica se a fase de rolagem foi fechada
        response = await request(jogador.player)
            .get(`/jogador/${playerKey}`)
            .expect(200);
            
        expect(response.body.rolagemAberta).toBe(false);
    });
    
    // Adicione mais testes para votação, votos duplos (403), etc.
});