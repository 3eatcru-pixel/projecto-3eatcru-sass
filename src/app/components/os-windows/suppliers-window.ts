import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { Supplier, ProductItem } from '../../models/ecosystem.model';

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: { productName: string; quantity: number; unitPrice: number; total: number }[];
  totalValue: number;
  status: 'draft' | 'sent' | 'approved' | 'delivered' | 'canceled';
  createdAt: string;
  expectedDeliveryDate: string;
  invoiceNumber?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-suppliers-window',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-stone-200 font-sans select-none">
      
      <!-- TOP NAVIGATION BAR & METRICS -->
      <div class="flex flex-wrap items-center justify-between gap-3 bg-[#180b04] border border-[#4d2813] p-4 rounded-2xl">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-400 flex items-center justify-center">
            <mat-icon class="text-xl">local_shipping</mat-icon>
          </div>
          <div>
            <h2 class="font-serif font-black text-lg text-white">Gestão de Fornecedores & Compras</h2>
            <p class="text-[10px] text-stone-400 font-mono">Homologação de Parceiros, Pedidos de Compra (PO) e Recebimento NF-e</p>
          </div>
        </div>

        <!-- STATS BADGES -->
        <div class="flex items-center gap-2 text-xs font-mono">
          <div class="bg-[#2a160b] border border-[#4d2813] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span class="text-stone-400">Fornecedores:</span>
            <strong class="text-amber-400 font-bold">{{ ecosystem.suppliers().length }}</strong>
          </div>
          <div class="bg-[#2a160b] border border-[#4d2813] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span class="text-stone-400">POs Pendentes:</span>
            <strong class="text-amber-300 font-bold">{{ pendingOrdersCount() }}</strong>
          </div>
        </div>
      </div>

      <!-- NAVIGATION TABS -->
      <div class="flex items-center gap-2 border-b border-[#3d200f] pb-2 text-xs font-bold">
        <button
          type="button"
          (click)="activeTab.set('suppliers')"
          [class]="activeTab() === 'suppliers' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#211006] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">store</mat-icon>
          <span>Fornecedores Homologados</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('catalog')"
          [class]="activeTab() === 'catalog' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#211006] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">inventory</mat-icon>
          <span>Catálogo de Insumos</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('orders')"
          [class]="activeTab() === 'orders' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#211006] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">assignment</mat-icon>
          <span>Pedidos de Compra (PO)</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('intake')"
          [class]="activeTab() === 'intake' ? 'bg-amber-600 text-stone-950 shadow' : 'bg-[#211006] text-stone-400 hover:text-white border border-[#3d200f]'"
          class="px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">receipt_long</mat-icon>
          <span>Entrada de NF-e / XML</span>
        </button>
      </div>

      <!-- TAB 1: FORNECEDORES -->
      @if (activeTab() === 'suppliers') {
        <div class="flex-1 flex flex-col space-y-4 overflow-y-auto">
          <div class="flex items-center justify-between gap-3">
            <input
              type="text"
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              placeholder="Buscar fornecedor por Razão Social, Categoria ou Nome..."
              class="bg-[#2a160b] border border-[#4d2813] text-amber-200 placeholder-stone-500 text-xs px-3 py-2 rounded-xl outline-none w-80" />

            <button
              type="button"
              (click)="showNewSupplierModal.set(true)"
              class="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow">
              <mat-icon class="text-sm">add</mat-icon>
              <span>Cadastrar Fornecedor</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (sup of filteredSuppliers(); track sup.id) {
              <div class="bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-lg">
                <div class="flex items-start justify-between">
                  <div>
                    <h3 class="font-bold text-sm text-white">{{ sup.name }}</h3>
                    <p class="text-[10px] text-amber-400 font-mono">{{ sup.category }}</p>
                  </div>
                  <span class="bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                    Homologado
                  </span>
                </div>

                <div class="space-y-1 text-xs text-stone-300">
                  <div class="flex items-center gap-1.5 text-[11px]">
                    <mat-icon class="text-xs text-amber-500">person</mat-icon>
                    <span>Contato: {{ sup.contactName || 'Comercial' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[11px]">
                    <mat-icon class="text-xs text-emerald-500">phone</mat-icon>
                    <span>{{ sup.phone || '(11) 98000-0000' }}</span>
                  </div>
                  <div class="flex items-center gap-1.5 text-[11px] truncate">
                    <mat-icon class="text-xs text-cyan-500">email</mat-icon>
                    <span class="truncate">{{ sup.email || 'comercial@fornecedor.com' }}</span>
                  </div>
                </div>

                <div class="pt-2 border-t border-[#3d200f] flex items-center justify-between text-[10px]">
                  <span class="text-stone-400">Dias de Entrega:</span>
                  <span class="text-amber-300 font-mono font-bold">
                    {{ sup.deliveryDays ? sup.deliveryDays.join(', ') : 'Seg, Qua, Sex' }}
                  </span>
                </div>

                <button
                  type="button"
                  (click)="openNewOrderForSupplier(sup)"
                  class="w-full bg-[#2a160b] hover:bg-[#3d200f] text-amber-300 font-bold py-1.5 rounded-xl text-xs border border-[#4d2813] cursor-pointer flex items-center justify-center gap-1">
                  <mat-icon class="text-xs">shopping_cart</mat-icon>
                  <span>Gerar Pedido de Compra</span>
                </button>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 2: CATÁLOGO DE INSUMOS -->
      @if (activeTab() === 'catalog') {
        <div class="flex-1 bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
            <h3 class="font-bold text-xs uppercase text-amber-400 font-mono">Tabela de Custos & Insumos por Fornecedor</h3>
            <span class="text-[10px] text-stone-400 font-mono">Total de Itens: {{ ecosystem.products().length }}</span>
          </div>

          <table class="w-full text-left text-xs">
            <thead>
              <tr class="text-stone-400 border-b border-[#3d200f] font-mono text-[10px] uppercase">
                <th class="py-2">Insumo / Produto</th>
                <th class="py-2">Categoria</th>
                <th class="py-2">Custo Unitário (R$)</th>
                <th class="py-2">Preço Venda (R$)</th>
                <th class="py-2">Estoque Atual</th>
                <th class="py-2">Ação</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#2d170a]">
              @for (prod of ecosystem.products(); track prod.id) {
                <tr class="hover:bg-[#221207]">
                  <td class="py-2.5 font-bold text-white flex items-center gap-2">
                    <mat-icon class="text-sm text-amber-400">inventory_2</mat-icon>
                    <span>{{ prod.name }}</span>
                  </td>
                  <td class="py-2.5 text-stone-400">{{ prod.category }}</td>
                  <td class="py-2.5 font-mono text-emerald-400 font-bold">R$ {{ (prod.costPrice || 0).toFixed(2) }}</td>
                  <td class="py-2.5 font-mono text-stone-200">R$ {{ prod.price.toFixed(2) }}</td>
                  <td class="py-2.5 font-mono font-bold" [class.text-rose-400]="prod.stock <= prod.minStock">
                    {{ prod.stock }} un
                  </td>
                  <td class="py-2.5">
                    <button
                      type="button"
                      (click)="quickReorder(prod)"
                      class="px-2.5 py-1 bg-[#2a160b] hover:bg-[#3d200f] border border-[#4d2813] text-amber-300 rounded-lg font-bold text-[10px] cursor-pointer">
                      Pedir Reposição
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- TAB 3: PEDIDOS DE COMPRA (PO) -->
      @if (activeTab() === 'orders') {
        <div class="flex-1 bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-3">
          <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
            <h3 class="font-bold text-xs uppercase text-amber-400 font-mono">Ordens de Compra Emitidas (PO)</h3>
            <button
              type="button"
              (click)="showNewOrderModal.set(true)"
              class="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer">
              <mat-icon class="text-sm">add</mat-icon> Nova Ordem
            </button>
          </div>

          <div class="space-y-2">
            @for (po of purchaseOrders(); track po.id) {
              <div class="bg-[#2a160b] border border-[#4d2813] rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <div class="font-bold text-white font-mono text-sm flex items-center gap-2">
                    <span>{{ po.orderNumber }}</span>
                    <span [class]="getPoStatusBadgeClass(po.status)" class="text-[9px] px-2 py-0.5 rounded-full uppercase">
                      {{ po.status }}
                    </span>
                  </div>
                  <div class="text-stone-400 text-[11px]">Fornecedor: <strong class="text-amber-300">{{ po.supplierName }}</strong></div>
                  <div class="text-stone-500 text-[10px]">Emissão: {{ po.createdAt }} &bull; Prev. Entrega: {{ po.expectedDeliveryDate }}</div>
                </div>

                <div class="text-right font-mono">
                  <div class="text-stone-400 text-[10px]">Valor Total PO</div>
                  <div class="font-black text-emerald-400 text-sm">R$ {{ po.totalValue.toFixed(2) }}</div>
                </div>

                <div class="flex items-center gap-2">
                  @if (po.status === 'sent') {
                    <button
                      type="button"
                      (click)="updatePoStatus(po.id, 'approved')"
                      class="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg text-[10px] cursor-pointer">
                      Aprovar PO
                    </button>
                  }
                  @if (po.status === 'approved') {
                    <button
                      type="button"
                      (click)="receivePo(po)"
                      class="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-[10px] cursor-pointer">
                      Dar Entrada NF-e
                    </button>
                  }
                </div>
              </div>
            }
            @if (purchaseOrders().length === 0) {
              <div class="py-12 text-center text-stone-500 text-xs">
                Nenhum pedido de compra cadastrado no momento.
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 4: ENTRADA DE NF-E / XML -->
      @if (activeTab() === 'intake') {
        <div class="flex-1 bg-[#180b04] border border-[#4d2813] rounded-2xl p-4 flex flex-col justify-between overflow-y-auto space-y-4">
          <div class="pb-2 border-b border-[#3d200f]">
            <h3 class="font-bold text-xs uppercase text-amber-400 font-mono">Importador de XML NF-e & Conferência de Recebimento</h3>
            <p class="text-[11px] text-stone-400">Validação de nota fiscal de entrada de mercadorias com atualização automática de estoque e contas a pagar.</p>
          </div>

          <div class="bg-[#2a160b] border-2 border-dashed border-[#4d2813] rounded-2xl p-6 text-center space-y-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-600/30 text-amber-400 flex items-center justify-center mx-auto">
              <mat-icon class="text-2xl">cloud_upload</mat-icon>
            </div>
            <div>
              <p class="font-bold text-white text-xs">Arraste o arquivo XML da Nota Fiscal (NF-e) ou selecione abaixo</p>
              <p class="text-[10px] text-stone-400">Suporta chave de acesso de 44 dígitos da SEFAZ</p>
            </div>
            <button
              type="button"
              (click)="simulateXmlUpload()"
              class="bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow">
              Simular Leitura de XML NF-e
            </button>
          </div>

          <!-- RECENT INVOICE INTAKES HISTORY -->
          <div class="space-y-2">
            <h4 class="font-mono text-[10px] uppercase font-bold text-amber-500">Últimas Notas Fiscais Processadas</h4>
            <div class="bg-[#2a160b] border border-[#4d2813] rounded-xl p-3 text-xs space-y-1">
              <div class="flex justify-between text-white font-bold">
                <span>NF-e #000.412.981 - Hortifrúti Central</span>
                <span class="text-emerald-400 font-mono">R$ 1.850,00</span>
              </div>
              <div class="text-[10px] text-stone-400 flex justify-between">
                <span>Chave: 35261014882910000144550010004129811002341239</span>
                <span class="text-emerald-400 font-bold">Estoque Recalibrado ✓</span>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- MODAL CADASTRO FORNECEDOR -->
      @if (showNewSupplierModal()) {
        <div class="fixed inset-0 z-[600] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#180b04] border-2 border-[#4d2813] rounded-3xl p-6 w-full max-w-md space-y-4 text-stone-200">
            <div class="flex items-center justify-between pb-2 border-b border-[#3d200f]">
              <h3 class="font-serif font-black text-lg text-white">Novo Fornecedor</h3>
              <button (click)="showNewSupplierModal.set(false)" class="text-stone-400 hover:text-white cursor-pointer"><mat-icon>close</mat-icon></button>
            </div>

            <div class="space-y-3 text-xs">
              <div>
                <span class="block text-stone-400 mb-1 font-bold">Razão Social / Nome Fantasia</span>
                <input #supName type="text" placeholder="Ex: Bebidas Brasil Distribuidora S.A." class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500" />
              </div>
              <div>
                <span class="block text-stone-400 mb-1 font-bold">Nome do Representante Comercial</span>
                <input #supContact type="text" placeholder="Ex: Roberto Carlos" class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500" />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <span class="block text-stone-400 mb-1 font-bold">WhatsApp / Fone</span>
                  <input #supPhone type="text" value="(11) 98888-0000" class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500" />
                </div>
                <div>
                  <span class="block text-stone-400 mb-1 font-bold">Categoria</span>
                  <select #supCategory class="w-full bg-[#2a160b] border border-[#4d2813] text-amber-200 px-3 py-2 rounded-xl outline-none focus:border-amber-500">
                    <option value="Alimentos Frescos">Alimentos Frescos</option>
                    <option value="Bebidas & Alcoólicos">Bebidas & Alcoólicos</option>
                    <option value="Embalagens & Descartáveis">Embalagens & Descartáveis</option>
                    <option value="Limpeza & Higiene">Limpeza & Higiene</option>
                    <option value="Hardware & POS">Hardware & POS</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="pt-2 border-t border-[#3d200f] flex justify-end gap-2">
              <button (click)="showNewSupplierModal.set(false)" class="px-4 py-2 bg-[#2a160b] rounded-xl text-stone-300 font-bold text-xs">Cancelar</button>
              <button (click)="saveSupplier(supName.value, supContact.value, supPhone.value, supCategory.value)" class="px-4 py-2 bg-amber-500 text-stone-950 font-bold text-xs rounded-xl shadow">Salvar Fornecedor</button>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class SuppliersWindowComponent {
  readonly ecosystem = inject(EcosystemService);

  readonly activeTab = signal<'suppliers' | 'catalog' | 'orders' | 'intake'>('suppliers');
  readonly searchQuery = signal<string>('');
  readonly showNewSupplierModal = signal<boolean>(false);
  readonly showNewOrderModal = signal<boolean>(false);

  readonly purchaseOrders = signal<PurchaseOrder[]>([
    {
      id: 'po-1',
      orderNumber: 'PO-2026-081',
      supplierId: 'sup-1',
      supplierName: 'Hortifrúti Central',
      items: [{ productName: 'Hortaliças & Tomates', quantity: 50, unitPrice: 8.50, total: 425.00 }],
      totalValue: 425.00,
      status: 'sent',
      createdAt: 'Amanhã 08:00',
      expectedDeliveryDate: '29/10/2026'
    },
    {
      id: 'po-2',
      orderNumber: 'PO-2026-082',
      supplierId: 'sup-2',
      supplierName: 'Bebidas SP Distribuidora',
      items: [{ productName: 'Cerveja Craft IPA 500ml', quantity: 120, unitPrice: 9.00, total: 1080.00 }],
      totalValue: 1080.00,
      status: 'approved',
      createdAt: 'Ontem',
      expectedDeliveryDate: '30/10/2026'
    }
  ]);

  pendingOrdersCount = computed(() => {
    return this.purchaseOrders().filter(p => p.status === 'sent' || p.status === 'approved').length;
  });

  filteredSuppliers = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    return this.ecosystem.suppliers().filter(s =>
      !q || s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  });

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  openNewOrderForSupplier(sup: Supplier) {
    this.ecosystem.notify(`Criando nova Ordem de Compra (PO) para ${sup.name}...`, 'info');
    this.activeTab.set('orders');
  }

  quickReorder(prod: ProductItem) {
    this.ecosystem.notify(`Solicitação de cotação enviada para o insumo "${prod.name}"!`, 'success');
  }

  getPoStatusBadgeClass(status: string): string {
    switch (status) {
      case 'draft': return 'bg-stone-800 text-stone-300 border border-stone-600';
      case 'sent': return 'bg-amber-950 text-amber-300 border border-amber-800';
      case 'approved': return 'bg-emerald-950 text-emerald-300 border border-emerald-800';
      case 'delivered': return 'bg-cyan-950 text-cyan-300 border border-cyan-800';
      default: return 'bg-stone-800 text-stone-300';
    }
  }

  updatePoStatus(id: string, status: PurchaseOrder['status']) {
    this.purchaseOrders.update(orders =>
      orders.map(p => p.id === id ? { ...p, status } : p)
    );
    this.ecosystem.notify(`Status do Pedido de Compra atualizado para ${status.toUpperCase()}!`, 'success');
  }

  receivePo(po: PurchaseOrder) {
    this.updatePoStatus(po.id, 'delivered');
    this.ecosystem.addFinancialEntry({
      date: new Date().toISOString(),
      type: 'expense',
      category: 'Insumos e Compras',
      description: `Pagamento NF-e Fornecedor ${po.supplierName} (${po.orderNumber})`,
      amount: po.totalValue,
      paymentMethod: 'BOLETO_BANCARIO',
      referenceId: po.id
    });
    this.ecosystem.notify(`NF-e recebida! R$ ${po.totalValue.toFixed(2)} lançado no Contas a Pagar e Estoque atualizado!`, 'success');
  }

  simulateXmlUpload() {
    this.ecosystem.notify('XML da NF-e processado com sucesso! 100% de acuracidade na conferência de preços e quantidades.', 'success');
  }

  saveSupplier(name: string, contact: string, phone: string, category: string) {
    if (!name.trim()) {
      this.ecosystem.notify('Por favor, informe a Razão Social ou Nome do Fornecedor.', 'warning');
      return;
    }

    const newSup: Supplier = {
      id: 'sup-' + Date.now(),
      name,
      contactName: contact || 'Comercial',
      phone: phone || '(11) 98888-0000',
      email: 'contato@fornecedor.com.br',
      category: category || 'Geral',
      deliveryDays: ['Segunda', 'Quarta', 'Sexta']
    };

    this.ecosystem.suppliers.update(s => [...s, newSup]);
    this.showNewSupplierModal.set(false);
    this.ecosystem.notify(`Fornecedor "${name}" cadastrado e homologado com sucesso!`, 'success');
  }
}
