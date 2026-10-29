import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EcosystemService } from '../services/ecosystem.service';
import { CompanyTenant } from '../models/ecosystem.model';
import { HqRegionalManagerComponent } from './hq/hq-regional-manager';
import { HqAppsPreviewComponent } from './hq/hq-apps-preview';
import { HqTenantGovernanceModalComponent } from './hq/hq-tenant-governance-modal';
import { HqDocumentationModalComponent } from './hq/hq-documentation-modal';
import { SystemModeBannerComponent } from './shared/system-mode-banner';
import { HqPlansPricingComponent } from './hq/hq-plans-pricing';

export type HQSubTab = 'tenants' | 'devices' | 'apps_preview' | 'ledger' | 'regional' | 'consumers' | 'audit' | 'system' | 'plans';

interface CommandItem {
  id: HQSubTab;
  label: string;
  icon: string;
  sub: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hq-central',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    HqRegionalManagerComponent,
    HqAppsPreviewComponent,
    HqTenantGovernanceModalComponent,
    HqDocumentationModalComponent,
    SystemModeBannerComponent,
    HqPlansPricingComponent
  ],
  host: {
    '(window:keydown)': 'onWindowKeydown($event)'
  },
  template: `
    <div class="min-h-screen bg-[#0e0805] text-stone-200 p-4 sm:p-8 font-sans selection:bg-amber-600 selection:text-white relative overflow-x-hidden">
      
      <!-- BACKGROUND CARBON TEXTURE -->
      <div class="absolute inset-0 pointer-events-none opacity-20 bg-carbon-pattern z-0"></div>

      <div class="max-w-7xl mx-auto space-y-6 relative z-10">
        
        <!-- HEADER COMMAND BANNER (SUPER ADMIN) -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none text-amber-500">
            <mat-icon class="text-[180px]">admin_panel_settings</mat-icon>
          </div>

          <div class="relative z-10">
            <div class="flex items-center gap-2 text-amber-500 font-serif font-black uppercase text-xs tracking-wider mb-2">
              <mat-icon class="text-base text-rose-500">verified_user</mat-icon>
              <span>HQ Central • Gabinete do Dono do App</span>
              <span class="border border-dashed border-rose-600/80 bg-rose-950/40 text-rose-300 px-2 py-0.5 rounded text-[10px] font-mono">ESTADO: DONO DO APP (SUPER ADMIN)</span>
            </div>

            <h1 class="text-3xl sm:text-5xl font-serif font-black tracking-tight text-white">
              HQ Central
            </h1>

            <p class="text-stone-400 text-xs sm:text-sm mt-2 font-serif max-w-2xl leading-relaxed">
              Painel de governança global e controle executivo do Dono do App. Gerencie todas as lojas cadastradas, split contábil de 8%, planos, frota MDM de hardware e motoristas, console de auditoria Android e o marketplace regional. O HQ Central é exclusivo do Dono do App e não se confunde com o OS de operação diária das lojas nem com a área pública dos consumidores.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3 relative z-10">
            <div class="bg-[#2a160b] border border-[#482814] px-4 py-2.5 rounded-xl text-center shadow-inner">
              <span class="text-[10px] text-stone-400 font-mono block font-bold uppercase">Malha Central</span>
              <span class="text-emerald-400 font-extrabold text-xs flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> {{ ecosystem.uptimePercent() }}% Online
              </span>
            </div>

            <button
              type="button"
              (click)="showDocModal.set(true)"
              class="bg-[#2b160b] hover:bg-[#361c10] text-amber-300 font-mono text-xs font-bold py-3.5 px-4 rounded-2xl border border-[#482814] flex items-center gap-2 cursor-pointer shadow">
              <mat-icon class="text-sm">menu_book</mat-icon>
              <span>Manual HQ</span>
            </button>

            <button
              type="button"
              (click)="showCommandPalette.set(true)"
              class="bg-[#2b160b] hover:bg-[#361c10] text-amber-400 font-mono text-xs font-bold py-3.5 px-4 rounded-2xl border border-[#482814] flex items-center gap-2 cursor-pointer shadow">
              <mat-icon class="text-sm">search</mat-icon>
              <span>Busca (Ctrl+K)</span>
            </button>

            <button
              type="button"
              (click)="openNewTenantModal()"
              class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-3.5 px-6 rounded-2xl shadow-xl border border-amber-400/50 flex items-center gap-2 text-xs transition-all active:scale-98 cursor-pointer">
              <mat-icon class="text-base">add_business</mat-icon>
              <span>Provisionar Loja</span>
            </button>
          </div>
        </div>

        <!-- EXECUTION MODE & SANDBOX ENGINE BANNER -->
        <app-system-mode-banner />

        <!-- QUICK EXECUTIVE METRICS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-4 shadow-lg text-stone-950">
            <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block mb-1">Portfólio de Lojas</span>
            <div class="text-2xl font-serif font-black text-stone-900">{{ ecosystem.totalActiveTenants() }} Unidades</div>
            <span class="text-[10px] text-emerald-700 font-bold">Taxa de Churn: 0.2%</span>
          </div>

          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-4 shadow-lg text-stone-950">
            <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block mb-1">Frota MDM Ativa</span>
            <div class="text-2xl font-serif font-black text-stone-900">
              {{ ecosystem.totalOnlineDevices() }} <span class="text-stone-500 text-sm font-normal">/ {{ ecosystem.devices().length }} Terminais</span>
            </div>
            <span class="text-[10px] text-cyan-700 font-bold">12 Comandos Remotos Hoje</span>
          </div>

          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-4 shadow-lg text-stone-950">
            <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block mb-1">Take da Plataforma (8%)</span>
            <div class="text-2xl font-serif font-black text-emerald-800">R$ {{ ecosystem.hqTotalCommissionRevenue().toFixed(2) }}</div>
            <span class="text-[10px] text-emerald-700 font-bold">Receita Bruta SaaS</span>
          </div>

          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-4 shadow-lg text-stone-950">
            <span class="text-[10px] font-mono font-bold text-amber-900 uppercase block mb-1">Sessões Ativas</span>
            <div class="text-2xl font-serif font-black text-stone-900">{{ ecosystem.activeSessionsCount() }} Usuários</div>
            <span class="text-[10px] text-emerald-700 font-bold">Latency: {{ ecosystem.avgLatencyMs() }}ms</span>
          </div>
        </div>

        <!-- MAIN CONTROL CENTER: SUB-TABS -->
        <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-3xl p-6 shadow-2xl space-y-6">
          
          <!-- SUB-TAB NAVIGATION -->
          <div class="flex items-center gap-2 border-b border-[#3d200f] pb-3 overflow-x-auto no-scrollbar">
            @for (tab of subTabs; track tab.id) {
              <button
                type="button"
                (click)="activeSubTab.set(tab.id)"
                [class]="activeSubTab() === tab.id ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-extrabold shadow' : 'bg-[#2b160b] text-stone-300 hover:text-white border border-[#482814]'"
                class="px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer font-bold whitespace-nowrap">
                <mat-icon class="text-sm">{{ tab.icon }}</mat-icon> {{ tab.label }}
              </button>
            }
          </div>

          <!-- TAB CONTENT: TENANTS -->
          @if (activeSubTab() === 'tenants') {
            <div class="space-y-4">
              <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#2b160b] border border-[#482814] p-4 rounded-2xl shadow-inner">
                <div>
                  <h3 class="font-serif font-black text-white text-base flex items-center gap-2">
                    <mat-icon class="text-amber-500">business</mat-icon>
                    <span>Lojas Credenciadas &amp; Portfólio Multi-Tenant</span>
                  </h3>
                  <p class="text-xs text-stone-400">Controle de licenças, status operacional e acesso remoto para suporte de unidade.</p>
                </div>

                <div class="flex items-center gap-3 w-full md:w-auto">
                  <input 
                    [value]="searchTenantQuery()" 
                    (input)="searchTenantQuery.set($any($event.target).value)"
                    type="text" 
                    placeholder="Filtrar por nome ou CNPJ..." 
                    class="bg-[#1a0e07] border border-[#4d2813] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 w-full md:w-64">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (tenant of filteredTenants(); track tenant.id) {
                  <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl text-stone-950 flex flex-col justify-between space-y-4 hover:border-amber-600 transition-all group">
                    <div class="space-y-2">
                      <div class="flex justify-between items-start">
                        <span class="text-[10px] font-mono bg-amber-900 text-amber-100 px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {{ tenant.badgeCategory || 'ESTABELECIMENTO' }}
                        </span>
                        <div class="flex items-center gap-1.5">
                           <span [class]="tenant.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500'" class="w-2 h-2 rounded-full"></span>
                           <span class="text-[10px] font-mono font-bold uppercase text-stone-600">{{ tenant.status }}</span>
                        </div>
                      </div>

                      <h4 class="font-serif font-black text-stone-950 text-lg leading-snug">{{ tenant.name }}</h4>
                      <p class="text-xs text-stone-600 line-clamp-2">{{ tenant.tagline || tenant.legalName }}</p>

                      <div class="text-[10px] font-mono text-stone-500 space-y-0.5 pt-1">
                        <div>CNPJ: <span class="font-bold">{{ tenant.cnpj }}</span></div>
                        <div>Plano: <span class="font-bold text-amber-800">{{ tenant.plan }}</span></div>
                      </div>
                    </div>

                    <div class="pt-3 border-t border-[#e8dfce] grid grid-cols-2 gap-2">
                      <button (click)="openTenantGovernance(tenant)" class="bg-amber-900 hover:bg-amber-950 text-white font-bold py-2 px-3 rounded-xl text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer shadow">
                        <mat-icon class="text-xs">tune</mat-icon> Governança &amp; Split
                      </button>
                      <button (click)="toggleTenantStatus(tenant)" [class]="tenant.status === 'active' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'" class="font-bold py-2 px-3 rounded-xl text-[10px] transition-all cursor-pointer border border-transparent">
                        {{ tenant.status === 'active' ? 'Suspender' : 'Ativar' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB CONTENT: PLANS & PRICING -->
          @if (activeSubTab() === 'plans') {
            <app-hq-plans-pricing />
          }

          <!-- TAB CONTENT: DEVICES (MDM) -->
          @if (activeSubTab() === 'devices') {
            <div class="space-y-4">
               <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl text-stone-950 space-y-4">
                 
                 <!-- TOP MDM HEADER & MODE TOGGLE -->
                 <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#e8dfce]">
                    <div>
                      <h3 class="font-serif font-black text-sm uppercase tracking-wider text-amber-900 flex items-center gap-2">
                        <mat-icon class="text-amber-700">developer_board</mat-icon>
                        <span>Monitoramento &amp; Governança MDM de Frota &amp; Hardware</span>
                      </h3>
                      <p class="text-[11px] text-stone-600">Supervisão de hardware físico (Terminais POS) e telemetria GPS em tempo real da Frota de Motoristas da Plataforma.</p>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <div class="bg-[#f0e4d0] p-1 rounded-xl border border-[#d6c3aa] flex items-center gap-1 text-[11px] font-bold">
                        <button
                          type="button"
                          (click)="mdmMode.set('terminals')"
                          [class]="mdmMode() === 'terminals' ? 'bg-amber-800 text-amber-50 shadow' : 'text-stone-700 hover:text-stone-950'"
                          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-mono">
                          <mat-icon class="text-xs">desktop_windows</mat-icon>
                          <span>Terminais Hardware ({{ ecosystem.devices().length }})</span>
                        </button>
                        <button
                          type="button"
                          (click)="mdmMode.set('drivers')"
                          [class]="mdmMode() === 'drivers' ? 'bg-amber-800 text-amber-50 shadow' : 'text-stone-700 hover:text-stone-950'"
                          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-mono">
                          <mat-icon class="text-xs">two_wheeler</mat-icon>
                          <span>Motoristas Plataforma MDM ({{ ecosystem.drivers().length }})</span>
                        </button>
                        <button
                          type="button"
                          (click)="mdmMode.set('routes')"
                          [class]="mdmMode() === 'routes' ? 'bg-amber-800 text-amber-50 shadow' : 'text-stone-700 hover:text-stone-950'"
                          class="px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 font-mono">
                          <mat-icon class="text-xs">alt_route</mat-icon>
                          <span>Rotas &amp; Logística Global ({{ ecosystem.deliveryRoutes().length }})</span>
                        </button>
                      </div>

                      @if (mdmMode() === 'terminals') {
                        <button (click)="showPairModalHq.set(true)" class="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-3 py-2 rounded-xl text-[10px] shadow cursor-pointer uppercase flex items-center gap-1.5">
                          <mat-icon class="text-xs">add_to_queue</mat-icon>
                          <span>Parear Terminal</span>
                        </button>
                      }
                    </div>
                 </div>

                 <!-- TENANT FILTER BAR -->
                 <div class="flex flex-wrap items-center justify-between gap-3 bg-[#f5ebd9] p-3 rounded-xl border border-[#e6d8be] text-xs">
                    <div class="flex items-center gap-2">
                      <mat-icon class="text-amber-800 text-sm">filter_list</mat-icon>
                      <span class="font-bold text-stone-800 uppercase text-[10px]">Filtrar Origem:</span>
                    </div>

                    <select
                      [value]="selectedDeviceTenantFilter()"
                      (change)="selectedDeviceTenantFilter.set($any($event.target).value)"
                      class="bg-white border border-[#d6c7b0] rounded-xl px-3 py-1.5 text-xs font-bold text-stone-900 focus:outline-none focus:border-amber-600 cursor-pointer">
                      <option value="all">Todas as Lojas &amp; Nó HQ Central</option>
                      <option value="hq">⚡ Infraestrutura Global HQ / Plataforma On-Demand</option>
                      @for (t of ecosystem.tenants(); track t.id) {
                        <option [value]="t.id">🏪 Unidade: {{ t.name }}</option>
                      }
                    </select>

                    <div class="text-[10px] font-mono text-stone-600 font-bold">
                      @if (mdmMode() === 'terminals') {
                        Mostrando: <span class="text-amber-900 font-black">{{ filteredDevices().length }}</span> / {{ ecosystem.devices().length }} terminais
                      } @else if (mdmMode() === 'drivers') {
                        Mostrando: <span class="text-amber-900 font-black">{{ filteredDriversMDM().length }}</span> / {{ ecosystem.drivers().length }} motoristas
                      } @else {
                        Mostrando: <span class="text-amber-900 font-black">{{ filteredRoutesMDM().length }}</span> / {{ ecosystem.deliveryRoutes().length }} rotas
                      }
                    </div>
                 </div>

                 <!-- TERMINALS HARDWARE TABLE -->
                 @if (mdmMode() === 'terminals') {
                   <div class="overflow-x-auto">
                     <table class="w-full text-left text-xs border-collapse font-sans">
                       <thead>
                         <tr class="text-[10px] font-mono font-bold uppercase text-amber-950/60 border-b-2 border-[#d0c2a8]">
                           <th class="py-2.5 px-3">DISPOSITIVO POS</th>
                           <th class="py-2.5 px-3">CATEGORIA / ORIGEM</th>
                           <th class="py-2.5 px-3 text-center">BATERIA</th>
                           <th class="py-2.5 px-3">STATUS MDM</th>
                           <th class="py-2.5 px-3 text-right">AÇÕES REMOTAS</th>
                         </tr>
                       </thead>
                       <tbody class="divide-y divide-[#e8dfce]">
                         @for (device of filteredDevices(); track device.id) {
                           <tr class="hover:bg-[#f2e8d5] transition-colors">
                             <td class="py-3 px-3">
                               <div class="font-bold text-stone-900 flex items-center gap-2">
                                 <mat-icon class="text-amber-800 text-sm">
                                   {{ device.type === 'tablet' ? 'tablet' : device.type === 'kiosk' ? 'kiosk' : 'desktop_windows' }}
                                 </mat-icon>
                                 <span>{{ device.deviceName }}</span>
                               </div>
                               <div class="font-mono text-[9px] text-stone-500 pl-6">{{ device.serialNumber }} • {{ device.location }}</div>
                             </td>
                             <td class="py-3 px-3 font-medium">
                               @if (device.tenantId === 'hq') {
                                 <span class="bg-amber-900 text-amber-200 border border-amber-700 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono shadow-sm inline-flex items-center gap-1">
                                   <mat-icon class="text-[10px]">security</mat-icon>
                                   <span>NÓ HQ CENTRAL</span>
                                 </span>
                               } @else {
                                 <span class="bg-stone-200 text-stone-800 border border-stone-300 px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1">
                                   <mat-icon class="text-[10px] text-amber-800">store</mat-icon>
                                   <span>LOJA: {{ getTenantName(device.tenantId) }}</span>
                                 </span>
                               }
                             </td>
                             <td class="py-3 px-3">
                                <div class="flex items-center justify-center gap-1 font-mono font-bold" [class.text-rose-600]="(device.batteryLevel ?? 100) < 20">
                                  <mat-icon class="text-sm">battery_full</mat-icon> {{ device.batteryLevel }}%
                                </div>
                             </td>
                             <td class="py-3 px-3">
                               <span [class]="device.status === 'online' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'" class="border px-2 py-0.5 rounded text-[9px] font-bold uppercase">{{ device.status }}</span>
                             </td>
                             <td class="py-3 px-3 text-right">
                               <div class="flex justify-end gap-1.5">
                                 <button (click)="ecosystem.restartDevice(device.id)" class="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer" title="Reiniciar Remoto"><mat-icon class="text-sm">refresh</mat-icon></button>
                                 <button (click)="ecosystem.lockDevice(device.id)" class="p-1.5 rounded-lg bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200 cursor-pointer" title="Bloquear Terminal"><mat-icon class="text-sm">lock</mat-icon></button>
                               </div>
                             </td>
                           </tr>
                         } @empty {
                           <tr>
                             <td colspan="5" class="py-8 text-center text-stone-500 font-serif italic text-xs">
                               Nenhum dispositivo encontrado para o filtro selecionado.
                             </td>
                           </tr>
                         }
                       </tbody>
                     </table>
                   </div>
                 }

                 <!-- PLATFORM DRIVERS MDM TELEMATICS TABLE -->
                 @if (mdmMode() === 'drivers') {
                   <div class="overflow-x-auto">
                     <table class="w-full text-left text-xs border-collapse font-sans">
                       <thead>
                         <tr class="text-[10px] font-mono font-bold uppercase text-amber-950/60 border-b-2 border-[#d0c2a8]">
                           <th class="py-2.5 px-3">MOTORISTA / DISPOSITIVO PWA</th>
                           <th class="py-2.5 px-3">VÍNCULO &amp; TIPO</th>
                           <th class="py-2.5 px-3">TELEMETRIA GPS &amp; ENDEREÇO</th>
                           <th class="py-2.5 px-3 text-center">BATERIA</th>
                           <th class="py-2.5 px-3 text-center">COMPLIANCE CNH</th>
                           <th class="py-2.5 px-3 text-right">COMANDOS MDM</th>
                         </tr>
                       </thead>
                       <tbody class="divide-y divide-[#e8dfce]">
                         @for (driver of filteredDriversMDM(); track driver.id) {
                           <tr class="hover:bg-[#f2e8d5] transition-colors">
                             <td class="py-3 px-3">
                               <div class="font-bold text-stone-900 flex items-center gap-2">
                                 <mat-icon class="text-amber-800 text-sm">
                                   {{ driver.vehicleType === 'bike' ? 'directions_bike' : driver.vehicleType === 'carro' ? 'directions_car' : 'two_wheeler' }}
                                 </mat-icon>
                                 <span>{{ driver.name }}</span>
                               </div>
                               <div class="font-mono text-[9px] text-stone-500 pl-6">
                                 {{ driver.deviceName || 'Dispositivo PWA 3EAT' }} • {{ driver.appVersion || 'v3.2.0' }}
                               </div>
                             </td>

                             <td class="py-3 px-3">
                               @if (driver.driverType === 'platform') {
                                 <span class="bg-purple-900 text-purple-100 border border-purple-700 px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono shadow-sm inline-flex items-center gap-1">
                                   <mat-icon class="text-[10px]">stars</mat-icon>
                                   <span>MOTORISTA PLATAFORMA (HQ)</span>
                                 </span>
                               } @else {
                                 <span class="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1">
                                   <mat-icon class="text-[10px]">store</mat-icon>
                                   <span>FROTA PRÓPRIA: {{ getTenantName(driver.tenantId || '') }}</span>
                                 </span>
                               }
                             </td>

                             <td class="py-3 px-3">
                               <div class="font-bold text-stone-900 flex items-center gap-1 text-[11px]">
                                 <mat-icon class="text-xs text-emerald-700">my_location</mat-icon>
                                 <span>{{ driver.currentLocationName || 'São Paulo - Centro' }}</span>
                               </div>
                               <div class="font-mono text-[9px] text-stone-500 pl-4">
                                 Ping: {{ driver.lastGpsPing || 'Agora mesmo' }}
                               </div>
                             </td>

                             <td class="py-3 px-3 text-center">
                               <div class="flex items-center justify-center gap-1 font-mono font-bold" [class.text-rose-600]="(driver.batteryLevel ?? 100) < 20">
                                 <mat-icon class="text-sm">battery_full</mat-icon> {{ driver.batteryLevel ?? 85 }}%
                               </div>
                             </td>

                             <td class="py-3 px-3 text-center">
                               @if (driver.complianceVerified) {
                                 <span class="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded text-[9px] font-black inline-flex items-center gap-1">
                                   <mat-icon class="text-[10px]">verified</mat-icon>
                                   <span>CNH REGULAR</span>
                                 </span>
                               } @else {
                                 <span class="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded text-[9px] font-bold">EM ANÁLISE</span>
                               }
                             </td>

                             <td class="py-3 px-3 text-right">
                               <div class="flex justify-end gap-1.5">
                                 <button
                                   (click)="pingDriverGps(driver)"
                                   class="p-1.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 cursor-pointer"
                                   title="Ping Geodésico GPS">
                                   <mat-icon class="text-sm">radar</mat-icon>
                                 </button>
                                 <button
                                   (click)="ecosystem.notify('Comando de atualização enviado para ' + driver.name, 'info')"
                                   class="p-1.5 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 hover:bg-emerald-200 cursor-pointer"
                                   title="Atualizar App Remoto">
                                   <mat-icon class="text-sm">system_update</mat-icon>
                                 </button>
                               </div>
                             </td>
                           </tr>
                         } @empty {
                           <tr>
                             <td colspan="6" class="py-8 text-center text-stone-500 font-serif italic text-xs">
                               Nenhum motorista registrado para a busca/filtro selecionado.
                             </td>
                           </tr>
                         }
                       </tbody>
                     </table>
                   </div>
                 }

                  <!-- PLATFORM ROUTES GLOBAL MONITORING TABLE -->
                  @if (mdmMode() === 'routes') {
                    <div class="overflow-x-auto">
                      <table class="w-full text-left text-xs border-collapse font-sans">
                        <thead>
                          <tr class="text-[10px] font-mono font-bold uppercase text-amber-950/60 border-b-2 border-[#d0c2a8]">
                            <th class="py-2.5 px-3">CÓDIGO DA ROTA</th>
                            <th class="py-2.5 px-3">LOJA DE ORIGEM</th>
                            <th class="py-2.5 px-3">MOTORISTA ATRIBUÍDO</th>
                            <th class="py-2.5 px-3">PARADAS / ENTREGAS</th>
                            <th class="py-2.5 px-3 text-center">DISTÂNCIA / TEMPO</th>
                            <th class="py-2.5 px-3 text-center">GANHO DRIVER</th>
                            <th class="py-2.5 px-3 text-right">STATUS DA ROTA</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-[#e8dfce]">
                          @for (route of filteredRoutesMDM(); track route.id) {
                            <tr class="hover:bg-[#f2e8d5] transition-colors">
                              <td class="py-3 px-3 font-mono font-black text-stone-900">
                                <div class="flex items-center gap-1.5">
                                  <mat-icon class="text-xs text-amber-800">route</mat-icon>
                                  <span>{{ route.routeCode }}</span>
                                </div>
                                <div class="text-[9px] text-stone-500 font-sans font-normal">{{ route.date }} • {{ route.timeWindow }}</div>
                              </td>

                              <td class="py-3 px-3">
                                <span class="bg-stone-200 text-stone-800 border border-stone-300 px-2 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-1">
                                  <mat-icon class="text-[10px] text-amber-800">store</mat-icon>
                                  <span>{{ getTenantName(route.tenantId) }}</span>
                                </span>
                              </td>

                              <td class="py-3 px-3">
                                @if (route.driverName) {
                                  <div class="font-bold text-stone-900 flex items-center gap-1">
                                    <mat-icon class="text-xs text-purple-700">two_wheeler</mat-icon>
                                    <span>{{ route.driverName }}</span>
                                  </div>
                                  <div class="text-[9px] text-stone-500 font-mono">{{ route.driverPhone || 'App 3EAT' }}</div>
                                } @else {
                                  <span class="text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded text-[9px] font-bold">
                                    Aguardando Motorista
                                  </span>
                                }
                              </td>

                              <td class="py-3 px-3">
                                <div class="font-bold text-stone-900">{{ route.waypoints.length }} paradas</div>
                                <div class="text-[9px] text-stone-500 truncate max-w-xs">
                                  {{ route.waypoints[0]?.address || 'Entrega local' }}
                                </div>
                              </td>

                              <td class="py-3 px-3 text-center font-mono">
                                <div class="font-black text-stone-900">{{ route.totalDistanceKm }} km</div>
                                <div class="text-[9px] text-stone-500">{{ route.estimatedDuration }}</div>
                              </td>

                              <td class="py-3 px-3 text-center font-mono font-black text-emerald-800">
                                R$ {{ route.totalEarnings.toFixed(2) }}
                              </td>

                              <td class="py-3 px-3 text-right">
                                <span
                                  [class]="route.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : route.status === 'in_progress' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : route.status === 'at_store' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-stone-200 text-stone-700 border-stone-300'"
                                  class="border px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                                  {{ route.status === 'completed' ? 'Concluída' : route.status === 'in_progress' ? 'Em Rota' : route.status === 'at_store' ? 'Na Loja' : route.status === 'accepted' ? 'Aceita' : 'Disponível' }}
                                </span>
                              </td>
                            </tr>
                          } @empty {
                            <tr>
                              <td colspan="7" class="py-8 text-center text-stone-500 font-serif italic text-xs">
                                Nenhuma rota de entrega encontrada para a unidade ou filtro selecionado.
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    </div>
                  }

               </div>
            </div>
          }

          <!-- TAB CONTENT: APPS MOBILE ANDROID AUDIT CONSOLE -->
          @if (activeSubTab() === 'apps_preview') {
            <app-hq-apps-preview></app-hq-apps-preview>
          }

          <!-- TAB CONTENT: LEDGER & SPLIT -->
          @if (activeSubTab() === 'ledger') {
            <div class="space-y-4 animate-in fade-in duration-500">
               <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl space-y-1">
                    <span class="text-[10px] font-mono font-bold text-amber-900 uppercase">GMV Total (Todas Lojas)</span>
                    <div class="text-3xl font-serif font-black text-stone-900">R$ {{ (ecosystem.hqPublicSalesTotal() * 12.5).toFixed(2) }}</div>
                    <p class="text-[10px] text-stone-500">Fluxo bruto transacionado no ecossistema.</p>
                 </div>
                 <div class="bg-emerald-900 border border-emerald-700 rounded-2xl p-5 shadow-xl text-white space-y-1">
                    <span class="text-[10px] font-mono font-bold text-emerald-300 uppercase">Comissão Acumulada (8%)</span>
                    <div class="text-3xl font-serif font-black">R$ {{ ecosystem.hqTotalCommissionRevenue().toFixed(2) }}</div>
                    <p class="text-[10px] text-emerald-400">Receita líquida da sua plataforma SaaS.</p>
                 </div>
                 <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl space-y-1">
                    <span class="text-[10px] font-mono font-bold text-amber-900 uppercase">Pendente de Repasse</span>
                    <div class="text-3xl font-serif font-black text-stone-900">R$ {{ (ecosystem.hqPublicSalesTotal() * 0.92).toFixed(2) }}</div>
                    <p class="text-[10px] text-stone-500">Valor a ser enviado às lojas via Split D+1.</p>
                 </div>
               </div>

               <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl text-stone-950">
                 <div class="flex justify-between items-center mb-4 border-b border-[#e8dfce] pb-2">
                    <h3 class="font-serif font-black text-sm uppercase tracking-wider text-amber-900">Livro-Razão Global & Splits Financeiros</h3>
                    <button (click)="ecosystem.notify('Relatório exportado para o Cloud Archive.', 'success')" class="text-[10px] font-bold bg-[#ebdcc7] px-3 py-1.5 rounded-xl border border-[#d6c3aa] hover:bg-[#decbb4] cursor-pointer">Exportar XLS</button>
                 </div>
                 <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="text-[10px] font-mono font-bold uppercase text-stone-400 border-b border-[#e8dfce]">
                          <th class="py-2 px-3">TRANS ID</th>
                          <th class="py-2 px-3">ESTABELECIMENTO</th>
                          <th class="py-2 px-3">CANAL</th>
                          <th class="py-2 px-3">AMBIENTE</th>
                          <th class="py-2 px-3">VALOR</th>
                          <th class="py-2 px-3 text-emerald-700">PLATAFORMA (8%)</th>
                          <th class="py-2 px-3 text-right">HORÁRIO</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[#e8dfce]/50">
                        @for (ord of ecosystem.orders(); track ord.id) {
                          @if (ord.channel !== 'POS') {
                            <tr class="hover:bg-[#f2e8d5]/30 transition-colors font-mono">
                              <td class="py-2.5 px-3 font-bold">#{{ ord.orderNumber }}</td>
                              <td class="py-2.5 px-3 text-stone-900 font-sans font-bold">{{ getTenantName(ord.tenantId) }}</td>
                              <td class="py-2.5 px-3"><span class="bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded text-[9px] font-bold">{{ ord.channel }}</span></td>
                              <td class="py-2.5 px-3">
                                @if (ord.isSimulated || ord.orderNumber.endsWith('-SIM')) {
                                  <span class="bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
                                    SIMULAÇÃO
                                  </span>
                                } @else {
                                  <span class="bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold">
                                    PRODUÇÃO REAL
                                  </span>
                                }
                              </td>
                              <td class="py-2.5 px-3 font-bold">R$ {{ ord.total.toFixed(2) }}</td>
                              <td class="py-2.5 px-3 text-emerald-700 font-black">R$ {{ (ord.total * ecosystem.hqCommissionRate()).toFixed(2) }}</td>
                              <td class="py-2.5 px-3 text-right text-stone-400 text-[10px]">{{ ord.createdAt | date:'dd/MM HH:mm' }}</td>
                            </tr>
                          }
                        }
                      </tbody>
                    </table>
                 </div>
               </div>
            </div>
          }

          <!-- TAB CONTENT: REGIONAL MARKETPLACE -->
          @if (activeSubTab() === 'regional') {
            <app-hq-regional-manager></app-hq-regional-manager>
          }

          <!-- TAB CONTENT: CRM GLOBAL -->
          @if (activeSubTab() === 'consumers') {
            <div class="space-y-4">
               <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl text-stone-950">
                  <div class="flex justify-between items-center mb-4">
                     <h3 class="font-serif font-black text-sm uppercase text-amber-900">Diretório Unificado de Consumidores (CRM)</h3>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left text-xs">
                      <thead>
                        <tr class="text-[10px] font-mono font-bold uppercase text-stone-400 border-b border-[#e8dfce]">
                          <th class="p-3">NOME DO CONSUMIDOR</th>
                          <th class="p-3">CADASTRO</th>
                          <th class="p-3">LTV (TOTAL GASTO)</th>
                          <th class="p-3">ÚLTIMO PEDIDO</th>
                          <th class="p-3 text-right">AÇÕES HQ</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-[#e8dfce]">
                        @for (cons of ecosystem.consumerAccounts(); track cons.id) {
                          <tr class="hover:bg-[#f2e8d5] transition-colors">
                            <td class="p-3">
                              <div class="font-bold">{{ cons.name }}</div>
                              <div class="text-[10px] text-stone-500">{{ cons.email }}</div>
                            </td>
                            <td class="p-3 text-stone-500 font-mono">{{ cons.registeredAt }}</td>
                            <td class="p-3 font-bold text-emerald-800">R$ {{ cons.totalSpent.toFixed(2) }}</td>
                            <td class="p-3 text-stone-600">{{ cons.totalOrders }} pedidos</td>
                            <td class="p-3 text-right">
                               <button (click)="ecosystem.notify('Perfil auditado com sucesso.', 'info')" class="text-amber-800 font-bold hover:underline">Auditar</button>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          }

          <!-- TAB CONTENT: SYSTEM INFRASTRUCTURE & CONFIG -->
          @if (activeSubTab() === 'system') {
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
              
              <!-- SYSTEM GOVERNANCE CONTROLS -->
              <div class="lg:col-span-4 space-y-6">
                 <div class="bg-[#2a160b] border border-[#482814] rounded-3xl p-5 shadow-2xl space-y-5">
                    <h3 class="font-serif font-black text-white text-base border-b border-[#4d2813] pb-2">Variáveis de Governança</h3>
                    
                    <div class="space-y-4">
                       <div class="space-y-1">
                          <label for="hqCommRate" class="text-[10px] font-mono font-bold text-amber-500 uppercase">Comissão Padrão da Plataforma (%)</label>
                          <div class="flex items-center gap-2">
                             <input id="hqCommRate" type="number" [value]="ecosystem.hqCommissionRate() * 100" (input)="updateCommission($event)" class="flex-1 bg-[#1a0e07] border border-[#4d2813] rounded-xl px-3 py-2 text-white font-mono font-bold focus:border-amber-500 outline-none">
                             <button (click)="ecosystem.notify('Taxa de comissão global atualizada.', 'warning')" class="bg-amber-600 p-2 rounded-xl text-stone-950"><mat-icon class="text-sm">save</mat-icon></button>
                          </div>
                       </div>

                       <div class="p-4 bg-rose-950/20 border border-rose-500/30 rounded-2xl space-y-2">
                          <div class="flex justify-between items-center">
                             <span class="text-xs font-bold text-rose-200">Modo Manutenção SaaS</span>
                             <button type="button" aria-label="Alternar Modo Manutenção" class="w-10 h-5 bg-stone-900 border border-stone-700 rounded-full relative cursor-pointer focus:outline-none" (click)="toggleMaintenanceMode()">
                                <div [class]="ecosystem.maintenanceMode() ? 'bg-rose-500 translate-x-5' : 'bg-stone-500 translate-x-0'" class="w-4 h-4 rounded-full absolute left-0.5 top-0.5 transition-all duration-300 shadow-sm"></div>
                             </button>
                          </div>
                          <p class="text-[9px] text-rose-400 uppercase leading-snug">Ao ativar, todos os terminais Store OS serão bloqueados para atualizações críticas.</p>
                       </div>

                       <div class="space-y-2">
                          <label for="globalBroadcastText" class="text-[10px] font-mono font-bold text-amber-500 uppercase">Broadcast Global (Mensagem Interna)</label>
                          <textarea id="globalBroadcastText" #broadcastArea placeholder="Digite um aviso para todos os lojistas..." class="w-full h-24 bg-[#1a0e07] border border-[#4d2813] rounded-xl p-3 text-xs text-white focus:border-amber-500 outline-none no-scrollbar"></textarea>
                          <button (click)="sendBroadcast(broadcastArea.value); broadcastArea.value = ''" class="w-full bg-[#3b1e0d] text-amber-400 font-black py-2 rounded-xl text-[10px] uppercase border border-amber-600/30 hover:bg-amber-900/40 transition-all">Disparar Broadcast</button>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- INFRASTRUCTURE MONITORING -->
              <div class="lg:col-span-8 space-y-6">
                 <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl p-6 shadow-2xl space-y-6 text-stone-900">
                    <div class="flex flex-wrap justify-between items-center border-b border-[#e8dfce] pb-3 gap-2">
                       <div class="flex flex-wrap items-center gap-2">
                          <h3 class="font-serif font-black text-base uppercase tracking-tight">Status da Infraestrutura & Cloud Master</h3>
                          <span class="border border-dashed border-amber-600/70 bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase">[MÉTRICAS SIMULADAS DE AMBIENTE / DEMO]</span>
                       </div>
                       <div class="flex items-center gap-2">
                          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span class="text-[10px] font-mono font-black uppercase text-emerald-700">Cluster 01 - São Paulo (Active)</span>
                       </div>
                    </div>

                    <!-- INFRA CHART REAL-TIME MONITORING -->
                    <div class="h-48 flex items-end justify-between gap-1.5 px-4 bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden relative group">
                       <div class="absolute inset-0 bg-graph-pattern opacity-5 pointer-events-none"></div>
                       @for (bar of infraStats(); track $index) {
                         <div [style.height.%]="bar" class="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 opacity-60 hover:opacity-100 transition-all rounded-t-sm group-hover:scale-y-105"></div>
                       }
                       <div class="absolute top-4 left-4 text-[10px] font-mono font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-1 rounded shadow-sm border border-emerald-200">Load Factor: {{ currentLoad() }}% Average</div>
                    </div>

                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                       <div class="space-y-1 text-center">
                          <span class="text-[9px] font-black text-stone-400 uppercase block">API Response</span>
                          <div class="text-xl font-serif font-black text-stone-900">{{ ecosystem.avgLatencyMs() }}ms</div>
                       </div>
                       <div class="space-y-1 text-center">
                          <span class="text-[9px] font-black text-stone-400 uppercase block">DB Throughput</span>
                          <div class="text-xl font-serif font-black text-stone-900">{{ dbThroughput() }}k rps</div>
                       </div>
                       <div class="space-y-1 text-center">
                          <span class="text-[9px] font-black text-stone-400 uppercase block">Storage Usage</span>
                          <div class="text-xl font-serif font-black text-stone-900">1.2 TB</div>
                       </div>
                       <div class="space-y-1 text-center">
                          <span class="text-[9px] font-black text-stone-400 uppercase block">Global Traffic</span>
                          <div class="text-xl font-serif font-black text-stone-900">{{ globalTraffic() }} GB/s</div>
                       </div>
                    </div>

                    <div class="bg-[#f5ebd9] border border-[#e6d8be] rounded-2xl p-4 flex items-center justify-between">
                       <div class="flex items-center gap-3">
                          <mat-icon class="text-amber-800">security</mat-icon>
                          <div class="text-xs">
                             <div class="font-bold text-stone-900 uppercase tracking-tighter">Certificados SSL & Segurança</div>
                             <div class="text-stone-600 font-medium">Validade: 342 dias restantes. Criptografia AES-256 habilitada.</div>
                          </div>
                       </div>
                       <mat-icon class="text-emerald-600">verified</mat-icon>
                    </div>
                 </div>
              </div>

            </div>
          }

          <!-- TAB CONTENT: AUDIT MASTER -->
          @if (activeSubTab() === 'audit') {
            <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-2xl p-5 shadow-xl text-stone-950 space-y-4">
               <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
                 <h3 class="font-serif font-black text-stone-900 text-sm uppercase flex items-center gap-2">
                    <mat-icon class="text-amber-800">security</mat-icon> Trilha de Auditoria Master
                 </h3>
                 <div class="flex items-center gap-3">
                    <button
                      (click)="ecosystem.runStructuralAuditOnBackend()"
                      [disabled]="ecosystem.systemAuditVerified()"
                      [class]="ecosystem.systemAuditVerified() ? 'bg-emerald-900/50 text-emerald-400 border-emerald-500/30' : 'bg-rose-950 text-rose-300 border-rose-600 hover:bg-rose-900'"
                      class="text-[10px] font-mono font-bold px-4 py-1.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer shadow-lg">
                      <mat-icon class="text-xs">{{ ecosystem.systemAuditVerified() ? 'verified' : 'fact_check' }}</mat-icon>
                      <span>{{ ecosystem.systemAuditVerified() ? 'SISTEMA INTEGRALMENTE AUDITADO' : 'EXECUTAR AUDITORIA GERAL DO ECOSSISTEMA' }}</span>
                    </button>
                    <span class="text-[9px] font-mono bg-stone-900 text-stone-100 px-2.5 py-1 rounded font-bold uppercase">Monitoramento Global</span>
                 </div>
               </div>

               @if (ecosystem.lastSystemAuditReport(); as report) {
                 <div class="p-4 rounded-2xl border transition-all" [class]="report.status === 'passed' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'">
                   <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
                     <div class="flex items-center gap-2">
                       <mat-icon class="text-lg" [class]="report.status === 'passed' ? 'text-emerald-700' : 'text-amber-700'">
                         {{ report.status === 'passed' ? 'verified' : 'warning' }}
                       </mat-icon>
                       <span class="font-bold text-xs uppercase font-mono">
                         Relatório Estrutural (Executado em {{ report.timestamp }})
                       </span>
                     </div>
                     <span class="text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded-lg border" [class]="report.status === 'passed' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' : 'bg-amber-100 border-amber-300 text-amber-900'">
                       {{ report.status === 'passed' ? '100% CONFORME (SEM APONTAMENTOS)' : 'COM APONTAMENTOS' }}
                     </span>
                   </div>

                   <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono mb-3">
                     <div class="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                       <span class="text-stone-500 block uppercase font-bold text-[9px]">Lojas Inspecionadas:</span>
                       <span class="font-black text-sm text-stone-900">{{ report.tenantsChecked }}</span>
                     </div>
                     <div class="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                       <span class="text-stone-500 block uppercase font-bold text-[9px]">Produtos no Catálogo:</span>
                       <span class="font-black text-sm text-stone-900">{{ report.productsChecked }}</span>
                     </div>
                     <div class="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                       <span class="text-stone-500 block uppercase font-bold text-[9px]">Pedidos Auditados:</span>
                       <span class="font-black text-sm text-stone-900">{{ report.ordersChecked }}</span>
                     </div>
                     <div class="bg-white/80 p-2.5 rounded-xl border border-stone-200">
                       <span class="text-stone-500 block uppercase font-bold text-[9px]">Consistência Contábil:</span>
                       <span class="font-black text-sm" [class.text-emerald-700]="report.ledgerConsistent" [class.text-rose-700]="!report.ledgerConsistent">
                         {{ report.ledgerConsistent ? 'LIVRO-RAZÃO OK' : 'DIVERGÊNCIA' }}
                       </span>
                     </div>
                   </div>

                   @if (report.issuesFound.length > 0) {
                     <div class="text-[11px] text-amber-950 space-y-1 bg-amber-100/70 p-3 rounded-xl border border-amber-200">
                       <div class="font-bold uppercase text-[9px] font-mono">Apontamentos estruturais encontrados:</div>
                       @for (issue of report.issuesFound; track $index) {
                         <div>• {{ issue }}</div>
                       }
                     </div>
                   } @else {
                     <div class="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                       <mat-icon class="text-sm">check_circle</mat-icon>
                       <span>Todas as lojas, produtos e transações no Livro-Razão estão matematicamente consistentes e em conformidade estrutural.</span>
                     </div>
                   }
                 </div>
               }

               <div class="overflow-x-auto">
                 <table class="w-full text-left text-[11px] border-separate border-spacing-y-1.5">
                   <thead>
                     <tr class="text-[10px] font-mono font-bold uppercase text-stone-400">
                       <th class="px-3">TIMESTAMP</th>
                       <th class="px-3">ORIGEM / USUÁRIO</th>
                       <th class="px-3">MÓDULO</th>
                       <th class="px-3">AÇÃO EXECUTADA</th>
                       <th class="px-3 text-right">RISCO</th>
                     </tr>
                   </thead>
                   <tbody>
                     @for (log of ecosystem.auditLogs(); track log.id) {
                       <tr class="bg-white/40 hover:bg-white/80 transition-colors">
                         <td class="py-2.5 px-3 font-mono text-stone-500 whitespace-nowrap">{{ log.timestamp }}</td>
                         <td class="py-2.5 px-3 font-bold">{{ log.user }}</td>
                         <td class="py-2.5 px-3"><span class="bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded border border-stone-200 font-bold uppercase text-[9px]">{{ log.module }}</span></td>
                         <td class="py-2.5 px-3 text-amber-900 font-bold">{{ log.action }}</td>
                         <td class="py-2.5 px-3 text-right">
                           <span [class]="log.severity === 'critical' ? 'text-rose-600' : log.severity === 'warning' ? 'text-amber-600' : 'text-emerald-600'" class="font-black uppercase text-[9px]">
                             {{ log.severity }}
                           </span>
                         </td>
                       </tr>
                     }
                   </tbody>
                 </table>
               </div>
            </div>
          }

        </div>

      </div>

      <!-- COMMAND PALETTE (CTRL+K) -->
      @if (showCommandPalette()) {
        <div class="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-start justify-center pt-24 p-4">
          <div class="bg-[#1d1008] border-2 border-amber-600/50 rounded-3xl max-w-xl w-full p-5 text-stone-200 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex items-center gap-3 bg-[#2b160b] border border-[#482814] rounded-2xl px-4 py-3">
              <mat-icon class="text-amber-500">search</mat-icon>
              <input 
                [value]="commandSearchQuery()"
                (input)="commandSearchQuery.set($any($event.target).value)"
                type="text" 
                placeholder="Busque por comandos, filiais ou logs (Ex: Provisionar, MDM, Split)..." 
                class="bg-transparent w-full text-sm text-white placeholder-stone-500 focus:outline-none">
              <span class="text-[10px] font-mono bg-[#1a0e07] text-stone-400 px-2 py-1 rounded border border-[#4d2813]">ESC</span>
            </div>

            <div class="space-y-1.5 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              <div class="text-[10px] font-mono font-bold text-amber-500 uppercase px-2 pb-1">Navegação Master</div>
              @for (cmd of commands; track cmd.id) {
                <button (click)="selectCommand(cmd.id)" class="w-full text-left px-4 py-3 rounded-xl hover:bg-[#2b160b] flex items-center justify-between text-xs transition-all cursor-pointer border-none">
                  <div class="flex items-center gap-3">
                    <mat-icon class="text-amber-400 text-sm">{{ cmd.icon }}</mat-icon>
                    <span class="font-bold text-white">{{ cmd.label }}</span>
                  </div>
                  <span class="font-mono text-[9px] text-stone-500">{{ cmd.sub }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      }

      <!-- MODAL PROVISIONAR NOVA EMPRESA -->
      @if (showModal()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-lg w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <mat-icon class="text-amber-700">add_business</mat-icon> Provisionar Nova Unidade (Tenant)
              </h3>
              <button type="button" (click)="showModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold cursor-pointer">✕</button>
            </div>

            <div class="space-y-3 text-xs font-sans">
              <div>
                <label for="tName" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Nome da Empresa / Razão Social</label>
                <input id="tName" [value]="newTenantName()" (input)="newTenantName.set($any($event.target).value)" type="text" placeholder="Ex: Padaria Estrela LTDA" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-950 focus:outline-none focus:border-amber-600 font-medium">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="tCat" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Segmento</label>
                  <select id="tCat" [value]="newTenantCategory()" (change)="newTenantCategory.set($any($event.target).value)" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-950 focus:outline-none cursor-pointer">
                    <option value="restaurant">Gastronomia</option>
                    <option value="retail">Varejo</option>
                    <option value="services">Serviços</option>
                  </select>
                </div>
                <div>
                  <label for="tPlan" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Plano SaaS</label>
                  <select id="tPlan" [value]="newTenantPlan()" (change)="newTenantPlan.set($any($event.target).value)" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-950 focus:outline-none cursor-pointer font-bold text-amber-800">
                    <option value="Starter">Starter</option>
                    <option value="Professional">Professional</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div>
                <label for="tCnpj" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">CNPJ Fiscal</label>
                <input id="tCnpj" [value]="newTenantCnpj()" (input)="newTenantCnpj.set($any($event.target).value)" type="text" placeholder="00.000.000/0001-00" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 text-stone-950 focus:outline-none font-mono">
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-[#e8dfce]">
              <button (click)="showModal.set(false)" class="flex-1 bg-[#ebdcc7] text-stone-800 font-bold py-3 rounded-xl border border-[#d6c3aa] text-xs transition-all">Cancelar</button>
              <button (click)="createTenant()" class="flex-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-stone-950 font-black py-3 rounded-xl shadow-lg text-xs uppercase transition-all active:scale-95">Provisionar Loja no HQ</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL PAREAR NOVO TERMINAL MDM -->
      @if (showPairModalHq()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-lg w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
             <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
               <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                 <mat-icon class="text-amber-700">developer_board</mat-icon> Provisionamento MDM
               </h3>
               <button (click)="showPairModalHq.set(false)" class="text-stone-400 hover:text-stone-800 font-bold text-lg">✕</button>
             </div>
             <div class="space-y-3 text-xs">
                <div>
                   <label for="devTargetTenant" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Destino do Terminal</label>
                   <select id="devTargetTenant" [value]="newDeviceTenantId()" (change)="newDeviceTenantId.set($any($event.target).value)" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-medium">
                      <option value="hq">⚡ Infraestrutura HQ Central (Servidor/Node)</option>
                      @for (t of ecosystem.tenants(); track t.id) {
                        <option [value]="t.id">🏪 Loja: {{ t.name }}</option>
                      }
                   </select>
                </div>
                <div>
                   <label for="devNameInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Nome do Terminal</label>
                   <input id="devNameInput" [value]="newDeviceName()" (input)="newDeviceName.set($any($event.target).value)" type="text" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2">
                </div>
                <div>
                   <label for="devSerialInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Serial (S/N)</label>
                   <input id="devSerialInput" [value]="newDeviceSerial()" (input)="newDeviceSerial.set($any($event.target).value)" type="text" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
             </div>
             <button (click)="pairDevice()" class="w-full bg-amber-600 text-stone-950 font-black py-3 rounded-xl shadow-lg text-xs uppercase mt-2">Parear Terminal Remoto</button>
          </div>
        </div>
      }

      <!-- TENANT GOVERNANCE & SPLIT MODAL (APP OWNER) -->
      @if (selectedTenantForGovernance()) {
        <app-hq-tenant-governance-modal
          [tenant]="selectedTenantForGovernance()"
          (dismiss)="selectedTenantForGovernance.set(null)"
        />
      }

      <!-- OFFICIAL EXECUTIVE DOCUMENTATION MODAL -->
      @if (showDocModal()) {
        <app-hq-documentation-modal
          (dismiss)="showDocModal.set(false)"
        />
      }

    </div>
  `
})
export class HQCentralComponent implements OnInit {
  readonly ecosystem = inject(EcosystemService);
  private readonly router = inject(Router);

