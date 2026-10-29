import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hardware-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar relative z-10 h-full">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Impressora Térmica ESC/POS -->
        <div class="bg-slate-900/60 border border-slate-800/60 rounded-[2rem] p-6 space-y-6 backdrop-blur-md relative overflow-hidden">
          <div class="flex justify-between items-start relative z-10">
            <div>
              <h4 class="font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
                <mat-icon class="text-orange-500">print</mat-icon> Impressora Térmica (ESC/POS)
              </h4>
              <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Bobina: 80mm // Corte Automático</p>
            </div>
            <span class="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">Conectado</span>
          </div>

          <div class="space-y-3 text-[10px]">
            <div>
              <label for="printerInterface" class="block text-slate-500 font-black uppercase tracking-widest mb-1">Interface de Conexão</label>
              <select id="printerInterface" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white uppercase font-black cursor-pointer">
                <option>USB Direct Driver (Epson/Daruma/Bematech)</option>
                <option>Network IP Socket (192.168.1.200:9100)</option>
                <option>Serial COM Port (9600 Baud)</option>
              </select>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="font-black uppercase text-slate-400">Acionamento de Gaveta RJ11:</span>
              <span class="text-emerald-400 font-black uppercase">Ativado no Fechamento</span>
            </div>
          </div>

          <button
            type="button"
            (click)="testPrint.emit()"
            class="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl cursor-pointer">
            <mat-icon class="text-lg text-emerald-500">receipt</mat-icon> Testar Carga ESC/POS & Guilhotina
          </button>
        </div>

        <!-- TEF & PINPad -->
        <div class="bg-slate-900/60 border border-slate-800/60 rounded-[2rem] p-6 space-y-6 backdrop-blur-md relative overflow-hidden">
          <div class="flex justify-between items-start relative z-10">
            <div>
              <h4 class="font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
                <mat-icon class="text-blue-400">credit_card</mat-icon> TEF Multi-Adquirente & PINPad
              </h4>
              <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Middleware: SiTef / Stone / Mercado Pago</p>
            </div>
            <span class="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-widest">IP Ativo</span>
          </div>

          <div class="space-y-3 text-[10px]">
            <div>
              <label for="tefIp" class="block text-slate-500 font-black uppercase tracking-widest mb-1">IP do Servidor TEF</label>
              <input id="tefIp" type="text" value="127.0.0.1:8090" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-cyan-400 font-mono font-black uppercase shadow-inner">
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
              <span class="font-black uppercase text-slate-400">PINPad USB:</span>
              <span class="text-white font-black font-mono uppercase">Gertec PPC930 [CONECTADO]</span>
            </div>
          </div>

          <button
            type="button"
            (click)="testTef.emit()"
            class="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-xl cursor-pointer">
            <mat-icon class="text-lg text-blue-400">payment</mat-icon> Testar Carga no PINPad
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
export class HardwareSettingsComponent {
  testPrint = output<void>();
  testTef = output<void>();
}
