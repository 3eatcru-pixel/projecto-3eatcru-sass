import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartItem } from '../../../models/ecosystem.model';

interface HeldSale {
  id: string;
  saleNumber: number;
  tableOrClient: string;
  items: CartItem[];
  total: number;
  time: string;
}

@Component({
  selector: 'app-pos-recall-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
      <div class="bg-slate-900 border-2 border-amber-500/40 rounded-[2.5rem] max-w-lg w-full p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 class="font-black text-sm uppercase text-amber-400 flex items-center gap-2">
            <mat-icon>pause_circle</mat-icon> Vendas Retidas em Espera (Hold)
          </h3>
          <button type="button" (click)="closeRequest.emit()" class="text-slate-500 hover:text-white font-bold">✕</button>
        </div>

        <div class="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
          @if (heldSales().length === 0) {
            <div class="py-8 text-center text-slate-500">
              <mat-icon class="text-3xl mb-2">inbox</mat-icon>
              <p class="text-[10px] uppercase font-black">Nenhuma venda em espera</p>
            </div>
          } @else {
            @for (h of heldSales(); track h.id) {
              <div class="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <span class="font-black text-white block">Venda #{{ h.saleNumber }} ({{ h.tableOrClient }})</span>
                  <span class="text-[10px] text-slate-500">{{ h.items.length }} itens • {{ h.time }}</span>
                </div>

                <div class="flex items-center gap-3">
                  <strong class="text-orange-400 font-mono">R$ {{ h.total.toFixed(2) }}</strong>
                  <button type="button" (click)="recall.emit(h)" class="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs">
                    Recuperar
                  </button>
                </div>
              </div>
            }
          }
        </div>
      </div>
    </div>
  `
})
export class PosRecallModal {
  heldSales = input.required<HeldSale[]>();
  closeRequest = output<void>();
  recall = output<HeldSale>();
}
