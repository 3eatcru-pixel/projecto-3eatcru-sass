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
    address: {
      street: 'Av. Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    contactEmail: 'contato@burgerco.com.br',
    phone: '(11) 98765-4321',
    createdAt: '2026-01-15T08:00:00.000Z',
    deliveryRadiusKm: 7.5,
    openingHours: '11:00 às 23:30',
    activeDevicesCount: 3,
    devicesLimit: 5,
    serviceFeePercent: 8,
    minOrderValue: 30,
    deliveryFee: 6.5,
    deliveryFleetType: 'hybrid',
    themeColor: 'amber'
  },
  {
    id: 'tenant-2',
    name: 'Padaria & Empório Estrela',
    legalName: 'Panificadora e Confeitaria Estrela LTDA',
    cnpj: '98.765.432/0001-10',
    category: 'retail',
    plan: 'Starter',
    status: 'active',
    lat: -23.5505,
    lng: -46.6333,
    address: {
      street: 'Rua Augusta',
      number: '450',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000'
    },
    contactEmail: 'gerencia@padariaestrela.com.br',
    phone: '(11) 91234-5678',
    createdAt: '2026-02-01T07:00:00.000Z',
    deliveryRadiusKm: 5.0,
    openingHours: '06:00 às 21:00',
    activeDevicesCount: 2,
    devicesLimit: 3,
    serviceFeePercent: 8,
    minOrderValue: 20,
    deliveryFee: 5.0,
    deliveryFleetType: 'own',
    themeColor: 'amber'
  }
];

export const tenantsStorage = new FileStorage<CompanyTenant>('tenants', defaultTenants);
export const tenantsRouter = Router();

function getParamId(req: Request): string {
  const p = req.params['id'];
  return Array.isArray(p) ? p[0] : (p || '');
}

// GET /api/tenants - List all tenants
tenantsRouter.get('/', (_req: Request, res: Response) => {
  res.json(tenantsStorage.getAll());
});

// GET /api/tenants/:id - Get tenant by id
tenantsRouter.get('/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const tenant = tenantsStorage.getById(id);
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
    address: body.address && typeof body.address === 'object' ? body.address : {
      street: String(body.address || 'Av. Principal'),
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000'
    },
    contactEmail: body.contactEmail || `contato@${id}.com.br`,
    phone: body.phone || '(11) 90000-0000',
    createdAt: new Date().toISOString(),
    deliveryRadiusKm: Number(body.deliveryRadiusKm) || 5.0,
    openingHours: body.openingHours || '10:00 às 22:00',
    activeDevicesCount: 1,
    devicesLimit: body.plan === 'Enterprise' ? 20 : body.plan === 'Professional' ? 5 : 2,
    serviceFeePercent: Number(body.serviceFeePercent) || 8,
    minOrderValue: Number(body.minOrderValue) || 25,
    deliveryFee: Number(body.deliveryFee) || 5,
    deliveryFleetType: body.deliveryFleetType || 'hybrid',
    themeColor: 'amber'
  };

  const created = tenantsStorage.insert(newTenant);
  res.status(201).json(created);
});

// PATCH /api/tenants/:id - Update tenant governance settings
tenantsRouter.patch('/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const updated = tenantsStorage.update(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Tenant not found.' });
    return;
  }
  res.json(updated);
});
