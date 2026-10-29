import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export type DocSection = 'tripartite' | 'modules' | 'delivery' | 'permissions' | 'compliance';

@Component({
  selector: 'app-hq-documentation-modal',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[140] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div class="bg-[#faf7f0] border-2 border-[#d6c7b0] rounded-3xl max-w-4xl w-full p-6 text-stone-950 shadow-2xl max-h-[90vh] flex flex-col space-y-5 animate-in zoom-in-95">
        
        <!-- MODAL HEADER -->
        <div class="flex justify-between items-start pb-4 border-b border-[#e8dfce] shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-900 text-amber-100 flex items-center justify-center font-bold shadow-md shrink-0">
              <mat-icon class="text-2xl">menu_book</mat-icon>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[9px] font-mono bg-amber-900 text-amber-100 px-2 py-0.5 rounded font-bold uppercase">
                  Documentação Oficial do SaaS
                </span>
                <span class="text-[9px] font-mono text-stone-500 font-bold uppercase">
                  v3.2.0 HQ CENTRAL
                </span>
              </div>
              <h2 class="text-xl font-serif font-black text-stone-950 mt-1">Manual Executivo HQ Central (Painel do Dono do App)</h2>
            </div>
          </div>

          <button
            type="button"
            (click)="dismiss.emit()"
            class="text-stone-400 hover:text-stone-800 p-2 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- SECTION NAVIGATION TABS -->
        <div class="flex items-center gap-2 border-b border-[#e8dfce] pb-2 overflow-x-auto no-scrollbar shrink-0 text-xs font-bold">
          <button
            type="button"
            (click)="activeSection.set('tripartite')"
            [class]="activeSection() === 'tripartite' ? 'bg-amber-900 text-white shadow' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'"
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5">
            <mat-icon class="text-sm">account_tree</mat-icon>
            <span>1. Arquitetura Tripartite</span>
          </button>

          <button
            type="button"
            (click)="activeSection.set('modules')"
            [class]="activeSection() === 'modules' ? 'bg-amber-900 text-white shadow' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'"
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5">
            <mat-icon class="text-sm">view_module</mat-icon>
            <span>2. Módulos do HQ Central</span>
          </button>

          <button
            type="button"
            (click)="activeSection.set('delivery')"
            [class]="activeSection() === 'delivery' ? 'bg-amber-900 text-white shadow' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'"
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5">
            <mat-icon class="text-sm">local_shipping</mat-icon>
            <span>3. Regras de Delivery</span>
          </button>

          <button
            type="button"
            (click)="activeSection.set('permissions')"
            [class]="activeSection() === 'permissions' ? 'bg-amber-900 text-white shadow' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'"
            class="px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5">
            <mat-icon class="text-sm">security</mat-icon>
            <span>4. Matriz de Permissões</span>
          </button>
        </div>

        <!-- TAB CONTENT VIEWPORT -->
        <div class="flex-1 overflow-y-auto pr-1 text-xs space-y-4 font-sans text-stone-800 leading-relaxed custom-scrollbar">
          
          @switch (activeSection()) {
            @case ('tripartite') {
              <div class="space-y-3">
                <div class="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-1">
                  <h3 class="font-serif font-black text-sm text-amber-950 uppercase flex items-center gap-2">
                    <mat-icon class="text-amber-800">account_tree</mat-icon>
                    <span>Segregação das 3 Esferas do Ecossistema</span>
                  </h3>
                  <p class="text-stone-700 leading-relaxed">
                    O ecossistema 3EATCRU é dividido estritamente em 3 esferas independentes para impedir contaminação de papéis e assegurar governança do negócio:
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div class="bg-white p-4 rounded-2xl border border-[#e8dfce] space-y-2 shadow-sm">
                    <div class="flex items-center gap-2 text-rose-900 font-serif font-black uppercase text-xs">
                      <mat-icon class="text-rose-700">admin_panel_settings</mat-icon>
                      <span>1. HQ Central (Dono)</span>
                    </div>
                    <p class="text-stone-600 text-[11px] leading-snug">
                      Painel do proprietário da plataforma SaaS. Controla contratos, provisiona filiais, retém o split de 8%, gerencia os 4 APKs Android e monitora a infraestrutura.
                    </p>
                  </div>

                  <div class="bg-white p-4 rounded-2xl border border-[#e8dfce] space-y-2 shadow-sm">
                    <div class="flex items-center gap-2 text-amber-900 font-serif font-black uppercase text-xs">
                      <mat-icon class="text-amber-700">storefront</mat-icon>
                      <span>2. Store OS (Lojista / Empresa)</span>
                    </div>
                    <p class="text-stone-600 text-[11px] leading-snug">
                      Sistema operacional comercial da loja. Frente de caixa (PDV), comanda de salão, KDS da cozinha, gestão de estoque ERP e livro-caixa local.
                    </p>
                  </div>

                  <div class="bg-white p-4 rounded-2xl border border-[#e8dfce] space-y-2 shadow-sm">
                    <div class="flex items-center gap-2 text-emerald-900 font-serif font-black uppercase text-xs">
                      <mat-icon class="text-emerald-700">public</mat-icon>
                      <span>3. Consumidor (Público)</span>
                    </div>
                    <p class="text-stone-600 text-[11px] leading-snug">
                      Marketplace Regional (/regional) com busca geodésica GPS e Vitrine Pública da Loja (/p/:id) para pedidos online e agendamento.
                    </p>
                  </div>
                </div>
              </div>
            }

            @case ('modules') {
              <div class="space-y-3">
                <div class="bg-white p-4 rounded-2xl border border-[#e8dfce] space-y-2">
                  <h4 class="font-serif font-black text-amber-950 uppercase text-xs">Módulos Principais do HQ Central</h4>
                  <ul class="list-disc pl-5 space-y-1.5 text-stone-700">
                    <li><strong>Portfólio de Lojas:</strong> Provisionamento on-demand de unidades com escolha de plano, CNPJ e contrato de comissão.</li>
                    <li><strong>Frota MDM &amp; Dispositivos:</strong> Pareamento de terminais POS touch com comando de reinício/bloqueio remoto e ping geodésico GPS para entregadores.</li>
                    <li><strong>Console de Auditoria Mobile (APKs):</strong> Emulador em tempo real dos 4 aplicativos Android nativos.</li>
                    <li><strong>Tesouraria &amp; Split (8%):</strong> Contabilidade em tempo real do GMV e cálculo de repasse líquido para as lojas.</li>
                    <li><strong>Portal Regional:</strong> Gerenciamento da capa do Marketplace, anúncio de destaque com selo <span class="font-mono font-bold text-amber-900">🏆 NO CENTRAL</span> e raio de busca.</li>
                    <li><strong>Infraestrutura &amp; Audit Trail:</strong> Monitoramento de throughput do banco de dados, broadcast global e trilha fiscal de auditoria.</li>
                  </ul>
                </div>
              </div>
            }

            @case ('delivery') {
              <div class="space-y-3">
                <div class="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                  <h4 class="font-serif font-black text-amber-950 uppercase text-xs">Regras de Entrega (Lojista Decide)</h4>
                  <p class="text-stone-700 leading-relaxed">
                    Cada lojista credenciado no ecossistema possui autonomia no Store OS para parametrizar suas regras de logística:
                  </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div class="bg-white p-3.5 rounded-2xl border border-[#e8dfce] space-y-1">
                    <div class="font-bold text-stone-900">1. Pedido Mínimo (R$)</div>
                    <p class="text-stone-600 text-[11px]">
                      Valor mínimo em produtos necessário para aceitar entrega (ex: R$ 25,00). O checkout valida e bloqueia compras abaixo do mínimo.
                    </p>
                  </div>

                  <div class="bg-white p-3.5 rounded-2xl border border-[#e8dfce] space-y-1">
                    <div class="font-bold text-stone-900">2. Taxa de Delivery (R$)</div>
                    <p class="text-stone-600 text-[11px]">
                      Valor cobrado do cliente pela entrega (ex: R$ 5,00 ou R$ 0,00 para Entrega Grátis).
                    </p>
                  </div>

                  <div class="bg-white p-3.5 rounded-2xl border border-[#e8dfce] space-y-1">
                    <div class="font-bold text-stone-900">3. Operação de Frota</div>
                    <p class="text-stone-600 text-[11px]">
                      Escolha entre 🛵 <strong>Frota Própria da Loja</strong> (motoboys internos) ou ⚡ <strong>Frota Parceira 3EAT</strong> (despacho via App do Motorista).
                    </p>
                  </div>
                </div>
              </div>
            }

            @case ('permissions') {
              <div class="space-y-3">
                <div class="bg-white p-4 rounded-2xl border border-[#e8dfce] overflow-x-auto">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="border-b border-stone-200 font-mono font-bold text-stone-500 uppercase text-[10px]">
                        <th class="py-2 px-3">PERFIL</th>
                        <th class="py-2 px-3">ROTA</th>
                        <th class="py-2 px-3">ESCOPO DE PERMISSÃO</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100 font-mono">
                      <tr>
                        <td class="py-2 px-3 font-bold text-rose-900">Dono do App (HQ)</td>
                        <td class="py-2 px-3 text-stone-600">/hq</td>
                        <td class="py-2 px-3 text-stone-800 font-sans">Acesso total irrestrito: governança, comissões, MDM e infraestrutura.</td>
                      </tr>
                      <tr>
                        <td class="py-2 px-3 font-bold text-amber-900">Lojista (Empresa)</td>
                        <td class="py-2 px-3 text-stone-600">/os</td>
                        <td class="py-2 px-3 text-stone-800 font-sans">Operação da loja: PDV, KDS, Salão, Estoque e Gerenciador da Vitrine.</td>
                      </tr>
                      <tr>
                        <td class="py-2 px-3 font-bold text-emerald-900">Consumidor Final</td>
                        <td class="py-2 px-3 text-stone-600">/regional e /p/:id</td>
                        <td class="py-2 px-3 text-stone-800 font-sans">Navegação pública, busca por raio GPS, sacola e pedido online.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            }
          }

        </div>

        <!-- FOOTER ACTIONS -->
        <div class="pt-3 border-t border-[#e8dfce] flex justify-between items-center shrink-0">
          <span class="text-[10px] font-mono text-stone-500">
            Documentação sincronizada com o arquivo /HQ_CENTRAL_DOCUMENTATION.md
          </span>

          <button
            type="button"
            (click)="dismiss.emit()"
            class="bg-amber-900 hover:bg-amber-950 text-white font-bold px-5 py-2 rounded-xl text-xs shadow cursor-pointer">
            Entendido
          </button>
        </div>

      </div>
    </div>
  `
})
export class HqDocumentationModalComponent {
  dismiss = output<void>();
  readonly activeSection = signal<DocSection>('tripartite');
}

