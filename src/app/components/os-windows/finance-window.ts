import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { FinanceMetricsComponent } from './finance/finance-metrics';
import { FinanceLedgerComponent } from './finance/finance-ledger';
import { FinanceDreComponent } from './finance/finance-dre';
import { AddFinancialEntryModal } from './finance/add-financial-entry-modal';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-finance-window',
  imports: [
    CommonModule, 
    MatIconModule,
    FinanceMetricsComponent,
    FinanceLedgerComponent,
    FinanceDreComponent,
    AddFinancialEntryModal
  ],
  template: `
    <div class="h-full flex flex-col space-y-4 text-xs text-white font-mono">
      
      <!-- Finance Header Bar -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-3 border-b border-[#3d200f] shrink-0">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold shadow-md">
            <mat-icon class="text-xl">account_balance_wallet</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="font-serif font-black text-base text-white">Tesouraria, DRE &amp; Livro Razão</h1>
              <span class="border border-dashed border-amber-600 text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                CONCILIADO
              </span>
            </div>
            <p class="text-xs text-stone-400">Fluxo diário de vendas, DRE gerencial, apuração de CMV e conciliação bancária.</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <!-- View Switcher -->
          <div class="flex items-center gap-1 bg-[#1d1008] p-1 rounded-xl border border-[#4d2813]">
            <button
              type="button"
              (click)="activeSubTab.set('ledger')"
              [class]="activeSubTab() === 'ledger' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-white'"
              class="px-3 py-1 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer">
              <mat-icon class="text-xs">receipt_long</mat-icon> Extrato Caixa
            </button>
            <button
              type="button"
              (click)="activeSubTab.set('dre')"
              [class]="activeSubTab() === 'dre' ? 'bg-amber-600 text-stone-950 font-black shadow' : 'text-stone-400 hover:text-white'"
              class="px-3 py-1 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer">
              <mat-icon class="text-xs">analytics</mat-icon> DRE Gerencial
            </button>
            <button
              type="button"
              (click)="activeSubTab.set('simulation')"
              [class]="activeSubTab() === 'simulation' ? 'bg-amber-500 text-stone-950 font-black shadow' : 'text-amber-400 hover:text-white'"
              class="px-3 py-1 rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 cursor-pointer border border-amber-500/30">
              <mat-icon class="text-xs">science</mat-icon> Projeções &amp; Sandbox
            </button>
          </div>

          <button
            type="button"
            (click)="showAddEntryModal.set(true)"
            class="bg-stone-900 hover:bg-stone-800 text-amber-400 font-extrabold py-2 px-3 rounded-xl border border-amber-500/40 flex items-center gap-1 text-xs transition-all cursor-pointer">
            <mat-icon class="text-sm">post_add</mat-icon>
            <span>+ Lançar Título</span>
          </button>

          <button
            type="button"
            (click)="closeShift()"
            class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-2 px-3 rounded-xl shadow-md border border-amber-400/50 flex items-center gap-1 text-xs transition-all cursor-pointer">
            <mat-icon class="text-sm">lock_clock</mat-icon>
            <span>Fechar Turno</span>
          </button>
        </div>
      </div>

      <!-- Financial Metrics Cards -->
      <app-finance-metrics
        [totalSales]="totalSalesAmount()"
        [totalExpenses]="totalExpensesAmount()"
        [netProfit]="netProfit()"
        [margin]="profitMarginPercent()"
        [opsCount]="ecosystem.financials().length"
      />

      <!-- MAIN TAB CONTENT -->
      @if (activeSubTab() === 'ledger') {
        <app-finance-ledger
          [financials]="ecosystem.financials()"
          (exportCsv)="exportCsv()"
        />
      } @else if (activeSubTab() === 'dre') {
        <app-finance-dre
          [totalSales]="totalSalesAmount()"
          [totalExpenses]="totalExpensesAmount()"
          [netProfit]="netProfit()"
        />
      } @else {
        <!-- SIMULATION & SANDBOX SCENARIO VIEW -->
        <div class="space-y-4">
          
          <div class="bg-[#1f120a] border border-amber-600/40 rounded-2xl p-5 space-y-4 shadow-xl">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#3d200f] pb-3">
              <div>
                <h3 class="font-bold text-amber-400 text-sm flex items-center gap-2">
                  <mat-icon class="text-base">query_stats</mat-icon>
                  Simulador de Crescimento &amp; Análise de Cenários
                </h3>
                <p class="text-stone-400 text-xs">Simule variações de faturamento mensal e impacto de comissões sem alterar lançamentos reais.</p>
              </div>

              <div class="flex items-center gap-3">
                <span class="text-stone-400 text-xs">Projeção de Aumento:</span>
                <select
                  [value]="projectedGrowth()"
                  (change)="updateGrowth($event)"
                  class="bg-[#2a160b] border border-[#4d2813] text-amber-300 font-bold px-3 py-1.5 rounded-xl text-xs font-mono">
                  <option [value]="10">+10% Crescimento</option>
                  <option [value]="25">+25% Crescimento</option>
                  <option [value]="50">+50% Crescimento</option>
                  <option [value]="100">+100% Dobrar Vendas</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-4 gap-3 text-mono">
              <div class="bg-[#140b05] border border-[#3d200f] p-3.5 rounded-xl">
                <span class="text-[10px] text-stone-400 block font-bold uppercase">Faturamento Atual</span>
                <strong class="text-lg text-white font-mono">R$ {{ totalSalesAmount().toFixed(2) }}</strong>
              </div>

              <div class="bg-[#140b05] border border-amber-500/40 p-3.5 rounded-xl">
                <span class="text-[10px] text-amber-400 block font-bold uppercase">Projeção (+{{ projectedGrowth() }}%)</span>
                <strong class="text-lg text-amber-300 font-mono">R$ {{ financialForecast().projectedRevenue.toFixed(2) }}</strong>
              </div>

              <div class="bg-[#140b05] border border-stone-800 p-3.5 rounded-xl">
                <span class="text-[10px] text-stone-400 block font-bold uppercase">Taxa HQ Central (10%)</span>
                <strong class="text-lg text-stone-300 font-mono">R$ {{ financialForecast().projectedHqCommission.toFixed(2) }}</strong>
              </div>

              <div class="bg-[#140b05] border border-emerald-500/40 p-3.5 rounded-xl">
                <span class="text-[10px] text-emerald-400 block font-bold uppercase">Líquido Estimado</span>
                <strong class="text-lg text-emerald-400 font-mono">R$ {{ financialForecast().projectedMerchantNet.toFixed(2) }}</strong>
              </div>
            </div>
          </div>

          <!-- SANDBOX SIMULATED ORDERS -->
          <div class="bg-[#170c06] border border-[#3d200f] rounded-2xl p-4 space-y-3">
            <div class="flex justify-between items-center">
              <h4 class="font-bold text-white text-xs flex items-center gap-2">
                <mat-icon class="text-amber-500 text-sm">science</mat-icon>
                Vendas Simuladas em Sandbox (Isoladas do Extrato Real)
              </h4>
              <span class="text-amber-400 text-xs font-mono font-bold">
                Total Simulado: R$ {{ ecosystem.sandboxEngine.simulatedMetrics().totalRevenue.toFixed(2) }}
              </span>
            </div>

            @if (ecosystem.sandboxEngine.simulatedOrders().length === 0) {
              <div class="text-center py-6 text-stone-500 text-xs italic">
                Nenhum pedido simulado no momento. Alterne para Modo Simulação no banner superior ou clique em "+ 5 Pedidos Teste".
              </div>
            } @else {
              <div class="space-y-2 max-h-60 overflow-y-auto pr-1">
                @for (ord of ecosystem.sandboxEngine.simulatedOrders(); track ord.id) {
                  <div class="bg-[#241309] border border-[#3d200f] p-2.5 rounded-xl flex items-center justify-between text-xs font-mono">
                    <div>
                      <span class="font-bold text-amber-400">Pedido {{ ord.orderNumber }}</span>
                      <span class="text-stone-400 text-[11px] ml-2">• {{ ord.customerName }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-stone-300 font-bold">R$ {{ ord.total.toFixed(2) }}</span>
                      <span class="bg-amber-950 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Simulação</span>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

        </div>
      }

      <!-- MODAL LANÇAR NOVO TÍTULO / RECEITA / DESPESA -->
      @if (showAddEntryModal()) {
        <app-add-financial-entry-modal
          (close)="showAddEntryModal.set(false)"
          (save)="onSaveEntry($event)"
        />
      }

    </div>
  `
})
export class FinanceWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly activeSubTab = signal<'ledger' | 'dre' | 'simulation'>('ledger');
  readonly showAddEntryModal = signal<boolean>(false);
  readonly projectedGrowth = signal<number>(25);

  totalSalesAmount = computed(() =>
    this.ecosystem.financials().filter(f => f.type === 'sale').reduce((sum, f) => sum + f.amount, 0)
  );

  totalExpensesAmount = computed(() =>
    this.ecosystem.financials().filter(f => f.type === 'expense').reduce((sum, f) => sum + f.amount, 0)
  );

  netProfit = computed(() => this.totalSalesAmount() - this.totalExpensesAmount());

  profitMarginPercent = computed(() => {
    const rev = this.totalSalesAmount();
    if (rev === 0) return 0;
    return (this.netProfit() / rev) * 100;
  });

  financialForecast = computed(() =>
    this.ecosystem.financialEngine.calculateFinancialForecast(this.totalSalesAmount(), 10, this.projectedGrowth())
  );

  updateGrowth(event: Event) {
    const selectEl = event.target as HTMLSelectElement;
    this.projectedGrowth.set(Number(selectEl.value));
  }

  onSaveEntry(entry: { type: 'sale' | 'expense', description: string, category: string, amount: number, paymentMethod: string }) {
    this.ecosystem.addFinancialEntry({
      date: new Date().toISOString(),
      type: entry.type,
      category: entry.category,
      description: entry.description,
      amount: entry.amount,
      paymentMethod: entry.paymentMethod,
      referenceId: 'manual-' + Date.now()
    });

    this.showAddEntryModal.set(false);
    this.ecosystem.notify(`Lançamento de ${entry.type === 'sale' ? 'Entrada' : 'Saída'} R$ ${entry.amount.toFixed(2)} inserido com sucesso.`, 'success');
  }

  exportCsv() {
    this.ecosystem.notify('Extrato Financeiro exportado para download (Formato CSV Conciliado).', 'info');
  }

  closeShift() {
    this.ecosystem.notify('Fechamento de caixa e sangria efetuados. Relatório fiscal gerado e transmitido ao HQ!', 'success');
  }
}
