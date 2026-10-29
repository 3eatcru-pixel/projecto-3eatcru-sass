import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { tenantsStorage } from './tenants.router';
import { productsStorage } from './products.router';
import { OrderTransaction } from '../../app/models/ecosystem.model';

const defaultOrders: OrderTransaction[] = [
  {
    id: 'ord-init-1001',
    orderNumber: '#1001',
    tenantId: 'tenant-1',
    customerName: 'Lucas Silveira',
    customerPhone: '(11) 98888-1111',
    type: 'delivery',
    status: 'completed',
    items: [
      {
        product: {
          id: 'prod-1',
          name: 'Burger Cru Artesanal',
          price: 38.9,
          stock: 45,
          category: 'Hambúrgueres',
          cost: 14.5,
          minStock: 10,
          unit: 'un'
        },
        quantity: 2
      }
    ],
    subtotal: 77.8,
    tax: 6.5,
    discount: 0,
    total: 84.3,
    paymentMethod: 'pix',
    channel: 'Customer Storefront',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    isSimulated: false,
    mode: 'real'
  }
];

export const ordersStorage = new FileStorage<OrderTransaction>('orders', defaultOrders);
export const ordersRouter = Router();

// GET /api/orders?tenantId=... - List orders
ordersRouter.get('/', (req: Request, res: Response) => {
  const tenantId = req.query['tenantId'] as string | undefined;
  const all = ordersStorage.getAll();
  if (tenantId) {
    res.json(all.filter(o => o.tenantId === tenantId));
    return;
  }
  res.json(all);
});

// GET /api/orders/:id - Single order
ordersRouter.get('/:id', (req: Request, res: Response) => {
  const order = ordersStorage.getById(req.params['id']);
  if (!order) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  res.json(order);
});

// POST /api/orders - Create new order (Public Storefront or POS)
ordersRouter.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.tenantId || !Array.isArray(body.items) || body.items.length === 0) {
    res.status(400).json({ error: 'tenantId and items are mandatory.' });
    return;
  }

  const tenant = tenantsStorage.getById(body.tenantId);
  if (!tenant) {
    res.status(404).json({ error: `Tenant [${body.tenantId}] not found.` });
    return;
  }

  // Calculate Subtotal from stored products to prevent tampering
  let calculatedSubtotal = 0;
  for (const item of body.items) {
    const p = productsStorage.getById(item.product?.id || item.productId);
    const price = p ? p.price : Number(item.price || item.product?.price || 0);
    const qty = Math.max(1, Number(item.quantity || 1));
    calculatedSubtotal += price * qty;

    // Deduct stock if product exists
    if (p) {
      const newStock = Math.max(0, p.stock - qty);
      productsStorage.update(p.id, { stock: newStock });
    }
  }

  // Enforce minimum order value on delivery
  const isDelivery = body.type === 'delivery';
  if (isDelivery && tenant.minOrderValue && calculatedSubtotal < tenant.minOrderValue) {
    res.status(422).json({
      error: `Valor mínimo não atingido. O valor mínimo para entrega nesta loja é R$ ${tenant.minOrderValue.toFixed(2)}. Subtotal atual: R$ ${calculatedSubtotal.toFixed(2)}.`
    });
    return;
  }

  const deliveryFee = isDelivery ? (tenant.deliveryFee ?? 5.0) : 0;
  const discount = Math.max(0, Number(body.discount) || 0);
  const total = Number((calculatedSubtotal + deliveryFee - discount).toFixed(2));

  // Generate unique collision-proof ID
  const id = `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const orderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: OrderTransaction = {
    id,
    orderNumber,
    tenantId: tenant.id,
    customerName: body.customerName || 'Consumidor',
    customerPhone: body.customerPhone || '',
    type: body.type || 'delivery',
    tableNumber: body.tableNumber,
    status: 'pending',
    items: body.items,
    subtotal: Number(calculatedSubtotal.toFixed(2)),
    tax: deliveryFee,
    discount,
    total,
    paymentMethod: body.paymentMethod || 'pix',
    channel: body.channel || 'Customer Storefront',
    createdAt: new Date().toISOString(),
    isSimulated: body.isSimulated ?? false,
    mode: body.isSimulated ? 'simulation' : 'real'
  };

  const created = ordersStorage.insert(newOrder);
  res.status(201).json(created);
});

// PATCH /api/orders/:id/status - Update order workflow status
ordersRouter.patch('/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const validStatuses: OrderTransaction['status'][] = ['pending', 'preparing', 'ready', 'dispatched', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const updated = ordersStorage.update(req.params['id'], { status });
  if (!updated) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }
  res.json(updated);
});
