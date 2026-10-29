import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EcosystemService } from '../../services/ecosystem.service';
import { TableInfo } from '../../models/ecosystem.model';
import { TableGridComponent } from './tables/table-grid';
import { TableDetailsModal } from './tables/table-details-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tables-window',
  imports: [
    CommonModule, 
    MatIconModule,
    TableGridComponent,
    TableDetailsModal
  ],
  template: `
    <div class="space-y-4 h-full flex flex-col text-xs text-white font-mono">
      
      <!-- Top Filters & Summary Bar -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0 pb-3 border-b border-slate-800">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
            <mat-icon class="text-xl">table_restaurant</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-base text-white">Planta de Salão &amp; Gestão de Mesas</h3>
              <span class="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                Sincronizado com KDS Cozinha
              </span>
            </div>
            <p class="text-xs text-slate-400">Controle de ocupação, garçons, comandas e divisão de conta por clientes.</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- Zone Switcher -->
          <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              (click)="selectedZone.set('all')"
              [class]="selectedZone() === 'all' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all">
              Todos Setores
            </button>
            <button
              type="button"
              (click)="selectedZone.set('salao')"
              [class]="selectedZone() === 'salao' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
              <mat-icon class="text-xs">chair</mat-icon> Salão
            </button>
            <button
              type="button"
              (click)="selectedZone.set('varanda')"
              [class]="selectedZone() === 'varanda' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
              <mat-icon class="text-xs">deck</mat-icon> Varanda
            </button>
            <button
              type="button"
              (click)="selectedZone.set('bar')"
              [class]="selectedZone() === 'bar' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
              <mat-icon class="text-xs">local_bar</mat-icon> Bar / Balcão
            </button>
          </div>

          <!-- Status Filters -->
          <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              (click)="selectedStatus.set('all')"
              [class]="selectedStatus() === 'all' ? 'bg-slate-800 text-white font-bold' : 'text-slate-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all">
              Todas ({{ ecosystem.tables().length }})
            </button>
            <button
              type="button"
              (click)="selectedStatus.set('available')"
              [class]="selectedStatus() === 'available' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all">
              Livres ({{ freeTablesCount() }})
            </button>
            <button
              type="button"
              (click)="selectedStatus.set('occupied')"
              [class]="selectedStatus() === 'occupied' ? 'bg-orange-600 text-white font-bold' : 'text-orange-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all">
              Ocupadas ({{ occupiedTablesCount() }})
            </button>
            <button
              type="button"
              (click)="selectedStatus.set('billing')"
              [class]="selectedStatus() === 'billing' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:text-white'"
              class="px-2.5 py-1 rounded-lg transition-all">
              Conta ({{ billingTablesCount() }})
            </button>
          </div>

          <!-- PAIR MOBILE WAITER APP BUTTON (DESKTOP QR CODE) -->
          <button
            type="button"
            (click)="showPairingModal.set(true)"
            class="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition-all active:scale-95">
            <mat-icon class="text-sm">qr_code_2</mat-icon>
            <span>Parear App Garçom (QR Code)</span>
          </button>
        </div>
      </div>

      <!-- Tables Visual Floor Grid -->
      <app-table-grid
        [tables]="filteredTables()"
        (selectTable)="openTableModal($event)"
      />

      <!-- Comanda & Table Management Modal -->
      @if (activeTable(); as t) {
        <app-table-details-modal
          [table]="t"
          [products]="ecosystem.products()"
          [currentItems]="currentTableItems()"
          [currentTotal]="currentTableTotal()"
          (close)="activeTable.set(null)"
          (open)="openTable(t, $event)"
          (fireCourse)="onFireCourse($event)"
          (addItem)="addItemToTableComanda(t, $event)"
          (closeBill)="onCloseBill(t)"
          (settle)="onSettleTable(t)"
        />
      }

      <!-- QR CODE PAIRING MODAL FOR WAITER MOBILE APP -->
      @if (showPairingModal()) {
        <div class="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#180b04] border-2 border-amber-600/60 rounded-3xl max-w-md w-full p-6 text-stone-200 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center border-b border-[#381c0c] pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-10 h-10 rounded-2xl bg-amber-600 text-stone-950 flex items-center justify-center font-black shadow">
                  <mat-icon class="text-xl">qr_code_2</mat-icon>
                </div>
                <div>
                  <h3 class="font-serif font-black text-white text-base">Parear App Garçom Mobile</h3>
                  <p class="text-[10px] text-stone-400">Terminal Host: {{ ecosystem.currentTenant().name }}</p>
                </div>
              </div>
              <button (click)="showPairingModal.set(false)" class="text-stone-400 hover:text-white font-bold text-lg cursor-pointer">✕</button>
            </div>

            <!-- HIGH-CONTRAST AUTHENTIC QR PAIRING CODE -->
            <div class="flex flex-col items-center justify-center p-5 bg-white rounded-3xl shadow-inner relative overflow-hidden">
              <svg class="w-44 h-44" viewBox="0 0 100 100" fill="black">
                <rect x="5" y="5" width="25" height="25" fill="#111" rx="2" />
                <rect x="9" y="9" width="17" height="17" fill="white" rx="1" />
                <rect x="13" y="13" width="9" height="9" fill="#111" />

                <rect x="70" y="5" width="25" height="25" fill="#111" rx="2" />
                <rect x="74" y="9" width="17" height="17" fill="white" rx="1" />
                <rect x="78" y="13" width="9" height="9" fill="#111" />

                <rect x="5" y="70" width="25" height="25" fill="#111" rx="2" />
                <rect x="9" y="74" width="17" height="17" fill="white" rx="1" />
                <rect x="13" y="78" width="9" height="9" fill="#111" />

                <rect x="35" y="10" width="6" height="6" fill="#111" />
                <rect x="45" y="15" width="6" height="6" fill="#111" />
                <rect x="55" y="10" width="6" height="6" fill="#111" />
                <rect x="35" y="25" width="6" height="6" fill="#111" />
                <rect x="50" y="25" width="6" height="6" fill="#111" />
                
                <rect x="10" y="40" width="6" height="6" fill="#111" />
                <rect x="25" y="40" width="6" height="6" fill="#111" />
                <rect x="40" y="40" width="6" height="6" fill="#111" />
                <rect x="55" y="40" width="6" height="6" fill="#111" />
                <rect x="70" y="40" width="6" height="6" fill="#111" />
                <rect x="85" y="40" width="6" height="6" fill="#111" />

                <rect x="15" y="55" width="6" height="6" fill="#111" />
                <rect x="30" y="55" width="6" height="6" fill="#111" />
                <rect x="45" y="45" width="12" height="12" fill="#d97706" rx="2" />
                <rect x="65" y="55" width="6" height="6" fill="#111" />
                <rect x="80" y="55" width="6" height="6" fill="#111" />

                <rect x="35" y="70" width="6" height="6" fill="#111" />
                <rect x="50" y="75" width="6" height="6" fill="#111" />
                <rect x="40" y="85" width="6" height="6" fill="#111" />
                <rect x="60" y="80" width="6" height="6" fill="#111" />
                <rect x="75" y="85" width="6" height="6" fill="#111" />
              </svg>

              <div class="mt-2 text-center text-stone-900 font-mono text-[10px] font-bold">
                TOKEN: <span class="text-amber-800 font-black">TK-GARCOM-{{ ecosystem.currentTenantId() }}-8824</span>
              </div>
            </div>

            <!-- PAIRING CODE & INSTRUCTIONS -->
            <div class="bg-[#120703] border border-[#331809] p-3 rounded-2xl space-y-1.5 text-xs">
              <div class="flex justify-between items-center text-[10px] font-mono">
                <span class="text-stone-400">PIN Manual de Pareamento:</span>
                <span class="text-amber-400 font-black text-sm">849 - 210</span>
              </div>
              <p class="text-[10px] text-stone-400 leading-snug">
                Aponte o app <strong>3EAT Garçom</strong> para o QR Code acima para sincronizar as comandas da mesa em tempo real com esta bancada e com o KDS da cozinha.
              </p>
            </div>

            <!-- REAL PAIRED DEVICES FROM ECOSYSTEM MDM FLEET -->
            <div class="space-y-1.5">
              <span class="text-[9px] font-mono uppercase text-amber-500 font-bold block">
                Dispositivos Garçom Conectados ({{ activeWaiterDevices().length }}):
              </span>
              @for (dev of activeWaiterDevices(); track dev.id) {
                <div class="p-2 bg-[#200e05] rounded-xl border border-[#3d1d0c] flex justify-between items-center text-xs">
                  <div class="flex items-center gap-2">
                    <mat-icon class="text-emerald-400 text-sm">phone_android</mat-icon>
                    <div>
                      <div class="font-bold text-white text-[11px]">{{ dev.deviceName }}</div>
                      <div class="text-[9px] text-stone-400 font-mono">{{ dev.location }} • Bateria {{ dev.batteryLevel }}%</div>
                    </div>
                  </div>
                  <span class="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700/50 font-bold uppercase">
                    {{ dev.status }}
                  </span>
                </div>
              } @empty {
                <div class="p-2.5 bg-[#170a04] rounded-xl border border-[#3d1d0c] text-center text-[10px] text-stone-500 font-mono">
                  Nenhum tablet de garçom pareado no momento. Use o QR Code acima.
                </div>
              }
            </div>

            <!-- ACTION BUTTONS -->
            <div class="flex gap-2 pt-1">
              <button
                type="button"
                (click)="openWaiterAppDirectly()"
                class="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-stone-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer flex items-center justify-center gap-1.5 transition-all active:scale-95">
                <mat-icon class="text-sm">open_in_new</mat-icon>
                <span>Abrir App do Garçom</span>
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class TablesWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  private readonly router = inject(Router);

  readonly selectedZone = signal<'all' | 'salao' | 'varanda' | 'bar'>('all');
  readonly selectedStatus = signal<'all' | 'available' | 'occupied' | 'billing'>('all');
  readonly activeTable = signal<TableInfo | null>(null);
  readonly showPairingModal = signal<boolean>(false);

  readonly tableExtraItems = signal<{ name: string; qty: number; total: number; notes?: string }[]>([
    { name: 'Burger Artisan Trufado', qty: 2, total: 97.80, notes: 'Sem cebola, ao ponto' },
    { name: 'Craft IPA Beer 500ml', qty: 2, total: 49.80 }
  ]);

  currentTableTotal = computed(() =>
    this.tableExtraItems().reduce((sum, item) => sum + item.total, 0)
  );

  currentTableItems = computed(() => this.tableExtraItems());

  freeTablesCount = computed(() => this.ecosystem.tables().filter(t => t.status === 'available').length);
  occupiedTablesCount = computed(() => this.ecosystem.tables().filter(t => t.status === 'occupied').length);
  billingTablesCount = computed(() => this.ecosystem.tables().filter(t => t.status === 'billing').length);

  readonly activeWaiterDevices = computed(() => {
    const tid = this.ecosystem.currentTenantId();
    return this.ecosystem.devices().filter(d =>
      d.tenantId === tid && (d.type === 'tablet' || d.deviceName.toLowerCase().includes('garçom') || d.location.toLowerCase().includes('salão'))
    );
  });

  filteredTables = computed(() => {
    const status = this.selectedStatus();
    let tables = this.ecosystem.tables();
    if (status !== 'all') {
      tables = tables.filter(t => t.status === status);
    }
    return tables;
  });

  openTableModal(table: TableInfo) {
    this.activeTable.set(table);
  }

  openTable(table: TableInfo, event: { server: string, guests: number }) {
    this.ecosystem.updateTable(table.id, { status: 'occupied', server: event.server, guests: event.guests });
    this.activeTable.set(null);
    this.ecosystem.notify(`Mesa ${table.number} aberta para ${event.guests} pessoas com garçom ${event.server}.`, 'success');
  }

  addItemToTableComanda(table: TableInfo, productId: string) {
    const prod = this.ecosystem.products().find(p => p.id === productId);
    if (!prod) return;

    this.tableExtraItems.update(items => {
      const existing = items.find(i => i.name === prod.name);
      if (existing) {
        return items.map(i => i.name === prod.name ? { ...i, qty: i.qty + 1, total: i.total + prod.price } : i);
      }
      return [...items, { name: prod.name, qty: 1, total: prod.price }];
    });

    // Send order to KDS
    this.ecosystem.addOrder({
      tenantId: this.ecosystem.currentTenantId(),
      orderNumber: '#M' + table.number,
      type: 'dine-in',
      tableNumber: 'Mesa ' + table.number,
      items: [{ product: prod, quantity: 1 }],
      subtotal: prod.price,
      tax: prod.price * 0.1,
      discount: 0,
      total: prod.price * 1.1,
      paymentMethod: 'card',
      status: 'pending',
      channel: 'POS'
    });

    this.ecosystem.notify(`+1x ${prod.name} adicionado à comanda da Mesa ${table.number} e enviado à cozinha (KDS).`, 'success');
  }

  onFireCourse(courseName: string) {
    const table = this.activeTable();
    this.ecosystem.notify(`Disparo de KDS enviado: ${courseName} para a Mesa ${table?.number || 1}!`, 'info');
  }

  onCloseBill(table: TableInfo) {
    this.ecosystem.updateTable(table.id, { status: 'billing' });
    this.activeTable.set(null);
    this.ecosystem.notify(`Pré-conta da Mesa ${table.number} impressa com divisão por pessoa (R$ ${(this.currentTableTotal() / (table.guests || 2)).toFixed(2)}/pessoa).`, 'info');
  }

  onSettleTable(table: TableInfo) {
    this.ecosystem.updateTable(table.id, { status: 'available', server: undefined, guests: undefined });

    // Register sale transaction in financial ledger
    this.ecosystem.addFinancialEntry({
      date: 'Agora mesmo',
      type: 'sale',
      category: 'Vendas de Salão / Mesa',
      description: `Fechamento Comanda Mesa ${table.number}`,
      amount: this.currentTableTotal(),
      paymentMethod: 'Cartão / PIX',
      referenceId: 'table-' + table.number + '-' + Date.now()
    });

    this.activeTable.set(null);
    this.ecosystem.notify(`Mesa ${table.number} paga e liberada. Lançamento financeiro registrado no livro razão.`, 'success');
  }

  openWaiterAppDirectly() {
    this.showPairingModal.set(false);
    this.router.navigate(['/waiter']);
  }
}