  readonly activeSubTab = signal<HQSubTab>('tenants');
  readonly showModal = signal<boolean>(false);
  readonly showPairModalHq = signal<boolean>(false);
  readonly showCommandPalette = signal<boolean>(false);
  readonly showDocModal = signal<boolean>(false);
  readonly selectedTenantForGovernance = signal<CompanyTenant | null>(null);

  readonly selectedDeviceTenantFilter = signal<string>('all');
  readonly searchTenantQuery = signal<string>('');
  readonly commandSearchQuery = signal<string>('');

  readonly newTenantName = signal<string>('');
  readonly newTenantCategory = signal<string>('restaurant');
  readonly newTenantCnpj = signal<string>('');
  readonly newTenantPlan = signal<string>('Professional');

  readonly newDeviceTenantId = signal<string>('tenant-1');
  readonly newDeviceName = signal<string>('POS Caixa Central');
  readonly newDeviceSerial = signal<string>('S920-BR-778811');

  readonly mdmMode = signal<'terminals' | 'drivers' | 'routes'>('terminals');

  readonly filteredDevices = computed(() => {
    const filter = this.selectedDeviceTenantFilter();
    const list = this.ecosystem.devices();
    if (filter === 'all') return list;
    return list.filter(d => d.tenantId === filter);
  });

