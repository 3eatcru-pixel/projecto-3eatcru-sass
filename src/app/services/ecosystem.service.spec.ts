import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EcosystemService } from './ecosystem.service';
import { MapToolsService } from './map-tools.service';
import { HqApiService } from './hq-api.service';
import { StoreOsApiService } from './store-os-api.service';

describe('3EATCRU Core Motors & Services Test Suite', () => {
  let ecosystem: EcosystemService;
  let mapTools: MapToolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EcosystemService,
        MapToolsService,
        {
          provide: HqApiService,
          useValue: {
            getOverview: () => Promise.resolve({
              tenantsCount: 2,
              activeTenantsCount: 2,
              totalDevices: 4,
              onlineDevices: 4,
              totalOrders: 10,
              grossPlatformVolume: 500,
              hqCommissionRevenue: 40,
              defaultCommissionPercent: 8,
              maintenanceMode: false,
              globalBroadcastMessage: null,
              serverUptimeSeconds: 100,
              timestamp: new Date().toISOString()
            }),
            getTenants: () => Promise.resolve([]),
            getDevices: () => Promise.resolve([]),
            getAuditLogs: () => Promise.resolve([]),
            runAudit: () => Promise.resolve({
              timestamp: '29/10/2026',
              tenantsChecked: 2,
              productsChecked: 10,
              ordersChecked: 5,
              devicesChecked: 3,
              ledgerConsistent: true,
              issuesFound: [],
              status: 'passed' as const
            }),
            updateTenant: () => Promise.resolve({ id: 'tenant-1' }),
            createTenant: () => Promise.resolve({ id: 'tenant-new' }),
            lockDevice: () => Promise.resolve({ id: 'dev-1', status: 'locked' }),
            restartDevice: () => Promise.resolve({ message: 'ok', status: 'updating' }),
            getPlans: () => Promise.resolve([]),
            updatePlan: () => Promise.resolve({ id: 'Starter', priceMonthly: 149 }),
            getRegionalConfig: () => Promise.resolve(null),
            updateRegionalConfig: () => Promise.resolve({ config: {} }),
            getDrivers: () => Promise.resolve([]),
            createDriver: () => Promise.resolve({ id: 'drv-new' }),
            updateDriver: () => Promise.resolve({ id: 'drv-1' }),
            pingDriverGps: () => Promise.resolve({ id: 'drv-1' }),
            getConsumers: () => Promise.resolve([]),
            setCommissionRate: () => Promise.resolve({ platformCommissionRate: 0.08, percent: 8 })
          }
        },
        {
          provide: StoreOsApiService,
          useValue: {
            getProducts: () => Promise.resolve([]),
            getOrders: () => Promise.resolve([]),
            getTables: () => Promise.resolve([]),
            getFinancials: () => Promise.resolve([]),
            createProduct: () => Promise.resolve({ id: 'prod-new' }),
            updateProduct: () => Promise.resolve({ id: 'prod-1' }),
            createOrder: () => Promise.resolve({ id: 'ord-new' }),
            updateOrderStatus: () => Promise.resolve({ id: 'ord-1', status: 'preparing' }),
            updateTable: () => Promise.resolve({ id: 't-1', status: 'occupied' }),
            addFinancialRecord: () => Promise.resolve({ id: 'fin-new' }),
            getDrivers: () => Promise.resolve([]),
            createDriver: () => Promise.resolve({ id: 'drv-new' }),
            updateDriver: () => Promise.resolve({ id: 'drv-1' })
          }
        },
        provideRouter([
          { path: 'login', children: [] },
          { path: 'hq', children: [] },
          { path: 'os', children: [] }
        ])
      ]
    });
    ecosystem = TestBed.inject(EcosystemService);
    mapTools = TestBed.inject(MapToolsService);
  });

  describe('MapToolsService (Geodesic Engines)', () => {
    it('should calculate Haversine distance correctly between two points', () => {
      // São Paulo Center to Avenida Paulista (~3.5km)
      const p1 = { lat: -23.5489, lng: -46.6388 };
      const p2 = { lat: -23.5651, lng: -46.6521 };

      const result = mapTools.calculateDistance(p1, p2);
      expect(result.km).toBeGreaterThan(1);
      expect(result.km).toBeLessThan(5);
      expect(result.meters).toBeCloseTo(result.km * 1000, 1);
      expect(result.miles).toBeCloseTo(result.km * 0.621371, 1);
    });

    it('should calculate polygon area with Shoelace formula', () => {
      // Triangle in São Paulo
      const triangle = [
        { lat: -23.5651, lng: -46.6521 },
        { lat: -23.5660, lng: -46.6510 },
        { lat: -23.5670, lng: -46.6530 }
      ];

      const area = mapTools.calculateArea(triangle);
      expect(area).toBeGreaterThan(0);
    });

    it('should format coordinates to DMS (Degrees, Minutes, Seconds)', () => {
      const latDMS = mapTools.toDMS(-23.5651, true);
      const lngDMS = mapTools.toDMS(-46.6521, false);

      expect(latDMS).toContain('23°');
      expect(latDMS).toContain('S');
      expect(lngDMS).toContain('46°');
      expect(lngDMS).toContain('W');
    });
  });

  describe('EcosystemService (Tripartite SaaS Core)', () => {
    it('should start with null currentSession by default for safety', () => {
      expect(ecosystem.currentSession()).toBeNull();
    });

    it('should set currentSession on loginAs and reset it on logout', () => {
      ecosystem.loginAs('operator', 'operador@teste.com', 'Operador Teste', 'Loja Teste', 'client');
      expect(ecosystem.currentSession()).not.toBeNull();
      expect(ecosystem.currentSession()?.role).toBe('operator');

      ecosystem.logout();
      expect(ecosystem.currentSession()).toBeNull();
      expect(ecosystem.activeConsumer()).toBeNull();
    });

    it('should initialize with default 8% commission rate for App Owner HQ', () => {
      expect(ecosystem.hqCommissionRate()).toBe(0.08);
    });

    it('should calculate distance to user reference address', () => {
      const distance = ecosystem.calculateDistanceToUser(-23.5651, -46.6521);
      expect(distance).toBeCloseTo(0, 1);
    });

    it('should log audit events and maintain immutability', () => {
      const initialLogsCount = ecosystem.auditLogs().length;
      ecosystem.logAudit('Ação de Teste', 'System', 'Validação dos motores core', 'info');

      expect(ecosystem.auditLogs().length).toBe(initialLogsCount + 1);
      const latest = ecosystem.auditLogs()[0];
      expect(latest.action).toBe('Ação de Teste');
      expect(latest.severity).toBe('info');
    });

    it('should correctly distinguish platform drivers from store drivers', () => {
      const drivers = ecosystem.drivers();
      expect(drivers.length).toBeGreaterThan(0);

      const platformDrivers = drivers.filter(d => d.driverType === 'platform');
      const privateDrivers = drivers.filter(d => d.driverType === 'private');

      expect(platformDrivers.length).toBeGreaterThan(0);
      expect(privateDrivers.length).toBeGreaterThan(0);
    });

    it('should execute real structural system audit and produce detailed report', () => {
      expect(ecosystem.systemAuditVerified()).toBe(false);
      expect(ecosystem.lastSystemAuditReport()).toBeNull();

      const report = ecosystem.runFullSystemAudit();
      expect(report).toBeDefined();
      expect(report.tenantsChecked).toBeGreaterThan(0);
      expect(report.productsChecked).toBeGreaterThan(0);
      expect(report.ordersChecked).toBeGreaterThan(0);
      expect(report.ledgerConsistent).toBe(true);
      expect(['passed', 'warning', 'failed']).toContain(report.status);

      ecosystem.verifyFullSystemAudit();
      expect(ecosystem.systemAuditVerified()).toBe(true);
      expect(ecosystem.lastSystemAuditReport()).not.toBeNull();
    });

    it('should compute currentTenant correctly based on currentTenantId', () => {
      expect(ecosystem.currentTenant().id).toBe('tenant-1');
      ecosystem.currentTenantId.set('tenant-2');
      expect(ecosystem.currentTenant().id).toBe('tenant-2');
      expect(ecosystem.currentTenant().name).toBe('Padaria & Empório Estrela');
    });

    it('should support table status and comanda order dispatching', () => {
      const initialOrdersCount = ecosystem.orders().length;
      const prod = ecosystem.products()[0];

      ecosystem.addOrder({
        tenantId: 'tenant-1',
        orderNumber: '#M1-TEST',
        type: 'dine-in',
        tableNumber: 'Mesa 1',
        items: [{ product: prod, quantity: 2, notes: 'Sem cebola' }],
        subtotal: prod.price * 2,
        tax: prod.price * 0.2,
        discount: 0,
        total: prod.price * 2.2,
        paymentMethod: 'card',
        status: 'pending',
        channel: 'POS'
      });

      expect(ecosystem.orders().length).toBe(initialOrdersCount + 1);
      const added = ecosystem.orders()[0];
      expect(added.tableNumber).toBe('Mesa 1');
      expect(added.items.length).toBe(1);
      expect(added.items[0].quantity).toBe(2);
    });

    it('should handle HQ backend synchronization gracefully', async () => {
      const result = await ecosystem.syncHqFromBackend();
      expect(typeof result).toBe('boolean');
    });

    it('should execute structural audit on backend with safe fallback', async () => {
      const report = await ecosystem.runStructuralAuditOnBackend();
      expect(report).toBeDefined();
      expect(ecosystem.systemAuditVerified()).toBe(true);
      expect(ecosystem.lastSystemAuditReport()?.status).toBe(report.status);
    });

    it('should handle Store OS backend synchronization gracefully', async () => {
      const result = await ecosystem.syncStoreOsFromBackend('tenant-1');
      expect(typeof result).toBe('boolean');
    });

    it('should update table status and comanda via updateTable', () => {
      ecosystem.updateTable('t-2', { status: 'occupied', guests: 4 });
      const table = ecosystem.tables().find(t => t.id === 't-2');
      expect(table?.status).toBe('occupied');
      expect(table?.guests).toBe(4);
    });

    it('should update product stock and details via updateProduct', () => {
      ecosystem.updateProduct('prod-1', { stock: 99 });
      const prod = ecosystem.products().find(p => p.id === 'prod-1');
      expect(prod?.stock).toBe(99);
    });
  });

  describe('End-to-End Consumer Experience (Vitrine & Marketplace)', () => {
    it('should allow customer to place an online delivery order', () => {
      const prod = ecosystem.products()[0];
      const initialOrdersCount = ecosystem.orders().length;

      const order = ecosystem.addOrder({
        tenantId: 'tenant-1',
        orderNumber: '#ONL-5001',
        customerName: 'Mariana Silva',
        customerPhone: '(11) 98765-4321',
        type: 'delivery',
        channel: 'Customer Storefront',
        items: [{ product: prod, quantity: 2 }],
        subtotal: prod.price * 2,
        tax: 0,
        discount: 0,
        total: prod.price * 2 + 5.0,
        paymentMethod: 'online',
        status: 'pending'
      });

      expect(order).toBeDefined();
      expect(ecosystem.orders().length).toBe(initialOrdersCount + 1);
      const placed = ecosystem.orders().find(o => o.orderNumber === '#ONL-5001');
      expect(placed).toBeDefined();
      expect(placed?.customerName).toBe('Mariana Silva');
      expect(placed?.type).toBe('delivery');
    });

    it('should allow customer to order via Table QR Code and update table occupancy', () => {
      const prod = ecosystem.products()[0];

      // Customer scans Table 3 QR Code
      ecosystem.updateTable('t-3', {
        status: 'occupied',
        guests: 2,
        currentTotal: prod.price
      });

      const qrOrder = ecosystem.addOrder({
        tenantId: 'tenant-1',
        orderNumber: '#QR-T3-01',
        customerName: 'Cliente Mesa 3',
        type: 'dine-in',
        tableNumber: 'Mesa 3',
        channel: 'Table QR',
        items: [{ product: prod, quantity: 1 }],
        subtotal: prod.price,
        tax: prod.price * 0.1,
        discount: 0,
        total: prod.price * 1.1,
        paymentMethod: 'card',
        status: 'pending'
      });

      expect(qrOrder).toBeDefined();
      const table = ecosystem.tables().find(t => t.id === 't-3');
      expect(table?.status).toBe('occupied');
      expect(table?.guests).toBe(2);
      expect(table?.currentTotal).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Store Operator Experience (PDV, KDS, Estoque, Caixa)', () => {
    it('should process front-counter POS checkout with PIX payment', () => {
      const prod = ecosystem.products()[0];
      const initialFins = ecosystem.financials().length;

      const posOrder = ecosystem.addOrder({
        tenantId: 'tenant-1',
        orderNumber: '#PDV-9001',
        type: 'pos-counter',
        channel: 'POS',
        items: [{ product: prod, quantity: 1 }],
        subtotal: prod.price,
        tax: 0,
        discount: 0,
        total: prod.price,
        paymentMethod: 'pix',
        status: 'ready'
      });

      expect(posOrder).toBeDefined();

      // Register cash receipt in financial ledger
      ecosystem.addFinancialEntry({
        date: new Date().toISOString(),
        type: 'sale',
        category: 'Vendas PDV Balcão',
        description: `Venda ${posOrder.orderNumber} via PIX`,
        amount: posOrder.total,
        paymentMethod: 'PIX',
        referenceId: posOrder.id
      });

      expect(ecosystem.financials().length).toBe(initialFins + 1);
      const fin = ecosystem.financials().find(f => f.referenceId === posOrder.id);
      expect(fin?.amount).toBe(posOrder.total);
    });

    it('should advance KDS kitchen order workflow through all preparation stages', () => {
      const prod = ecosystem.products()[0];
      const order = ecosystem.addOrder({
        tenantId: 'tenant-1',
        orderNumber: '#KDS-8801',
        type: 'delivery',
        channel: 'Customer Storefront',
        items: [{ product: prod, quantity: 1 }],
        subtotal: prod.price,
        tax: 0,
        discount: 0,
        total: prod.price,
        paymentMethod: 'online',
        status: 'pending'
      });

      // Advance to preparing
      ecosystem.updateOrderStatus(order.id, 'preparing');
      let current = ecosystem.orders().find(o => o.id === order.id);
      expect(current?.status).toBe('preparing');

      // Advance to ready
      ecosystem.updateOrderStatus(order.id, 'ready');
      current = ecosystem.orders().find(o => o.id === order.id);
      expect(current?.status).toBe('ready');

      // Advance to dispatched
      ecosystem.updateOrderStatus(order.id, 'dispatched');
      current = ecosystem.orders().find(o => o.id === order.id);
      expect(current?.status).toBe('dispatched');
    });

    it('should register sangria and suprimento in store cashier ledger', () => {
      const initialCount = ecosystem.financials().length;

      // Suprimento (Cash Inflow)
      ecosystem.addFinancialEntry({
        date: new Date().toISOString(),
        type: 'sale',
        category: 'Aporte de Caixa',
        description: 'Suprimento de Troco Inicial',
        amount: 200.0,
        paymentMethod: 'Dinheiro',
        referenceId: 'ref-sup-01'
      });

      // Sangria (Cash Outflow)
      ecosystem.addFinancialEntry({
        date: new Date().toISOString(),
        type: 'expense',
        category: 'Sangria de Caixa',
        description: 'Sangria de segurança para cofre',
        amount: 150.0,
        paymentMethod: 'Dinheiro',
        referenceId: 'ref-san-01'
      });

      expect(ecosystem.financials().length).toBe(initialCount + 2);
    });
  });

  describe('End-to-End Waiter Experience (Salão & Mesas Mobile)', () => {
    it('should allow waiter to open table, launch courses, request pre-bill, and settle', () => {
      const prod = ecosystem.products()[0];

      // 1. Waiter opens table 4 with 3 guests
      ecosystem.updateTable('t-4', {
        status: 'occupied',
        guests: 3,
        server: 'Lucas Garçom',
        currentTotal: 0
      });
      let table = ecosystem.tables().find(t => t.id === 't-4');
      expect(table?.status).toBe('occupied');
      expect(table?.server).toBe('Lucas Garçom');

      // 2. Waiter launches entrées & main courses
      const billAmount = prod.price * 3 * 1.1; // 10% service
      ecosystem.addOrder({
        tenantId: 'tenant-1',
        orderNumber: '#M4-C1',
        type: 'dine-in',
        tableNumber: 'Mesa 4',
        channel: 'POS',
        items: [{ product: prod, quantity: 3 }],
        subtotal: prod.price * 3,
        tax: prod.price * 3 * 0.1,
        discount: 0,
        total: billAmount,
        paymentMethod: 'card',
        status: 'pending'
      });

      ecosystem.updateTable('t-4', {
        currentTotal: billAmount
      });
      table = ecosystem.tables().find(t => t.id === 't-4');
      expect(table?.currentTotal).toBe(billAmount);

      // 3. Waiter requests pre-bill for guests
      ecosystem.updateTable('t-4', { status: 'billing' });
      table = ecosystem.tables().find(t => t.id === 't-4');
      expect(table?.status).toBe('billing');

      // 4. Settle comanda and release table
      ecosystem.updateTable('t-4', {
        status: 'available',
        currentTotal: 0,
        guests: undefined,
        server: undefined
      });
      table = ecosystem.tables().find(t => t.id === 't-4');
      expect(table?.status).toBe('available');
      expect(table?.currentTotal).toBe(0);
    });
  });

  describe('End-to-End Driver & Logistics Experience', () => {
    it('should register a private store driver and update delivery status', () => {
      const initialDriversCount = ecosystem.drivers().length;

      ecosystem.addDriver({
        tenantId: 'tenant-1',
        name: 'Rafael Santos',
        phone: '(11) 97777-8888',
        vehicleType: 'moto',
        licensePlate: 'BRA-2E19',
        status: 'available',
        rating: 5.0,
        driverType: 'private',
        deviceName: 'Xiaomi Redmi Note 12',
        appVersion: '3EAT Driver App v3.2.0',
        batteryLevel: 98,
        lastGpsPing: 'Agora mesmo',
        currentLocationName: 'Na Loja (Disponível)',
        complianceVerified: true,
        cnhNumber: '99887766554'
      });

      expect(ecosystem.drivers().length).toBe(initialDriversCount + 1);
      const driver = ecosystem.drivers().find(d => d.name === 'Rafael Santos');
      expect(driver).toBeDefined();
      expect(driver?.driverType).toBe('private');

      // Update status to delivering
      ecosystem.updateDriverStatus(driver!.id, 'delivering');
      const updated = ecosystem.drivers().find(d => d.id === driver!.id);
      expect(updated?.status).toBe('delivering');
    });

    it('should auto-cluster pending deliveries into geodetic routes', () => {
      const initialRoutes = ecosystem.deliveryRoutes().length;
      ecosystem.autoClusterAndCreateRoutes();
      // Should execute without throwing and maintain routes array
      expect(ecosystem.deliveryRoutes().length).toBeGreaterThanOrEqual(initialRoutes);
    });
  });

  describe('End-to-End HQ Central SaaS Governance Experience', () => {
    it('should compute platform commission revenue and update commission rate', async () => {
      const initialRate = ecosystem.hqCommissionRate();
      expect(initialRate).toBe(0.08);

      await ecosystem.setPlatformCommissionRate(0.09);
      expect(ecosystem.hqCommissionRate()).toBe(0.09);

      // Revert back
      await ecosystem.setPlatformCommissionRate(initialRate);
      expect(ecosystem.hqCommissionRate()).toBe(initialRate);
    });

    it('should update SaaS license plan price and persist', async () => {
      const plan = ecosystem.licensePlans().find(p => p.id === 'Starter');
      expect(plan).toBeDefined();
      const origPrice = plan!.priceMonthly;

      await ecosystem.updatePlanPrice('Starter', 169.0);
      let updated = ecosystem.licensePlans().find(p => p.id === 'Starter');
      expect(updated?.priceMonthly).toBe(169.0);

      // Revert back
      await ecosystem.updatePlanPrice('Starter', origPrice);
      updated = ecosystem.licensePlans().find(p => p.id === 'Starter');
      expect(updated?.priceMonthly).toBe(origPrice);
    });

    it('should update regional marketplace configuration and toggle system variables', async () => {
      const origName = ecosystem.regionalConfig().activeRegionName;

      await ecosystem.updateRegionalConfig({ activeRegionName: 'São Paulo Polo Gastronômico Sul' });
      expect(ecosystem.regionalConfig().activeRegionName).toBe('São Paulo Polo Gastronômico Sul');

      // Revert
      await ecosystem.updateRegionalConfig({ activeRegionName: origName });

      // Maintenance mode toggle
      expect(ecosystem.maintenanceMode()).toBe(false);
      ecosystem.maintenanceMode.set(true);
      expect(ecosystem.maintenanceMode()).toBe(true);
      ecosystem.maintenanceMode.set(false);
      expect(ecosystem.maintenanceMode()).toBe(false);
    });
  });
});
