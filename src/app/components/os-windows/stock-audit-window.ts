import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

export interface AuditItem {
  productId: string;
  productName: string;
  category: string;
  barcode: string;
  systemStock: number;
  countedStock: number | null;
  unitCost: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-stock-audit-window',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-stone-200 font-sans select-none">
      
      <!-- TOP NAVIGATION BAR & METRICS -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-[#180b04] border border-[#4d2813] p-4 rounded-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <mat-icon class="text-xl">fact_check</mat-icon>
          </div>
          <div>
            <h2 class="font-serif font-black text-lg text-white">Auditoria de Estoque & Contagem Cega</h2>
            <p class="text-[10px] text-stone-400 font-mono">Contagem Física Imparcial, Congelamento de Saldo e Recalibragem de Divergências</p>
          </div>
        </div>

        <!-- STATS BADGES -->
        <div class="flex items-center gap-2 text-xs font-mono">
          <div class="bg-[#2a160b] border border-[#4d2813] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span class="text-stone-400">Modo de Contagem:</span>
            <strong class="text-amber-400 font-bold uppercase">{{ isBlindMode() ? 'Cega (Sem Saldo Previo)' : 'Aberta (Padrão)' }}</strong>
          </div>
          <div class="bg-[#2a160b] border border-[#4d2813] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span class="text-stone-400">Acuracidade do Estoque (ERI):</span>
            <strong [class]="accuracyPercent() >= 95 ? 'text-emerald-400' : 'text-rose-400'" class="font-bold">
              {{ accuracyPercent().toFixed(1) }}%
            </strong>
          </div>
        </div>
      </div>

      <!-- AUDIT CONTROL TOOLBAR -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#3d200f] pb-2 text-xs font-bold">
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="toggleBlindMode()"
            [class]="isBlindMode() ? 'bg-amber-500 text-stone-950 font-black shadow' : 'bg-[#211006] text-stone-400 border border-[#3d200f]'"
            class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
            <mat-icon class="text-sm">visibility_off</mat-icon>
            <span>Contagem Cega (Recomendado)</span>
          </button>

          <button
            type="button"
            (click)="toggleStockFreeze()"
            [class]="isStockFrozen() ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-[#211006] text-stone-300 border border-[#3d200f]'"
            class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
            <mat-icon class="text-sm">ac_unit</mat-icon>
            <span>{{ isStockFrozen() ? 'Estoque Congelado ❄️' : 'Congelar Movimentação' }}</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="startNewAuditSession()"
            class="bg-[#2a160b] hover:bg-[#3d200f] border border-[#4d2813] text-amber-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer">
            Reiniciar Contagem
          </button>
          <button
            type="button"
            (click)="openAdjustmentModal()"
            [disabled]="countedItemsCount() === 0"
            class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 text-stone-950 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5">
            <mat-icon class="text-sm">published_with_changes</mat-icon>
            <span>Processar Ajuste no ERP</span>
          </button>
        </div>
      </div>

      <!-- MAIN AUDIT GRID -->
      <div class="flex-1 bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-[#3d200f] text-xs">
          <span class="font-bold text-amber-400 font-mono uppercase">Planilha de Contagem Física por Bipagem ou Digitação</span>
          <span class="text-stone-400 font-mono">Itens Contados: {{ countedItemsCount() }}/{{ auditList().length }}</span>
        </div>

        <table class="w-full text-left text-xs">
          <thead>
            <tr class="text-stone-400 border-b border-[#3d200f] font-mono text-[10px] uppercase">
              <th class="py-2">Código / Bipagem</th>
              <th class="py-2">Insumo / Produto</th>
              <th class="py-2">Categoria</th>
              <th class="py-2">Saldo Sistema (ERP)</th>
              <th class="py-2">Contagem Física (Real)</th>
              <th class="py-2">Divergência (Falta/Sobra)</th>
              <th class="py-2">Impacto R$</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#2d170a]">
            @for (item of auditList(); track item.productId) {
              <tr class="hover:bg-[#221207]">
                <td class="py-2.5 font-mono text-stone-400 text-[11px]">{{ item.barcode || '78910283000' }}</td>
                <td class="py-2.5 font-bold text-white flex items-center gap-2">
                  <mat-icon class="text-sm text-amber-400">inventory_2</mat-icon>
                  <span>{{ item.productName }}</span>
                </td>
                <td class="py-2.5 text-stone-400">{{ item.category }}</td>

                <!-- SALDO SISTEMA (OCULTO SE CONTAGEM CEGA ATIVA) -->
                <td class="py-2.5 font-mono font-bold text-stone-200">
                  @if (isBlindMode()) {
                    <span class="text-stone-600 font-mono italic">[Oculto p/ Contagem Cega]</span>
                  } @else {
                    <span>{{ item.systemStock }} un</span>
                  }
                </td>

                <!-- CONTAGEM FÍSICA INPUT -->
                <td class="py-2.5">
                  <input
                    type="number"
                    [value]="item.countedStock !== null ? item.countedStock : ''"
                    (change)="updateCountedStock(item.productId, $event)"
                    placeholder="Digitar un..."
                    class="bg-[#2a160b] border border-[#4d2813] focus:border-amber-500 text-amber-200 font-mono font-bold text-xs px-2.5 py-1 rounded-lg outline-none w-28" />
                </td>

                <!-- DIVERGÊNCIA CALCULADA -->
                <td class="py-2.5 font-mono font-bold">
                  @if (item.countedStock !== null) {
                    @let diff = item.countedStock - item.systemStock;
                    @if (diff === 0) {
                      <span class="text-emerald-400">0 (Exato ✓)</span>
                    } @else if (diff < 0) {
                      <span class="text-rose-400">{{ diff }} un (Falta)</span>
                    } @else {
                      <span class="text-amber-400">+{{ diff }} un (Sobra)</span>
                    }
                  } @else {
                    <span class="text-stone-600 font-normal">Aguardando...</span>
                  }
                </td>

                <!-- IMPACTO FINANCEIRO DA DIVERGÊNCIA -->
                <td class="py-2.5 font-mono font-bold">
                  @if (item.countedStock !== null) {
                    @let diffValue = (item.countedStock - item.systemStock) * item.unitCost;
                    @if (diffValue === 0) {
                      <span class="text-emerald-400">R$ 0,00</span>
                    } @else if (diffValue < 0) {
                      <span class="text-rose-400">R$ {{ diffValue.toFixed(2) }}</span>
                    } @else {
                      <span class="text-amber-400">+R$ {{ diffValue.toFixed(2) }}</span>
                    }
                  } @else {
                    <span class="text-stone-600">-</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- ADJUSTMENT GOVERNANCE MODAL -->
      @if (showAdjustmentModal()) {
        <div class="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#180b04] border-2 border-[#4d2813] rounded-3xl p-6 w-full max-w-md space-y-4 text-stone-200">
            <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
              <h3 class="font-serif font-black text-lg text-white">Governança do Ajuste no ERP</h3>
              <button (click)="showAdjustmentModal.set(false)" class="text-stone-400 hover:text-white cursor-pointer"><mat-icon>close</mat-icon></button>
            </div>

            <div class="space-y-3 text-xs">
              <div class="bg-[#2a160b] p-3 rounded-xl border border-[#4d2813] space-y-1">
                <div class="text-[10px] text-stone-400 uppercase font-mono">Resumo do Ajuste de Auditoria</div>
                <div class="flex justify-between">
                  <span>Itens com Divergência:</span>
                  <strong class="text-amber-400 font-mono">{{ totalDivergentItems() }} item(ns)</strong>
                </div>
                <div class="flex justify-between">
                  <span>Custo Total da Divergência:</span>
                  <strong class="text-rose-400 font-mono">R$ {{ totalDivergenceCost().toFixed(2) }}</strong>
                </div>
              </div>

              <div>
                <span class="block text-stone-400 mb-1 font-bold">Motivo do Ajuste (Obrigatório)</span>
                <select #reasonSelect class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500">
                  <option value="Avaria e Vencimento na Cozinha">Avaria e Vencimento na Cozinha</option>
                  <option value="Ajuste de Ficha Técnica">Ajuste de Ficha Técnica / Porcionamento</option>
                  <option value="Furo / Perda Oculta">Furo / Perda Oculta de Estoque</option>
                  <option value="Erro de Lançamento de Nota">Erro de Lançamento em Compra Anterior</option>
                </select>
              </div>

              <div>
                <span class="block text-stone-400 mb-1 font-bold">Observações do Auditor / Gerente</span>
                <textarea #notesInput rows="3" placeholder="Instruções para o contábil..." class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500"></textarea>
              </div>
            </div>

            <div class="pt-2 border-t border-[#3d200f] flex justify-end gap-2">
              <button (click)="showAdjustmentModal.set(false)" class="px-4 py-2 bg-[#2a160b] rounded-xl text-stone-300 font-bold text-xs">Cancelar</button>
              <button (click)="applyErpAdjustment(reasonSelect.value, notesInput.value)" class="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow">Confirmar Recalibragem ERP</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class StockAuditWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly isBlindMode = signal<boolean>(true);
  readonly isStockFrozen = signal<boolean>(true);
  readonly showAdjustmentModal = signal<boolean>(false);

  readonly auditList = signal<AuditItem[]>([
    { productId: 'prod-1', productName: 'Burger Artisan Trufado', category: 'Burgers & Grill', barcode: '7891028300011', systemStock: 45, countedStock: 42, unitCost: 16.50 },
    { productId: 'prod-2', productName: 'Batata Rústica com Cheddar', category: 'Acompanhamentos', barcode: '7891028300028', systemStock: 60, countedStock: 60, unitCost: 8.00 },
    { productId: 'prod-3', productName: 'Craft IPA Beer 500ml', category: 'Bebidas & Chopp', barcode: '7891028300035', systemStock: 120, countedStock: 118, unitCost: 9.00 },
    { productId: 'prod-4', productName: 'Cheesecake Frutas Vermelhas', category: 'Sobremesas', barcode: '7891028300042', systemStock: 18, countedStock: 18, unitCost: 7.50 },
    { productId: 'prod-5', productName: 'Coca-Cola Zero 350ml', category: 'Bebidas & Chopp', barcode: '7891028300059', systemStock: 150, countedStock: 145, unitCost: 3.20 }
  ]);

  countedItemsCount = computed(() => {
    return this.auditList().filter(i => i.countedStock !== null).length;
  });

  accuracyPercent = computed(() => {
    const list = this.auditList().filter(i => i.countedStock !== null);
    if (list.length === 0) return 100;
    const exact = list.filter(i => i.countedStock === i.systemStock).length;
    return (exact / list.length) * 100;
  });

  totalDivergentItems = computed(() => {
    return this.auditList().filter(i => i.countedStock !== null && i.countedStock !== i.systemStock).length;
  });

  totalDivergenceCost = computed(() => {
    return this.auditList()
      .filter(i => i.countedStock !== null)
      .reduce((sum, i) => sum + ((i.countedStock! - i.systemStock) * i.unitCost), 0);
  });

  toggleBlindMode() {
    this.isBlindMode.update(v => !v);
    this.ecosystem.notify(
      this.isBlindMode() ? 'Modo de Contagem Cega ATIVADO (Saldos prévios ocultos p/ auditoria).' : 'Modo de Contagem Aberto ativado.',
      'info'
    );
  }

  toggleStockFreeze() {
    this.isStockFrozen.update(v => !v);
    this.ecosystem.notify(
      this.isStockFrozen() ? 'Movimentações de estoque congeladas p/ auditoria!' : 'Estoque descongelado.',
      'info'
    );
  }

  updateCountedStock(productId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const val = input.value !== '' ? Number(input.value) : null;
    this.auditList.update(list =>
      list.map(i => i.productId === productId ? { ...i, countedStock: val } : i)
    );
  }

  startNewAuditSession() {
    this.auditList.update(list => list.map(i => ({ ...i, countedStock: null })));
    this.ecosystem.notify('Sessão de auditoria de estoque reiniciada.', 'info');
  }

  openAdjustmentModal() {
    this.showAdjustmentModal.set(true);
  }

  applyErpAdjustment(reason: string, notes: string) {
    for (const item of this.auditList()) {
      if (item.countedStock !== null && item.countedStock !== item.systemStock) {
        this.ecosystem.products.update(prods =>
          prods.map(p => p.id === item.productId ? { ...p, stock: item.countedStock! } : p)
        );
      }
    }

    this.ecosystem.logAudit(
      'Ajuste de Auditoria de Estoque',
      'OS Client',
      `Recalibragem realizada por auditoria cega: ${this.totalDivergentItems()} itens ajustados. Motivo: "${reason}". Notes: "${notes || 'N/A'}"`,
      'info'
    );

    this.showAdjustmentModal.set(false);
    this.ecosystem.notify('Estoque ERP recalibrado com sucesso com registro de auditoria e governança!', 'success');
  }
}
