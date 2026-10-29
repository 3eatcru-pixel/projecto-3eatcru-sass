import { ChangeDetectionStrategy, Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CartItem, CustomerProfile } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-pos-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col h-full overflow-hidden backdrop-blur-md justify-between">
      
      <!-- Cart Header -->
      <div class="space-y-3 flex flex-col flex-1 overflow-hidden">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
          <div class="flex items-center gap-2">
            <mat-icon class="text-orange-500 text-sm">shopping_cart</mat-icon>
            <div>
              <span class="font-black text-xs text-white uppercase tracking-tight">Cupom Venda #{{ currentSaleNumber() }}</span>
              <span class="text-[8px] text-slate-500 uppercase block tracking-widest">Caixa 01 • Atendente Ativo</span>
            </div>
          </div>

          <div class="flex items-center gap-1">
            @if (cart().length > 0) {
              <button
                type="button"
                (click)="holdSale.emit()"
                class="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase hover:bg-amber-500/20 transition-all">
                Hold
              </button>
            }
            <button
              type="button"
              (click)="clearCart.emit()"
              class="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[9px] font-black uppercase hover:bg-rose-500/20 transition-all">
              Limpar
            </button>
          </div>
        </div>

        <!-- Customer Search & Loyalty -->
        <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-2 shrink-0">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <mat-icon class="text-indigo-400 text-xs">person_search</mat-icon>
              <span class="text-[9px] text-slate-400 font-bold uppercase">Cliente / Fidelidade:</span>
            </div>
            @if (selectedCustomer()) {
              <button (click)="removeCustomer.emit()" class="text-rose-400 text-[8px] font-black uppercase underline">Remover</button>
            }
          </div>

          @if (selectedCustomer(); as cust) {
            <div class="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-lg flex items-center justify-between">
              <div>
                <span class="text-[10px] font-black text-white block">{{ cust.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-[8px] text-emerald-400 font-bold">PTS: {{ cust.loyaltyPoints }}</span>
                  <span class="text-[8px] text-amber-400 font-bold">Crédito: R$ {{ cust.storeCredit.toFixed(2) }}</span>
                </div>
              </div>
              <mat-icon class="text-indigo-400">check_circle</mat-icon>
            </div>
          } @else {
            <div class="relative">
              <input 
                type="text" 
                (input)="customerSearch.emit($any($event.target).value)"
                placeholder="Nome, CPF ou Celular..." 
                class="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-[10px] text-white focus:outline-none focus:border-indigo-500 uppercase font-black">
              
              @if (customerSearchResults().length > 0) {
                <div class="absolute top-full left-0 right-0 z-10 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-32 overflow-y-auto">
                  @for (c of customerSearchResults(); track c.id) {
                    <button 
                      (click)="selectCustomer.emit(c)"
                      class="w-full text-left p-2 hover:bg-slate-800 border-b border-slate-800 last:border-0 flex flex-col">
                      <span class="text-[10px] font-black text-white uppercase">{{ c.name }}</span>
                      <span class="text-[8px] text-slate-500">{{ c.cpf }} • {{ c.phone }}</span>
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- CPF na Nota -->
        <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-1.5">
            <mat-icon class="text-slate-500 text-xs">badge</mat-icon>
            <span class="text-[9px] text-slate-400 font-bold uppercase">CPF na Nota:</span>
          </div>
          <input 
            type="text" 
            [value]="selectedCustomer() ? selectedCustomer()!.cpf : customerCpf()" 
            (input)="customerCpf.set($any($event.target).value)" 
            placeholder="000.000.000-00" 
            class="w-32 bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-center font-mono text-[10px] text-orange-400 font-bold uppercase focus:outline-none">
        </div>

        <!-- Cart Items List -->
        <div class="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          @if (cart().length === 0) {
            <div class="h-full flex flex-col items-center justify-center text-center text-slate-600 space-y-2 py-8">
              <mat-icon class="text-4xl text-slate-700">add_shopping_cart</mat-icon>
              <p class="text-[10px] uppercase font-black tracking-widest">Carrinho Vazio</p>
              <p class="text-[8px] uppercase tracking-widest text-slate-600">Bipe com o leitor ou clique no catálogo</p>
            </div>
          } @else {
            @for (item of cart(); track item.product.id) {
              <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div class="flex items-center justify-between">
                  <div class="flex-1 pr-2 min-w-0">
                    <span class="font-black text-white block truncate uppercase tracking-tight">{{ item.product.name }}</span>
                    <span class="text-[9px] text-orange-400 font-black">R$ {{ item.product.price.toFixed(2) }} un</span>
                  </div>
                  <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" (click)="decrementQty.emit(item)" class="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-black">-</button>
                    <span class="text-xs font-black w-4 text-center font-mono">{{ item.quantity }}</span>
                    <button type="button" (click)="incrementQty.emit(item)" class="w-6 h-6 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center font-black">+</button>
                  </div>
                </div>

                <!-- Item Custom Observation Field -->
                <div class="flex items-center gap-2 pt-1 border-t border-slate-900">
                  <mat-icon class="text-[10px] text-slate-600">edit_note</mat-icon>
                  <input 
                    type="text"
                    [value]="item.notes || ''"
                    (input)="updateItemNotes.emit({item, notes: $any($event.target).value})"
                    placeholder="Obs: Sem cebola, bem passado, etc..."
                    class="bg-transparent text-[9px] text-slate-400 placeholder:text-slate-700 uppercase font-black focus:outline-none w-full">
                </div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Split Bill Bar + Cart Totals & Checkout -->
      <div class="pt-3 border-t border-slate-800 space-y-3 shrink-0">
        
        <!-- Split Bill Tool & Discount Button -->
        <div class="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <mat-icon class="text-amber-400 text-sm">group</mat-icon>
            <span class="text-[9px] font-black uppercase text-slate-400">Dividir ({{ splitGuestsCount() }}p):</span>
            <span class="text-[9px] font-black text-orange-400">R$ {{ (cartTotal() / splitGuestsCount()).toFixed(2) }}/p</span>
          </div>
          
          <button 
            type="button" 
            (click)="openDiscount.emit()" 
            class="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-bold uppercase flex items-center gap-0.5">
            <mat-icon class="text-[10px]">percent</mat-icon> Desconto
          </button>
        </div>

        <!-- Subtotal & Tax Breakdown -->
        <div class="space-y-1 text-xs text-slate-300">
          <div class="flex justify-between text-[10px]">
            <span class="text-slate-500 uppercase font-black">Subtotal Produtos:</span>
            <span class="font-mono font-black">R$ {{ cartSubtotal().toFixed(2) }}</span>
          </div>

          @if (cartDiscount() > 0) {
            <div class="flex justify-between text-[10px] text-emerald-400">
              <span class="uppercase font-black">Desconto Manual:</span>
              <span class="font-mono font-black">- R$ {{ cartDiscount().toFixed(2) }}</span>
            </div>
          }

          @if (cartPromotionsDiscount() > 0) {
            <div class="flex justify-between text-[10px] text-orange-400 animate-pulse">
              <span class="uppercase font-black">Promoções Aplicadas:</span>
              <span class="font-mono font-black">- R$ {{ cartPromotionsDiscount().toFixed(2) }}</span>
            </div>
          }

          <div class="flex justify-between items-center text-[10px]">
            <span class="text-slate-500 uppercase font-black">Taxa de Serviço / Embalagem (10%):</span>
            <span class="font-mono font-black">R$ {{ cartTax().toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-sm font-black text-white pt-2 border-t border-slate-800">
            <span class="uppercase tracking-tight">Total a Receber:</span>
            <span class="text-orange-400 font-mono">R$ {{ cartTotal().toFixed(2) }}</span>
          </div>
        </div>

        <!-- Checkout Payment Methods -->
        <div class="grid grid-cols-3 gap-2 pt-1">
          <button
            type="button"
            (click)="checkout.emit('cash')"
            [disabled]="cart().length === 0"
            class="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 border border-slate-700 transition-all active:scale-95 cursor-pointer">
            <mat-icon class="text-sm text-emerald-400">payments</mat-icon> Dinheiro
          </button>

          <button
            type="button"
            (click)="checkout.emit('card')"
            [disabled]="cart().length === 0"
            class="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 border border-slate-700 transition-all active:scale-95 cursor-pointer">
            <mat-icon class="text-sm text-blue-400">credit_card</mat-icon> Cartão TEF
          </button>

          <button
            type="button"
            (click)="checkout.emit('pix')"
            [disabled]="cart().length === 0"
            class="bg-orange-600 hover:bg-orange-500 disabled:opacity-40 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-orange-600/30 transition-all active:scale-95 border-b-2 border-orange-800 cursor-pointer">
            <mat-icon class="text-sm">qr_code_2</mat-icon> PIX Rápido
          </button>
        </div>
      </div>
    </div>
  `
})
export class PosCartComponent {
  currentSaleNumber = input.required<number>();
  cart = input.required<CartItem[]>();
  selectedCustomer = input<CustomerProfile | null>(null);
  customerSearchResults = input<CustomerProfile[]>([]);
  customerCpf = model.required<string>();
  splitGuestsCount = input<number>(1);
  cartSubtotal = input.required<number>();
  cartDiscount = input.required<number>();
  cartPromotionsDiscount = input.required<number>();
  cartTax = input.required<number>();
  cartTotal = input.required<number>();

  holdSale = output<void>();
  clearCart = output<void>();
  removeCustomer = output<void>();
  customerSearch = output<string>();
  selectCustomer = output<CustomerProfile>();
  incrementQty = output<CartItem>();
  decrementQty = output<CartItem>();
  updateItemNotes = output<{item: CartItem, notes: string}>();
  openDiscount = output<void>();
  checkout = output<'cash' | 'card' | 'pix'>();
}
