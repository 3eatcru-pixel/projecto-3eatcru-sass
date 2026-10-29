import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CompanyTenant } from '../../../models/ecosystem.model';

@Component({
  selector: 'app-unit-settings',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex-1 overflow-y-auto pr-2 space-y-6 no-scrollbar relative z-10 h-full">
      <!-- Identificação -->
      <div class="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6 space-y-6 backdrop-blur-md">
        <div class="flex justify-between items-center pb-3 border-b border-slate-800">
          <h4 class="font-black text-[11px] text-white uppercase tracking-[0.3em] flex items-center gap-3">
            <span class="w-1 h-3 bg-orange-600 rounded-full"></span>
            Identificação Jurídica & Perfil
          </h4>
          <span class="text-[9px] uppercase font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
            Sincronizado via Cloud
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="space-y-1.5">
            <label for="storeName" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Nome Fantasia</label>
            <input 
              id="storeName"
              [value]="tenant().name" 
              (input)="update('name', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors uppercase font-black tracking-tight shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="storeLegal" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Razão Social</label>
            <input 
              id="storeLegal"
              [value]="tenant().legalName" 
              (input)="update('legalName', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors uppercase font-black tracking-tight shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="storeCnpj" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">CNPJ / ID Fiscal</label>
            <input 
              id="storeCnpj"
              [value]="tenant().cnpj" 
              (input)="update('cnpj', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-mono font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="storeCategory" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Tipo de Unidade</label>
            <select 
              id="storeCategory"
              [value]="tenant().category" 
              (change)="update('category', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none font-black uppercase tracking-tight shadow-inner cursor-pointer">
              <option value="restaurant">Restaurante / Alimentação</option>
              <option value="retail">Varejo / Loja Comercial</option>
              <option value="services">Prestação de Serviços</option>
              <option value="hybrid">Operação Híbrida</option>
            </select>
          </div>

          <div class="space-y-1.5">
            <label for="storeEmail" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">E-mail Operacional</label>
            <input 
              id="storeEmail"
              [value]="tenant().contactEmail" 
              (input)="update('contactEmail', $event)"
              type="email" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="storePhone" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">WhatsApp / Contato</label>
            <input 
              id="storePhone"
              [value]="tenant().phone" 
              (input)="update('phone', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-black shadow-inner">
          </div>
        </div>
      </div>

      <!-- Endereço e Taxa -->
      <div class="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6 space-y-6 backdrop-blur-md">
        <h4 class="font-black text-[11px] text-white uppercase tracking-[0.3em] flex items-center gap-3 pb-3 border-b border-slate-800">
          <span class="w-1 h-3 bg-cyan-500 rounded-full"></span>
          Localização Física e Taxas de Atendimento
        </h4>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="md:col-span-2 space-y-1.5">
            <label for="addrStreet" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Logradouro</label>
            <input 
              id="addrStreet"
              [value]="tenant().address.street" 
              (input)="updateAddress('street', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors uppercase font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="addrNum" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Nº</label>
            <input 
              id="addrNum"
              [value]="tenant().address.number" 
              (input)="updateAddress('number', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="addrCep" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">CEP</label>
            <input 
              id="addrCep"
              [value]="tenant().address.zipCode" 
              (input)="updateAddress('zipCode', $event)"
              type="text" 
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-colors font-mono font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="servFee" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Taxa de Serviço (%)</label>
            <input 
              id="servFee"
              type="number"
              [value]="tenant().serviceFeePercent" 
              (input)="update('serviceFeePercent', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-orange-400 focus:outline-none focus:border-orange-500 transition-colors font-mono font-black shadow-inner">
          </div>

          <div class="space-y-1.5">
            <label for="delRad" class="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Raio de Delivery (km)</label>
            <input 
              id="delRad"
              type="number"
              [value]="tenant().deliveryRadiusKm" 
              (input)="update('deliveryRadiusKm', $event)"
              class="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-cyan-400 focus:outline-none focus:border-orange-500 transition-colors font-mono font-black shadow-inner">
          </div>
        </div>

        <div class="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="button"
            (click)="save.emit()"
            class="bg-orange-600 hover:bg-orange-500 text-white font-black px-8 py-4 rounded-xl shadow-[0_8px_20px_rgba(234,88,12,0.2)] flex items-center gap-3 transition-all active:scale-95 uppercase tracking-[0.2em] border-b-4 border-orange-800 cursor-pointer">
            <mat-icon class="text-lg">cloud_sync</mat-icon> Atualizar Unidade
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `]
})
export class UnitSettingsComponent {
  tenant = input.required<CompanyTenant>();
  
  save = output<void>();
  tenantUpdate = output<Partial<CompanyTenant>>();

  update(key: keyof CompanyTenant, event: Event) {
    let value: string | number = (event.target as HTMLInputElement | HTMLSelectElement).value;
    if (key === 'serviceFeePercent' || key === 'deliveryRadiusKm') {
      value = Number(value);
    }
    this.tenantUpdate.emit({ [key]: value });
  }

  updateAddress(key: keyof CompanyTenant['address'], event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const newAddress = { ...this.tenant().address, [key]: value };
    this.tenantUpdate.emit({ address: newAddress });
  }
}
