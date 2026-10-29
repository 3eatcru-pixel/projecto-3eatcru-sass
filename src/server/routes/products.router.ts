import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { ProductItem } from '../../app/models/ecosystem.model';

const defaultProducts: ProductItem[] = [
  {
    id: 'prod-1',
    tenantId: 'tenant-1',
    name: 'Burger Cru Artesanal',
    category: 'Hambúrgueres',
    price: 38.9,
    costPrice: 14.5,
    stock: 45,
    minStock: 10,
    barcode: '789123456001',
    sku: 'BGR-CRU-01',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    description: 'Pão brioche selado, blend de 180g de angus, cheddar inglês maturado e maionese trufada.',
    availableOnline: true
  },
  {
    id: 'prod-2',
    tenantId: 'tenant-1',
    name: 'Smash Bacon Double',
    category: 'Hambúrgueres',
    price: 32.5,
    costPrice: 11.2,
    stock: 60,
    minStock: 15,
    barcode: '789123456002',
    sku: 'BGR-SMASH-02',
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400',
    description: 'Dois discos de 90g ultra esmagados com crosta caramelizada e fatias crocantes de bacon artesanal.',
    availableOnline: true
  },
  {
    id: 'prod-3',
    tenantId: 'tenant-1',
    name: 'Batata Rústica com Alecrim',
    category: 'Acompanhamentos',
    price: 19.9,
    costPrice: 5.5,
    stock: 80,
    minStock: 20,
    barcode: '789123456003',
    sku: 'SIDE-FRIES-03',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400',
    description: 'Batatas com corte rústico, fritas em imersão dupla com ramos de alecrim fresco e flor de sal.',
    availableOnline: true
  }
];

export const productsStorage = new FileStorage<ProductItem>('products', defaultProducts);
export const productsRouter = Router();

function getParamId(req: Request): string {
  const p = req.params['id'];
  return Array.isArray(p) ? p[0] : (p || '');
}

// GET /api/products?tenantId=... - List products (optionally filtered by tenant)
productsRouter.get('/', (req: Request, res: Response) => {
  const tenantId = req.query['tenantId'] as string | undefined;
  const all = productsStorage.getAll();
  if (tenantId) {
    res.json(all.filter(p => p.tenantId === tenantId));
    return;
  }
  res.json(all);
});

// GET /api/products/:id - Single product
productsRouter.get('/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const item = productsStorage.getById(id);
  if (!item) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json(item);
});

// POST /api/products - Create product
productsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.price || !body.tenantId) {
    res.status(400).json({ error: 'Name, price, and tenantId are mandatory.' });
    return;
  }
  const id = 'prod-' + Date.now().toString(36);
  const newProd: ProductItem = {
    id,
    tenantId: body.tenantId,
    name: String(body.name).trim(),
    category: body.category || 'Geral',
    price: Number(body.price),
    costPrice: Number(body.costPrice || body.cost) || 0,
    stock: Number(body.stock) || 0,
    minStock: Number(body.minStock) || 5,
    barcode: body.barcode || `789${Date.now().toString().slice(-9)}`,
    sku: body.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
    image: body.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    description: body.description || '',
    availableOnline: body.availableOnline ?? true
  };
  const created = productsStorage.insert(newProd);
  res.status(201).json(created);
});

// PATCH /api/products/:id - Update product stock or details
productsRouter.patch('/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const updated = productsStorage.update(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json(updated);
});
