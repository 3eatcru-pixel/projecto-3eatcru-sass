import { ChangeDetectionStrategy, Component, output, viewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-appointment-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-stone-900 border border-white/10 rounded-3xl max-w-md w-full p-8 text-white space-y-6 shadow-2xl animate-in zoom-in-95">
        <h3 class="font-black text-sm uppercase tracking-widest flex items-center gap-3 text-amber-500">
          <mat-icon>event_available</mat-icon> Novo Agendamento
        </h3>
        <div class="space-y-4 text-[10px]">
          <div>
            <label for="aptCliName" class="block text-stone-500 font-black uppercase tracking-widest mb-1">Nome do Cliente</label>
            <input id="aptCliName" #aptCli type="text" placeholder="Ex: Felipe Amorim" class="w-full bg-stone-950 border border-white/5 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-black uppercase tracking-tight" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="aptDateInput" class="block text-stone-500 font-black uppercase tracking-widest mb-1">Data</label>
              <input id="aptDateInput" #aptDate type="date" value="2026-10-27" class="w-full bg-stone-950 border border-white/5 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-black font-mono" />
            </div>
            <div>
              <label for="aptTimeInput" class="block text-stone-500 font-black uppercase tracking-widest mb-1">Horário</label>
              <input id="aptTimeInput" #aptTime type="time" value="10:00" class="w-full bg-stone-950 border border-white/5 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-black font-mono" />
            </div>
          </div>
          <div>
            <label for="aptServInput" class="block text-stone-500 font-black uppercase tracking-widest mb-1">Serviço Solicitado</label>
            <input id="aptServInput" #aptServ type="text" placeholder="Ex: Revisão de 30k" class="w-full bg-stone-950 border border-white/5 rounded-xl p-3 text-white focus:border-amber-500 outline-none font-black uppercase" />
          </div>
        </div>
        <div class="flex gap-3 pt-6 border-t border-white/5">
          <button type="button" (click)="closeModal.emit()" class="flex-1 bg-stone-800 text-stone-400 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest cursor-pointer">Descartar</button>
          <button type="button" (click)="submit()" class="flex-1 bg-amber-600 text-stone-950 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-lg cursor-pointer">Confirmar Reserva</button>
        </div>
      </div>
    </div>
  `
})
export class AddAppointmentModalComponent {
  closeModal = output<void>();
  saveAppointment = output<{client: string, date: string, time: string, service: string}>();

  aptCli = viewChild<ElementRef<HTMLInputElement>>('aptCli');
  aptDate = viewChild<ElementRef<HTMLInputElement>>('aptDate');
  aptTime = viewChild<ElementRef<HTMLInputElement>>('aptTime');
  aptServ = viewChild<ElementRef<HTMLInputElement>>('aptServ');

  submit() {
    const client = this.aptCli()?.nativeElement.value;
    const date = this.aptDate()?.nativeElement.value;
    const time = this.aptTime()?.nativeElement.value;
    const service = this.aptServ()?.nativeElement.value;

    if (client && date && time) {
      this.saveAppointment.emit({ client, date, time, service: service || 'Serviço Geral' });
    }
  }
}
