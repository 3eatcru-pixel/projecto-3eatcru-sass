import { ChangeDetectionStrategy, Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ServiceOrder, Appointment } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-services-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <!-- Left: Quick Stats -->
      <div class="md:col-span-1 space-y-4">
        <div class="bg-[#1d1008] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-center items-center text-center space-y-2">
          <span class="text-[9px] font-black text-amber-500 uppercase tracking-widest">O.S. Ativas</span>
          <span class="text-4xl font-black text-white font-serif">{{ serviceOrders().length }}</span>
          <div class="w-full h-1 bg-stone-900 rounded-full overflow-hidden mt-2">
            <div class="bg-amber-500 h-full w-[65%]"></div>
          </div>
        </div>
        
        <div class="bg-[#1d1008] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-center items-center text-center space-y-2">
          <span class="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Agendamentos Hoje</span>
          <span class="text-4xl font-black text-white font-serif">{{ appointmentsToday().length }}</span>
          <div class="flex gap-1 mt-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span class="w-2 h-2 rounded-full bg-emerald-500 opacity-50"></span>
            <span class="w-2 h-2 rounded-full bg-stone-800"></span>
          </div>
        </div>

        <div class="bg-gradient-to-br from-stone-900 to-black border border-stone-800 rounded-2xl p-4 space-y-3">
          <h3 class="text-[10px] font-black text-white uppercase flex items-center gap-2">
            <mat-icon class="text-xs text-amber-500">engineering</mat-icon> Status Técnicos
          </h3>
          <div class="space-y-2">
            <div class="flex justify-between text-[9px] font-bold">
              <span class="text-stone-400 uppercase">Em Bancada</span>
              <span class="text-amber-500">{{ execucaoCount() }}</span>
            </div>
            <div class="flex justify-between text-[9px] font-bold">
              <span class="text-stone-400 uppercase">Aguardando Peças</span>
              <span class="text-amber-500">2</span>
            </div>
            <div class="flex justify-between text-[9px] font-bold">
              <span class="text-stone-400 uppercase">Triagem Pendente</span>
              <span class="text-amber-500">{{ triagemCount() }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle: Recent OS Activity -->
      <div class="md:col-span-2 flex flex-col space-y-4 bg-[#1d1008]/50 border border-[#4d2813] rounded-3xl p-4 overflow-hidden shadow-2xl">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
          <h2 class="text-xs font-black text-white uppercase tracking-widest">Atividade Recente de O.S.</h2>
          <button (click)="viewAllOrders.emit()" class="text-[9px] font-bold text-amber-500 hover:underline cursor-pointer">Ver Todas</button>
        </div>
        <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          @for (os of serviceOrders(); track os.id) {
            <div 
              (click)="selectOrder.emit(os)" 
              (keyup.enter)="selectOrder.emit(os)"
              tabindex="0"
              class="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between hover:bg-white/10 transition-all cursor-pointer group">
              <div class="flex items-center gap-3">
                <div class="p-2 rounded-lg bg-stone-900 text-amber-500 border border-white/5">
                  <mat-icon class="text-sm">handyman</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-white group-hover:text-amber-400 transition-colors">{{ os.osNumber }} - {{ os.equipment }}</div>
                  <div class="text-[9px] text-stone-500 font-bold uppercase">{{ os.clientName }} • {{ os.technician }}</div>
                </div>
              </div>
              <div class="flex flex-col items-end gap-1">
                <span [class]="getStatusColor(os.status)" class="px-2 py-0.5 rounded-full text-[8px] font-black uppercase border">{{ os.status }}</span>
                <span class="text-[9px] font-mono text-stone-400">R$ {{ os.price.toFixed(2) }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Right: Upcoming Appointments -->
      <div class="md:col-span-1 flex flex-col space-y-4 bg-stone-950/40 border border-white/5 rounded-3xl p-4 overflow-hidden">
         <div class="flex items-center justify-between pb-2 border-b border-white/5">
          <h2 class="text-xs font-black text-white uppercase tracking-widest">Próximos Agendamentos</h2>
        </div>
        <div class="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          @for (apt of appointmentsToday(); track apt.id) {
            <div class="relative pl-4 border-l-2 border-amber-500/30 py-1">
              <div class="absolute -left-[5px] top-2 w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
              <div class="font-black text-white text-[10px]">{{ apt.time }}</div>
              <div class="font-bold text-stone-300 text-[11px] truncate">{{ apt.customerName }}</div>
              <div class="text-[9px] text-stone-500 uppercase font-black truncate">{{ apt.serviceType }}</div>
            </div>
          } @empty {
            <div class="flex flex-col items-center justify-center h-full text-stone-600 text-center space-y-2 opacity-50">
              <mat-icon class="text-3xl">event_busy</mat-icon>
              <p class="text-[9px] font-black uppercase">Sem agendamentos<br>para hoje</p>
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
export class ServicesDashboardComponent {
  serviceOrders = input.required<ServiceOrder[]>();
  appointmentsToday = input.required<Appointment[]>();
  
  viewAllOrders = output<void>();
  selectOrder = output<ServiceOrder>();

  execucaoCount = computed(() => this.serviceOrders().filter(o => o.status === 'execucao').length);
  triagemCount = computed(() => this.serviceOrders().filter(o => o.status === 'triagem').length);

  getStatusColor(status: ServiceOrder['status']) {
    switch (status) {
      case 'triagem': return 'bg-amber-500/10 text-amber-500 border-amber-500/30';
      case 'execucao': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'finalizado': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
      default: return 'bg-stone-500/10 text-stone-500 border-stone-500/30';
    }
  }
}
