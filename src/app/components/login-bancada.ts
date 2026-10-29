import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EcosystemService } from '../services/ecosystem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login-bancada',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="min-h-screen bg-[#0e0805] text-stone-200 flex items-center justify-center p-3 sm:p-6 font-sans selection:bg-amber-600 selection:text-white overflow-x-hidden relative">
      
      <!-- LEATHER & CARBON TEXTURE OVERLAY -->
      <div class="absolute inset-0 pointer-events-none opacity-25 bg-carbon-pattern z-0"></div>

      <!-- MAIN TACTICAL LEATHER CONTAINER -->
      <div class="w-full max-w-6xl bg-[#1d1008] border-2 border-[#4d2813] rounded-3xl p-5 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.8)] relative z-10 flex flex-col gap-6">
        
        <!-- HEADER ROW -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#3d200f] pb-4">
          <div class="flex items-center gap-2 text-amber-500 font-serif font-black uppercase text-xs sm:text-sm tracking-wider">
            <mat-icon class="text-base">subtitles</mat-icon>
            <span>SETORES DA BANCADA DE TRABALHO</span>
          </div>

          <div class="text-amber-500 border border-dashed border-amber-600/60 bg-amber-950/30 px-3 py-1 rounded text-[10px] font-mono tracking-widest uppercase font-bold">
            REGISTRADO
          </div>
        </div>

        <!-- DEMO ACCOUNTS QUICK BAR -->
        <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-4 sm:p-5 space-y-3 shadow-lg">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div class="flex items-center gap-2 text-xs font-serif font-bold text-stone-100">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]"></span>
              <span>Modo Demonstração • Acesso Guiado às 3 Esferas</span>
            </div>
            <div class="text-[10px] font-mono text-amber-400/90 bg-[#170b04] px-3 py-1 rounded-lg border border-[#3b1e0d]">
              [DEMO / HOMOLOGAÇÃO] Perfis Pré-configurados para Navegação
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
            <!-- DEMO 1: Dono do App (HQ Central) -->
            <button
              type="button"
              (click)="loginHq('HQ Central (Admin)', 'admin@3eatcru.com.br')"
              class="group bg-[#422312] hover:bg-[#522d18] border border-[#63361c] hover:border-rose-500/60 rounded-xl p-3 flex items-center justify-between transition-all active:scale-98 text-left shadow-md cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <mat-icon class="text-xl">security</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-xs text-stone-100 group-hover:text-rose-300 transition-colors flex items-center gap-1.5">
                    <span>1. Dono do App</span>
                    <span class="text-[8px] bg-rose-950 text-rose-300 border border-rose-800 px-1 py-0.2 rounded font-mono">HQ</span>
                  </div>
                  <div class="text-[10px] font-mono text-amber-400/80">Gestão Global • Split 8%</div>
                </div>
              </div>
              <mat-icon class="text-rose-500 text-base group-hover:translate-x-1 transition-transform">admin_panel_settings</mat-icon>
            </button>

            <!-- DEMO 2: Empresa Cadastrada (OS) -->
            <button
              type="button"
              (click)="loginOperator('Burger & Co (PDV)', 'gerente@3eatcru.com')"
              class="group bg-[#422312] hover:bg-[#522d18] border border-[#63361c] hover:border-amber-500/60 rounded-xl p-3 flex items-center justify-between transition-all active:scale-98 text-left shadow-md cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
                  <mat-icon class="text-xl">point_of_sale</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-xs text-stone-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>2. Loja (OS)</span>
                    <span class="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1 py-0.2 rounded font-mono">LOJISTA</span>
                  </div>
                  <div class="text-[10px] font-mono text-amber-400/80">PDV, KDS &amp; Mesas HD</div>
                </div>
              </div>
              <mat-icon class="text-amber-500 text-base group-hover:translate-x-1 transition-transform">bolt</mat-icon>
            </button>

            <!-- DEMO 3: Consumidor Final (Páginas Públicas) -->
            <button
              type="button"
              (click)="openRegionalMarketplace()"
              class="group bg-[#422312] hover:bg-[#522d18] border border-[#63361c] hover:border-amber-500/60 rounded-xl p-3 flex items-center justify-between transition-all active:scale-98 text-left shadow-md cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-stone-950 flex items-center justify-center font-bold shadow-md shrink-0">
                  <mat-icon class="text-xl">storefront</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-xs text-stone-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>3. Consumidor</span>
                    <span class="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1 py-0.2 rounded font-mono">CLIENTE</span>
                  </div>
                  <div class="text-[10px] font-mono text-amber-400/80">Marketplace Regional</div>
                </div>
              </div>
              <mat-icon class="text-amber-500 text-base group-hover:translate-x-1 transition-transform">arrow_forward</mat-icon>
            </button>

            <!-- DEMO 4: Motorista / Entregador (App PWA) -->
            <button
              type="button"
              (click)="openDriverApp()"
              class="group bg-[#422312] hover:bg-[#522d18] border border-[#63361c] hover:border-purple-500/60 rounded-xl p-3 flex items-center justify-between transition-all active:scale-98 text-left shadow-md cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <mat-icon class="text-xl">two_wheeler</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-xs text-stone-100 group-hover:text-purple-300 transition-colors flex items-center gap-1.5">
                    <span>4. Motorista</span>
                    <span class="text-[8px] bg-purple-950 text-purple-300 border border-purple-800 px-1 py-0.2 rounded font-mono">DRIVER</span>
                  </div>
                  <div class="text-[10px] font-mono text-amber-400/80">3EAT Entregas • GPS PWA</div>
                </div>
              </div>
              <mat-icon class="text-purple-400 text-base group-hover:translate-x-1 transition-transform">near_me</mat-icon>
            </button>

            <!-- DEMO 5: Garçom / Comanda Mobile -->
            <button
              type="button"
              (click)="openWaiterApp()"
              class="group bg-[#422312] hover:bg-[#522d18] border border-[#63361c] hover:border-amber-500/60 rounded-xl p-3 flex items-center justify-between transition-all active:scale-98 text-left shadow-md cursor-pointer">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-bold shadow-md shrink-0">
                  <mat-icon class="text-xl">table_bar</mat-icon>
                </div>
                <div>
                  <div class="font-bold text-xs text-stone-100 group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                    <span>5. Garçom</span>
                    <span class="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1 py-0.2 rounded font-mono">WAITER</span>
                  </div>
                  <div class="text-[10px] font-mono text-amber-400/80">Comanda Mobile • Salão</div>
                </div>
              </div>
              <mat-icon class="text-amber-400 text-base group-hover:translate-x-1 transition-transform">room_service</mat-icon>
            </button>
          </div>
        </div>

        <!-- MAIN 3 SECTORS CARDS -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
          
          <!-- SECTOR 1: HQ CENTRAL (GABINETE DO DONO DO APP) -->
          <div class="bg-[#f5f0e6] border-2 border-[#ded5c5] rounded-2xl p-6 shadow-xl relative flex flex-col justify-between text-stone-900 group">
            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 via-amber-600 to-amber-700 text-white flex items-center justify-center font-bold shadow-md">
                  <mat-icon class="text-2xl">security</mat-icon>
                </div>
                <span class="border border-dashed border-rose-600/80 text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest font-mono uppercase">
                  SUPREMO / DONO
                </span>
              </div>

              <div class="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest mb-1">CONTROLE TOTAL DO SISTEMA</div>
              <h2 class="text-xl font-serif font-black text-stone-900 mb-2">HQ Central</h2>
              <p class="text-stone-600 text-xs leading-relaxed mb-6">
                Ferramenta exclusiva do <strong>Dono do App</strong>. Gerencie todas as lojas (tenants), controle a frota MDM de hardware, audite o split de comissões e governe o Portal Regional público.
              </p>
            </div>

            <button
              type="button"
              (click)="loginHq('HQ Central (Admin)', 'admin@3eatcru.com.br')"
              class="w-full bg-[#1e1008] hover:bg-[#2c170b] text-amber-300 hover:text-white font-extrabold py-3.5 px-4 rounded-xl border border-[#482814] flex items-center justify-center gap-2 text-xs transition-all active:scale-98 cursor-pointer shadow-lg">
              <mat-icon class="text-sm text-amber-500">security</mat-icon>
              <span>Entrar como Administrador HQ</span>
            </button>
          </div>

          <!-- SECTOR 2: STORE OS (SISTEMA DA LOJA CADASTRADA) -->
          <div class="bg-[#231208] border-2 border-[#6d3a1c] rounded-2xl p-6 shadow-2xl relative flex flex-col justify-between text-white group">
            <div class="absolute top-3 left-3 flex gap-1 text-[#4a2612] pointer-events-none">
              <mat-icon class="text-xs">grain</mat-icon>
            </div>

            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-bold shadow-md">
                  <mat-icon class="text-2xl">point_of_sale</mat-icon>
                </div>
                <span class="border border-dashed border-emerald-500/80 text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest font-mono uppercase">
                  CLIENTE / LOJISTA
                </span>
              </div>

              <div class="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest mb-1">ESFERA OPERACIONAL DA LOJA</div>
              <h2 class="text-xl font-serif font-black text-amber-400 mb-2">Painel de Gestão (OS)</h2>
              <p class="text-stone-300 text-xs leading-relaxed mb-6">
                O produto vendido ao lojista. Contém o PDV, Cozinha (KDS), Gestão de Mesas, Estoque ERP e o gerenciador da sua própria vitrine de vendas ("Minha Loja").
              </p>
            </div>

            <div class="flex flex-col gap-2">
              <button
                type="button"
                (click)="loginOperator('Burger & Co (PDV)', 'gerente@3eatcru.com')"
                class="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold py-3.5 px-3 rounded-xl shadow-lg border border-amber-400/50 flex items-center justify-center gap-1.5 text-xs transition-all active:scale-98 cursor-pointer">
                <mat-icon class="text-sm">laptop_chromebook</mat-icon>
                <span>Acessar Bancada da Loja (OS)</span>
              </button>
            </div>
          </div>

          <!-- SECTOR 3: CONSUMIDOR FINAL (PÁGINAS PÚBLICAS) -->
          <div class="bg-[#faf7f0] border-2 border-[#ded4c2] rounded-2xl p-6 shadow-xl relative flex flex-col justify-between text-stone-900 group">
            <div class="absolute -top-3 left-6 w-5 h-8 rounded-full border-2 border-stone-400 bg-transparent opacity-80 pointer-events-none flex items-center justify-center">
              <div class="w-2 h-5 rounded-full border-2 border-stone-400"></div>
            </div>

            <div>
              <div class="flex justify-between items-start mb-4">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-600 text-stone-950 flex items-center justify-center font-bold shadow-md">
                  <mat-icon class="text-2xl">storefront</mat-icon>
                </div>
                <span class="border border-dashed border-amber-700/80 text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-widest font-mono uppercase">
                  PÚBLICO
                </span>
              </div>

              <div class="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest mb-1">ESFERA 3 • CLIENTE FINAL</div>
              <h2 class="text-xl font-serif font-black text-stone-900 mb-2">Marketplace Regional</h2>
              <p class="text-stone-600 text-xs leading-relaxed mb-6">
                Portal de compras e fichário dos comércios locais: navegação pelo Hero Banner da praça, cálculo geodésico de distância por GPS, consulta de horários e acesso direto aos cardápios e vitrines das lojas para realização de pedidos.
              </p>
            </div>

            <button
              type="button"
              (click)="openRegionalMarketplace()"
              class="w-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-600 hover:from-emerald-500 hover:to-amber-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg border border-emerald-400/50 flex items-center justify-center gap-2 text-xs transition-all active:scale-98 cursor-pointer">
              <span>Explorar Marketplace Regional</span>
              <mat-icon class="text-sm">arrow_forward</mat-icon>
            </button>
          </div>

        </div>

        <!-- FOOTER ROW -->
        <div class="flex flex-col sm:flex-row justify-between items-center gap-2 pt-4 border-t border-[#3d200f] text-[10px] font-mono">
          <div class="flex items-center gap-2 text-amber-500/90 font-bold">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]"></span>
            <span>DEsk Engine • Sistema Tátil Zoneless &amp; Offline-First para Linux &amp; Web</span>
          </div>

          <div class="text-amber-600/70 font-semibold">
            Documento Reg. #1928-E • Protocolo Dual-OS
          </div>
        </div>

      </div>

    </div>
  `
})
export class LoginBancadaComponent {
  readonly ecosystem = inject(EcosystemService);
  private readonly router = inject(Router);

  loginOperator(name: string, email: string) {
    this.ecosystem.loginAs('operator', email, name, name, 'client');
    this.ecosystem.currentView.set('os');
  }

  loginHq(name: string, email: string) {
    this.ecosystem.loginAs('hq_admin', email, name, name, 'hq');
    this.ecosystem.currentView.set('hq');
  }

  openRegionalMarketplace() {
    this.ecosystem.activeTab.set('marketplace');
    this.ecosystem.currentView.set('marketplace');
    this.ecosystem.openRegionalMarketplace();
  }

  openDriverApp() {
    this.ecosystem.activeTab.set('driver');
    this.router.navigate(['/driver']);
  }

  openWaiterApp() {
    this.ecosystem.activeTab.set('client');
    this.router.navigate(['/waiter']);
  }
}





