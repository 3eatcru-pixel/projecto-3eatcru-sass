import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { tenantsStorage } from './tenants.router';
import { productsStorage } from './products.router';
import { ordersStorage } from './orders.router';
import { POSDevice, AuditLog, SystemAuditReport, LicensePlan, RegionalMarketplaceConfig, StoreDriver, ConsumerAccount } from '../../app/models/ecosystem.model';

const defaultDevices: POSDevice[] = [
  {
    id: 'dev-hq-1',
    tenantId: 'hq',
    tenantName: 'HQ Central (Infraestrutura)',
    deviceName: 'HQ Central Node Alpha',
    type: 'terminal',
    serialNumber: 'HQ-MASTER-001-SP',
    macAddress: '00:1A:2B:3C:4D:5E',
    ipAddress: '10.0.0.1',
    osVersion: '3EATCRU HQ Kernel 5.0.0',
    appVersion: 'v3.0.0',
    status: 'online',
    lastPing: new Date().toISOString(),
    location: 'Data Center HQ - Servidor Central',
    batteryLevel: 100
  },
  {
    id: 'dev-1',
    tenantId: 'tenant-1',
    tenantName: 'Burger & Co Gourmet',
    deviceName: 'PDV Principal - Caixa 1',
    type: 'terminal',
    serialNumber: 'S920-BR-448821',
    macAddress: 'B8:27:EB:01:23:45',
    ipAddress: '192.168.1.101',
    osVersion: '3EATCRU OS 5.0.0-PRO',
    appVersion: 'v2.8.4',
    status: 'online',
    lastPing: new Date().toISOString(),
    location: 'Balcão de Atendimento',
    batteryLevel: 98
  },
  {
    id: 'dev-2',
    tenantId: 'tenant-1',
    tenantName: 'Burger & Co Gourmet',
    deviceName: 'Tablet Salão Volante',
    type: 'tablet',
    serialNumber: 'TAB-A8-990012',
    macAddress: 'B8:27:EB:02:44:11',
    ipAddress: '192.168.1.102',
    osVersion: 'Android 14 / OneUI 6',
    appVersion: 'v2.8.4',
    status: 'online',
    lastPing: new Date().toISOString(),
    location: 'Salão Principal (Mesas 1-8)',
    batteryLevel: 74
  },
  {
    id: 'dev-3',
    tenantId: 'tenant-2',
    tenantName: 'Padaria & Empório Estrela',
    deviceName: 'PDV Caixa Pães & Café',
    type: 'terminal',
    serialNumber: 'POS-ESTRELA-001',
    macAddress: 'CC:46:D6:77:88:99',
    ipAddress: '192.168.0.50',
    osVersion: '3EATCRU OS 5.0.0-PRO',
    appVersion: 'v2.8.4',
    status: 'online',
    lastPing: new Date().toISOString(),
    location: 'Frente de Caixa 1',
    batteryLevel: 100
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'aud-init-1',
    timestamp: new Date().toLocaleString('pt-BR'),
    user: 'fundador@3eatcru.com.br',
    action: 'Inicialização do Gabinete HQ Central',
    module: 'HQ',
    details: 'Cluster de governança inicializado com nós multi-tenant conectados.',
    severity: 'info'
  }
];

const defaultPlans: LicensePlan[] = [
  {
    id: 'Starter',
    name: 'Starter (Iniciante)',
    priceMonthly: 149.00,
    maxDevices: 2,
    includedModules: ['PDV Caixa', 'Estoque Básico', 'Relatórios Simples'],
    description: 'Ideal para pequenos comércios e balcões individuais.'
  },
  {
    id: 'Professional',
    name: 'Professional (Avançado)',
    priceMonthly: 299.00,
    maxDevices: 5,
    includedModules: ['PDV Avançado', 'KDS Cozinha', 'Mesas & Salão', 'Estoque ERP', 'Hub Logística'],
    description: 'Perfeito para restaurantes e lojas com grande fluxo de atendimento.'
  },
  {
    id: 'Enterprise',
    name: 'Enterprise (Corporativo)',
    priceMonthly: 599.00,
    maxDevices: 20,
    includedModules: ['Ilimitado Total', 'Franquias Multi-Unidade', 'Split Dedicado', 'MDM Supremo'],
    description: 'Para redes de lojas, franquias e operações de alta complexidade.'
  }
];

