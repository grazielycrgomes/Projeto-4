import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';

@injectable()
export class OrderController {
  constructor(
    @inject(OrderService) private orderService: OrderService
  ) {}

  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const orderData = req.body;
      const result = await this.orderService.execute(orderData);
      return res.status(201).json({
        message: 'Pedido processado com sucesso!',
        data: result
      });
    } catch (error: any) {
      return res.status(400).json({
        error: error.message
      });
    }
  }

  async getById(req: Request, res: Response): Promise<Response> {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'ID inválido' });
    }
    const order = await this.orderService.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    return res.json(order);
  }
}