import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OrderTransaction } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-pos-receipt-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6">
      <div class="bg-[#fefce8] border-2 border-amber-900/40 rounded-3xl max-w-sm w-full p-6 text-stone-900 space-y-4 shadow-2xl font-mono text-center animate-in zoom-in-95">
        <div class="border-b border-dashed border-stone-400 pb-3">
          <h3 class="font-bold text-sm uppercase text-amber-950">DANFE NFC-e SEFAZ</h3>
          <p class="text-[9px] text-stone-600 uppercase">Documento Auxiliar da Nota Fiscal Eletrônica</p>
          <div class="text-[8px] text-stone-500 mt-1 font-mono">Chave: 352410148829100001446500100000{{ order().orderNumber.replace('#','') }}</div>
        </div>

        <div class="text-left text-[10px] space-y-1 py-1 border-b border-dashed border-stone-400">
          <div class="flex justify-between font-bold">
            <span>Venda: {{ order().orderNumber }}</span>
            <span>Canal: {{ order().channel }}</span>
          </div>
          @if (customerCpf()) {
            <div class="text-[9px] text-amber-950 font-bold">CPF Consumidor: {{ customerCpf() }}</div>
          }
          <div class="pt-1">
            @for (item of order().items; track item.product.id) {
              <div class="flex justify-between">
                <span>{{ item.quantity }}x {{ item.product.name }}</span>
                <span>R$ {{ (item.product.price * item.quantity).toFixed(2) }}</span>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-between font-black text-sm text-stone-950 pt-1">
          <span>TOTAL PAGO:</span>
          <span class="text-amber-900">R$ {{ order().total.toFixed(2) }}</span>
        </div>

        <div class="py-2 flex justify-center">
          <!-- QR Code SEFAZ Graphic -->
          <div class="w-24 h-24 border-2 border-stone-900 p-1.5 bg-white flex flex-col items-center justify-center space-y-1">
            <mat-icon class="text-3xl text-stone-900">qr_code_2</mat-icon>
            <span class="text-[7px] font-bold uppercase">Consulta SEFAZ</span>
          </div>
        </div>

        <button 
          type="button" 
          (click)="closeRequest.emit()" 
          class="w-full bg-amber-900 hover:bg-amber-800 text-amber-100 font-bold py-2.5 rounded-xl uppercase text-xs shadow">
          Fechar / Nova Venda
        </button>
      </div>
    </div>
  `
})
export class PosReceiptModal {
  order = input.required<OrderTransaction>();
  customerCpf = input<string>('');
  closeRequest = output<void>();
}
