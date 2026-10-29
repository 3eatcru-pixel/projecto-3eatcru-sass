import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { ProductItem, CartItem, OrderTransaction, CustomerProfile } from '../../models/ecosystem.model';

interface HeldSale {
  id: string;
  saleNumber: number;
  tableOrClient: string;
  items: CartItem[];
  total: number;
  time: string;
}

import { PosScannerComponent } from './pos/pos-scanner';
import { PosGridComponent } from './pos/pos-grid';
import { PosCartComponent } from './pos/pos-cart';
import { PosCashOpModal } from './pos/pos-cash-op-modal';
import { PosScaleModal } from './pos/pos-scale-modal';
import { PosDiscountModal } from './pos/pos-discount-modal';
import { PosRecallModal } from './pos/pos-recall-modal';
import { PosReceiptModal } from './pos/pos-receipt-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pos-window',
  imports: [
    CommonModule, 
    MatIconModule,
    PosScannerComponent,
    PosGridComponent,
    PosCartComponent,
    PosCashOpModal,
    PosScaleModal,
    PosDiscountModal,
    PosRecallModal,
    PosReceiptModal
  ],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 h-full text-xs text-white font-mono relative overflow-hidden">
      
      <!-- Left: Catalog, Search & Sector Workflows (8 Cols) -->
      <div class="lg:col-span-8 space-y-3 flex flex-col h-full overflow-hidden">
        
        <app-pos-scanner
          [(posSector)]="posSector"
          [(isWholesale)]="isWholesale"
          [(fastScanMode)]="fastScanMode"
          [(tableOrComanda)]="tableOrComanda"
          [(technicianName)]="technicianName"
          [(searchQuery)]="searchQuery"
          [heldSalesCount]="heldSales().length"
          (openScale)="showScaleModal.set(true)"
          (openRecall)="showRecallModal.set(true)"
          (openSangria)="showSangriaModal.set(true)"
          (bip)="handleBarcodeBipInput()"
        />

        <app-pos-grid
          [products]="filteredProducts()"
          [categories]="categories"
          [(selectedCategory)]="selectedCategory"
          (addToCart)="addToCart($event)"
        />

      </div>

      <!-- Right: POS Terminal Cart & Checkout Panel (4 Cols) -->
      <div class="lg:col-span-4 h-full overflow-hidden">
        <app-pos-cart
          [currentSaleNumber]="currentSaleNumber"
          [cart]="cart()"
          [selectedCustomer]="selectedCustomer()"
          [customerSearchResults]="customerSearchResults()"
          [(customerCpf)]="customerCpf"
          [splitGuestsCount]="splitGuestsCount()"
          [cartSubtotal]="cartSubtotal()"
          [cartDiscount]="cartDiscount()"
          [cartPromotionsDiscount]="cartPromotionsDiscount()"
          [cartTax]="cartTax()"
          [cartTotal]="cartTotal()"
          (holdSale)="holdSale()"
          (clearCart)="clearCart()"
          (removeCustomer)="selectedCustomer.set(null)"
          (customerSearch)="customerSearch($event)"
          (selectCustomer)="selectedCustomer.set($event); customerSearchResults.set([])"
          (incrementQty)="incrementQty($event)"
          (decrementQty)="decrementQty($event)"
          (updateItemNotes)="updateItemNotes($event.item, $event.notes)"
          (openDiscount)="applyDiscountModal.set(true)"
          (checkout)="checkout($event)"
        />
      </div>

      <!-- MODALS -->
      @if (showSangriaModal()) {
        <app-pos-cash-op-modal
          (close)="showSangriaModal.set(false)"
          (execute)="onExecuteCashOperation($event)"
        />
      }

      @if (showScaleModal()) {
        <app-pos-scale-modal
          [products]="ecosystem.products()"
          (close)="showScaleModal.set(false)"
          (save)="onConfirmScaleWeighing($event)"
        />
      }

      @if (applyDiscountModal()) {
        <app-pos-discount-modal
          (close)="applyDiscountModal.set(false)"
          (applyDiscount)="onApplyDiscount($event)"
        />
      }

      @if (showRecallModal()) {
        <app-pos-recall-modal
          [heldSales]="heldSales()"
          (close)="showRecallModal.set(false)"
          (recall)="recallSale($event)"
        />
      }

      @if (showNfceCouponModal(); as order) {
        <app-pos-receipt-modal
          [order]="order"
          [customerCpf]="customerCpf()"
          (close)="showNfceCouponModal.set(null)"
        />
      }

    </div>
  `
})
export class PosWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly Math = Math;
  readonly Number = Number;

  readonly posSector = signal<'restaurant' | 'retail' | 'services'>('restaurant');
  readonly selectedCategory = signal<string>('Todos');
  readonly searchQuery = signal<string>('');

  readonly cart = signal<CartItem[]>([]);
  readonly tableOrComanda = signal<string>('MESA 01');
  readonly technicianName = signal<string>('CARLOS M.');
  readonly customerCpf = signal<string>('');

  readonly heldSales = signal<HeldSale[]>([]);
  readonly showSangriaModal = signal<boolean>(false);
  readonly showRecallModal = signal<boolean>(false);
  readonly showScaleModal = signal<boolean>(false);
  readonly applyDiscountModal = signal<boolean>(false);
  readonly showNfceCouponModal = signal<OrderTransaction | null>(null);

  readonly cartDiscount = signal<number>(0);
  readonly splitGuestsCount = signal<number>(1);

  readonly isWholesale = signal<boolean>(false);
  readonly fastScanMode = signal<boolean>(true);
  readonly selectedCustomer = signal<CustomerProfile | null>(null);
  readonly customerSearchResults = signal<CustomerProfile[]>([]);

  currentSaleNumber = Math.floor(Math.random() * 900 + 100);

  categories = ['Todos', 'Lanches', 'Bebidas', 'Acompanhamentos', 'Sobremesas', 'Serviços', 'Padaria Fina', 'Suplementos & Vitaminas'];

  filteredProducts = computed(() => {
    const cat = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();
    return this.ecosystem.products().filter(p => {
      const matchCat = cat === 'Todos' || p.category === cat;
      const matchQuery = !query || p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || p.barcode.includes(query);
      return matchCat && matchQuery;
    });
  });

  cartSubtotal = computed(() => this.cart().reduce((sum, item) => {
    const price = (this.isWholesale() && item.product.wholesalePrice) ? item.product.wholesalePrice : item.product.price;
    return sum + price * item.quantity;
  }, 0));

  // Auto-calculated promotions discount
  cartPromotionsDiscount = computed(() => {
    const items = this.cart();
    const promos = this.ecosystem.promotions().filter(p => p.isActive && p.tenantId === this.ecosystem.currentTenantId());
    let totalPromoDiscount = 0;

    for (const promo of promos) {
      if (promo.type === 'bundle') {
        // Check if all trigger products are in cart
        const hasAll = promo.triggerProductIds.every(pid => items.some(i => i.product.id === pid));
        if (hasAll) {
          // Apply discount to the sum of these items
          const bundleItems = items.filter(i => promo.triggerProductIds.includes(i.product.id));
          const bundleSubtotal = bundleItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
          totalPromoDiscount += bundleSubtotal * (promo.discountValue / 100);
        }
      } else if (promo.type === 'buy_get_free') {
        const targetItem = items.find(i => promo.triggerProductIds.includes(i.product.id));
        if (targetItem && targetItem.quantity >= (promo.minQuantity || 1)) {
          // Give one for free (100% discount on one unit)
          totalPromoDiscount += targetItem.product.price;
        }
      }
    }
    return totalPromoDiscount;
  });

  cartTax = computed(() => Math.max(0, (this.cartSubtotal() - this.cartDiscount() - this.cartPromotionsDiscount())) * 0.1);
  cartTotal = computed(() => Math.max(0, this.cartSubtotal() - this.cartDiscount() - this.cartPromotionsDiscount() + this.cartTax()));

  customerSearch(val: string) {
    if (!val || val.length < 2) {
      this.customerSearchResults.set([]);
      return;
    }
    const query = val.toLowerCase();
    const results = this.ecosystem.customers().filter(c => 
      c.name.toLowerCase().includes(query) || c.cpf.includes(query) || c.phone.includes(query)
    );
    this.customerSearchResults.set(results);
  }

  handleBarcodeBipInput() {
    const query = this.searchQuery().trim();
    if (!query) return;

    let mult = 1;
    let targetCode = query;
    if (query.includes('*')) {
      const parts = query.split('*');
      mult = parseInt(parts[0], 10) || 1;
      targetCode = parts[1].trim();
    }

    const matchedProduct = this.ecosystem.products().find(p => 
      p.barcode === targetCode || p.sku.toLowerCase() === targetCode.toLowerCase() || p.name.toLowerCase().includes(targetCode.toLowerCase())
    );

    if (matchedProduct) {
      this.addToCart(matchedProduct, mult);
      if (this.fastScanMode()) {
        this.searchQuery.set('');
      }
      this.ecosystem.notify(`[BIP EAN-13] ${mult}x ${matchedProduct.name} adicionado ao carrinho!`, 'info');
    } else {
      this.ecosystem.notify(`Código de barras "${targetCode}" não localizado no catálogo!`, 'warning');
    }
  }

  addToCart(product: ProductItem, qty = 1) {
    this.cart.update(c => {
      const existing = c.find(i => i.product.id === product.id);
      if (existing) {
        return c.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      }
      return [...c, { product, quantity: qty }];
    });
  }

  onConfirmScaleWeighing(event: { productId: string, weight: number }) {
    const prod = this.ecosystem.products().find(p => p.id === event.productId);
    if (!prod) return;
    const weight = event.weight;
    const calculatedPrice = prod.price * weight;

    const weightedProd: ProductItem = {
      ...prod,
      name: `${prod.name} (${weight.toFixed(3)}kg)`,
      price: Math.round(calculatedPrice * 100) / 100
    };

    this.addToCart(weightedProd, 1);
    this.showScaleModal.set(false);
    this.ecosystem.notify(`Balança: ${weight.toFixed(3)}kg x R$ ${prod.price.toFixed(2)} = R$ ${calculatedPrice.toFixed(2)} inserido no cupom!`, 'success');
  }

  onApplyDiscount(percent: number) {
    this.cartDiscount.set(this.cartSubtotal() * percent);
    this.applyDiscountModal.set(false);
  }

  updateItemNotes(item: CartItem, notes: string) {
    this.cart.update(c => c.map(i => i.product.id === item.product.id ? { ...i, notes } : i));
  }

  incrementQty(item: CartItem) {
    this.cart.update(c => c.map(i => i.product.id === item.product.id ? { ...i, quantity: i.quantity + 1 } : i));
  }

  decrementQty(item: CartItem) {
    this.cart.update(c => c.map(i => {
      if (i.product.id === item.product.id) {
        return { ...i, quantity: i.quantity - 1 };
      }
      return i;
    }).filter(i => i.quantity > 0));
  }

  clearCart() {
    this.cart.set([]);
    this.cartDiscount.set(0);
  }

  holdSale() {
    if (this.cart().length === 0) return;
    const newHeld: HeldSale = {
      id: 'hold-' + Date.now(),
      saleNumber: this.currentSaleNumber,
      tableOrClient: this.posSector() === 'restaurant' ? this.tableOrComanda() : this.posSector() === 'services' ? this.technicianName() : 'Balcão Varejo',
      items: [...this.cart()],
      total: this.cartTotal(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.heldSales.update(h => [newHeld, ...h]);
    this.ecosystem.notify(`Venda #${this.currentSaleNumber} em espera (Hold).`, 'info');
    this.clearCart();
    this.currentSaleNumber = Math.floor(Math.random() * 900 + 100);
  }

  recallSale(held: HeldSale) {
    this.cart.set([...held.items]);
    this.currentSaleNumber = held.saleNumber;
    this.heldSales.update(h => h.filter(item => item.id !== held.id));
    this.showRecallModal.set(false);
    this.ecosystem.notify(`Venda #${held.saleNumber} recuperada para a tela principal.`, 'success');
  }

  onExecuteCashOperation(event: { type: 'sangria' | 'suprimento' | 'close', amount: number, reason: string }) {
    const { type, amount, reason } = event;

    if (type === 'sangria') {
      this.ecosystem.addFinancialEntry({
        date: 'Agora mesmo',
        type: 'expense',
        category: 'Sangria de Caixa',
        description: `Sangria Gaveta: ${reason}`,
        amount,
        paymentMethod: 'Dinheiro',
        referenceId: 'sangria-' + Date.now()
      });
      this.ecosystem.notify(`Sangria de R$ ${amount.toFixed(2)} registrada na gaveta.`, 'warning');
    } else if (type === 'suprimento') {
      this.ecosystem.addFinancialEntry({
        date: 'Agora mesmo',
        type: 'sale',
        category: 'Suprimento / Aporte',
        description: `Suprimento Fundo de Troco: ${reason}`,
        amount,
        paymentMethod: 'Dinheiro',
        referenceId: 'suprimento-' + Date.now()
      });
      this.ecosystem.notify(`Suprimento de R$ ${amount.toFixed(2)} inserido na gaveta.`, 'success');
    } else {
      this.ecosystem.notify('Fechamento de turno concluído! Relatório Z gerado e transmitido ao HQ.', 'info');
    }

    this.showSangriaModal.set(false);
  }

  checkout(method: 'cash' | 'card' | 'pix') {
    if (this.cart().length === 0) return;
    const subtotal = this.cartSubtotal();
    const tax = this.cartTax();
    const discount = this.cartDiscount();
    const total = this.cartTotal();
    const currentMode = this.ecosystem.sandboxEngine.activeExecutionMode();
    const currentTenant = this.ecosystem.tenants().find(t => t.id === this.ecosystem.currentTenantId()) || this.ecosystem.tenants()[0];

    const newOrder = this.ecosystem.addOrder({
      tenantId: this.ecosystem.currentTenantId(),
      orderNumber: '#' + this.currentSaleNumber,
      type: 'pos-counter',
      tableNumber: this.posSector() === 'restaurant' ? this.tableOrComanda() : undefined,
      items: [...this.cart()],
      subtotal,
      tax,
      discount,
      total,
      paymentMethod: method,
      status: 'completed',
      channel: 'POS'
    });

    if (currentMode === 'real') {
      // 1. Process real inventory deduction
      const orderItems = this.cart().map(i => ({ productId: i.product.id, quantity: i.quantity }));
      const stockRes = this.ecosystem.inventoryEngine.processStockDeduction(this.ecosystem.products(), orderItems, 'real');
      this.ecosystem.products.set(stockRes.updatedProducts);

      // 2. Process real financial split ledger entry
      const finResult = this.ecosystem.financialEngine.processOrderFinancialSplit(newOrder, currentTenant, 'real');
      this.ecosystem.addFinancialEntry(finResult.ledgerRecord);

      this.ecosystem.notify(`[MODO REAL] Venda R$ ${total.toFixed(2)} gravada no Livro-Razão e estoque atualizado!`, 'success');
    } else {
      // Simulation mode
      this.ecosystem.financialEngine.processOrderFinancialSplit(newOrder, currentTenant, 'simulation');
      this.ecosystem.sandboxEngine.simulatedOrders.update(list => [newOrder, ...list]);
      this.ecosystem.notify(`[MODO SIMULAÇÃO] Venda R$ ${total.toFixed(2)} processada em Sandbox sem afetar estoque real.`, 'info');
    }

    this.showNfceCouponModal.set(newOrder);
    this.clearCart();
    this.currentSaleNumber = Math.floor(Math.random() * 900 + 100);
  }
}
