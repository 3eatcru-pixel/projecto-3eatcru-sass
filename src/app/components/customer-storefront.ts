import { ChangeDetectionStrategy, Component, inject, signal, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EcosystemService } from '../services/ecosystem.service';
import { ProductItem, CartItem, OrderTransaction } from '../models/ecosystem.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-customer-storefront',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-[#0e0805] text-stone-200 p-3 sm:p-8 font-sans selection:bg-amber-600 selection:text-white relative overflow-x-hidden">
      
      <!-- BACKGROUND CARBON TEXTURE -->
      <div class="absolute inset-0 pointer-events-none opacity-20 bg-carbon-pattern z-0"></div>

      <div class="max-w-7xl mx-auto space-y-6 relative z-10">
        
        <!-- TOP NAV: BACK TO REGIONAL & STORE SELECTOR -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="onBackClick()"
              class="bg-[#2b160b] hover:bg-[#3d200f] text-amber-300 font-bold px-3.5 py-2 rounded-xl border border-[#482814] flex items-center gap-1.5 transition-all shadow cursor-pointer">
              <mat-icon class="text-sm">arrow_back</mat-icon>
              <span>Voltar ao Marketplace Regional (Praça de Lojas)</span>
            </button>

            <!-- Store Selector Pills -->
            <div class="hidden md:flex items-center gap-1.5 pl-2 border-l border-[#3d200f]">
              <span class="text-stone-400 font-mono text-[10px] font-bold uppercase">Ir Para:</span>
              @for (tenant of ecosystem.tenants(); track tenant.id) {
                <button
                  type="button"
                  (click)="ecosystem.currentTenantId.set(tenant.id)"
                  [class]="ecosystem.currentTenantId() === tenant.id ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold shadow' : 'bg-[#2b160b] text-stone-300 hover:text-white border border-[#482814]'"
                  class="px-2.5 py-1 rounded-lg transition-all text-xs font-bold shrink-0 cursor-pointer">
                  <span>{{ tenant.name }}</span>
                </button>
              }
            </div>
          </div>

          <div class="flex items-center gap-3 text-xs font-mono font-bold">
            @if (isStoreOperator()) {
              <button
                type="button"
                (click)="openStoreManagerInOs()"
                class="bg-amber-950/90 hover:bg-amber-900 text-amber-300 border border-amber-600/70 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shadow">
                <mat-icon class="text-xs">brush</mat-icon>
                <span>Você é o Lojista • Editar no OS</span>
              </button>
            } @else if (isHqAdmin()) {
              <button
                type="button"
                (click)="returnToHq()"
                class="bg-rose-950/90 hover:bg-rose-900 text-rose-200 border border-rose-700 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer shadow">
                <mat-icon class="text-xs">security</mat-icon>
                <span>Auditoria HQ • Voltar ao Gabinete</span>
              </button>
            }

            <span class="flex items-center gap-1 text-amber-500">
              <mat-icon class="text-xs">near_me</mat-icon>
              <span>{{ ecosystem.calculateDistanceToUser(activeStore().lat, activeStore().lng) }} km do seu GPS</span>
            </span>
          </div>

        </div>

        <!-- TOP ANNOUNCEMENT BANNER IF ACTIVE -->
        @if (activeStore().showAnnouncement && activeStore().announcementText) {
          <div
            [class]="activeStore().announcementType === 'alert' ? 'bg-rose-950/90 text-rose-200 border-rose-700' : activeStore().announcementType === 'news' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700' : 'bg-gradient-to-r from-amber-950/90 via-orange-950/90 to-amber-950/90 text-amber-200 border-amber-600'"
            class="border-2 rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in">
            <div class="flex items-center gap-2">
              <mat-icon class="text-base text-amber-400">campaign</mat-icon>
              <span>{{ activeStore().announcementText }}</span>
            </div>
            <span class="text-[10px] font-mono bg-stone-950/60 px-2 py-0.5 rounded border border-amber-800/40 uppercase">
              Destaque
            </span>
          </div>
        }

        <!-- STORE HERO BANNER (LEATHER & PARCHMENT PARADIGM) -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          
          <!-- Subtle Cover Background Image -->
          @if (activeStore().coverImage) {
            <div class="absolute inset-0 opacity-15 pointer-events-none">
              <img [src]="activeStore().coverImage" alt="Cover background" class="w-full h-full object-cover" referrerpolicy="no-referrer">
            </div>
          }

          <div class="flex items-center gap-5 relative z-10">
            <img
              [src]="activeStore().logo || activeStore().coverImage"
              [alt]="activeStore().name"
              class="w-20 h-20 rounded-2xl object-cover border-2 border-amber-600/60 shadow-2xl shrink-0"
              referrerpolicy="no-referrer">
            
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="text-2xl sm:text-3xl font-serif font-black text-white">{{ activeStore().name }}</h1>
                <span
                  [class]="activeStore().isOpen ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40' : 'bg-rose-950 text-rose-400 border-rose-500/40'"
                  class="text-xs px-2.5 py-0.5 rounded-full border font-bold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full" [class]="activeStore().isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
                  {{ activeStore().isOpen ? 'Aberto para Pedidos' : 'Fechado no Momento' }}
                </span>
                <span class="border border-dashed border-amber-600 text-amber-400 bg-amber-950/40 text-[10px] font-mono px-2 py-0.5 rounded">
                  FICHA #{{ activeStore().fichaCode || '001' }}
                </span>
              </div>
              <p class="text-xs text-stone-300 font-serif mt-1">{{ activeStore().tagline || activeStore().legalName }}</p>
              
              <div class="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-amber-500 font-mono">
                <span class="flex items-center gap-1">
                  <mat-icon class="text-xs">location_on</mat-icon>
                  {{ activeStore().address.street }}, {{ activeStore().address.number }} - {{ activeStore().address.neighborhood }}
                </span>
                @if (activeStore().openingHours) {
                  <span class="text-stone-400 flex items-center gap-1">
                    <mat-icon class="text-xs text-amber-500">schedule</mat-icon>
                    {{ activeStore().openingHours }}
                  </span>
                }
              </div>

              <!-- Delivery Rules Pills (Min Order, Fee & Fleet) -->
              <div class="flex flex-wrap items-center gap-2 mt-2 text-[11px] font-mono font-bold">
                <span class="bg-[#2b160b] text-amber-300 border border-[#482814] px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <mat-icon class="text-xs text-amber-400">shopping_cart</mat-icon>
                  <span>Pedido Mínimo: R$ {{ (activeStore().minOrderValue || 0).toFixed(2) }}</span>
                </span>
                <span class="bg-[#2b160b] text-amber-300 border border-[#482814] px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <mat-icon class="text-xs text-amber-400">two_wheeler</mat-icon>
                  <span>Taxa Delivery: {{ (activeStore().deliveryFee ?? 0) === 0 ? 'Grátis' : 'R$ ' + (activeStore().deliveryFee || 0).toFixed(2) }}</span>
                </span>
                <span [class]="activeStore().deliveryFleetType === 'own' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60' : 'bg-purple-950/80 text-purple-300 border-purple-700/60'" class="border px-2.5 py-1 rounded-xl flex items-center gap-1">
                  <mat-icon class="text-xs">{{ activeStore().deliveryFleetType === 'own' ? 'store' : 'flash_on' }}</mat-icon>
                  <span>{{ activeStore().deliveryFleetType === 'own' ? 'Frota Própria da Loja' : 'Frota Parceira 3EAT' }}</span>
                </span>
              </div>

              <!-- Specialties Tags -->
              @if (activeStore().specialties && activeStore().specialties!.length > 0) {
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (spec of activeStore().specialties; track spec) {
                    <span class="text-[10px] bg-[#2b160b] text-amber-300 px-2 py-0.5 rounded-lg border border-[#482814] font-bold">
                      {{ spec }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Social Links & Bag Button -->
          <div class="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2.5 relative z-10 w-full sm:w-auto">
            
            <!-- Quick WhatsApp Contact Button if configured -->
            @if (activeStore().whatsappNumber) {
              <a
                [href]="'https://wa.me/' + activeStore().whatsappNumber?.replace(' ', '')"
                target="_blank"
                class="bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 font-bold py-2 px-3.5 rounded-xl border border-emerald-700/60 flex items-center justify-center gap-1.5 text-xs transition-colors shadow">
                <mat-icon class="text-sm">chat</mat-icon>
                <span>WhatsApp da Loja</span>
              </a>
            }

            <button
              type="button"
              (click)="showCartModal.set(true)"
              class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-xl border border-amber-400/50 flex items-center justify-center gap-2 text-xs transition-all active:scale-98 cursor-pointer">
              <mat-icon>shopping_bag</mat-icon>
              <span>Ver Minha Sacola</span>
              @if (customerCart().length > 0) {
                <span class="bg-stone-950 text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold shadow">
                  {{ totalCartCount() }}
                </span>
              }
            </button>
          </div>
        </div>

        <!-- CONFIRMED ORDER NOTICE -->
        @if (lastPlacedOrder(); as order) {
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-4 shadow-xl text-stone-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <strong class="text-stone-900 text-sm font-serif">Pedido {{ order.orderNumber }} Confirmado!</strong>
                  <span class="border border-dashed border-amber-700 text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                    Transmitido à Cozinha (KDS)
                  </span>
                </div>
                <p class="text-xs text-stone-600">Cliente: {{ order.customerName }} • Total: R$ {{ order.total.toFixed(2) }}</p>
              </div>
            </div>

            <button
              type="button"
              (click)="lastPlacedOrder.set(null)"
              class="text-xs bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 font-bold px-3 py-1.5 rounded-xl border border-[#d6c3aa]">
              Ocultar
            </button>
          </div>
        }

        <!-- CATALOG PRODUCTS GRID (PARCHMENT STYLE CARDS) -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-3xl p-6 shadow-2xl space-y-6">
          <div class="flex justify-between items-center border-b border-[#3d200f] pb-3">
            <h2 class="font-serif font-black text-xl text-white flex items-center gap-2">
              <mat-icon class="text-amber-500">restaurant_menu</mat-icon>
              <span>Cardápio &amp; Vitrine da Loja</span>
            </h2>

            <span class="text-xs font-mono font-bold text-amber-400 bg-[#2b160b] px-3 py-1 rounded-xl border border-[#482814]">
              {{ onlineProducts().length }} produtos disponíveis
            </span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            @for (prod of onlineProducts(); track prod.id) {
              <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl text-stone-900 flex flex-col justify-between group hover:border-amber-500 transition-all relative">
                
                <!-- Paperclip graphic -->
                <div class="absolute -top-3 left-6 w-5 h-8 rounded-full border-2 border-stone-400 bg-transparent opacity-80 pointer-events-none flex items-center justify-center">
                  <div class="w-2 h-5 rounded-full border-2 border-stone-400"></div>
                </div>

                <div>
                  <div class="relative h-44 rounded-xl overflow-hidden mb-3 bg-stone-900 border border-[#d6c7b0]">
                    <img [src]="prod.image" [alt]="prod.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerpolicy="no-referrer">
                    @if (activeStore().highlightedProductIds?.includes(prod.id)) {
                      <span class="absolute top-2 left-2 bg-amber-500 text-stone-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-lg flex items-center gap-1 border border-amber-300">
                        <mat-icon class="text-[11px]">star</mat-icon> Destaque da Casa
                      </span>
                    }
                    <span class="absolute top-2 right-2 bg-stone-950/90 text-amber-400 font-mono font-bold text-xs px-3 py-1 rounded-full border border-amber-500/40">
                      R$ {{ prod.price.toFixed(2) }}
                    </span>
                  </div>

                  <span class="border border-dashed border-amber-700 text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase">
                    {{ prod.category }}
                  </span>

                  <h3 class="font-serif font-black text-stone-900 text-base leading-tight mt-1">{{ prod.name }}</h3>
                  <p class="text-xs text-stone-600 line-clamp-2 mt-1">{{ prod.description }}</p>
                </div>

                <button
                  type="button"
                  (click)="addToCustomerCart(prod)"
                  class="mt-4 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2.5 px-4 rounded-xl shadow-md border border-amber-400/50 text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                  <mat-icon class="text-sm">add_shopping_cart</mat-icon>
                  <span>Adicionar à Sacola</span>
                </button>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- SACOLA MODAL (PARCHMENT STYLE) -->
      @if (showCartModal()) {
        <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-lg w-full p-6 text-stone-900 space-y-4 shadow-2xl animate-in zoom-in-95">
            
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <mat-icon class="text-amber-700">shopping_bag</mat-icon>
                <span>Sua Sacola de Pedidos</span>
              </h3>
              <button type="button" (click)="showCartModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold">✕</button>
            </div>

            <div class="max-h-56 overflow-y-auto space-y-2 pr-1 text-xs">
              @if (customerCart().length === 0) {
                <div class="text-center py-8 text-stone-500 space-y-2">
                  <mat-icon class="text-4xl text-stone-400">remove_shopping_cart</mat-icon>
                  <p>Sua sacola está vazia no momento.</p>
                </div>
              } @else {
                @for (item of customerCart(); track item.product.id) {
                  <div class="flex items-center justify-between bg-[#f5ebd9] border border-[#e6d8be] p-3 rounded-xl">
                    <div>
                      <div class="font-bold text-stone-900">{{ item.product.name }}</div>
                      <div class="text-[10px] font-mono font-bold text-amber-900">
                        R$ {{ (item.product.price * item.quantity).toFixed(2) }}
                      </div>
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="bg-[#ebdcc7] px-2.5 py-1 rounded font-bold text-stone-800">
                        {{ item.quantity }}x
                      </span>
                      <button type="button" (click)="removeFromCart(item.product.id)" class="text-rose-600 font-bold text-xs p-1">
                        <mat-icon class="text-sm">delete</mat-icon>
                      </button>
                    </div>
                  </div>
                }
              }
            </div>

            @if (customerCart().length > 0) {
              <div class="space-y-3 text-xs pt-2 border-t border-[#e8dfce]">
                
                <!-- CONSUMPTION MODALITY SELECTION (DELIVERY vs MESA QR vs BALCAO) -->
                <div>
                  <span class="block font-bold text-stone-800 mb-1.5 font-mono text-[10px] uppercase">Modalidade do Pedido:</span>
                  <div class="grid grid-cols-3 gap-1.5 p-1 bg-[#ebdcc7] rounded-xl border border-[#d6c3aa]">
                    <button
                      type="button"
                      (click)="orderType.set('delivery')"
                      [class]="orderType() === 'delivery' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-700 hover:text-stone-900 font-bold'"
                      class="py-1.5 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer">
                      <mat-icon class="text-xs">delivery_dining</mat-icon>
                      <span>Delivery</span>
                    </button>

                    <button
                      type="button"
                      (click)="orderType.set('dine-in')"
                      [class]="orderType() === 'dine-in' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-700 hover:text-stone-900 font-bold'"
                      class="py-1.5 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer">
                      <mat-icon class="text-xs">table_bar</mat-icon>
                      <span>Mesa (QR)</span>
                    </button>

                    <button
                      type="button"
                      (click)="orderType.set('takeout')"
                      [class]="orderType() === 'takeout' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-700 hover:text-stone-900 font-bold'"
                      class="py-1.5 px-1 rounded-lg text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer">
                      <mat-icon class="text-xs">shopping_bag</mat-icon>
                      <span>Balcão</span>
                    </button>
                  </div>
                </div>

                @if (orderType() === 'dine-in') {
                  <div class="bg-[#f0e3ce] border border-amber-600/40 p-2.5 rounded-xl space-y-1.5">
                    <label for="tableSelectInput" class="block font-bold text-amber-900 text-[10px] font-mono uppercase">
                      Número da sua Mesa no Salão:
                    </label>
                    <select
                      id="tableSelectInput"
                      [value]="selectedTableNumber()"
                      (change)="selectedTableNumber.set(+$any($event.target).value)"
                      class="w-full bg-white border border-[#d6c7b0] rounded-lg px-2.5 py-1.5 text-stone-900 font-bold outline-none cursor-pointer">
                      @for (tbl of ecosystem.tables(); track tbl.id) {
                        <option [value]="tbl.number">Mesa {{ tbl.number }} ({{ tbl.zone || 'Salão Principal' }})</option>
                      }
                    </select>
                    <p class="text-[9px] text-stone-600 leading-snug">
                      Os pratos serão sincronizados com a comanda da mesa, com o <strong>App do Garçom</strong> e enviados à cozinha (KDS).
                    </p>
                  </div>
                } @else if (orderType() === 'delivery') {
                  <div>
                    <label for="addressInput" class="block font-bold text-stone-800 mb-1">Endereço de Entrega</label>
                    <input id="addressInput" [value]="deliveryAddress()" (input)="deliveryAddress.set($any($event.target).value)" type="text" placeholder="Rua, número e complemento" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
                  </div>
                }

                <div>
                  <label for="custNameInput" class="block font-bold text-stone-800 mb-1">Seu Nome Completo</label>
                  <input id="custNameInput" [value]="customerName()" (input)="customerName.set($any($event.target).value)" type="text" placeholder="Ex: Carlos Eduardo" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-amber-600">
                </div>

                <div class="bg-[#f5ebd9] border border-[#e6d8be] p-3 rounded-xl space-y-1 font-mono text-xs">
                  <div class="flex justify-between text-stone-600">
                    <span>Subtotal:</span>
                    <span>R$ {{ cartTotal().toFixed(2) }}</span>
                  </div>
                  @if (orderType() === 'delivery') {
                    <div class="flex justify-between text-stone-600">
                      <span>Taxa de Entrega / Serviço:</span>
                      <span>R$ {{ serviceFeeAmount().toFixed(2) }}</span>
                    </div>
                  }
                  <div class="flex justify-between font-bold text-stone-900 text-sm pt-1 border-t border-[#e6d8be]">
                    <span>Total Final:</span>
                    <span class="text-amber-800">R$ {{ (orderType() === 'delivery' ? finalTotal() : cartTotal()).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            }

            <div class="flex justify-end gap-2.5 pt-3 border-t border-[#e8dfce]">
              <button type="button" (click)="showCartModal.set(false)" class="bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 font-bold py-2.5 px-4 rounded-xl border border-[#d6c3aa] text-xs">
                Voltar
              </button>

              @if (customerCart().length > 0) {
                <button
                  type="button"
                  (click)="placeOnlineOrder()"
                  class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2.5 px-5 rounded-xl shadow-lg border border-amber-400/50 text-xs flex items-center gap-1">
                  <mat-icon class="text-sm">check_circle</mat-icon>
                  <span>Confirmar Pedido</span>
                </button>
              }
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CustomerStorefrontComponent {
  readonly ecosystem = inject(EcosystemService);
  private readonly router = inject(Router);

  readonly isHqAdmin = computed(() => this.ecosystem.currentSession()?.role === 'hq_admin');
  readonly isStoreOperator = computed(() => {
    const session = this.ecosystem.currentSession();
    return session?.role === 'operator' && this.ecosystem.currentTenantId() === this.activeStore().id;
  });

  openStoreManagerInOs() {
    this.ecosystem.currentView.set('os');
    this.router.navigate(['/os']);
    this.ecosystem.notify('Abrindo bancada do 3EATCRU OS da sua loja.', 'info');
  }

  returnToHq() {
    this.ecosystem.currentView.set('hq');
    this.router.navigate(['/hq']);
    this.ecosystem.notify('Retornando ao HQ Central.', 'info');
  }

  readonly showBackToRegional = input<boolean>(false);
  readonly backToRegional = output<void>();

  readonly showCartModal = signal<boolean>(false);
  readonly customerCart = signal<CartItem[]>([]);

  readonly customerName = signal<string>('Carlos Eduardo');
  readonly customerPhone = signal<string>('(11) 98888-7777');
  readonly deliveryAddress = signal<string>('Rua Augusta, 1200 - Apto 42');
  readonly orderType = signal<'delivery' | 'dine-in' | 'takeout'>('delivery');
  readonly selectedTableNumber = signal<number>(1);

  readonly lastPlacedOrder = signal<OrderTransaction | null>(null);

  activeStore = computed(() => {
    const id = this.ecosystem.currentTenantId();
    return this.ecosystem.tenants().find(t => t.id === id) || this.ecosystem.tenants()[0];
  });

  onlineProducts = computed(() => {
    const activeId = this.activeStore().id;
    const all = this.ecosystem.products().filter(p => p.availableOnline);
    const storeSpecific = all.filter(p => p.tenantId === activeId);
    return storeSpecific.length > 0 ? storeSpecific : all;
  });

  totalCartCount = computed(() => this.customerCart().reduce((sum, i) => sum + i.quantity, 0));
  cartTotal = computed(() => this.customerCart().reduce((sum, i) => sum + i.product.price * i.quantity, 0));
  serviceFeeAmount = computed(() => this.cartTotal() * (this.activeStore().serviceFeePercent / 100));
  finalTotal = computed(() => this.cartTotal() + this.serviceFeeAmount());

  onBackClick() {
    this.backToRegional.emit();
    this.ecosystem.openRegionalMarketplace();
  }

  addToCustomerCart(product: ProductItem) {
    this.customerCart.update(c => {
      const existing = c.find(i => i.product.id === product.id);
      if (existing) {
        return c.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...c, { product, quantity: 1 }];
    });
    this.showCartModal.set(true);
  }

  removeFromCart(productId: string) {
    this.customerCart.update(c => c.filter(i => i.product.id !== productId));
  }

  placeOnlineOrder() {
    if (!this.customerName().trim()) {
      this.ecosystem.notify('Por favor, informe seu nome para finalizar o pedido.', 'warning');
      return;
    }

    const isDineIn = this.orderType() === 'dine-in';
    const subtotal = this.cartTotal();

    // Validate Minimum Order Value for Delivery
    if (!isDineIn && this.orderType() === 'delivery') {
      const minVal = this.activeStore().minOrderValue || 0;
      if (minVal > 0 && subtotal < minVal) {
        const diff = minVal - subtotal;
        this.ecosystem.notify(`O pedido mínimo para entrega nesta loja é de R$ ${minVal.toFixed(2)}. Faltam R$ ${diff.toFixed(2)} na sua sacola!`, 'warning');
        return;
      }
    }

    const tax = isDineIn ? 0 : this.serviceFeeAmount();
    const total = subtotal + tax;
    const orderNum = (isDineIn ? '#M' + this.selectedTableNumber() + '-' : '#') + Math.floor(Math.random() * 900 + 100);

    const userCoords = this.ecosystem.userReferenceCoords();

    const newOrder = {
      tenantId: this.activeStore().id,
      orderNumber: orderNum,
      type: (isDineIn ? 'dine-in' : 'delivery') as 'dine-in' | 'delivery',
      tableNumber: isDineIn ? `Mesa ${this.selectedTableNumber()}` : undefined,
      customerName: this.customerName(),
      customerPhone: this.customerPhone() || '(11) 99999-9999',
      items: [...this.customerCart()],
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: (isDineIn ? 'card' : 'online') as 'card' | 'online',
      status: 'pending' as const,
      channel: (isDineIn ? 'Table QR' : 'Customer Storefront') as 'Table QR' | 'Customer Storefront',
      lat: isDineIn ? this.activeStore().lat : userCoords.lat,
      lng: isDineIn ? this.activeStore().lng : userCoords.lng
    };

    const placedOrder = this.ecosystem.addOrder(newOrder);
    this.lastPlacedOrder.set(placedOrder);

    // If dine-in, mark table occupied and update running total
    if (isDineIn) {
      const tblNum = this.selectedTableNumber();
      this.ecosystem.tables.update(tables =>
        tables.map(t => t.number === tblNum ? {
          ...t,
          status: 'occupied',
          currentTotal: (t.currentTotal || 0) + total,
          guests: t.guests || 2
        } : t)
      );
      this.ecosystem.notify(`Pedido enviado via QR Code para a Mesa ${tblNum}! Notificado no App do Garçom e no KDS da Cozinha.`, 'success');
    } else {
      this.ecosystem.notify(`Pedido ${orderNum} realizado com sucesso! Enviado para a cozinha (KDS) e PDV da loja ${this.activeStore().name}.`, 'success');
    }

    this.customerCart.set([]);
    this.showCartModal.set(false);
  }
}


