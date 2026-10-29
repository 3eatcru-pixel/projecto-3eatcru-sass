import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { EcosystemService } from '../services/ecosystem.service';

import { PosWindowComponent } from './os-windows/pos-window';
import { TablesWindowComponent } from './os-windows/tables-window';
import { KdsWindowComponent } from './os-windows/kds-window';
import { InventoryWindowComponent } from './os-windows/inventory-window';
import { FinanceWindowComponent } from './os-windows/finance-window';
import { SettingsWindowComponent } from './os-windows/settings-window';
import { SystemWindowComponent } from './os-windows/system-window';
import { TasksWindowComponent } from './os-windows/tasks-window';
import { WhatsappWindowComponent } from './os-windows/whatsapp-window';
import { InstagramWindowComponent } from './os-windows/instagram-window';
import { IfoodWindowComponent } from './os-windows/ifood-window';
import { CalculatorWindowComponent } from './os-windows/calculator-window';
import { NotesWindowComponent } from './os-windows/notes-window';
import { ServicesWindowComponent } from './os-windows/services-window';
import { DocsWindowComponent } from './os-windows/docs-window';
import { ReportsWindowComponent } from './os-windows/reports-window';
import { OrderHistoryWindowComponent } from './os-windows/order-history-window';
import { CrmWindowComponent } from './os-windows/crm-window';
import { StoreManagerWindowComponent } from './os-windows/store-manager-window';
import { RhWindowComponent } from './os-windows/rh-window';
import { DriversWindowComponent } from './os-windows/drivers-window';
import { AdminHubWindowComponent } from './os-windows/admin-hub-window';
import { CalendarWindowComponent } from './os-windows/calendar-window';
import { SuppliersWindowComponent } from './os-windows/suppliers-window';
import { ReconciliationWindowComponent } from './os-windows/reconciliation-window';
import { StockAuditWindowComponent } from './os-windows/stock-audit-window';

import { DesktopIconComponent } from './os/desktop-icon';
import { TaskbarComponent } from './os/taskbar';
import { StartMenuComponent } from './os/start-menu';
import { VirtualKeyboardComponent } from './os/virtual-keyboard';
import { LockScreenComponent } from './os/lock-screen';
import { SystemModeBannerComponent } from './shared/system-mode-banner';

export type OSAppId = 
  | 'pos' | 'tables' | 'kds' | 'inventory' | 'finance' | 'appstore' 
  | 'browser' | 'settings' | 'system' | 'tasks' | 'whatsapp' | 'instagram' 
  | 'ifood' | 'agenda' | 'calculator' | 'notes' | 'services' | 'docs' 
  | 'reports' | 'history' | 'crm' | 'store-manager' | 'rh' | 'drivers' | 'admin-hub' | 'calendar'
  | 'suppliers' | 'reconciliation' | 'stock-audit';

