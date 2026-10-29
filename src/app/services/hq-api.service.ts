import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CompanyTenant, POSDevice, AuditLog, SystemAuditReport } from '../models/ecosystem.model';

export interface HqOverviewResponse {
  tenantsCount: number;
  activeTenantsCount: number;
  totalDevices: number;
  onlineDevices: number;
  totalOrders: number;
  grossPlatformVolume: number;
  hqCommissionRevenue: number;
  defaultCommissionPercent: number;
  maintenanceMode: boolean;
  globalBroadcastMessage: string | null;
  serverUptimeSeconds: number;
  timestamp: string;
}

export interface HqLedgerEntry {
  orderId: string;
  orderNumber: string;
  tenantId: string;
  channel: string;
  date: string;
  orderTotal: number;
  platformFeeRate: string;
  platformFeeAmount: number;
  storeNetAmount: number;
}

export interface HqLedgerResponse {
  totalPlatformFees: number;
  platformSplitPercent: number;
  recordsCount: number;
  entries: HqLedgerEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class HqApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // 1. Overview & SaaS Metrics
  async getOverview(): Promise<HqOverviewResponse> {
    return firstValueFrom(this.http.get<HqOverviewResponse>(`${this.baseUrl}/hq/overview`));
  }

  // 2. MDM Devices Fleet
  async getDevices(tenantId?: string): Promise<POSDevice[]> {
    const url = tenantId && tenantId !== 'all'
      ? `${this.baseUrl}/hq/devices?tenantId=${encodeURIComponent(tenantId)}`
      : `${this.baseUrl}/hq/devices`;
    return firstValueFrom(this.http.get<POSDevice[]>(url));
  }

  async pairDevice(device: {
    tenantId: string;
    deviceName: string;
    serialNumber: string;
    type?: string;
    location?: string;
    ipAddress?: string;
    macAddress?: string;
  }): Promise<POSDevice> {
    return firstValueFrom(this.http.post<POSDevice>(`${this.baseUrl}/hq/devices`, device));
  }

  async lockDevice(deviceId: string): Promise<POSDevice> {
    return firstValueFrom(this.http.post<POSDevice>(`${this.baseUrl}/hq/devices/${deviceId}/lock`, {}));
  }

  async restartDevice(deviceId: string): Promise<{ message: string; status: string }> {
    return firstValueFrom(this.http.post<{ message: string; status: string }>(`${this.baseUrl}/hq/devices/${deviceId}/restart`, {}));
  }

  // 3. Audit Trail & Verification
  async getAuditLogs(severity?: string): Promise<AuditLog[]> {
    const url = severity
      ? `${this.baseUrl}/hq/audit?severity=${encodeURIComponent(severity)}`
      : `${this.baseUrl}/hq/audit`;
    return firstValueFrom(this.http.get<AuditLog[]>(url));
  }

  async runAudit(): Promise<SystemAuditReport> {
    return firstValueFrom(this.http.post<SystemAuditReport>(`${this.baseUrl}/hq/audit/run`, {}));
  }

  // 4. System Governance (Broadcast & Maintenance)
  async setBroadcast(message: string | null): Promise<{ globalBroadcastMessage: string | null }> {
    return firstValueFrom(this.http.post<{ globalBroadcastMessage: string | null }>(`${this.baseUrl}/hq/system/broadcast`, { message }));
  }

  async setMaintenance(enabled?: boolean): Promise<{ maintenanceMode: boolean }> {
    return firstValueFrom(this.http.post<{ maintenanceMode: boolean }>(`${this.baseUrl}/hq/system/maintenance`, { enabled }));
  }

  // 5. Consolidated SaaS Ledger (8% split)
  async getLedger(): Promise<HqLedgerResponse> {
    return firstValueFrom(this.http.get<HqLedgerResponse>(`${this.baseUrl}/hq/ledger`));
  }

  // 6. Tenants Governance
  async getTenants(): Promise<CompanyTenant[]> {
    return firstValueFrom(this.http.get<CompanyTenant[]>(`${this.baseUrl}/tenants`));
  }

  async createTenant(tenant: Partial<CompanyTenant>): Promise<CompanyTenant> {
    return firstValueFrom(this.http.post<CompanyTenant>(`${this.baseUrl}/tenants`, tenant));
  }

  async updateTenant(tenantId: string, updates: Partial<CompanyTenant>): Promise<CompanyTenant> {
    return firstValueFrom(this.http.patch<CompanyTenant>(`${this.baseUrl}/tenants/${tenantId}`, updates));
  }
}
