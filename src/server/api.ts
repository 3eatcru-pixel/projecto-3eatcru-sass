import { Router } from 'express';
import { healthRouter } from './routes/health.router';
import { hqRouter } from './routes/hq.router';
import { tenantsRouter } from './routes/tenants.router';
import { productsRouter } from './routes/products.router';
import { ordersRouter } from './routes/orders.router';
import { tablesRouter } from './routes/tables.router';
import { financialsRouter } from './routes/financials.router';

export const apiRouter = Router();

apiRouter.use('/health', healthRouter);
apiRouter.use('/hq', hqRouter);
apiRouter.use('/tenants', tenantsRouter);
apiRouter.use('/products', productsRouter);
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/tables', tablesRouter);
apiRouter.use('/financials', financialsRouter);

// Fallback 404 for undefined API routes
apiRouter.use((_req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    documentation: '/api/health for system status'
  });
});
