import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Appointment } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-services-agenda',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
      <div class="flex items-center justify-between bg-[#1d1008] border border-[#4d2813] p-4 rounded-2xl">
        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">Calendário Ativo</span>
            <span class="text-lg font-black text-white uppercase tracking-tight">{{ currentDateLabel() }}</span>
          </div>
          <div class="h-8 w-px bg-[#3d200f]"></div>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase">{{ appointmentsToday().length }} Hoje</span>
            <span class="px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase">2 Amanhã</span>
          </div>
        </div>
        <button (click)="addAppointment.emit()" class="bg-amber-600 hover:bg-amber-500 text-stone-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all flex items-center gap-2 cursor-pointer">
          <mat-icon class="text-sm">add_circle</mat-icon> Agendar Serviço
        </button>
      </div>

      <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        @for (apt of sortedAppointments(); track apt.id) {
          <div class="bg-[#1d1008] border border-[#4d2813] rounded-2xl p-4 flex items-center justify-between hover:border-amber-500/50 transition-all group">
            <div class="flex items-center gap-8">
              <div class="w-16 flex flex-col items-center justify-center border-r border-[#3d200f] pr-8">
                <span class="text-lg font-black text-white leading-none">{{ apt.time }}</span>
                <span class="text-[8px] font-black text-stone-500 uppercase tracking-widest mt-1">{{ apt.date.split('-').reverse().slice(0,2).join('/') }}</span>
              </div>
              <div>
                <div class="text-sm font-black text-white uppercase tracking-tight group-hover:text-amber-500 transition-colors">{{ apt.customerName }}</div>
                <div class="flex items-center gap-3 mt-1">
                  <span class="text-[9px] font-black text-stone-500 uppercase tracking-widest">{{ apt.serviceType }}</span>
                  <span class="text-[9px] font-mono text-stone-600">{{ apt.customerPhone }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span [class]="getAptStatusClass(apt.status)" class="px-3 py-1 rounded-full text-[8px] font-black uppercase border tracking-widest shadow-md">
                {{ apt.status }}
              </span>
              <div class="flex gap-2">
                <button (click)="updateStatus.emit({id: apt.id, status: 'confirmed'})" class="w-8 h-8 rounded-lg bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600 hover:text-white transition-all border border-emerald-500/20 flex items-center justify-center shadow-lg cursor-pointer">
                  <mat-icon class="text-sm">check</mat-icon>
                </button>
                <button (click)="updateStatus.emit({id: apt.id, status: 'cancelled'})" class="w-8 h-8 rounded-lg bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center shadow-lg cursor-pointer">
                  <mat-icon class="text-sm">close</mat-icon>
                </button>
              </div>
            </div>
          </div>
        }
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
export class ServicesAgendaComponent {
  appointments = input.required<Appointment[]>();
  currentTenantId = input.required<string>();
  
  addAppointment = output<void>();
  updateStatus = output<{id: string, status: Appointment['status']}>();

  appointmentsToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.appointments().filter(a => a.date === today && a.tenantId === this.currentTenantId());
  });

  sortedAppointments = computed(() => {
    return [...this.appointments()]
      .filter(a => a.tenantId === this.currentTenantId())
      .sort((a, b) => {
        const timeA = a.date + ' ' + a.time;
        const timeB = b.date + ' ' + b.time;
        return timeA.localeCompare(timeB);
      });
  });

  currentDateLabel = computed(() => {
    return new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  });

  getAptStatusClass(status: Appointment['status']) {
    switch (status) {
      case 'confirmed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'cancelled': return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
      default: return 'bg-stone-500/10 text-stone-500 border-stone-500/30';
    }
  }
}
