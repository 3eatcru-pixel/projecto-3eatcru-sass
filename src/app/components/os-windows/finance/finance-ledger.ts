import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FinancialRecord } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-finance-ledger',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex-1 overflow-hidden bg-[#fcfaf4] border border-[#ded4c2] rounded-2xl p-4 shadow-xl text-stone-900 flex flex-col">
      <div class="flex justify-between items-center pb-2 border-b border-[#d0c2a8] mb-2">
        <h3 class="font-serif font-black text-stone-900 text-sm uppercase tracking-wider flex items-center gap-2">
          <mat-icon class="text-amber-800">receipt_long</mat-icon> Extrato Consolidado do Dia
        </h3>
        <button 
          type="button" 
          (click)="exportCsv.emit()"
          class="text-[10px] font-mono font-bold text-amber-900 hover:text-amber-700 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer">
          <mat-icon class="text-xs">download</mat-icon> Exportar Relatório CSV
        </button>
      </div>

      <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b-2 border-[#d0c2a8] text-[10px] font-mono font-bold uppercase tracking-wider text-amber-950">
              <th class="py-2.5 px-3">HORÁRIO</th>
              <th class="py-2.5 px-3">TIPO</th>
              <th class="py-2.5 px-3">CATEGORIA</th>
              <th class="py-2.5 px-3">DESCRIÇÃO</th>
              <th class="py-2.5 px-3">FORMA PAGTO</th>
              <th class="py-2.5 px-3 text-right">VALOR</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e8dfce]">
            @for (f of financials(); track f.id) {
              <tr class="hover:bg-[#f2e8d5] transition-colors">
                <td class="py-3 px-3 font-mono font-bold text-stone-600 text-[11px]">{{ f.date }}</td>
                
                <td class="py-3 px-3">
                  @if (f.type === 'sale') {
                    <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      Entrada
                    </span>
                  } @else {
                    <span class="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold">
                      Saída
                    </span>
                  }
                </td>

                <td class="py-3 px-3 font-bold text-stone-900 uppercase">
                  {{ f.category }}
                </td>

                <td class="py-3 px-3 text-stone-700">
                  <div class="flex items-center gap-1.5">
                    <span>{{ f.description }}</span>
                    @if (f.isSimulated || f.mode === 'simulation') {
                      <span class="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1 py-0.2 rounded font-mono font-bold">SIM</span>
                    }
                  </div>
                </td>

                <td class="py-3 px-3 font-mono text-[10px] uppercase font-bold text-amber-900">
                  {{ f.paymentMethod }}
                </td>

                <td class="py-3 px-3 text-right font-serif font-black text-sm" [class]="f.type === 'sale' ? 'text-emerald-800' : 'text-rose-800'">
                  {{ f.type === 'sale' ? '+' : '-' }} R$ {{ f.amount.toFixed(2) }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class FinanceLedgerComponent {
  financials = input.required<FinancialRecord[]>();
  exportCsv = output<void>();
}
