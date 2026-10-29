import { ChangeDetectionStrategy, Component, inject, signal, effect, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { ServiceOrder, Appointment } from '../../models/ecosystem.model';

// Sub-components
import { ServicesDashboardComponent } from './services/services-dashboard';
import { ServicesKanbanComponent } from './services/services-kanban';
import { ServicesAgendaComponent } from './services/services-agenda';
import { ServiceDetailsModalComponent } from './services/service-details-modal';
import { CreateOSModalComponent } from './services/create-os-modal';
import { AddAppointmentModalComponent } from './services/add-appointment-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-services-window',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    ServicesDashboardComponent,
    ServicesKanbanComponent,
    ServicesAgendaComponent,
    ServiceDetailsModalComponent,
    CreateOSModalComponent,
    AddAppointmentModalComponent
  ],
  template: `
    <div class="h-full flex flex-col space-y-4 text-xs text-white font-mono">
      
      <!-- Services Navigation Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 border-b border-[#3d200f] shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-2.5 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 text-stone-950 font-bold shadow-md">
            <mat-icon class="text-xl">handyman</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-serif font-black text-base text-white uppercase tracking-tight">Centro de Serviços & Manutenção</h1>
              <span class="border border-amber-600/50 text-amber-500 bg-amber-950/40 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-widest">
                {{ activeTab().toUpperCase() }}
              </span>
            </div>
            <p class="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">Gestão de Ordens, Agendamentos e Laudos Técnicos</p>
          </div>
        </div>

        <div class="flex items-center gap-2 bg-[#1d1008] p-1 rounded-xl border border-[#4d2813]">
          <button 
            type="button"
            (click)="activeTab.set('dashboard')"
            [class]="activeTab() === 'dashboard' ? 'bg-amber-600 text-stone-950 shadow-inner' : 'text-stone-400 hover:text-white'"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer">
            <mat-icon class="text-xs">dashboard</mat-icon> Dashboard
          </button>
          <button 
            type="button"
            (click)="activeTab.set('orders')"
            [class]="activeTab() === 'orders' ? 'bg-amber-600 text-stone-950 shadow-inner' : 'text-stone-400 hover:text-white'"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer">
            <mat-icon class="text-xs">assignment</mat-icon> Ordens (O.S.)
          </button>
          <button 
            type="button"
            (click)="activeTab.set('agenda')"
            [class]="activeTab() === 'agenda' ? 'bg-amber-600 text-stone-950 shadow-inner' : 'text-stone-400 hover:text-white'"
            class="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer">
            <mat-icon class="text-xs">event</mat-icon> Agendamentos
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden">
        
        @switch (activeTab()) {
          @case ('dashboard') {
            <app-services-dashboard
              [serviceOrders]="ecosystem.serviceOrders()"
              [appointmentsToday]="appointmentsToday()"
              (viewAllOrders)="activeTab.set('orders')"
              (selectOrder)="openOSDetails($event)"
            />
          }
          @case ('orders') {
            <app-services-kanban
              [serviceOrders]="ecosystem.serviceOrders()"
              (createOrder)="openCreateOS()"
              (selectOrder)="openOSDetails($event)"
              (moveStatus)="moveStatus($event.id, $event.status)"
              (settleOrder)="settleOS($event)"
            />
          }
          @case ('agenda') {
            <app-services-agenda
              [appointments]="ecosystem.appointments()"
              [currentTenantId]="ecosystem.currentTenantId()"
              (addAppointment)="showAddAptModal.set(true)"
              (updateStatus)="updateAptStatus($event.id, $event.status)"
            />
          }
        }
      </div>

      <!-- Modals -->
      @if (showOSDetailsModal()) {
        <app-service-details-modal
          [os]="selectedOS()"
          (closeModal)="showOSDetailsModal.set(false)"
          (moveStatus)="moveStatus($event.id, $event.status)"
        />
      }

      @if (showCreateOSModal()) {
        <app-create-os-modal
          (closeModal)="showCreateOSModal.set(false)"
          (saveOS)="saveNewOS($event)"
        />
      }

      @if (showAddAptModal()) {
        <app-add-appointment-modal
          (closeModal)="showAddAptModal.set(false)"
          (saveAppointment)="saveNewApt($event)"
        />
      }

    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
  `]
})
export class ServicesWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  
  readonly initialTab = input<'dashboard' | 'orders' | 'agenda'>('dashboard');
  readonly activeTab = signal<'dashboard' | 'orders' | 'agenda'>('dashboard');

  constructor() {
    effect(() => {
      this.activeTab.set(this.initialTab());
    });
  }

  readonly showOSDetailsModal = signal<boolean>(false);
  readonly showCreateOSModal = signal<boolean>(false);
  readonly showAddAptModal = signal<boolean>(false);
  readonly selectedOS = signal<ServiceOrder | null>(null);

  appointmentsToday = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.ecosystem.appointments().filter(a => a.date === today && a.tenantId === this.ecosystem.currentTenantId());
  });

  openOSDetails(os: ServiceOrder) {
    this.selectedOS.set(os);
    this.showOSDetailsModal.set(true);
  }

  openCreateOS() {
    this.showCreateOSModal.set(true);
  }

  saveNewOS(data: {client: string, equip: string, prio: string, labor: string}) {
    const laborPrice = Number(data.labor) || 200;
    this.ecosystem.addServiceOrder({
      osNumber: `#OS-${Math.floor(Math.random()*9000 + 1000)}`,
      clientName: data.client,
      equipment: data.equip,
      technician: 'Carlos Lima',
      description: 'Manutenção solicitada pelo cliente via balcão.',
      priority: data.prio as 'Normal' | 'Crítico',
      status: 'triagem',
      parts: [],
      laborPrice,
      price: laborPrice,
      progressPercent: 0
    });
    this.showCreateOSModal.set(false);
    this.ecosystem.notify('Nova Ordem de Serviço aberta!', 'success');
  }

  moveStatus(id: string, status: ServiceOrder['status']) {
    const progress = status === 'execucao' ? 40 : (status === 'finalizado' ? 100 : 0);
    this.ecosystem.updateServiceOrderStatus(id, status, progress);
    this.ecosystem.notify(`Status da O.S. alterado para ${status.toUpperCase()}`, 'info');
    if (this.showOSDetailsModal()) this.showOSDetailsModal.set(false);
  }

  settleOS(os: ServiceOrder) {
    this.ecosystem.settleServiceOrder(os.id, 'Cartão');
    this.ecosystem.notify(`O.S. ${os.osNumber} liquidada e faturada.`, 'success');
  }

  saveNewApt(data: {client: string, date: string, time: string, service: string}) {
    this.ecosystem.addAppointment({
      tenantId: this.ecosystem.currentTenantId(),
      customerName: data.client,
      customerPhone: '11 99999-0000',
      date: data.date,
      time: data.time,
      serviceType: data.service,
      status: 'confirmed'
    });
    this.showAddAptModal.set(false);
    this.ecosystem.notify('Agendamento confirmado!', 'success');
  }

  updateAptStatus(id: string, status: Appointment['status']) {
    this.ecosystem.updateAppointmentStatus(id, status);
  }
}
