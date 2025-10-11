import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { fileURLToPath } from "url";

//chamando o path pra não ter problema com o caminho dos arquivos, chamando o routes pra fazer o arquivo de rotas e o globalMiddleware pra fazer o middleware global
import path, {dirname} from 'path';
import routes from './routes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/api', routes);

if (process.argv[1] === __filename) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
}

export default app;