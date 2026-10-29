import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-financial-entry-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-900 space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
          <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
            <mat-icon class="text-amber-700">post_add</mat-icon>
            Lançamento Financeiro
          </h3>
          <button type="button" (click)="closeRequest.emit()" class="text-stone-400 hover:text-stone-800 font-bold">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="entryType" class="block font-bold text-stone-800 mb-1">Tipo de Lançamento</label>
            <select id="entryType" #entryType class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
              <option value="sale">Entrada / Receita (+) </option>
              <option value="expense">Saída / Despesa (-) </option>
            </select>
          </div>

          <div>
            <label for="entryDesc" class="block font-bold text-stone-800 mb-1">Descrição</label>
            <input id="entryDesc" #entryDesc type="text" placeholder="Ex: Pagamento Fornecedor Hortifrúti" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="entryCategory" class="block font-bold text-stone-800 mb-1">Categoria</label>
              <input id="entryCategory" #entryCategory type="text" value="Fornecedores" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
            </div>
            <div>
              <label for="entryAmount" class="block font-bold text-stone-800 mb-1">Valor (R$)</label>
              <input id="entryAmount" #entryAmount type="number" step="10" value="150.00" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
            </div>
          </div>

          <div>
            <label for="entryMethod" class="block font-bold text-stone-800 mb-1">Forma de Pagamento / Canal</label>
            <select id="entryMethod" #entryMethod class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 font-bold focus:outline-none focus:border-amber-600">
              <option value="Pix Bancário">PIX Bancário Instantâneo</option>
              <option value="Dinheiro Gaveta">Dinheiro em Espécie (Gaveta)</option>
              <option value="Cartão Débito">Cartão de Débito (TEF)</option>
              <option value="Cartão Crédito">Cartão de Crédito (TEF)</option>
              <option value="Boleto Bancário">Boleto Bancário 30 dias</option>
            </select>
          </div>
        </div>

        <div class="flex gap-3 pt-3 border-t border-[#e8dfce]">
          <button type="button" (click)="closeRequest.emit()" class="flex-1 bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 font-bold py-2.5 rounded-xl border border-[#d6c3aa] text-xs">
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="submit(entryType.value, entryDesc.value, entryCategory.value, entryAmount.value, entryMethod.value)" 
            class="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2.5 rounded-xl shadow-lg border border-amber-400/50 text-xs">
            Confirmar Lançamento
          </button>
        </div>
      </div>
    </div>
  `
})
export class AddFinancialEntryModal {
  closeRequest = output<void>();
  save = output<{
    type: 'sale' | 'expense';
    description: string;
    category: string;
    amount: number;
    paymentMethod: string;
  }>();

  submit(type: string, desc: string, category: string, amountStr: string, method: string) {
    if (!desc || !amountStr) return;
    const amount = Number(amountStr) || 0;
    
    this.save.emit({
      type: type as 'sale' | 'expense',
      description: desc,
      category: category || 'Geral',
      amount,
      paymentMethod: method
    });
  }
}
