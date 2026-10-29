import { ChangeDetectionStrategy, Component, inject, signal, computed, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { ProductItem } from '../../models/ecosystem.model';
import { animate, stagger } from 'motion';
import { InventoryStatsComponent } from './inventory/inventory-stats';
import { InventoryTableComponent } from './inventory/inventory-table';
import { InventoryPromotionsComponent } from './inventory/inventory-promotions';
import { InventoryLabelsComponent } from './inventory/inventory-labels';
import { InventoryNfeModal } from './inventory/inventory-nfe-modal';
import { InventoryLossModal } from './inventory/inventory-loss-modal';
import { InventoryProductModal } from './inventory/inventory-product-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-inventory-window',
  imports: [
    CommonModule, 
    MatIconModule,
    InventoryStatsComponent,
    InventoryTableComponent,
    InventoryPromotionsComponent,
    InventoryLabelsComponent,
    InventoryNfeModal,
    InventoryLossModal,
    InventoryProductModal
  ],
  template: `
    <div class="flex flex-col h-full space-y-4 text-xs text-white font-mono">
      
      <!-- Inventory Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-[#3d200f] shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-md">
            <mat-icon class="text-xl">inventory_2</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-serif font-black text-base text-white">Estoque ERP &amp; Controladoria NFe</h1>
              <span class="border border-dashed border-amber-600 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                TEMPO REAL
              </span>
            </div>
            <p class="text-xs text-stone-400">Saldo físico, curva ABC, entrada de notas fiscais de fornecedor e ordem de compra automática.</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="showNfeEntryModal.set(true)"
            class="bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold py-2 px-3.5 rounded-xl border border-amber-500/30 flex items-center gap-1 text-xs transition-all cursor-pointer">
            <mat-icon class="text-sm">receipt</mat-icon>
            <span>Entrada NFe / Lote</span>
          </button>

          <button
            type="button"
            (click)="generateAutoPurchaseOrder()"
            class="bg-amber-950/80 hover:bg-amber-900 text-amber-300 font-extrabold py-2 px-3.5 rounded-xl border border-amber-500/40 flex items-center gap-1 text-xs transition-all cursor-pointer">
            <mat-icon class="text-sm">local_shipping</mat-icon>
            <span>Ordem de Compra ({{ lowStockCount() }})</span>
          </button>

          <button
            type="button"
            (click)="showAddModal.set(true)"
            class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2 px-3.5 rounded-xl shadow-md border border-amber-400/50 flex items-center gap-1 text-xs transition-all cursor-pointer">
            <mat-icon class="text-sm">add_box</mat-icon>
            <span>+ Novo Insumo</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Bar -->
      <app-inventory-stats
        [skuCount]="ecosystem.products().length"
        [totalValue]="totalStockValue()"
        [lowStockCount]="lowStockCount()"
      />

      <!-- Inventory Tabs Selector -->
      <div class="flex items-center gap-1.5 border-b border-[#3d200f] pb-2 shrink-0 overflow-x-auto no-scrollbar">
        <button
          type="button"
          (click)="viewMode.set('list')"
          [class]="viewMode() === 'list' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'"
          class="px-4 py-2 rounded-xl text-[10px] uppercase font-black transition-all flex items-center gap-1.5">
          <mat-icon class="text-xs">list_alt</mat-icon> Listagem de Saldo
        </button>
        <button
          type="button"
          (click)="viewMode.set('promotions')"
          [class]="viewMode() === 'promotions' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'"
          class="px-4 py-2 rounded-xl text-[10px] uppercase font-black transition-all flex items-center gap-1.5">
          <mat-icon class="text-xs">sell</mat-icon> Campanhas & Mix (Varejo)
        </button>
        <button
          type="button"
          (click)="viewMode.set('labels')"
          [class]="viewMode() === 'labels' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'bg-stone-900 text-stone-400 hover:text-stone-200 border border-stone-800'"
          class="px-4 py-2 rounded-xl text-[10px] uppercase font-black transition-all flex items-center gap-1.5 cursor-pointer">
          <mat-icon class="text-xs">label</mat-icon> Etiquetas de Gôndola
        </button>
        <button
          type="button"
          (click)="viewMode.set('demand_forecast')"
          [class]="viewMode() === 'demand_forecast' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'bg-stone-900 text-amber-400 hover:text-stone-200 border border-amber-600/40'"
          class="px-4 py-2 rounded-xl text-[10px] uppercase font-black transition-all flex items-center gap-1.5 cursor-pointer">
          <mat-icon class="text-xs">query_stats</mat-icon> Simulação de Demanda &amp; Ruptura
        </button>
      </div>

      <!-- MAIN CONTENT -->
      @if (viewMode() === 'list') {
        <app-inventory-table
          [products]="ecosystem.products()"
          (adjustStock)="adjustStock($event.productId, $event.delta)"
          (openLossModal)="openLossModal($event)"
        />
      } @else if (viewMode() === 'promotions') {
        <app-inventory-promotions
          [promotions]="ecosystem.promotions()"
        />
      } @else if (viewMode() === 'labels') {
        <app-inventory-labels
          [products]="ecosystem.products()"
        />
      } @else {
        <!-- DEMAND SIMULATION & STOCK RUPTURE FORECAST -->
        <div class="space-y-4">
          <div class="bg-[#1f120a] border border-amber-600/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#3d200f] pb-3">
              <div>
                <h3 class="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <mat-icon class="text-base">science</mat-icon>
                  Motor de Simulação de Demanda &amp; Prevenção de Ruptura
                </h3>
                <p class="text-stone-400 text-xs">Simule o impacto de picos de pedidos sobre o estoque atual sem alterar o inventário real.</p>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-stone-400 text-xs">Volume de Pedidos Simulados:</span>
                <select
                  [value]="simOrderVolume()"
                  (change)="updateSimVolume($event)"
                  class="bg-[#2a160b] border border-[#4d2813] text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs font-mono">
                  <option [value]="20">20 Pedidos / Dia</option>
                  <option [value]="50">50 Pedidos / Dia</option>
                  <option [value]="100">100 Pedidos (Pico)</option>
                  <option [value]="250">250 Pedidos (Festival)</option>
                </select>
              </div>
            </div>

            <!-- SIMULATED RESULTS TABLE -->
            <div class="overflow-x-auto rounded-xl border border-[#3d200f] bg-[#140b05]">
              <table class="w-full text-left border-collapse font-mono text-xs">
                <thead>
                  <tr class="border-b border-[#3d200f] bg-[#1c0f07] text-stone-400 text-[10px] uppercase">
                    <th class="p-3">Insumo / Produto</th>
                    <th class="p-3 text-center">Estoque Atual (Real)</th>
                    <th class="p-3 text-center">Consumo Simulado</th>
                    <th class="p-3 text-center">Saldo Restante</th>
                    <th class="p-3 text-center">Status de Ruptura</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#2a160b]">
                  @for (res of simulatedStockForecast().results; track res.productId) {
                    <tr class="hover:bg-[#201007] transition-all">
                      <td class="p-3 font-bold text-white">{{ res.productName }}</td>
                      <td class="p-3 text-center text-stone-300">{{ res.currentStock }} un</td>
                      <td class="p-3 text-center text-amber-400 font-bold">-{{ res.requestedQuantity }} un</td>
                      <td class="p-3 text-center font-bold" [class]="res.remainingStock === 0 ? 'text-rose-500' : res.isLowStockWarning ? 'text-amber-400' : 'text-emerald-400'">
                        {{ res.remainingStock }} un
                      </td>
                      <td class="p-3 text-center">
                        @if (res.remainingStock === 0) {
                          <span class="bg-rose-950 text-rose-300 border border-rose-700/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            ⚠️ RUPTURA TOTAL
                          </span>
                        } @else if (res.isLowStockWarning) {
                          <span class="bg-amber-950 text-amber-300 border border-amber-600/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            ⚠️ ESTOQUE CRÍTICO
                          </span>
                        } @else {
                          <span class="bg-emerald-950 text-emerald-300 border border-emerald-700/80 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                            ✅ NÍVEL SEGURO
                          </span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      <!-- MODALS -->
      @if (showNfeEntryModal()) {
        <app-inventory-nfe-modal
          [products]="ecosystem.products()"
          (close)="showNfeEntryModal.set(false)"
          (save)="onSaveNfe($event)"
        />
      }

      @if (selectedLossProduct(); as prod) {
        <app-inventory-loss-modal
          [product]="prod"
          (close)="selectedLossProduct.set(null)"
          (save)="onConfirmStockLoss(prod, $event)"
        />
      }

      @if (showAddModal()) {
        <app-inventory-product-modal
          [suppliers]="ecosystem.suppliers()"
          (close)="showAddModal.set(false)"
          (save)="onSaveProduct($event)"
        />
      }

    </div>
  `
})
export class InventoryWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly showAddModal = signal<boolean>(false);
  readonly showNfeEntryModal = signal<boolean>(false);
  readonly selectedLossProduct = signal<ProductItem | null>(null);
  readonly viewMode = signal<'list' | 'promotions' | 'labels' | 'demand_forecast'>('list');
  readonly simOrderVolume = signal<number>(50);
  readonly Math = Math;

  private readonly inventoryBody = viewChild<ElementRef>('inventoryBody');

  readonly simulatedStockForecast = computed(() => {
    const products = this.ecosystem.products();
    const volume = this.simOrderVolume();
    const simulatedOrders = products.map(p => ({
      productId: p.id,
      quantity: Math.ceil((volume / Math.max(1, products.length)) * (p.price > 40 ? 1 : 2))
    }));
    return this.ecosystem.inventoryEngine.processStockDeduction(products, simulatedOrders, 'simulation');
  });

  updateSimVolume(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.simOrderVolume.set(Number(selectEl.value));
  }

  constructor() {
    effect(() => {
      this.ecosystem.products();
      if (this.viewMode() === 'list') {
        this.animateTable();
      }
    });
  }

  private animateTable() {
    setTimeout(() => {
      const rows = this.inventoryBody()?.nativeElement.querySelectorAll('.inventory-row');
      if (rows && rows.length > 0) {
        animate(rows, { opacity: [0, 1], x: [-10, 0] }, { duration: 0.3, delay: stagger(0.03) });
      }
    });
  }

  totalStockValue = computed(() =>
    this.ecosystem.products().reduce((sum, p) => sum + p.price * p.stock, 0)
  );

  lowStockCount = computed(() =>
    this.ecosystem.products().filter(p => p.stock <= p.minStock).length
  );

  adjustStock(productId: string, delta: number) {
    this.ecosystem.products.update(prods =>
      prods.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p)
    );
  }

  openLossModal(prod: ProductItem) {
    this.selectedLossProduct.set(prod);
  }

  onConfirmStockLoss(prod: ProductItem, event: { quantity: number, reason: string }) {
    const { quantity, reason } = event;
    this.adjustStock(prod.id, -quantity);
    this.ecosystem.addFinancialEntry({
      date: new Date().toISOString(),
      type: 'expense',
      category: 'Avaria / Perda de Estoque',
      description: `Baixa por Avaria: ${quantity}x ${prod.name} (${reason})`,
      amount: prod.costPrice * quantity,
      paymentMethod: 'Interno ERP',
      referenceId: 'loss-' + Date.now()
    });
    this.selectedLossProduct.set(null);
    this.ecosystem.notify(`Baixa por ${reason} registrada: ${quantity}x ${prod.name} removido do estoque.`, 'warning');
  }

  onSaveNfe(event: { productId: string, quantity: number, costPrice: number, supplier: string }) {
    const { productId, quantity, costPrice, supplier } = event;

    this.ecosystem.products.update(prods =>
      prods.map(p => p.id === productId ? { 
        ...p, 
        stock: p.stock + quantity,
        costPrice: Math.round(((p.costPrice * p.stock + costPrice * quantity) / (p.stock + quantity)) * 100) / 100
      } : p)
    );

    this.ecosystem.addFinancialEntry({
      date: new Date().toISOString(),
      type: 'expense',
      category: 'Compra de Estoque / NFe',
      description: `Entrada NFe Fornecedor ${supplier}: +${quantity} un`,
      amount: costPrice * quantity,
      paymentMethod: 'Faturado 30 dias',
      referenceId: 'nfe-' + Date.now()
    });

    this.showNfeEntryModal.set(false);
    this.ecosystem.notify(`NFe processada! +${quantity} unidades adicionadas e custo médio recalculado.`, 'success');
  }

  generateAutoPurchaseOrder() {
    const lowItems = this.ecosystem.products().filter(p => p.stock <= p.minStock);
    if (lowItems.length === 0) {
      this.ecosystem.notify('Todos os SKUs estão com níveis de estoque regulares.', 'info');
      return;
    }
    const orderList = lowItems.map(i => `${i.name} (+${i.minStock * 2} un)`).join(', ');
    this.ecosystem.notify(`Ordem de Compra Gerada para Fornecedor Central: ${orderList}`, 'success');
  }

  onSaveProduct(event: { name: string, price: number, wholesalePrice: number, stock: number, supplierId: string }) {
    this.ecosystem.addProduct({
      name: event.name,
      category: 'Geral',
      supplierId: event.supplierId,
      price: event.price,
      wholesalePrice: event.wholesalePrice,
      costPrice: event.price * 0.4,
      stock: event.stock,
      minStock: 5,
      barcode: '789100' + Math.floor(Math.random() * 9000000),
      sku: 'SKU-' + Math.floor(Math.random() * 9000),
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Insumo cadastrado no ERP.'
    });
    this.showAddModal.set(false);
    this.ecosystem.notify('Produto cadastrado e sincronizado com PDV.', 'success');
  }
}
