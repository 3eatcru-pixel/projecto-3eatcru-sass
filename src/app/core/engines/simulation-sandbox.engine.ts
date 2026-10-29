import { Injectable, signal, inject } from '@angular/core';
import { CompanyTenant, OrderTransaction, ProductItem, SimulationScenarioConfig, StoreDriver, SystemExecutionMode } from '../../models/ecosystem.model';
import { FinancialCoreEngine } from './financial-core.engine';
import { LogisticsCoreEngine } from './logistics-core.engine';

@Injectable({
  providedIn: 'root'
})
export class SimulationSandboxEngine {
  private readonly financialEngine = inject(FinancialCoreEngine);
  private readonly logisticsEngine = inject(LogisticsCoreEngine);

  // Active execution mode: 'simulation' (Sandbox - Defaulting per user directive as real is not ready) or 'real'
  readonly activeExecutionMode = signal<SystemExecutionMode>('simulation');

  // Simulation scenario config
  readonly scenarioConfig = signal<SimulationScenarioConfig>({
    demandMultiplier: 1.5,
    trafficDelayMinutes: 5,
    simulatedCancelRatePercent: 2,
    hqCommissionOverridePercent: 10
  });

  // Simulated data state (strictly isolated from real production data)
  readonly simulatedOrders = signal<OrderTransaction[]>([]);
  readonly simulatedMetrics = signal<{ totalRevenue: number; totalHqCommission: number; orderCount: number }>({
    totalRevenue: 0,
    totalHqCommission: 0,
    orderCount: 0
  });

  toggleExecutionMode() {
    const newMode: SystemExecutionMode = this.activeExecutionMode() === 'real' ? 'simulation' : 'real';
    this.activeExecutionMode.set(newMode);
    return newMode;
  }

  setExecutionMode(mode: SystemExecutionMode) {
    this.activeExecutionMode.set(mode);
  }

  /**
   * Generates a batch of simulated orders for sandbox stress testing without polluting production ledger.
   */
  generateSimulatedBatch(tenant: CompanyTenant, products: ProductItem[], driverList: StoreDriver[], count = 5) {
    const newSimulatedOrders: OrderTransaction[] = [];
    let addedRevenue = 0;
    let addedCommission = 0;

    for (let i = 0; i < count; i++) {
      const orderNum = Math.floor(8000 + Math.random() * 1900);
      const fallbackProd: ProductItem = {
        id: 'p-sim',
        name: 'Item Simulado',
        category: 'Geral',
        price: 35.00,
        costPrice: 15.00,
        stock: 100,
        minStock: 10,
        barcode: '7890000000',
        sku: 'SIM-01',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
        availableOnline: true,
        description: 'Item de teste para simulação'
      };

      const randomProduct = products[Math.floor(Math.random() * products.length)] || fallbackProd;
      const qty = Math.floor(1 + Math.random() * 3);
      const total = Number((randomProduct.price * qty).toFixed(2));

      const simOrder: OrderTransaction = {
        id: `sim-ord-${Date.now()}-${i}`,
        tenantId: tenant.id,
        orderNumber: `${orderNum}-SIM`,
        type: 'delivery',
        customerName: `Cliente Simulado #${i + 1}`,
        customerPhone: '+55 11 99999-0000',
        items: [{
          product: randomProduct,
          quantity: qty
        }],
        subtotal: total,
        tax: 0,
        discount: 0,
        total,
        status: 'completed',
        paymentMethod: Math.random() > 0.5 ? 'pix' : 'card',
        createdAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        channel: 'Online Marketplace',
        isSimulated: true,
        mode: 'simulation'
      };

      const finSplit = this.financialEngine.processOrderFinancialSplit(simOrder, tenant, 'simulation');
      addedRevenue += finSplit.grossTotal;
      addedCommission += finSplit.hqCommissionFee;

      newSimulatedOrders.push(simOrder);
    }

    this.simulatedOrders.update(list => [...newSimulatedOrders, ...list]);
    this.simulatedMetrics.update(prev => ({
      totalRevenue: Number((prev.totalRevenue + addedRevenue).toFixed(2)),
      totalHqCommission: Number((prev.totalHqCommission + addedCommission).toFixed(2)),
      orderCount: prev.orderCount + count
    }));

    return newSimulatedOrders;
  }

  /**
   * Resets simulation sandbox data.
   */
  clearSimulationData() {
    this.simulatedOrders.set([]);
    this.simulatedMetrics.set({ totalRevenue: 0, totalHqCommission: 0, orderCount: 0 });
  }
}
