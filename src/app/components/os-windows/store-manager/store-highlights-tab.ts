import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ProductItem } from '../../../models/ecosystem.model';

export interface HighlightsFormState {
  specialties: string[];
  highlightedProductIds: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-store-highlights-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6 text-stone-200">
      
      <!-- SPECIALTIES / TAGS -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm">
            <mat-icon class="text-base">label</mat-icon>
            <span>Especialidades &amp; Tags da Loja</span>
          </div>
          <span class="text-[10px] text-stone-400 font-mono">{{ form().specialties.length }} ativas</span>
        </div>

        <div class="space-y-3 text-xs">
          <!-- Current Tags Pills -->
          <div class="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-[#0e0805] border border-[#4d2813] rounded-xl items-center">
            @if (form().specialties.length === 0) {
              <span class="text-stone-500 italic text-xs">Nenhuma tag de especialidade adicionada.</span>
            }
            @for (tag of form().specialties; track tag) {
              <span class="bg-[#2b160b] text-amber-300 border border-[#482814] px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm">
                <span>{{ tag }}</span>
                <button
                  type="button"
                  (click)="removeTag(tag)"
                  class="text-amber-500 hover:text-rose-400 font-black cursor-pointer">
                  ✕
                </button>
              </span>
            }
          </div>

          <!-- Add new tag input -->
          <div class="flex items-center gap-2">
            <input
              #newTagInput
              type="text"
              (keydown.enter)="addTag(newTagInput.value); newTagInput.value = ''"
              class="flex-1 bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500 text-xs"
              placeholder="Digite uma tag (ex: Smash Burgers, Chopp Artesanal) e aperte Enter">
            
            <button
              type="button"
              (click)="addTag(newTagInput.value); newTagInput.value = ''"
              class="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 cursor-pointer">
              <mat-icon class="text-sm">add</mat-icon> Adicionar
            </button>
          </div>

          <!-- Preset tag suggestions -->
          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[10px] text-stone-500 font-mono">Sugestões rápidas:</span>
            @for (sug of tagSuggestions; track sug) {
              <button
                type="button"
                (click)="addTag(sug)"
                class="text-[10px] bg-[#2b160b] hover:bg-[#3d200f] text-amber-400 px-2 py-0.5 rounded-lg border border-[#482814] cursor-pointer">
                + {{ sug }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- HIGHLIGHTED PRODUCTS IN STOREFRONT -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm">
            <mat-icon class="text-base">star</mat-icon>
            <span>Produtos em Destaque no Topo do Cardápio</span>
          </div>
          <span class="text-[10px] text-stone-400 font-mono">
            {{ form().highlightedProductIds.length }} selecionados
          </span>
        </div>

        <p class="text-xs text-stone-400">
          Marque os itens que você deseja exibir com selo especial de "⭐ Destaque da Casa" na vitrine pública do cliente.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto pr-1">
          @for (prod of storeProducts(); track prod.id) {
            <button
              type="button"
              (click)="toggleProductHighlight(prod.id)"
              [class]="isProductHighlighted(prod.id) ? 'bg-[#2b160b] border-amber-500 ring-1 ring-amber-500/50' : 'bg-[#0e0805] border-[#3d200f] hover:bg-[#150a04]'"
              class="p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all text-left w-full">
              
              <div class="flex items-center gap-2.5">
                <img
                  [src]="prod.image"
                  [alt]="prod.name"
                  class="w-10 h-10 rounded-lg object-cover border border-[#482814] bg-stone-900 shrink-0"
                  referrerpolicy="no-referrer">
                <div>
                  <div class="text-xs font-serif font-bold text-stone-200 line-clamp-1">{{ prod.name }}</div>
                  <div class="text-[10px] font-mono font-bold text-amber-400">R$ {{ prod.price.toFixed(2) }}</div>
                </div>
              </div>

              <div [class]="isProductHighlighted(prod.id) ? 'text-amber-400' : 'text-stone-600'">
                <mat-icon class="text-lg">{{ isProductHighlighted(prod.id) ? 'star' : 'star_border' }}</mat-icon>
              </div>

            </button>
          }
        </div>
      </div>

    </div>
  `
})
export class StoreHighlightsTabComponent {
  form = input.required<HighlightsFormState>();
  storeProducts = input.required<ProductItem[]>();
  formChange = output<HighlightsFormState>();

  readonly tagSuggestions = [
    'Smash Burgers',
    'Artesanal',
    'Chopp Gelado',
    'Entrega Rápida',
    'Vegano',
    'Sem Glúten',
    'Cortes Nobres',
    'Receita da Vovó'
  ];

  isProductHighlighted(id: string): boolean {
    return this.form().highlightedProductIds.includes(id);
  }

  toggleProductHighlight(id: string) {
    const current = this.form().highlightedProductIds;
    const next = current.includes(id)
      ? current.filter(x => x !== id)
      : [...current, id];
    
    this.formChange.emit({
      ...this.form(),
      highlightedProductIds: next
    });
  }

  addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || this.form().specialties.includes(clean)) return;
    this.formChange.emit({
      ...this.form(),
      specialties: [...this.form().specialties, clean]
    });
  }

  removeTag(tag: string) {
    this.formChange.emit({
      ...this.form(),
      specialties: this.form().specialties.filter(t => t !== tag)
    });
  }
}