  readonly filteredDriversMDM = computed(() => {
    const list = this.ecosystem.drivers();
    const filter = this.selectedDeviceTenantFilter();
    if (filter === 'all') return list;
    if (filter === 'hq') return list.filter(d => d.tenantId === 'hq' || d.driverType === 'platform');
    return list.filter(d => d.tenantId === filter);
  });

  readonly filteredRoutesMDM = computed(() => {
    const list = this.ecosystem.deliveryRoutes();
    const filter = this.selectedDeviceTenantFilter();
    if (filter === 'all' || filter === 'hq') return list;
    return list.filter(r => r.tenantId === filter);
  });

  pingDriverGps(driver: import('../models/ecosystem.model').StoreDriver) {
    this.ecosystem.notify(`Telemetria GPS registrada: ${driver.name} em ${driver.currentLocationName}`, 'info');
    this.ecosystem.logAudit('Ping Geodésico GPS', 'HQ', `Última telemetria GPS registrada em memória para ${driver.name} (${driver.deviceName}): ${driver.currentLocationName}`, 'info');
  }

  // Dynamic Infra Metrics (Derived from ecosystem load)
  readonly infraStats = computed(() => {
    const sessionCount = this.ecosystem.activeSessionsCount();
    const base = [85, 90, 88, 92, 95, 87, 85, 98, 100, 95, 92, 90, 88, 85];
    // Fluctuate based on session density
    return base.map(v => Math.min(100, Math.max(10, v + (sessionCount % 10) - 5)));
  });
  readonly dbThroughput = computed(() => (this.ecosystem.orders().length * 0.12 + 5).toFixed(1));
  readonly globalTraffic = computed(() => (this.ecosystem.activeSessionsCount() * 0.015 + 1).toFixed(1));

