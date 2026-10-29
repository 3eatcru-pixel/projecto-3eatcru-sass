import { Injectable, inject } from '@angular/core';
import { CompanyTenant, OrderTransaction, ProductItem, SystemExecutionMode } from '../../models/ecosystem.model';
import { FinancialCoreEngine } from './financial-core.engine';
import { InventoryCoreEngine } from './inventory-core.engine';

@Injectable({
  providedIn: 'root'
})
export class OrderWorkflowCoreEngine {
  private readonly financialEngine = inject(FinancialCoreEngine);
  private readonly inventoryEngine = inject(InventoryCoreEngine);

  /**
   * Processes transition of order state along canonical pipeline:
   * pending -> preparing -> ready -> dispatched -> delivered / completed
   */
  advanceOrderStatus(
    order: OrderTransaction,
    newStatus: OrderTransaction['status'],
    tenant: CompanyTenant,
    products: ProductItem[],
    mode: SystemExecutionMode = 'real'
  ) {
    const updatedOrder: OrderTransaction = {
      ...order,
      status: newStatus
    };

    let updatedProducts = products;
    let financialSplitResult = null;

    // Deduct stock when order transitions to preparing
    if (newStatus === 'preparing' && order.status === 'pending') {
      const orderItems = order.items.map(i => ({ productId: i.product.id, quantity: i.quantity }));
      const invResult = this.inventoryEngine.processStockDeduction(products, orderItems, mode);
      updatedProducts = invResult.updatedProducts;
    }

    // Process financial split when order is completed or delivered
    if (newStatus === 'completed' || newStatus === 'delivered') {
      financialSplitResult = this.financialEngine.processOrderFinancialSplit(updatedOrder, tenant, mode);
    }

    return {
      order: updatedOrder,
      updatedProducts,
      financialSplitResult
    };
  }
}
