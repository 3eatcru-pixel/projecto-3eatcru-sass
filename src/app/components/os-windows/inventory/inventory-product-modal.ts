import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Supplier } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-inventory-product-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-900 space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
          <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
            <mat-icon class="text-amber-700">add_box</mat-icon>
            Cadastrar Novo Insumo
          </h3>
          <button type="button" (click)="closeRequest.emit()" class="text-stone-400 hover:text-stone-800 font-bold">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="prodNameInput" class="block font-bold text-stone-800 mb-1">Nome do Insumo / Produto</label>
            <input id="prodNameInput" #newName type="text" placeholder="Ex: Queijo Cheddar Fatiado 1kg" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="prodPriceInput" class="block font-bold text-stone-800 mb-1">Preço Venda (R$)</label>
              <input id="prodPriceInput" #newPrice type="number" step="0.5" value="29.90" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
            </div>
            <div>
              <label for="prodWholesaleInput" class="block font-bold text-stone-800 mb-1">Preço Atacado (R$)</label>
              <input id="prodWholesaleInput" #newWholesale type="number" step="0.5" value="24.90" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="prodStockInput" class="block font-bold text-stone-800 mb-1">Estoque Inicial</label>
              <input id="prodStockInput" #newStock type="number" value="20" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
            </div>
            <div>
              <label for="prodSupplierSelect" class="block font-bold text-stone-800 mb-1">Fornecedor Principal</label>
              <select id="prodSupplierSelect" #newSupplier class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
                @for (s of suppliers(); track s.id) {
                  <option [value]="s.id">{{ s.name }}</option>
                }
              </select>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-3 border-t border-[#e8dfce]">
          <button type="button" (click)="closeRequest.emit()" class="flex-1 bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 font-bold py-2.5 rounded-xl border border-[#d6c3aa] text-xs">
            Cancelar
          </button>
          <button type="button" (click)="submit(newName.value, newPrice.value, newWholesale.value, newStock.value, newSupplier.value)" class="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2.5 rounded-xl shadow-lg border border-amber-400/50 text-xs">
            Efetivar
          </button>
        </div>
      </div>
    </div>
  `
})
export class InventoryProductModal {
  suppliers = input.required<Supplier[]>();
  closeRequest = output<void>();
  save = output<{
    name: string;
    price: number;
    wholesalePrice: number;
    stock: number;
    supplierId: string;
  }>();

  submit(name: string, price: string, wholesale: string, stock: string, supplierId: string) {
    if (!name) return;
    this.save.emit({
      name,
      price: Number(price) || 0,
      wholesalePrice: Number(wholesale) || 0,
      stock: Number(stock) || 0,
      supplierId
    });
  }
}