const defaultRegionalConfig: RegionalMarketplaceConfig = {
  heroTitle: 'Encontre Estabelecimentos pelo Ecossistema 3eatcru',
  heroSubtitle: 'Explore fichas comerciais em modo Fichário, consulte o Livro-Razão Contábil ou localize pela Mesa Cartográfica com cálculo geodésico de distância real.',
  heroTag: 'ARQUIVO DE NEGÓCIOS LOCAIS & BALCÕES PÚBLICOS',
  heroBannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
  heroCtaText: 'Explorar Arquivo de Negócios',
  heroAnnouncement: 'NOVA PRAÇA HOMOLOGADA: 12 unidades cadastradas em São Paulo. Explore a praça com cálculo geodésico de distância real.',
  showHeroAnnouncement: true,
  featuredTenantIds: ['tenant-1', 'tenant-2'],
  defaultSearchRadiusKm: 15,
  activeRegionName: 'Grande São Paulo • Polo Gastronômico Central'
};

const defaultDrivers: StoreDriver[] = [
  {
    id: 'drv-1',
    tenantId: 'tenant-1',
    name: 'Carlos Oliveira',
    phone: '(11) 95533-4455',
    vehicleType: 'moto',
    licensePlate: 'ABC-4E12',
    status: 'available',
    activeDeliveriesCount: 0,
    rating: 4.9,
    completedTodayCount: 14,
    driverType: 'private',
    deviceName: 'Motorola Moto G84 (Loja)',
    appVersion: '3EAT Driver App v3.2.0',
    batteryLevel: 88,
    complianceVerified: true,
    currentLocationName: 'Consolação - Próximo à loja',
    lastGpsPing: 'Agora mesmo'
  },
  {
    id: 'drv-2',
    tenantId: 'hq',
    name: 'Marcos Vinicius',
    phone: '(11) 98777-6655',
    vehicleType: 'moto',
    licensePlate: 'XYZ-9B34',
    status: 'available',
    activeDeliveriesCount: 1,
    rating: 4.95,
    completedTodayCount: 22,
    driverType: 'platform',
    deviceName: 'Samsung Galaxy A54 5G (Plataforma)',
    appVersion: '3EAT Driver App v3.2.0',
    batteryLevel: 74,
    complianceVerified: true,
    currentLocationName: 'Avenida Paulista, 1000',
    lastGpsPing: 'Agora mesmo'
  }
];

const defaultConsumers: ConsumerAccount[] = [
  {
    id: 'cons-1',
    name: 'Carlos Eduardo',
    email: 'carlos.eduardo@gmail.com',
    phone: '(11) 98888-7777',
    cpf: '320.198.441-00',
    primaryAddress: 'Rua Augusta, 1200 - Apto 42',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    totalOrders: 12,
    totalSpent: 840.50,
    status: 'active',
    registeredAt: '2024-02-10'
  },
  {
    id: 'cons-2',
    name: 'Mariana Costa',
    email: 'mariana.costa@outlook.com',
    phone: '(11) 97777-3322',
    cpf: '412.875.990-12',
    primaryAddress: 'Alameda Santos, 800 - Conj 101',
    neighborhood: 'Cerqueira César',
    city: 'São Paulo',
    totalOrders: 8,
    totalSpent: 520.00,
    status: 'active',
    registeredAt: '2024-03-01'
  }
];

export const devicesStorage = new FileStorage<POSDevice>('devices', defaultDevices);
export const auditStorage = new FileStorage<AuditLog>('audit_logs', defaultAuditLogs);
export const plansStorage = new FileStorage<LicensePlan>('plans', defaultPlans);
export const regionalStorage = new FileStorage<{ id: string; config: RegionalMarketplaceConfig }>('regional_config', [
  { id: 'global-regional', config: defaultRegionalConfig }
]);
export const driversStorage = new FileStorage<StoreDriver>('drivers', defaultDrivers);
export const consumersStorage = new FileStorage<ConsumerAccount>('consumers', defaultConsumers);