export interface OSWindow {
  id: OSAppId;
  title: string;
  icon: string;
  isMinimized: boolean;
  isMaximized: boolean;
  dockPosition?: 'left' | 'right' | 'full';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-client-os',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    PosWindowComponent,
    TablesWindowComponent,
    KdsWindowComponent,
    InventoryWindowComponent,
    FinanceWindowComponent,
    SettingsWindowComponent,
    SystemWindowComponent,
    TasksWindowComponent,
    WhatsappWindowComponent,
    InstagramWindowComponent,
    IfoodWindowComponent,
    CalculatorWindowComponent,
    NotesWindowComponent,
    ServicesWindowComponent,
    DocsWindowComponent,
    ReportsWindowComponent,
    OrderHistoryWindowComponent,
    CrmWindowComponent,
    StoreManagerWindowComponent,
    RhWindowComponent,
    DriversWindowComponent,
    AdminHubWindowComponent,
    CalendarWindowComponent,
    SuppliersWindowComponent,
    ReconciliationWindowComponent,
    StockAuditWindowComponent,
    DesktopIconComponent,
    TaskbarComponent,
    StartMenuComponent,
    VirtualKeyboardComponent,
    LockScreenComponent,
    SystemModeBannerComponent
  ],
  template: `
    <div
      (contextmenu)="onDesktopContextMenu($event)"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp()"
      class="relative w-full h-screen overflow-hidden select-none flex flex-col justify-between font-sans transition-all duration-300"
      [class]="getWallpaperClass()">
      
      <!-- WALLPAPER TEXTURE OVERLAY -->
      <div class="absolute inset-0 bg-carbon-pattern opacity-20 pointer-events-none"></div>

      <!-- TOP EXECUTION BANNER (REAL VS SIMULATION) -->
      <div class="relative z-20 px-6 pt-3 shrink-0">
        <app-system-mode-banner />
      </div>

      <!-- DESKTOP WORKSPACE (ICONS & STORE WIDGET) -->
      <div class="relative flex-1 p-6 flex justify-between items-start overflow-hidden">
        
        <!-- GRID LAYOUT FOR DESKTOP ICONS (DYNAMIC SHORTCUTS WITH RIGHT CLICK) -->
        <div class="grid grid-flow-col grid-rows-6 sm:grid-rows-6 gap-x-6 gap-y-3 z-10">
          @for (shortcutId of desktopShortcuts(); track shortcutId) {
            @if (appDefinitions[shortcutId]; as app) {
              <app-os-desktop-icon 
                [label]="app.label" 
                [icon]="app.icon" 
                [colorClass]="app.colorClass" 
                [imageUrl]="app.imageUrl || null" 
                (clicked)="openApp(shortcutId, app.title, app.icon)"
                (iconContextMenu)="onIconContextMenu($event, shortcutId)" />
            }
          }
        </div>

        <!-- TOP RIGHT: STORE TERMINAL STATUS WIDGET -->
        <div class="z-10 bg-[#1d1008]/90 backdrop-blur-md border-2 border-[#4d2813] rounded-3xl p-4 sm:p-5 shadow-2xl w-80 text-stone-200 space-y-3">
          @if (isHqAuditMode()) {
            <div class="bg-gradient-to-r from-rose-950/90 via-amber-950/90 to-rose-950/90 border border-amber-600/80 rounded-2xl p-2.5 text-xs text-amber-200 flex items-center justify-between gap-2 shadow">
              <div class="flex items-center gap-1.5 font-bold">
                <mat-icon class="text-xs text-rose-400">admin_panel_settings</mat-icon>
                <span>Auditoria Dono do App</span>
              </div>
              <button
                type="button"
                (click)="returnToHq()"
                class="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-2 py-0.5 rounded text-[10px] cursor-pointer shadow">
                ← Voltar HQ
              </button>
            </div>
          }

          <div class="text-[10px] uppercase font-mono font-bold text-amber-500 pb-2 border-b border-[#3d200f] flex items-center justify-between">
            <span class="flex items-center gap-1 truncate max-w-[200px]">
              <mat-icon class="text-xs text-amber-400">store</mat-icon>
              <span>{{ currentTenant().name }}</span>
            </span>
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Terminal Operacional Online"></span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-stone-400">Ambiente:</span>
              <strong class="font-bold text-amber-300 uppercase text-[10px]">STORE OS (SISTEMA DA LOJA)</strong>
            </div>
            <div class="text-[9px] text-stone-400 bg-black/40 p-2 rounded-xl border border-[#3d200f] leading-tight">
              Terminal exclusivo dos operadores e gerentes da unidade. O cliente consumidor final navega via <strong>Marketplace Público (/regional)</strong>.
            </div>
            <div class="flex justify-between items-center">
              <span class="text-stone-400">Licença:</span>
              <span class="font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50 text-[10px] font-mono uppercase">
                {{ currentTenant().plan }} Ativa
              </span>
            </div>
            <div class="flex justify-between items-center pt-1 border-t border-[#3d200f]">
              <span class="text-stone-400">Papel de Parede:</span>
              <select
                [value]="currentWallpaper()"
                (change)="setWallpaper($event)"
                class="bg-[#2a160b] text-amber-300 text-[10px] font-mono font-bold border border-[#4d2813] rounded-lg px-2 py-0.5 outline-none cursor-pointer">
                <option value="carbon">Carbon Fiber</option>
                <option value="amber">Cyber Amber</option>
                <option value="emerald">Emerald Slate</option>
                <option value="obsidian">Dark Obsidian</option>
              </select>
            </div>
            <div class="pt-2 border-t border-[#3d200f] flex flex-col gap-1.5">
              <button (click)="openApp('store-manager', 'Gerenciador da Loja Pública', 'storefront')" class="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold py-2 rounded-2xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-transform active:scale-95">
                <mat-icon class="text-xs">brush</mat-icon><span>Personalizar Vitrine da Loja</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- GLOBAL BROADCAST MESSAGE -->
      @if (ecosystem.globalBroadcastMessage()) {
        <div class="fixed top-20 left-1/2 -translate-x-1/2 z-[300] w-full max-w-lg animate-in slide-in-from-top duration-500">
          <div class="bg-gradient-to-r from-rose-900 via-amber-900 to-rose-950 border-2 border-amber-500 rounded-3xl p-4 shadow-2xl flex items-center gap-4 text-white">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center shrink-0 shadow-lg">
              <mat-icon class="animate-bounce text-2xl">campaign</mat-icon>
            </div>
            <div class="flex-1">
              <div class="text-[10px] font-black uppercase text-amber-300 font-mono tracking-widest">Comunicado do HQ Central</div>
              <p class="text-sm font-bold leading-snug">{{ ecosystem.globalBroadcastMessage() }}</p>
            </div>
            <button (click)="ecosystem.globalBroadcastMessage.set(null)" class="text-amber-200 hover:text-white cursor-pointer"><mat-icon>close</mat-icon></button>
          </div>
        </div>
      }

      <!-- MULTI-WINDOW MANAGEMENT MOTOR -->
      @for (win of openWindows(); track win.id) {
        @if (!win.isMinimized) {
          <div
            (mousedown)="bringToFront(win.id)"
            [style.z-index]="win.zIndex"
            [style.left.px]="win.isMaximized || win.dockPosition ? null : win.x"
            [style.top.px]="win.isMaximized || win.dockPosition ? null : win.y"
            [style.width.px]="win.isMaximized || win.dockPosition ? null : win.width"
            [style.height.px]="win.isMaximized || win.dockPosition ? null : win.height"
            [class]="getWindowPositionClasses(win)"
            class="absolute bg-[#1d1008]/98 border-2 border-[#4d2813] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden backdrop-blur-xl transition-all duration-150">
            
            <!-- WINDOW TITLEBAR (DRAGGABLE HEADER WITH MOUSE ACTIONS) -->
            <div 
              (mousedown)="startDraggingWindow($event, win)"
              class="h-12 bg-[#170b04] border-b border-[#3d200f] px-4 flex items-center justify-between shrink-0 cursor-move select-none">
              
              <div class="flex items-center gap-3">
                <!-- WINDOW CONTROL BUTTONS -->
                <div class="flex items-center gap-1.5">
                  <button type="button" (click)="closeWindow(win.id)" class="w-3.5 h-3.5 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center group cursor-pointer shadow" title="Fechar (Alt+F4)">
                    <span class="opacity-0 group-hover:opacity-100 text-[8px] text-rose-950 font-bold">✕</span>
                  </button>
                  <button type="button" (click)="minimizeWindow(win.id)" class="w-3.5 h-3.5 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center group cursor-pointer shadow" title="Minimizar">
                    <span class="opacity-0 group-hover:opacity-100 text-[8px] text-amber-950 font-bold">─</span>
                  </button>
                  <button type="button" (click)="toggleMaximize(win.id)" class="w-3.5 h-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center group cursor-pointer shadow" title="Maximizar / Restaurar">
                    <span class="opacity-0 group-hover:opacity-100 text-[8px] text-emerald-950 font-bold">□</span>
                  </button>
                </div>

                <div class="flex items-center gap-2 pl-3 border-l border-[#3d200f] text-white font-serif font-black text-sm">
                  <mat-icon class="text-base text-amber-400">{{ win.icon }}</mat-icon>
                  <span>{{ win.title }}</span>
                </div>
              </div>

              <!-- DOCKING & QUICK SWITCHER ACTIONS -->
              <div class="flex items-center gap-1.5 bg-[#2b160b] p-1 rounded-2xl border border-[#482814] text-[10px]">
                <button type="button" (click)="dockWindow(win.id, 'left')" class="p-1 hover:bg-[#3d200f] rounded-lg text-stone-300 cursor-pointer" title="Ajustar à Esquerda (Snap Left)">
                  <mat-icon class="text-xs">view_sidebar</mat-icon>
                </button>
                <button type="button" (click)="dockWindow(win.id, 'right')" class="p-1 hover:bg-[#3d200f] rounded-lg text-stone-300 cursor-pointer" title="Ajustar à Direita (Snap Right)">
                  <mat-icon class="text-xs scale-x-[-1]">view_sidebar</mat-icon>
                </button>
                <button type="button" (click)="switchApp('pos')" [class]="win.id === 'pos' ? 'bg-amber-600 text-stone-950 font-black' : 'text-stone-400 hover:text-white'" class="px-2 py-0.5 rounded-lg font-bold">PDV</button>
                <button type="button" (click)="switchApp('kds')" [class]="win.id === 'kds' ? 'bg-amber-600 text-stone-950 font-black' : 'text-stone-400 hover:text-white'" class="px-2 py-0.5 rounded-lg font-bold">KDS</button>
                <button type="button" (click)="switchApp('admin-hub')" [class]="win.id === 'admin-hub' ? 'bg-amber-600 text-stone-950 font-black' : 'text-stone-400 hover:text-white'" class="px-2 py-0.5 rounded-lg font-bold uppercase">Diretoria</button>
              </div>
            </div>

            <!-- WINDOW BODY CONTENT -->
            <div class="flex-1 overflow-auto bg-[#0e0805] text-stone-200 p-4">
              @switch (win.id) {
                @case ('store-manager') { <app-store-manager-window /> }
                @case ('docs') { <app-docs-window /> }
                @case ('pos') { <app-pos-window /> }
                @case ('tables') { <app-tables-window /> }
                @case ('kds') { <app-kds-window /> }
                @case ('inventory') { <app-inventory-window /> }
                @case ('finance') { <app-finance-window /> }
                @case ('settings') { <app-settings-window /> }
                @case ('system') { <app-system-window /> }
                @case ('tasks') { <app-tasks-window /> }
                @case ('whatsapp') { <app-whatsapp-window /> }
                @case ('instagram') { <app-instagram-window /> }
                @case ('ifood') { <app-ifood-window /> }
                @case ('agenda') { <app-services-window initialTab="agenda" /> }
                @case ('calendar') { <app-calendar-window /> }
                @case ('services') { <app-services-window initialTab="dashboard" /> }
                @case ('calculator') { <app-calculator-window /> }
                @case ('notes') { <app-notes-window /> }
                @case ('reports') { <app-reports-window /> }
                @case ('history') { <app-order-history-window /> }
                @case ('crm') { <app-crm-window /> }
                @case ('rh') { <app-rh-window /> }
                @case ('drivers') { <app-drivers-window /> }
                @case ('admin-hub') { <app-admin-hub-window /> }
                @case ('suppliers') { <app-suppliers-window /> }
                @case ('reconciliation') { <app-reconciliation-window /> }
                @case ('stock-audit') { <app-stock-audit-window /> }
              }
            </div>
          </div>
        }
      }

      <!-- START MENU & COMPANY MENU BACKDROP DISMISSER (CLICK OUTSIDE TO CLOSE) -->
      @if (showStartMenu() || showCompanyMenu()) {
        <button
          type="button"
          aria-label="Fechar menus de navegação ao clicar fora"
          (click)="closeStartAndCompanyMenus()"
          class="fixed inset-0 z-[250] bg-transparent cursor-default border-none outline-none">
        </button>
      }

      <!-- DESKTOP CONTEXT MENU BACKDROP DISMISSER -->
      @if (desktopContextMenu()) {
        <button
          type="button"
          aria-label="Fechar menu de contexto da área de trabalho"
          (click)="closeDesktopContextMenu()"
          class="fixed inset-0 z-[550] bg-transparent cursor-default border-none outline-none">
        </button>
      }

      <!-- ICON CONTEXT MENU BACKDROP DISMISSER -->
      @if (iconContextMenu()) {
        <button
          type="button"
          aria-label="Fechar menu do atalho"
          (click)="closeIconContextMenu()"
          class="fixed inset-0 z-[550] bg-transparent cursor-default border-none outline-none">
        </button>
      }

      <!-- DESKTOP ICON CONTEXT MENU (RIGHT CLICK ON SHORTCUT) -->
      @if (iconContextMenu(); as iconMenu) {
        @if (appDefinitions[iconMenu.appId]; as app) {
          <div
            [style.left.px]="iconMenu.x"
            [style.top.px]="iconMenu.y"
            class="fixed z-[600] bg-[#180b04]/98 border-2 border-[#4d2813] rounded-2xl p-2 w-60 shadow-2xl text-xs text-stone-200 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
            
            <div class="px-3 py-1 text-[9px] font-mono font-bold uppercase text-amber-500 border-b border-[#3d200f] flex items-center justify-between">
              <span>Ações do Atalho</span>
              <mat-icon class="text-xs text-amber-400">{{ app.icon }}</mat-icon>
            </div>

            <button
              type="button"
              (click)="openAppFromContextMenu(iconMenu.appId)"
              class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#3d200f] flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer font-bold">
              <mat-icon class="text-sm text-amber-400">launch</mat-icon>
              <span>Abrir {{ app.label }}</span>
            </button>

            <div class="border-t border-[#3d200f] my-1"></div>

            <button
              type="button"
              (click)="removeDesktopShortcut(iconMenu.appId)"
              class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-950/80 text-rose-300 hover:text-white flex items-center gap-2 cursor-pointer font-bold">
              <mat-icon class="text-sm text-rose-400">delete_forever</mat-icon>
              <span>Remover da Área de Trabalho</span>
            </button>
          </div>
        }
      }

      <!-- DESKTOP CONTEXT MENU (MOUSE RIGHT CLICK ACTION ON WALLPAPER) -->
      @if (desktopContextMenu(); as menu) {
        <div
          [style.left.px]="menu.x"
          [style.top.px]="menu.y"
          class="fixed z-[600] bg-[#180b04]/98 border-2 border-[#4d2813] rounded-2xl p-2 w-56 shadow-2xl text-xs text-stone-200 space-y-1 backdrop-blur-xl animate-in fade-in zoom-in-95">
          
          <div class="px-3 py-1 text-[9px] font-mono font-bold uppercase text-amber-500 border-b border-[#3d200f]">
            Menu de Ações do SO
          </div>

          <button
            type="button"
            (click)="refreshDesktop()"
            class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#3d200f] flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer font-bold">
            <mat-icon class="text-sm text-amber-400">refresh</mat-icon>
            <span>Atualizar Área de Trabalho</span>
          </button>

          <button
            type="button"
            (click)="openApp('calendar', 'Calendário & Agenda Operacional', 'calendar_month')"
            class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#3d200f] flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer">
            <mat-icon class="text-sm text-amber-400">calendar_month</mat-icon>
            <span>Calendário & Agenda</span>
          </button>

          <button
            type="button"
            (click)="openApp('notes', 'Notas & Memos', 'description')"
            class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#3d200f] flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer">
            <mat-icon class="text-sm text-amber-400">note_add</mat-icon>
            <span>Nova Nota Rápida</span>
          </button>

          <button
            type="button"
            (click)="openApp('system', 'Este Computador', 'folder')"
            class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#3d200f] flex items-center gap-2 text-stone-200 hover:text-white cursor-pointer">
            <mat-icon class="text-sm text-amber-400">monitor_heart</mat-icon>
            <span>Gerenciador de Tarefas</span>
          </button>

          <div class="border-t border-[#3d200f] my-1"></div>

          <button
            type="button"
            (click)="lockTerminal()"
            class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-[#3d200f] flex items-center gap-2 text-amber-300 hover:text-white cursor-pointer font-bold">
            <mat-icon class="text-sm text-amber-400">lock</mat-icon>
            <span>Bloquear Terminal (PIN)</span>
          </button>

          <button
            type="button"
            (click)="ecosystem.logout()"
            class="w-full text-left px-3 py-1.5 rounded-xl hover:bg-rose-950/80 text-rose-300 hover:text-white flex items-center gap-2 cursor-pointer">
            <mat-icon class="text-sm">power_settings_new</mat-icon>
            <span>Encerrar Sessão da Loja</span>
          </button>
        </div>
      }

      <!-- START MENU & TASKBAR -->
      @if (showStartMenu()) {
        <app-os-start-menu 
          [pinnedAppIds]="desktopShortcuts()"
          (appSelected)="openApp($event.id, $event.title, $event.icon)" 
          (pinToDesktop)="addDesktopShortcut($event)"
          (unpinFromDesktop)="removeDesktopShortcut($event)"
          (lockClicked)="lockTerminal()" />
      }

      <app-os-taskbar 
        [openWindows]="openWindows()"
        [activeWinId]="activeWinId()"
        [showCompanyMenu]="showCompanyMenu()"
        [currentTime]="currentTime()"
        [currentDate]="currentDate()"
        (startClicked)="toggleStartMenu()"
        (windowSelected)="focusOrRestoreWindow($event)"
        (keyboardClicked)="toggleKeyboard()"
        (companyMenuClicked)="toggleCompanyMenu()"
        (tenantSelected)="selectCompany($event)"
        (clockClicked)="openApp('calendar', 'Calendário & Agenda Operacional', 'calendar_month')" />

      @if (showKeyboard()) {
        <app-os-virtual-keyboard (closeClicked)="showKeyboard.set(false)" />
      }

      <!-- LOCK SCREEN OVERLAY -->
      @if (isLocked()) {
        <app-os-lock-screen
          [currentTime]="currentTime()"
          [currentDate]="currentDate()"
          [tenantName]="currentTenant().name"
          [operatorName]="ecosystem.currentSession()?.name || 'Operador'"
          (unlocked)="isLocked.set(false)" />
      }

      <!-- MAINTENANCE OVERLAY -->
      @if (ecosystem.maintenanceMode()) {
        <div class="absolute inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
           <div class="w-24 h-24 rounded-3xl bg-amber-600 text-stone-950 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(217,119,6,0.5)] animate-pulse">
              <mat-icon class="text-5xl">build_circle</mat-icon>
           </div>
           <h2 class="font-serif font-black text-4xl text-white mb-2">SISTEMA EM MANUTENÇÃO</h2>
           <p class="text-amber-500 font-mono text-sm uppercase tracking-widest mb-6">Atualização Crítica do SaaS via HQ Central</p>
           <p class="text-stone-400 max-w-md text-sm leading-relaxed">
             Estamos otimizando a infraestrutura global para garantir a melhor performance para sua loja. O acesso retornará em alguns minutos.
           </p>
           <div class="mt-8 flex items-center gap-3">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
              <span class="text-[10px] font-bold text-stone-500 uppercase tracking-tighter">Sincronizando com Cluster Central...</span>
           </div>
        </div>
      }
    </div>
  `
})
export class ClientOsComponent implements OnInit, OnDestroy {
  readonly ecosystem = inject(EcosystemService);
  private readonly router = inject(Router);