  readonly currentLoad = computed(() => {
    const stats = this.infraStats();
    return Math.round(stats.reduce((a, b) => a + b, 0) / stats.length);
  });

  readonly subTabs: { id: HQSubTab; label: string; icon: string }[] = [
    { id: 'tenants', label: 'Portfólio de Lojas', icon: 'business' },
    { id: 'plans', label: 'Planos & Preços SaaS', icon: 'payments' },
    { id: 'devices', label: 'Frota MDM', icon: 'developer_board' },
    { id: 'apps_preview', label: 'Apps Nativos Android', icon: 'smartphone' },
    { id: 'ledger', label: 'Tesouraria SaaS', icon: 'account_balance' },
    { id: 'regional', label: 'Portal Regional', icon: 'public' },
    { id: 'consumers', label: 'CRM Global', icon: 'people' },
    { id: 'system', label: 'Infraestrutura & Config', icon: 'settings_input_component' },
    { id: 'audit', label: 'Auditoria Master', icon: 'security' }
  ];

  readonly commands: CommandItem[] = [
    { id: 'tenants', label: 'Gerenciar Portfólio de Lojas', icon: 'business', sub: 'Sub-aba 1' },
    { id: 'devices', label: 'Frota MDM (Terminais POS & Motoristas)', icon: 'developer_board', sub: 'Sub-aba 2' },
    { id: 'apps_preview', label: 'Console de Auditoria Mobile (Real-Time)', icon: 'smartphone', sub: 'Sub-aba 3' },
    { id: 'ledger', label: 'Tesouraria & Split SaaS', icon: 'account_balance', sub: 'Sub-aba 4' },
    { id: 'system', label: 'Infraestrutura & Config Global', icon: 'settings_input_component', sub: 'Sub-aba 7' }
  ];

