import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface ModuleDoc {
  id: string;
  icon: string;
  name: string;
  category: 'restaurante' | 'varejo' | 'servicos' | 'hq' | 'utilitarios';
  description: string;
  keyFeatures: string[];
  technicalSpecs: string[];
  workflow: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-docs-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="h-full flex flex-col space-y-4 text-xs text-white">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30">
            <mat-icon class="text-xl">menu_book</mat-icon>
          </div>
          <div>
            <h3 class="font-bold text-base text-white">Documentação Técnica & Manual de Módulos (3EATCRU Specs)</h3>
            <p class="text-slate-400">Guia de funcionalidades padrão da indústria para Restaurante, Varejo, Serviços e HQ.</p>
          </div>
        </div>

        <!-- Vertical Category Filter -->
        <div class="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            (click)="selectedDocCat.set('all')"
            [class]="selectedDocCat() === 'all' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 rounded-lg transition-all">
            Todos
          </button>
          <button
            type="button"
            (click)="selectedDocCat.set('restaurante')"
            [class]="selectedDocCat() === 'restaurante' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
            <mat-icon class="text-xs">restaurant</mat-icon> Restaurante
          </button>
          <button
            type="button"
            (click)="selectedDocCat.set('varejo')"
            [class]="selectedDocCat() === 'varejo' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
            <mat-icon class="text-xs">store</mat-icon> Varejo
          </button>
          <button
            type="button"
            (click)="selectedDocCat.set('servicos')"
            [class]="selectedDocCat() === 'servicos' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
            <mat-icon class="text-xs">handyman</mat-icon> Serviços
          </button>
          <button
            type="button"
            (click)="selectedDocCat.set('hq')"
            [class]="selectedDocCat() === 'hq' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'"
            class="px-2.5 py-1 rounded-lg transition-all flex items-center gap-1">
            <mat-icon class="text-xs">admin_panel_settings</mat-icon> HQ & MDM
          </button>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
        
        <!-- Left List Menu (4 cols) -->
        <div class="md:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col space-y-2 overflow-y-auto">
          <div class="relative">
            <mat-icon class="absolute left-3 top-2 text-slate-500 text-sm">search</mat-icon>
            <input
              type="text"
              [value]="searchFilter()"
              (input)="searchFilter.set($any($event.target).value)"
              placeholder="Buscar ícone ou feature..."
              class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500">
          </div>

          <div class="space-y-1 pt-1">
            @for (doc of filteredDocs(); track doc.id) {
              <button
                type="button"
                (click)="activeDoc.set(doc)"
                [class]="activeDoc()?.id === doc.id ? 'bg-orange-600/20 border-orange-500/50 text-orange-300 font-bold' : 'hover:bg-slate-800 text-slate-300 border-transparent'"
                class="w-full text-left p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer">
                <div class="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-orange-400 border border-slate-800 shrink-0">
                  <mat-icon class="text-base">{{ doc.icon }}</mat-icon>
                </div>
                <div class="min-w-0 flex-1">
                  <div class="font-bold text-xs truncate text-white">{{ doc.name }}</div>
                  <div class="text-[10px] text-slate-400 uppercase font-mono tracking-wider">{{ doc.category }}</div>
                </div>
                <mat-icon class="text-xs text-slate-500">chevron_right</mat-icon>
              </button>
            }
          </div>
        </div>

        <!-- Right Detail View (8 cols) -->
        <div class="md:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-5">
          @if (activeDoc(); as doc) {
            <div class="flex items-center gap-4 pb-4 border-b border-slate-800">
              <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-white flex items-center justify-center shadow-lg border border-white/20 shrink-0">
                <mat-icon class="text-3xl">{{ doc.icon }}</mat-icon>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-bold text-white">{{ doc.name }}</h2>
                  <span class="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800/60">
                    {{ doc.category }}
                  </span>
                </div>
                <p class="text-xs text-slate-300 mt-1 leading-relaxed">{{ doc.description }}</p>
              </div>
            </div>

            <!-- Key Features List -->
            <div class="space-y-2">
              <h4 class="font-bold text-sm text-orange-400 flex items-center gap-1.5">
                <mat-icon class="text-sm">checklist</mat-icon> Funcionalidades Padrão da Indústria
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                @for (feat of doc.keyFeatures; track feat) {
                  <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-start gap-2">
                    <mat-icon class="text-emerald-400 text-xs mt-0.5 shrink-0">check_circle</mat-icon>
                    <span class="text-slate-200">{{ feat }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Technical Specifications -->
            <div class="space-y-2">
              <h4 class="font-bold text-sm text-cyan-400 flex items-center gap-1.5">
                <mat-icon class="text-sm">settings_suggest</mat-icon> Especificações & Protocolos Integrados
              </h4>
              <div class="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                @for (spec of doc.technicalSpecs; track spec) {
                  <div class="flex items-center gap-2 text-slate-300">
                    <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{{ spec }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Workflow Protocol -->
            <div class="space-y-2">
              <h4 class="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                <mat-icon class="text-sm">account_tree</mat-icon> Fluxo Operacional
              </h4>
              <div class="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-200 leading-relaxed font-mono">
                {{ doc.workflow }}
              </div>
            </div>

          } @else {
            <div class="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
              <mat-icon class="text-4xl text-slate-700">menu_book</mat-icon>
              <p>Selecione um módulo na lista ao lado para examinar sua documentação técnica.</p>
            </div>
          }
        </div>

      </div>

    </div>
  `
})
export class DocsWindowComponent {
  readonly selectedDocCat = signal<string>('all');
  readonly searchFilter = signal<string>('');

  readonly docsList: ModuleDoc[] = [
    // RESTAURANTE
    {
      id: 'doc-tables',
      icon: 'table_restaurant',
      name: 'Mesas, Salão & Garçom',
      category: 'restaurante',
      description: 'Gestão tátil de mapa de salão, comandas de mesa, controle de tempo de permanência, disparo de tempos de prato e divisão flexível de conta.',
      keyFeatures: [
        'Planta Visual de Salão por Setores (Salão Principal, Varanda, Bar, Mezanino)',
        'Status em Tempo Real (Livre, Ocupada, Reservada, Aguardando Prato, Conta Solicitada)',
        'Atribuição de Garçons e Desempenho por Atendente',
        'Divisão Inteligente de Conta (Por Pessoa, Por Item ou Cotas Iguais)',
        'Disparo Cadenciado de Tempos (Entradas → Pratos Principais → Sobremesas)',
        'Temporizador de Ocupação e Alertas de Espera Excessiva'
      ],
      technicalSpecs: [
        'Sincronização em tempo real via WebSockets / Event-Driven local',
        'Suporte a Tablets Táticos de Garçom e SmartPOS Android/Linux',
        'Integração direta com o KDS (Kitchen Display) e Impressora de Comandas'
      ],
      workflow: '1. Garçom abre a mesa via tablet ou terminal → 2. Lança os pedidos com observações (sem cebola, ponto) → 3. Comandas são impressas/enviadas automaticamente para a estação KDS correspondente → 4. Ao finalizar, o garçom solicita pré-conta com divisão individual ou coletiva → 5. Caixa liquida o pagamento via PIX, Cartão ou Dinheiro e libera a mesa.'
    },
    {
      id: 'doc-kds',
      icon: 'soup_kitchen',
      name: 'KDS Cozinha & Expedição',
      category: 'restaurante',
      description: 'Kitchen Display System totalmente digital para eliminação de papel, controle de tempos de preparo e coordenação de praças de cozinha.',
      keyFeatures: [
        'Telas por Praça de Preparo (Grelha, Fritadeira, Bar, Saladas, Expedição Master)',
        'Ações por Touchscreen ou Bump Bar Tático para Conclusão de Pratos',
        'Tempo Crítico Colorizado (Verde: No prazo, Amarelo: Atenção, Vermelho: Atrasado)',
        'Visão do Expedidor Principal (Coordenação para saída simultânea dos pratos da mesa)',
        'Reimpressão Rápida e Restauração de Pedidos Concluídos'
      ],
      technicalSpecs: [
        'Alerta sonoro customizado para novas comandas na cozinha',
        'Roteamento inteligente por SKU e Categoria de Produto',
        'Suporte a telas industriais e displays de alta durabilidade'
      ],
      workflow: '1. Pedido é lançado no PDV, Mesas ou iFood → 2. Item aparece instantaneamente na tela da praça responsável → 3. Cozinheiro inicia o preparo → 4. Ao finalizar, dá o "Bump" no item → 5. Expedidor valida o prato e libera para o garçom ou entregador.'
    },
    {
      id: 'doc-ifood',
      icon: 'delivery_dining',
      name: 'Gestor Delivery & iFood',
      category: 'restaurante',
      description: 'Hub unificado de conciliação e recebimento de pedidos off-premise (iFood, WhatsApp e Loja do Cliente) direto no fluxo do PDV e KDS.',
      keyFeatures: [
        'Integração Automática com iFood (Sem necessidade de múltiplas telas/tablets)',
        'Aceite Automático ou Manual de Pedidos com Tempo de Entrega Ajustável',
        'Sincronização do Cardápio e Estoque da Loja em Tempo Real',
        'Injetor de Pedidos Externos para Homologação e Treinamento',
        'Gestão de Entregadores Próprios e Rota Geodésica no Mapa'
      ],
      technicalSpecs: [
        'API de Webhooks para recebimento instantâneo de pedidos',
        'Impressão automática de vias de entrega e vias da cozinha',
        'Despacho com 1 clique para entregadores cadastrados'
      ],
      workflow: '1. Cliente faz pedido no iFood ou na Vitrine Pública → 2. Pedido cai direto no Gestor unificado → 3. Envio automático para o KDS da Cozinha → 4. Notificação de "Pronto para Entrega" enviada ao entregador → 5. Baixa no caixa e histórico financeiro automático.'
    },

    // VAREJO
    {
      id: 'doc-pos',
      icon: 'point_of_sale',
      name: 'PDV & Frente de Caixa Varejo',
      category: 'varejo',
      description: 'Checkout comercial ultrarrápido com suporte a leitor de código de barras, NFC-e fiscal automática, leitor de peso e desconto promocional.',
      keyFeatures: [
        'Leitura Ultrarrápida por Código de Barras (Bip Sequencial)',
        'Emissão de NFC-e (Nota Fiscal Consumidor Eletrônica) Integrada',
        'Suporte a Balança de Checkout Serial (Toledo / Filizola com comando Tare)',
        'Recuperação de Venda em Espera (Hold / Recall)',
        'Descontos por Item ou Valor Total e Pagamentos Múltiplos (Cartão + PIX + Dinheiro)',
        'Abertura, Sangria e Fechamento cego de caixa com DRE de fechamento'
      ],
      technicalSpecs: [
        'Driver nativo ESC/POS para impressoras térmicas de 80mm com guilhotina',
        'Protocolo de contingência para vendas offline sem internet',
        'Compatibilidade com leitores USB e Bluetooth'
      ],
      workflow: '1. Atendente bipa o código de barras do produto → 2. Sistema lê peso da balança se aplicável → 3. Aplica descontos ou cupons → 4. Cliente realiza o pagamento (PIX QR Code na tela ou Máquina de Cartão) → 5. Impressão da NFC-e e baixa automática no estoque.'
    },
    {
      id: 'doc-inventory',
      icon: 'inventory_2',
      name: 'Estoque ERP & Fornecedores',
      category: 'varejo',
      description: 'Gestão completa de estoque físico, matriz de variantes (tamanho/cor), gerador de etiquetas de código de barras e pedidos de compra para fornecedores.',
      keyFeatures: [
        'Gerador e Impressor de Etiquetas de Código de Barras EAN-13 / Interno',
        'Matriz de Variantes (Ex: Camiseta P/M/G nas cores Preto/Branco)',
        'Alerta de Estoque Mínimo e Sugestão Automática de Recompra',
        'Entrada de Nota Fiscal (XML NFe) com Atualização Automática de Custo e Estoque',
        'Cadastro Unificado de Fornecedores e Histórico de Preços de Custo'
      ],
      technicalSpecs: [
        'Validação de margem de lucro bruta (Markup %) automática',
        'Auditoria e inventário cego via leitor coletor de dados'
      ],
      workflow: '1. Recebimento da mercadoria do fornecedor → 2. Importação do XML de entrada → 3. Impressão de etiquetas de gôndola/código de barras → 4. Disponibilização instantânea do estoque no PDV e na Loja Online.'
    },

    // SERVIÇOS
    {
      id: 'doc-services',
      icon: 'handyman',
      name: 'Ordens de Serviço (O.S.)',
      category: 'servicos',
      description: 'Gerenciador Kanban de ordens de serviço técnicas para oficinas, assistências, estéticas e serviços profissionais.',
      keyFeatures: [
        'Quadro Kanban por Estágio (Em Aberto / Triagem, Em Execução, Aguardando Peças, Concluído)',
        'Atribuição de Responsável Técnico e Tempo Estimado de Entrega',
        'Lançamento de Peças/Insumos e Mão de Obra na mesma O.S.',
        'Emissão de Laudo Técnico e Termo de Garantia do Serviço',
        'Faturamento direto no Caixa/PDV ao concluir a entrega ao cliente'
      ],
      technicalSpecs: [
        'Status acessível ao cliente via QR Code na comanda de entrada',
        'Histórico por Placa de Veículo, Número de Série ou Equipamento'
      ],
      workflow: '1. Entrada do equipamento/veículo com checklist inicial → 2. Diagnóstico do técnico e aprovação do orçamento pelo cliente → 3. Execução do serviço com baixa das peças utilizadas → 4. Notificação via WhatsApp ao cliente → 5. Pagamento e emissão da Nota de Serviço.'
    },
    {
      id: 'doc-agenda',
      icon: 'event_note',
      name: 'Agenda & Reservas',
      category: 'servicos',
      description: 'Controle de agendamentos e horários marcados para estéticas, barbearias, consultórios e reservas de mesa em restaurantes.',
      keyFeatures: [
        'Calendário Interativo com Visão Diária, Semanal e Mensal',
        'Confirmação Automática de Agendamento via WhatsApp',
        'Bloqueio de Horários e Gestão de Escala de Profissionais',
        'Sincronização com o cadastro de clientes CRM'
      ],
      technicalSpecs: [
        'Notificação em tempo real de novos agendamentos via cliente web',
        'Status visual (Confirmado, Pendente, Cancelado, Concluído)'
      ],
      workflow: '1. Cliente agenda horário online ou por telefone → 2. Horário é reservado na agenda do profissional → 3. Lembrete enviado ao cliente → 4. Ao chegar, o serviço é iniciado e faturado.'
    },

    // HQ & UTILITÁRIOS
    {
      id: 'doc-hq',
      icon: 'admin_panel_settings',
      name: 'Gabinete HQ & MDM Devices',
      category: 'hq',
      description: 'Painel executivo do dono do app / desenvolvedor para controle de frota de dispositivos POS, gestão de tenants e cobrança recorrente.',
      keyFeatures: [
        'MDM - Bloqueio, Desbloqueio e Reinício Remoto de Terminais POS',
        'Provisionamento Criptografado via Código OTA (Over-The-Air)',
        'Livro-Razão Contábil de Estabelecimentos Credenciados',
        'Telemetria de Integridade e Auditoria de Segurança do Sistema'
      ],
      technicalSpecs: [
        'Comandos remotos via canal seguro de telegestão',
        'Relatório gerencial de faturamento acumulado da rede'
      ],
      workflow: '1. Novo terminal é ligado na loja do cliente → 2. Operador digita o PIN de pareamento OTA → 3. HQ valida e libera a licença Pro → 4. Telemetria passa a monitorar bateria, IP, versão do app e impressora.'
    }
  ];

  readonly filteredDocs = computed(() => {
    const cat = this.selectedDocCat();
    const query = this.searchFilter().toLowerCase();
    
    let list = this.docsList;
    if (cat !== 'all') {
      list = list.filter(d => d.category === cat);
    }
    if (query) {
      list = list.filter(d => d.name.toLowerCase().includes(query) || d.description.toLowerCase().includes(query) || d.keyFeatures.some(f => f.toLowerCase().includes(query)));
    }
    return list;
  });

  readonly activeDoc = signal<ModuleDoc | null>(this.docsList[0]);
}

