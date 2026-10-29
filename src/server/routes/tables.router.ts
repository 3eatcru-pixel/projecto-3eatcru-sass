import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { TableInfo } from '../../app/models/ecosystem.model';

const defaultTables: TableInfo[] = [
  { id: 't-1', number: 1, capacity: 4, status: 'occupied', server: 'Carlos M.', guests: 3, currentTotal: 147.60, zone: 'Salão Principal' },
  { id: 't-2', number: 2, capacity: 2, status: 'available', zone: 'Salão Principal' },
  { id: 't-3', number: 3, capacity: 6, status: 'billing', server: 'Ana P.', guests: 5, currentTotal: 245.50, zone: 'Varanda Externa' },
  { id: 't-4', number: 4, capacity: 4, status: 'available', zone: 'Salão Principal' },
  { id: 't-5', number: 5, capacity: 2, status: 'occupied', server: 'Carlos M.', guests: 2, currentTotal: 88.00, zone: 'Varanda Externa' },
  { id: 't-6', number: 6, capacity: 8, status: 'reserved', server: 'Ana P.', zone: 'Bar & Lounge' }
];

export const tablesStorage = new FileStorage<TableInfo>('tables', defaultTables);
export const tablesRouter = Router();

function getParamId(req: Request): string {
  const p = req.params['id'];
  return Array.isArray(p) ? p[0] : (p || '');
}

// GET /api/tables - List tables
tablesRouter.get('/', (_req: Request, res: Response) => {
  res.json(tablesStorage.getAll());
});

// GET /api/tables/:id - Single table
tablesRouter.get('/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const table = tablesStorage.getById(id);
  if (!table) {
    res.status(404).json({ error: 'Table not found.' });
    return;
  }
  res.json(table);
});

// POST /api/tables - Create new table
tablesRouter.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.number || !body.capacity) {
    res.status(400).json({ error: 'number and capacity are required.' });
    return;
  }
  const id = 't-' + Date.now().toString(36);
  const newTable: TableInfo = {
    id,
    number: Number(body.number),
    capacity: Number(body.capacity),
    status: body.status || 'available',
    zone: body.zone || 'Salão Principal',
    server: body.server,
    guests: body.guests,
    currentTotal: body.currentTotal || 0,
    currentOrderId: body.currentOrderId
  };
  const created = tablesStorage.insert(newTable);
  res.status(201).json(created);
});

// PATCH /api/tables/:id - Update table status or comanda
tablesRouter.patch('/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const updated = tablesStorage.update(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Table not found.' });
    return;
  }
  res.json(updated);
});
