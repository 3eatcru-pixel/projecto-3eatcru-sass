import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CompanyTenant, ProductItem } from '../../../models/ecosystem.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-store-live-preview',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-col h-full bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 overflow-hidden shadow-2xl">
      
      <!-- PREVIEW TOOLBAR -->
      <div class="flex items-center justify-between pb-3 border-b border-[#3d200f] mb-3 shrink-0">
        <div class="flex items-center gap-2">
          <mat-icon class="text-amber-400 text-sm">visibility</mat-icon>
          <span class="text-xs font-serif font-black text-amber-200">Prévia da Loja Pública</span>
          <span class="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono px-1.5 py-0.5 rounded font-bold">
            TEMPO REAL
          </span>
        </div>

        <div class="flex items-center gap-1 bg-[#0e0805] p-0.5 rounded-lg border border-[#3d200f] text-[10px]">
          <button
            type="button"
            (click)="previewMode.set('mobile')"
            [class]="previewMode() === 'mobile' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400'"
            class="px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all">
            <mat-icon class="text-[12px]">smartphone</mat-icon> Mobile
          </button>
          <button
            type="button"
            (click)="previewMode.set('desktop')"
            [class]="previewMode() === 'desktop' ? 'bg-amber-600 text-stone-950 font-bold' : 'text-stone-400'"
            class="px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-all">
            <mat-icon class="text-[12px]">laptop</mat-icon> Tablet
          </button>
        </div>
      </div>

      <!-- DEVICE FRAME CONTAINER -->
      <div class="flex-1 flex items-center justify-center overflow-hidden p-1">
        <div
          [class]="previewMode() === 'mobile' ? 'w-[320px] max-w-full h-full rounded-3xl border-4 border-[#3d200f]' : 'w-full h-full rounded-2xl border-2 border-[#3d200f]'"
          class="bg-[#0e0805] text-stone-200 shadow-2xl flex flex-col overflow-hidden relative">
          
          <!-- MOBILE STATUS BAR (IF MOBILE) -->
          @if (previewMode() === 'mobile') {
            <div class="bg-black/90 px-4 py-1 flex items-center justify-between text-[10px] text-stone-400 font-mono shrink-0">
              <span>12:00</span>
              <div class="w-12 h-3 bg-stone-800 rounded-full mx-auto"></div>
              <div class="flex items-center gap-1">
                <mat-icon class="text-[10px]">wifi</mat-icon>
                <mat-icon class="text-[10px]">battery_full</mat-icon>
              </div>
            </div>
          }

          <!-- SCROLLABLE STORE CONTENT -->
          <div class="flex-1 overflow-y-auto space-y-3 pb-6">
            
            <!-- ANNOUNCEMENT BANNER IF ACTIVE -->
            @if (tenant().showAnnouncement && tenant().announcementText) {
              <div
                [class]="tenant().announcementType === 'alert' ? 'bg-rose-950 text-rose-200 border-rose-800' : tenant().announcementType === 'news' ? 'bg-emerald-950 text-emerald-200 border-emerald-800' : 'bg-gradient-to-r from-amber-950 to-orange-950 text-amber-200 border-amber-800'"
                class="px-3 py-1.5 border-b text-[10px] font-bold text-center flex items-center justify-center gap-1">
                <span>{{ tenant().announcementText }}</span>
              </div>
            }

            <!-- HERO COVER & LOGO -->
            <div class="relative">
              <div class="h-24 w-full bg-stone-900 overflow-hidden relative">
                <img
                  [src]="tenant().coverImage"
                  alt="Cover"
                  class="w-full h-full object-cover"
                  referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-gradient-to-t from-[#0e0805] via-transparent to-transparent opacity-80"></div>
              </div>

              <!-- LOGO AVATAR OVERLAY -->
              <div class="absolute -bottom-5 left-4 flex items-end gap-2.5">
                <img
                  [src]="tenant().logo"
                  alt="Logo"
                  class="w-12 h-12 rounded-xl object-cover border-2 border-amber-500 shadow-xl bg-stone-900"
                  referrerpolicy="no-referrer">
                
                <span
                  [class]="tenant().isOpen ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-rose-950 text-rose-400 border-rose-700'"
                  class="text-[9px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 mb-1 shadow">
                  <span class="w-1.5 h-1.5 rounded-full" [class]="tenant().isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
                  {{ tenant().isOpen ? 'Aberto' : 'Fechado' }}
                </span>
              </div>
            </div>

            <!-- STORE TITLE & DETAILS -->
            <div class="px-4 pt-5 space-y-1">
              <div class="flex items-center justify-between">
                <h3 class="font-serif font-black text-sm text-white line-clamp-1">{{ tenant().name }}</h3>
                <span class="text-[9px] font-mono text-amber-400 border border-amber-800/60 bg-amber-950/40 px-1.5 py-0.5 rounded">
                  ★ {{ tenant().rating || 4.9 }}
                </span>
              </div>
              <p class="text-[10px] text-stone-300 line-clamp-1">{{ tenant().tagline || 'Gastronomia & Delivery' }}</p>

              <!-- Delivery info pills -->
              <div class="flex flex-wrap items-center gap-2 pt-1 text-[9px] text-stone-400 font-mono">
                <span class="flex items-center gap-0.5">
                  <mat-icon class="text-[10px] text-amber-500">schedule</mat-icon>
                  {{ tenant().estimatedDeliveryMinutes || '30-45 min' }}
                </span>
                <span>•</span>
                <span class="flex items-center gap-0.5">
                  <mat-icon class="text-[10px] text-amber-500">delivery_dining</mat-icon>
                  R$ {{ (tenant().deliveryFee || 5).toFixed(2) }}
                </span>
              </div>

              <!-- Specialties -->
              @if (tenant().specialties && tenant().specialties!.length > 0) {
                <div class="flex flex-wrap gap-1 pt-1.5">
                  @for (spec of tenant().specialties; track spec) {
                    <span class="text-[8px] bg-[#2b160b] text-amber-300 px-1.5 py-0.5 rounded border border-[#482814]">
                      {{ spec }}
                    </span>
                  }
                </div>
              }

              <!-- Direct WhatsApp / Social Action -->
              @if (tenant().whatsappNumber) {
                <div class="pt-2">
                  <div class="bg-emerald-950/80 border border-emerald-700/60 rounded-xl p-1.5 text-center flex items-center justify-center gap-1.5 text-emerald-300 text-[10px] font-bold">
                    <mat-icon class="text-xs">chat</mat-icon> Pedir pelo WhatsApp: {{ tenant().whatsappNumber }}
                  </div>
                </div>
              }
            </div>

            <!-- SAMPLE STORE CATALOG -->
            <div class="px-4 pt-2 space-y-2">
              <div class="text-[11px] font-serif font-bold text-amber-400 flex items-center justify-between pb-1 border-b border-[#3d200f]">
                <span>Cardápio &amp; Produtos</span>
                <span class="text-[9px] text-stone-500 font-mono">{{ products().length }} itens</span>
              </div>

              <div class="space-y-1.5">
                @for (prod of products().slice(0, 4); track prod.id) {
                  <div class="bg-[#faf7f0] text-stone-900 p-2 rounded-xl border border-[#ded4c2] flex items-center justify-between gap-2 shadow-sm">
                    <div class="flex items-center gap-2">
                      <img [src]="prod.image" [alt]="prod.name" class="w-8 h-8 rounded-lg object-cover" referrerpolicy="no-referrer">
                      <div>
                        <div class="text-[10px] font-serif font-bold leading-tight">{{ prod.name }}</div>
                        <div class="text-[9px] font-mono font-bold text-amber-800">R$ {{ prod.price.toFixed(2) }}</div>
                      </div>
                    </div>
                    <span class="bg-stone-950 text-amber-400 text-[8px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                      + Pedir
                    </span>
                  </div>
                }
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  `
})
export class StoreLivePreviewComponent {
  tenant = input.required<CompanyTenant>();
  products = input.required<ProductItem[]>();

  readonly previewMode = signal<'mobile' | 'desktop'>('mobile');
}
