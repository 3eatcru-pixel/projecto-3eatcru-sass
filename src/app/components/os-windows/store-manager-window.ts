import { ChangeDetectionStrategy, Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { CompanyTenant } from '../../models/ecosystem.model';

import { StoreBrandingTabComponent, BrandingFormState } from './store-manager/store-branding-tab';
import { StoreInfoTabComponent, InfoFormState } from './store-manager/store-info-tab';
import { StoreCommunicationTabComponent, CommunicationFormState } from './store-manager/store-communication-tab';
import { StoreHighlightsTabComponent, HighlightsFormState } from './store-manager/store-highlights-tab';
import { StoreLivePreviewComponent } from './store-manager/store-live-preview';

export type StoreManagerTab = 'branding' | 'info' | 'communication' | 'highlights';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-store-manager-window',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    StoreBrandingTabComponent,
    StoreInfoTabComponent,
    StoreCommunicationTabComponent,
    StoreHighlightsTabComponent,
    StoreLivePreviewComponent
  ],
  template: `
    <div class="h-full flex flex-col space-y-4 text-stone-200">
      
      <!-- TOP ACTION BAR -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black shadow-md">
            <mat-icon>storefront</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-serif font-black text-base text-white">Gerenciador da Vitrine Pública</h2>
              <span class="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-bold">
                {{ currentTenant().name }}
              </span>
            </div>
            <p class="text-[11px] text-stone-400">Personalize banner, logotipo, cores, anúncios e cardápio público em tempo real.</p>
          </div>
        </div>

        <!-- ACTIONS: PREVIEW EXTERNAL & SAVE -->
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="copyStoreLink()"
            class="bg-[#2b160b] hover:bg-[#3d200f] text-amber-300 px-3 py-2 rounded-xl border border-[#482814] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <mat-icon class="text-sm">share</mat-icon>
            <span>Copiar Link</span>
          </button>

          <button
            type="button"
            (click)="openLiveStore()"
            class="bg-[#2b160b] hover:bg-[#3d200f] text-emerald-400 px-3 py-2 rounded-xl border border-[#482814] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer">
            <mat-icon class="text-sm">open_in_new</mat-icon>
            <span>Visitar Loja</span>
          </button>

          <button
            type="button"
            (click)="saveChanges()"
            class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg border border-amber-400/50 cursor-pointer">
            <mat-icon class="text-sm">save</mat-icon>
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      <!-- TABS NAVIGATION -->
      <div class="flex items-center gap-2 border-b border-[#3d200f] pb-2 text-xs font-bold shrink-0">
        <button
          type="button"
          (click)="activeTab.set('branding')"
          [class]="activeTab() === 'branding' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white bg-[#170b04] border border-[#3d200f]'"
          class="px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
          <mat-icon class="text-sm">palette</mat-icon>
          <span>Aparência &amp; Banner</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('info')"
          [class]="activeTab() === 'info' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white bg-[#170b04] border border-[#3d200f]'"
          class="px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
          <mat-icon class="text-sm">schedule</mat-icon>
          <span>Horários &amp; Entrega</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('communication')"
          [class]="activeTab() === 'communication' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white bg-[#170b04] border border-[#3d200f]'"
          class="px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
          <mat-icon class="text-sm">campaign</mat-icon>
          <span>Avisos &amp; Contato</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('highlights')"
          [class]="activeTab() === 'highlights' ? 'bg-amber-600 text-stone-950' : 'text-stone-400 hover:text-white bg-[#170b04] border border-[#3d200f]'"
          class="px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer">
          <mat-icon class="text-sm">star</mat-icon>
          <span>Cardápio &amp; Destaques</span>
        </button>
      </div>

      <!-- MAIN SPLIT WORKSPACE: EDITOR ON LEFT, LIVE PREVIEW ON RIGHT -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        
        <!-- LEFT: EDITING FORM (SCROLLABLE) -->
        <div class="lg:col-span-7 overflow-y-auto pr-1">
          @switch (activeTab()) {
            @case ('branding') {
              <app-store-branding-tab
                [form]="brandingForm()"
                (formChange)="onBrandingChange($event)" />
            }
            @case ('info') {
              <app-store-info-tab
                [form]="infoForm()"
                (formChange)="onInfoChange($event)" />
            }
            @case ('communication') {
              <app-store-communication-tab
                [form]="communicationForm()"
                (formChange)="onCommunicationChange($event)" />
            }
            @case ('highlights') {
              <app-store-highlights-tab
                [form]="highlightsForm()"
                [storeProducts]="tenantProducts()"
                (formChange)="onHighlightsChange($event)" />
            }
          }
        </div>

        <!-- RIGHT: INTERACTIVE LIVE PREVIEW -->
        <div class="lg:col-span-5 h-full overflow-hidden">
          <app-store-live-preview
            [tenant]="mergedTenantPreview()"
            [products]="tenantProducts()" />
        </div>

      </div>

    </div>
  `
})
export class StoreManagerWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly activeTab = signal<StoreManagerTab>('branding');

  readonly currentTenant = computed(() => {
    const id = this.ecosystem.currentTenantId();
    return this.ecosystem.tenants().find(t => t.id === id) || this.ecosystem.tenants()[0];
  });

  readonly tenantProducts = computed(() => {
    const id = this.currentTenant().id;
    return this.ecosystem.products().filter(p => p.tenantId === id);
  });

  // Local editable form states
  readonly brandingForm = signal<BrandingFormState>({
    name: '',
    tagline: '',
    logo: '',
    coverImage: '',
    badgeCategory: '',
    themeColor: 'amber'
  });

  readonly infoForm = signal<InfoFormState>({
    isOpen: true,
    openingHours: '',
    deliveryRadiusKm: 8,
    deliveryFee: 5.0,
    minOrderValue: 25.0,
    deliveryFleetType: 'platform',
    estimatedDeliveryMinutes: '30-45 min',
    serviceFeePercent: 10,
    supportsDelivery: true,
    supportsTakeout: true,
    supportsReservation: true,
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zipCode: ''
    }
  });

  readonly communicationForm = signal<CommunicationFormState>({
    showAnnouncement: false,
    announcementText: '',
    announcementType: 'promo',
    whatsappNumber: '',
    instagramHandle: '',
    contactEmail: '',
    phone: '',
    aboutText: ''
  });

  readonly highlightsForm = signal<HighlightsFormState>({
    specialties: [],
    highlightedProductIds: []
  });

  constructor() {
    // Sync forms when tenant changes
    effect(() => {
      const t = this.currentTenant();
      this.brandingForm.set({
        name: t.name,
        tagline: t.tagline || '',
        logo: t.logo || '',
        coverImage: t.coverImage || '',
        badgeCategory: t.badgeCategory || '',
        themeColor: t.themeColor || 'amber'
      });

      this.infoForm.set({
        isOpen: t.isOpen ?? true,
        openingHours: t.openingHours || '',
        deliveryRadiusKm: t.deliveryRadiusKm || 8,
        deliveryFee: t.deliveryFee ?? 5.0,
        minOrderValue: t.minOrderValue ?? 25.0,
        deliveryFleetType: t.deliveryFleetType || 'platform',
        estimatedDeliveryMinutes: t.estimatedDeliveryMinutes || '30-45 min',
        serviceFeePercent: t.serviceFeePercent || 10,
        supportsDelivery: t.supportsDelivery ?? true,
        supportsTakeout: t.supportsTakeout ?? true,
        supportsReservation: t.supportsReservation ?? false,
        address: { ...t.address }
      });

      this.communicationForm.set({
        showAnnouncement: t.showAnnouncement ?? false,
        announcementText: t.announcementText || '',
        announcementType: t.announcementType || 'promo',
        whatsappNumber: t.whatsappNumber || '',
        instagramHandle: t.instagramHandle || '',
        contactEmail: t.contactEmail || '',
        phone: t.phone || '',
        aboutText: t.aboutText || ''
      });

      this.highlightsForm.set({
        specialties: t.specialties ? [...t.specialties] : [],
        highlightedProductIds: t.highlightedProductIds ? [...t.highlightedProductIds] : []
      });
    });
  }

  // Merged preview model combining current tenant + draft edits
  readonly mergedTenantPreview = computed<CompanyTenant>(() => {
    const base = this.currentTenant();
    const b = this.brandingForm();
    const inf = this.infoForm();
    const c = this.communicationForm();
    const h = this.highlightsForm();

    return {
      ...base,
      name: b.name || base.name,
      tagline: b.tagline,
      logo: b.logo || base.logo,
      coverImage: b.coverImage || base.coverImage,
      badgeCategory: b.badgeCategory,
      themeColor: b.themeColor,
      isOpen: inf.isOpen,
      openingHours: inf.openingHours,
      deliveryRadiusKm: inf.deliveryRadiusKm,
      deliveryFee: inf.deliveryFee,
      minOrderValue: inf.minOrderValue,
      deliveryFleetType: inf.deliveryFleetType,
      estimatedDeliveryMinutes: inf.estimatedDeliveryMinutes,
      serviceFeePercent: inf.serviceFeePercent,
      supportsDelivery: inf.supportsDelivery,
      supportsTakeout: inf.supportsTakeout,
      supportsReservation: inf.supportsReservation,
      address: { ...inf.address },
      showAnnouncement: c.showAnnouncement,
      announcementText: c.announcementText,
      announcementType: c.announcementType,
      whatsappNumber: c.whatsappNumber,
      instagramHandle: c.instagramHandle,
      contactEmail: c.contactEmail,
      phone: c.phone,
      aboutText: c.aboutText,
      specialties: h.specialties,
      highlightedProductIds: h.highlightedProductIds
    };
  });

  onBrandingChange(state: BrandingFormState) {
    this.brandingForm.set(state);
  }

  onInfoChange(state: InfoFormState) {
    this.infoForm.set(state);
  }

  onCommunicationChange(state: CommunicationFormState) {
    this.communicationForm.set(state);
  }

  onHighlightsChange(state: HighlightsFormState) {
    this.highlightsForm.set(state);
  }

  saveChanges() {
    const tenantId = this.currentTenant().id;
    const b = this.brandingForm();
    const inf = this.infoForm();
    const c = this.communicationForm();
    const h = this.highlightsForm();

    this.ecosystem.updateTenant(tenantId, {
      name: b.name,
      tagline: b.tagline,
      logo: b.logo,
      coverImage: b.coverImage,
      badgeCategory: b.badgeCategory,
      themeColor: b.themeColor,
      isOpen: inf.isOpen,
      openingHours: inf.openingHours,
      deliveryRadiusKm: inf.deliveryRadiusKm,
      deliveryFee: inf.deliveryFee,
      minOrderValue: inf.minOrderValue,
      deliveryFleetType: inf.deliveryFleetType,
      estimatedDeliveryMinutes: inf.estimatedDeliveryMinutes,
      serviceFeePercent: inf.serviceFeePercent,
      supportsDelivery: inf.supportsDelivery,
      supportsTakeout: inf.supportsTakeout,
      supportsReservation: inf.supportsReservation,
      address: inf.address,
      showAnnouncement: c.showAnnouncement,
      announcementText: c.announcementText,
      announcementType: c.announcementType,
      whatsappNumber: c.whatsappNumber,
      instagramHandle: c.instagramHandle,
      contactEmail: c.contactEmail,
      phone: c.phone,
      aboutText: c.aboutText,
      specialties: h.specialties,
      highlightedProductIds: h.highlightedProductIds
    });
  }

  copyStoreLink() {
    const link = `https://3eatcru.com/p/${this.currentTenant().id}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.ecosystem.notify(`Link copiado: ${link}`, 'info');
  }

  openLiveStore() {
    this.ecosystem.openStorefront(this.currentTenant().id);
  }
}
