import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { StoreAddress } from '../../../models/ecosystem.model';

export interface InfoFormState {
  isOpen: boolean;
  openingHours: string;
  deliveryRadiusKm: number;
  deliveryFee: number;
  minOrderValue: number;
  deliveryFleetType: 'own' | 'platform' | 'hybrid';
  estimatedDeliveryMinutes: string;
  serviceFeePercent: number;
  supportsDelivery: boolean;
  supportsTakeout: boolean;
  supportsReservation: boolean;
  address: StoreAddress;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-store-info-tab',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="space-y-6 text-stone-200">
      
      <!-- STORE STATUS TOGGLE -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full" [class]="form().isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'"></span>
            <h4 class="font-serif font-black text-sm text-stone-100">
              {{ form().isOpen ? 'Loja Aberta para Pedidos' : 'Loja Fechada no Momento' }}
            </h4>
          </div>
          <p class="text-xs text-stone-400 mt-0.5">
            {{ form().isOpen ? 'Os clientes podem adicionar produtos à sacola e enviar pedidos diretamente.' : 'A vitrine exibirá o cardápio em modo consulta de preços.' }}
          </p>
        </div>

        <button
          type="button"
          (click)="updateField('isOpen', !form().isOpen)"
          [class]="form().isOpen ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black' : 'bg-rose-950 text-rose-300 border border-rose-800'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow">
          <mat-icon class="text-sm">{{ form().isOpen ? 'lock_open' : 'lock' }}</mat-icon>
          <span>{{ form().isOpen ? 'Aberta (Alterar)' : 'Fechada (Abrir)' }}</span>
        </button>
      </div>

      <!-- OPERATING HOURS & DELIVERY TIMINGS -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">schedule</mat-icon>
          <span>Horários e Regras de Entrega / Delivery</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="sm:col-span-2">
            <label for="infoOpeningHours" class="block text-stone-400 font-semibold mb-1">Horário de Funcionamento Exibido</label>
            <input
              id="infoOpeningHours"
              type="text"
              [value]="form().openingHours"
              (input)="updateField('openingHours', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="Ex: Terça a Domingo, das 11:30 às 23:45">
          </div>

          <div>
            <label for="infoDeliveryTime" class="block text-stone-400 font-semibold mb-1">Prazo Estimado de Entrega</label>
            <input
              id="infoDeliveryTime"
              type="text"
              [value]="form().estimatedDeliveryMinutes"
              (input)="updateField('estimatedDeliveryMinutes', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="Ex: 30-45 min">
          </div>

          <div>
            <label for="infoDeliveryFee" class="block text-stone-400 font-semibold mb-1">Taxa de Entrega / Delivery (R$)</label>
            <input
              id="infoDeliveryFee"
              type="number"
              step="0.5"
              [value]="form().deliveryFee"
              (input)="updateField('deliveryFee', +$any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="5.00">
          </div>

          <div>
            <label for="infoMinOrderValue" class="block text-amber-400 font-bold mb-1">Valor Mínimo do Pedido p/ Delivery (R$)</label>
            <input
              id="infoMinOrderValue"
              type="number"
              step="1"
              [value]="form().minOrderValue"
              (input)="updateField('minOrderValue', +$any($event.target).value)"
              class="w-full bg-[#0e0805] border border-amber-600/60 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400"
              placeholder="25.00">
          </div>

          <div>
            <label for="infoFleetType" class="block text-amber-400 font-bold mb-1">Operação de Logística / Frota</label>
            <select
              id="infoFleetType"
              [value]="form().deliveryFleetType"
              (change)="updateField('deliveryFleetType', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-amber-600/60 rounded-xl px-3 py-2 text-amber-300 font-bold focus:outline-none focus:border-amber-400 cursor-pointer">
              <option value="own">🛵 Frota Própria da Loja</option>
              <option value="platform">⚡ Frota Parceira Plataforma 3EAT</option>
              <option value="hybrid">🔄 Logística Híbrida</option>
            </select>
          </div>

          <div>
            <label for="infoDeliveryRadius" class="block text-stone-400 font-semibold mb-1">Raio Máximo de Entrega (km)</label>
            <input
              id="infoDeliveryRadius"
              type="number"
              [value]="form().deliveryRadiusKm"
              (input)="updateField('deliveryRadiusKm', +$any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="8">
          </div>

