import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { EcosystemService } from './ecosystem.service';
import { MapToolsService } from './map-tools.service';
import { HqApiService } from './hq-api.service';

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
            restartDevice: () => Promise.resolve({ message: 'ok', status: 'updating' })
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
  });
});
