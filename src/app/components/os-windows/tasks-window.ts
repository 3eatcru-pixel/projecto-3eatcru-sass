import { ChangeDetectionStrategy, Component, inject, signal, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { animate, stagger } from 'motion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-tasks-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-col h-full space-y-6 bg-slate-950/20 p-2">
      <!-- Tasks Tactical Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-rose-600/10 text-rose-500 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
            <mat-icon class="text-2xl">task_alt</mat-icon>
          </div>
          <div>
            <h2 class="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Process Management</h2>
            <div class="flex items-center gap-3 mt-1">
              <h1 class="text-lg font-black text-white uppercase tracking-tight">Sync Daemons & Tasks</h1>
              <span class="px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest">Background Active</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          (click)="forceSync()"
          [disabled]="syncing()"
          class="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-rose-400/20 transition-all shadow-lg hover:shadow-rose-600/20 flex items-center gap-2">
          <mat-icon class="text-sm" [class.animate-spin]="syncing()">sync</mat-icon>
          <span>{{ syncing() ? 'Synchronizing...' : 'Force Sync Protocol' }}</span>
        </button>
      </div>

      <!-- Services Status Mesh -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
        @for (service of daemons; track service.name) {
          <div class="bg-slate-900/40 border border-white/5 p-5 rounded-[2rem] relative overflow-hidden group">
            <div class="flex items-center gap-4 mb-4">
              <div class="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center border border-white/5">
                <mat-icon [class]="service.status === 'Active' ? 'text-emerald-500' : 'text-cyan-400'" class="text-lg">{{ service.icon }}</mat-icon>
              </div>
              <div class="min-w-0">
                <span class="text-[9px] font-black text-slate-500 uppercase tracking-widest block">{{ service.label }}</span>
                <span class="text-[11px] font-black text-white uppercase truncate block">{{ service.name }}</span>
              </div>
            </div>
            
            <div class="flex justify-between items-center bg-black/20 rounded-xl p-3 border border-white/5">
              <div class="flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span class="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{{ service.status }}</span>
              </div>
              <span class="text-[8px] font-black text-slate-600 font-mono">{{ service.ping }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Real-time Event Log: Tactical Mesh -->
      <div class="flex-1 flex flex-col bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
        <!-- Grid Pattern -->
        <div class="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div class="p-6 border-b border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between relative z-10">
          <div class="flex items-center gap-3">
             <mat-icon class="text-rose-500 text-lg">history_edu</mat-icon>
             <span class="text-[10px] font-black text-white uppercase tracking-[0.3em]">Protocol Audit Logs</span>
          </div>
          <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">Real-time Stream [LIVE]</span>
        </div>
        
        <div #logContainer class="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar relative z-10">
          @for (log of ecosystem.auditLogs(); track log.id) {
            <div class="log-entry flex items-center justify-between p-4 bg-slate-950/60 border border-white/5 rounded-2xl hover:border-white/10 transition-colors group">
              <div class="flex items-center gap-4">
                <div class="w-2 h-10 rounded-full" [class]="getSeverityBg(log.severity)"></div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-black text-white uppercase tracking-tight">{{ log.action }}</span>
                    <span class="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 text-slate-500 uppercase border border-white/5">{{ log.module }}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1.5 leading-relaxed">{{ log.details }}</p>
                </div>
              </div>
              <div class="text-right">
                 <div class="text-[9px] font-black text-slate-600 uppercase font-mono">{{ log.timestamp }}</div>
                 <div class="text-[8px] font-black text-slate-800 uppercase tracking-widest mt-1 group-hover:text-slate-500 transition-colors">SEQ-ID: {{ log.id.split('-')[1] }}</div>
              </div>
            </div>
          }
        </div>

        <!-- Protocol Footer -->
        <div class="p-4 bg-slate-950/80 border-t border-white/5 flex justify-center relative z-10">
           <p class="text-[8px] text-slate-700 font-black uppercase tracking-[0.4em]">Secure Communication Channel Alpha-9 Sincronized</p>
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
export class TasksWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly syncing = signal<boolean>(false);
  
  private readonly logContainer = viewChild<ElementRef>('logContainer');

  readonly daemons = [
    { label: 'Ingress Stream', name: 'Omnichannel Listener', status: 'Active', ping: '0 MS', icon: 'hub' },
    { label: 'Logistics Sync', name: 'Inventory Replier', status: 'Active', ping: 'SYNCD', icon: 'inventory' },
    { label: 'Security Node', name: 'OTA Integrity Checker', status: 'Verified', ping: 'OK', icon: 'shield' },
  ];

  constructor() {
    effect(() => {
      this.ecosystem.auditLogs();
      this.animateLogs();
    });
  }

  private animateLogs() {
    setTimeout(() => {
      const logs = this.logContainer()?.nativeElement.querySelectorAll('.log-entry');
      if (logs && logs.length > 0) {
        animate(logs, { opacity: [0, 1], x: [-20, 0] }, { duration: 0.4, delay: stagger(0.05) });
      }
    });
  }

  getSeverityBg(severity: string) {
    switch (severity) {
      case 'critical': return 'bg-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.5)]';
      case 'warning': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
      default: return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
    }
  }

  forceSync() {
    this.syncing.set(true);
    setTimeout(() => {
      this.syncing.set(false);
      this.ecosystem.notify('Sincronia Protocolar Concluída: Terminal em estado nominal.', 'success');
    }, 1200);
  }
}