  ngOnInit() {
    const session = this.ecosystem.currentSession();
    if (!session || session.role !== 'hq_admin') {
      this.ecosystem.notify('Acesso restrito: O HQ Central é exclusivo do Dono do Aplicativo (SaaS Owner). Selecione o perfil correspondente na tela inicial.', 'warning');
      this.router.navigate(['/login']);
      return;
    }
    // Sync state with Express backend
    this.ecosystem.syncHqFromBackend();
    // Audit check on mount
    this.ecosystem.logAudit('Acesso HQ Central', 'HQ', 'Painel administrativo supremo acessado pelo Dono do App.', 'info');
  }

  toggleMaintenanceMode() {
    const next = !this.ecosystem.maintenanceMode();
    this.ecosystem.maintenanceMode.set(next);
    if (this.ecosystem.hqApi) {
      this.ecosystem.hqApi.setMaintenance(next).catch(err => console.warn('Maintenance sync deferred:', err));
    }
  }

  onWindowKeydown(event: KeyboardEvent) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.showCommandPalette.update(v => !v);
    } else if (event.key === 'Escape') {
      this.showCommandPalette.set(false);
      this.showModal.set(false);
      this.showPairModalHq.set(false);
    }
  }

  selectCommand(tab: HQSubTab) {
    this.activeSubTab.set(tab);
    this.showCommandPalette.set(false);
  }

  readonly filteredTenants = computed(() => {
    const q = this.searchTenantQuery().toLowerCase().trim();
    const list = this.ecosystem.tenants();
    if (!q) return list;
    return list.filter(t => t.name.toLowerCase().includes(q) || t.cnpj.includes(q) || t.legalName.toLowerCase().includes(q));
  });

  getTenantName(tenantId: string): string {
    if (tenantId === 'hq') return 'HQ Central (Infraestrutura)';
    const t = this.ecosystem.tenants().find(x => x.id === tenantId);
    return t ? t.name : 'Estabelecimento Cadastrado';
  }

  openNewTenantModal() {
    this.showModal.set(true);
  }

  createTenant() {
    if (!this.newTenantName()) return;
    this.ecosystem.addTenant({
      id: 'tenant-' + Date.now(),
      name: this.newTenantName(),
      legalName: this.newTenantName() + ' LTDA',
      cnpj: this.newTenantCnpj() || '12.345.678/0001-90',
      category: this.newTenantCategory() as 'restaurant' | 'retail' | 'services' | 'hybrid',
      plan: this.newTenantPlan() as 'Starter' | 'Professional' | 'Enterprise',
      status: 'active',
      devicesLimit: 5,
      activeDevicesCount: 0,
      contactEmail: 'contato@' + this.newTenantName().toLowerCase().replace(/\s+/g, '') + '.com.br',
      phone: '+55 11 99999-8888',
      address: {
        street: 'Logradouro SaaS',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01000-000'
      },
      deliveryRadiusKm: 10,
      serviceFeePercent: 10,
      openingHours: 'Segunda a Sábado, 09h às 18h'
    });
    this.showModal.set(false);
    this.ecosystem.notify('Nova loja provisionada com sucesso.', 'success');
  }

  pairDevice() {
    this.ecosystem.addDevice({
      tenantId: this.newDeviceTenantId(),
      tenantName: this.getTenantName(this.newDeviceTenantId()),
      deviceName: this.newDeviceName(),
      type: 'terminal',
      serialNumber: this.newDeviceSerial(),
      macAddress: 'F0:E1:D2:C3:B4:A5',
      ipAddress: '192.168.0.10' + Math.floor(Math.random() * 9),
      osVersion: '3EATCRU OS Pro 4.2.0',
      appVersion: 'v2.8.4',
      status: 'online',
      location: 'Caixa Central',
      batteryLevel: 100
    });
    this.showPairModalHq.set(false);
  }

  toggleTenantStatus(tenant: CompanyTenant) {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    this.ecosystem.updateTenant(tenant.id, { status: newStatus });
  }

  openTenantGovernance(tenant: CompanyTenant) {
    this.selectedTenantForGovernance.set(tenant);
  }

  updateCommission(event: Event) {
    const target = event.target as HTMLInputElement;
    const val = parseFloat(target.value) / 100;
    if (!isNaN(val)) {
      this.ecosystem.hqCommissionRate.set(val);
    }
  }

  sendBroadcast(msg: string) {
    if (!msg) return;
    this.ecosystem.globalBroadcastMessage.set(msg);
    if (this.ecosystem.hqApi) {
      this.ecosystem.hqApi.setBroadcast(msg).catch(err => console.warn('Broadcast sync deferred:', err));
    }
    this.ecosystem.notify('Broadcast Global enviado!', 'success');
    this.ecosystem.logAudit('Broadcast Global', 'HQ', `Mensagem disparada: ${msg}`, 'warning');
  }
}




