import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { FinancialRecord } from '../../app/models/ecosystem.model';

const defaultFinancials: FinancialRecord[] = [
  { id: 'fin-1', date: 'Hoje, 19:42', type: 'sale', category: 'Vendas PDV', description: 'Comanda Mesa 3 (Pago)', amount: 245.50, paymentMethod: 'Cartão Crédito', referenceId: 'ord-100', isSimulated: false, mode: 'real' },
  { id: 'fin-2', date: 'Hoje, 18:15', type: 'sale', category: 'Delivery Online', description: 'Pedido Online #101', amount: 88.50, paymentMethod: 'PIX', referenceId: 'ord-102', isSimulated: false, mode: 'real' },
  { id: 'fin-3', date: 'Hoje, 14:00', type: 'expense', category: 'Insumos / Hortifrúti', description: 'Compra diária de vegetais e hortifrúti', amount: 320.00, paymentMethod: 'Dinheiro', referenceId: 'sup-01', isSimulated: false, mode: 'real' },
  { id: 'fin-4', date: 'Ontem, 22:30', type: 'sale', category: 'Vendas Balcão', description: 'Fechamento de Caixa Turno Noite', amount: 3450.00, paymentMethod: 'Misto', referenceId: 'shift-01', isSimulated: false, mode: 'real' }
];

export const financialsStorage = new FileStorage<FinancialRecord>('financials', defaultFinancials);
export const financialsRouter = Router();

// GET /api/financials - List financial records
financialsRouter.get('/', (req: Request, res: Response) => {
  const type = req.query['type'] as string | undefined;
  const list = financialsStorage.getAll();
  if (type) {
    res.json(list.filter(f => f.type === type));
    return;
  }
  res.json(list);
});

// POST /api/financials - Add a new financial transaction (cash op, expense, payout)
financialsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.description || body.amount === undefined || !body.type) {
    res.status(400).json({ error: 'description, amount, and type are mandatory.' });
    return;
  }

  const id = 'fin-' + Date.now().toString(36);
  const newRecord: FinancialRecord = {
    id,
    date: body.date || new Date().toLocaleString('pt-BR'),
    type: body.type,
    category: body.category || 'Operacional Loja',
    description: String(body.description).trim(),
    amount: Number(body.amount),
    paymentMethod: body.paymentMethod || 'Dinheiro',
    referenceId: body.referenceId || `ref-${Date.now().toString(36)}`,
    isSimulated: body.isSimulated ?? false,
    mode: body.isSimulated ? 'simulation' : 'real'
  };

  const created = financialsStorage.insert(newRecord);
  res.status(201).json(created);
});
