import { ChangeDetectionStrategy, Component, inject, signal, effect, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { OrderTransaction } from '../../models/ecosystem.model';
import { animate, stagger } from 'motion';

// Sub-components
import { KdsTicketComponent } from './kds/kds-ticket';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-kds-window',
  standalone: true,
  imports: [CommonModule, MatIconModule, KdsTicketComponent],
  template: `
    <div class="flex flex-col h-full space-y-4 text-xs text-white">
      
      <!-- KDS Header Bar -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-[#3d200f] shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-md">
            <mat-icon class="text-xl">soup_kitchen</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-serif font-black text-base text-white">KDS Cozinha &amp; Praças de Preparo</h2>
              <span class="border border-dashed border-amber-600 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                CONTROLE DIGITAL
              </span>
            </div>
            <p class="text-xs text-stone-400">Gerenciamento de filas de produção, comandas da cozinha e despacho para garçons.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="bg-[#1d1008] border border-[#4d2813] px-3 py-1.5 rounded-xl font-mono text-center">
            <span class="text-[9px] text-stone-400 font-bold block uppercase">Em Fila</span>
            <strong class="text-amber-400 text-sm font-black">{{ ecosystem.pendingKdsOrders() }} comandas</strong>
          </div>

          <button
            type="button"
            (click)="createNewTestOrder()"
            class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2 px-4 rounded-xl shadow-md border border-amber-400/50 flex items-center gap-1.5 text-xs transition-all cursor-pointer">
            <mat-icon class="text-sm">notification_important</mat-icon>
            <span>+ Nova Comanda (Core Engine)</span>
          </button>
        </div>
      </div>

      <!-- KDS STATION FILTER TABS -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#3d200f] pb-2 shrink-0">
        <div class="flex items-center gap-1 bg-[#1d1008] p-1 border border-[#4d2813] rounded-xl text-xs font-bold">
          <button
            type="button"
            (click)="selectedStation.set('all')"
            [class]="selectedStation() === 'all' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
            Todas Praças
          </button>
          <button
            type="button"
            (click)="selectedStation.set('chapa')"
            [class]="selectedStation() === 'chapa' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1">
            <mat-icon class="text-xs">skillet</mat-icon> Chapa &amp; Grill
          </button>
          <button
            type="button"
            (click)="selectedStation.set('fritadeira')"
            [class]="selectedStation() === 'fritadeira' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1">
            <mat-icon class="text-xs">rice_bowl</mat-icon> Fritadeira &amp; Porções
          </button>
          <button
            type="button"
            (click)="selectedStation.set('bar')"
            [class]="selectedStation() === 'bar' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1">
            <mat-icon class="text-xs">local_bar</mat-icon> Bar &amp; Bebidas
          </button>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <button
            type="button"
            (click)="toggleKdsSound()"
            [class]="soundEnabled() ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-stone-900 text-stone-500 border-stone-800'"
            class="px-3 py-1.5 rounded-xl border font-bold flex items-center gap-1 cursor-pointer">
            <mat-icon class="text-xs">{{ soundEnabled() ? 'volume_up' : 'volume_off' }}</mat-icon>
            <span>{{ soundEnabled() ? 'Som KDS Ativo' : 'Mudo' }}</span>
          </button>
        </div>
      </div>

      <!-- KDS Kanban Grid (3 Columns) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-hidden">
        
        <!-- COLUMN 1: PENDENTES -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-3 flex flex-col space-y-3 overflow-hidden shadow-xl">
          <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
              <span class="font-serif font-black text-amber-300 text-xs uppercase">1. Comandas Pendentes</span>
            </div>
            <span class="font-mono text-[10px] font-bold text-amber-400 bg-[#2b160b] px-2 py-0.5 rounded border border-[#482814]">
              QTD: {{ getOrdersByStatus('pending').length }}
            </span>
          </div>

          <div #pendingList class="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            @for (order of getOrdersByStatus('pending'); track order.id) {
              <app-kds-ticket
                [order]="order"
                [status]="'pending'"
                (updateStatus)="updateStatus(order.id, $event)"
              />
            }
          </div>
        </div>

        <!-- COLUMN 2: EM PREPARO -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-3 flex flex-col space-y-3 overflow-hidden shadow-xl">
          <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse"></span>
              <span class="font-serif font-black text-orange-300 text-xs uppercase">2. Em Preparo (Fogo)</span>
            </div>
            <span class="font-mono text-[10px] font-bold text-orange-400 bg-[#2b160b] px-2 py-0.5 rounded border border-[#482814]">
              QTD: {{ getOrdersByStatus('preparing').length }}
            </span>
          </div>

          <div #preparingList class="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            @for (order of getOrdersByStatus('preparing'); track order.id) {
              <app-kds-ticket
                [order]="order"
                [status]="'preparing'"
                (updateStatus)="updateStatus(order.id, $event)"
              />
            }
          </div>
        </div>

        <!-- COLUMN 3: PRONTO / EXPEDIÇÃO -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-3 flex flex-col space-y-3 overflow-hidden shadow-xl">
          <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></span>
              <span class="font-serif font-black text-emerald-300 text-xs uppercase">3. Pronto / Expedição</span>
            </div>
            <span class="font-mono text-[10px] font-bold text-emerald-400 bg-[#2b160b] px-2 py-0.5 rounded border border-[#482814]">
              QTD: {{ getOrdersByStatus('ready').length }}
            </span>
          </div>

          <div #readyList class="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar">
            @for (order of getOrdersByStatus('ready'); track order.id) {
              <app-kds-ticket
                [order]="order"
                [status]="'ready'"
                (updateStatus)="updateStatus(order.id, $event)"
              />
            }
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class KdsWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly selectedStation = signal<'all' | 'chapa' | 'fritadeira' | 'bar'>('all');
  readonly soundEnabled = signal<boolean>(true);
  
  private readonly pendingList = viewChild<ElementRef>('pendingList');
  private readonly preparingList = viewChild<ElementRef>('preparingList');
  private readonly readyList = viewChild<ElementRef>('readyList');

  constructor() {
    effect(() => {
      this.ecosystem.orders();
      this.animateList(this.pendingList());
      this.animateList(this.preparingList());
      this.animateList(this.readyList());
    });
  }

  toggleKdsSound() {
    this.soundEnabled.update((v: boolean) => !v);
    this.ecosystem.notify(
      this.soundEnabled() ? 'Alerta sonoro de nova comanda ATIVADO.' : 'Alerta sonoro silenciado.',
      'info'
    );
  }

  private animateList(list?: ElementRef) {
    if (!list) return;
    const tickets = list.nativeElement.querySelectorAll('app-kds-ticket');
    if (tickets.length > 0) {
      animate(tickets, { opacity: [0, 1], y: [10, 0] }, { duration: 0.3, delay: stagger(0.04) });
    }
  }

  getOrdersByStatus(status: OrderTransaction['status']) {
    const station = this.selectedStation();
    return this.ecosystem.orders().filter(o => {
      const matchStatus = o.status === status;
      if (!matchStatus) return false;
      if (station === 'all') return true;
      if (station === 'chapa') {
        return o.items.some(i => i.product.category.toLowerCase().includes('burger') || i.product.category.toLowerCase().includes('grill'));
      }
      if (station === 'fritadeira') {
        return o.items.some(i => i.product.category.toLowerCase().includes('acompanhamento') || i.product.category.toLowerCase().includes('porç') || i.product.category.toLowerCase().includes('batata'));
      }
      if (station === 'bar') {
        return o.items.some(i => i.product.category.toLowerCase().includes('bebida') || i.product.category.toLowerCase().includes('chopp') || i.product.category.toLowerCase().includes('café'));
      }
      return true;
    });
  }

  updateStatus(orderId: string, status: OrderTransaction['status']) {
    const targetOrder = this.ecosystem.orders().find(o => o.id === orderId);
    const tenant = this.ecosystem.tenants().find(t => t.id === this.ecosystem.currentTenantId()) || this.ecosystem.tenants()[0];
    const currentMode = this.ecosystem.sandboxEngine.activeExecutionMode();

    if (targetOrder) {
      // Advance order workflow through Core Engine
      const workflowResult = this.ecosystem.orderEngine.advanceOrderStatus(
        targetOrder,
        status,
        tenant,
        this.ecosystem.products(),
        currentMode
      );

      // Update products state if stock was deducted
      if (workflowResult.updatedProducts !== this.ecosystem.products()) {
        this.ecosystem.products.set(workflowResult.updatedProducts);
      }

      // Record financial entry if order completed in Real mode
      if (currentMode === 'real' && workflowResult.financialSplitResult) {
        this.ecosystem.addFinancialEntry(workflowResult.financialSplitResult.ledgerRecord);
      }
    }

    this.ecosystem.updateOrderStatus(orderId, status);
  }

  createNewTestOrder() {
    const products = this.ecosystem.products();
    const randProd1 = products[Math.floor(Math.random() * products.length)] || products[0];
    const randProd2 = products[Math.floor(Math.random() * products.length)] || products[0];
    const currentMode = this.ecosystem.sandboxEngine.activeExecutionMode();

    const newOrder = this.ecosystem.addOrder({
      tenantId: this.ecosystem.currentTenantId(),
      orderNumber: '#' + Math.floor(Math.random() * 900 + 100),
      type: 'dine-in',
      tableNumber: 'Mesa ' + Math.floor(Math.random() * 6 + 1),
      items: [
        { product: randProd1, quantity: 2, notes: 'Sem cebola, bem passado' },
        { product: randProd2, quantity: 1 }
      ],
      subtotal: randProd1.price * 2 + randProd2.price,
      tax: (randProd1.price * 2 + randProd2.price) * 0.1,
      discount: 0,
      total: (randProd1.price * 2 + randProd2.price) * 1.1,
      paymentMethod: 'card',
      status: 'pending',
      channel: 'POS'
    });

    this.ecosystem.notify(
      `Comanda ${newOrder.orderNumber} enviada ao KDS Cozinha (${currentMode === 'real' ? 'MODO REAL' : 'SANDBOX'}).`,
      'info'
    );
  }
}
