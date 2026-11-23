import 'reflect-metadata';
import { injectable } from 'inversify';
import { createClient } from 'redis';
import { IOrderQueue } from './IOrderQueue';

export const ORDER_QUEUE_KEY = 'orders:email';

@injectable()
export class RedisOrderQueue implements IOrderQueue {
  private client = createClient({ url: process.env.REDIS_URL });
  private connecting?: Promise<unknown>;

  private async connect() {
    if (!this.connecting) {
      this.client.on('error', (err) => console.error('[REDIS]', err.message));
      this.connecting = this.client.connect();
    }
    await this.connecting;
  }

  async publish(order: { id: number; customer: string; total: number }): Promise<void> {
    await this.connect();
    // LPUSH: coloca no começo da lista; o worker retira do fim com BRPOP (FIFO)
    await this.client.lPush(
      ORDER_QUEUE_KEY,
      JSON.stringify({ orderId: order.id, customer: order.customer, total: order.total })
    );
  }
}
