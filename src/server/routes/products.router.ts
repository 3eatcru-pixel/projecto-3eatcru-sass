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
    cost: 14.5,
    stock: 45,
    minStock: 10,
    unit: 'un',
    description: 'Pão brioche selado, blend de 180g de angus, cheddar inglês maturado e maionese trufada.',
    availableOnline: true,
    ncm: '2106.90.90'
  },
  {
    id: 'prod-2',
    tenantId: 'tenant-1',
    name: 'Smash Bacon Double',
    category: 'Hambúrgueres',
    price: 32.5,
    cost: 11.2,
    stock: 60,
    minStock: 15,
    unit: 'un',
    description: 'Dois discos de 90g ultra esmagados com crosta caramelizada e fatias crocantes de bacon artesanal.',
    availableOnline: true,
    ncm: '2106.90.90'
  },
  {
    id: 'prod-3',
    tenantId: 'tenant-1',
    name: 'Batata Rústica com Alecrim',
    category: 'Acompanhamentos',
    price: 19.9,
    cost: 5.5,
    stock: 80,
    minStock: 20,
    unit: 'porção',
    description: 'Batatas com corte rústico, fritas em imersão dupla com ramos de alecrim fresco e flor de sal.',
    availableOnline: true,
    ncm: '2005.20.00'
  }
];

export const productsStorage = new FileStorage<ProductItem>('products', defaultProducts);
export const productsRouter = Router();

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
  const item = productsStorage.getById(req.params['id']);
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
    cost: Number(body.cost) || 0,
    stock: Number(body.stock) || 0,
    minStock: Number(body.minStock) || 5,
    unit: body.unit || 'un',
    description: body.description || '',
    availableOnline: body.availableOnline ?? true
  };
  const created = productsStorage.insert(newProd);
  res.status(201).json(created);
});

// PATCH /api/products/:id - Update product stock or details
productsRouter.patch('/:id', (req: Request, res: Response) => {
  const updated = productsStorage.update(req.params['id'], req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }
  res.json(updated);
});
