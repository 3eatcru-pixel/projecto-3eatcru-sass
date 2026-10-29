import { ChangeDetectionStrategy, Component, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate, stagger } from 'motion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-col h-full space-y-6 bg-slate-950/20 p-2">
      <!-- System Tactical Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-cyan-600/10 text-cyan-500 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <mat-icon class="text-2xl">computer</mat-icon>
          </div>
          <div>
            <h2 class="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Core Architecture</h2>
            <div class="flex items-center gap-3 mt-1">
              <h1 class="text-lg font-black text-white uppercase tracking-tight">Terminal Diagnostics</h1>
              <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 text-[9px] font-black uppercase tracking-widest">Zoneless Engine</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="flex flex-col items-end px-4 border-r border-white/5">
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uptime</span>
            <span class="text-sm font-black text-white font-mono uppercase">14D 02H 44M</span>
          </div>
          <mat-icon class="text-slate-600">developer_board</mat-icon>
        </div>
      </div>

      <!-- Specs Mesh -->
      <div #specsMesh class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-8">
        <!-- Hardware Info -->
        <div class="spec-card bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden group">
          <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
          
          <h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <mat-icon class="text-xs text-cyan-500">memory</mat-icon> Hardware Identity
          </h3>

          <div class="space-y-3">
            @for (spec of hardwareSpecs; track spec.label) {
              <div class="flex justify-between items-center py-2 border-b border-white/5 group/row">
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">{{ spec.label }}</span>
                <span [class]="spec.color || 'text-white'" class="text-[11px] font-black uppercase tracking-tight font-mono">{{ spec.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Software Stack -->
        <div class="spec-card bg-slate-900/40 border border-white/5 rounded-3xl p-6 space-y-4 shadow-xl relative overflow-hidden group">
          <h3 class="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
            <mat-icon class="text-xs text-orange-500">settings_applications</mat-icon> Kernel Environment
          </h3>

          <div class="space-y-3">
            @for (spec of softwareSpecs; track spec.label) {
              <div class="flex justify-between items-center py-2 border-b border-white/5 group/row">
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest">{{ spec.label }}</span>
                <span [class]="spec.color || 'text-white'" class="text-[11px] font-black uppercase tracking-tight font-mono">{{ spec.value }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Resource Gauges -->
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (gauge of resources; track gauge.label) {
            <div class="spec-card bg-slate-950 border border-white/5 rounded-3xl p-6 space-y-4 shadow-2xl relative overflow-hidden group">
              <div class="flex justify-between items-start">
                <div>
                  <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{{ gauge.label }}</span>
                  <div class="text-2xl font-black text-white mt-1 font-mono tracking-tighter">{{ gauge.value }}</div>
                </div>
                <div [class]="gauge.color" class="p-2 rounded-xl bg-white/5 border border-white/5">
                  <mat-icon class="text-sm">{{ gauge.icon }}</mat-icon>
                </div>
              </div>
              
              <div class="relative h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1.5px]">
                <div 
                  [style.width.%]="gauge.percent"
                  [class]="gauge.bg"
                  class="h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
              </div>

              <div class="flex justify-between text-[8px] font-black text-slate-600 uppercase tracking-widest">
                <span>Safe Range</span>
                <span>Active Limit: {{ gauge.limit }}</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Network Protocol Footer -->
      <div class="bg-slate-900/60 backdrop-blur-md px-6 py-4 border border-white/5 rounded-2xl flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">HQ Sync: Established</span>
          </div>
          <div class="w-px h-4 bg-white/10"></div>
          <div class="flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
            <mat-icon class="text-sm">router</mat-icon>
            Node-BR-9981
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-[9px] font-black text-cyan-400 font-mono">LATENCY: 14MS</span>
          <button class="p-2 rounded-lg bg-slate-950 border border-white/5 text-slate-500 hover:text-white transition-all"><mat-icon class="text-xs">refresh</mat-icon></button>
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
export class SystemWindowComponent {
  private readonly specsMesh = viewChild<ElementRef>('specsMesh');

  readonly hardwareSpecs = [
    { label: 'Device Model', value: '3EAT-PRO-X1' },
    { label: 'Serial Number', value: 'SN-3EAT-9981-BR', color: 'text-orange-500' },
    { label: 'Processor', value: 'Quad-Core 2.4GHz ARM' },
    { label: 'Storage', value: '128GB NVMe SSD' },
    { label: 'Display Node', value: '1080p Tactical Panel' },
  ];

  readonly softwareSpecs = [
    { label: 'OS Build', value: 'v4.2.0-PRO (Industrial)' },
    { label: 'Framework', value: 'Angular 21.0.0', color: 'text-rose-500' },
    { label: 'Detection', value: 'Zoneless Mode Active', color: 'text-emerald-400' },
    { label: 'Security', value: 'AES-256 Node-to-Node' },
    { label: 'Local DB', value: 'SQLite Indexed (PWA)' },
  ];

  readonly resources = [
    { label: 'CPU Usage', value: '8.4%', percent: 8.4, limit: '95%', icon: 'bolt', color: 'text-emerald-500', bg: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' },
    { label: 'RAM Memory', value: '1.8 / 8.0 GB', percent: 22.5, limit: '100%', icon: 'speed', color: 'text-cyan-500', bg: 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]' },
    { label: 'TX Stream', value: '0 Pending', percent: 100, limit: 'Active', icon: 'sync', color: 'text-orange-500', bg: 'bg-emerald-500' },
  ];

  constructor() {
    effect(() => {
      this.animateSpecs();
    });
  }

  private animateSpecs() {
    setTimeout(() => {
      const cards = this.specsMesh()?.nativeElement.querySelectorAll('.spec-card');
      if (cards && cards.length > 0) {
        animate(cards, { opacity: [0, 1], y: [15, 0] }, { duration: 0.5, delay: stagger(0.1) });
      }
    });
  }
}
