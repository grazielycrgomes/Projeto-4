import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { container } from './container/container';
import { OrderController } from './controllers/OrderController';

const app = express();
app.use(express.json());

// Pega o controller direto do container do Inversify
const orderController = container.get(OrderController);

app.post('/orders', (req, res) => orderController.handle(req, res));
app.get('/orders/:id', (req, res) => orderController.getById(req, res));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} 🚀`);
});