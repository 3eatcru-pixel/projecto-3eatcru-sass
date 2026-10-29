import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { CompanyTenant } from '../../app/models/ecosystem.model';

const defaultTenants: CompanyTenant[] = [
  {
    id: 'tenant-1',
    name: 'Burger & Co Gourmet',
    legalName: 'Burger & Co Gastronomia LTDA',
    cnpj: '12.345.678/0001-90',
    category: 'restaurant',
    plan: 'Professional',
    status: 'active',
    lat: -23.5651,
    lng: -46.6521,
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    phone: '(11) 98765-4321',
    activeDevicesCount: 3,
    devicesLimit: 5,
    serviceFeePercent: 8,
    minOrderValue: 30,
    deliveryFee: 6.5,
    deliveryFleetType: 'hybrid',
    themeColor: '#d97706',
    primaryColor: '#f59e0b'
  },
  {
    id: 'tenant-2',
    name: 'Padaria & Empório Estrela',
    legalName: 'Panificadora e Confeitaria Estrela LTDA',
    cnpj: '98.765.432/0001-10',
    category: 'bakery',
    plan: 'Starter',
    status: 'active',
    lat: -23.5505,
    lng: -46.6333,
    address: 'Rua Augusta, 450 - Consolação, São Paulo - SP',
    phone: '(11) 91234-5678',
    activeDevicesCount: 2,
    devicesLimit: 3,
    serviceFeePercent: 8,
    minOrderValue: 20,
    deliveryFee: 5.0,
    deliveryFleetType: 'own',
    themeColor: '#ca8a04',
    primaryColor: '#eab308'
  }
];

export const tenantsStorage = new FileStorage<CompanyTenant>('tenants', defaultTenants);
export const tenantsRouter = Router();

// GET /api/tenants - List all tenants
tenantsRouter.get('/', (_req: Request, res: Response) => {
  res.json(tenantsStorage.getAll());
});

// GET /api/tenants/:id - Get tenant by id
tenantsRouter.get('/:id', (req: Request, res: Response) => {
  const tenant = tenantsStorage.getById(req.params['id']);
  if (!tenant) {
    res.status(404).json({ error: 'Tenant not found' });
    return;
  }
  res.json(tenant);
});

// POST /api/tenants - Provision new tenant (HQ Central)
tenantsRouter.post('/', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.cnpj) {
    res.status(400).json({ error: 'Name and CNPJ are mandatory.' });
    return;
  }

  const id = 'tenant-' + Date.now().toString(36);
  const newTenant: CompanyTenant = {
    id,
    name: String(body.name).trim(),
    legalName: body.legalName || body.name,
    cnpj: String(body.cnpj).trim(),
    category: body.category || 'restaurant',
    plan: body.plan || 'Professional',
    status: 'active',
    lat: Number(body.lat) || -23.5651,
    lng: Number(body.lng) || -46.6521,
    address: body.address || 'São Paulo - SP',
    phone: body.phone || '',
    activeDevicesCount: 1,
    devicesLimit: body.plan === 'Enterprise' ? 20 : body.plan === 'Professional' ? 5 : 2,
    serviceFeePercent: Number(body.serviceFeePercent) || 8,
    minOrderValue: Number(body.minOrderValue) || 25,
    deliveryFee: Number(body.deliveryFee) || 5,
    deliveryFleetType: body.deliveryFleetType || 'hybrid'
  };

  const created = tenantsStorage.insert(newTenant);
  res.status(201).json(created);
});

// PATCH /api/tenants/:id - Update tenant governance settings
tenantsRouter.patch('/:id', (req: Request, res: Response) => {
  const id = req.params['id'];
  const updated = tenantsStorage.update(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Tenant not found.' });
    return;
  }
  res.json(updated);
});
