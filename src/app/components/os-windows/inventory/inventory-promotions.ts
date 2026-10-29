import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Promotion } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-inventory-promotions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (promo of promotions(); track promo.id) {
          <div class="bg-stone-900 border border-amber-500/20 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div>
              <div class="flex justify-between items-start mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                    <mat-icon>{{ promo.type === 'bundle' ? 'auto_awesome' : 'redeem' }}</mat-icon>
                  </div>
                  <div>
                    <h4 class="font-bold text-white uppercase tracking-tight">{{ promo.name }}</h4>
                    <span class="text-[9px] text-stone-500 uppercase font-mono">{{ promo.type === 'bundle' ? 'Combo / Kit' : 'Compre e Ganhe' }}</span>
                  </div>
                </div>
                <span [class]="promo.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'" class="border px-2 py-0.5 rounded text-[8px] font-black uppercase">
                  {{ promo.isActive ? 'Ativa' : 'Pausada' }}
                </span>
              </div>

              <div class="bg-stone-950 p-2.5 rounded-xl border border-stone-800 space-y-1 text-[10px]">
                <div class="text-stone-400 uppercase font-black">Regra de Acionamento:</div>
                <div class="text-white">
                  @for (pid of promo.triggerProductIds; track pid; let last = $last) {
                    <span>{{ pid }}{{ !last ? ' + ' : '' }}</span>
                  }
                </div>
                <div class="text-amber-400 font-bold mt-1">Benefício: {{ promo.discountValue }}% de Desconto</div>
              </div>
            </div>

            <div class="flex gap-2 mt-4 pt-3 border-t border-stone-800">
              <button class="flex-1 bg-stone-800 hover:bg-stone-700 text-white font-bold py-2 rounded-xl text-[10px] uppercase cursor-pointer">Editar Regra</button>
              <button class="flex-1 bg-rose-950/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 font-bold py-2 rounded-xl text-[10px] uppercase cursor-pointer">Desativar</button>
            </div>
          </div>
        }

        <button class="bg-stone-950 border-2 border-dashed border-stone-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center group hover:border-amber-500/40 transition-all cursor-pointer">
          <mat-icon class="text-3xl text-stone-700 group-hover:text-amber-500 mb-2">add_circle_outline</mat-icon>
          <h4 class="text-stone-500 group-hover:text-stone-300 font-bold uppercase text-[10px]">Criar Nova Promoção</h4>
          <p class="text-stone-700 text-[8px] mt-1 uppercase">Buy X Get Y, Cupons ou Mix de Produtos</p>
        </button>
      </div>
    </div>
  `
})
export class InventoryPromotionsComponent {
  promotions = input.required<Promotion[]>();
}