  readonly isHqAuditMode = computed(() => {
    const session = this.ecosystem.currentSession();
    return session && session.role === 'hq_admin';
  });

  readonly currentWallpaper = signal<'carbon' | 'amber' | 'emerald' | 'obsidian'>('carbon');
  readonly isLocked = signal<boolean>(false);

  // DYNAMIC DESKTOP SHORTCUTS ARRAY & ICON CONTEXT MENU
  readonly desktopShortcuts = signal<OSAppId[]>([
    'pos', 'tables', 'kds', 'inventory', 'finance', 'suppliers',
    'reconciliation', 'stock-audit', 'store-manager', 'whatsapp',
    'ifood', 'instagram', 'tasks', 'calendar', 'agenda', 'services',
    'rh', 'drivers', 'history', 'reports', 'crm', 'docs',
    'calculator', 'notes', 'admin-hub'
  ]);

  readonly iconContextMenu = signal<{ x: number; y: number; appId: OSAppId } | null>(null);

  readonly appDefinitions: Record<OSAppId, { label: string; title: string; icon: string; colorClass: string; imageUrl?: string }> = {
    pos: { label: 'PDV Caixa', title: 'PDV - Frente de Caixa', icon: 'point_of_sale', colorClass: 'from-amber-500 via-orange-600 to-amber-700' },
    tables: { label: 'Mesas & Salão', title: 'Mesas & Salão', icon: 'table_restaurant', colorClass: 'from-amber-600 to-amber-800' },
    kds: { label: 'KDS Cozinha', title: 'KDS Cozinha', icon: 'soup_kitchen', colorClass: 'from-emerald-600 to-emerald-800' },
    inventory: { label: 'Estoque ERP', title: 'Estoque ERP', icon: 'inventory_2', colorClass: 'from-amber-500 to-amber-700' },
    finance: { label: 'Caixa & Finanças', title: 'Financeiro & Caixa', icon: 'account_balance_wallet', colorClass: 'from-emerald-500 to-teal-700' },
    suppliers: { label: 'Fornecedores', title: 'Gestão de Fornecedores & Compras', icon: 'local_shipping', colorClass: 'from-amber-600 via-orange-600 to-amber-800' },
    reconciliation: { label: 'Reconciliação', title: 'Reconciliação Financeira & Adquirentes', icon: 'swap_horiz', colorClass: 'from-emerald-600 to-teal-800' },
    'stock-audit': { label: 'Inventário Cego', title: 'Auditoria de Estoque & Contagem Cega', icon: 'fact_check', colorClass: 'from-amber-500 to-orange-700' },
    'store-manager': { label: 'Minha Loja', title: 'Gerenciador da Loja Pública', icon: 'storefront', colorClass: 'from-amber-400 via-orange-500 to-amber-600' },
    whatsapp: { label: 'WhatsApp', title: 'WhatsApp Business', icon: 'chat', colorClass: 'from-emerald-600 to-emerald-800' },
    ifood: { label: 'iFood', title: 'Portal iFood', icon: 'delivery_dining', colorClass: 'from-rose-600 to-red-800' },
    instagram: { label: 'Instagram', title: 'Instagram Business', icon: 'camera_alt', colorClass: 'from-amber-600 via-rose-700 to-amber-800' },
    tasks: { label: 'Tarefas OS', title: 'Tarefas OS', icon: 'task_alt', colorClass: 'from-rose-600 to-rose-800' },
    calendar: { label: 'Calendário OS', title: 'Calendário & Agenda Operacional', icon: 'calendar_month', colorClass: 'from-amber-500 to-orange-600' },
    agenda: { label: 'Agenda', title: 'Agenda & Reservas', icon: 'event_note', colorClass: 'from-amber-500 to-orange-600' },
    services: { label: 'Serviços', title: 'Ordens de Serviço', icon: 'handyman', colorClass: 'from-amber-600 to-amber-800' },
    rh: { label: 'RH & Pessoal', title: 'RH & Gestão de Pessoal', icon: 'badge', colorClass: 'from-amber-600 via-orange-600 to-amber-800' },
    drivers: { label: 'Hub Logística', title: 'Hub de Logística & Dispatcher', icon: 'alt_route', colorClass: 'from-emerald-500 via-teal-600 to-emerald-800' },
    history: { label: 'Histórico', title: 'Histórico de Vendas', icon: 'history', colorClass: 'from-indigo-500 to-indigo-700' },
    reports: { label: 'Relatórios', title: 'Inteligência & KPIs', icon: 'analytics', colorClass: 'from-indigo-600 to-indigo-800' },
    crm: { label: 'Fidelidade', title: 'Fidelidade & CRM', icon: 'loyalty', colorClass: 'from-indigo-400 to-indigo-600' },
    docs: { label: 'Manual & Specs', title: 'Manual & Specs 3EAT', icon: 'menu_book', colorClass: 'from-amber-500 to-amber-700' },
    calculator: { label: 'Calculadora', title: 'Calculadora', icon: 'calculate', colorClass: 'from-stone-600 to-stone-800' },
    notes: { label: 'Notas', title: 'Notas & Memos', icon: 'description', colorClass: 'from-amber-400 to-amber-600' },
    'admin-hub': { label: 'Diretoria da Loja', title: 'Diretoria da Loja Cadastrada', icon: 'admin_panel_settings', imageUrl: '/src/assets/images/gabinete_dono_icon_1793220878436.jpg', colorClass: 'from-rose-600 via-amber-600 to-amber-800' },
    appstore: { label: 'App Store', title: 'App Store', icon: 'local_mall', colorClass: 'from-amber-600 to-amber-800' },
    browser: { label: 'Navegador Web', title: 'Navegador Web', icon: 'public', colorClass: 'from-amber-600 to-amber-800' },
    settings: { label: 'Painel Controle', title: 'Painel de Controle', icon: 'settings', colorClass: 'from-stone-700 to-stone-900' },
    system: { label: 'Este Computador', title: 'Este Computador', icon: 'folder', colorClass: 'from-amber-700 to-amber-900' }
  };

