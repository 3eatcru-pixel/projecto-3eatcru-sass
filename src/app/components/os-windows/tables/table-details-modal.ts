import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TableInfo, ProductItem } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-table-details-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 text-white space-y-4 shadow-2xl animate-in zoom-in-95 font-mono">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <h4 class="font-bold text-base flex items-center gap-2">
            <mat-icon class="text-orange-400">table_restaurant</mat-icon>
            Mesa {{ table().number }} - {{ table().status === 'available' ? 'Abertura de Mesa' : 'Comanda do Atendimento' }}
          </h4>
          <button type="button" (click)="closeRequest.emit()" class="text-slate-400 hover:text-white font-bold">✕</button>
        </div>

        @if (table().status === 'available') {
          <div class="space-y-3 text-xs">
            <div>
              <label for="serverNameInput" class="block text-slate-400 mb-1 font-semibold">Garçom Atribuído</label>
              <input
                id="serverNameInput"
                #serverName
                type="text"
                value="Carlos M."
                placeholder="Ex: Carlos M."
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold">
            </div>
            <div>
              <label for="guestsCountInput" class="block text-slate-400 mb-1 font-semibold">Quantidade de Pessoas na Mesa</label>
              <input
                id="guestsCountInput"
                #guestsCount
                type="number"
                min="1"
                max="12"
                value="2"
                class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-orange-500 font-bold">
            </div>
            <div class="flex justify-end gap-2 pt-3">
              <button type="button" (click)="closeRequest.emit()" class="px-4 py-2 bg-slate-800 rounded-xl font-semibold">Cancelar</button>
              <button type="button" (click)="open.emit({ server: serverName.value, guests: +guestsCount.value })" class="px-5 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl font-bold shadow-lg shadow-orange-600/30">Confirmar Abertura</button>
            </div>
          </div>
        } @else {
          <div class="space-y-3 text-xs">
            <div class="flex justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div>
                <span class="text-slate-400 block">Garçom</span>
                <strong class="text-orange-400">{{ table().server || 'Carlos M.' }}</strong>
              </div>
              <div>
                <span class="text-slate-400 block">Clientes</span>
                <strong class="text-white">{{ table().guests || 2 }} pessoas</strong>
              </div>
              <div>
                <span class="text-slate-400 block">Status Salão</span>
                <span class="text-emerald-400 font-bold uppercase">{{ table().status }}</span>
              </div>
            </div>

            <!-- Course Firing Indicator (Tempos de Prato) -->
            <div class="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <span class="text-slate-400 font-semibold">Cadenciamento de Cozinha:</span>
              <div class="flex items-center gap-1">
                <button 
                  type="button" 
                  (click)="fireCourse.emit('Entradas')"
                  class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px]">
                  Entradas ✓
                </button>
                <button 
                  type="button" 
                  (click)="fireCourse.emit('Pratos Principais')"
                  class="px-2 py-0.5 rounded bg-orange-600 text-white font-bold text-[10px] animate-pulse">
                  Disparar Principal 🔥
                </button>
                <button 
                  type="button" 
                  (click)="fireCourse.emit('Sobremesas')"
                  class="px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white text-[10px]">
                  Sobremesas
                </button>
              </div>
            </div>

            <!-- Add Item to Comanda Quick Bar -->
            <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <span class="font-bold text-slate-300 block">Adicionar Pedido à Comanda da Mesa:</span>
              <div class="flex gap-2">
                <select #tableAddItemSelect class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-bold">
                  @for (p of products(); track p.id) {
                    <option [value]="p.id">{{ p.name }} - R$ {{ p.price.toFixed(2) }}</option>
                  }
                </select>
                <button
                  type="button"
                  (click)="addItem.emit(tableAddItemSelect.value)"
                  class="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1">
                  <mat-icon class="text-xs">add</mat-icon> Lançar (KDS)
                </button>
              </div>
            </div>

            <!-- Comanda Lançada -->
            <div class="space-y-2">
              <span class="font-bold text-slate-300 block">Comanda Lançada no KDS:</span>
              <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 max-h-36 overflow-y-auto custom-scrollbar">
                @for (item of currentItems(); track item.name) {
                  <div class="flex justify-between items-center">
                    <div>
                      <span class="text-white font-semibold">{{ item.qty }}x {{ item.name }}</span>
                      @if (item.notes) {
                        <div class="text-[10px] text-slate-500">Obs: {{ item.notes }}</div>
                      }
                    </div>
                    <strong class="text-orange-400">R$ {{ item.total.toFixed(2) }}</strong>
                  </div>
                }
              </div>
            </div>

            <!-- Split Bill Calculation (Divisão de Conta) -->
            <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
              <div class="flex items-center gap-1.5">
                <mat-icon class="text-amber-400 text-sm">call_split</mat-icon>
                <span class="text-slate-300 font-semibold">Divisão da Conta ({{ table().guests || 2 }} pessoas):</span>
              </div>
              <strong class="text-emerald-400 font-mono text-sm">R$ {{ (currentTotal() / (table().guests || 2)).toFixed(2) }} / pessoa</strong>
            </div>

            <div class="flex justify-between text-base font-black pt-2 border-t border-slate-800">
              <span>Total da Comanda:</span>
              <span class="text-orange-400">R$ {{ currentTotal().toFixed(2) }}</span>
            </div>

            <div class="flex gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                (click)="closeRequest.emit()"
                class="flex-1 bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl font-bold">
                Voltar
              </button>
              <button
                type="button"
                (click)="closeBill.emit()"
                class="flex-1 bg-amber-600 hover:bg-amber-500 py-2.5 rounded-xl font-bold text-white shadow">
                Pedir Conta
              </button>
              <button
                type="button"
                (click)="settle.emit()"
                class="flex-1 bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-xl font-bold text-white shadow">
                Pagar &amp; Liberar
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class TableDetailsModal {
  table = input.required<TableInfo>();
  products = input.required<ProductItem[]>();
  currentItems = input.required<{ name: string; qty: number; total: number; notes?: string }[]>();
  currentTotal = input.required<number>();

  closeRequest = output<void>();
  open = output<{ server: string; guests: number }>();
  fireCourse = output<string>();
  addItem = output<string>();
  closeBill = output<void>();
  settle = output<void>();
}
