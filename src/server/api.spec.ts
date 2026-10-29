import { describe, it, expect, beforeEach } from 'vitest';
import { FileStorage } from './db/file-storage';
import { tenantsStorage } from './routes/tenants.router';
import { productsStorage } from './routes/products.router';
import { ordersStorage } from './routes/orders.router';
import { devicesStorage, auditStorage, plansStorage, regionalStorage, driversStorage, consumersStorage } from './routes/hq.router';
import { tablesStorage } from './routes/tables.router';
import { financialsStorage } from './routes/financials.router';

describe('3EATCRU Backend Core Storage & API Suite', () => {
  interface TestItem {
    id: string;
    title: string;
    value: number;
  }

  let testStorage: FileStorage<TestItem>;

  beforeEach(() => {
    testStorage = new FileStorage<TestItem>('test_items', [
      { id: 'item-1', title: 'Item Teste 1', value: 100 },
      { id: 'item-2', title: 'Item Teste 2', value: 250 }
    ]);
  });

  describe('FileStorage (Atomic Persistence)', () => {
    it('should retrieve seeded initial data', () => {
      const items = testStorage.getAll();
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(items.find(i => i.id === 'item-1')).toBeDefined();
    });

    it('should find item by id', () => {
      const item = testStorage.getById('item-2');
      expect(item).toBeDefined();
      expect(item?.value).toBe(250);
    });

    it('should insert new item and persist', () => {
      const newItem = { id: 'item-new-' + Date.now(), title: 'Novo Item', value: 500 };
      testStorage.insert(newItem);
      const found = testStorage.getById(newItem.id);
      expect(found).toBeDefined();
      expect(found?.title).toBe('Novo Item');
    });

    it('should update existing item without corruption', () => {
      testStorage.update('item-1', { value: 199.9 });
      const updated = testStorage.getById('item-1');
      expect(updated?.value).toBe(199.9);
      expect(updated?.title).toBe('Item Teste 1');
    });
  });

  describe('Tenants Backend Storage', () => {
    it('should provide default active tenants for HQ and Store OS', () => {
      const tenants = tenantsStorage.getAll();
      expect(tenants.length).toBeGreaterThanOrEqual(2);
      const burgerCo = tenants.find(t => t.id === 'tenant-1');
      expect(burgerCo).toBeDefined();
      expect(burgerCo?.name).toBe('Burger & Co Gourmet');
      expect(burgerCo?.serviceFeePercent).toBe(8);
      expect(burgerCo?.address.city).toBe('São Paulo');
    });
  });

  describe('Products Backend Storage', () => {
    it('should load products and support stock tracking', () => {
      const products = productsStorage.getAll();
      expect(products.length).toBeGreaterThanOrEqual(3);

      const burger = products.find(p => p.id === 'prod-1');
      expect(burger).toBeDefined();
      expect(burger?.price).toBeGreaterThan(0);
      expect(burger?.stock).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Orders Backend Storage', () => {
    it('should store and retrieve order transactions with integrity', () => {
      const orders = ordersStorage.getAll();
      expect(orders.length).toBeGreaterThanOrEqual(1);
      const first = orders[0];
      expect(first.id).toBeDefined();
      expect(first.total).toBeGreaterThan(0);
      expect(first.status).toBeDefined();
    });
  });

  describe('HQ Central Backend (App Owner Governance)', () => {
    it('should list hardware terminals and support remote locking via MDM', () => {
      const devices = devicesStorage.getAll();
      expect(devices.length).toBeGreaterThanOrEqual(2);

      const nodeAlpha = devices.find(d => d.tenantId === 'hq');
      expect(nodeAlpha).toBeDefined();
      expect(nodeAlpha?.deviceName).toContain('HQ Central');

      // Test lock toggle
      const dev1 = devices.find(d => d.id === 'dev-1');
      expect(dev1).toBeDefined();
      const initialStatus = dev1!.status;
      const targetStatus = initialStatus === 'locked' ? 'online' : 'locked';

      devicesStorage.update('dev-1', { status: targetStatus });
      const updated = devicesStorage.getById('dev-1');
      expect(updated?.status).toBe(targetStatus);

      // Revert back
      devicesStorage.update('dev-1', { status: initialStatus });
    });

    it('should maintain immutable audit log trail for platform operations', () => {
      const initialLogs = auditStorage.getAll();
      expect(initialLogs.length).toBeGreaterThanOrEqual(1);

      const testAudit = {
        id: 'aud-test-' + Date.now(),
        timestamp: new Date().toLocaleString('pt-BR'),
        user: 'fundador@3eatcru.com.br',
        action: 'Auditoria de Teste',
        module: 'HQ' as const,
        details: 'Verificação da integridade do backend HQ Central',
        severity: 'info' as const
      };

      auditStorage.insert(testAudit);
      const logsAfter = auditStorage.getAll();
      expect(logsAfter.length).toBe(initialLogs.length + 1);
      expect(logsAfter.find(l => l.id === testAudit.id)).toBeDefined();
    });
  });

  describe('Store OS Backend Storage (Tables & Financials)', () => {
    it('should retrieve dine-in tables and allow status updates', () => {
      const tables = tablesStorage.getAll();
      expect(tables.length).toBeGreaterThanOrEqual(4);

      const table1 = tables.find(t => t.id === 't-1');
      expect(table1).toBeDefined();

      tablesStorage.update('t-2', { status: 'occupied', guests: 2 });
      const updated = tablesStorage.getById('t-2');
      expect(updated?.status).toBe('occupied');
      expect(updated?.guests).toBe(2);

      // Revert back
      tablesStorage.update('t-2', { status: 'available', guests: undefined });
    });

    it('should store and track financial transactions for store cash operations', () => {
      const initialCount = financialsStorage.getAll().length;
      expect(initialCount).toBeGreaterThanOrEqual(1);

      const newRecord = {
        id: 'fin-test-' + Date.now(),
        date: new Date().toLocaleDateString('pt-BR'),
        type: 'sale' as const,
        category: 'Vendas PDV Balcão',
        description: 'Venda Teste Backend',
        amount: 89.9,
        paymentMethod: 'PIX',
        referenceId: 'ref-test-01',
        isSimulated: false,
        mode: 'real' as const
      };

      financialsStorage.insert(newRecord);
      const allAfter = financialsStorage.getAll();
      expect(allAfter.length).toBe(initialCount + 1);
      expect(allAfter.find(f => f.id === newRecord.id)).toBeDefined();
    });
  });

  describe('HQ Central Extended Domain Governance (Plans, Regional, Drivers, Consumers)', () => {
    it('should manage SaaS subscription plans and allow price modifications', () => {
      const plans = plansStorage.getAll();
      expect(plans.length).toBeGreaterThanOrEqual(3);
      const starter = plans.find(p => p.id === 'Starter');
      expect(starter).toBeDefined();
      expect(starter?.priceMonthly).toBeGreaterThan(0);

      // Test update
      const originalPrice = starter!.priceMonthly;
      plansStorage.update('Starter', { priceMonthly: 189.0 });
      const updated = plansStorage.getById('Starter');
      expect(updated?.priceMonthly).toBe(189.0);

      // Revert
      plansStorage.update('Starter', { priceMonthly: originalPrice });
    });

    it('should govern regional marketplace portal configurations', () => {
      const allConfigs = regionalStorage.getAll();
      expect(allConfigs.length).toBeGreaterThanOrEqual(1);
      const main = regionalStorage.getById('global-regional');
      expect(main).toBeDefined();
      expect(main?.config.activeRegionName).toBe('Grande São Paulo • Polo Gastronômico Central');
      expect(main?.config.defaultSearchRadiusKm).toBe(15);
    });

    it('should track driver telematics and update GPS positions', () => {
      const drivers = driversStorage.getAll();
      expect(drivers.length).toBeGreaterThanOrEqual(2);
      const d1 = drivers[0];
      expect(d1.id).toBeDefined();

      const origLocation = d1.currentLocationName;
      driversStorage.update(d1.id, { currentLocationName: 'Rua Augusta, 500' });
      const updated = driversStorage.getById(d1.id);
      expect(updated?.currentLocationName).toBe('Rua Augusta, 500');

      // Revert
      driversStorage.update(d1.id, { currentLocationName: origLocation });
    });

    it('should manage global CRM consumers directory', () => {
      const consumers = consumersStorage.getAll();
      expect(consumers.length).toBeGreaterThanOrEqual(2);
      const c1 = consumers.find(c => c.id === 'cons-1');
      expect(c1).toBeDefined();
      expect(c1?.name).toBe('Carlos Eduardo');
    });
  });
});
