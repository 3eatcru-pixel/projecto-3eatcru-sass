import { ChangeDetectionStrategy, Component, input, output, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

@Component({
  selector: 'app-ecosystem-switcher',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed top-4 right-4 z-[9990]">
      <div class="relative">
        <button
          type="button"
          (click)="toggleRequest.emit()"
          class="flex items-center gap-2 bg-[#161618] hover:bg-[#202023] text-[#f59e0b] px-4 py-1.5 rounded-full border border-[#f59e0b]/40 shadow-2xl backdrop-blur-md text-[10px] font-mono font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 cursor-pointer">
          <span class="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse shadow-[0_0_8px_#10b981]"></span>
          <span>ECOSSISTEMA 3EATCRU</span>
          <mat-icon class="text-xs text-[#f59e0b]">unfold_more</mat-icon>
        </button>

        @if (show()) {
          <div class="absolute right-0 top-10 bg-[#161618]/98 border border-[rgba(237,238,239,0.15)] rounded-2xl p-2.5 w-72 shadow-2xl backdrop-blur-xl text-[#edeeef] space-y-1.5 z-[9999] animate-in fade-in zoom-in-95 duration-150 font-mono">
            <div class="text-[9px] uppercase font-bold text-[#f59e0b] px-3 py-1 border-b border-[rgba(237,238,239,0.1)] tracking-wider flex justify-between items-center">
              <span>Alternar Esfera de Acesso</span>
              <span class="text-[8px] bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">3 NÍVEIS</span>
            </div>

            @for (item of items(); track item.path) {
              <button
                type="button"
                (click)="navigate.emit(item.path)"
                class="w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center gap-2.5 hover:bg-white/5 text-[#edeeef] hover:text-[#f59e0b] transition-colors font-bold group cursor-pointer border border-transparent hover:border-white/10">
                <div class="w-8 h-8 rounded-lg bg-[#251b14] border border-[#482814] flex items-center justify-center shrink-0 text-[#f59e0b] group-hover:scale-105 transition-transform">
                  <mat-icon class="text-base">{{ item.icon }}</mat-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-bold text-white text-xs group-hover:text-[#f59e0b] truncate">{{ item.label }}</span>
                    <span class="text-[8px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0" [class]="item.badgeClass">{{ item.badge }}</span>
                  </div>
                  <div class="text-[9px] text-[#edeeef]/60 font-normal leading-tight mt-0.5">{{ item.desc }}</div>
                </div>
              </button>
            }

            <div class="pt-1.5 border-t border-[rgba(237,238,239,0.1)]">
              <button
                type="button"
                (click)="navigate.emit('/login')"
                class="w-full text-left px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2 hover:bg-white/5 text-[#edeeef]/60 hover:text-[#f59e0b] transition-colors font-bold cursor-pointer">
                <mat-icon class="text-xs">login</mat-icon>
                <span>Terminal Inicial / Seleção de Perfil</span>
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class EcosystemSwitcherComponent {
  private readonly ecosystemService = inject(EcosystemService);
  
  show = input.required<boolean>();
  
  toggleRequest = output<void>();
  navigate = output<string>();

  // Only show HQ Central to Super Admins (App Owners)
  readonly items = computed(() => {
    const session = this.ecosystemService.currentSession();
    const isHqAdmin = session && session.role === 'hq_admin';
    
    const allItems = [
      {
        path: '/hq',
        label: 'HQ CENTRAL (DONO DO APP)',
        desc: 'Exclusivo do Dono do App: Governança global de lojas, split 8%, planos SaaS, MDM & Infraestrutura',
        icon: 'security',
        badge: 'DONO DO APP',
        badgeClass: 'bg-rose-950 text-rose-300 border border-rose-800',
        adminOnly: true
      },
      {
        path: '/os',
        label: 'SISTEMA DA LOJA (STORE OS)',
        desc: 'Exclusivo da Loja Cadastrada: PDV Caixa, Mesas, KDS, Estoque ERP & Diretoria da Unidade',
        icon: 'point_of_sale',
        badge: 'EMPRESA / LOJA',
        badgeClass: 'bg-amber-950 text-amber-300 border border-amber-800',
        adminOnly: false
      },
      {
        path: '/regional',
        label: 'PÁGINAS PÚBLICAS (CONSUMIDOR FINAL)',
        desc: 'Acesso Público do Cliente: Marketplace Regional por GPS, Vitrine e Catálogo da Loja',
        icon: 'storefront',
        badge: 'CONSUMIDOR',
        badgeClass: 'bg-emerald-950 text-emerald-300 border border-emerald-800',
        adminOnly: false
      },
      {
        path: '/driver',
        label: 'APP DE LOGÍSTICA (3EAT ENTREGAS)',
        desc: 'GPS Mobile para Entregadores, Aceite de Rotas & Comprovantes',
        icon: 'two_wheeler',
        badge: 'MOTORISTA',
        badgeClass: 'bg-indigo-950 text-indigo-300 border border-indigo-800',
        adminOnly: false
      },
      {
        path: '/waiter',
        label: 'APP COMANDA DIGITAL (GARÇOM)',
        desc: 'Comandas móveis, lançamento de pedidos por mesa & KDS',
        icon: 'table_bar',
        badge: 'GARÇOM',
        badgeClass: 'bg-amber-950 text-amber-300 border border-amber-800',
        adminOnly: false
      }
    ];

    return allItems.filter(item => !item.adminOnly || isHqAdmin);
  });
}
