import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CompanyTenant, POSDevice } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-mdm-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar relative z-10 h-full">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-[2rem] backdrop-blur-md">
        <div>
          <h4 class="font-black text-[11px] text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <span class="w-1 h-3 bg-orange-600 rounded-full"></span>
            MDM Central // Fleet Manager
          </h4>
          <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Status: {{ devices().length }} / {{ tenant().devicesLimit }} Terminais Autorizados</p>
        </div>

        <button
          type="button"
          (click)="provisionDevice.emit()"
          class="bg-white hover:bg-slate-200 text-slate-950 font-black px-6 py-3 rounded-xl flex items-center gap-2 shadow-xl transition-all active:scale-95 uppercase tracking-widest text-[10px] cursor-pointer">
          <mat-icon class="text-lg">add_to_queue</mat-icon> Provisionar Terminal
        </button>
      </div>

      <!-- Device Cards List -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        @for (dev of devices(); track dev.id) {
          <div
            class="device-card bg-slate-900/40 border rounded-[2rem] p-6 space-y-4 shadow-xl relative overflow-hidden transition-all backdrop-blur-md group"
            [class.border-rose-500/40]="dev.status === 'locked'"
            [class.border-slate-800/60]="dev.status !== 'locked'">
            
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-4">
                <div class="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-orange-500 group-hover:border-orange-500/30 transition-colors shadow-inner">
                  <mat-icon class="text-3xl">
                    {{ dev.type === 'tablet' ? 'tablet_mac' : dev.type === 'kiosk' ? 'touch_app' : 'point_of_sale' }}
                  </mat-icon>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h5 class="font-black text-sm text-white uppercase tracking-tight">{{ dev.deviceName }}</h5>
                    <span class="text-[8px] uppercase font-black px-2 py-0.5 rounded bg-orange-600/10 text-orange-500 border border-orange-500/20">
                      {{ dev.type }}
                    </span>
                  </div>
                  <p class="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">POS // {{ dev.location }}</p>
                </div>
              </div>

              <!-- Status Badge -->
              <div>
                @if (dev.status === 'online') {
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black text-[9px] uppercase tracking-widest">
                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span> Operante
                  </span>
                } @else if (dev.status === 'locked') {
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 font-black text-[9px] uppercase tracking-widest">
                    <mat-icon class="text-xs">lock</mat-icon> Bloqueado
                  </span>
                } @else {
                  <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 font-black text-[9px] uppercase tracking-widest">
                    Inativo
                  </span>
                }
              </div>
            </div>

            <!-- Hardware Specs Grid -->
            <div class="grid grid-cols-2 gap-4 p-4 bg-slate-950/80 rounded-2xl border border-slate-800/50 text-[9px]">
              <div class="space-y-0.5">
                <span class="text-slate-500 font-black uppercase tracking-widest block">Hardware SN</span>
                <strong class="font-mono text-slate-300">{{ dev.serialNumber }}</strong>
              </div>
              <div class="space-y-0.5">
                <span class="text-slate-500 font-black uppercase tracking-widest block">Local IP Target</span>
                <strong class="font-mono text-cyan-400">{{ dev.ipAddress }}</strong>
              </div>
              <div class="space-y-0.5">
                <span class="text-slate-500 font-black uppercase tracking-widest block">Firmware Build</span>
                <strong class="font-mono text-orange-500">{{ dev.appVersion }}</strong>
              </div>
              <div class="space-y-0.5">
                <span class="text-slate-500 font-black uppercase tracking-widest block">Battery</span>
                <div class="flex items-center gap-2">
                  <div class="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-emerald-500 h-full" [style.width.%]="dev.batteryLevel"></div>
                  </div>
                  <span class="text-slate-300">{{ dev.batteryLevel }}%</span>
                </div>
              </div>
            </div>

            <!-- MDM Controls -->
            <div class="flex items-center gap-3">
              @if (dev.status === 'locked') {
                <button
                  type="button"
                  (click)="unlock.emit(dev.id)"
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer">
                  <mat-icon class="text-sm">lock_open</mat-icon> Liberar Terminal
                </button>
              } @else {
                <button
                  type="button"
                  (click)="lock.emit(dev.id)"
                  class="flex-1 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white py-3 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] border border-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer">
                  <mat-icon class="text-sm">lock</mat-icon> Lockdown Remoto
                </button>
              }

              <button
                type="button"
                (click)="restart.emit(dev.id)"
                class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer">
                <mat-icon class="text-sm">restart_alt</mat-icon> Boot
              </button>

              <button
                type="button"
                (click)="revoke.emit(dev.id)"
                class="p-3 bg-slate-800 hover:bg-rose-600 text-slate-500 hover:text-white rounded-xl transition-all group-hover:border-rose-500/30 border border-transparent cursor-pointer"
                title="Revogar Licença">
                <mat-icon class="text-sm">link_off</mat-icon>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class MdmSettingsComponent {
  tenant = input.required<CompanyTenant>();
  devices = input.required<POSDevice[]>();
  
  provisionDevice = output<void>();
  lock = output<string>();
  unlock = output<string>();
  restart = output<string>();
  revoke = output<string>();
}
