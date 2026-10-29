import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { POSDevice } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-provision-device-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6">
      <div class="bg-slate-900 border-2 border-slate-800 rounded-[3rem] max-w-lg w-full p-10 text-white space-y-8 shadow-2xl animate-in zoom-in-95 font-mono relative overflow-hidden">
        <div class="flex justify-between items-center relative z-10">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-2xl bg-orange-600/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
              <mat-icon class="text-3xl">add_to_queue</mat-icon>
            </div>
            <div>
              <h4 class="text-xl font-black uppercase tracking-tighter leading-none">Provisionar <span class="text-orange-500">Node</span></h4>
              <p class="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Autorização de Hardware MDM</p>
            </div>
          </div>
          <button type="button" (click)="closeModal.emit()" class="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">✕</button>
        </div>

        <div class="space-y-6 relative z-10 text-[10px]">
          <div class="space-y-2">
            <label for="newDevName" class="font-black text-slate-500 uppercase tracking-widest ml-2 block">Nome de Rede do Dispositivo</label>
            <input id="newDevName" 
              [value]="name()"
              (input)="name.set($any($event.target).value)"
              type="text" 
              placeholder="EX: PDV-RECEPÇÃO-02" 
              class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 uppercase font-black tracking-tight shadow-inner">
          </div>

          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-2">
              <label for="newDevType" class="font-black text-slate-500 uppercase tracking-widest ml-2 block">Classe</label>
              <select id="newDevType" 
                [value]="type()"
                (change)="type.set($any($event.target).value)"
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 uppercase font-black tracking-tight appearance-none shadow-inner cursor-pointer">
                <option value="terminal">Caixa (PDV)</option>
                <option value="tablet">Tablet (Mobile)</option>
                <option value="kiosk">Totem (Self)</option>
              </select>
            </div>
            <div class="space-y-2">
              <label for="newDevLoc" class="font-black text-slate-500 uppercase tracking-widest ml-2 block">Setor Operacional</label>
              <input id="newDevLoc" 
                [value]="location()"
                (input)="location.set($any($event.target).value)"
                type="text" 
                placeholder="EX: SALÃO PRINCIPAL" 
                class="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 uppercase font-black tracking-tight shadow-inner">
            </div>
          </div>

          <div class="p-8 bg-slate-950 border border-slate-800 rounded-3xl text-center space-y-3 shadow-inner">
            <span class="text-[10px] text-slate-500 uppercase font-black tracking-[0.4em] block">Pairing Token (OTA):</span>
            <div class="text-4xl font-black font-mono tracking-[0.5em] text-orange-500">792-410</div>
            <p class="text-[9px] text-slate-600 font-black uppercase tracking-widest">Expira em 10 minutos. Insira este token no terminal alvo.</p>
          </div>
        </div>

        <div class="flex gap-4 pt-6 border-t border-slate-800 relative z-10">
          <button type="button" (click)="closeModal.emit()" class="flex-1 bg-slate-950 text-slate-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-800 hover:text-white transition-colors cursor-pointer">Cancelar</button>
          <button type="button" (click)="submit()" class="flex-1 bg-orange-600 hover:bg-orange-500 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl active:scale-95 transition-all border-b-4 border-orange-800 cursor-pointer">Autorizar Terminal</button>
        </div>
      </div>
    </div>
  `
})
export class ProvisionDeviceModalComponent {
  closeModal = output<void>();
  saveDevice = output<{name: string, type: POSDevice['type'], location: string}>();

  name = signal('');
  type = signal<POSDevice['type']>('terminal');
  location = signal('SALÃO PRINCIPAL');

  submit() {
    if (this.name()) {
      this.saveDevice.emit({ name: this.name(), type: this.type(), location: this.location() });
    }
  }
}
