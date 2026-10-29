import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-inventory-loss-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-900 space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
          <h3 class="font-serif font-black text-lg text-rose-800 flex items-center gap-2">
            <mat-icon class="text-rose-700">report_problem</mat-icon>
            Registrar Perda / Avaria
          </h3>
          <button type="button" (click)="closeRequest.emit()" class="text-stone-400 hover:text-stone-800 font-bold">✕</button>
        </div>

        <div class="bg-rose-50 border border-rose-200 rounded-xl p-3 text-rose-900 text-xs font-medium">
          Item: <strong>{{ product().name }}</strong> (Estoque Atual: {{ product().stock }} un)
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="lossQty" class="block font-bold text-stone-800 mb-1">Quantidade Descartada / Avariada</label>
            <input id="lossQty" #lossQty type="number" value="1" min="1" [max]="product().stock" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-rose-600">
          </div>

          <div>
            <label for="lossReason" class="block font-bold text-stone-800 mb-1">Motivo do Descarte</label>
            <select id="lossReason" #lossReason class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-rose-600">
              <option value="Validade Vencida">Validade Vencida</option>
              <option value="Quebra em Transporte">Quebra / Danificado no Transporte</option>
              <option value="Armazenamento Inadequado">Armazenamento / Refrigeração Falhou</option>
              <option value="Mise en place Sobra">Sobra de Produção / Cocção</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 pt-3 border-t border-[#e8dfce]">
          <button type="button" (click)="closeRequest.emit()" class="flex-1 bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 font-bold py-2.5 rounded-xl border border-[#d6c3aa] text-xs">
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="submit(lossQty.value, lossReason.value)" 
            class="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-extrabold py-2.5 rounded-xl shadow-lg border border-rose-500 text-xs">
            Confirmar Baixa por Perda
          </button>
        </div>
      </div>
    </div>
  `
})
export class InventoryLossModal {
  product = input.required<ProductItem>();
  closeRequest = output<void>();
  save = output<{
    quantity: number;
    reason: string;
  }>();

  submit(qtyStr: string, reason: string) {
    this.save.emit({
      quantity: Number(qtyStr) || 0,
      reason
    });
  }
}
