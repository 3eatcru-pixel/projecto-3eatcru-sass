import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pos-cash-op-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-6">
      <div class="bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] max-w-md w-full p-8 text-white space-y-6 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
              <mat-icon>point_of_sale</mat-icon>
            </div>
            <div>
              <h3 class="font-black text-sm uppercase tracking-tight">Sangria &amp; Movimentação</h3>
              <p class="text-[9px] text-slate-500 uppercase tracking-widest">Controle de Gaveta Física</p>
            </div>
          </div>
          <button type="button" (click)="closeRequest.emit()" class="text-slate-500 hover:text-white font-bold">✕</button>
        </div>

        <div class="space-y-4 text-[10px]">
          <div>
            <label for="cashOperationType" class="block text-slate-500 font-black uppercase tracking-widest mb-1">Operação</label>
            <select 
              id="cashOperationType"
              #type
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 uppercase font-black appearance-none">
              <option value="sangria">Sangria (Retirada de Dinheiro)</option>
              <option value="suprimento">Suprimento (Aporte / Fundo de Troco)</option>
              <option value="close">Fechamento de Caixa (Turno)</option>
            </select>
          </div>

          <div>
            <label for="cashVal" class="block text-slate-500 font-black uppercase tracking-widest mb-1">Valor (R$)</label>
            <input 
              id="cashVal"
              #amount
              type="number" 
              step="0.01" 
              value="100.00"
              placeholder="0.00" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 font-mono text-sm font-black">
          </div>

          <div>
            <label for="cashReasonInput" class="block text-slate-500 font-black uppercase tracking-widest mb-1">Motivo / Descrição</label>
            <input 
              id="cashReasonInput"
              #reason
              type="text" 
              value="Sangria para cofre central"
              placeholder="Ex: Sangria para cofre central..." 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500 uppercase font-black">
          </div>
        </div>

        <div class="flex gap-3 pt-2">
          <button 
            type="button" 
            (click)="closeRequest.emit()" 
            class="flex-1 bg-slate-950 hover:bg-slate-800 text-slate-400 font-black py-3 rounded-2xl border border-slate-800 uppercase text-[10px]">
            Cancelar
          </button>
          <button 
            type="button" 
            (click)="submit(type.value, amount.value, reason.value)" 
            class="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-black py-3 rounded-2xl shadow-lg shadow-amber-600/30 uppercase text-[10px]">
            Efetivar Registro
          </button>
        </div>
      </div>
    </div>
  `
})
export class PosCashOpModal {
  closeRequest = output<void>();
  execute = output<{
    type: 'sangria' | 'suprimento' | 'close';
    amount: number;
    reason: string;
  }>();

  submit(type: string, amount: string, reason: string) {
    this.execute.emit({
      type: type as 'sangria' | 'suprimento' | 'close',
      amount: Number(amount) || 0,
      reason
    });
  }
}
