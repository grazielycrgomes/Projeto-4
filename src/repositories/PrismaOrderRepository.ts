import 'reflect-metadata';
import { injectable } from 'inversify';
import { PrismaClient } from '@prisma/client';
import { IOrderRepository } from './IOrderRepository';

const prisma = new PrismaClient();

@injectable()
export class PrismaOrderRepository implements IOrderRepository {
  async findProductById(productId: number): Promise<any> {
    return await prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async findOrderById(id: number): Promise<any> {
    return await prisma.order.findUnique({ where: { id }, include: { items: true } });
  }

  async saveOrder(orderData: any): Promise<any> {
    return await prisma.order.create({
      data: orderData,
      include: { items: true },
    });
  }
}