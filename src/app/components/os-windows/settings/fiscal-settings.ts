import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-fiscal-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar relative z-10 h-full">
      <div class="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6 space-y-6 backdrop-blur-md">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <h4 class="font-black text-[11px] text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <span class="w-1 h-3 bg-emerald-500 rounded-full"></span>
            Parâmetros SEFAZ & Emissão NFC-e
          </h4>
          <span class="text-[9px] uppercase font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> SEFAZ Online
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-1.5">
            <label for="nfceEnv" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Ambiente SEFAZ</label>
            <select 
              id="nfceEnv"
              [value]="nfceEnv()" 
              (change)="updateField('nfceEnv', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 uppercase font-black cursor-pointer">
              <option value="production">1 - Produção (Com Valor Fiscal)</option>
              <option value="homologation">2 - Homologação (Testes)</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="cscId" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">ID do Token CSC</label>
            <input 
              id="cscId"
              [value]="cscId()" 
              (input)="updateField('cscId', $event)"
              type="text" 
              placeholder="000001" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 font-mono font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="cscToken" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Código CSC (Token de Segurança)</label>
            <input 
              id="cscToken"
              [value]="cscToken()" 
              (input)="updateField('cscToken', $event)"
              type="password" 
              placeholder="A1B2C3D4E5F67890..." 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 font-mono font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="certType" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Tipo de Certificado Digital</label>
            <select 
              id="certType"
              [value]="certType()" 
              (change)="updateField('certType', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 uppercase font-black cursor-pointer">
              <option value="a1">Certificado Digital A1 (.pfx em Nuvem)</option>
              <option value="a3">Certificado Digital A3 (Token USB / Smartcard)</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="taxRegime" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Regime Tributário</label>
            <select 
              id="taxRegime"
              [value]="taxRegime()" 
              (change)="updateField('taxRegime', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 uppercase font-black cursor-pointer">
              <option value="simples">1 - Simples Nacional</option>
              <option value="lucro_presumido">2 - Lucro Presumido</option>
              <option value="lucro_real">3 - Lucro Real</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="contingencyMode" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Contingência Offline Automática</label>
            <select 
              id="contingencyMode"
              [value]="contingencyMode()" 
              (change)="updateField('contingencyMode', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 focus:outline-none focus:border-orange-500 uppercase font-black cursor-pointer">
              <option value="enabled">Ativada (Buffer local e retransmissão automática)</option>
              <option value="disabled">Desativada (Bloqueia venda se SEFAZ off)</option>
            </select>
          </div>
        </div>

        <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-[10px]">
          <div class="flex items-center gap-3 text-slate-400">
            <mat-icon class="text-emerald-400">verified</mat-icon>
            <span>Certificado A1 Ativo: <strong class="text-white">CERT-3EAT-2026.pfx</strong> (Validade: 14/11/2027)</span>
          </div>
          <button type="button" (click)="testSync.emit()" class="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl uppercase font-black cursor-pointer">Testar Comunicação SEFAZ</button>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="button"
            (click)="save.emit()"
            class="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-8 py-4 rounded-xl shadow-lg flex items-center gap-3 uppercase tracking-widest active:scale-95 cursor-pointer">
            <mat-icon class="text-lg">save</mat-icon> Salvar Parâmetros Fiscais
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class FiscalSettingsComponent {
  nfceEnv = input.required<string>();
  cscId = input.required<string>();
  cscToken = input.required<string>();
  certType = input.required<string>();
  taxRegime = input.required<string>();
  contingencyMode = input.required<string>();

  save = output<void>();
  testSync = output<void>();
  fieldUpdate = output<{key: string, value: string}>();

  updateField(key: string, event: Event) {
    const value = (event.target as HTMLInputElement | HTMLSelectElement).value;
    this.fieldUpdate.emit({ key, value });
  }
}
