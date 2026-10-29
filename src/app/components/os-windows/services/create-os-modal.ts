import { ChangeDetectionStrategy, Component, output, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-create-os-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-900 space-y-4 shadow-2xl animate-in zoom-in-95">
        <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-3">
          <mat-icon class="text-amber-700">add_task</mat-icon> Nova Ordem de Serviço
        </h3>
        <div class="space-y-3 text-[10px]">
          <div>
            <label for="cliName" class="block font-black text-stone-500 uppercase mb-1">Cliente</label>
            <input id="cliName" #cliInput type="text" placeholder="Nome Completo" class="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 focus:border-amber-600 outline-none font-bold shadow-sm">
          </div>
          <div>
            <label for="eqName" class="block font-black text-stone-500 uppercase mb-1">Equipamento / Veículo</label>
            <input id="eqName" #eqInput type="text" placeholder="Ex: Máquina de Lavar Industrial" class="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 focus:border-amber-600 outline-none font-bold shadow-sm">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label for="prioSelect" class="block font-black text-stone-500 uppercase mb-1">Prioridade</label>
              <select id="prioSelect" #prioInput class="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 focus:border-amber-600 outline-none font-bold shadow-sm appearance-none cursor-pointer">
                <option value="Normal">Normal</option>
                <option value="Crítico">Crítico</option>
              </select>
            </div>
            <div>
              <label for="laborInput" class="block font-black text-stone-500 uppercase mb-1">Mão de Obra (R$)</label>
              <input id="laborInput" #laborInput type="number" value="200" class="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 focus:border-amber-600 outline-none font-bold shadow-sm">
            </div>
          </div>
        </div>
        <div class="flex gap-3 pt-4 border-t border-stone-200">
          <button type="button" (click)="closeModal.emit()" class="flex-1 bg-stone-200 text-stone-500 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest cursor-pointer">Cancelar</button>
          <button type="button" (click)="submit()" class="flex-1 bg-amber-600 text-stone-950 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg cursor-pointer">Criar O.S.</button>
        </div>
      </div>
    </div>
  `
})
export class CreateOSModalComponent {
  closeModal = output<void>();
  saveOS = output<{client: string, equip: string, prio: string, labor: string}>();

  cliInput = viewChild<ElementRef<HTMLInputElement>>('cliInput');
  eqInput = viewChild<ElementRef<HTMLInputElement>>('eqInput');
  prioInput = viewChild<ElementRef<HTMLSelectElement>>('prioInput');
  laborInput = viewChild<ElementRef<HTMLInputElement>>('laborInput');

  submit() {
    const client = this.cliInput()?.nativeElement.value;
    const equip = this.eqInput()?.nativeElement.value;
    const prio = this.prioInput()?.nativeElement.value;
    const labor = this.laborInput()?.nativeElement.value;

    if (client && equip && prio && labor) {
      this.saveOS.emit({ client, equip, prio, labor });
    }
  }
}
