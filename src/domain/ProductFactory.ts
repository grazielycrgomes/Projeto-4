export interface IProduct {
  getId(): number;
  getPrice(): number;
  calculateFreight(): number;
}

class PhysicalProduct implements IProduct {
  constructor(private data: any) {}
  getId() { return this.data.id; }
  getPrice() { return this.data.price; }
  // frete simples: R$ 10 fixos + R$ 5 por kg
  calculateFreight() { return 10 + 5 * (this.data.weight ?? 0); }
}

class DigitalProduct implements IProduct {
  constructor(private data: any) {}
  getId() { return this.data.id; }
  getPrice() { return this.data.price; }
  calculateFreight() { return 0; }
}

export class ProductFactory {
  static createProduct(data: any): IProduct {
    switch (data.type) {
      case 'physical': return new PhysicalProduct(data);
      case 'digital': return new DigitalProduct(data);
      default: throw new Error(`Tipo de produto desconhecido: ${data.type}`);
    }
  }
}
