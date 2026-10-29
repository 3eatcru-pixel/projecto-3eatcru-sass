import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HqApiService } from './hq-api.service';

describe('HqApiService (HQ Central Dedicated Backend API)', () => {
  let service: HqApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HqApiService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(HqApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch overview SaaS metrics', async () => {
    const mockOverview = {
      tenantsCount: 3,
      activeTenantsCount: 3,
      totalDevices: 4,
      onlineDevices: 4,
      totalOrders: 20,
      grossPlatformVolume: 1250.0,
      hqCommissionRevenue: 100.0,
      defaultCommissionPercent: 8,
      maintenanceMode: false,
      globalBroadcastMessage: null,
      serverUptimeSeconds: 120,
      timestamp: '2026-10-29T12:00:00.000Z'
    };

    const promise = service.getOverview();
    const req = httpMock.expectOne('/api/hq/overview');
    expect(req.request.method).toBe('GET');
    req.flush(mockOverview);

    const data = await promise;
    expect(data.tenantsCount).toBe(3);
    expect(data.hqCommissionRevenue).toBe(100.0);
  });

  it('should list MDM devices with or without tenant filter', async () => {
    const mockDevices = [
      { id: 'dev-1', tenantId: 'tenant-1', deviceName: 'PDV 1', status: 'online' }
    ];

    const promise = service.getDevices('tenant-1');
    const req = httpMock.expectOne('/api/hq/devices?tenantId=tenant-1');
    expect(req.request.method).toBe('GET');
    req.flush(mockDevices);

    const devices = await promise;
    expect(devices.length).toBe(1);
    expect(devices[0].deviceName).toBe('PDV 1');
  });

  it('should send lock command to device', async () => {
    const promise = service.lockDevice('dev-1');
    const req = httpMock.expectOne('/api/hq/devices/dev-1/lock');
    expect(req.request.method).toBe('POST');
    req.flush({ id: 'dev-1', status: 'locked' });

    const result = await promise;
    expect(result.status).toBe('locked');
  });

  it('should send restart command to device', async () => {
    const promise = service.restartDevice('dev-1');
    const req = httpMock.expectOne('/api/hq/devices/dev-1/restart');
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Reboot command dispatched', status: 'updating' });

    const result = await promise;
    expect(result.status).toBe('updating');
  });

  it('should execute platform structural audit', async () => {
    const mockReport = {
      timestamp: '29/10/2026 12:00:00',
      tenantsChecked: 2,
      productsChecked: 10,
      ordersChecked: 5,
      devicesChecked: 3,
      ledgerConsistent: true,
      issuesFound: [],
      status: 'passed' as const
    };

    const promise = service.runAudit();
    const req = httpMock.expectOne('/api/hq/audit/run');
    expect(req.request.method).toBe('POST');
    req.flush(mockReport);

    const report = await promise;
    expect(report.status).toBe('passed');
    expect(report.ledgerConsistent).toBe(true);
  });

  it('should update tenant governance settings via PATCH', async () => {
    const promise = service.updateTenant('tenant-1', { serviceFeePercent: 8.5 });
    const req = httpMock.expectOne('/api/tenants/tenant-1');
    expect(req.request.method).toBe('PATCH');
    req.flush({ id: 'tenant-1', serviceFeePercent: 8.5 });

    const updated = await promise;
    expect(updated.serviceFeePercent).toBe(8.5);
  });
});
