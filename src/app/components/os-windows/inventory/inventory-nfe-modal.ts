import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-inventory-nfe-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-lg w-full p-6 text-stone-900 space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
          <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
            <mat-icon class="text-amber-700">receipt</mat-icon>
            Lançar Entrada de NFe de Compra
          </h3>
          <button type="button" (click)="closeRequest.emit()" class="text-stone-400 hover:text-stone-800 font-bold">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="nfeSupplier" class="block font-bold text-stone-800 mb-1">Fornecedor / Distribuidor</label>
            <input id="nfeSupplier" #nfeSupplier type="text" value="Distribuidora Central de Alimentos Ltda" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
          </div>

          <div>
            <label for="nfeKey" class="block font-bold text-stone-800 mb-1">Chave de Acesso NFe (44 dígitos)</label>
            <input id="nfeKey" #nfeKey type="text" value="35241100148829100001445500100009823112345678" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-mono text-[10px] focus:outline-none focus:border-amber-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="nfeSelectProd" class="block font-bold text-stone-800 mb-1">Insumo Recebido</label>
              <select id="nfeSelectProd" #nfeProdId class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
                @for (p of products(); track p.id) {
                  <option [value]="p.id">{{ p.name }} (Atual: {{ p.stock }})</option>
                }
              </select>
            </div>

            <div>
              <label for="nfeQty" class="block font-bold text-stone-800 mb-1">Quantidade Recebida</label>
              <input id="nfeQty" #nfeQty type="number" value="50" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
            </div>
          </div>

          <div>
            <label for="nfeUnitCost" class="block font-bold text-stone-800 mb-1">Novo Custo Unitário NFe (R$)</label>
            <input id="nfeUnitCost" #nfeUnitCost type="number" step="0.10" value="12.50" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
          </div>
        </div>

        <div class="flex gap-3 pt-3 border-t border-[#e8dfce]">
          <button type="button" (click)="closeRequest.emit()" class="flex-1 bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 font-bold py-2.5 rounded-xl border border-[#d6c3aa] text-xs">
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="submit(nfeProdId.value, nfeQty.value, nfeUnitCost.value, nfeSupplier.value)" 
            class="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2.5 rounded-xl shadow-lg border border-amber-400/50 text-xs">
            Efetivar NFe no Estoque
          </button>
        </div>
      </div>
    </div>
  `
})
export class InventoryNfeModal {
  products = input.required<ProductItem[]>();
  closeRequest = output<void>();
  save = output<{
    productId: string;
    quantity: number;
    costPrice: number;
    supplier: string;
  }>();

  submit(prodId: string, qtyStr: string, costStr: string, supplier: string) {
    this.save.emit({
      productId: prodId,
      quantity: Number(qtyStr) || 0,
      costPrice: Number(costStr) || 0,
      supplier
    });
  }
}
