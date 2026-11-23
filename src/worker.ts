import 'dotenv/config';
import 'reflect-metadata';
import { createClient } from 'redis';
import { container } from './container/container';
import { NotificationService } from './services/NotificationService';
import { ORDER_QUEUE_KEY } from './queue/RedisOrderQueue';
import logger from './lib/logger';

async function main() {
  const notificationService = container.get(NotificationService);

  // conexão própria: o BRPOP bloqueia a conexão enquanto espera
  const redis = createClient({ url: process.env.REDIS_URL });
  redis.on('error', (err) => logger.error(`[REDIS] ${err.message}`));
  await redis.connect();

  logger.info('Worker iniciado, aguardando pedidos na fila...');

  while (true) {
    // BRPOP com timeout 0 = espera indefinidamente; a retirada é atômica,
    // então cada pedido vai para apenas um worker.
    const result = await redis.brPop(ORDER_QUEUE_KEY, 0);
    if (!result) continue;

    try {
      const order = JSON.parse(result.element);
      await notificationService.notifyCustomer(order.customer, order.orderId, order.total);
      logger.info(`Email do pedido #${order.orderId} enviado pelo worker`);
    } catch (err: any) {
      logger.error(`Falha ao processar mensagem da fila: ${err.message}`);
    }
  }
}

main().catch((err) => {
  logger.error(`Worker falhou: ${err.message}`);
  process.exit(1);
});
