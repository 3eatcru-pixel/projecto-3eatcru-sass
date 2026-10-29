import { ChangeDetectionStrategy, Component, input, output, model } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pos-scanner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md space-y-3 shrink-0">
      <!-- Sector Mode Switcher -->
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
        <div class="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            (click)="posSector.set('restaurant')"
            [class]="posSector() === 'restaurant' ? 'bg-orange-600 text-white font-black shadow' : 'text-slate-400 hover:text-white'"
            class="px-3 py-1 rounded-lg text-[10px] uppercase font-black flex items-center gap-1.5 transition-all">
            <mat-icon class="text-xs">restaurant</mat-icon> Restaurante
          </button>
          
          <button
            type="button"
            (click)="posSector.set('retail')"
            [class]="posSector() === 'retail' ? 'bg-orange-600 text-white font-black shadow' : 'text-slate-400 hover:text-white'"
            class="px-3 py-1 rounded-lg text-[10px] uppercase font-black flex items-center gap-1.5 transition-all">
            <mat-icon class="text-xs">qr_code_scanner</mat-icon> Varejo EAN-13
          </button>

          <button
            type="button"
            (click)="posSector.set('services')"
            [class]="posSector() === 'services' ? 'bg-orange-600 text-white font-black shadow' : 'text-slate-400 hover:text-white'"
            class="px-3 py-1 rounded-lg text-[10px] uppercase font-black flex items-center gap-1.5 transition-all">
            <mat-icon class="text-xs">build</mat-icon> Serviços &amp; O.S.
          </button>
        </div>

        <!-- Retail Specific Controls -->
        <div class="flex items-center gap-2">
          @if (posSector() === 'retail') {
            <button
              type="button"
              (click)="isWholesale.set(!isWholesale())"
              [class]="isWholesale() ? 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'"
              class="px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all">
              <mat-icon class="text-xs">{{ isWholesale() ? 'factory' : 'store' }}</mat-icon>
              {{ isWholesale() ? 'Atacado (Wholesale)' : 'Varejo (Retail)' }}
            </button>

            <button
              type="button"
              (click)="fastScanMode.set(!fastScanMode())"
              [class]="fastScanMode() ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'"
              class="px-2.5 py-1 rounded-xl border text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all">
              <mat-icon class="text-xs">{{ fastScanMode() ? 'bolt' : 'input' }}</mat-icon>
              Fast Scan: {{ fastScanMode() ? 'ON' : 'OFF' }}
            </button>
          }

          <button
            type="button"
            (click)="openScale.emit()"
            class="px-2.5 py-1 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:bg-cyan-900 transition-all cursor-pointer">
            <mat-icon class="text-xs text-cyan-400">scale</mat-icon> Balança RS232
          </button>

          @if (heldSalesCount() > 0) {
            <button
              type="button"
              (click)="openRecall.emit()"
              class="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5 hover:bg-amber-500/20 transition-all animate-pulse">
              <mat-icon class="text-xs">pause_circle</mat-icon> {{ heldSalesCount() }} Hold
            </button>
          }

          <button
            type="button"
            (click)="openSangria.emit()"
            class="px-2.5 py-1 rounded-xl bg-slate-950 text-slate-400 hover:text-white border border-slate-800 text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-all">
            <mat-icon class="text-xs text-amber-400">point_of_sale</mat-icon> Sangria
          </button>

          <span class="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> NFC-e OK
          </span>
        </div>
      </div>

      <!-- Barcode Bip Bar + Context Input -->
      <div class="flex flex-col sm:flex-row items-center gap-3">
        <div class="relative flex-1 w-full">
          <mat-icon class="absolute left-3 top-2 text-orange-400 text-lg">search</mat-icon>
          <input
            id="posSearchInput"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            (keydown.enter)="bip.emit()"
            type="text"
            placeholder="Digitar nome, SKU ou bipar leitor de barras EAN-13 (Ex: 7891028300011)..."
            class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-2 text-xs text-white font-mono focus:outline-none focus:border-orange-500 transition-colors uppercase font-black tracking-tight">
          
          <button 
            type="button"
            (click)="bip.emit()"
            class="absolute right-2 top-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow transition-all">
            Bipar (Enter)
          </button>
        </div>

        <!-- Dynamic Context Fields based on Sector -->
        @if (posSector() === 'restaurant') {
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[9px] text-slate-400 font-black uppercase">Mesa/Comanda:</span>
            <input 
              type="text" 
              [value]="tableOrComanda()"
              (input)="tableOrComanda.set($any($event.target).value)"
              class="w-20 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-center font-black text-orange-400 focus:outline-none focus:border-orange-500 uppercase"
              placeholder="MESA 01">
          </div>
        } @else if (posSector() === 'services') {
          <div class="flex items-center gap-2 shrink-0">
            <span class="text-[9px] text-slate-400 font-black uppercase">Técnico:</span>
            <input 
              type="text" 
              [value]="technicianName()"
              (input)="technicianName.set($any($event.target).value)"
              class="w-28 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-center font-black text-cyan-400 focus:outline-none focus:border-orange-500 uppercase"
              placeholder="CARLOS M.">
          </div>
        }
      </div>
    </div>
  `
})
export class PosScannerComponent {
  posSector = model.required<'restaurant' | 'retail' | 'services'>();
  isWholesale = model.required<boolean>();
  fastScanMode = model.required<boolean>();
  tableOrComanda = model.required<string>();
  technicianName = model.required<string>();
  searchQuery = model.required<string>();
  heldSalesCount = input<number>(0);

  openScale = output<void>();
  openRecall = output<void>();
  openSangria = output<void>();
  bip = output<void>();
}
