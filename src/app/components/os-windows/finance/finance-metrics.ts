import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-finance-metrics',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Receita Bruta Acumulada</span>
        <div class="text-xl font-serif font-black text-emerald-800 mt-0.5">R$ {{ totalSales().toFixed(2) }}</div>
        <span class="text-[10px] text-emerald-700 font-bold">100% Conciliado</span>
      </div>

      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Despesas &amp; Custos (CMV)</span>
        <div class="text-xl font-serif font-black text-rose-800 mt-0.5">R$ {{ totalExpenses().toFixed(2) }}</div>
        <span class="text-[10px] text-rose-700 font-bold">Saídas Lançadas</span>
      </div>

      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Resultado / Lucro Líquido</span>
        <div class="text-xl font-serif font-black mt-0.5" [class]="netProfit() >= 0 ? 'text-emerald-800' : 'text-rose-800'">
          R$ {{ netProfit().toFixed(2) }}
        </div>
        <span class="text-[10px] font-bold" [class]="netProfit() >= 0 ? 'text-emerald-700' : 'text-rose-700'">
          Margem Líquida: {{ margin().toFixed(1) }}%
        </span>
      </div>

      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Operações Registradas</span>
        <div class="text-xl font-serif font-black text-stone-900 mt-0.5">{{ opsCount() }} Ops</div>
        <span class="text-[10px] text-stone-600 font-bold">Auditado por Protocolo</span>
      </div>
    </div>
  `
})
export class FinanceMetricsComponent {
  totalSales = input.required<number>();
  totalExpenses = input.required<number>();
  netProfit = input.required<number>();
  margin = input.required<number>();
  opsCount = input.required<number>();
}