// Global SaaS Settings State (in-memory with sensible defaults)
let maintenanceMode = false;
let globalBroadcastMessage: string | null = null;
let platformCommissionRate = 0.08; // 8% default platform split

export const hqRouter = Router();

function getParamId(req: Request): string {
  const p = req.params['id'];
  return Array.isArray(p) ? p[0] : (p || '');
}

function logHqAudit(action: string, details: string, severity: AuditLog['severity'] = 'info', user = 'Dono do App (HQ)') {
  auditStorage.insert({
    id: `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toLocaleString('pt-BR'),
    user,
    action,
    module: 'HQ',
    details,
    severity
  });
}

// GET /api/hq/overview - Complete executive overview for the App Owner
hqRouter.get('/overview', (_req: Request, res: Response) => {
  const tenants = tenantsStorage.getAll();
  const devices = devicesStorage.getAll();
  const orders = ordersStorage.getAll();

  const realOrders = orders.filter(o => !o.isSimulated);
  const grossVolume = realOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const hqRevenue = Number((grossVolume * platformCommissionRate).toFixed(2));

  res.json({
    tenantsCount: tenants.length,
    activeTenantsCount: tenants.filter(t => t.status === 'active').length,
    totalDevices: devices.length,
    onlineDevices: devices.filter(d => d.status === 'online').length,
    totalOrders: realOrders.length,
    grossPlatformVolume: Number(grossVolume.toFixed(2)),
    hqCommissionRevenue: hqRevenue,
    defaultCommissionPercent: platformCommissionRate * 100,
    maintenanceMode,
    globalBroadcastMessage,
    serverUptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// GET /api/hq/devices - List devices with optional ?tenantId filter
hqRouter.get('/devices', (req: Request, res: Response) => {
  const tenantId = req.query['tenantId'] as string | undefined;
  const list = devicesStorage.getAll();
  if (tenantId && tenantId !== 'all') {
    res.json(list.filter(d => d.tenantId === tenantId));
    return;
  }
  res.json(list);
});

// POST /api/hq/devices - Pair a new device
hqRouter.post('/devices', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.deviceName || !body.serialNumber || !body.tenantId) {
    res.status(400).json({ error: 'deviceName, serialNumber, and tenantId are required.' });
    return;
  }

  const id = `dev-${Date.now().toString(36)}`;
  const tenant = tenantsStorage.getById(body.tenantId);
  const newDevice: POSDevice = {
    id,
    tenantId: body.tenantId,
    tenantName: body.tenantId === 'hq' ? 'HQ Central (Infraestrutura)' : (tenant?.name || 'Loja'),
    deviceName: String(body.deviceName).trim(),
    type: body.type || 'terminal',
    serialNumber: String(body.serialNumber).trim(),
    macAddress: body.macAddress || `00:${Math.floor(10 + Math.random() * 89)}:2B:3C:4D:${Math.floor(10 + Math.random() * 89)}`,
    ipAddress: body.ipAddress || '192.168.1.150',
    osVersion: '3EATCRU OS 5.0.0-PRO',
    appVersion: 'v3.0.0',
    status: 'online',
    lastPing: new Date().toISOString(),
    location: body.location || 'Terminal Balcão',
    batteryLevel: 100
  };

  const created = devicesStorage.insert(newDevice);
  logHqAudit('Terminal Pareado', `Novo terminal [${newDevice.deviceName}] (${newDevice.serialNumber}) pareado para ${newDevice.tenantName}.`, 'info');
  res.status(201).json(created);
});

// POST /api/hq/devices/:id/lock - Remotely lock a device (MDM)
hqRouter.post('/devices/:id/lock', (req: Request, res: Response) => {
  const id = getParamId(req);
  const dev = devicesStorage.getById(id);
  if (!dev) {
    res.status(404).json({ error: 'Device not found.' });
    return;
  }

  const newStatus = dev.status === 'locked' ? 'online' : 'locked';
  const updated = devicesStorage.update(id, { status: newStatus });
  logHqAudit('Comando MDM Remoto', `Dispositivo ${dev.deviceName} (${dev.serialNumber}) alterado para [${newStatus.toUpperCase()}].`, newStatus === 'locked' ? 'warning' : 'info');
  res.json(updated);
});

// POST /api/hq/devices/:id/restart - Remotely reboot a device (MDM)
hqRouter.post('/devices/:id/restart', (req: Request, res: Response) => {
  const id = getParamId(req);
  const dev = devicesStorage.getById(id);
  if (!dev) {
    res.status(404).json({ error: 'Device not found.' });
    return;
  }

  devicesStorage.update(id, { status: 'updating' });
  logHqAudit('Reinicialização MDM', `Comando de reinicialização remota enviado para ${dev.deviceName} (${dev.serialNumber}).`, 'info');

  setTimeout(() => {
    devicesStorage.update(id, { status: 'online', lastPing: new Date().toISOString() });
  }, 2000);

  res.json({ message: `Reboot command dispatched to device ${dev.deviceName}`, status: 'updating' });
});

// GET /api/hq/audit - Audit trail
hqRouter.get('/audit', (req: Request, res: Response) => {
  const severity = req.query['severity'] as AuditLog['severity'] | undefined;
  const logs = auditStorage.getAll();
  if (severity) {
    res.json(logs.filter(l => l.severity === severity));
    return;
  }
  res.json(logs);
});

// POST /api/hq/audit/run - Run structural platform audit
hqRouter.post('/audit/run', (_req: Request, res: Response) => {
  const tenants = tenantsStorage.getAll();
  const products = productsStorage.getAll();
  const orders = ordersStorage.getAll();
  const devices = devicesStorage.getAll();

  const issues: string[] = [];
  const tenantIdSet = new Set(tenants.map(t => t.id));

  // 1. Audit Tenants
  for (const t of tenants) {
    if (!t.cnpj || t.cnpj.length < 11) {
      issues.push(`Estabelecimento [${t.name}] com CNPJ incompleto.`);
    }
    if (t.activeDevicesCount > t.devicesLimit) {
      issues.push(`Estabelecimento [${t.name}] excedeu o limite de terminais (${t.activeDevicesCount}/${t.devicesLimit}).`);
    }
  }

  // 2. Audit Products
  for (const p of products) {
    if (p.tenantId && !tenantIdSet.has(p.tenantId)) {
      issues.push(`Produto [${p.name}] vinculado a tenant inexistente (${p.tenantId}).`);
    }
    if (p.price <= 0) {
      issues.push(`Produto [${p.name}] com preço zerado ou negativo.`);
    }
  }

  // 3. Audit Orders Arithmetic
  let ledgerConsistent = true;
  for (const o of orders) {
    const expected = Math.max(0, o.subtotal + (o.tax || 0) - (o.discount || 0));
    if (Math.abs(expected - o.total) > 0.15) {
      ledgerConsistent = false;
      issues.push(`Divergência contábil no pedido #${o.orderNumber}: esperado R$ ${expected.toFixed(2)}, registrado R$ ${o.total.toFixed(2)}`);
    }
  }

  const report: SystemAuditReport = {
    timestamp: new Date().toLocaleString('pt-BR'),
    tenantsChecked: tenants.length,
    productsChecked: products.length,
    ordersChecked: orders.length,
    devicesChecked: devices.length,
    ledgerConsistent,
    issuesFound: issues,
    status: issues.length === 0 ? 'passed' : (ledgerConsistent ? 'warning' : 'failed')
  };

  logHqAudit('Auditoria Estrutural do Ecossistema', `Executada pelo HQ Central: ${issues.length} apontamentos encontrados. Status: ${report.status}.`, report.status === 'passed' ? 'info' : 'warning');
  res.json(report);
});

