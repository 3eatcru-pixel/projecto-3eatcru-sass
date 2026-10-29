import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-finance-dre',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex-1 overflow-y-auto bg-[#fcfaf4] border border-[#ded4c2] rounded-2xl p-6 shadow-xl text-stone-900 font-mono space-y-4 custom-scrollbar">
      <div class="border-b-2 border-stone-800 pb-3 flex justify-between items-center">
        <div>
          <h2 class="font-serif font-black text-lg text-stone-900 uppercase">Demonstrativo do Resultado do Exercício (DRE)</h2>
          <p class="text-[10px] text-stone-600">Apuração gerencial de receitas, deduções de impostos e custo de mercadoria vendida.</p>
        </div>
        <span class="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 rounded-lg text-xs font-bold">
          Competência: Mês Vigente
        </span>
      </div>

      <div class="space-y-2 text-xs">
        <div class="flex justify-between py-2 border-b border-stone-300 font-bold text-stone-900">
          <span>(+) RECEITA BRUTA DE VENDAS (PDV + Delivery + Balcão)</span>
          <span class="text-emerald-800 font-black">R$ {{ totalSales().toFixed(2) }}</span>
        </div>

        <div class="flex justify-between py-2 border-b border-stone-200 text-stone-700 pl-4">
          <span>(-) Deduções de Impostos (NFC-e Simples Nacional ~6.5%)</span>
          <span class="text-rose-700">- R$ {{ (totalSales() * 0.065).toFixed(2) }}</span>
        </div>

        <div class="flex justify-between py-2 border-b-2 border-stone-400 font-black text-stone-900 bg-stone-100 px-2 rounded">
          <span>(=) RECEITA LÍQUIDA DE VENDAS</span>
          <span class="text-emerald-900">R$ {{ (totalSales() * 0.935).toFixed(2) }}</span>
        </div>

        <div class="flex justify-between py-2 border-b border-stone-200 text-stone-700 pl-4">
          <span>(-) Custo dos Produtos &amp; Insumos Vendidos (CMV)</span>
          <span class="text-rose-700">- R$ {{ (totalSales() * 0.35).toFixed(2) }}</span>
        </div>

        <div class="flex justify-between py-2 border-b-2 border-stone-400 font-black text-stone-900 bg-stone-100 px-2 rounded">
          <span>(=) MARGEM DE CONTRIBUIÇÃO BRUTA</span>
          <span class="text-emerald-900">R$ {{ (totalSales() * 0.585).toFixed(2) }}</span>
        </div>

        <div class="flex justify-between py-2 border-b border-stone-200 text-stone-700 pl-4">
          <span>(-) Despesas Operacionais (Sangria, Aluguel, Insumos &amp; Manutenção)</span>
          <span class="text-rose-700">- R$ {{ totalExpenses().toFixed(2) }}</span>
        </div>

        <div class="flex justify-between py-3 border-t-2 border-stone-900 font-serif font-black text-base text-stone-950 bg-amber-100 px-3 rounded-xl border border-amber-300">
          <span>(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO LÍQUIDO)</span>
          <span [class]="netProfit() >= 0 ? 'text-emerald-900' : 'text-rose-900'">
            R$ {{ netProfit().toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class FinanceDreComponent {
  totalSales = input.required<number>();
  totalExpenses = input.required<number>();
  netProfit = input.required<number>();
}
