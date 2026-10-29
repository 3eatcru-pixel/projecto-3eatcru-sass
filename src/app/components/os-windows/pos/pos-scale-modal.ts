import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-pos-scale-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
      <div class="bg-slate-900 border-2 border-cyan-800 rounded-[2.5rem] max-w-md w-full p-8 text-white space-y-6 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center border-b border-cyan-900/50 pb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <mat-icon>scale</mat-icon>
            </div>
            <div>
              <h3 class="font-black text-sm uppercase tracking-tight text-cyan-300">Balança Eletrônica RS232</h3>
              <p class="text-[9px] text-cyan-600 uppercase tracking-widest">Toledo / Filizola Serial Protocol</p>
            </div>
          </div>
          <button type="button" (click)="closeRequest.emit()" class="text-slate-500 hover:text-white font-bold">✕</button>
        </div>

        <div class="bg-slate-950 p-4 rounded-2xl border border-cyan-950 text-center space-y-2">
          <span class="text-[9px] text-cyan-500 uppercase font-black tracking-widest">Peso Atual Lido do Prato:</span>
          <div class="text-3xl font-black text-cyan-400 font-mono tracking-tighter">{{ weightKg() }} kg</div>
          <span class="text-[10px] text-emerald-400 font-bold block">Status: Peso Estável ✓</span>
        </div>

        <div class="space-y-3 text-[10px]">
          <label for="scaleProdSelect" class="block text-slate-400 font-black uppercase">Selecione o Item Pesável:</label>
          <select id="scaleProdSelect" #scaleProdSelect class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold">
            @for (p of products(); track p.id) {
              <option [value]="p.id">{{ p.name }} - R$ {{ p.price.toFixed(2) }}/kg</option>
            }
          </select>

          <div class="flex gap-2 pt-2">
            <button type="button" (click)="weightKg.set(0.250)" class="flex-1 bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-cyan-300 font-bold">250g</button>
            <button type="button" (click)="weightKg.set(0.450)" class="flex-1 bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-cyan-300 font-bold">450g</button>
            <button type="button" (click)="weightKg.set(0.800)" class="flex-1 bg-slate-800 hover:bg-slate-700 p-2 rounded-xl text-cyan-300 font-bold">800g</button>
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button type="button" (click)="closeRequest.emit()" class="flex-1 bg-slate-950 text-slate-400 font-black py-3 rounded-2xl border border-slate-800">Cancelar</button>
          <button type="button" (click)="confirm(scaleProdSelect.value)" class="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-cyan-600/30">Adicionar Venda</button>
        </div>
      </div>
    </div>
  `
})
export class PosScaleModal {
  products = input.required<ProductItem[]>();
  closeRequest = output<void>();
  save = output<{
    productId: string;
    weight: number;
  }>();

  weightKg = signal<number>(0.450);

  confirm(productId: string) {
    this.save.emit({
      productId,
      weight: this.weightKg()
    });
  }
}