// POST /api/hq/system/broadcast - Set global broadcast announcement
hqRouter.post('/system/broadcast', (req: Request, res: Response) => {
  const { message } = req.body;
  globalBroadcastMessage = message ? String(message).trim() : null;
  logHqAudit('Transmissão Global', globalBroadcastMessage ? `Comunicado emitido: "${globalBroadcastMessage}"` : 'Comunicado global cancelado.', 'warning');
  res.json({ globalBroadcastMessage });
});

// POST /api/hq/system/maintenance - Toggle maintenance lockout mode
hqRouter.post('/system/maintenance', (req: Request, res: Response) => {
  maintenanceMode = req.body.enabled !== undefined ? Boolean(req.body.enabled) : !maintenanceMode;
  logHqAudit('Modo Manutenção', `Modo manutenção da plataforma alterado para: ${maintenanceMode ? 'ATIVADO' : 'DESATIVADO'}.`, maintenanceMode ? 'critical' : 'info');
  res.json({ maintenanceMode });
});

// GET /api/hq/ledger - Consolidated SaaS revenue ledger
hqRouter.get('/ledger', (_req: Request, res: Response) => {
  const orders = ordersStorage.getAll();
  const realOrders = orders.filter(o => !o.isSimulated);

  const entries = realOrders.map(o => {
    const feeRate = platformCommissionRate;
    const hqFee = Number((o.total * feeRate).toFixed(2));
    const storeNet = Number((o.total - hqFee).toFixed(2));
    return {
      orderId: o.id,
      orderNumber: o.orderNumber,
      tenantId: o.tenantId,
      channel: o.channel,
      date: o.createdAt,
      orderTotal: o.total,
      platformFeeRate: `${(feeRate * 100).toFixed(0)}%`,
      platformFeeAmount: hqFee,
      storeNetAmount: storeNet
    };
  });

  const totalPlatformFees = Number(entries.reduce((sum, e) => sum + e.platformFeeAmount, 0).toFixed(2));

  res.json({
    totalPlatformFees,
    platformSplitPercent: platformCommissionRate * 100,
    recordsCount: entries.length,
    entries
  });
});

