import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { LicensePlan } from '../../models/ecosystem.model';

@Component({
  selector: 'app-hq-plans-pricing',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6 text-stone-200">
      
      <!-- HEADER BANNER -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black shadow-md">
            <mat-icon class="text-2xl">payments</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-serif font-black text-lg text-white">Governança de Planos &amp; Preços de Licenciamento SaaS</h2>
              <span class="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded font-bold uppercase">
                HQ CONTROLE TOTAL
              </span>
            </div>
            <p class="text-xs text-stone-400 mt-0.5">Defina a mensalidade, limite de terminais MDM e módulos inclusos para cada tier de assinatura do ecossistema.</p>
          </div>
        </div>
      </div>

      <!-- PLANS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (plan of ecosystem.licensePlans(); track plan.id) {
          <div class="bg-[#170b04] border-2 border-[#4d2813] rounded-3xl p-6 space-y-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-amber-600/20 text-amber-400 font-mono text-[10px] font-black px-4 py-1.5 rounded-bl-2xl border-l border-b border-amber-600/40 uppercase">
              {{ plan.id }}
            </div>

            <div class="space-y-3">
              <div>
                <h3 class="font-serif font-black text-xl text-white">{{ plan.name }}</h3>
                <p class="text-stone-400 text-xs mt-1 leading-relaxed">{{ plan.description }}</p>
              </div>

              <!-- PRICE INPUT EDITOR -->
              <div class="bg-[#261308] border border-[#4d2813] p-4 rounded-2xl space-y-2">
                <span class="text-[10px] font-mono font-bold text-stone-400 uppercase block">Mensalidade SaaS (R$)</span>
                <div class="flex items-center gap-2">
                  <span class="text-amber-400 font-black text-lg">R$</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    [value]="plan.priceMonthly"
                    (input)="onPriceChange(plan.id, $any($event.target).value)"
                    class="w-full bg-[#140b05] border border-amber-600/50 rounded-xl px-3 py-2 text-white font-mono font-black text-lg focus:outline-none focus:border-amber-400">
                  <span class="text-stone-500 text-xs font-mono">/mês</span>
                </div>
              </div>

              <!-- SPEC LIST -->
              <div class="space-y-2 pt-2">
                <div class="flex items-center justify-between text-xs font-mono border-b border-[#3d200f] pb-2">
                  <span class="text-stone-400">Limite Terminais MDM:</span>
                  <strong class="text-amber-300 font-bold">{{ plan.maxDevices }} Terminais</strong>
                </div>
                <span class="text-[10px] font-mono font-bold text-stone-400 uppercase block pt-1">Módulos Inclusos:</span>
                <ul class="space-y-1.5 font-sans text-xs text-stone-300">
                  @for (mod of plan.includedModules; track mod) {
                    <li class="flex items-center gap-2">
                      <mat-icon class="text-emerald-400 text-sm">check_circle</mat-icon>
                      <span>{{ mod }}</span>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <button
              type="button"
              (click)="savePlan(plan)"
              class="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black py-3 rounded-2xl shadow-lg border border-amber-400/50 text-xs uppercase tracking-wider transition-all cursor-pointer">
              Salvar Alterações do Plano
            </button>
          </div>
        }
      </div>

    </div>
  `
})
export class HqPlansPricingComponent {
  readonly ecosystem = inject(EcosystemService);

  onPriceChange(planId: string, val: string) {
    const num = parseFloat(val);
    if (!isNaN(num)) {
      this.ecosystem.updatePlanPrice(planId, num);
    }
  }

  savePlan(plan: LicensePlan) {
    this.ecosystem.updatePlanPrice(plan.id, plan.priceMonthly);
  }
}
