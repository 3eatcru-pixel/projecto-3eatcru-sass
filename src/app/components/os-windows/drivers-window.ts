import { ChangeDetectionStrategy, Component, inject, signal, computed, ElementRef, viewChild, afterNextRender, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import type * as L from 'leaflet';
import { EcosystemService } from '../../services/ecosystem.service';
import { DeliveryRoute, DeliveryWaypoint } from '../../models/ecosystem.model';
import { MapToolsService, MapCoord } from '../../services/map-tools.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-drivers-window',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#1d1008] text-stone-200 font-sans selection:bg-amber-600 selection:text-white">
      
      <!-- SUB-HEADER BAR -->
      <div class="bg-[#170b04] border-b border-[#3d200f] p-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 via-amber-600 to-amber-800 text-stone-950 flex items-center justify-center font-black shadow-lg">
            <mat-icon>alt_route</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-serif font-black text-base text-white">Hub de Logística &amp; Frota de Motoqueiros</h2>
              <span class="bg-amber-950 text-amber-300 border border-amber-700 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                Autonomia Total da Loja
              </span>
            </div>
            <p class="text-xs text-stone-400">Controle total da sua equipe de entregadores, despacho direto de rotas e acerto de diárias sem intervenção do HQ.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          @if (delayAlerts().length > 0) {
            <span class="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 animate-pulse">
              <mat-icon class="text-xs">warning</mat-icon>
              {{ delayAlerts().length }} ALERTAS DE ATRASO
            </span>
          }

          <span class="text-xs font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/60 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {{ availableDriversCount() }} DISPONÍVEIS
          </span>

          <button
            type="button"
            (click)="showNewDriverModal.set(true)"
            class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-stone-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow">
            <mat-icon class="text-sm">person_add</mat-icon>
            <span>+ Novo Motoqueiro</span>
          </button>

          <button
            type="button"
            (click)="autoClusterOrders()"
            class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow">
            <mat-icon class="text-sm">auto_awesome</mat-icon>
            <span>Auto-Agrupar Rotas</span>
          </button>

          <button
            type="button"
            (click)="openRateConfigModal()"
            class="bg-[#2b160b] hover:bg-[#3d200f] text-amber-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-[#482814] cursor-pointer shadow">
            <mat-icon class="text-sm">settings_suggest</mat-icon>
            <span>Tabela de Fretes</span>
          </button>
        </div>
      </div>

      <!-- NAVIGATION SUB-TABS -->
      <div class="bg-[#140903] px-4 py-2 border-b border-[#2e170a] flex items-center gap-2 text-xs font-bold shrink-0">
        <button
          type="button"
          (click)="activeSubTab.set('rotas')"
          [class]="activeSubTab() === 'rotas' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#231208] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">route</mat-icon>
          <span>Rotas Ativas &amp; Despacho</span>
        </button>

        <button
          type="button"
          (click)="activeSubTab.set('frota')"
          [class]="activeSubTab() === 'frota' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#231208] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">two_wheeler</mat-icon>
          <span>Minha Equipe de Motoqueiros ({{ privateDrivers().length }})</span>
        </button>

        <button
          type="button"
          (click)="activeSubTab.set('pedidos')"
          [class]="activeSubTab() === 'pedidos' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#231208] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">pending_actions</mat-icon>
          <span>Pedidos Pendentes ({{ pendingDeliveryOrders().length }})</span>
        </button>
      </div>

      <!-- MAIN CONTENT AREA -->
      <div class="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 custom-scrollbar">
        
        <!-- DASHBOARD STATS -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Frota Própria da Loja</span>
            <strong class="text-2xl font-serif font-black text-white">{{ privateDrivers().length }} Motoqueiros</strong>
          </div>
          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Rotas em Andamento</span>
            <strong class="text-2xl font-serif font-black text-amber-300">{{ activeRoutes().length }}</strong>
          </div>
          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Entregas Feitas Hoje</span>
            <strong class="text-2xl font-serif font-black text-emerald-400">{{ totalDeliveriesToday() }}</strong>
          </div>
          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-4 shadow-md">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Frete Base Atual</span>
            <strong class="text-lg font-serif font-black text-amber-400">R$ {{ currentRateConfig().baseFee.toFixed(2) }}</strong>
          </div>
        </div>

        @if (activeSubTab() === 'rotas') {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- LEFT: ROUTES & DISPATCH -->
            <div class="lg:col-span-7 space-y-4">
              <div class="bg-[#231208] border border-[#4d2813] rounded-3xl p-5 shadow-2xl space-y-4">
                <h3 class="font-serif font-bold text-white text-base flex items-center gap-2 border-b border-[#3d200f] pb-3">
                  <mat-icon class="text-amber-500">route</mat-icon> Gerenciador de Rotas &amp; Despacho Direto
                </h3>
                <div class="space-y-3">
                  @for (route of allRoutes(); track route.id) {
                    <div 
                      class="w-full text-left bg-[#1a0e06] border border-[#3d200f] rounded-2xl p-4 shadow-xl space-y-3 transition-all"
                      [class.border-amber-500]="trackingRouteId() === route.id">
                      <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                          <span [class]="route.status === 'in_progress' ? 'bg-amber-950 text-amber-400 border-amber-700' : 'bg-emerald-950 text-emerald-400 border-emerald-700'" class="border px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase">
                            {{ route.status }}
                          </span>
                          <h4 class="font-bold text-white text-sm">{{ route.routeCode }}</h4>
                        </div>
                        <strong class="text-amber-400 font-mono">R$ {{ route.totalEarnings.toFixed(2) }}</strong>
                      </div>

                      <div class="flex items-center justify-between text-xs text-stone-400 pt-1 border-t border-[#2e170a]">
                        <div class="flex items-center gap-1">
                          <mat-icon class="text-xs text-amber-500">two_wheeler</mat-icon>
                          <span>Motoqueiro: <strong class="text-stone-100">{{ route.driverName || 'Pendente de Atribuição' }}</strong></span>
                        </div>
                        <div>Paradas: <span class="font-bold text-amber-300">{{ completedWaypoints(route) }}/{{ route.waypoints.length }}</span></div>
                      </div>

                      <!-- DIRECT DRIVER SELECTION ASSIGNMENT CONTROL -->
                      <div class="pt-2 border-t border-[#2e170a] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div class="flex items-center gap-2 flex-1">
                          <label for="driverSelect-{{route.id}}" class="text-[10px] font-mono font-bold text-stone-400 uppercase shrink-0">Atribuir Motoqueiro:</label>
                          <select
                            id="driverSelect-{{route.id}}"
                            #driverSel
                            class="bg-[#0e0805] border border-[#4d2813] rounded-xl px-2.5 py-1.5 text-xs text-stone-200 font-bold focus:outline-none focus:border-amber-500 cursor-pointer flex-1">
                            <option value="">Selecione da Frota...</option>
                            <optgroup label="🛵 Motoqueiros da Loja (Frota Própria)">
                              @for (drv of privateDrivers(); track drv.id) {
                                <option [value]="drv.id" [selected]="route.driverId === drv.id">
                                  {{ drv.name }} ({{ drv.status === 'available' ? 'Disponível' : drv.status }})
                                </option>
                              }
                            </optgroup>
                            <optgroup label="⚡ Entregadores da Plataforma 3EAT">
                              @for (drv of platformDrivers(); track drv.id) {
                                <option [value]="drv.id" [selected]="route.driverId === drv.id">
                                  {{ drv.name }} (Plataforma)
                                </option>
                              }
                            </optgroup>
                          </select>
                        </div>

                        <div class="flex items-center gap-1.5">
                          <button
                            type="button"
                            (click)="assignDriverToRoute(route.id, driverSel.value)"
                            class="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black px-3 py-1.5 rounded-xl text-[11px] shadow cursor-pointer transition-all flex items-center gap-1">
                            <mat-icon class="text-xs">send</mat-icon>
                            <span>Despachar</span>
                          </button>

                          <button
                            type="button"
                            (click)="trackingRouteId.set(route.id)"
                            class="bg-[#2b160b] hover:bg-[#3d200f] text-amber-300 font-bold px-2.5 py-1.5 rounded-xl text-[11px] border border-[#482814] cursor-pointer">
                            Rastrear
                          </button>
                        </div>
                      </div>
                    </div>
                  } @empty {
                    <div class="bg-[#1a0e06] rounded-2xl p-6 text-center text-stone-400 space-y-2 border border-[#3d200f]">
                      <mat-icon class="text-3xl text-stone-500">alt_route</mat-icon>
                      <h4 class="font-bold text-sm text-stone-200">Nenhuma rota ativa no momento</h4>
                      <p class="text-xs text-stone-400">Clique em "Auto-Agrupar Rotas" para montar pacotes de entrega automaticamente a partir dos pedidos pendentes.</p>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- RIGHT: GEODETIC COMMAND MAP -->
            <div class="lg:col-span-5 space-y-4">
              <div class="bg-[#231208] border border-[#4d2813] rounded-3xl p-5 shadow-2xl space-y-3 flex flex-col h-[480px]">
                <div class="flex justify-between items-center pb-2 border-b border-[#3d200f]">
                  <h3 class="font-serif font-bold text-white text-xs uppercase flex items-center gap-1.5">
                    <mat-icon class="text-amber-500 text-sm">map</mat-icon> Rastreio Geodésico
                  </h3>
                  <div class="flex items-center gap-1.5">
                    <button 
                      type="button"
                      (click)="isMeasureMode.set(!isMeasureMode())"
                      [class]="isMeasureMode() ? 'bg-amber-600 text-stone-950 font-black' : 'bg-[#170b04] text-amber-400 border border-[#3d200f]'"
                      class="px-2.5 py-1 rounded-lg text-[10px] uppercase font-mono font-bold cursor-pointer">
                      {{ isMeasureMode() ? 'Medindo' : 'Medir Distância' }}
                    </button>
                    @if (isMeasureMode()) {
                      <button type="button" (click)="clearMeasurement()" class="px-2 py-1 rounded-lg text-[10px] bg-rose-950 text-rose-300 border border-rose-800 font-bold cursor-pointer">Limpar</button>
                    }
                  </div>
                </div>

                <div class="flex-1 rounded-2xl overflow-hidden border border-[#3d200f] relative bg-stone-900">
                  <div #mapContainer class="w-full h-full opacity-90"></div>

                  @if (isMeasureMode() && currentDistance().km > 0) {
                    <div class="absolute top-3 left-3 bg-black/80 backdrop-blur border border-amber-600/50 p-2.5 rounded-xl z-[1000] text-xs font-mono space-y-0.5">
                      <div class="text-amber-400 font-bold uppercase text-[9px]">Distância Real Calibrada</div>
                      <div class="text-white font-black text-sm">{{ currentDistance().km.toFixed(2) }} KM</div>
                      <div class="text-[9px] text-stone-400">({{ currentDistance().meters.toFixed(0) }} metros • {{ currentDistance().miles.toFixed(2) }} mi)</div>
                    </div>
                  }
                </div>

                <div class="pt-2 flex justify-between items-center text-[10px] font-mono text-stone-400">
                  <div>LAT: {{ mapTools.toDMS(cursorCoord().lat, true) }}</div>
                  <div>LNG: {{ mapTools.toDMS(cursorCoord().lng, false) }}</div>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- SUB-TAB 2: STORE PRIVATE FLEET MANAGEMENT -->
        @if (activeSubTab() === 'frota') {
          <div class="bg-[#231208] border border-[#4d2813] rounded-3xl p-5 shadow-2xl space-y-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#3d200f] pb-3">
              <div>
                <h3 class="font-serif font-black text-white text-base flex items-center gap-2">
                  <mat-icon class="text-amber-500">two_wheeler</mat-icon> Equipe de Motoqueiros da Loja (Frota Própria)
                </h3>
                <p class="text-xs text-stone-400">Gerencie seus motoboys contratados, altere status de expediente e efetue pagamento de diárias.</p>
              </div>

              <button
                type="button"
                (click)="showNewDriverModal.set(true)"
                class="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 text-stone-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer">
                <mat-icon class="text-sm">person_add</mat-icon>
                <span>+ Cadastrar Motoqueiro</span>
              </button>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="text-[10px] font-mono font-bold uppercase text-stone-400 border-b border-[#3d200f]">
                    <th class="py-2.5 px-3">MOTOQUEIRO</th>
                    <th class="py-2.5 px-3">CONTATO &amp; VEÍCULO</th>
                    <th class="py-2.5 px-3 text-center">STATUS EXPEDIENTE</th>
                    <th class="py-2.5 px-3 text-center">ENTREGAS HOJE</th>
                    <th class="py-2.5 px-3 text-right">DIÁRIA ACUMULADA</th>
                    <th class="py-2.5 px-3 text-right">AÇÕES LOJA</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#2e170a]">
                  @for (driver of privateDrivers(); track driver.id) {
                    <tr class="hover:bg-[#2a160b] transition-colors">
                      <td class="py-3 px-3">
                        <div class="font-bold text-white flex items-center gap-2">
                          <div class="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700/60 text-amber-400 flex items-center justify-center font-black shrink-0">
                            <mat-icon class="text-sm">two_wheeler</mat-icon>
                          </div>
                          <div>
                            <div class="text-sm font-bold text-stone-100">{{ driver.name }}</div>
                            <div class="text-[10px] font-mono text-stone-400">CNH: {{ driver.cnhNumber || 'Regularizada' }}</div>
                          </div>
                        </div>
                      </td>

                      <td class="py-3 px-3 text-stone-300">
                        <div class="font-mono text-xs text-amber-300 font-bold">{{ driver.phone }}</div>
                        <div class="text-[10px] text-stone-400 capitalize">{{ driver.vehicleType }} {{ driver.licensePlate ? '• Placa: ' + driver.licensePlate : '' }}</div>
                      </td>

                      <td class="py-3 px-3 text-center">
                        <button
                          type="button"
                          (click)="toggleDriverStatus(driver.id)"
                          [class]="driver.status === 'available' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : driver.status === 'delivering' ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-stone-900 text-stone-400 border-stone-700'"
                          class="border px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold uppercase transition-all cursor-pointer">
                          {{ driver.status === 'available' ? 'Disponível' : driver.status === 'delivering' ? 'Em Rota' : 'Offline' }}
                        </button>
                      </td>

                      <td class="py-3 px-3 text-center font-mono font-black text-white text-sm">
                        {{ driver.completedTodayCount }}
                      </td>

                      <td class="py-3 px-3 text-right font-mono font-black text-amber-400 text-sm">
                        R$ {{ getDriverEarningsToday(driver.id).toFixed(2) }}
                      </td>

                      <td class="py-3 px-3 text-right">
                        <div class="flex justify-end gap-1.5">
                          <button
                            type="button"
                            (click)="payDriver(driver.id, getDriverEarningsToday(driver.id), 'PIX')"
                            class="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-bold px-2.5 py-1.5 rounded-xl text-[10px] uppercase cursor-pointer shadow">
                            Pagar PIX
                          </button>
                          <button
                            type="button"
                            (click)="payDriver(driver.id, getDriverEarningsToday(driver.id), 'Dinheiro')"
                            class="bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold px-2.5 py-1.5 rounded-xl text-[10px] uppercase cursor-pointer shadow">
                            Pagar Dinheiro
                          </button>
                          <button
                            type="button"
                            (click)="clockOffDriver(driver.id, getDriverEarningsToday(driver.id))"
                            class="bg-[#170b04] text-rose-300 border border-rose-800/80 hover:bg-rose-950 font-bold px-2.5 py-1.5 rounded-xl text-[10px] uppercase cursor-pointer">
                            Encerrar Turno
                          </button>
                        </div>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="6" class="py-8 text-center text-stone-400 font-serif italic text-xs">
                        Nenhum motoqueiro cadastrado na frota própria da loja. Clique em "+ Cadastrar Motoqueiro" para adicionar seus motoboys internos.
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- SUB-TAB 3: PENDING ORDERS AWAITING DRIVER -->
        @if (activeSubTab() === 'pedidos') {
          <div class="bg-[#231208] border border-[#4d2813] rounded-3xl p-5 shadow-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-[#3d200f] pb-3">
              <div>
                <h3 class="font-serif font-black text-white text-base flex items-center gap-2">
                  <mat-icon class="text-amber-500">pending_actions</mat-icon> Pedidos de Delivery Pendentes de Motoqueiro
                </h3>
                <p class="text-xs text-stone-400">Selecione pedidos para agrupar e selecione o motoqueiro para despacho imediato.</p>
              </div>

              @if (selectedOrderIds().length > 0) {
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-700 px-3 py-1.5 rounded-xl font-bold">
                    {{ selectedOrderIds().length }} selecionados
                  </span>
                  <select #directDrvSelect class="bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-1.5 text-xs text-stone-200 font-bold focus:outline-none">
                    <option value="">Selecione Motoqueiro...</option>
                    @for (drv of availableDrivers(); track drv.id) {
                      <option [value]="drv.id">{{ drv.name }} ({{ drv.driverType === 'private' ? 'Frota Própria' : 'Plataforma' }})</option>
                    }
                  </select>
                  <button
                    type="button"
                    (click)="bundleOrdersToRoute(directDrvSelect.value)"
                    class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 font-black px-4 py-1.5 rounded-xl text-xs uppercase cursor-pointer shadow">
                    Despachar Rota
                  </button>
                </div>
              }
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              @for (ord of pendingDeliveryOrders(); track ord.id) {
                <div
                  (click)="toggleOrderSelection(ord.id)"
                  (keyup.enter)="toggleOrderSelection(ord.id)"
                  tabindex="0"
                  [class]="isOrderSelected(ord.id) ? 'border-amber-500 bg-[#2e180b]' : 'border-[#3d200f] bg-[#1a0e06]'"
                  class="border rounded-2xl p-4 shadow-xl space-y-2 cursor-pointer transition-all hover:border-amber-600">
                  <div class="flex justify-between items-start">
                    <div class="flex items-center gap-2">
                      <input type="checkbox" [checked]="isOrderSelected(ord.id)" class="accent-amber-500 pointer-events-none">
                      <h4 class="font-bold text-white text-sm">Pedido {{ ord.orderNumber }}</h4>
                    </div>
                    <strong class="text-amber-400 font-mono text-sm">R$ {{ ord.total.toFixed(2) }}</strong>
                  </div>

                  <div class="text-xs text-stone-300 font-medium">
                    Cliente: <strong>{{ ord.customerName }}</strong> ({{ ord.customerPhone }})
                  </div>

                  <div class="text-[10px] text-stone-400 font-mono">
                    Itens: {{ ord.items.length }} produtos
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-8 text-center text-stone-400 font-serif italic text-xs">
                  Nenhum pedido de delivery aguardando atribuição no momento.
                </div>
              }
            </div>
          </div>
        }

      </div>

      <!-- MODAL FRETE CONFIG -->
      @if (showRateModal()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <mat-icon class="text-amber-700">settings_suggest</mat-icon> Tabela de Fretes &amp; Taxas
              </h3>
              <button type="button" (click)="showRateModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold cursor-pointer">✕</button>
            </div>

            <form [formGroup]="rateConfigForm" (ngSubmit)="onSaveRateConfig()" class="space-y-3 text-xs font-sans">
              <div>
                <label for="baseFeeInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Frete Base Mínimo (R$)</label>
                <input id="baseFeeInput" formControlName="baseFee" type="number" step="0.5" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono font-bold text-amber-900">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="includedKmInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">KM Incluído no Base</label>
                  <input id="includedKmInput" formControlName="includedKm" type="number" step="0.5" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
                <div>
                  <label for="extraKmFeeInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Taxa KM Adicional (R$)</label>
                  <input id="extraKmFeeInput" formControlName="extraKmFee" type="number" step="0.5" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
                </div>
              </div>

              <div>
                <label for="extraStopBonusInput" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Bônus Parada Extra Rota (R$)</label>
                <input id="extraStopBonusInput" formControlName="extraStopBonus" type="number" step="0.5" class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
              </div>

              <div class="flex gap-3 pt-4 border-t border-[#e8dfce]">
                <button type="button" (click)="showRateModal.set(false)" class="flex-1 bg-[#ebdcc7] text-stone-800 font-bold py-3 rounded-xl border border-[#d6c3aa] text-xs">Cancelar</button>
                <button type="submit" class="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black py-3 rounded-xl shadow-lg text-xs uppercase">Salvar Tabela</button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CADASTRAR MOTOQUEIRO PRÓPRIO DA LOJA -->
      @if (showNewDriverModal()) {
        <div class="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-md w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
              <h3 class="font-serif font-black text-lg text-stone-900 flex items-center gap-2">
                <mat-icon class="text-emerald-700">person_add</mat-icon> Cadastrar Motoqueiro Próprio
              </h3>
              <button type="button" (click)="showNewDriverModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold cursor-pointer">✕</button>
            </div>

            <div class="space-y-3 text-xs font-sans">
              <div>
                <label for="drvName" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Nome Completo do Motoqueiro</label>
                <input
                  id="drvName"
                  [value]="newDriverName()"
                  (input)="newDriverName.set($any($event.target).value)"
                  type="text"
                  placeholder="Ex: Roberto Silva"
                  class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-medium">
              </div>

              <div>
                <label for="drvPhone" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">WhatsApp / Celular</label>
                <input
                  id="drvPhone"
                  [value]="newDriverPhone()"
                  (input)="newDriverPhone.set($any($event.target).value)"
                  type="text"
                  placeholder="(11) 99887-6655"
                  class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="drvVehicle" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Tipo de Veículo</label>
                  <select
                    id="drvVehicle"
                    [value]="newDriverVehicle()"
                    (change)="newDriverVehicle.set($any($event.target).value)"
                    class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-bold cursor-pointer">
                    <option value="moto">🏍️ Moto</option>
                    <option value="bike">🚲 Bicicleta</option>
                    <option value="carro">🚗 Carro</option>
                  </select>
                </div>

                <div>
                  <label for="drvPlate" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Placa do Veículo</label>
                  <input
                    id="drvPlate"
                    [value]="newDriverPlate()"
                    (input)="newDriverPlate.set($any($event.target).value)"
                    type="text"
                    placeholder="ABC-1234"
                    class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono uppercase">
                </div>
              </div>

              <div>
                <label for="drvCnh" class="block font-bold text-stone-800 mb-1 uppercase text-[10px]">Número da CNH</label>
                <input
                  id="drvCnh"
                  [value]="newDriverCnh()"
                  (input)="newDriverCnh.set($any($event.target).value)"
                  type="text"
                  placeholder="00011122233"
                  class="w-full bg-white border border-[#d6c7b0] rounded-xl px-3 py-2 font-mono">
              </div>
            </div>

            <div class="flex gap-3 pt-4 border-t border-[#e8dfce]">
              <button type="button" (click)="showNewDriverModal.set(false)" class="flex-1 bg-[#ebdcc7] text-stone-800 font-bold py-3 rounded-xl border border-[#d6c3aa] text-xs transition-all">Cancelar</button>
              <button type="button" (click)="addPrivateDriver()" class="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-stone-950 font-black py-3 rounded-xl shadow-lg text-xs uppercase transition-all cursor-pointer">Cadastrar na Frota</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class DriversWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly mapTools = inject(MapToolsService);
  private readonly fb = inject(FormBuilder);

  readonly activeSubTab = signal<'rotas' | 'frota' | 'pedidos'>('rotas');
  readonly showNewDriverModal = signal<boolean>(false);

  readonly newDriverName = signal<string>('');
  readonly newDriverPhone = signal<string>('');
  readonly newDriverVehicle = signal<'moto' | 'bike' | 'carro'>('moto');
  readonly newDriverPlate = signal<string>('');
  readonly newDriverCnh = signal<string>('');

  readonly showNewModal = signal<boolean>(false);
  readonly showRateModal = signal<boolean>(false);
  readonly selectedOrderIds = signal<string[]>([]);
  readonly trackingRouteId = signal<string | null>(null);

  // Map state
  private readonly mapContainer = viewChild<ElementRef>('mapContainer');
  private map: L.Map | null = null;
  private markersLayer: L.LayerGroup | null = null;
  private measurementLayer: L.LayerGroup | null = null;
  private L: typeof import('leaflet') | null = null;

  // Measurement mode state
  readonly isMeasureMode = signal<boolean>(false);
  readonly measurePoints = signal<MapCoord[]>([]);
  readonly cursorCoord = signal<MapCoord>({ lat: -23.5651, lng: -46.6521 });

  readonly currentDistance = computed(() => {
    const points = this.measurePoints();
    if (points.length < 2) return { km: 0, meters: 0, miles: 0 };
    
    let total = 0;
    for (let i = 0; i < points.length - 1; i++) {
      total += this.mapTools.calculateDistance(points[i], points[i+1]).km;
    }
    return { km: total, meters: total * 1000, miles: total * 0.621371 };
  });

  constructor() {
    afterNextRender(async () => {
      this.L = (await import('leaflet')).default;
      this.initMap();
    });

    effect(() => {
      if (this.trackingRouteId() && this.map && this.L) {
        setTimeout(() => {
          this.map?.invalidateSize();
          this.updateMapMarkers();
        }, 100);
      }
    });

    effect(() => {
      if (this.isMeasureMode()) {
        this.map?.getContainer().style.setProperty('cursor', 'crosshair');
      } else {
        this.map?.getContainer().style.setProperty('cursor', '');
        this.clearMeasurement();
      }
    });
  }

  private initMap() {
    const container = this.mapContainer()?.nativeElement;
    if (!container || !this.L) return;

    // OpenFreeMap Tiles (Dark Matter style for command center)
    const tileUrl = 'https://tiles.openfreemap.org/styles/dark-matter/{z}/{x}/{y}.png';

    this.map = this.L.map(container, {
      center: [-23.5651, -46.6521], 
      zoom: 13,
      zoomControl: false,
      attributionControl: false
    });

    this.L.tileLayer(tileUrl).addTo(this.map);
    this.markersLayer = this.L.layerGroup().addTo(this.map);
    this.measurementLayer = this.L.layerGroup().addTo(this.map);

    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      this.cursorCoord.set({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      if (this.isMeasureMode()) {
        this.addMeasurePoint(e.latlng.lat, e.latlng.lng);
      }
    });
  }

  private addMeasurePoint(lat: number, lng: number) {
    if (!this.L || !this.measurementLayer) return;
    
    const point: MapCoord = { lat, lng };
    this.measurePoints.update(p => [...p, point]);
    
    const icon = this.L.divIcon({
      className: 'measure-point',
      html: `<div class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>`,
      iconSize: [8, 8],
      iconAnchor: [4, 4]
    });

    this.L.marker([lat, lng], { icon }).addTo(this.measurementLayer);
    this.updateMeasurementLines();
  }

  private updateMeasurementLines() {
    if (!this.L || !this.measurementLayer) return;
    
    this.measurementLayer.clearLayers();
    
    const points = this.measurePoints();
    points.forEach(p => {
      if (!this.L || !this.measurementLayer) return;
      const icon = this.L.divIcon({
        className: 'measure-point',
        html: `<div class="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4]
      });
      this.L.marker([p.lat, p.lng], { icon }).addTo(this.measurementLayer);
    });

    if (points.length >= 2) {
      const latlngs: [number, number][] = points.map(p => [p.lat, p.lng]);
      this.L.polyline(latlngs, { color: '#f59e0b', weight: 2, dashArray: '5, 5' }).addTo(this.measurementLayer);
    }
  }

  clearMeasurement() {
    this.measurePoints.set([]);
    this.measurementLayer?.clearLayers();
  }

  private updateMapMarkers() {
    if (!this.map || !this.L || !this.markersLayer) return;
    this.markersLayer.clearLayers();

    const route = this.trackedRoute();
    if (!route) return;

    const bounds: [number, number][] = [];
    const waypoints = route.waypoints;

    waypoints.forEach(wp => {
      if (!this.L || !this.markersLayer) return;
      const pos: [number, number] = [wp.lat || -23.5651, wp.lng || -46.6521];

      const icon = this.L.divIcon({
        className: 'wp-icon',
        html: `<div class="w-6 h-6 rounded-full bg-amber-600 border-2 border-stone-900 flex items-center justify-center text-stone-950 font-bold text-[10px] shadow-lg">${wp.sequenceNumber}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      this.L.marker(pos, { icon }).addTo(this.markersLayer);
      bounds.push(pos);
    });

    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  readonly rateConfigForm: FormGroup = this.fb.group({
    baseFee: [7.00, [Validators.required, Validators.min(0)]],
    includedKm: [3.0, [Validators.required, Validators.min(0)]],
    extraKmFee: [1.50, [Validators.required, Validators.min(0)]],
    extraStopBonus: [3.00, [Validators.required, Validators.min(0)]]
  });

  readonly currentRateConfig = computed(() => {
    const tenant = this.ecosystem.tenants().find(t => t.id === this.ecosystem.currentTenantId());
    return tenant?.driverRateConfig || { baseFee: 7.00, includedKm: 3.0, extraKmFee: 1.50, extraStopBonus: 3.00 };
  });

  readonly privateDrivers = computed(() => this.ecosystem.drivers().filter(d => d.tenantId === this.ecosystem.currentTenantId() && d.driverType === 'private'));
  readonly platformDrivers = computed(() => this.ecosystem.drivers().filter(d => d.driverType === 'platform'));
  readonly storeDrivers = computed(() => [...this.privateDrivers(), ...this.platformDrivers()]);
  readonly allRoutes = computed(() => this.ecosystem.deliveryRoutes().filter(r => r.tenantId === this.ecosystem.currentTenantId()));
  readonly activeRoutes = computed(() => this.allRoutes().filter(r => r.status === 'in_progress'));
  readonly availableDriversCount = computed(() => this.storeDrivers().filter(d => d.status === 'available').length);
  readonly totalDeliveriesToday = computed(() => this.storeDrivers().reduce((sum, d) => sum + d.completedTodayCount, 0));
  readonly pendingDeliveryOrders = computed(() => this.ecosystem.orders().filter(o => o.tenantId === this.ecosystem.currentTenantId() && o.type === 'delivery' && (o.status === 'pending' || o.status === 'preparing')));
  readonly availableDrivers = computed(() => this.storeDrivers().filter(d => d.status === 'available'));
  readonly trackedRoute = computed(() => this.allRoutes().find(r => r.id === this.trackingRouteId()) || null);
  readonly delayAlerts = computed(() => this.activeRoutes().filter(r => r.waypoints.filter(w => w.status !== 'completed').length > 2));

  completedWaypoints(route: DeliveryRoute): number { return route.waypoints.filter((w: DeliveryWaypoint) => w.status === 'completed').length; }
  getDriverEarningsToday(driverId: string): number { return this.allRoutes().filter(r => r.driverId === driverId).reduce((sum, r) => sum + r.totalEarnings, 0); }
  payDriver(driverId: string, amount: number, method: 'PIX' | 'Dinheiro' = 'PIX') {
    if (amount <= 0) {
      this.ecosystem.notify('Nenhum valor acumulado para pagamento no momento.', 'warning');
      return;
    }
    if (confirm(`Confirmar pagamento de R$ ${amount.toFixed(2)} via ${method}?`)) {
      this.ecosystem.payDriver(driverId, amount, method, false);
    }
  }

  clockOffDriver(driverId: string, amount: number) {
    if (confirm('Encerrar expediente (Clock-off) do motoqueiro?')) {
      if (amount > 0) {
        const usePix = confirm(`Saldo acumulado de R$ ${amount.toFixed(2)}.\nClique [OK] para pagar via PIX ou [Cancelar] para pagar em Dinheiro.`);
        const method = usePix ? 'PIX' : 'Dinheiro';
        this.ecosystem.payDriver(driverId, amount, method, true);
      } else {
        this.ecosystem.clockOffDriver(driverId);
      }
    }
  }
  openRateConfigModal() { this.rateConfigForm.patchValue(this.currentRateConfig()); this.showRateModal.set(true); }
  onSaveRateConfig() { if (this.rateConfigForm.valid) { this.ecosystem.updateDriverRateConfig(this.rateConfigForm.value); this.showRateModal.set(false); } }
  isOrderSelected(orderId: string): boolean { return this.selectedOrderIds().includes(orderId); }
  toggleOrderSelection(orderId: string) { this.selectedOrderIds.update(ids => ids.includes(orderId) ? ids.filter(id => id !== orderId) : [...ids, orderId]); }
  bundleOrdersToRoute(driverId: string) {
    const ids = this.selectedOrderIds();
    if (ids.length > 0) {
      const orders = this.pendingDeliveryOrders().filter(o => ids.includes(o.id));
      this.ecosystem.createDeliveryRoute(orders, driverId || undefined);
      this.selectedOrderIds.set([]);
    }
  }
  autoClusterOrders() { this.ecosystem.autoClusterAndCreateRoutes(); }
  cancelRoute(routeId: string) { if (confirm('Cancelar esta rota?')) { this.ecosystem.cancelRoute(routeId); if (this.trackingRouteId() === routeId) this.trackingRouteId.set(null); } }

  addPrivateDriver() {
    const name = this.newDriverName().trim();
    if (!name) {
      this.ecosystem.notify('Por favor, informe o nome do motoqueiro.', 'warning');
      return;
    }

    this.ecosystem.addDriver({
      tenantId: this.ecosystem.currentTenantId(),
      name,
      phone: this.newDriverPhone() || '(11) 99999-8888',
      vehicleType: this.newDriverVehicle(),
      licensePlate: this.newDriverPlate() || undefined,
      status: 'available',
      rating: 5.0,
      driverType: 'private',
      deviceName: 'Celular do Entregador (App 3EAT)',
      appVersion: '3EAT Driver App v3.2.0',
      batteryLevel: 100,
      lastGpsPing: 'Agora mesmo',
      currentLocationName: 'Na Loja (Disponível)',
      complianceVerified: true,
      cnhNumber: this.newDriverCnh() || '12345678900'
    });

    this.newDriverName.set('');
    this.newDriverPhone.set('');
    this.newDriverPlate.set('');
    this.newDriverCnh.set('');
    this.showNewDriverModal.set(false);
  }

  assignDriverToRoute(routeId: string, driverId: string) {
    if (!driverId) {
      this.ecosystem.notify('Selecione um motoqueiro para atribuir a esta rota.', 'warning');
      return;
    }
    this.ecosystem.assignDriverToRoute(routeId, driverId);
  }

  toggleDriverStatus(driverId: string) {
    const driver = this.ecosystem.drivers().find(d => d.id === driverId);
    if (!driver) return;
    const nextStatus = driver.status === 'available' ? 'offline' : 'available';
    this.ecosystem.updateDriverStatus(driverId, nextStatus);
  }
}
