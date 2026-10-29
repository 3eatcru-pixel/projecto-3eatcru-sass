import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { CompanyTenant, POSDevice } from '../../models/ecosystem.model';
import { animate, stagger } from 'motion';

// Sub-components
import { UnitSettingsComponent } from './settings/unit-settings';
import { FiscalSettingsComponent } from './settings/fiscal-settings';
import { HardwareSettingsComponent } from './settings/hardware-settings';
import { AccessSettingsComponent, Operator } from './settings/access-settings';
import { MdmSettingsComponent } from './settings/mdm-settings';
import { ProvisionDeviceModalComponent } from './settings/provision-device-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-settings-window',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule,
    UnitSettingsComponent,
    FiscalSettingsComponent,
    HardwareSettingsComponent,
    AccessSettingsComponent,
    MdmSettingsComponent,
    ProvisionDeviceModalComponent
  ],
  template: `
    <div class="h-full flex flex-col gap-6 p-6 bg-slate-950/50 relative overflow-hidden font-mono text-xs">
      <!-- Background Grid & Scanlines -->
      <div class="absolute inset-0 pointer-events-none opacity-[0.03]" style="background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 32px 32px;"></div>
      <div class="absolute inset-0 pointer-events-none bg-scanlines opacity-[0.02]"></div>

      <!-- Top Navigation Tabs -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800 shrink-0 gap-4 relative z-10">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-orange-600/10 border border-orange-600/30 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.1)]">
            <mat-icon class="text-3xl">settings</mat-icon>
          </div>
          <div>
            <h3 class="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">Configurações <span class="text-orange-500">Nexus OS</span></h3>
            <p class="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Parâmetros de Loja, Impressão, NFC-e, TEF & Segurança</p>
          </div>
        </div>

        <!-- Tabs Switcher -->
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-md">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="activeTab.set(tab.id)"
              [class]="activeTab() === tab.id ? 'bg-orange-600 text-white font-black shadow-[0_4px_12px_rgba(234,88,12,0.3)]' : 'text-slate-500 hover:text-white'"
              class="px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 uppercase tracking-widest text-[9px] border border-transparent cursor-pointer"
              [class.border-orange-500]="activeTab() === tab.id">
              <mat-icon class="text-sm">{{ tab.icon }}</mat-icon> {{ tab.label }}
            </button>
          }
        </div>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative z-10">
        @switch (activeTab()) {
          @case ('store') {
            <app-unit-settings
              [tenant]="currentTenant()"
              (save)="saveStoreProfile()"
              (tenantUpdate)="onTenantUpdate($event)"
            />
          }
          @case ('fiscal') {
            <app-fiscal-settings
              [nfceEnv]="nfceEnv()"
              [cscId]="cscId()"
              [cscToken]="cscToken()"
              [certType]="certType()"
              [taxRegime]="taxRegime()"
              [contingencyMode]="contingencyMode()"
              (save)="saveFiscalConfig()"
              (testSync)="testFiscalSync()"
              (fieldUpdate)="onFiscalUpdate($event)"
            />
          }
          @case ('peripherals') {
            <app-hardware-settings
              (testPrint)="testPrintReceipt()"
              (testTef)="testTefPinpad()"
            />
          }
          @case ('access') {
            <app-access-settings
              [operators]="operators()"
              (addOperator)="showAddOpModal.set(true)"
            />
          }
          @case ('mdm') {
            <app-mdm-settings
              [tenant]="currentTenant()"
              [devices]="tenantDevices()"
              (provisionDevice)="showPairModal.set(true)"
              (lock)="ecosystem.lockDevice($event)"
              (unlock)="ecosystem.unlockDevice($event)"
              (restart)="ecosystem.restartDevice($event)"
              (revoke)="ecosystem.revokeDevice($event)"
            />
          }
        }
      </div>

      <!-- Modals -->
      @if (showPairModal()) {
        <app-provision-device-modal
          (closeModal)="showPairModal.set(false)"
          (saveDevice)="saveNewDevice($event)"
        />
      }

    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .bg-scanlines {
      background: linear-gradient(
        to bottom,
        transparent 50%,
        rgba(0, 0, 0, 0.5) 50%
      );
      background-size: 100% 4px;
    }
  `]
})
export class SettingsWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly tabs: {id: 'store' | 'fiscal' | 'peripherals' | 'access' | 'mdm', label: string, icon: string}[] = [
    { id: 'store', label: 'Unidade', icon: 'store' },
    { id: 'fiscal', label: 'Fiscal NFC-e', icon: 'receipt_long' },
    { id: 'peripherals', label: 'Hardware & TEF', icon: 'print' },
    { id: 'access', label: 'Operadores & PIN', icon: 'admin_panel_settings' },
    { id: 'mdm', label: 'MDM Fleet', icon: 'devices' }
  ];

  readonly activeTab = signal<'store' | 'fiscal' | 'peripherals' | 'access' | 'mdm'>('store');
  readonly showPairModal = signal<boolean>(false);
  readonly showAddOpModal = signal<boolean>(false);

  currentTenant = computed(() => {
    const id = this.ecosystem.currentTenantId();
    return this.ecosystem.tenants().find(t => t.id === id) || this.ecosystem.tenants()[0];
  });

  tenantDevices = computed(() => {
    const id = this.ecosystem.currentTenantId();
    return this.ecosystem.devices().filter(d => d.tenantId === id);
  });

  // Fiscal Signals
  readonly nfceEnv = signal<'production' | 'homologation'>('production');
  readonly cscId = signal('000001');
  readonly cscToken = signal('A1B2C3D4E5F67890');
  readonly certType = signal('a1');
  readonly taxRegime = signal('simples');
  readonly contingencyMode = signal('enabled');

  // Operators List Signal
  readonly operators = signal<Operator[]>([
    { id: 'op-1', name: 'GERENTE DE LOJA', role: 'Gerente Geral', canSangria: true, canVoid: true },
    { id: 'op-2', name: 'CAIXA PRINCIPAL 01', role: 'Operador de Caixa', canSangria: false, canVoid: false },
    { id: 'op-3', name: 'ATENDENTE BALCÃO', role: 'Atendente', canSangria: false, canVoid: false }
  ]);

  constructor() {
    effect(() => {
      if (this.activeTab() === 'mdm') {
        this.animateTabContent();
      }
    });
  }

  private animateTabContent() {
    setTimeout(() => {
      const cards = document.querySelectorAll('.device-card');
      if (cards.length > 0) {
        animate(
          cards,
          { opacity: [0, 1], scale: [0.98, 1], y: [10, 0] },
          { delay: stagger(0.05), duration: 0.4 }
        );
      }
    }, 0);
  }

  onTenantUpdate(update: Partial<CompanyTenant>) {
    this.ecosystem.updateTenant(this.currentTenant().id, update);
  }

  saveStoreProfile() {
    this.ecosystem.notify('Parâmetros de unidade atualizados com sucesso.', 'success');
  }

  onFiscalUpdate(event: {key: string, value: string}) {
    switch (event.key) {
      case 'nfceEnv': this.nfceEnv.set(event.value as 'production' | 'homologation'); break;
      case 'cscId': this.cscId.set(event.value); break;
      case 'cscToken': this.cscToken.set(event.value); break;
      case 'certType': this.certType.set(event.value); break;
      case 'taxRegime': this.taxRegime.set(event.value); break;
      case 'contingencyMode': this.contingencyMode.set(event.value); break;
    }
  }

  saveFiscalConfig() {
    this.ecosystem.notify('Parâmetros NFC-e / SEFAZ salvos e validados com sucesso.', 'success');
  }

  testFiscalSync() {
    this.ecosystem.notify('Comunicação SEFAZ: Latência 24ms (Status 107 - Serviço em Operação)', 'info');
  }

  testPrintReceipt() {
    this.ecosystem.notify('Enviando buffer ESC/POS para impressora...', 'info');
    setTimeout(() => this.ecosystem.notify('Impressão de teste concluída.', 'success'), 1500);
  }

  testTefPinpad() {
    this.ecosystem.notify('Aguardando interação no PINPad...', 'info');
    setTimeout(() => this.ecosystem.notify('PINPad respondendo via USB.', 'success'), 2000);
  }

  saveNewDevice(data: {name: string, type: POSDevice['type'], location: string}) {
    this.ecosystem.addDevice({
      tenantId: this.ecosystem.currentTenantId(),
      tenantName: this.currentTenant().name,
      deviceName: data.name,
      type: data.type,
      location: data.location,
      serialNumber: `SN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      macAddress: '00:00:00:00:00:00',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 254 + 1)}`,
      osVersion: 'Nexus OS v2.1',
      appVersion: 'v26.10',
      status: 'online',
      batteryLevel: 100
    });
    this.showPairModal.set(false);
    this.ecosystem.notify('Novo terminal provisionado com sucesso.', 'success');
  }
}
