import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface Operator {
  id: string;
  name: string;
  role: string;
  canSangria: boolean;
  canVoid: boolean;
}

@Component({
  selector: 'app-access-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar relative z-10 h-full">
      <div class="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6 space-y-6 backdrop-blur-md">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <h4 class="font-black text-[11px] text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <span class="w-1 h-3 bg-orange-600 rounded-full"></span>
            Operadores Credenciados & Controle de PIN
          </h4>
          <button 
            type="button" 
            (click)="addOperator.emit()"
            class="bg-orange-600 hover:bg-orange-500 text-white font-black px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest cursor-pointer">
            + Novo Operador
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (op of operators(); track op.id) {
            <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-inner">
              <div class="flex justify-between items-start">
                <div>
                  <h5 class="font-black text-white text-xs uppercase">{{ op.name }}</h5>
                  <span class="text-[9px] font-black uppercase text-orange-400">{{ op.role }}</span>
                </div>
                <span class="text-[9px] font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">PIN: ****</span>
              </div>

              <div class="space-y-1 text-[8px] text-slate-500 uppercase font-black">
                <p>• Sangria: <span [class]="op.canSangria ? 'text-emerald-400' : 'text-rose-400'">{{ op.canSangria ? 'SIM' : 'NÃO' }}</span></p>
                <p>• Cancelamento: <span [class]="op.canVoid ? 'text-emerald-400' : 'text-rose-400'">{{ op.canVoid ? 'SIM' : 'NÃO' }}</span></p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class AccessSettingsComponent {
  operators = input.required<Operator[]>();
  addOperator = output<void>();
}