// GET /api/hq/plans - List SaaS license plans
hqRouter.get('/plans', (_req: Request, res: Response) => {
  res.json(plansStorage.getAll());
});

// PATCH /api/hq/plans/:id - Update SaaS license plan pricing/specs
hqRouter.patch('/plans/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const updated = plansStorage.update(id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Plan not found.' });
    return;
  }
  logHqAudit('Plano SaaS Atualizado', `Plano [${updated.name}] atualizado: Mensalidade R$ ${updated.priceMonthly}, Limite ${updated.maxDevices} terminais.`, 'info');
  res.json(updated);
});

// GET /api/hq/regional - Get regional marketplace configuration
hqRouter.get('/regional', (_req: Request, res: Response) => {
  const item = regionalStorage.getById('global-regional');
  res.json(item ? item.config : defaultRegionalConfig);
});

// POST /api/hq/regional - Save regional marketplace configuration
hqRouter.post('/regional', (req: Request, res: Response) => {
  const newConfig = req.body as RegionalMarketplaceConfig;
  regionalStorage.update('global-regional', { config: newConfig });
  logHqAudit('Configuração Regional Atualizada', `Praça "${newConfig.activeRegionName || 'Principal'}" reconfigurada pelo Gabinete HQ.`, 'info');
  res.json({ config: newConfig });
});

// GET /api/hq/drivers - List platform & store drivers
hqRouter.get('/drivers', (_req: Request, res: Response) => {
  res.json(driversStorage.getAll());
});

// POST /api/hq/drivers - Create a new driver (platform or private store driver)
hqRouter.post('/drivers', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name) {
    res.status(400).json({ error: 'Driver name is required.' });
    return;
  }
  const id = body.id || `drv-${Date.now().toString(36)}`;
  const newDriver: StoreDriver = {
    id,
    tenantId: body.tenantId || 'tenant-1',
    name: String(body.name).trim(),
    phone: body.phone || '(11) 99999-8888',
    vehicleType: body.vehicleType || 'moto',
    licensePlate: body.licensePlate,
    status: body.status || 'available',
    activeDeliveriesCount: Number(body.activeDeliveriesCount) || 0,
    rating: Number(body.rating) || 5.0,
    completedTodayCount: Number(body.completedTodayCount) || 0,
    driverType: body.driverType || 'private',
    deviceName: body.deviceName || 'Celular do Entregador (App 3EAT)',
    appVersion: body.appVersion || '3EAT Driver App v3.2.0',
    batteryLevel: Number(body.batteryLevel) || 100,
    complianceVerified: body.complianceVerified ?? true,
    currentLocationName: body.currentLocationName || 'Na Loja (Disponível)',
    lastGpsPing: 'Agora mesmo'
  };
  driversStorage.insert(newDriver);
  logHqAudit('Novo Entregador Registrado', `Entregador ${newDriver.name} (${newDriver.driverType}) adicionado à frota.`, 'info');
  res.status(201).json(newDriver);
});

