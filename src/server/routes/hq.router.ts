import { Router, Request, Response } from 'express';
import { FileStorage } from '../db/file-storage';
import { tenantsStorage } from './tenants.router';
import { productsStorage } from './products.router';
import { ordersStorage } from './orders.router';
import { POSDevice, AuditLog, SystemAuditReport } from '../../app/models/ecosystem.model';

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

export const devicesStorage = new FileStorage<POSDevice>('devices', defaultDevices);
export const auditStorage = new FileStorage<AuditLog>('audit_logs', defaultAuditLogs);

// Global SaaS Settings State (in-memory with sensible defaults)
let maintenanceMode = false;
let globalBroadcastMessage: string | null = null;
const platformCommissionRate = 0.08; // 8% default platform split

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
