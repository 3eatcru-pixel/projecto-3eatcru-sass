import { ChangeDetectionStrategy, Component, inject, signal, computed, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { ExternalOrder } from '../../models/ecosystem.model';
import { animate, stagger } from 'motion';

export interface Motoboy {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  plate: string;
  status: 'Disponível' | 'Em Rota' | 'Pausa';
  deliveriesToday: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ifood-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex h-full bg-slate-950 text-slate-200 overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl">
      <!-- SIDEBAR: LOGISTICS CONTROL -->
      <div class="w-20 lg:w-72 border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-md">
        <div class="p-6 bg-slate-950/40 border-b border-white/5 flex items-center gap-4">
          <div class="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-900/40 shrink-0">
            <mat-icon class="text-2xl">delivery_dining</mat-icon>
          </div>
          <div class="hidden lg:block">
            <h2 class="text-[10px] font-black tracking-[0.2em] text-rose-500 uppercase">Logistics Node</h2>
            <h1 class="text-lg font-black text-white uppercase tracking-tighter mt-1 italic">iFood Gateway</h1>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-2">
          @for (nav of navItems; track nav.id) {
            <button 
              type="button"
              (click)="activeTab.set(nav.id)"
              class="w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group border border-transparent cursor-pointer"
              [class]="activeTab() === nav.id ? 'bg-rose-600/10 border-rose-500/20 text-white font-bold' : 'text-slate-500 hover:bg-white/5'">
              <mat-icon [class]="activeTab() === nav.id ? 'text-rose-500' : 'text-slate-600 group-hover:text-slate-400'">{{ nav.icon }}</mat-icon>
              <span class="hidden lg:inline text-[10px] font-black uppercase tracking-widest">{{ nav.label }}</span>
              @if (nav.id === 'orders' && pendingCount() > 0) {
                <div class="ml-auto hidden lg:flex w-5 h-5 rounded-full bg-rose-600 text-white text-[9px] font-black items-center justify-center border-2 border-slate-900 shadow-lg animate-pulse">{{ pendingCount() }}</div>
              }
            </button>
          }
        </nav>

        <div class="p-6 border-t border-white/5">
          <div class="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
            <div class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <div class="hidden lg:block flex-1 min-w-0">
              <div class="text-[9px] font-black text-white uppercase tracking-widest truncate">iFood Polling Active</div>
              <div class="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Sincronizado via OAuth2</div>
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
        <!-- Grid Pattern Overlay -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <!-- TAB 1: PEDIDOS -->
        @if (activeTab() === 'orders') {
          <!-- Top Bar: Metrics -->
          <div class="h-20 bg-slate-900/60 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between relative z-10 shrink-0">
            <div>
              <h1 class="text-xl font-black text-white uppercase tracking-tight">Stream de Pedidos iFood</h1>
              <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Status Global de Recebimento Externa</p>
            </div>
            <div class="flex items-center gap-6">
              <div class="hidden md:flex flex-col items-end px-6 border-r border-white/5">
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">SLA Médio de Preparo</span>
                <div class="flex items-center gap-2 mt-1">
                  <mat-icon class="text-sm text-rose-500">timer</mat-icon>
                  <span class="text-sm font-black text-white uppercase tracking-widest font-mono">18:30 min</span>
                </div>
              </div>
              <button 
                type="button"
                (click)="homologOrder()"
                class="bg-rose-600 hover:bg-rose-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-rose-900/20 border border-rose-400/20 flex items-center gap-2 cursor-pointer active:scale-95">
                <mat-icon class="text-sm">add_shopping_cart</mat-icon> Homologar Pedido Externo
              </button>
            </div>
          </div>

          <!-- Orders Grid -->
          <div #orderGrid class="p-8 flex-1 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-8 content-start custom-scrollbar relative z-10">
            @for (order of ecosystem.externalOrders(); track order.id) {
              @if (order.source === 'ifood') {
                <div class="order-card bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col hover:border-rose-500/30 transition-all group">
                  <!-- Order Header -->
                  <div class="p-6 border-b border-white/5 flex justify-between items-start bg-slate-950/40">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                        <mat-icon>shopping_bag</mat-icon>
                      </div>
                      <div>
                        <div class="flex items-center gap-2 mb-1">
                          <span class="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-rose-500/5 border border-rose-500/20 italic">iFood Direct</span>
                          <span class="text-[10px] font-mono font-black text-slate-500 uppercase">{{ order.orderId }}</span>
                        </div>
                        <h3 class="font-black text-lg text-white uppercase tracking-tight group-hover:text-rose-500 transition-colors">{{ order.customerName }}</h3>
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="text-xl font-black text-emerald-400 font-mono">R$ {{ order.total.toFixed(2) }}</div>
                      <div class="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1.5">{{ order.createdAt | date:'dd/MM HH:mm' }}</div>
                    </div>
                  </div>

                  <!-- Order Items -->
                  <div class="p-6 flex-1 space-y-3">
                    <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Itens do Pedido</span>
                    @for (item of order.items; track $index) {
                      <div class="flex justify-between items-center bg-slate-950/50 p-3 rounded-xl border border-white/5">
                        <span class="text-[11px] font-black text-slate-300 uppercase tracking-tight">{{ item }}</span>
                        <mat-icon class="text-xs text-emerald-500">check_circle</mat-icon>
                      </div>
                    }
                  </div>

                  <!-- Order Footer Actions -->
                  <div class="p-6 bg-slate-950/60 border-t border-white/5 flex gap-3">
                    @if (order.status === 'pending') {
                      <button 
                        type="button"
                        (click)="approveOrder(order)"
                        class="flex-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/20 border border-emerald-400/20 active:scale-95 cursor-pointer">
                        Aprovar e Enviar p/ KDS
                      </button>
                      <button 
                        type="button"
                        (click)="openRejectModal(order)"
                        class="flex-1 bg-slate-900 hover:bg-rose-600 hover:text-white text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/5 active:scale-95 cursor-pointer">
                        Rejeitar
                      </button>
                    } @else if (order.status === 'accepted') {
                      <button 
                        type="button"
                        (click)="dispatchOrder(order.id)"
                        class="flex-2 bg-sky-600 hover:bg-sky-500 text-slate-950 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-sky-900/20 border border-sky-400/20 active:scale-95 cursor-pointer">
                        Chamar Motoboy / Despachar
                      </button>
                      <button 
                        type="button"
                        (click)="ecosystem.notify('Comprovante ESC/POS impresso.', 'info')"
                        class="flex-1 bg-slate-900 text-slate-400 hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/5 transition-all cursor-pointer">
                        <mat-icon class="text-lg">print</mat-icon>
                      </button>
                    } @else {
                      <div class="flex-1 text-center py-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] bg-slate-900/50 rounded-2xl border border-white/5">
                        Status: {{ order.status.toUpperCase() }}
                      </div>
                    }
                  </div>
                </div>
              }
            }
          </div>
        }

        <!-- TAB 2: LOGÍSTICA & ENTREGADORES -->
        @if (activeTab() === 'logistics') {
          <div class="p-8 flex-1 overflow-y-auto space-y-8 custom-scrollbar relative z-10">
            <div class="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h2 class="text-xl font-black text-white uppercase tracking-tight">Frota de Entregadores iFood / Própria</h2>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Gestão de Motoboys & Rastreamento Geodésico</p>
              </div>
              <button 
                type="button"
                (click)="ecosystem.notify('Solicitação de entregador iFood Extra enviada!', 'success')"
                class="bg-rose-600 hover:bg-rose-500 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg">
                <mat-icon class="text-sm">two_wheeler</mat-icon> Chamar Motoboy Sob Demanda
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              @for (mb of motoboys(); track mb.id) {
                <div class="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-md">
                  <div class="flex justify-between items-start">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                        <mat-icon class="text-2xl">person</mat-icon>
                      </div>
                      <div>
                        <h3 class="font-black text-white uppercase text-sm">{{ mb.name }}</h3>
                        <p class="text-[9px] text-slate-500 font-mono font-bold">{{ mb.phone }}</p>
                      </div>
                    </div>
                    <span 
                      [class]="mb.status === 'Disponível' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'"
                      class="px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest">
                      {{ mb.status }}
                    </span>
                  </div>

                  <div class="p-3 bg-slate-950 rounded-2xl border border-white/5 space-y-1.5 text-[9px]">
                    <div class="flex justify-between text-slate-400 font-black uppercase">
                      <span>Veículo / Placa:</span>
                      <strong class="text-white">{{ mb.vehicle }} ({{ mb.plate }})</strong>
                    </div>
                    <div class="flex justify-between text-slate-400 font-black uppercase">
                      <span>Entregas Concluídas Hoje:</span>
                      <strong class="text-emerald-400 font-mono">{{ mb.deliveriesToday }} corridas</strong>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 3: CARDÁPIO SINCRONIZADO -->
        @if (activeTab() === 'menu') {
          <div class="p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar relative z-10">
            <div class="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <h2 class="text-xl font-black text-white uppercase tracking-tight">Sincronização de Cardápio iFood</h2>
                <p class="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Pausa rápida de produtos e gestão de estoque na plataforma</p>
              </div>
              <button 
                type="button"
                (click)="ecosystem.notify('Cardápio sincronizado integralmente com os servidores do iFood!', 'success')"
                class="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-lg">
                <mat-icon class="text-sm">sync</mat-icon> Sincronizar Agora
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (p of ecosystem.products(); track p.id) {
                <div class="bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4 backdrop-blur-md flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <img [src]="p.image" class="w-14 h-14 rounded-2xl object-cover border border-white/10" alt="product">
                    <div>
                      <h4 class="font-black text-white uppercase text-xs">{{ p.name }}</h4>
                      <p class="text-emerald-400 font-mono font-black text-xs mt-0.5">R$ {{ p.price.toFixed(2) }}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    (click)="toggleProductAvailability(p.id)"
                    [class]="p.availableOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'"
                    class="px-4 py-2 rounded-2xl border text-[9px] font-black uppercase tracking-widest cursor-pointer transition-all">
                    {{ p.availableOnline ? 'Disponível' : 'Pausado' }}
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- TAB 4: CONFIGURAÇÕES DE INTEGRAÇÃO -->
        @if (activeTab() === 'settings') {
          <div class="p-8 flex-1 overflow-y-auto space-y-6 custom-scrollbar relative z-10">
            <div class="bg-slate-900/40 border border-white/5 rounded-[2rem] p-8 space-y-6 max-w-2xl">
              <h2 class="text-lg font-black text-white uppercase tracking-tight flex items-center gap-3">
                <mat-icon class="text-rose-500">api</mat-icon> Credenciais da API iFood Merchant
              </h2>

              <div class="space-y-4 text-[10px]">
                <div>
                  <label for="merchantId" class="block text-slate-400 font-black uppercase tracking-widest mb-1">Merchant ID (iFood Portal)</label>
                  <input id="merchantId" type="text" value="3eat-merchant-88219" class="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-mono font-black uppercase">
                </div>

                <div>
                  <label for="clientSecret" class="block text-slate-400 font-black uppercase tracking-widest mb-1">Client Secret Token</label>
                  <input id="clientSecret" type="password" value="sec_ifood_992182012831092" class="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white font-mono font-black uppercase">
                </div>

                <div class="flex items-center justify-between p-4 bg-slate-950 rounded-2xl border border-white/5">
                  <span class="font-black uppercase text-slate-300">Auto-Aceitar Pedidos com Sinal Verde KDS:</span>
                  <input type="checkbox" checked class="w-5 h-5 accent-rose-600 rounded cursor-pointer">
                </div>
              </div>

              <button 
                type="button"
                (click)="ecosystem.notify('Credenciais iFood API validadas.', 'success')"
                class="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] cursor-pointer shadow-xl">
                Salvar Configurações de Integrador
              </button>
            </div>
          </div>
        }

      </div>
    </div>

    <!-- MODAL REJEIÇÃO PEDIDO -->
    @if (rejectModalOrder(); as order) {
      <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
        <div class="bg-slate-900 border border-white/10 rounded-[2.5rem] max-w-md w-full p-8 text-white space-y-6 shadow-2xl font-mono">
          <div class="flex justify-between items-center pb-3 border-b border-white/5">
            <h3 class="font-black text-sm uppercase text-rose-500 flex items-center gap-2">
              <mat-icon>cancel</mat-icon> Cancelar Pedido {{ order.orderId }}
            </h3>
            <button type="button" (click)="rejectModalOrder.set(null)" class="text-slate-500 hover:text-white">✕</button>
          </div>

          <div class="space-y-3 text-[10px]">
            <p class="text-slate-400 font-black uppercase">Selecione a justificativa enviada ao cliente no iFood:</p>
            <button 
              type="button" 
              (click)="confirmReject(order.id, 'Ingrediente/Prato Esgotado')"
              class="w-full text-left bg-slate-950 hover:bg-rose-600/20 border border-white/5 hover:border-rose-500/40 p-4 rounded-2xl text-slate-300 font-black uppercase tracking-widest cursor-pointer transition-all">
              1. Ingrediente ou Prato Esgotado
            </button>
            <button 
              type="button" 
              (click)="confirmReject(order.id, 'Cozinha Sobrecarregada')"
              class="w-full text-left bg-slate-950 hover:bg-rose-600/20 border border-white/5 hover:border-rose-500/40 p-4 rounded-2xl text-slate-300 font-black uppercase tracking-widest cursor-pointer transition-all">
              2. Cozinha Sobrecarregada (High Traffic)
            </button>
            <button 
              type="button" 
              (click)="confirmReject(order.id, 'Endereço Fora da Área de Cobertura')"
              class="w-full text-left bg-slate-950 hover:bg-rose-600/20 border border-white/5 hover:border-rose-500/40 p-4 rounded-2xl text-slate-300 font-black uppercase tracking-widest cursor-pointer transition-all">
              3. Endereço Fora do Raio de Entrega
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
  `]
})
export class IfoodWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  
  private readonly orderGrid = viewChild<ElementRef>('orderGrid');

  readonly activeTab = signal<'orders' | 'logistics' | 'menu' | 'settings'>('orders');
  readonly rejectModalOrder = signal<ExternalOrder | null>(null);

  readonly navItems: { id: 'orders' | 'logistics' | 'menu' | 'settings'; label: string; icon: string }[] = [
    { id: 'orders', label: 'Pedidos', icon: 'list_alt' },
    { id: 'logistics', label: 'Logística', icon: 'two_wheeler' },
    { id: 'menu', label: 'Cardápio', icon: 'menu_book' },
    { id: 'settings', label: 'Configurações', icon: 'settings' },
  ];

  readonly motoboys = signal<Motoboy[]>([
    { id: 'mb-1', name: 'Rodrigo Motta', phone: '(11) 98822-1100', vehicle: 'Honda CG 160 Fan', plate: 'ABC-8E12', status: 'Disponível', deliveriesToday: 14 },
    { id: 'mb-2', name: 'Marcos Vinicius', phone: '(11) 97711-4455', vehicle: 'Yamaha Factor 150', plate: 'XYZ-9F34', status: 'Em Rota', deliveriesToday: 18 },
    { id: 'mb-3', name: 'Elias Santos', phone: '(11) 99123-9988', vehicle: 'Scooter Voltz EV1', plate: 'EV1-3A00', status: 'Disponível', deliveriesToday: 9 }
  ]);

  readonly pendingCount = computed(() => 
    this.ecosystem.externalOrders().filter(o => o.source === 'ifood' && o.status === 'pending').length
  );

  constructor() {
    effect(() => {
      this.animateOrders();
    });
  }

  private animateOrders() {
    setTimeout(() => {
      const cards = this.orderGrid()?.nativeElement.querySelectorAll('.order-card');
      if (cards && cards.length > 0) {
        animate(cards, { opacity: [0, 1], scale: [0.95, 1] }, { duration: 0.5, delay: stagger(0.1) });
      }
    });
  }

  approveOrder(order: ExternalOrder) {
    this.ecosystem.externalOrders.update(orders =>
      orders.map(o => o.id === order.id ? { ...o, status: 'accepted' } : o)
    );

    const product = this.ecosystem.products()[0];
    this.ecosystem.addOrder({
      tenantId: this.ecosystem.currentTenantId(),
      orderNumber: order.orderId,
      type: 'delivery',
      customerName: order.customerName,
      items: [{ product, quantity: 1, notes: 'Pedido via iFood Gateway' }],
      subtotal: order.total,
      tax: 0,
      discount: 0,
      total: order.total,
      paymentMethod: 'online',
      status: 'pending',
      channel: 'iFood'
    });

    this.ecosystem.notify(`Pedido ${order.orderId} APROVADO: Encaminhado para KDS Cozinha.`, 'success');
  }

  openRejectModal(order: ExternalOrder) {
    this.rejectModalOrder.set(order);
  }

  confirmReject(orderId: string, reason: string) {
    this.ecosystem.externalOrders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status: 'rejected' } : o)
    );
    this.rejectModalOrder.set(null);
    this.ecosystem.notify(`Pedido ${orderId} CANCELADO: Motivo "${reason}".`, 'warning');
  }

  dispatchOrder(orderId: string) {
    this.ecosystem.externalOrders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status: 'dispatched' } : o)
    );
    this.ecosystem.notify(`Pedido ${orderId} DESPACHADO: Motoboy alocado.`, 'info');
  }

  toggleProductAvailability(productId: string) {
    this.ecosystem.products.update(products =>
      products.map(p => p.id === productId ? { ...p, availableOnline: !p.availableOnline } : p)
    );
    this.ecosystem.notify('Status de disponibilidade do produto atualizado no iFood.', 'info');
  }

  homologOrder() {
    const id = 'eo-' + Math.floor(Math.random() * 9000 + 1000);
    const newOrder: ExternalOrder = {
      id,
      source: 'ifood',
      orderId: '#' + Math.floor(Math.random() * 9000 + 1000),
      customerName: 'CLI-PROTOCOL-' + Math.floor(Math.random() * 100),
      items: ['1x Burger Artisan Trufado', '1x Craft IPA Beer'],
      total: 48.90 + 24.90,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    this.ecosystem.externalOrders.update(orders => [newOrder, ...orders]);
    this.ecosystem.notify('Novo pedido iFood externo homologado no sistema.', 'info');
  }
}


