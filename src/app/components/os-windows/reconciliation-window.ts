import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

export interface ReconciliationItem {
  id: string;
  txDate: string;
  source: 'TEF_CARD' | 'PIX_API' | 'IFOOD_PAY' | 'CASH_REGISTER' | 'SAAS_PLATFORM';
  adquirerName: string; // Stone, PagBank, Cielo, Banco Itaú PJ, iFood
  grossAmount: number;
  expectedRatePercent: number;
  contractFeeAmount: number;
  effectiveFeeAmount: number;
  netAmountToReceive: number;
  status: 'matched' | 'divergent' | 'pending_settlement' | 'disputed';
  discrepancyNote?: string;
  settlementBatchId?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-reconciliation-window',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-stone-200 font-sans select-none">
      
      <!-- TOP NAVIGATION BAR & METRICS -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-[#180b04] border border-[#4d2813] p-4 rounded-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
            <mat-icon class="text-xl">swap_horiz</mat-icon>
          </div>
          <div>
            <h2 class="font-serif font-black text-lg text-white">Reconciliação Financeira & Adquirentes</h2>
            <p class="text-[10px] text-stone-400 font-mono">Cruzamento TEF, Extrato Bancário PJ, Taxas MDR, Pix API e Repasses iFood</p>
          </div>
        </div>

        <!-- STATS BADGES -->
        <div class="flex items-center gap-2 text-xs font-mono">
          <div class="bg-[#2a160b] border border-[#4d2813] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span class="text-stone-400">Total Transacionado:</span>
            <strong class="text-emerald-400 font-bold">R$ {{ totalGrossValue().toFixed(2) }}</strong>
          </div>
          <div class="bg-[#2a160b] border border-[#4d2813] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span class="text-stone-400">Divergências:</span>
            <strong class="text-rose-400 font-bold">{{ divergentCount() }} Caso(s)</strong>
          </div>
        </div>
      </div>

      <!-- FILTER TABS & QUICK ACTIONS -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#3d200f] pb-2 text-xs font-bold">
        <div class="flex items-center gap-1 bg-[#211006] p-1 border border-[#3d200f] rounded-xl">
          <button
            type="button"
            (click)="selectedFilter.set('all')"
            [class]="selectedFilter() === 'all' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
            Todas
          </button>
          <button
            type="button"
            (click)="selectedFilter.set('divergent')"
            [class]="selectedFilter() === 'divergent' ? 'bg-rose-600 text-white shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1">
            <mat-icon class="text-xs">warning</mat-icon> Divergências
          </button>
          <button
            type="button"
            (click)="selectedFilter.set('pending_settlement')"
            [class]="selectedFilter() === 'pending_settlement' ? 'bg-amber-600 text-stone-950 shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
            A Liquidar
          </button>
          <button
            type="button"
            (click)="selectedFilter.set('matched')"
            [class]="selectedFilter() === 'matched' ? 'bg-emerald-600 text-white shadow' : 'text-stone-400 hover:text-stone-200'"
            class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
            Conciliadas
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="importBankFeed()"
            class="bg-[#2a160b] hover:bg-[#3d200f] border border-[#4d2813] text-amber-300 px-3 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5">
            <mat-icon class="text-sm">file_download</mat-icon>
            <span>Importar Extrato OFX/Bank Feed</span>
          </button>
          <button
            type="button"
            (click)="reconcileAllPending()"
            class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-bold px-3 py-2 rounded-xl text-xs cursor-pointer shadow flex items-center gap-1.5">
            <mat-icon class="text-sm">check_circle</mat-icon>
            <span>Liquidador Automático em Lote</span>
          </button>
        </div>
      </div>

      <!-- MAIN TABLE: RECONCILIATION AUDIT LOG -->
      <div class="flex-1 bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-3">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="text-stone-400 border-b border-[#3d200f] font-mono text-[10px] uppercase">
              <th class="py-2">Data / Hora</th>
              <th class="py-2">Origem / Canal</th>
              <th class="py-2">Adquirente / Banco</th>
              <th class="py-2">Valor Bruto</th>
              <th class="py-2">Taxa Acordada vs Cobrada</th>
              <th class="py-2">Líquido Repassado</th>
              <th class="py-2">Status Auditado</th>
              <th class="py-2">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#2d170a]">
            @for (item of filteredItems(); track item.id) {
              <tr class="hover:bg-[#221207]">
                <td class="py-2.5 font-mono text-stone-300 text-[11px]">{{ item.txDate }}</td>
                <td class="py-2.5 font-bold text-white flex items-center gap-1.5">
                  <mat-icon class="text-sm text-amber-400">{{ getSourceIcon(item.source) }}</mat-icon>
                  <span>{{ getSourceLabel(item.source) }}</span>
                </td>
                <td class="py-2.5 text-stone-300 font-medium">{{ item.adquirerName }}</td>
                <td class="py-2.5 font-mono text-white font-bold">R$ {{ item.grossAmount.toFixed(2) }}</td>
                <td class="py-2.5 font-mono text-[11px]">
                  <span class="text-stone-400">{{ item.expectedRatePercent }}%</span>
                  <span class="text-stone-500 mx-1">&rarr;</span>
                  <span [class.text-rose-400]="item.effectiveFeeAmount > item.contractFeeAmount" class="font-bold">
                    R$ {{ item.effectiveFeeAmount.toFixed(2) }}
                  </span>
                </td>
                <td class="py-2.5 font-mono font-bold text-emerald-400">R$ {{ item.netAmountToReceive.toFixed(2) }}</td>
                <td class="py-2.5">
                  <span [class]="getStatusBadgeClass(item.status)" class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase">
                    {{ getStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="py-2.5">
                  @if (item.status === 'divergent') {
                    <button
                      type="button"
                      (click)="openDisputeModal(item)"
                      class="px-2.5 py-1 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold rounded-lg text-[10px] cursor-pointer">
                      Contestar Taxa
                    </button>
                  } @else if (item.status === 'pending_settlement') {
                    <button
                      type="button"
                      (click)="settleSingleItem(item.id)"
                      class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold rounded-lg text-[10px] cursor-pointer">
                      Confirmar Baixa
                    </button>
                  } @else {
                    <span class="text-[10px] text-stone-500 font-mono">Liquidado ✓</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- DISCREPANCY SUMMARY BANNER -->
      <div class="bg-[#2a160b] border border-[#4d2813] rounded-xl p-3 text-xs flex items-center justify-between text-stone-300">
        <div class="flex items-center gap-2">
          <mat-icon class="text-amber-400">info</mat-icon>
          <span>As baixas de títulos conciliados alimentam instantaneamente o DRE Gerencial do caixa e contabilidade.</span>
        </div>
        <span class="font-mono text-[10px] text-emerald-400 font-bold uppercase">Sincronização Ativa em Tempo Real</span>
      </div>

    </div>
  `
})
export class ReconciliationWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly selectedFilter = signal<'all' | 'divergent' | 'pending_settlement' | 'matched'>('all');

  readonly reconciliationItems = signal<ReconciliationItem[]>([
    {
      id: 'rec-1',
      txDate: 'Hoje 14:22',
      source: 'TEF_CARD',
      adquirerName: 'Stone Adquirente',
      grossAmount: 148.90,
      expectedRatePercent: 1.8,
      contractFeeAmount: 2.68,
      effectiveFeeAmount: 2.68,
      netAmountToReceive: 146.22,
      status: 'pending_settlement'
    },
    {
      id: 'rec-2',
      txDate: 'Hoje 12:45',
      source: 'PIX_API',
      adquirerName: 'Itaú PJ Bank Feed',
      grossAmount: 95.00,
      expectedRatePercent: 0.0,
      contractFeeAmount: 0.00,
      effectiveFeeAmount: 0.00,
      netAmountToReceive: 95.00,
      status: 'matched'
    },
    {
      id: 'rec-3',
      txDate: 'Hoje 11:30',
      source: 'IFOOD_PAY',
      adquirerName: 'Portal iFood Repasses',
      grossAmount: 230.00,
      expectedRatePercent: 12.0,
      contractFeeAmount: 27.60,
      effectiveFeeAmount: 34.50, // 15% cobrado indevidamente!
      netAmountToReceive: 195.50,
      status: 'divergent',
      discrepancyNote: 'Cobrança de comissão acima do contrato em +3% (Divergência R$ 6,90).'
    },
    {
      id: 'rec-4',
      txDate: 'Ontem 20:10',
      source: 'TEF_CARD',
      adquirerName: 'PagBank POS',
      grossAmount: 320.00,
      expectedRatePercent: 2.5,
      contractFeeAmount: 8.00,
      effectiveFeeAmount: 8.00,
      netAmountToReceive: 312.00,
      status: 'matched'
    },
    {
      id: 'rec-5',
      txDate: 'Ontem 18:00',
      source: 'SAAS_PLATFORM',
      adquirerName: 'Split SaaS 3EAT',
      grossAmount: 840.00,
      expectedRatePercent: 8.0,
      contractFeeAmount: 67.20,
      effectiveFeeAmount: 67.20,
      netAmountToReceive: 772.80,
      status: 'pending_settlement'
    }
  ]);

  totalGrossValue = computed(() => {
    return this.reconciliationItems().reduce((sum, item) => sum + item.grossAmount, 0);
  });

  divergentCount = computed(() => {
    return this.reconciliationItems().filter(i => i.status === 'divergent').length;
  });

  filteredItems = computed(() => {
    const f = this.selectedFilter();
    return this.reconciliationItems().filter(item => f === 'all' || item.status === f);
  });

  getSourceIcon(source: string): string {
    switch (source) {
      case 'TEF_CARD': return 'credit_card';
      case 'PIX_API': return 'qr_code_2';
      case 'IFOOD_PAY': return 'delivery_dining';
      case 'SAAS_PLATFORM': return 'hub';
      default: return 'payments';
    }
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'TEF_CARD': return 'Cartão TEF';
      case 'PIX_API': return 'Pix Dinâmico API';
      case 'IFOOD_PAY': return 'Repasse iFood';
      case 'SAAS_PLATFORM': return 'Marketplace 3EAT';
      default: return 'Dinheiro / Outro';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'matched': return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
      case 'divergent': return 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse';
      case 'pending_settlement': return 'bg-amber-950 text-amber-300 border border-amber-800';
      case 'disputed': return 'bg-purple-950 text-purple-300 border border-purple-800';
      default: return 'bg-stone-800 text-stone-300';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'matched': return 'Conciliado ✓';
      case 'divergent': return 'Divergência ⚠️';
      case 'pending_settlement': return 'A Liquidar';
      case 'disputed': return 'Em Contestação';
      default: return status;
    }
  }

  settleSingleItem(id: string) {
    this.reconciliationItems.update(list =>
      list.map(i => i.id === id ? { ...i, status: 'matched' } : i)
    );
    this.ecosystem.notify('Título conciliado e baixado no Contas a Receber!', 'success');
  }

  reconcileAllPending() {
    this.reconciliationItems.update(list =>
      list.map(i => i.status === 'pending_settlement' ? { ...i, status: 'matched' } : i)
    );
    this.ecosystem.notify('Liquidação em lote efetuada com sucesso para todas as transações pendentes!', 'success');
  }

  importBankFeed() {
    this.ecosystem.notify('Extrato Bancário OFX importado! 100% dos lançamentos de entrada cruzados com as vendas do PDV.', 'success');
  }

  openDisputeModal(item: ReconciliationItem) {
    this.ecosystem.notify(`Contestação aberta junto à adquirente (${item.adquirerName}) para a taxa divergente de R$ ${item.effectiveFeeAmount.toFixed(2)}.`, 'warning');
  }
}
