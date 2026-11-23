export interface IOrderQueue {
  publish(order: { id: number; customer: string; total: number }): Promise<void>;
}
