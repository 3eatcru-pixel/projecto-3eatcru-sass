import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ServiceOrder } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-services-kanban',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      <!-- COLUMN: TRIAGEM -->
      <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-3 flex flex-col space-y-3 overflow-hidden shadow-xl">
        <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-400"></span>
            <span class="font-serif font-black text-amber-300 text-xs uppercase tracking-tight">1. Triagem / Orçamento</span>
          </div>
          <button (click)="createOrder.emit()" class="p-1 rounded bg-amber-600 text-stone-950 hover:bg-amber-500 transition-colors cursor-pointer">
            <mat-icon class="text-xs">add</mat-icon>
          </button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          @for (os of triagemOrders(); track os.id) {
            <div 
              (click)="selectOrder.emit(os)" 
              (keyup.enter)="selectOrder.emit(os)"
              tabindex="0"
              class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 space-y-2 text-stone-900 cursor-pointer hover:border-amber-500 transition-all shadow-md relative">
              <div class="flex justify-between">
                <span class="text-[10px] font-black text-amber-800">{{ os.osNumber }}</span>
                <span [class]="os.priority === 'Crítico' ? 'text-rose-600' : 'text-stone-400'" class="text-[9px] font-black uppercase">{{ os.priority }}</span>
              </div>
              <h3 class="font-serif font-black text-sm leading-tight">{{ os.equipment }}</h3>
              <div class="text-[9px] text-stone-500 font-bold uppercase">{{ os.clientName }}</div>
              <div class="flex justify-between items-center pt-2 border-t border-stone-200">
                <span class="text-[10px] font-black text-amber-900 font-mono">R$ {{ os.price.toFixed(2) }}</span>
                <button (click)="$event.stopPropagation(); moveStatus.emit({id: os.id, status: 'execucao'})" class="bg-amber-600 text-stone-950 px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer">
                  Iniciar <mat-icon class="text-[10px]">play_arrow</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- COLUMN: EXECUÇÃO -->
      <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-3 flex flex-col space-y-3 overflow-hidden shadow-xl">
        <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span class="font-serif font-black text-orange-300 text-xs uppercase tracking-tight">2. Em Execução</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          @for (os of execucaoOrders(); track os.id) {
            <div 
              (click)="selectOrder.emit(os)" 
              (keyup.enter)="selectOrder.emit(os)"
              tabindex="0"
              class="bg-[#faf7f0] border-2 border-orange-500/40 rounded-xl p-3 space-y-3 text-stone-900 cursor-pointer hover:bg-orange-50 transition-all shadow-md">
              <div class="flex justify-between">
                <span class="text-[10px] font-black text-orange-800">{{ os.osNumber }}</span>
                <span class="bg-orange-600 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">EM BANCADA</span>
              </div>
              <h3 class="font-serif font-black text-sm leading-tight">{{ os.equipment }}</h3>
              
              <div class="space-y-1">
                <div class="flex justify-between text-[8px] font-black text-stone-500 uppercase">
                  <span>Progresso</span>
                  <span>{{ os.progressPercent }}%</span>
                </div>
                <div class="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                  <div class="bg-orange-600 h-full transition-all duration-500" [style.width.%]="os.progressPercent"></div>
                </div>
              </div>

              <div class="flex justify-between items-center pt-1">
                <span class="text-[10px] font-black text-orange-900 font-mono">R$ {{ os.price.toFixed(2) }}</span>
                <button (click)="$event.stopPropagation(); moveStatus.emit({id: os.id, status: 'finalizado'})" class="bg-emerald-600 text-white px-2 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer">
                  Concluir <mat-icon class="text-[10px]">done</mat-icon>
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- COLUMN: FINALIZADO -->
      <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-3 flex flex-col space-y-3 overflow-hidden shadow-xl">
        <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="font-serif font-black text-emerald-300 text-xs uppercase tracking-tight">3. Concluído</span>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          @for (os of finalizadoOrders(); track os.id) {
            <div 
              (click)="selectOrder.emit(os)" 
              (keyup.enter)="selectOrder.emit(os)"
              tabindex="0"
              class="bg-[#faf7f0] border border-emerald-500/40 rounded-xl p-3 space-y-3 text-stone-900 cursor-pointer hover:bg-emerald-50 transition-all shadow-md">
              <div class="flex justify-between">
                <span class="text-[10px] font-black text-emerald-800">{{ os.osNumber }}</span>
                <span class="text-[9px] font-black text-emerald-600 uppercase">PRONTO P/ RETIRADA</span>
              </div>
              <h3 class="font-serif font-black text-sm leading-tight">{{ os.equipment }}</h3>
              <div class="bg-stone-100 p-2 rounded-lg border border-stone-200">
                <div class="flex justify-between text-[9px] font-black text-stone-600 mb-1 uppercase">
                  <span>Valor Final</span>
                  <span class="text-amber-900">R$ {{ os.price.toFixed(2) }}</span>
                </div>
              </div>
              <button (click)="$event.stopPropagation(); settleOrder.emit(os)" class="w-full bg-gradient-to-r from-amber-500 to-amber-700 text-stone-950 py-2 rounded-lg text-[9px] font-black uppercase shadow-lg flex items-center justify-center gap-1.5 cursor-pointer">
                <mat-icon class="text-xs">payments</mat-icon> Liquidar & Faturar
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
  `]
})
export class ServicesKanbanComponent {
  serviceOrders = input.required<ServiceOrder[]>();
  
  createOrder = output<void>();
  selectOrder = output<ServiceOrder>();
  moveStatus = output<{id: string, status: ServiceOrder['status']}>();
  settleOrder = output<ServiceOrder>();

  triagemOrders = computed(() => this.serviceOrders().filter(o => o.status === 'triagem'));
  execucaoOrders = computed(() => this.serviceOrders().filter(o => o.status === 'execucao'));
  finalizadoOrders = computed(() => this.serviceOrders().filter(o => o.status === 'finalizado'));
}
