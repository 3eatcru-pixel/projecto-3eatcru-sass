import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

export interface CalendarEvent {
  id: string;
  dateStr: string; // YYYY-MM-DD
  title: string;
  category: 'reserva' | 'fornecedor' | 'financeiro' | 'manutencao';
  time: string;
  details: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-calendar-window',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-stone-200 font-sans select-none">
      
      <!-- TOP BAR: MONTH NAVIGATION & ADD EVENT ACTION -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-[#180b04] border border-[#4d2813] p-4 rounded-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <mat-icon class="text-xl">calendar_month</mat-icon>
          </div>
          <div>
            <h2 class="font-serif font-black text-lg text-white capitalize">{{ currentMonthYearName() }}</h2>
            <p class="text-[10px] text-stone-400 font-mono">Calendário Operacional & Compromissos da Loja</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <div class="flex items-center bg-[#2b160b] border border-[#4d2813] rounded-xl p-1 text-xs">
            <button
              type="button"
              (click)="previousMonth()"
              class="p-1.5 hover:bg-[#3d200f] rounded-lg text-amber-300 cursor-pointer">
              <mat-icon class="text-sm">chevron_left</mat-icon>
            </button>
            <button
              type="button"
              (click)="goToToday()"
              class="px-3 py-1 font-bold hover:bg-[#3d200f] rounded-lg text-amber-200 cursor-pointer">
              Hoje
            </button>
            <button
              type="button"
              (click)="nextMonth()"
              class="p-1.5 hover:bg-[#3d200f] rounded-lg text-amber-300 cursor-pointer">
              <mat-icon class="text-sm">chevron_right</mat-icon>
            </button>
          </div>

          <button
            type="button"
            (click)="showAddModal.set(true)"
            class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow">
            <mat-icon class="text-sm">add</mat-icon>
            <span>Novo Compromisso</span>
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT: GRID CALENDAR & UPCOMING EVENTS SIDEBAR -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        
        <!-- CALENDAR MONTH GRID (2 COLS) -->
        <div class="lg:col-span-2 bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto">
          
          <!-- DAYS OF WEEK HEADER -->
          <div class="grid grid-cols-7 gap-1 text-center font-mono font-bold text-xs text-amber-500 pb-2 border-b border-[#3d200f]">
            <span>DOM</span><span>SEG</span><span>TER</span><span>QUA</span><span>QUI</span><span>SEX</span><span>SÁB</span>
          </div>

          <!-- DAYS GRID -->
          <div class="grid grid-cols-7 gap-1.5 pt-2 flex-1">
            <!-- Empty offset slots for first day of month -->
            @for (blank of firstDayOffsetArray(); track $index) {
              <div class="p-2 min-h-[50px] bg-transparent"></div>
            }

            <!-- Day cells -->
            @for (day of daysInMonthArray(); track day) {
              <button
                type="button"
                (click)="selectDate(day)"
                [class]="getDayClass(day)"
                class="p-2 rounded-xl border flex flex-col justify-between items-start transition-all cursor-pointer min-h-[58px] relative group text-left">
                
                <span class="font-mono text-xs font-bold" [class.text-amber-400]="isToday(day)">
                  {{ day }}
                </span>

                <!-- Event dots -->
                <div class="flex items-center gap-1 flex-wrap mt-1">
                  @for (ev of getEventsForDay(day); track ev.id) {
                    <span
                      [class]="getCategoryBadgeClass(ev.category)"
                      class="w-2 h-2 rounded-full shadow"
                      [title]="ev.time + ' - ' + ev.title">
                    </span>
                  }
                </div>
              </button>
            }
          </div>
        </div>

        <!-- EVENTS SIDEBAR (1 COL) -->
        <div class="bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between space-y-3 overflow-y-auto">
          <div>
            <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
              <h3 class="font-bold text-xs uppercase text-amber-400 font-mono flex items-center gap-1.5">
                <mat-icon class="text-sm">event</mat-icon>
                <span>Eventos do Dia {{ selectedDay() }}/{{ currentMonth() + 1 }}</span>
              </h3>
              <span class="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                {{ selectedDateEvents().length }} Registro(s)
              </span>
            </div>

            <div class="space-y-2 mt-3">
              @for (ev of selectedDateEvents(); track ev.id) {
                <div class="bg-[#2a160b] border border-[#4d2813] rounded-xl p-3 space-y-1">
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-xs text-white">{{ ev.title }}</span>
                    <span [class]="getCategoryTagClass(ev.category)" class="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold uppercase">
                      {{ ev.category }}
                    </span>
                  </div>
                  <div class="text-[11px] text-amber-300 font-mono flex items-center gap-1">
                    <mat-icon class="text-xs">schedule</mat-icon>
                    <span>{{ ev.time }}</span>
                  </div>
                  <p class="text-[10px] text-stone-400 leading-snug">{{ ev.details }}</p>
                </div>
              }
              @if (selectedDateEvents().length === 0) {
                <div class="py-12 text-center text-stone-500 text-xs">
                  <mat-icon class="text-3xl mb-1 text-stone-600">event_available</mat-icon>
                  <p>Nenhum compromisso para este dia.</p>
                </div>
              }
            </div>
          </div>

          <!-- SUMMARY FOOTER -->
          <div class="bg-[#2a160b] border border-[#4d2813] rounded-xl p-3 text-[10px] space-y-1 text-stone-400">
            <div class="font-bold text-amber-300 uppercase font-mono">Dica do Sistema</div>
            <p>Compromissos agendados aqui são sincronizados automaticamente com o DRE Financeiro e alertas de Estoque.</p>
          </div>
        </div>

      </div>

      <!-- ADD EVENT MODAL -->
      @if (showAddModal()) {
        <div class="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#180b04] border-2 border-[#4d2813] rounded-3xl p-6 w-full max-w-md space-y-4 text-stone-200 animate-in zoom-in-95">
            <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
              <h3 class="font-serif font-black text-lg text-white">Novo Agendamento</h3>
              <button (click)="showAddModal.set(false)" class="text-stone-400 hover:text-white cursor-pointer"><mat-icon>close</mat-icon></button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <span class="block text-stone-400 mb-1 font-bold">Título do Evento</span>
                <input
                  type="text"
                  #titleInput
                  placeholder="Ex: Entrega Fornecedor Ambev / Manutenção KDS"
                  class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500" />
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="block text-stone-400 mb-1 font-bold">Horário</span>
                  <input
                    type="time"
                    #timeInput
                    value="14:00"
                    class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500" />
                </div>
                <div>
                  <span class="block text-stone-400 mb-1 font-bold">Categoria</span>
                  <select
                    #categorySelect
                    class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500">
                    <option value="reserva">Reserva de Mesa</option>
                    <option value="fornecedor">Entrega de Fornecedor</option>
                    <option value="financeiro">Vencimento Financeiro</option>
                    <option value="manutencao">Manutenção do Equipamento</option>
                  </select>
                </div>
              </div>

              <div>
                <span class="block text-stone-400 mb-1 font-bold">Observações / Detalhes</span>
                <textarea
                  #detailsInput
                  rows="3"
                  placeholder="Instruções para a equipe de recepção ou caixa..."
                  class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500"></textarea>
              </div>
            </div>

            <div class="pt-2 border-t border-[#3d200f] flex justify-end gap-2">
              <button
                type="button"
                (click)="showAddModal.set(false)"
                class="px-4 py-2 bg-[#2a160b] hover:bg-[#3d200f] rounded-xl text-stone-300 font-bold text-xs cursor-pointer">
                Cancelar
              </button>
              <button
                type="button"
                (click)="addEvent(titleInput.value, timeInput.value, categorySelect.value, detailsInput.value)"
                class="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl cursor-pointer shadow">
                Salvar Evento
              </button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class CalendarWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly currentDateObj = signal<Date>(new Date());
  readonly selectedDay = signal<number>(new Date().getDate());
  readonly showAddModal = signal<boolean>(false);

  readonly events = signal<CalendarEvent[]>([
    { id: '1', dateStr: this.formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), title: 'Reserva Salão V.I.P (Mesa 04)', category: 'reserva', time: '19:30', details: 'Aniversário de 8 pessoas. Bolo encomendado.' },
    { id: '2', dateStr: this.formatDateStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()), title: 'Carga de Cervejas e Chopp', category: 'fornecedor', time: '11:00', details: 'Recebimento de 20 barris de Chopp Lohn.' },
    { id: '3', dateStr: this.formatDateStr(new Date().getFullYear(), new Date().getMonth(), Math.min(28, new Date().getDate() + 2)), title: 'Fechamento de Comissão SaaS 8%', category: 'financeiro', time: '23:59', details: 'Transferência automática para o HQ Central.' }
  ]);

