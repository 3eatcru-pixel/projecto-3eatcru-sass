import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { animate } from 'motion';

interface CalcKey {
  label: string;
  class: string;
  icon?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-calculator-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col max-w-sm mx-auto bg-slate-950 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
      <!-- Tactical Overlay -->
      <div class="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-10"></div>
      
      <!-- CALCULATOR DISPLAY -->
      <div class="h-52 bg-slate-900/40 p-8 flex flex-col justify-end text-right border-b border-white/5 relative z-0">
        <div class="absolute top-6 left-8 p-1.5 rounded bg-orange-600/10 border border-orange-500/20">
          <span class="text-[8px] font-black text-orange-500 uppercase tracking-[0.3em]">Business Unit</span>
        </div>
        <div class="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2 truncate font-mono opacity-60">{{ history() }}</div>
        <div class="text-5xl font-black text-white font-mono tracking-tighter break-all drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{{ display() }}</div>
      </div>

      <!-- KEYPAD: TACTICAL MESH -->
      <div #keypadGrid class="flex-1 p-6 grid grid-cols-4 gap-3 bg-slate-950 relative z-20">
        @for (row of keypad; track $index) {
          @for (key of row; track key.label) {
            <button
              type="button"
              (click)="handleKey(key.label, $event)"
              [class]="key.class"
              class="calc-btn h-16 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center transition-all active:scale-90 border shadow-lg">
              @if (key.icon) {
                <mat-icon class="text-lg">{{ key.icon }}</mat-icon>
              } @else {
                {{ key.label }}
              }
            </button>
          }
        }
      </div>

      <!-- TACTICAL FOOTER -->
      <div class="bg-slate-900/60 backdrop-blur-md px-6 py-4 border-t border-white/5 flex items-center justify-between relative z-20">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          <span class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Proc Logic Active</span>
        </div>
        <div class="flex gap-3">
          <button class="text-slate-600 hover:text-white transition-colors"><mat-icon class="text-sm">history</mat-icon></button>
          <button class="text-slate-600 hover:text-white transition-colors"><mat-icon class="text-sm">content_copy</mat-icon></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .calc-btn {
      position: relative;
      overflow: hidden;
    }
  `]
})
export class CalculatorWindowComponent {
  readonly display = signal<string>('0');
  readonly history = signal<string>('');
  private lastOperator = '';
  private firstOperand: number | null = null;
  private shouldResetDisplay = false;

  keypad: CalcKey[][] = [
    [
      { label: 'C', class: 'bg-rose-600/10 text-rose-500 border-rose-500/20 hover:bg-rose-600 hover:text-white' },
      { label: '±', class: 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800' },
      { label: '%', class: 'bg-slate-900 text-slate-400 border-white/5 hover:bg-slate-800' },
      { label: '÷', class: 'bg-orange-600 text-white border-orange-400/40 hover:bg-orange-500' }
    ],
    [
      { label: '7', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '8', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '9', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '×', class: 'bg-orange-600 text-white border-orange-400/40 hover:bg-orange-500' }
    ],
    [
      { label: '4', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '5', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '6', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '−', class: 'bg-orange-600 text-white border-orange-400/40 hover:bg-orange-500' }
    ],
    [
      { label: '1', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '2', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '3', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '+', class: 'bg-orange-600 text-white border-orange-400/40 hover:bg-orange-500' }
    ],
    [
      { label: '0', class: 'col-span-2 bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: ',', class: 'bg-slate-900 text-white border-white/5 hover:bg-slate-800 shadow-inner' },
      { label: '=', class: 'bg-emerald-600 text-white border-emerald-400/40 hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]' }
    ]
  ];

  handleKey(label: string, event: MouseEvent) {
    const btn = event.currentTarget as HTMLElement;
    animate(btn, { scale: [1, 0.9, 1] }, { duration: 0.1 });

    if (/[0-9]/.test(label)) {
      this.inputNumber(label);
    } else if (label === ',') {
      this.inputDecimal();
    } else if (label === 'C') {
      this.clear();
    } else if (label === '±') {
      this.toggleSign();
    } else if (label === '%') {
      this.percentage();
    } else if (['+', '−', '×', '÷'].includes(label)) {
      this.setOperator(label);
    } else if (label === '=') {
      this.calculate();
    }
  }

  private inputNumber(num: string) {
    if (this.shouldResetDisplay || this.display() === '0') {
      this.display.set(num);
      this.shouldResetDisplay = false;
    } else {
      this.display.update(d => d + num);
    }
  }

  private inputDecimal() {
    if (this.shouldResetDisplay) {
      this.display.set('0,');
      this.shouldResetDisplay = false;
      return;
    }
    if (!this.display().includes(',')) {
      this.display.update(d => d + ',');
    }
  }

  private clear() {
    this.display.set('0');
    this.history.set('');
    this.firstOperand = null;
    this.lastOperator = '';
    this.shouldResetDisplay = false;
  }

  private toggleSign() {
    const val = this.getNumericValue();
    this.setNumericValue(val * -1);
  }

  private percentage() {
    const val = this.getNumericValue();
    this.setNumericValue(val / 100);
  }

  private setOperator(op: string) {
    if (this.lastOperator && !this.shouldResetDisplay) {
      this.calculate();
    }
    this.firstOperand = this.getNumericValue();
    this.lastOperator = op;
    this.history.set(`${this.display()} ${op}`);
    this.shouldResetDisplay = true;
  }

  private calculate() {
    if (this.firstOperand === null || !this.lastOperator) return;

    const secondOperand = this.getNumericValue();
    let result = 0;

    switch (this.lastOperator) {
      case '+': result = this.firstOperand + secondOperand; break;
      case '−': result = this.firstOperand - secondOperand; break;
      case '×': result = this.firstOperand * secondOperand; break;
      case '÷': result = secondOperand !== 0 ? this.firstOperand / secondOperand : 0; break;
    }

    this.history.update(h => `${h} ${this.display()} =`);
    this.setNumericValue(result);
    this.firstOperand = null;
    this.lastOperator = '';
    this.shouldResetDisplay = true;
  }

  private getNumericValue(): number {
    return parseFloat(this.display().replace(',', '.'));
  }

  private setNumericValue(val: number) {
    let s = val.toString().replace('.', ',');
    if (s.length > 10) s = val.toExponential(4).replace('.', ',');
    this.display.set(s);
  }
}
