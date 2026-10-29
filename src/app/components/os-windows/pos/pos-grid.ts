import { ChangeDetectionStrategy, Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-pos-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-3 flex flex-col h-full overflow-hidden">
      <!-- Category Pills -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0 no-scrollbar">
        @for (cat of categories(); track cat) {
          <button
            type="button"
            (click)="selectedCategory.set(cat)"
            [class]="selectedCategory() === cat ? 'bg-orange-600 text-white font-black shadow-[0_2px_8px_rgba(234,88,12,0.3)]' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'"
            class="px-3.5 py-1.5 rounded-xl text-[10px] uppercase font-black whitespace-nowrap transition-all">
            {{ cat }}
          </button>
        }
      </div>

      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          @for (prod of products(); track prod.id) {
            <div
              role="button"
              tabindex="0"
              (click)="addToCart.emit(prod)"
              (keyup.enter)="addToCart.emit(prod)"
              class="bg-slate-900/90 border border-slate-800/90 hover:border-orange-500/80 rounded-2xl p-3 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group shadow-md hover:shadow-orange-500/10 active:scale-95">
              
              <div>
                <div class="relative mb-2 overflow-hidden rounded-xl h-24 bg-slate-950 border border-slate-800/50">
                  <img [src]="prod.image" [alt]="prod.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerpolicy="no-referrer">
                  
                  <span class="absolute top-1.5 right-1.5 bg-slate-950/80 backdrop-blur-md text-[8px] font-black px-2 py-0.5 rounded-full border border-slate-800 text-slate-300 uppercase">
                    Estoque: {{ prod.stock }}
                  </span>
                </div>

                <span class="text-[9px] font-black text-slate-500 block truncate uppercase tracking-widest">{{ prod.category }}</span>
                <h4 class="font-black text-xs text-white leading-snug group-hover:text-orange-400 transition-colors uppercase tracking-tight line-clamp-2">{{ prod.name }}</h4>
              </div>

              <div class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span class="text-[8px] text-slate-500 block font-bold">VALOR UNIT.</span>
                  <span class="text-sm font-black text-orange-400 font-mono">R$ {{ prod.price.toFixed(2) }}</span>
                </div>

                <div class="w-7 h-7 rounded-xl bg-orange-600 group-hover:bg-orange-500 text-white flex items-center justify-center shadow-lg transition-all">
                  <mat-icon class="text-sm">add</mat-icon>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class PosGridComponent {
  products = input.required<ProductItem[]>();
  categories = input.required<string[]>();
  selectedCategory = model.required<string>();
  addToCart = output<ProductItem>();
}