  currentMonth = computed(() => this.currentDateObj().getMonth());
  currentYear = computed(() => this.currentDateObj().getFullYear());

  currentMonthYearName = computed(() => {
    const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return `${months[this.currentMonth()]} de ${this.currentYear()}`;
  });

  daysInMonthArray = computed(() => {
    const total = new Date(this.currentYear(), this.currentMonth() + 1, 0).getDate();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  firstDayOffsetArray = computed(() => {
    const firstDayIndex = new Date(this.currentYear(), this.currentMonth(), 1).getDay();
    return Array.from({ length: firstDayIndex });
  });

  selectedDateEvents = computed(() => {
    const targetStr = this.formatDateStr(this.currentYear(), this.currentMonth(), this.selectedDay());
    return this.events().filter(e => e.dateStr === targetStr);
  });

  previousMonth() {
    this.currentDateObj.update(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.selectedDay.set(1);
  }

  nextMonth() {
    this.currentDateObj.update(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.selectedDay.set(1);
  }

  goToToday() {
    const today = new Date();
    this.currentDateObj.set(today);
    this.selectedDay.set(today.getDate());
  }

  selectDate(day: number) {
    this.selectedDay.set(day);
  }

  isToday(day: number): boolean {
    const today = new Date();
    return (
      day === today.getDate() &&
      this.currentMonth() === today.getMonth() &&
      this.currentYear() === today.getFullYear()
    );
  }

  getDayClass(day: number): string {
    const isSel = day === this.selectedDay();
    const isTod = this.isToday(day);

    if (isSel) {
      return 'bg-amber-600/30 border-amber-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)]';
    }
    if (isTod) {
      return 'bg-[#2a160b] border-amber-500/60 text-amber-300';
    }
    return 'bg-[#211006] border-[#3d200f] hover:bg-[#2b160b] text-stone-300';
  }

  getEventsForDay(day: number): CalendarEvent[] {
    const targetStr = this.formatDateStr(this.currentYear(), this.currentMonth(), day);
    return this.events().filter(e => e.dateStr === targetStr);
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'reserva': return 'bg-amber-400';
      case 'fornecedor': return 'bg-emerald-400';
      case 'financeiro': return 'bg-rose-400';
      case 'manutencao': return 'bg-cyan-400';
      default: return 'bg-stone-400';
    }
  }

  getCategoryTagClass(category: string): string {
    switch (category) {
      case 'reserva': return 'bg-amber-950 text-amber-300 border border-amber-800';
      case 'fornecedor': return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
      case 'financeiro': return 'bg-rose-950 text-rose-300 border border-rose-800';
      case 'manutencao': return 'bg-cyan-950 text-cyan-300 border border-cyan-800';
      default: return 'bg-stone-800 text-stone-300';
    }
  }

  addEvent(title: string, time: string, category: string, details: string) {
    if (!title.trim()) {
      this.ecosystem.notify('Por favor, informe o título do compromisso.', 'warning');
      return;
    }

    const newEv: CalendarEvent = {
      id: String(Date.now()),
      dateStr: this.formatDateStr(this.currentYear(), this.currentMonth(), this.selectedDay()),
      title,
      time: time || '12:00',
      category: category as 'reserva' | 'fornecedor' | 'financeiro' | 'manutencao',
      details: details || 'Sem observações.'
    };

    this.events.update(list => [...list, newEv]);
    this.showAddModal.set(false);
    this.ecosystem.notify('Compromisso agendado no calendário com sucesso!', 'success');
  }

  private formatDateStr(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }
}