// PATCH /api/hq/drivers/:id - Update driver status or details
hqRouter.patch('/drivers/:id', (req: Request, res: Response) => {
  const id = getParamId(req);
  const existing = driversStorage.getById(id);
  if (!existing) {
    res.status(404).json({ error: 'Driver not found.' });
    return;
  }
  const updated = driversStorage.update(id, req.body);
  logHqAudit('Entregador Atualizado', `Entregador ${existing.name} atualizado.`, 'info');
  res.json(updated);
});

// POST /api/hq/drivers/:id/ping - Register geodesic GPS telemetry ping
hqRouter.post('/drivers/:id/ping', (req: Request, res: Response) => {
  const id = getParamId(req);
  const driver = driversStorage.getById(id);
  if (!driver) {
    res.status(404).json({ error: 'Driver not found.' });
    return;
  }
  const pingTime = new Date().toLocaleTimeString('pt-BR');
  const locationName = req.body.locationName || driver.currentLocationName || 'São Paulo - Centro';
  const updated = driversStorage.update(id, {
    lastGpsPing: pingTime,
    currentLocationName: locationName,
    batteryLevel: req.body.batteryLevel ?? driver.batteryLevel
  });
  logHqAudit('Telemetria GPS MDM', `Ping registrado para ${driver.name}: ${locationName} (${pingTime}).`, 'info');
  res.json(updated);
});

// GET /api/hq/consumers - List CRM consumer accounts
hqRouter.get('/consumers', (_req: Request, res: Response) => {
  res.json(consumersStorage.getAll());
});

// POST /api/hq/consumers - Create or update CRM consumer account
hqRouter.post('/consumers', (req: Request, res: Response) => {
  const body = req.body;
  if (!body.name || !body.email) {
    res.status(400).json({ error: 'name and email are mandatory.' });
    return;
  }
  const id = body.id || `cons-${Date.now().toString(36)}`;
  const consumer: ConsumerAccount = {
    id,
    name: String(body.name).trim(),
    email: String(body.email).trim(),
    phone: body.phone || '(11) 90000-0000',
    cpf: body.cpf,
    primaryAddress: body.primaryAddress || 'Endereço Principal',
    neighborhood: body.neighborhood || 'Centro',
    city: body.city || 'São Paulo',
    totalOrders: Number(body.totalOrders) || 0,
    totalSpent: Number(body.totalSpent) || 0,
    status: body.status || 'active',
    registeredAt: body.registeredAt || new Date().toISOString().split('T')[0]
  };
  const created = consumersStorage.insert(consumer);
  res.status(201).json(created);
});

// POST /api/hq/system/commission - Update default platform commission rate
hqRouter.post('/system/commission', (req: Request, res: Response) => {
  let rate = Number(req.body.rate);
  if (isNaN(rate) || rate < 0) {
    res.status(400).json({ error: 'rate must be a valid percentage between 0 and 50%.' });
    return;
  }
  // Allow either decimal (0.085) or percentage number (8.5)
  if (rate > 1) {
    rate = rate / 100;
  }
  if (rate > 0.5) {
    res.status(400).json({ error: 'Commission rate cannot exceed 50%.' });
    return;
  }
  platformCommissionRate = rate;
  logHqAudit('Comissão Global SaaS', `Taxa de split da plataforma atualizada para ${(rate * 100).toFixed(1)}%.`, 'warning');
  res.json({ platformCommissionRate, percent: rate * 100 });
});