          <div>
            <label for="infoServiceFee" class="block text-stone-400 font-semibold mb-1">Taxa de Serviço Balcão (%)</label>
            <input
              id="infoServiceFee"
              type="number"
              [value]="form().serviceFeePercent"
              (input)="updateField('serviceFeePercent', +$any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="10">
          </div>
        </div>
      </div>

      <!-- MODALITIES -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">local_shipping</mat-icon>
          <span>Modalidades Atendidas</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <label class="flex items-center gap-2 p-2.5 rounded-xl border border-[#3d200f] bg-[#0e0805] cursor-pointer">
            <input
              type="checkbox"
              [checked]="form().supportsDelivery"
              (change)="updateField('supportsDelivery', $any($event.target).checked)"
              class="accent-amber-500">
            <span class="font-bold text-stone-300">Entrega Delivery</span>
          </label>

          <label class="flex items-center gap-2 p-2.5 rounded-xl border border-[#3d200f] bg-[#0e0805] cursor-pointer">
            <input
              type="checkbox"
              [checked]="form().supportsTakeout"
              (change)="updateField('supportsTakeout', $any($event.target).checked)"
              class="accent-amber-500">
            <span class="font-bold text-stone-300">Retirada Balcão</span>
          </label>

          <label class="flex items-center gap-2 p-2.5 rounded-xl border border-[#3d200f] bg-[#0e0805] cursor-pointer">
            <input
              type="checkbox"
              [checked]="form().supportsReservation"
              (change)="updateField('supportsReservation', $any($event.target).checked)"
              class="accent-amber-500">
            <span class="font-bold text-stone-300">Reserva de Mesas</span>
          </label>
        </div>
      </div>

      <!-- ADDRESS DETAILS -->
      <div class="bg-[#170b04] border border-[#3d200f] rounded-2xl p-4 space-y-3">
        <div class="flex items-center gap-2 text-amber-400 font-serif font-black text-sm pb-2 border-b border-[#3d200f]">
          <mat-icon class="text-base">place</mat-icon>
          <span>Endereço e Localização Física</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="sm:col-span-2">
            <label for="infoAddressStreet" class="block text-stone-400 font-semibold mb-1">Rua / Logradouro</label>
            <input
              id="infoAddressStreet"
              type="text"
              [value]="form().address.street"
              (input)="updateAddress('street', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500">
          </div>

          <div>
            <label for="infoAddressNumber" class="block text-stone-400 font-semibold mb-1">Número</label>
            <input
              id="infoAddressNumber"
              type="text"
              [value]="form().address.number"
              (input)="updateAddress('number', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500">
          </div>

          <div>
            <label for="infoAddressNeighborhood" class="block text-stone-400 font-semibold mb-1">Bairro</label>
            <input
              id="infoAddressNeighborhood"
              type="text"
              [value]="form().address.neighborhood"
              (input)="updateAddress('neighborhood', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500">
          </div>

          <div>
            <label for="infoAddressCity" class="block text-stone-400 font-semibold mb-1">Cidade</label>
            <input
              id="infoAddressCity"
              type="text"
              [value]="form().address.city"
              (input)="updateAddress('city', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500">
          </div>

          <div>
            <label for="infoAddressComplement" class="block text-stone-400 font-semibold mb-1">Complemento</label>
            <input
              id="infoAddressComplement"
              type="text"
              [value]="form().address.complement || ''"
              (input)="updateAddress('complement', $any($event.target).value)"
              class="w-full bg-[#0e0805] border border-[#4d2813] rounded-xl px-3 py-2 text-stone-200 focus:outline-none focus:border-amber-500"
              placeholder="Ex: Salão Térreo">
          </div>
        </div>
      </div>

    </div>
  `
})
export class StoreInfoTabComponent {
  form = input.required<InfoFormState>();
  formChange = output<InfoFormState>();

  updateField<K extends keyof InfoFormState>(field: K, value: InfoFormState[K]) {
    this.formChange.emit({
      ...this.form(),
      [field]: value
    });
  }

  updateAddress(field: keyof StoreAddress, value: string) {
    this.formChange.emit({
      ...this.form(),
      address: {
        ...this.form().address,
        [field]: value
      }
    });
  }
}
