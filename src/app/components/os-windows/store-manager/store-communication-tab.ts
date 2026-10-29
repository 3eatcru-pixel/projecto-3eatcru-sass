import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface CommunicationFormState {
  showAnnouncement: boolean;
  announcementText: string;
  announcementType: 'promo' | 'alert' | 'news';
  whatsappNumber: string;
  instagramHandle: string;
  contactEmail: string;
  phone: string;
  aboutText: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-store-communication-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6 text-stone-200">
      
      <!-- TOP ANNOUNCEMENT BANNER -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
          <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm">
            <mat-icon class="text-base">campaign</mat-icon>
            <span>Barra de Aviso / Banner de Anúncio no Topo</span>
          </div>
          
          <button
            type="button"
            (click)="updateField('showAnnouncement', !form().showAnnouncement)"
            [class]="form().showAnnouncement ? 'bg-amber-500 text-stone-950 font-black' : 'bg-[#2b160b] text-stone-400 border border-[#482814]'"
            class="px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer">
            <mat-icon class="text-xs">{{ form().showAnnouncement ? 'visibility' : 'visibility_off' }}</mat-icon>
            <span>{{ form().showAnnouncement ? 'Visível na Loja' : 'Oculto' }}</span>
          </button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="commAnnouncementText" class="block text-stone-400 font-semibold mb-1">Texto do Anúncio Promocional</label>
            <input
              id="commAnnouncementText"
              type="text"
              [value]="form().announcementText"
              (input)="updateField('announcementText', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="Ex: 🔥 Especial de Quarta: Combo Burger Artisan + Chopp com 20% OFF!">
          </div>

          <div>
            <span class="block text-stone-400 font-semibold mb-1">Estilo do Aviso</span>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                (click)="updateField('announcementType', 'promo')"
                [class]="form().announcementType === 'promo' ? 'bg-amber-950 border-amber-500 text-amber-200' : 'bg-[#0e0805] border-[#3d200f] text-stone-400'"
                class="p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span>🔥 Promoção</span>
              </button>
              <button
                type="button"
                (click)="updateField('announcementType', 'alert')"
                [class]="form().announcementType === 'alert' ? 'bg-rose-950 border-rose-500 text-rose-200' : 'bg-[#0e0805] border-[#3d200f] text-stone-400'"
                class="p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span>⚠️ Aviso Importante</span>
              </button>
              <button
                type="button"
                (click)="updateField('announcementType', 'news')"
                [class]="form().announcementType === 'news' ? 'bg-emerald-950 border-emerald-500 text-emerald-200' : 'bg-[#0e0805] border-[#3d200f] text-stone-400'"
                class="p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <span>✨ Novidade</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CHANNELS & SOCIAL NETWORKS -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">share</mat-icon>
          <span>Canais de Atendimento e Redes Sociais</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label for="commWhatsapp" class="block text-stone-400 font-semibold mb-1">WhatsApp de Atendimento</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-emerald-400 pointer-events-none">
                <mat-icon class="text-sm">chat</mat-icon>
              </span>
              <input
                id="commWhatsapp"
                type="text"
                [value]="form().whatsappNumber"
                (input)="updateField('whatsappNumber', $any($event.target).value)"
                class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl pl-9 pr-3 py-2 text-stone-200 focus:outline-none focus:border-emerald-500"
                placeholder="+55 11 99999-8888">
            </div>
          </div>

          <div>
            <label for="commInstagram" class="block text-stone-400 font-semibold mb-1">Instagram (@handle)</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-rose-400 pointer-events-none">
                <mat-icon class="text-sm">camera_alt</mat-icon>
              </span>
              <input
                id="commInstagram"
                type="text"
                [value]="form().instagramHandle"
                (input)="updateField('instagramHandle', $any($event.target).value)"
                class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl pl-9 pr-3 py-2 text-stone-200 focus:outline-none focus:border-rose-500"
                placeholder="@sualojaoficial">
            </div>
          </div>

          <div>
            <label for="commPhone" class="block text-stone-400 font-semibold mb-1">Telefone Fixo / Balcão</label>
            <input
              id="commPhone"
              type="text"
              [value]="form().phone"
              (input)="updateField('phone', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="+55 11 3254-8899">
          </div>

          <div>
            <label for="commEmail" class="block text-stone-400 font-semibold mb-1">E-mail de Contato Público</label>
            <input
              id="commEmail"
              type="email"
              [value]="form().contactEmail"
              (input)="updateField('contactEmail', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="contato@sualoja.com.br">
          </div>
        </div>
      </div>

      <!-- ABOUT THE STORE (BIO / STORY) -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">menu_book</mat-icon>
          <span>História e Descrição da Casa (Sobre Nós)</span>
        </div>

        <div class="text-xs">
          <textarea
            rows="3"
            [value]="form().aboutText"
            (input)="updateField('aboutText', $any($event.target).value)"
            class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl p-3 text-stone-200 focus:outline-none focus:border-amber-500 resize-none"
            placeholder="Conte um pouco sobre as origens, ingredientes nobres ou filosofia da casa..."></textarea>
        </div>
      </div>

    </div>
  `
})
export class StoreCommunicationTabComponent {
  form = input.required<CommunicationFormState>();
  formChange = output<CommunicationFormState>();

  updateField<K extends keyof CommunicationFormState>(field: K, value: CommunicationFormState[K]) {
    this.formChange.emit({
      ...this.form(),
      [field]: value
    });
  }
}
