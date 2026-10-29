import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ServiceOrder } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-service-details-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-[#faf7f0] border-4 border-amber-900/20 rounded-[2.5rem] max-w-3xl w-full p-8 text-stone-950 space-y-6 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div class="flex justify-between items-center pb-4 border-b border-stone-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-stone-900 text-amber-500 flex items-center justify-center shadow-xl border border-white/10">
              <mat-icon>assignment</mat-icon>
            </div>
            <div>
              <h3 class="font-serif font-black text-xl">Ordem #{{ os()?.osNumber }}</h3>
              <p class="text-[10px] font-black text-stone-500 uppercase tracking-widest">{{ os()?.equipment }}</p>
            </div>
          </div>
          <button (click)="closeModal.emit()" class="w-10 h-10 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center transition-all cursor-pointer text-stone-900">✕</button>
        </div>

        <div class="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Cliente</span>
              <p class="font-black text-xs mt-1">{{ os()?.clientName }}</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Técnico</span>
              <p class="font-black text-xs mt-1">{{ os()?.technician }}</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Data Abertura</span>
              <p class="font-black text-xs mt-1">{{ os()?.createdAt }}</p>
            </div>
            <div class="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
              <span class="text-[9px] font-black text-stone-400 uppercase tracking-widest">Prioridade</span>
              <p [class]="os()?.priority === 'Crítico' ? 'text-rose-600' : 'text-amber-600'" class="font-black text-xs mt-1">{{ os()?.priority }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="font-serif font-black text-sm border-l-4 border-amber-600 pl-3">Laudo Técnico & Insumos</h4>
            <div class="bg-stone-100 p-4 rounded-2xl border border-stone-200 italic text-stone-700 text-xs shadow-inner">
              "{{ os()?.description }}"
            </div>
            
            <!-- Parts Table -->
            <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-lg">
              <table class="w-full text-left text-[11px]">
                <thead class="bg-stone-900 text-stone-400 font-black uppercase tracking-widest">
                  <tr>
                    <th class="p-3">Peça / Insumo</th>
                    <th class="p-3 text-center">Qtd</th>
                    <th class="p-3 text-right">Unit.</th>
                    <th class="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-stone-100 font-bold">
                  @for (p of os()?.parts; track $index) {
                    <tr>
                      <td class="p-3 text-stone-800">{{ p.name }}</td>
                      <td class="p-3 text-center">{{ p.qty }}</td>
                      <td class="p-3 text-right font-mono">R$ {{ p.unitPrice.toFixed(2) }}</td>
                      <td class="p-3 text-right font-mono text-amber-900">R$ {{ (p.qty * p.unitPrice).toFixed(2) }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="4" class="p-8 text-center text-stone-400 italic">Nenhum insumo vinculado a esta O.S.</td></tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-stone-900 p-6 rounded-3xl text-white flex justify-between items-center shadow-2xl">
            <div>
              <div class="text-[9px] font-black text-stone-500 uppercase tracking-[0.2em]">Custo Total Acumulado</div>
              <div class="text-2xl font-black font-serif text-amber-500">R$ {{ os()?.price?.toFixed(2) }}</div>
            </div>
            <div class="flex gap-2">
              <button type="button" class="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer">Imprimir Laudo</button>
              <button type="button" class="bg-amber-600 text-stone-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg cursor-pointer">Adicionar Peça</button>
            </div>
          </div>
        </div>

        <div class="flex gap-3 pt-6 border-t border-stone-200 shrink-0">
           <button type="button" (click)="closeModal.emit()" class="flex-1 bg-stone-200 text-stone-600 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest cursor-pointer">Fechar Janela</button>
           <button type="button" (click)="moveStatus.emit({id: os()?.id!, status: 'execucao'})" class="flex-1 bg-stone-900 text-white py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl cursor-pointer">Avançar Fluxo</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
  `]
})
export class ServiceDetailsModalComponent {
  os = input.required<ServiceOrder | null>();
  
  closeModal = output<void>();
  moveStatus = output<{id: string, status: ServiceOrder['status']}>();
}