  // MANAGED OPEN WINDOWS LIST & ACTIVE FOCUS
  readonly openWindows = signal<OSWindow[]>([
    {
      id: 'docs',
      title: 'Manual & Specs 3EAT',
      icon: 'menu_book',
      isMinimized: false,
      isMaximized: false,
      x: 80,
      y: 40,
      width: 1000,
      height: 620,
      zIndex: 50
    }
  ]);

  readonly activeWinId = signal<OSAppId | null>('docs');

  // MOUSE DRAGGING STATE ENGINE
  private isDragging = false;
  private dragWinId: OSAppId | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private winInitialX = 0;
  private winInitialY = 0;
  private topZIndex = 50;

  readonly showStartMenu = signal<boolean>(false);
  readonly showCompanyMenu = signal<boolean>(false);
  readonly showKeyboard = signal<boolean>(false);
  readonly desktopContextMenu = signal<{ x: number; y: number } | null>(null);

  currentTenant = computed(() => {
    const id = this.ecosystem.currentTenantId();
    return this.ecosystem.tenants().find(t => t.id === id) || this.ecosystem.tenants()[0];
  });

  readonly currentTime = signal<string>('12:04');
  readonly currentDate = signal<string>('ter, 27 de out.');
  private clockInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    const session = this.ecosystem.currentSession();
    if (!session || session.role === 'guest') {
      this.ecosystem.notify('Por favor, faça login com a conta de Lojista ou Dono para acessar o terminal da loja.', 'info');
      this.router.navigate(['/login']);
      return;
    }
    this.updateClock();
    this.clockInterval = setInterval(() => this.updateClock(), 1000);
  }

  ngOnDestroy() {
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    this.currentTime.set(`${hours}:${minutes}`);

    const days = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    this.currentDate.set(`${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`);
  }

  getWallpaperClass(): string {
    switch (this.currentWallpaper()) {
      case 'amber':
        return 'bg-gradient-to-br from-[#1a0a02] via-[#2d1205] to-[#120601]';
      case 'emerald':
        return 'bg-gradient-to-br from-[#04140d] via-[#082218] to-[#020b07]';
      case 'obsidian':
        return 'bg-gradient-to-br from-[#09090b] via-[#121215] to-[#050506]';
      case 'carbon':
      default:
        return 'bg-[#0e0805]';
    }
  }

  setWallpaper(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.currentWallpaper.set(select.value as 'carbon' | 'amber' | 'emerald' | 'obsidian');
  }

  onDesktopContextMenu(event: MouseEvent) {
    event.preventDefault();
    this.closeIconContextMenu();
    this.desktopContextMenu.set({ x: event.clientX, y: event.clientY });
  }

  closeDesktopContextMenu() {
    this.desktopContextMenu.set(null);
  }

  onIconContextMenu(event: MouseEvent, appId: OSAppId) {
    event.preventDefault();
    event.stopPropagation();
    this.closeDesktopContextMenu();
    this.iconContextMenu.set({ x: event.clientX, y: event.clientY, appId });
  }

  closeIconContextMenu() {
    this.iconContextMenu.set(null);
  }

  openAppFromContextMenu(appId: OSAppId) {
    const app = this.appDefinitions[appId];
    if (app) {
      this.openApp(appId, app.title, app.icon);
    }
    this.closeIconContextMenu();
  }

  addDesktopShortcut(id: OSAppId) {
    if (this.desktopShortcuts().includes(id)) {
      this.ecosystem.notify('Este atalho já está na Área de Trabalho.', 'info');
    } else {
      this.desktopShortcuts.update(list => [...list, id]);
      this.ecosystem.notify('Atalho adicionado à Área de Trabalho!', 'success');
    }
  }

  removeDesktopShortcut(id: OSAppId) {
    this.desktopShortcuts.update(list => list.filter(s => s !== id));
    this.closeIconContextMenu();
    this.ecosystem.notify('Atalho removido da Área de Trabalho.', 'info');
  }

  closeStartAndCompanyMenus() {
    this.showStartMenu.set(false);
    this.showCompanyMenu.set(false);
  }

  refreshDesktop() {
    this.closeDesktopContextMenu();
    this.ecosystem.notify('Área de Trabalho atualizada.', 'info');
  }

  lockTerminal() {
    this.showStartMenu.set(false);
    this.closeDesktopContextMenu();
    this.isLocked.set(true);
  }

  returnToHq() {
    this.ecosystem.currentView.set('hq');
    this.router.navigate(['/hq']);
    this.ecosystem.notify('Retornando ao Gabinete Executivo HQ Central.', 'info');
  }

  openApp(id: OSAppId, title: string, icon: string) {
    this.showStartMenu.set(false);
    this.showCompanyMenu.set(false);
    this.closeDesktopContextMenu();
    this.closeIconContextMenu();

    this.topZIndex += 1;
    const existing = this.openWindows().find(w => w.id === id);

    if (existing) {
      this.openWindows.update(list =>
        list.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: this.topZIndex } : w)
      );
    } else {
      const offsetX = 60 + (this.openWindows().length * 20);
      const offsetY = 40 + (this.openWindows().length * 20);

      this.openWindows.update(list => [
        ...list,
        {
          id,
          title,
          icon,
          isMinimized: false,
          isMaximized: false,
          x: offsetX,
          y: offsetY,
          width: 980,
          height: 600,
          zIndex: this.topZIndex
        }
      ]);
    }

    this.activeWinId.set(id);
  }

  switchApp(id: OSAppId) {
    const appTitles: Record<OSAppId, { title: string; icon: string }> = {
      docs: { title: 'Manual & Specs 3EAT', icon: 'menu_book' },
      pos: { title: 'PDV - Ponto de Venda', icon: 'point_of_sale' },
      tables: { title: 'Mesas & Salão', icon: 'table_restaurant' },
      kds: { title: 'KDS Cozinha', icon: 'soup_kitchen' },
      inventory: { title: 'Estoque ERP', icon: 'inventory_2' },
      finance: { title: 'Financeiro & Caixa', icon: 'account_balance_wallet' },
      appstore: { title: 'App Store', icon: 'local_mall' },
      browser: { title: 'Navegador Web', icon: 'public' },
      settings: { title: 'Painel de Controle', icon: 'settings' },
      system: { title: 'Este Computador', icon: 'folder' },
      tasks: { title: 'Tarefas OS', icon: 'task_alt' },
      whatsapp: { title: 'WhatsApp Business', icon: 'chat' },
      instagram: { title: 'Instagram Business', icon: 'camera_alt' },
      ifood: { title: 'Portal iFood', icon: 'delivery_dining' },
      agenda: { title: 'Agenda & Reservas', icon: 'event_note' },
      calendar: { title: 'Calendário & Agenda Operacional', icon: 'calendar_month' },
      calculator: { title: 'Calculadora', icon: 'calculate' },
      notes: { title: 'Notas & Memos', icon: 'description' },
      services: { title: 'Ordens de Serviço', icon: 'handyman' },
      reports: { title: 'Inteligência & KPIs', icon: 'analytics' },
      history: { title: 'Histórico de Vendas', icon: 'history' },
      crm: { title: 'Fidelidade & CRM', icon: 'loyalty' },
      'store-manager': { title: 'Gerenciador da Loja Pública', icon: 'storefront' },
      rh: { title: 'RH & Gestão de Pessoal', icon: 'badge' },
      drivers: { title: 'Hub de Logística & Dispatcher', icon: 'alt_route' },
      'admin-hub': { title: 'Diretoria da Loja Cadastrada', icon: 'admin_panel_settings' },
      suppliers: { title: 'Gestão de Fornecedores & Compras', icon: 'local_shipping' },
      reconciliation: { title: 'Reconciliação Financeira & Adquirentes', icon: 'swap_horiz' },
      'stock-audit': { title: 'Auditoria de Estoque & Contagem Cega', icon: 'fact_check' }
    };

    const info = appTitles[id];
    if (info) {
      this.openApp(id, info.title, info.icon);
    }
  }

  bringToFront(id: OSAppId) {
    this.topZIndex += 1;
    this.openWindows.update(list =>
      list.map(w => w.id === id ? { ...w, zIndex: this.topZIndex } : w)
    );
    this.activeWinId.set(id);
  }

  focusOrRestoreWindow(id: string) {
    const appId = id as OSAppId;
    const win = this.openWindows().find(w => w.id === appId);
    if (win) {
      if (win.isMinimized || this.activeWinId() !== appId) {
        this.bringToFront(appId);
        this.openWindows.update(list =>
          list.map(w => w.id === appId ? { ...w, isMinimized: false } : w)
        );
      } else {
        this.minimizeWindow(appId);
      }
    }
  }

  closeWindow(id: OSAppId) {
    this.openWindows.update(list => list.filter(w => w.id !== id));
    if (this.activeWinId() === id) {
      const remaining = this.openWindows();
      this.activeWinId.set(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
    }
  }

  minimizeWindow(id: OSAppId) {
    this.openWindows.update(list =>
      list.map(w => w.id === id ? { ...w, isMinimized: true } : w)
    );
    if (this.activeWinId() === id) {
      this.activeWinId.set(null);
    }
  }

  toggleMaximize(id: OSAppId) {
    this.openWindows.update(list =>
      list.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized, dockPosition: undefined } : w)
    );
    this.bringToFront(id);
  }

  dockWindow(id: OSAppId, position: 'left' | 'right') {
    this.openWindows.update(list =>
      list.map(w => w.id === id ? { ...w, dockPosition: w.dockPosition === position ? undefined : position, isMaximized: false } : w)
    );
    this.bringToFront(id);
  }

  getWindowPositionClasses(win: OSWindow): string {
    if (win.isMaximized) {
      return 'inset-x-3 inset-y-6 sm:inset-x-6 sm:inset-y-6 rounded-3xl';
    }
    if (win.dockPosition === 'left') {
      return 'left-3 top-6 bottom-6 w-[48%] rounded-3xl';
    }
    if (win.dockPosition === 'right') {
      return 'right-3 top-6 bottom-6 w-[48%] rounded-3xl';
    }
    return 'rounded-3xl';
  }

  // MOUSE DRAGGING MOTOR
  startDraggingWindow(event: MouseEvent, win: OSWindow) {
    if (win.isMaximized) return;
    this.isDragging = true;
    this.dragWinId = win.id;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.winInitialX = win.x;
    this.winInitialY = win.y;
    this.bringToFront(win.id);
  }

  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || !this.dragWinId) return;
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;

    const newX = Math.max(10, this.winInitialX + deltaX);
    const newY = Math.max(10, this.winInitialY + deltaY);

    this.openWindows.update(list =>
      list.map(w => w.id === this.dragWinId ? { ...w, x: newX, y: newY } : w)
    );
  }

  onMouseUp() {
    this.isDragging = false;
    this.dragWinId = null;
  }

  toggleStartMenu() {
    this.showStartMenu.update(v => !v);
    this.showCompanyMenu.set(false);
  }

  toggleCompanyMenu() {
    this.showCompanyMenu.update(v => !v);
    this.showStartMenu.set(false);
  }

  selectCompany(tenantId: string) {
    this.ecosystem.currentTenantId.set(tenantId);
    this.showCompanyMenu.set(false);
  }

  toggleKeyboard() {
    this.showKeyboard.update(v => !v);
  }
}


