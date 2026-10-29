import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reports-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-xs text-white font-mono">
      
      <!-- Reports Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold shadow-md">
            <mat-icon class="text-xl">analytics</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-serif font-black text-base text-white uppercase tracking-tight">Inteligência de Varejo & KPIs</h1>
              <span class="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                ANALYTICS LIVE
              </span>
            </div>
            <p class="text-xs text-slate-400 uppercase tracking-tight">Análise de giro de estoque, curva ABC, horários de pico e margem por SKU.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <select class="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase text-indigo-400 outline-none focus:border-indigo-500">
            <option>Hoje (Tempo Real)</option>
            <option>Últimos 7 dias</option>
            <option>Mês Atual</option>
          </select>
          <button class="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-2 px-4 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all">
            Exportar PDF
          </button>
        </div>
      </div>

      <!-- Retail KPIs Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Ticket Médio</span>
          <div class="text-2xl font-black text-white">R$ {{ ticketMedio().toFixed(2) }}</div>
          <div class="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
            <mat-icon class="text-[10px]">trending_up</mat-icon> +12% vs Ontem
          </div>
        </div>

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Giro de Estoque</span>
          <div class="text-2xl font-black text-white">4.2x</div>
          <div class="text-[9px] text-indigo-400 font-bold uppercase flex items-center gap-1">
            <mat-icon class="text-[10px]">refresh</mat-icon> Reposição Ideal
          </div>
        </div>

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Margem Média</span>
          <div class="text-2xl font-black text-white">{{ margemMedia().toFixed(1) }}%</div>
          <div class="text-[9px] text-amber-400 font-bold uppercase flex items-center gap-1">
            <mat-icon class="text-[10px]">remove_red_eye</mat-icon> Monitorar CMV
          </div>
        </div>

        <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Itens por Venda</span>
          <div class="text-2xl font-black text-white">3.8</div>
          <div class="text-[9px] text-emerald-400 font-bold uppercase flex items-center gap-1">
            <mat-icon class="text-[10px]">shopping_basket</mat-icon> Cross-selling OK
          </div>
        </div>
      </div>

      <!-- Main Visualizations -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
        
        <!-- Best Sellers (Retail ABC Curve) -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4 overflow-hidden shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-black text-xs uppercase tracking-tight text-white flex items-center gap-2">
              <mat-icon class="text-indigo-400">workspace_premium</mat-icon> Top 5 Best Sellers (Curva ABC)
            </h3>
            <span class="text-[9px] font-black text-slate-500 uppercase">Volume de Vendas</span>
          </div>

          <div class="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-2">
            @for (item of topSellers(); track item.name) {
              <div class="space-y-1.5">
                <div class="flex justify-between items-end">
                  <span class="font-black text-[10px] text-slate-300 uppercase tracking-tight">{{ item.name }}</span>
                  <span class="font-mono text-[10px] font-black text-indigo-400">{{ item.sales }} un</span>
                </div>
                <div class="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                  <div 
                    class="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-1000"
                    [style.width.%]="(item.sales / topSellers()[0].sales) * 100">
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Peak Hours / Traffic Analysis -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col space-y-4 overflow-hidden shadow-xl">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="font-black text-xs uppercase tracking-tight text-white flex items-center gap-2">
              <mat-icon class="text-amber-400">schedule</mat-icon> Fluxo de Vendas por Horário
            </h3>
            <span class="text-[9px] font-black text-slate-500 uppercase">Volume de Transações</span>
          </div>

          <div class="flex-1 flex items-end justify-between gap-1 pb-2">
            @for (hour of peakHours(); track hour.time) {
              <div class="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  class="w-full bg-indigo-500/20 group-hover:bg-indigo-500/40 border-t-2 border-indigo-500 rounded-t-lg transition-all duration-1000 relative"
                  [style.height.%]="hour.intensity * 100">
                  <span class="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ hour.intensity * 24 }} vds
                  </span>
                </div>
                <span class="text-[8px] font-black text-slate-500 group-hover:text-white transition-colors uppercase">{{ hour.time }}</span>
              </div>
            }
          </div>
          <p class="text-[9px] text-slate-600 uppercase text-center font-bold tracking-widest border-t border-slate-800/50 pt-2 italic">
            Horário de Pico detectado: 12:00h - 14:30h (Almoço / Varejo Alimentar)
          </p>
        </div>

      </div>

      <!-- Inventory Performance Table -->
      <div class="bg-slate-950/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-64">
        <div class="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center shrink-0">
          <h3 class="font-black text-xs uppercase tracking-tight text-white flex items-center gap-2">
            <mat-icon class="text-emerald-400">inventory_2</mat-icon> Performance de SKU & Lucratividade
          </h3>
          <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tempo Real</span>
        </div>
        
        <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table class="w-full text-left text-[10px] border-collapse">
            <thead class="sticky top-0 bg-slate-900 z-10">
              <tr class="text-slate-500 uppercase font-black tracking-widest border-b border-slate-800">
                <th class="p-3">PRODUTO</th>
                <th class="p-3">ESTOQUE</th>
                <th class="p-3">CUSTO</th>
                <th class="p-3">VENDA</th>
                <th class="p-3">MARGEM R$</th>
                <th class="p-3">MARGEM %</th>
                <th class="p-3">STATUS</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              @for (p of ecosystem.products(); track p.id) {
                <tr class="hover:bg-slate-900/50 transition-colors">
                  <td class="p-3 font-black text-white uppercase">{{ p.name }}</td>
                  <td class="p-3">
                    <span [class]="p.stock <= p.minStock ? 'text-rose-400' : 'text-emerald-400'" class="font-mono font-bold">{{ p.stock }} un</span>
                  </td>
                  <td class="p-3 font-mono text-slate-400">R$ {{ p.costPrice.toFixed(2) }}</td>
                  <td class="p-3 font-mono text-white">R$ {{ p.price.toFixed(2) }}</td>
                  <td class="p-3 font-mono text-emerald-400 font-bold">R$ {{ (p.price - p.costPrice).toFixed(2) }}</td>
                  <td class="p-3">
                    <div class="flex items-center gap-1.5">
                      <div class="w-8 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div class="h-full bg-emerald-500" [style.width.%]="((p.price - p.costPrice) / p.price) * 100"></div>
                      </div>
                      <span class="font-mono text-[9px] font-black text-emerald-500">{{ (((p.price - p.costPrice) / p.price) * 100).toFixed(0) }}%</span>
                    </div>
                  </td>
                  <td class="p-3">
                    @if (p.stock <= p.minStock) {
                      <span class="text-[8px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.5 rounded uppercase font-black">REPOR AGORA</span>
                    } @else {
                      <span class="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black">OK</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `
})
export class ReportsWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  ticketMedio = computed(() => {
    const orders = this.ecosystem.orders();
    if (orders.length === 0) return 45.80;
    return orders.reduce((sum, o) => sum + o.total, 0) / orders.length;
  });

  margemMedia = computed(() => {
    const prods = this.ecosystem.products();
    if (prods.length === 0) return 65;
    const totalMargem = prods.reduce((sum, p) => sum + ((p.price - p.costPrice) / p.price), 0);
    return (totalMargem / prods.length) * 100;
  });

  topSellers = signal([
    { name: 'Burger Artisan Trufado', sales: 142 },
    { name: 'Batata Rústica Cheddar', sales: 98 },
    { name: 'Craft IPA 500ml', sales: 76 },
    { name: 'Coca-Cola Zero', sales: 65 },
    { name: 'Cheesecake Frutas Vermelhas', sales: 42 }
  ]);

  peakHours = signal([
    { time: '08h', intensity: 0.1 },
    { time: '10h', intensity: 0.3 },
    { time: '12h', intensity: 0.95 },
    { time: '14h', intensity: 0.8 },
    { time: '16h', intensity: 0.4 },
    { time: '18h', intensity: 0.7 },
    { time: '20h', intensity: 0.85 },
    { time: '22h', intensity: 0.5 }
  ]);
}
