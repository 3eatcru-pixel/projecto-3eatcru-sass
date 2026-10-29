import { Injectable } from '@angular/core';
import { CompanyTenant, FinancialRecord, OrderTransaction, SystemExecutionMode } from '../../models/ecosystem.model';

export interface FinancialSplitResult {
  grossTotal: number;
  hqCommissionFee: number;
  merchantNetPayout: number;
  taxWithholding: number;
  ledgerRecord: FinancialRecord;
}

@Injectable({
  providedIn: 'root'
})
export class FinancialCoreEngine {

  /**
   * Calculates exact financial split for an order transaction.
   * Real Mode creates permanent fiscal records.
   * Simulation Mode tags record as simulated without polluting real fiscal audit logs.
   */
  processOrderFinancialSplit(
    order: OrderTransaction,
    tenant: CompanyTenant,
    mode: SystemExecutionMode = 'real'
  ): FinancialSplitResult {
    const grossTotal = order.total;
    const commissionPercent = tenant.serviceFeePercent ?? 10;
    const hqCommissionFee = Number((grossTotal * (commissionPercent / 100)).toFixed(2));
    const taxWithholding = Number((grossTotal * 0.02).toFixed(2)); // 2% ISS retention estimate
    const merchantNetPayout = Number((grossTotal - hqCommissionFee - taxWithholding).toFixed(2));

    const isSim = mode === 'simulation';
    order.isSimulated = isSim;
    order.mode = mode;

    const ledgerRecord: FinancialRecord = {
      id: `fin-${mode}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'sale',
      category: 'Venda Balcão / Delivery',
      amount: grossTotal,
      description: `[MOTORE-CORE][${mode.toUpperCase()}] Venda Pedido #${order.orderNumber} (${order.paymentMethod.toUpperCase()})`,
      date: new Date().toISOString().split('T')[0],
      paymentMethod: order.paymentMethod,
      referenceId: order.id,
      isSimulated: isSim,
      mode: mode
    };

    return {
      grossTotal,
      hqCommissionFee,
      merchantNetPayout,
      taxWithholding,
      ledgerRecord
    };
  }

  /**
   * Forecasts what-if financial metrics for a store under various demand scenarios.
   */
  calculateFinancialForecast(
    currentMonthlyRevenue: number,
    commissionRate: number,
    projectedGrowthPercent: number
  ) {
    const projectedRevenue = currentMonthlyRevenue * (1 + projectedGrowthPercent / 100);
    const projectedHqCommission = projectedRevenue * (commissionRate / 100);
    const projectedMerchantNet = projectedRevenue - projectedHqCommission;

    return {
      currentMonthlyRevenue,
      projectedRevenue,
      projectedHqCommission,
      projectedMerchantNet,
      growthMargin: projectedRevenue - currentMonthlyRevenue
    };
  }
}
