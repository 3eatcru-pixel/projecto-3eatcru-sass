import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EcosystemService } from '../../services/ecosystem.service';
import { CustomerProfile } from '../../models/ecosystem.model';

export type RFMSegment = 'all' | 'vip' | 'frequent' | 'risk' | 'new';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-crm-window',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#140b05] text-stone-200 font-sans selection:bg-indigo-600 selection:text-white">
      
      <!-- SUB-HEADER BAR -->
      <div class="bg-[#0f0703] border-b border-[#32170a] p-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-700 to-indigo-900 text-white flex items-center justify-center font-black shadow-lg">
            <mat-icon>loyalty</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-serif font-black text-base text-white">Hub de Fidelidade, Cashback &amp; CRM WhatsApp</h2>
              <span class="bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                Retenção Ativa
              </span>
            </div>
            <p class="text-xs text-stone-400">Engajamento de clientes, atribuição de pontos de fidelidade, cashback e disparo de ofertas direcionadas.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="showNewCustomerModal.set(true)"
            class="bg-[#241207] hover:bg-[#32170a] text-indigo-300 border border-[#42200f] font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow transition-all">
            <mat-icon class="text-sm">person_add</mat-icon>
            <span>+ Novo Cliente</span>
          </button>

          <button
            type="button"
            (click)="openNewCampaignModal()"
            class="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all">
            <mat-icon class="text-sm">campaign</mat-icon>
            <span>+ Nova Campanha</span>
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT WORKSPACE -->
      <div class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
        
        <!-- TOP SUMMARY KPI METRICS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[#1f0e06] border border-[#3f1f0e] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-indigo-400 block uppercase font-bold">Base Total de Clientes</span>
            <strong class="text-2xl font-serif font-black text-white">{{ totalCustomers() }} Clientes</strong>
            <span class="text-[10px] text-stone-400 block mt-1">Sincronizados com PDV &amp; Web</span>
          </div>

          <div class="bg-[#1f0e06] border border-[#3f1f0e] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-indigo-400 block uppercase font-bold">Clientes VIP (Champions)</span>
            <strong class="text-2xl font-serif font-black text-emerald-400">{{ vipCustomersCount() }} VIPs</strong>
            <span class="text-[10px] text-stone-400 block mt-1">Ticket médio e pontuação alta</span>
          </div>

          <div class="bg-[#1f0e06] border border-[#3f1f0e] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-indigo-400 block uppercase font-bold">Pontos Circulantes</span>
            <strong class="text-2xl font-serif font-black text-indigo-300 font-mono">{{ totalLoyaltyPointsInCirculation() }} pts</strong>
            <span class="text-[10px] text-stone-400 block mt-1">Disponíveis para resgate</span>
          </div>

          <div class="bg-[#1f0e06] border border-[#3f1f0e] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-indigo-400 block uppercase font-bold">Crédito em Loja Total</span>
            <strong class="text-2xl font-serif font-black text-amber-400 font-mono">R$ {{ totalStoreCreditInCirculation().toFixed(2) }}</strong>
            <span class="text-[10px] text-stone-400 block mt-1">Cashback retido nas contas</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- LEFT: CUSTOMERS TABLE & RFM FILTER (8 COLS) -->
          <div class="lg:col-span-8 space-y-4">
            <div class="bg-[#1a0c05] border border-[#3a1b0b] rounded-3xl p-5 shadow-2xl space-y-4">
              
              <!-- FILTER TABS & SEARCH -->
              <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#2e1509]">
                <div class="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  <button
                    type="button"
                    (click)="selectedSegment.set('all')"
                    [class]="selectedSegment() === 'all' ? 'bg-indigo-600 text-white font-bold' : 'bg-[#120803] text-stone-400 border border-[#2e1509] hover:text-white'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap">
                    Todos ({{ totalCustomers() }})
                  </button>

                  <button
                    type="button"
                    (click)="selectedSegment.set('vip')"
                    [class]="selectedSegment() === 'vip' ? 'bg-indigo-600 text-white font-bold' : 'bg-[#120803] text-stone-400 border border-[#2e1509] hover:text-white'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap">
                    VIPs ⭐ ({{ vipCustomersCount() }})
                  </button>

                  <button
                    type="button"
                    (click)="selectedSegment.set('frequent')"
                    [class]="selectedSegment() === 'frequent' ? 'bg-indigo-600 text-white font-bold' : 'bg-[#120803] text-stone-400 border border-[#2e1509] hover:text-white'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap">
                    Frequentes ({{ frequentCustomersCount() }})
                  </button>

                  <button
                    type="button"
                    (click)="selectedSegment.set('risk')"
                    [class]="selectedSegment() === 'risk' ? 'bg-indigo-600 text-white font-bold' : 'bg-[#120803] text-stone-400 border border-[#2e1509] hover:text-white'"
                    class="px-3 py-1.5 rounded-xl text-xs transition-all cursor-pointer whitespace-nowrap">
                    Em Risco ⚠️ ({{ riskCustomersCount() }})
                  </button>
                </div>

                <div class="relative w-full sm:w-48">
                  <input
                    type="text"
                    [value]="searchQuery()"
                    (input)="searchQuery.set($any($event.target).value)"
                    placeholder="Buscar por nome ou CPF..."
                    class="w-full bg-[#100703] border border-[#3f1f0e] rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-indigo-500 font-medium">
                </div>
              </div>

              <!-- CUSTOMERS LIST TABLE -->
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="text-[10px] font-mono font-bold uppercase text-stone-400 border-b border-[#2e1509]">
                      <th class="py-2.5 px-3">CLIENTE &amp; CONTATO</th>
                      <th class="py-2.5 px-3 text-center">SEGMENTO</th>
                      <th class="py-2.5 px-3 text-right">PONTOS</th>
                      <th class="py-2.5 px-3 text-right">CASHBACK</th>
                      <th class="py-2.5 px-3 text-right">AÇÕES</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#231006]">
                    @for (c of filteredCustomers(); track c.id) {
                      <tr class="hover:bg-[#261208] transition-colors">
                        <td class="py-3 px-3">
                          <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-xl bg-indigo-950 border border-indigo-700/60 text-indigo-300 flex items-center justify-center font-black text-sm uppercase shrink-0">
                              {{ c.name.charAt(0) }}
                            </div>
                            <div>
                              <div class="font-bold text-white text-xs">{{ c.name }}</div>
                              <div class="text-[10px] font-mono text-stone-400">{{ c.phone }} • CPF: {{ c.cpf || 'Não informado' }}</div>
                            </div>
                          </div>
                        </td>

                        <td class="py-3 px-3 text-center">
                          <span [class]="getCustomerBadgeClass(c)" class="border px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">
                            {{ getCustomerSegmentLabel(c) }}
                          </span>
                        </td>

                        <td class="py-3 px-3 text-right font-mono font-black text-indigo-300 text-sm">
                          {{ c.loyaltyPoints }} pts
                        </td>

                        <td class="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm">
                          R$ {{ c.storeCredit.toFixed(2) }}
                        </td>

                        <td class="py-3 px-3 text-right">
                          <button
                            type="button"
                            (click)="openAdjustModal(c)"
                            class="bg-[#241207] hover:bg-[#35190b] text-indigo-300 border border-[#42200f] font-bold px-2.5 py-1 rounded-xl text-[11px] cursor-pointer shadow transition-all">
                            Ajustar Saldo
                          </button>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="5" class="py-8 text-center text-stone-400 font-serif italic text-xs">
                          Nenhum cliente encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          <!-- RIGHT: CAMPAIGNS & AUTOMATION FLOWS (4 COLS) -->
          <div class="lg:col-span-4 space-y-4">
            
            <!-- ACTIVE MARKETING CAMPAIGNS -->
            <div class="bg-[#1a0c05] border border-[#3a1b0b] rounded-3xl p-5 shadow-2xl space-y-4">
              <div class="flex justify-between items-center border-b border-[#2e1509] pb-3">
                <h3 class="font-serif font-black text-white text-sm flex items-center gap-1.5">
                  <mat-icon class="text-indigo-400 text-base">campaign</mat-icon> Campanhas Disparadas
                </h3>
                <span class="text-[10px] font-mono text-stone-400 font-bold uppercase">
                  {{ ecosystem.marketingCampaigns().length }} criadas
                </span>
              </div>

              <div class="space-y-3">
                @for (camp of ecosystem.marketingCampaigns(); track camp.id) {
                  <div class="bg-[#120803] border border-[#2e1509] rounded-2xl p-3.5 space-y-2">
                    <div class="flex justify-between items-start">
                      <div class="font-bold text-white text-xs">{{ camp.title }}</div>
                      <span [class]="camp.status === 'active' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-stone-900 text-stone-400 border-stone-800'" class="border px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                        {{ camp.status === 'active' ? 'Enviada' : camp.status }}
                      </span>
                    </div>

                    <div class="flex justify-between items-center text-[10px] text-stone-400 font-mono">
                      <div>Canal: <strong class="text-stone-200 capitalize">{{ camp.platform }}</strong></div>
                      <div>Alcance: <strong class="text-indigo-300">{{ camp.reach }}</strong></div>
                      <div>Conversões: <strong class="text-emerald-400">{{ camp.conversions }}</strong></div>
                    </div>

                    @if (camp.status !== 'active') {
                      <button
                        type="button"
                        (click)="dispatchCampaign(camp.id)"
                        class="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-1.5 rounded-xl text-[10px] uppercase cursor-pointer shadow transition-all flex items-center justify-center gap-1">
                        <mat-icon class="text-xs">send</mat-icon>
                        <span>Disparar para Clientes</span>
                      </button>
                    }
                  </div>
                } @empty {
                  <div class="text-center py-6 text-stone-400 font-serif italic text-xs">
                    Nenhuma campanha registrada. Clique em "+ Nova Campanha" para iniciar um disparo em massa.
                  </div>
                }
              </div>
            </div>

            <!-- AUTOMATED WHATSAPP TRIGGERS -->
            <div class="bg-[#1a0c05] border border-[#3a1b0b] rounded-3xl p-5 shadow-2xl space-y-3">
              <h3 class="font-serif font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-[#2e1509] pb-2">
                <mat-icon class="text-indigo-400 text-sm">auto_fix_high</mat-icon> Gatilhos de Automação
              </h3>

              <div class="space-y-2.5 text-xs">
                <div class="bg-[#120803] p-3 rounded-2xl border border-[#2e1509] flex items-center justify-between">
                  <div>
                    <div class="font-bold text-white text-[11px]">Bônus de Boas-Vindas</div>
                    <div class="text-[10px] text-stone-400">Credita 50 pts no primeiro pedido.</div>
                  </div>
                  <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">ATIVO</span>
                </div>

                <div class="bg-[#120803] p-3 rounded-2xl border border-[#2e1509] flex items-center justify-between">
                  <div>
                    <div class="font-bold text-white text-[11px]">Cupom de Aniversário</div>
                    <div class="text-[10px] text-stone-400">Notifica via WhatsApp no mês de aniversário.</div>
                  </div>
                  <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">ATIVO</span>
                </div>

                <div class="bg-[#120803] p-3 rounded-2xl border border-[#2e1509] flex items-center justify-between">
                  <div>
                    <div class="font-bold text-white text-[11px]">Alerta de Sumiço (+30 dias)</div>
                    <div class="text-[10px] text-stone-400">Oferta especial de reativação de inativos.</div>
                  </div>
                  <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">ATIVO</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <!-- MODAL CADASTRO NOVO CLIENTE -->
      @if (showNewCustomerModal()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <mat-icon class="text-indigo-700">person_add</mat-icon> Cadastrar Cliente no CRM
              </h3>
              <button type="button" (click)="showNewCustomerModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold cursor-pointer">✕</button>
            </div>

            <form [formGroup]="customerForm" (ngSubmit)="onSaveCustomer()" class="space-y-3 text-xs font-sans">
              <div>
                <label for="cNameInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Nome Completo</label>
                <input id="cNameInput" formControlName="name" type="text" placeholder="Ex: Ana Clara Souza" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-medium">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="cCpfInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">CPF</label>
                  <input id="cCpfInput" formControlName="cpf" type="text" placeholder="000.111.222-33" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <label for="cPhoneInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">WhatsApp</label>
                  <input id="cPhoneInput" formControlName="phone" type="text" placeholder="(11) 99887-6655" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
              </div>

              <div>
                <label for="cEmailInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">E-mail</label>
                <input id="cEmailInput" formControlName="email" type="email" placeholder="cliente@email.com" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-medium">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="cPointsInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Pontos Iniciais</label>
                  <input id="cPointsInput" formControlName="loyaltyPoints" type="number" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <label for="cCreditInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Crédito Inicial (R$)</label>
                  <input id="cCreditInput" formControlName="storeCredit" type="number" step="1.0" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
              </div>

              <div class="flex gap-3 pt-4 border-t border-[#e8dfce]">
                <button type="button" (click)="showNewCustomerModal.set(false)" class="flex-1 bg-[#ebdcc7] text-stone-800 font-bold py-3 rounded-xl border border-[#d6c3aa] text-xs">Cancelar</button>
                <button type="submit" class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase cursor-pointer">Cadastrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL AJUSTE DE SALDO E CASHBACK -->
      @if (selectedCustomerForAdjust()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <div>
                <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                  <mat-icon class="text-indigo-700">stars</mat-icon> Ajustar Saldo / Cashback
                </h3>
                <span class="text-xs text-stone-600 font-bold">{{ selectedCustomerForAdjust()?.name }}</span>
              </div>
              <button type="button" (click)="selectedCustomerForAdjust.set(null)" class="text-stone-400 hover:text-stone-800 font-bold cursor-pointer">✕</button>
            </div>

            <div class="space-y-4 text-xs font-sans">
              <div class="bg-[#ebdcc7] p-3 rounded-2xl flex justify-between font-mono font-bold">
                <div>Pontos Atuais: <span class="text-indigo-900">{{ selectedCustomerForAdjust()?.loyaltyPoints }} pts</span></div>
                <div>Cashback Atual: <span class="text-amber-900">R$ {{ selectedCustomerForAdjust()?.storeCredit?.toFixed(2) }}</span></div>
              </div>

              <div>
                <label for="adjTypeSelect" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Tipo de Operação</label>
                <select
                  id="adjTypeSelect"
                  #adjType
                  class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-bold cursor-pointer">
                  <option value="points_add">+ Adicionar Pontos de Fidelidade</option>
                  <option value="points_sub">- Reduzir Pontos (Resgate Manual)</option>
                  <option value="credit_add">+ Conceder Cashback / Crédito em Loja</option>
                  <option value="credit_sub">- Abater Crédito em Loja</option>
                </select>
              </div>

              <div>
                <label for="adjAmountInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Valor / Quantidade</label>
                <input
                  id="adjAmountInput"
                  #adjVal
                  type="number"
                  placeholder="Ex: 50"
                  class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono font-bold">
              </div>

              <div>
                <label for="adjReasonInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Motivo do Ajuste</label>
                <input
                  id="adjReasonInput"
                  #adjReason
                  type="text"
                  placeholder="Ex: Cortesia de Atendimento / Bônus Especial"
                  class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-medium">
              </div>

              <div class="flex gap-3 pt-4 border-t border-[#e8dfce]">
                <button type="button" (click)="selectedCustomerForAdjust.set(null)" class="flex-1 bg-[#ebdcc7] text-stone-800 font-bold py-3 rounded-xl border border-[#d6c3aa] text-xs">Cancelar</button>
                <button
                  type="button"
                  (click)="submitAdjust(adjType.value, +adjVal.value, adjReason.value)"
                  class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase cursor-pointer">
                  Confirmar Ajuste
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- MODAL NOVA CAMPANHA MARKETING -->
      @if (showNewCampaignModal()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <mat-icon class="text-indigo-700">campaign</mat-icon> Criar Nova Campanha CRM
              </h3>
              <button type="button" (click)="showNewCampaignModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold cursor-pointer">✕</button>
            </div>

            <form [formGroup]="campaignForm" (ngSubmit)="onSaveCampaign()" class="space-y-3 text-xs font-sans">
              <div>
                <label for="campTitleInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Título da Campanha</label>
                <input id="campTitleInput" formControlName="title" type="text" placeholder="Ex: Cupom de 20% OFF do Fim de Semana" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-bold">
              </div>

              <div>
                <label for="campPlatformInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Canal de Disparo</label>
                <select id="campPlatformInput" formControlName="platform" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-bold cursor-pointer">
                  <option value="whatsapp">📱 WhatsApp Marketing Direct</option>
                  <option value="instagram">📸 Instagram Direct / DM</option>
                  <option value="email">✉️ E-mail Marketing</option>
                </select>
              </div>

              <div class="flex gap-3 pt-4 border-t border-[#e8dfce]">
                <button type="button" (click)="showNewCampaignModal.set(false)" class="flex-1 bg-[#ebdcc7] text-stone-800 font-bold py-3 rounded-xl border border-[#d6c3aa] text-xs">Cancelar</button>
                <button type="submit" class="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase cursor-pointer">Criar Campanha</button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
  `]
})
export class CrmWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  private readonly fb = inject(FormBuilder);

  readonly selectedSegment = signal<RFMSegment>('all');
  readonly searchQuery = signal<string>('');
  readonly showNewCustomerModal = signal<boolean>(false);
  readonly showNewCampaignModal = signal<boolean>(false);
  readonly selectedCustomerForAdjust = signal<CustomerProfile | null>(null);

  readonly customerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    cpf: [''],
    phone: ['', [Validators.required]],
    email: [''],
    loyaltyPoints: [50, [Validators.min(0)]],
    storeCredit: [0, [Validators.min(0)]]
  });

  readonly campaignForm: FormGroup = this.fb.group({
    title: ['', [Validators.required]],
    platform: ['whatsapp', [Validators.required]]
  });

  readonly totalCustomers = computed(() => this.ecosystem.customers().length);

  readonly vipCustomers = computed(() =>
    this.ecosystem.customers().filter(c => c.loyaltyPoints >= 200 || c.storeCredit >= 30)
  );
  readonly vipCustomersCount = computed(() => this.vipCustomers().length);

  readonly frequentCustomers = computed(() =>
    this.ecosystem.customers().filter(c => c.loyaltyPoints >= 80 && c.loyaltyPoints < 200)
  );
  readonly frequentCustomersCount = computed(() => this.frequentCustomers().length);

  readonly riskCustomers = computed(() =>
    this.ecosystem.customers().filter(c => c.loyaltyPoints < 80)
  );
  readonly riskCustomersCount = computed(() => this.riskCustomers().length);

  readonly totalLoyaltyPointsInCirculation = computed(() =>
    this.ecosystem.customers().reduce((sum, c) => sum + (c.loyaltyPoints || 0), 0)
  );

  readonly totalStoreCreditInCirculation = computed(() =>
    this.ecosystem.customers().reduce((sum, c) => sum + (c.storeCredit || 0), 0)
  );

  readonly filteredCustomers = computed(() => {
    let list = this.ecosystem.customers();
    const seg = this.selectedSegment();
    const q = this.searchQuery().trim().toLowerCase();

    if (seg === 'vip') {
      list = this.vipCustomers();
    } else if (seg === 'frequent') {
      list = this.frequentCustomers();
    } else if (seg === 'risk') {
      list = this.riskCustomers();
    }

    if (q) {
      list = list.filter(c => c.name.toLowerCase().includes(q) || (c.cpf && c.cpf.includes(q)) || c.phone.includes(q));
    }

    return list;
  });

  getCustomerSegmentLabel(c: CustomerProfile): string {
    if (c.loyaltyPoints >= 200 || c.storeCredit >= 30) return 'VIP Champion';
    if (c.loyaltyPoints >= 80) return 'Frequente';
    return 'Em Risco';
  }

  getCustomerBadgeClass(c: CustomerProfile): string {
    if (c.loyaltyPoints >= 200 || c.storeCredit >= 30) return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    if (c.loyaltyPoints >= 80) return 'bg-indigo-950 text-indigo-300 border-indigo-800';
    return 'bg-amber-950 text-amber-300 border-amber-800';
  }

  openAdjustModal(customer: CustomerProfile) {
    this.selectedCustomerForAdjust.set(customer);
  }

  submitAdjust(type: string, val: number, reason: string) {
    const cust = this.selectedCustomerForAdjust();
    if (!cust || !val || val <= 0) {
      this.ecosystem.notify('Informe um valor válido para o ajuste.', 'warning');
      return;
    }

    const r = reason || 'Ajuste manual de saldo CRM';

    if (type === 'points_add') {
      this.ecosystem.addLoyaltyPoints(cust.id, val, r);
    } else if (type === 'points_sub') {
      this.ecosystem.addLoyaltyPoints(cust.id, -val, r);
    } else if (type === 'credit_add') {
      this.ecosystem.addStoreCredit(cust.id, val, r);
    } else if (type === 'credit_sub') {
      this.ecosystem.addStoreCredit(cust.id, -val, r);
    }

    this.selectedCustomerForAdjust.set(null);
  }

  onSaveCustomer() {
    if (this.customerForm.valid) {
      this.ecosystem.addCustomer(this.customerForm.value);
      this.customerForm.reset({ loyaltyPoints: 50, storeCredit: 0 });
      this.showNewCustomerModal.set(false);
    }
  }

  openNewCampaignModal() {
    this.campaignForm.reset({ platform: 'whatsapp' });
    this.showNewCampaignModal.set(true);
  }

  onSaveCampaign() {
    if (this.campaignForm.valid) {
      this.ecosystem.createMarketingCampaign({
        title: this.campaignForm.value.title,
        platform: this.campaignForm.value.platform,
        status: 'scheduled'
      });
      this.showNewCampaignModal.set(false);
    }
  }

  dispatchCampaign(id: string) {
    this.ecosystem.dispatchCampaign(id);
  }
}
