import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';

@Component({
  selector: 'app-admin-hub-window',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col space-y-6">
      <!-- HEADER UNIT CONTEXT -->
      <div class="flex items-center justify-between bg-[#1d1008] border border-[#4d2813] p-6 rounded-3xl shadow-xl">
        <div class="flex items-center gap-4">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 via-amber-600 to-amber-800 flex items-center justify-center text-white shadow-2xl overflow-hidden">
            <img src="/src/assets/images/gabinete_dono_icon_1793220878436.jpg" alt="Admin" class="w-full h-full object-cover" referrerpolicy="no-referrer">
          </div>
          <div>
            <h2 class="font-serif font-black text-2xl text-white">Diretoria da Unidade • Gerência da Loja</h2>
            <p class="text-xs text-amber-500 font-mono uppercase tracking-widest">Painel Administrativo Local: {{ currentTenant().name }}</p>
            <p class="text-[10px] text-stone-400 font-mono mt-0.5">Gestão interna desta unidade. A governança global da rede pertence ao HQ Central do Dono do App.</p>
          </div>
        </div>
        <div class="text-right hidden md:block">
          <div class="text-[10px] text-stone-500 uppercase font-bold">Status da Licença</div>
          <div class="flex items-center gap-2 justify-end">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-emerald-400 font-bold text-sm">{{ currentTenant().plan }} Ativa</span>
          </div>
        </div>
      </div>

      <!-- GRID ACTIONS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- SUBSCRIPTION CARD -->
        <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl p-6 shadow-xl text-stone-950 space-y-4">
          <div class="flex items-center gap-3">
            <mat-icon class="text-amber-800">card_membership</mat-icon>
            <h3 class="font-serif font-black text-lg">Assinatura &amp; Faturamento</h3>
          </div>
          <p class="text-xs text-stone-600">Gerencie seu plano SaaS, visualize faturas e atualize métodos de pagamento da unidade.</p>
          <div class="bg-[#ebdcc7] p-4 rounded-2xl border border-[#d6c3aa] space-y-2">
            <div class="flex justify-between text-[10px] font-bold uppercase text-stone-500">Próximo Vencimento</div>
            <div class="text-xl font-serif font-black text-stone-900">15 de Nov, 2026</div>
          </div>
          <button type="button" (click)="ecosystem.notify('Faturas sincronizadas com a tesouraria.', 'info')" class="w-full bg-[#1d1008] text-white font-bold py-3 rounded-2xl text-xs hover:bg-black transition-all cursor-pointer">Ver Faturas</button>
        </div>

        <!-- SECURITY & ACCESS -->
        <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl p-6 shadow-xl text-stone-950 space-y-4">
          <div class="flex items-center gap-3">
            <mat-icon class="text-amber-800">security</mat-icon>
            <h3 class="font-serif font-black text-lg">Segurança &amp; Acessos</h3>
          </div>
          <p class="text-xs text-stone-600">Controle quem pode acessar o PDV, KDS e Financeiro. Defina senhas de supervisão.</p>
          <div class="space-y-2">
            <div class="flex items-center justify-between p-3 bg-white border border-[#ded4c2] rounded-xl text-xs">
              <span class="font-bold">Senha de Cancelamento</span>
              <button type="button" (click)="ecosystem.notify('Modo de alteração de senha habilitado.', 'info')" class="text-amber-800 font-black cursor-pointer">EDITAR</button>
            </div>
            <div class="flex items-center justify-between p-3 bg-white border border-[#ded4c2] rounded-xl text-xs">
              <span class="font-bold">Biometria Facial (Habilitada)</span>
              <div class="w-8 h-4 bg-emerald-500 rounded-full relative">
                <div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- HARDWARE & MDM DA LOJA -->
        <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl p-6 shadow-xl text-stone-950 space-y-4">
          <div class="flex items-center gap-3">
            <mat-icon class="text-amber-800">developer_board</mat-icon>
            <h3 class="font-serif font-black text-lg">Hardware da Loja</h3>
          </div>
          <p class="text-xs text-stone-600">Dispositivos pareados exclusivamente nesta unidade ({{ storeDevices().length }} registrados).</p>
          <div class="flex items-center justify-between text-[10px] font-bold uppercase text-stone-500">Capacidade Utilizada</div>
          <div class="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
            <div [style.width.%]="(storeDevices().length / (currentTenant().devicesLimit || 6)) * 100" class="bg-amber-600 h-full"></div>
          </div>
          <div class="flex justify-between text-[10px] font-mono">
            <span>{{ storeDevices().length }} Ativos na Unidade</span>
            <span>Limite: {{ currentTenant().devicesLimit || 6 }}</span>
          </div>
          <button type="button" (click)="showDevicesModal.set(true)" class="w-full bg-[#1d1008] text-amber-300 font-bold py-3 rounded-2xl text-xs hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-2">
            <mat-icon class="text-sm">developer_board</mat-icon>
            <span>Ver Terminais da Minha Loja</span>
          </button>
        </div>
      </div>

      <!-- UNIT METRICS PREVIEW -->
      <div class="bg-[#1d1008] border border-[#4d2813] p-6 rounded-3xl shadow-xl flex-1 flex flex-col justify-center items-center text-center space-y-4">
        <mat-icon class="text-6xl text-amber-500/20">query_stats</mat-icon>
        <h4 class="font-serif font-black text-xl text-white">Centro de Inteligência da Diretoria da Loja</h4>
        <p class="text-xs text-stone-400 max-w-md">Relatórios de lucratividade real, DRE gerencial e métricas consolidadas da unidade {{ currentTenant().name }}.</p>
        <button type="button" (click)="ecosystem.notify('Métricas da Diretoria da Loja sincronizadas com o banco local.', 'success')" class="bg-amber-600 text-stone-950 font-black px-8 py-3 rounded-2xl text-xs shadow-2xl hover:bg-amber-500 transition-all uppercase cursor-pointer">Sincronizar Inteligência</button>
      </div>

      <!-- MODAL DISPOSITIVOS DA LOJA -->
      @if (showDevicesModal()) {
        <div class="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#faf7f0] border border-[#ded4c2] rounded-3xl max-w-2xl w-full p-6 text-stone-950 space-y-4 shadow-2xl animate-in zoom-in-95">
             <div class="flex justify-between items-center pb-3 border-b border-[#e8dfce]">
               <div class="flex items-center gap-2">
                 <mat-icon class="text-amber-800">store</mat-icon>
                 <div>
                   <h3 class="font-serif font-black text-base text-stone-900">Terminais Pareados: {{ currentTenant().name }}</h3>
                   <p class="text-[10px] text-stone-500">Dispositivos registrados exclusivamente para esta unidade comercial.</p>
                 </div>
               </div>
               <button type="button" (click)="showDevicesModal.set(false)" class="text-stone-400 hover:text-stone-800 font-bold text-lg cursor-pointer">✕</button>
             </div>

             <div class="space-y-3 max-h-80 overflow-y-auto pr-1">
               @for (dev of storeDevices(); track dev.id) {
                 <div class="bg-white border border-[#ded4c2] rounded-2xl p-4 flex items-center justify-between text-xs shadow-sm">
                   <div class="space-y-1">
                     <div class="font-bold text-stone-900 flex items-center gap-2">
                       <mat-icon class="text-amber-800 text-sm">
                         {{ dev.type === 'tablet' ? 'tablet' : dev.type === 'kiosk' ? 'kiosk' : 'desktop_windows' }}
                       </mat-icon>
                       <span>{{ dev.deviceName }}</span>
                     </div>
                     <div class="font-mono text-[10px] text-stone-500">
                       Serial: {{ dev.serialNumber }} • IP: {{ dev.ipAddress }} • {{ dev.location }}
                     </div>
                   </div>
                   <div class="flex items-center gap-3">
                     <span [class]="dev.status === 'online' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'" class="border px-2 py-0.5 rounded text-[9px] font-bold uppercase font-mono">
                       {{ dev.status }}
                     </span>
                     <button type="button" (click)="ecosystem.restartDevice(dev.id)" class="bg-[#ebdcc7] hover:bg-[#decbb4] text-stone-800 p-2 rounded-xl border border-[#d6c3aa] text-xs cursor-pointer" title="Reiniciar Dispositivo">
                       <mat-icon class="text-sm">refresh</mat-icon>
                     </button>
                   </div>
                 </div>
               } @empty {
                 <div class="py-8 text-center text-stone-500 font-serif italic text-xs">
                   Nenhum terminal atrelado especificamente a esta unidade no momento.
                 </div>
               }
             </div>

             <div class="pt-3 border-t border-[#e8dfce] flex justify-end">
               <button type="button" (click)="showDevicesModal.set(false)" class="bg-[#1d1008] text-white font-bold px-6 py-2.5 rounded-xl text-xs hover:bg-black transition-all cursor-pointer">Fechar</button>
             </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminHubWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly showDevicesModal = signal<boolean>(false);

  currentTenant = computed(() => {
    const id = this.ecosystem.currentTenantId();
    return this.ecosystem.tenants().find(t => t.id === id) || this.ecosystem.tenants()[0];
  });

  storeDevices = computed(() => {
    const tenantId = this.currentTenant().id;
    return this.ecosystem.devices().filter(d => d.tenantId === tenantId);
  });
}
