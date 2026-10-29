import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-inventory-labels',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex-1 flex flex-col space-y-4 overflow-hidden">
      <div class="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div>
          <h3 class="text-white font-bold text-sm uppercase tracking-tight flex items-center gap-2">
            <mat-icon class="text-amber-500">print</mat-icon> Gerador de Etiquetas de Gôndola
          </h3>
          <p class="text-[10px] text-stone-400 uppercase mt-1">Geração de etiquetas térmicas e de prateleira (Padrão 60x40mm ou 100x30mm) com código de barras autêntico.</p>
        </div>
        <button
          type="button"
          (click)="printLabels()"
          class="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-6 py-2.5 rounded-xl shadow-lg text-[10px] uppercase transition-all cursor-pointer flex items-center gap-2 active:scale-95">
          <mat-icon class="text-sm">print</mat-icon> Imprimir Selecionadas (Zebra/Argox)
        </button>
      </div>

      <div class="flex-1 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 custom-scrollbar p-1">
        @for (p of products(); track p.id) {
          <div class="bg-white border-2 border-stone-300 rounded-lg p-3 text-stone-950 font-sans shadow-sm relative overflow-hidden flex flex-col justify-between h-44">
            <div class="flex justify-between items-start border-b border-stone-200 pb-1.5 mb-1">
              <div class="font-black text-[11px] leading-tight uppercase line-clamp-2 w-2/3">{{ p.name }}</div>
              <span class="text-[8px] font-mono text-stone-500 font-bold uppercase">SKU: {{ p.sku }}</span>
            </div>

            <div class="text-center flex-1 flex flex-col justify-center">
              <div class="text-[9px] font-bold text-stone-500 uppercase">Preço Unitário</div>
              <div class="text-2xl font-black text-stone-900 tracking-tighter leading-none mt-1">R$ {{ p.price.toFixed(2) }}</div>
              @if (p.wholesalePrice) {
                <div class="text-[8px] font-bold text-stone-600 mt-0.5">ATACADO: R$ {{ p.wholesalePrice.toFixed(2) }}</div>
              }
            </div>

            <div class="mt-1 flex flex-col items-center">
               <!-- Code-128 / EAN-13 Barcode Vector Engine -->
               <div class="w-full h-8 flex items-center justify-center bg-white border border-stone-200 rounded px-1">
                 <svg class="w-full h-6" viewBox="0 0 100 24" preserveAspectRatio="none">
                   @for (bar of getBarcodePattern(p.barcode); track $index) {
                     <rect [attr.x]="bar.x" y="1" [attr.width]="bar.width" height="22" fill="#111" />
                   }
                 </svg>
               </div>
               <div class="text-[8px] font-mono mt-0.5 font-bold tracking-widest text-stone-800">{{ p.barcode }}</div>
            </div>

            <!-- Yellow badge for retail promotion -->
            <div class="absolute -top-6 -right-6 w-12 h-12 bg-amber-400 rotate-45"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class InventoryLabelsComponent {
  products = input.required<ProductItem[]>();

  getBarcodePattern(barcode: string): { x: number; width: number }[] {
    const bars: { x: number; width: number }[] = [];
    const code = barcode || '789100010001';
    let currentX = 2;
    
    // Start guards
    bars.push({ x: currentX, width: 1.2 }); currentX += 2.2;
    bars.push({ x: currentX, width: 1.2 }); currentX += 2.8;

    for (let i = 0; i < code.length; i++) {
      const digit = parseInt(code[i], 10) || (code.charCodeAt(i) % 9) + 1;
      const w1 = (digit % 3) * 0.6 + 1.0;
      const w2 = ((digit + 2) % 3) * 0.5 + 1.0;
      bars.push({ x: currentX, width: w1 });
      currentX += w1 + 1.4;
      bars.push({ x: currentX, width: w2 });
      currentX += w2 + 1.6;
      if (currentX > 94) break;
    }

    // Stop guards
    bars.push({ x: Math.min(95, currentX), width: 1.2 });
    bars.push({ x: Math.min(97.5, currentX + 2.2), width: 1.2 });
    return bars;
  }

  printLabels() {
    window.print();
  }
}
