import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inventory-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Total de SKUs Cadastrados</span>
        <div class="text-xl font-serif font-black text-stone-900 mt-0.5">{{ skuCount() }} insumos</div>
      </div>

      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Valor Total do Patrimônio</span>
        <div class="text-xl font-serif font-black text-emerald-800 mt-0.5">R$ {{ totalValue().toFixed(2) }}</div>
      </div>

      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Insumos em Alerta Mínimo</span>
        <div class="text-xl font-serif font-black text-rose-700 mt-0.5">{{ lowStockCount() }} SKUs críticos</div>
      </div>

      <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-xl p-3 shadow text-stone-900">
        <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block">Sincronia EAN-13 &amp; Balança</span>
        <div class="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
          <mat-icon class="text-xs">qr_code_scanner</mat-icon> Balança RS232 + PDV OK
        </div>
      </div>
    </div>
  `
})
export class InventoryStatsComponent {
  skuCount = input.required<number>();
  totalValue = input.required<number>();
  lowStockCount = input.required<number>();
}
