import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-system-mode-banner',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div [class]="mode() === 'real' ? 'bg-[#152319] border-emerald-800/80 text-emerald-200' : 'bg-[#2a1b0a] border-amber-600/80 text-amber-200'"
      class="border rounded-2xl p-3 sm:p-4 shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
      
      <div class="flex items-center gap-3">
        <div [class]="mode() === 'real' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-amber-500/20 text-amber-400 border-amber-500/50'"
          class="p-2 rounded-xl border flex items-center justify-center shrink-0">
          <mat-icon class="text-lg">{{ mode() === 'real' ? 'verified' : 'science' }}</mat-icon>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <span class="font-bold uppercase tracking-wider text-[11px]">
              AMBIENTE ATUAL: {{ mode() === 'real' ? 'PRODUÇÃO REAL (ONLINE)' : 'SIMULAÇÃO & SANDBOX ATIVO' }}
            </span>
            <span [class]="mode() === 'real' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'"
              class="px-2 py-0.5 rounded text-[10px] font-bold">
              {{ mode() === 'real' ? 'DADOS REAIS PERSISTIDOS' : 'DADOS ISOLADOS (-SIM)' }}
            </span>
          </div>
          <p class="text-[11px] opacity-80 mt-0.5">
            {{ mode() === 'real' 
              ? 'Modo Produção Real: Vendas gravam no Livro-Razão real, baixam estoque e permanecem salvas na loja.' 
              : 'Modo Simulação: Pedidos e rotas gerados para testes com marcação [-SIM], sem afetar os dados reais da loja.' }}
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
        @if (mode() === 'simulation') {
          <button
            type="button"
            (click)="generateSimBatch()"
            class="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] transition-all cursor-pointer shadow">
            <mat-icon class="text-sm">bolt</mat-icon>
            <span>+ 5 Pedidos Teste</span>
          </button>

          <button
            type="button"
            (click)="clearSimData()"
            class="bg-rose-950/80 hover:bg-rose-900 border border-rose-700/80 text-rose-200 font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] transition-all cursor-pointer">
            <mat-icon class="text-sm">delete_sweep</mat-icon>
            <span>Limpar Testes</span>
          </button>
        }

        <button
          type="button"
          (click)="toggleMode()"
          [class]="mode() === 'real' ? 'bg-emerald-950 hover:bg-emerald-900 border-emerald-600 text-emerald-300' : 'bg-amber-950 hover:bg-amber-900 border-amber-500 text-amber-300'"
          class="border font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-[11px] transition-all cursor-pointer">
          <mat-icon class="text-sm">sync_alt</mat-icon>
          <span>Alternar para {{ mode() === 'real' ? 'Modo Simulação' : 'Modo Produção Real' }}</span>
        </button>
      </div>
    </div>
  `
})
export class SystemModeBannerComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly mode = this.ecosystem.sandboxEngine.activeExecutionMode;

  toggleMode() {
    const newMode = this.ecosystem.sandboxEngine.toggleExecutionMode();
    this.ecosystem.notify(
      newMode === 'real' 
        ? 'Modo Mudar para PRODUÇÃO REAL: Todas as operações afetam dados oficiais.' 
        : 'Modo Mudar para SIMULAÇÃO (SANDBOX): Ambiente de testes e cenários isolado.',
      newMode === 'real' ? 'success' : 'warning'
    );
  }

  generateSimBatch() {
    const currentTenant = this.ecosystem.tenants().find(t => t.id === this.ecosystem.currentTenantId()) || this.ecosystem.tenants()[0];
    const products = this.ecosystem.products().filter(p => p.tenantId === currentTenant.id);
    const drivers = this.ecosystem.drivers().filter(d => d.tenantId === currentTenant.id);

    const generated = this.ecosystem.sandboxEngine.generateSimulatedBatch(currentTenant, products, drivers, 5);
    // Expose simulated batch in orders list tagged as simulation
    this.ecosystem.orders.update(orders => [...generated, ...orders]);
    for (const sim of generated) {
      this.ecosystem.financials.update(fins => [
        {
          id: `fin-sim-${sim.id}`,
          date: 'Simulação (Agora)',
          type: 'sale',
          category: 'Simulação Sandbox',
          description: `[SIMULAÇÃO] Pedido Teste #${sim.orderNumber}`,
          amount: sim.total,
          paymentMethod: sim.paymentMethod.toUpperCase(),
          referenceId: sim.id,
          isSimulated: true,
          mode: 'simulation'
        },
        ...fins
      ]);
    }
    this.ecosystem.notify(`Gerados ${generated.length} pedidos em simulação para a loja ${currentTenant.name}.`, 'info');
  }

  clearSimData() {
    this.ecosystem.clearSimulationData();
    this.ecosystem.notify('Dados da simulação limpos com sucesso! O ecossistema está limpo.', 'success');
  }
}
