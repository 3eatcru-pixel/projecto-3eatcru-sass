import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { OrderTransaction } from '../../models/ecosystem.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-order-history-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-xs text-white font-mono">
      
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-[#1e293b] shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-900/20">
            <mat-icon class="text-xl">history</mat-icon>
          </div>
          <div>
            <h1 class="font-serif font-black text-base text-white uppercase tracking-tight">Histórico Geral de Vendas</h1>
            <p class="text-xs text-slate-400">Rastro completo de transações POS, Delivery e E-commerce.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="relative">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</mat-icon>
            <input 
              #searchInput
              type="text" 
              placeholder="PESQUISAR PEDIDO / CLIENTE..."
              (input)="filterText.set(searchInput.value)"
              class="bg-[#0f172a] border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[10px] w-64 focus:outline-none focus:border-indigo-500 transition-all uppercase font-black">
          </div>
          <button type="button" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/5 transition-all">
            <mat-icon class="text-sm">filter_list</mat-icon>
          </button>
        </div>
      </div>

      <!-- Main Content: Table -->
      <div class="flex-1 overflow-hidden bg-[#0f172a]/40 rounded-2xl border border-white/5 flex flex-col">
        <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table class="w-full text-left border-collapse">
            <thead class="sticky top-0 bg-[#1e293b] text-slate-400 font-black text-[9px] uppercase tracking-widest z-10">
              <tr>
                <th class="p-4 border-b border-white/5"># Pedido</th>
                <th class="p-4 border-b border-white/5">Cliente / Origem</th>
                <th class="p-4 border-b border-white/5">Data/Hora</th>
                <th class="p-4 border-b border-white/5 text-center">Itens</th>
                <th class="p-4 border-b border-white/5 text-center">Canal</th>
                <th class="p-4 border-b border-white/5 text-center">Status</th>
                <th class="p-4 border-b border-white/5 text-right">Total</th>
                <th class="p-4 border-b border-white/5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/5">
              @for (order of filteredOrders(); track order.id) {
                <tr class="hover:bg-white/[0.02] transition-colors group">
                  <td class="p-4 font-black text-indigo-400 font-mono">
                    <div class="flex items-center gap-1.5">
                      <span>{{ order.orderNumber }}</span>
                      @if (order.isSimulated || order.mode === 'simulation') {
                        <span class="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1 py-0.2 rounded font-mono font-bold">SIM</span>
                      }
                    </div>
                  </td>
                  <td class="p-4">
                    <div class="flex flex-col">
                      <span class="font-bold text-white uppercase">{{ order.customerName || 'Consumidor Final' }}</span>
                      <span class="text-[9px] text-slate-500 uppercase">{{ order.type }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-slate-400">{{ order.createdAt }}</td>
                  <td class="p-4 text-center font-mono text-slate-300">{{ order.items.length }}</td>
                  <td class="p-4 text-center">
                    <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-white/5">
                      <mat-icon class="text-[10px] text-indigo-400">{{ getChannelIcon(order.channel) }}</mat-icon>
                      <span class="text-[8px] font-black uppercase tracking-tighter">{{ order.channel }}</span>
                    </div>
                  </td>
                  <td class="p-4 text-center">
                    <span 
                      [class]="getStatusClass(order.status)"
                      class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border">
                      {{ order.status }}
                    </span>
                  </td>
                  <td class="p-4 text-right font-mono font-black text-emerald-400">R$ {{ order.total.toFixed(2) }}</td>
                  <td class="p-4 text-right">
                    <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" (click)="reprintOrder(order)" class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all">
                        <mat-icon class="text-sm">print</mat-icon>
                      </button>
                      <button type="button" (click)="viewOrderDetails(order)" class="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/30 transition-all">
                        <mat-icon class="text-sm">visibility</mat-icon>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          @if (filteredOrders().length === 0) {
            <div class="p-12 text-center space-y-4">
              <mat-icon class="text-5xl text-slate-800">search_off</mat-icon>
              <p class="text-slate-500 font-black uppercase tracking-widest">Nenhum registro localizado no banco de dados.</p>
            </div>
          }
        </div>
        
        <!-- Summary Bar -->
        <div class="p-4 bg-[#1e293b] border-t border-white/5 flex justify-between items-center shrink-0">
          <div class="flex gap-6">
            <div class="flex flex-col">
              <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Registros Totais</span>
              <span class="text-sm font-black text-white font-mono">{{ filteredOrders().length }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Volume Total Bruto</span>
              <span class="text-sm font-black text-emerald-400 font-mono">R$ {{ totalVolume().toFixed(2) }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2">
             <button class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest transition-all border border-white/5">Exportar CSV</button>
             <button class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-black text-[9px] uppercase tracking-widest transition-all border border-white/5">Imprimir Relatório</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
  `]
})
export class OrderHistoryWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly filterText = signal<string>('');

  filteredOrders = computed(() => {
    const q = this.filterText().toLowerCase();
    const all = [...this.ecosystem.orders()];
    if (!q) return all;
    return all.filter(o => 
      o.orderNumber.toLowerCase().includes(q) || 
      (o.customerName || '').toLowerCase().includes(q)
    );
  });

  totalVolume = computed(() => this.filteredOrders().reduce((sum, o) => sum + o.total, 0));

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'preparing': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'pending': return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'cancelled': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  }

  getChannelIcon(channel: string): string {
    switch (channel) {
      case 'iFood': return 'shopping_bag';
      case 'WhatsApp': return 'chat';
      case 'POS': return 'point_of_sale';
      case 'Customer Storefront': return 'public';
      default: return 'apps';
    }
  }

  reprintOrder(order: OrderTransaction) {
    this.ecosystem.notify(`Reimpressão térmica solicitada para Pedido ${order.orderNumber}.`, 'info');
  }

  viewOrderDetails(order: OrderTransaction) {
    this.ecosystem.notify(`Visualizando detalhes expandidos do Pedido ${order.orderNumber}.`, 'info');
  }
}
