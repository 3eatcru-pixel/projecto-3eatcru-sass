import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TableInfo } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-table-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
      @for (table of tables(); track table.id) {
        <div
          class="bg-slate-900 border rounded-2xl p-3.5 flex flex-col justify-between shadow-lg transition-all relative overflow-hidden group hover:scale-[1.02]"
          [class]="table.status === 'occupied' ? 'border-orange-500/80 bg-orange-950/20' : table.status === 'billing' ? 'border-amber-500/80 bg-amber-950/20' : 'border-slate-800 hover:border-slate-700'">
          
          <div>
            <div class="flex justify-between items-center mb-2.5">
              <span class="font-black text-base text-white">Mesa {{ table.number }}</span>
              <span
                class="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                [class]="table.status === 'occupied' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : table.status === 'billing' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'">
                {{ table.status }}
              </span>
            </div>

            <div class="space-y-1 text-slate-300 text-[11px]">
              <div class="flex items-center gap-1.5 text-slate-400">
                <mat-icon class="text-xs">chair</mat-icon>
                <span>{{ table.capacity }} lugares</span>
              </div>
              @if (table.server) {
                <div class="flex items-center gap-1.5 text-orange-400 font-semibold">
                  <mat-icon class="text-xs">badge</mat-icon>
                  <span>Garçom: {{ table.server }}</span>
                </div>
              }
              @if (table.guests) {
                <div class="text-[10px] text-slate-400">
                  Ocupação: <strong class="text-white">{{ table.guests }} pessoas</strong>
                </div>
              }
            </div>
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-800">
            <button
              type="button"
              (click)="selectTable.emit(table)"
              class="w-full py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow cursor-pointer"
              [class]="table.status === 'available' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'">
              <mat-icon class="text-xs">{{ table.status === 'available' ? 'login' : 'receipt_long' }}</mat-icon>
              <span>{{ table.status === 'available' ? 'Abrir Mesa' : 'Comanda & Conta' }}</span>
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class TableGridComponent {
  tables = input.required<TableInfo[]>();
  selectTable = output<TableInfo>();
}
