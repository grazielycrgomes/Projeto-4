# Comércio eletrônico — Projeto 4

API de pedidos (Express + Prisma/PostgreSQL) com **envio de e-mail assíncrono**: a API grava o pedido,
publica numa fila do Redis (`LPUSH`) e responde. Um **worker**, em outro container, lê a fila (`BRPOP`)
e envia o e-mail. Decisão documentada em [`docs/adr-001-fila-de-email.md`](docs/adr-001-fila-de-email.md).

## Como rodar

```bash
cp .env.example .env        # no Windows (cmd): copy .env.example .env
docker compose up --build
```

A API sobe em `http://localhost:3000`.

## Testar

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"customer":"cliente@ethereal.email","items":[{"productId":1,"quantity":1}],"paymentMethod":"pix"}'

curl http://localhost:3000/orders/1
```

O e-mail aparece no **log do worker** (`docker compose logs -f worker`), com um link do Ethereal.

- Worker parado: `docker compose stop worker` → os pedidos ficam na fila; `docker compose start worker` envia tudo.
- Dois workers: `docker compose up -d --scale worker=2` → cada pedido é enviado uma única vez.

## Estrutura

- `src/services/OrderService.ts` — grava o pedido e publica na fila (conhece só `IOrderQueue`).
- `src/queue/` — `IOrderQueue` e `RedisOrderQueue` (único lugar que fala com o Redis na API).
- `src/worker.ts` — consome a fila e chama o `NotificationService`.
- `src/container/container.ts` — injeção de dependências (Inversify).
