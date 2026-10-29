import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pos-discount-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
      <div class="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] max-sm w-full p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center border-b border-slate-800 pb-2">
          <h3 class="font-black text-xs uppercase tracking-tight text-amber-400">Aplicar Desconto no Cupom</h3>
          <button type="button" (click)="closeRequest.emit()" class="text-slate-500 hover:text-white font-bold">✕</button>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <button type="button" (click)="apply(0.05)" class="bg-slate-800 hover:bg-amber-600 p-3 rounded-xl font-bold text-center">5%</button>
          <button type="button" (click)="apply(0.10)" class="bg-slate-800 hover:bg-amber-600 p-3 rounded-xl font-bold text-center">10%</button>
          <button type="button" (click)="apply(0.15)" class="bg-slate-800 hover:bg-amber-600 p-3 rounded-xl font-bold text-center">15%</button>
        </div>

        <div class="pt-2">
          <button type="button" (click)="apply(0)" class="w-full bg-slate-950 text-rose-400 hover:text-rose-300 border border-slate-800 p-2.5 rounded-xl text-center font-bold">Remover Desconto</button>
        </div>
      </div>
    </div>
  `
})
export class PosDiscountModal {
  closeRequest = output<void>();
  applyDiscount = output<number>();

  apply(percent: number) {
    this.applyDiscount.emit(percent);
  }
}
