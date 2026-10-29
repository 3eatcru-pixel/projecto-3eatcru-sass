import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ProductItem, OrderTransaction, TableInfo, FinancialRecord, CompanyTenant, StoreDriver } from '../models/ecosystem.model';

@Injectable({
  providedIn: 'root'
})
export class StoreOsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api';

  // 1. Products & Inventory ERP
  async getProducts(tenantId?: string): Promise<ProductItem[]> {
    const url = tenantId
      ? `${this.baseUrl}/products?tenantId=${encodeURIComponent(tenantId)}`
      : `${this.baseUrl}/products`;
    return firstValueFrom(this.http.get<ProductItem[]>(url));
  }

  async createProduct(product: Partial<ProductItem>): Promise<ProductItem> {
    return firstValueFrom(this.http.post<ProductItem>(`${this.baseUrl}/products`, product));
  }

  async updateProduct(id: string, updates: Partial<ProductItem>): Promise<ProductItem> {
    return firstValueFrom(this.http.patch<ProductItem>(`${this.baseUrl}/products/${id}`, updates));
  }

  // 2. Orders Workflow & Kitchen KDS
  async getOrders(tenantId?: string): Promise<OrderTransaction[]> {
    const url = tenantId
      ? `${this.baseUrl}/orders?tenantId=${encodeURIComponent(tenantId)}`
      : `${this.baseUrl}/orders`;
    return firstValueFrom(this.http.get<OrderTransaction[]>(url));
  }

  async createOrder(order: Partial<OrderTransaction>): Promise<OrderTransaction> {
    return firstValueFrom(this.http.post<OrderTransaction>(`${this.baseUrl}/orders`, order));
  }

  async updateOrderStatus(orderId: string, status: OrderTransaction['status']): Promise<OrderTransaction> {
    return firstValueFrom(this.http.patch<OrderTransaction>(`${this.baseUrl}/orders/${orderId}/status`, { status }));
  }

  // 3. Tables & Dine-in Comandas
  async getTables(): Promise<TableInfo[]> {
    return firstValueFrom(this.http.get<TableInfo[]>(`${this.baseUrl}/tables`));
  }

  async updateTable(id: string, updates: Partial<TableInfo>): Promise<TableInfo> {
    return firstValueFrom(this.http.patch<TableInfo>(`${this.baseUrl}/tables/${id}`, updates));
  }

  // 4. Store Financial Ledger & Cash Operations
  async getFinancials(type?: string): Promise<FinancialRecord[]> {
    const url = type
      ? `${this.baseUrl}/financials?type=${encodeURIComponent(type)}`
      : `${this.baseUrl}/financials`;
    return firstValueFrom(this.http.get<FinancialRecord[]>(url));
  }

  async addFinancialRecord(record: Partial<FinancialRecord>): Promise<FinancialRecord> {
    return firstValueFrom(this.http.post<FinancialRecord>(`${this.baseUrl}/financials`, record));
  }

  // 5. Store Customization & Branch Profile
  async updateStoreSettings(tenantId: string, updates: Partial<CompanyTenant>): Promise<CompanyTenant> {
    return firstValueFrom(this.http.patch<CompanyTenant>(`${this.baseUrl}/tenants/${tenantId}`, updates));
  }

  // 6. Store Drivers Fleet
  async getDrivers(): Promise<StoreDriver[]> {
    return firstValueFrom(this.http.get<StoreDriver[]>(`${this.baseUrl}/hq/drivers`));
  }

  async createDriver(driver: Partial<StoreDriver>): Promise<StoreDriver> {
    return firstValueFrom(this.http.post<StoreDriver>(`${this.baseUrl}/hq/drivers`, driver));
  }

  async updateDriver(driverId: string, updates: Partial<StoreDriver>): Promise<StoreDriver> {
    return firstValueFrom(this.http.patch<StoreDriver>(`${this.baseUrl}/hq/drivers/${driverId}`, updates));
  }
}
