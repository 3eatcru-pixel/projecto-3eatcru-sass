import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-inventory-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex-1 overflow-hidden bg-[#fcfaf4] border border-[#ded4c2] rounded-2xl p-4 shadow-xl text-stone-900 flex flex-col">
      <div class="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b-2 border-[#d0c2a8] text-[10px] font-mono font-bold uppercase tracking-wider text-amber-950">
              <th class="py-2.5 px-3">PRODUTO / INSUMO</th>
              <th class="py-2.5 px-3 text-center">NÍVEL DE ESTOQUE</th>
              <th class="py-2.5 px-3 text-right">PREÇO VENDA</th>
              <th class="py-2.5 px-3 text-right">CUSTO MÉDIO</th>
              <th class="py-2.5 px-3 text-center">STATUS</th>
              <th class="py-2.5 px-3 text-center">AÇÕES RÁPIDAS</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#e8dfce]">
            @for (prod of products(); track prod.id) {
              <tr class="inventory-row hover:bg-[#f2e8d5] transition-colors">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-3">
                    <img [src]="prod.image" [alt]="prod.name" class="w-10 h-10 rounded-lg object-cover border border-[#d6c7b0]" referrerpolicy="no-referrer">
                    <div>
                      <div class="font-bold text-stone-900 uppercase tracking-tight">{{ prod.name }}</div>
                      <div class="text-[10px] font-mono text-stone-500 uppercase">{{ prod.sku }} • EAN: {{ prod.barcode }}</div>
                    </div>
                  </div>
                </td>

                <td class="py-3 px-3 text-center font-mono font-bold text-stone-900">
                  <div [class.bg-rose-100]="prod.stock <= prod.minStock" [class.animate-pulse]="prod.stock <= prod.minStock" class="inline-block px-3 py-1 rounded-lg border border-transparent transition-all">
                    <span class="text-sm font-black" [class.text-rose-700]="prod.stock <= prod.minStock" [class.text-amber-950]="prod.stock > prod.minStock">{{ prod.stock }}</span> un
                  </div>
                  <span class="text-[9px] text-stone-500 block font-normal mt-0.5 uppercase">(Mín: {{ prod.minStock }})</span>
                </td>

                <td class="py-3 px-3 text-right">
                  <div class="font-bold text-amber-900">R$ {{ prod.price.toFixed(2) }}</div>
                  @if (prod.wholesalePrice) {
                    <div class="text-[9px] font-black text-indigo-600 uppercase">Atacado: R$ {{ prod.wholesalePrice.toFixed(2) }}</div>
                  }
                </td>

                <td class="py-3 px-3 text-right font-medium text-stone-600">
                  R$ {{ prod.costPrice.toFixed(2) }}
                </td>

                <td class="py-3 px-3 text-center">
                  @if (prod.stock <= prod.minStock) {
                    <span class="bg-rose-100 text-rose-800 border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse uppercase">
                      Estoque Crítico
                    </span>
                  } @else {
                    <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                      Regular
                    </span>
                  }
                </td>

                <td class="py-3 px-3 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <button 
                      type="button"
                      (click)="adjustStock.emit({productId: prod.id, delta: -1})" 
                      title="Saída / Baixa"
                      class="w-7 h-7 rounded bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-900 border border-[#d6c3aa] font-black text-xs cursor-pointer flex items-center justify-center transition-all">
                      -
                    </button>
                    <button 
                      type="button"
                      (click)="adjustStock.emit({productId: prod.id, delta: 1})" 
                      title="Entrada Manual"
                      class="w-7 h-7 rounded bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-900 border border-[#d6c3aa] font-black text-xs cursor-pointer flex items-center justify-center transition-all">
                      +
                    </button>
                    <button
                      type="button"
                      (click)="openLossModal.emit(prod)"
                      title="Registrar Avaria / Desperdício"
                      class="px-2 py-1 rounded bg-rose-950/10 hover:bg-rose-900/20 text-rose-700 border border-rose-300 font-bold text-[10px] cursor-pointer flex items-center gap-0.5 uppercase">
                      <mat-icon class="text-xs">report_problem</mat-icon> Avaria
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class InventoryTableComponent {
  products = input.required<ProductItem[]>();
  adjustStock = output<{productId: string, delta: number}>();
  openLossModal = output<ProductItem>();
}
