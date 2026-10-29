import { ChangeDetectionStrategy, Component, input, output, signal, inject, computed, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { OrderTransaction } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-kds-ticket',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="order-ticket bg-[#faf7f0] border rounded-xl p-3.5 space-y-3 shadow-md text-stone-900 relative group transition-all"
         [class.border-[#ded4c2]]="status() === 'pending'"
         [class.border-orange-500/60]="status() === 'preparing'"
         [class.border-2]="status() === 'preparing'"
         [class.border-emerald-500/60]="status() === 'ready'">
      
      <!-- Paperclip graphic (only for pending) -->
      @if (status() === 'pending') {
        <div class="absolute -top-2 left-4 w-4 h-6 rounded-full border-2 border-stone-400 bg-transparent opacity-80 pointer-events-none"></div>
      }

      <div class="flex justify-between items-start pt-1">
        <div>
          <span class="font-mono font-black text-base block leading-none"
                [class.text-amber-900]="status() === 'pending'"
                [class.text-orange-950]="status() === 'preparing'"
                [class.text-emerald-950]="status() === 'ready'">
            {{ order().orderNumber }}
          </span>
          <span class="text-[10px] font-bold text-stone-600 uppercase font-serif mt-1 block">
            {{ order().tableNumber || order().customerName || 'Balcão / Delivery' }}
          </span>
          <div class="flex items-center gap-1.5 mt-0.5">
            <span class="text-[8px] font-mono px-1.5 py-0.2 rounded font-bold uppercase"
                  [class]="order().channel === 'Table QR' ? 'bg-amber-200 text-amber-900 border border-amber-300' : order().channel === 'POS' ? 'bg-stone-200 text-stone-800' : 'bg-blue-100 text-blue-900'">
              {{ order().channel }}
            </span>
            @if (order().createdAt) {
              <span class="text-[9px] font-mono font-bold" 
                    [class]="isOverdue() ? 'text-rose-600 animate-pulse' : 'text-stone-500'">
                {{ elapsedTime() }}
              </span>
            }
          </div>
        </div>
        
        @if (status() === 'pending') {
          <span class="border border-dashed border-amber-700 text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
            Aguardando
          </span>
        } @else if (status() === 'preparing') {
          <span class="bg-orange-600 text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase shadow">
            No Fogo 🔥
          </span>
        } @else if (status() === 'ready') {
          <span class="bg-emerald-700 text-white px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
            Pronto ✓
          </span>
        }
      </div>

      <div class="space-y-1.5 border-y border-[#e8dfce] py-2 text-xs">
        @for (item of order().items; track item.product.id) {
          <div class="flex justify-between items-center font-bold text-stone-900">
            <span>{{ item.quantity }}x {{ item.product.name }}</span>
          </div>
          @if (item.notes) {
            <div class="text-[10px] text-rose-700 font-bold italic bg-rose-50 p-1 rounded border border-rose-200">
              Obs: {{ item.notes }}
            </div>
          }
        }
      </div>

      @if (status() === 'pending') {
        <button
          type="button"
          (click)="updateStatus.emit('preparing')"
          class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold py-2 px-3 rounded-lg shadow border border-amber-400/50 text-xs flex items-center justify-center gap-1 cursor-pointer transition-all">
          <mat-icon class="text-xs">play_arrow</mat-icon>
          <span>Iniciar Preparo</span>
        </button>
      } @else if (status() === 'preparing') {
        <button
          type="button"
          (click)="updateStatus.emit('ready')"
          class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-3 rounded-lg shadow text-xs flex items-center justify-center gap-1 cursor-pointer transition-all">
          <mat-icon class="text-xs">done_all</mat-icon>
          <span>Concluir (Pronto)</span>
        </button>
      } @else if (status() === 'ready') {
        <button
          type="button"
          (click)="updateStatus.emit('completed')"
          class="w-full bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-900 font-bold py-2 px-3 rounded-lg border border-[#d6c3aa] text-xs flex items-center justify-center gap-1 cursor-pointer transition-all">
          <mat-icon class="text-xs">handshake</mat-icon>
          <span>Entregue</span>
        </button>
      }
    </div>
  `
})
export class KdsTicketComponent {
  order = input.required<OrderTransaction>();
  status = input.required<OrderTransaction['status']>();
  
  updateStatus = output<OrderTransaction['status']>();

  private readonly now = signal(Date.now());
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    const interval = setInterval(() => this.now.set(Date.now()), 15000);
    this.destroyRef.onDestroy(() => clearInterval(interval));
  }

  elapsedTime = computed(() => {
    const created = new Date(this.order().createdAt).getTime();
    const diff = Math.floor((this.now() - created) / 1000);
    
    if (diff < 60) return `${diff}s`;
    const mins = Math.floor(diff / 60);
    const secs = diff % 60;
    return `${mins}m ${secs}s`;
  });

  isOverdue = computed(() => {
    const created = new Date(this.order().createdAt).getTime();
    const diffMins = (this.now() - created) / 60000;
    return diffMins > 15; // 15 minutes threshold for visual alert
  });
}
