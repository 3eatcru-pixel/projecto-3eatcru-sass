import { describe, it, expect, beforeEach } from 'vitest';
import { FileStorage } from './db/file-storage';
import { tenantsStorage } from './routes/tenants.router';
import { productsStorage } from './routes/products.router';
import { ordersStorage } from './routes/orders.router';
import { devicesStorage, auditStorage } from './routes/hq.router';

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
});
