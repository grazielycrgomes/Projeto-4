# ADR 001 — Envio de email por fila Redis

## Contexto

Na versão anterior, a API enviava o email de confirmação dentro da própria requisição `POST /orders`
(`OrderService` chamava `NotificationService`). Isso deixava a resposta lenta (o cliente esperava o
servidor de email), e uma falha no envio podia derrubar um pedido que já tinha sido salvo. Também
não havia como escalar ou reiniciar o envio separadamente da API.

## Decisão

Mover o envio para um processo separado (worker) ligado à API por uma fila no Redis:

- A API salva o pedido, publica uma mensagem na lista `orders:email` com `LPUSH` e responde.
- O worker, em outro container, retira mensagens com `BRPOP` (bloqueante) e chama o `NotificationService`.
- O `OrderService` depende apenas da interface `IOrderQueue`; a implementação `RedisOrderQueue` é
  registrada no `container.ts`, então nenhum arquivo de `services/` ou `controllers/` conhece o Redis.

Escolhemos **lista (LPUSH/BRPOP)** em vez de **pub/sub**:

- No pub/sub a mensagem é entregue a *todos* os assinantes: com 2 workers, o cliente receberia o email duplicado.
  Com a lista, o `BRPOP` é atômico e cada mensagem vai para exatamente um worker.
- No pub/sub, se nenhum assinante estiver conectado no momento, a mensagem é perdida. Com a lista, as
  mensagens ficam guardadas até um worker voltar.

## Consequências

- Resposta da API mais rápida e independente do servidor de email.
- Podemos parar, reiniciar ou escalar o worker (`--scale worker=2`) sem mexer na API.
- Pedidos feitos com o worker parado ficam na fila e são enviados quando ele volta.
- Entrega "pelo menos uma vez" não é garantida: se o worker cair após o `BRPOP` e antes de enviar,
  a mensagem se perde (poderia ser tratado com `BLMOVE`/lista de processamento ou BullMQ).
- Há um novo componente (Redis) para operar e monitorar.
