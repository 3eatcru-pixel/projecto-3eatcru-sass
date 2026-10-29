import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface BrandingFormState {
  name: string;
  tagline: string;
  logo: string;
  coverImage: string;
  badgeCategory: string;
  themeColor: 'amber' | 'emerald' | 'indigo' | 'rose' | 'orange' | 'cyan';
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-store-branding-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6 text-stone-200">
      
      <!-- STORE NAME & TAGLINE -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">badge</mat-icon>
          <span>Identidade Principal</span>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="brandStoreName" class="block text-stone-400 font-semibold mb-1">Nome de Exibição da Loja</label>
            <input
              id="brandStoreName"
              type="text"
              [value]="form().name"
              (input)="updateField('name', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 font-serif font-bold text-sm focus:outline-none focus:border-amber-500"
              placeholder="Ex: Burger & Co Gourmet">
          </div>

          <div>
            <label for="brandTagline" class="block text-stone-400 font-semibold mb-1">Slogan Comercial / Tagline</label>
            <input
              id="brandTagline"
              type="text"
              [value]="form().tagline"
              (input)="updateField('tagline', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="Ex: Alimentos & Bebidas • Hamburgueria Artesanal & Chopps">
          </div>

          <div>
            <label for="brandBadgeCategory" class="block text-stone-400 font-semibold mb-1">Categoria Comercial</label>
            <input
              id="brandBadgeCategory"
              type="text"
              [value]="form().badgeCategory"
              (input)="updateField('badgeCategory', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="Ex: HAMBURGUERIA ARTESANAL">
          </div>
        </div>
      </div>

      <!-- LOGO / AVATAR -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm">
            <mat-icon class="text-base">image</mat-icon>
            <span>Logotipo / Ícone da Loja</span>
          </div>
          <span class="text-[10px] text-stone-400 font-mono">1:1 Quadrado Recomendado</span>
        </div>

        <div class="flex items-start gap-4">
          <img
            [src]="form().logo"
            alt="Logo Preview"
            class="w-16 h-16 rounded-2xl object-cover border-2 border-amber-600/70 shadow-lg shrink-0 bg-[#0e0805]"
            referrerpolicy="no-referrer">

          <div class="flex-1 space-y-2 text-xs">
            <label for="brandLogoUrl" class="block text-stone-400 font-semibold">URL da Imagem do Logo</label>
            <input
              id="brandLogoUrl"
              type="text"
              [value]="form().logo"
              (input)="updateField('logo', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              placeholder="https://exemplo.com/logo.jpg">
            
            <!-- Quick Presets -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[10px] text-stone-500 font-mono">Sugestões:</span>
              @for (preset of logoPresets; track preset.label) {
                <button
                  type="button"
                  (click)="updateField('logo', preset.url)"
                  class="text-[10px] bg-[#2b160b] hover:bg-[#3d200f] text-amber-300 px-2 py-0.5 rounded-lg border border-[#482814] cursor-pointer">
                  {{ preset.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- BANNER DE CAPA -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm">
            <mat-icon class="text-base">panorama</mat-icon>
            <span>Banner de Capa (Hero da Loja)</span>
          </div>
          <span class="text-[10px] text-stone-400 font-mono">16:9 ou Panorâmico</span>
        </div>

        <div class="space-y-3">
          <div class="h-28 w-full rounded-xl overflow-hidden border border-[#4d2813] bg-[#0e0805] relative shadow-inner">
            <img
              [src]="form().coverImage"
              alt="Banner Preview"
              class="w-full h-full object-cover"
              referrerpolicy="no-referrer">
          </div>

          <div class="space-y-2 text-xs">
            <label for="brandCoverUrl" class="block text-stone-400 font-semibold">URL da Imagem de Capa</label>
            <input
              id="brandCoverUrl"
              type="text"
              [value]="form().coverImage"
              (input)="updateField('coverImage', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-300 font-mono text-[11px] focus:outline-none focus:border-amber-500"
              placeholder="https://exemplo.com/banner.jpg">
            
            <!-- Banner Presets -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1">
              <span class="text-[10px] text-stone-500 font-mono">Presets em Alta:</span>
              @for (preset of bannerPresets; track preset.label) {
                <button
                  type="button"
                  (click)="updateField('coverImage', preset.url)"
                  class="text-[10px] bg-[#2b160b] hover:bg-[#3d200f] text-amber-300 px-2 py-0.5 rounded-lg border border-[#482814] cursor-pointer">
                  {{ preset.label }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- THEME COLOR PALETTE -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">palette</mat-icon>
          <span>Cor e Estilo de Destaque</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
          @for (color of themeOptions; track color.id) {
            <button
              type="button"
              (click)="updateField('themeColor', color.id)"
              [class]="form().themeColor === color.id ? 'border-amber-400 ring-2 ring-amber-400/40 bg-[#2b160b]' : 'border-[#3d200f] bg-[#0e0805] hover:bg-[#1a0f07]'"
              class="flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all cursor-pointer">
              <span [class]="color.bgClass" class="w-4 h-4 rounded-full shadow shrink-0"></span>
              <span class="font-bold text-stone-300">{{ color.label }}</span>
            </button>
          }
        </div>
      </div>

    </div>
  `
})
export class StoreBrandingTabComponent {
  form = input.required<BrandingFormState>();
  formChange = output<BrandingFormState>();

  readonly logoPresets = [
    { label: 'Burger Gourmet', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80' },
    { label: 'Padaria Artesanal', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80' },
    { label: 'Barbearia & Spa', url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80' },
    { label: 'Farmácia & Cuidados', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80' },
    { label: 'Café Especial', url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=200&q=80' }
  ];

  readonly bannerPresets = [
    { label: 'Bistrô & Hamburgueria', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
    { label: 'Pães & Empório Rústico', url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80' },
    { label: 'Bar & Chopperia Artesanal', url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80' },
    { label: 'Salão & Estética Premium', url: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80' },
    { label: 'Tech & Gadgets Modernos', url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80' }
  ];

  readonly themeOptions = [
    { id: 'amber' as const, label: 'Âmbar / Pergaminho', bgClass: 'bg-amber-500' },
    { id: 'emerald' as const, label: 'Esmeralda / Frescor', bgClass: 'bg-emerald-500' },
    { id: 'indigo' as const, label: 'Índigo / Sofisticado', bgClass: 'bg-indigo-500' },
    { id: 'rose' as const, label: 'Rubi / Vibrante', bgClass: 'bg-rose-500' },
    { id: 'orange' as const, label: 'Laranja / Brasa', bgClass: 'bg-orange-500' },
    { id: 'cyan' as const, label: 'Ciano / Tech', bgClass: 'bg-cyan-500' }
  ];

  updateField<K extends keyof BrandingFormState>(field: K, value: BrandingFormState[K]) {
    this.formChange.emit({
      ...this.form(),
      [field]: value
    });
  }
}
