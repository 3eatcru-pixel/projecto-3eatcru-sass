# 📖 DOCUMENTAÇÃO EXECUTIVA — HQ CENTRAL (3EATCRU OS)

---

## 🏛️ 1. Visão Geral da Arquitetura do Ecossistema

O ecossistema **3EATCRU OS** foi projetado seguindo o modelo **Tripartite Estrito**, garantindo que as responsabilidades da plataforma, das lojas e dos consumidores permaneçam 100% segregadas, sem sobreposição de papeis ou telas operacionais.

```
+-----------------------------------------------------------------------------------+
|                              1. HQ CENTRAL                                        |
|                   (Gabinete do Dono do App • Super Administrador)                  |
|                                                                                   |
|  • Provisionamento de Lojas (Tenants)      • Governança de Split e Comissões (8%) |
|  • Frota MDM (Terminais POS & Motoristas)  • Capa & Marketing do Portal Regional  |
|  • Auditoria Android APK (Console Real)    • Trilha de Auditoria & Segurança      |
+-----------------------------------------------------------------------------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
+------------------------------+                +----------------------------------+
|   2. STORE OS (LOJISTA)      |                |  3. CONSUMIDOR FINAL (PÚBLICO)    |
|   (Sistema da Loja Comercial)|                |  (Marketplace & Vitrines On-Demand)|
|                              |                |                                  |
|  • PDV Frente de Caixa HD    |                |  • Marketplace Mobile/Desktop    |
|  • Mesas, Salão & Comandas   |                |  • Busca Geodésica GPS (Haversine)|
|  • KDS Cozinha & Expedição   |                |  • Vitrine Pública da Loja (/p/) |
|  • Estoque ERP & Cardápio    |                |  • Regras: Pedido Mínimo, Taxa   |
|  • Frota Própria / Entregas  |                |    de Entrega & Tipo de Frota    |
+------------------------------+                +----------------------------------+
```

---

## 🛡️ 2. Módulos e Sub-abas do HQ Central

O **HQ Central** (`/hq`) é de acesso exclusivo do **Dono da Plataforma SaaS (`hq_admin`)**. Todas as operações executadas no HQ geram logs imutáveis na Trilha de Auditoria.

### 2.1. Sub-aba 1: Portfólio de Lojas (`tenants`)
* **Propósito:** Cadastrar, visualizar e gerenciar todos os estabelecimentos credenciados na plataforma.
* **Recursos:**
  - **Provisionamento On-Demand:** Botão `Provisionar Loja` abre modal para definir Razão Social, CNPJ Fiscal, Segmento (*Gastronomia*, *Varejo*, *Serviços*) e Plano Contratado (*Starter*, *Professional*, *Enterprise*).
  - **Governança & Split Customizado:** Abertura do modal de governança por loja (`HqTenantGovernanceModalComponent`) para ajuste fino da **Taxa de Comissão HQ (%)**, limite máximo de dispositivos POS e raio de atendimento geodésico.
  - **Status Operacional:** Chaveamento em tempo real para **Ativar**, **Suspender** ou colocar em **Período de Testes (Trial)**.

### 2.2. Sub-aba 2: Frota MDM & Telemetria (`devices`)
* **Propósito:** Controle remoto de hardware físico (Terminais POS touch, Tablets, Kiosks) e telemetria dos entregadores.
* **Recursos:**
  - **Terminais POS:** Exibe serial number, IP local, versão do SO, nível de bateria e status de conexão.
  - **Ações Remotas MDM:** Botões para **Reiniciar Dispositivo** e **Bloquear Terminal** à distância.
  - **Motoristas da Plataforma (MDM):** Monitoramento da frota própria do HQ e frotas das lojas, com disparo de **Ping Geodésico GPS** e verificação de compliance de CNH.

### 2.3. Sub-aba 3: Console de Auditoria Mobile Android (`apps_preview`)
* **Propósito:** Testar e auditar o comportamento visual e funcional dos 4 aplicativos mobile do ecossistema dentro de um chassi nativo de smartphone ou tablet.
* **Aplicativos Auditados:**
  1. `com.eatcru.driver` — App do Motorista (Rotas multi-paradas, navegação e comprovante).
  2. `com.eatcru.consumer` — App Cliente Marketplace (Layout mobile responsivo idêntico ao smartphone mockup).
  3. `com.eatcru.waiter` — App Comanda Garçom (Atendimento de mesas e despacho rápido).
  4. `com.eatcru.storefront` — Vitrine Pública da Loja (Cardápio e checkout).

### 2.4. Sub-aba 4: Tesouraria & Split SaaS (`ledger`)
* **Propósito:** Gestão financeira consolidada da receita da plataforma.
* **Recursos:**
  - **GMV Total:** Valor bruto transacionado nas vendas do marketplace.
  - **Comissão Acumulada (8% padrão):** Receita líquida retida pela plataforma.
  - **Livro-Razão Global:** Tabela discriminando ID da transação, loja de origem, canal e comissão calculada.

### 2.5. Sub-aba 5: Portal Regional (`regional`)
* **Propósito:** Gestão do marketing e capa do Marketplace Regional.
* **Recursos:**
  - Edição do título, subtítulo, imagem do banner hero e anúncio de destaque com insígnia `🏆 NO CENTRAL`.
  - Configuração do raio padrão de busca inicial e regiões metropolitanas ativas.

### 2.6. Sub-aba 6: CRM Global (`consumers`)
* **Propósito:** Diretório unificado de consumidores finais cadastrados no ecossistema.
* **Recursos:**
  - Métrica de LTV (Lifetime Value / Total Gasto na plataforma).
  - Histórico de pedidos e ações de auditoria de segurança de perfil.

### 2.7. Sub-aba 7: Infraestrutura & Config Global (`system`)
* **Propósito:** Controle técnico da nuvem e parâmetros globais do SaaS.
* **Recursos:**
  - Alteração da **Comissão Padrão do SaaS** (ex: 8%).
  - **Modo Manutenção SaaS:** Trava de emergência que coloca todos os terminais em modo de espera para atualizações críticas.
  - **Broadcast Global:** Disparo de mensagens internas para os lojistas em tempo real.
  - **Gráfico de Throughput:** Telemetria de latência, requisições por segundo e tráfego de dados.

### 2.8. Sub-aba 8: Auditoria Master (`audit`)
* **Propósito:** Trilha de auditoria em conformidade fiscal e regulatória.
* **Recursos:**
  - Log cronológico de todas as ações administrativas com nível de risco (*Info*, *Warning*, *Critical*).
  - Botão de **Executar Auditoria Geral do Ecossistema** para verificação de integridade dos nós multi-tenant.

---

## 🚚 3. Regras de Delivery Definidas pelo Lojista

No **3EATCRU OS**, cada lojista possui total autonomia para configurar suas regras de entrega na sub-aba **Horários & Entrega** do **Gerenciador da Vitrine** (Store OS) ou via modal de governança do HQ:

1. **Valor Mínimo do Pedido (`minOrderValue`):**
   - O lojista define o valor mínimo necessário em produtos para aceitar um pedido de entrega (ex: R$ 25,00).
   - No checkout da Vitrine (`CustomerStorefrontComponent`), se o subtotal da sacola for inferior ao mínimo da loja, o sistema **bloqueia o envio do pedido** e exibe um alerta educativo indicando quanto falta para atingir o mínimo.

2. **Taxa de Entrega / Valor do Delivery (`deliveryFee`):**
   - Definida individualmente pela loja (ex: R$ 5,00 ou R$ 0,00 para *Entrega Grátis*).
   - Exibida em destaque nos cards do Marketplace e no cabeçalho da Vitrine Pública.

3. **Operação de Logística / Frota (`deliveryFleetType`):**
   - **🛵 Frota Própria da Loja (`own`):** A entrega é realizada pelos entregadores contratados diretamente pelo estabelecimento. Os pedidos são gerenciados na janela *Frota & Entregadores* do Store OS.
   - **⚡ Frota Parceira Plataforma 3EAT (`platform`):** A entrega é despachada para a frota geodésica do ecossistema, atribuindo a rota ao App do Motorista (`/driver`).
   - **🔄 Logística Híbrida (`hybrid`):** Transbordo automático de entregas dependendo da demanda.

---

## 🔒 4. Matriz de Permissões & Acessos no Switcher

| Nível de Acesso | Perfil do Usuário | Rota | Descrição das Permissões |
| :--- | :--- | :--- | :--- |
| **HQ Central** | Dono do App (`hq_admin`) | `/hq` | Acesso total irrestrito: governança de lojas, split 8%, planos SaaS, MDM, infraestrutura e auditoria. |
| **Store OS** | Lojista (`operator`) | `/os` | Gestão operacional da loja: PDV Caixa, KDS, Mesas, Estoque, Finanças e Vitrine da Unidade. |
| **Marketplace Regional** | Consumidor (`guest`) | `/regional` | Busca pública geodésica, consulta de cardápios, localização por raio GPS e direcionamento para vitrines. |
| **Vitrine Pública** | Consumidor (`guest`) | `/p/:id` | Cardápio online da loja, adição de produtos à sacola, validação de pedido mínimo e checkout PIX. |
| **App Motorista** | Entregador (`driver`) | `/driver` | Rotas de entrega, navegação GPS turn-by-turn, clock-in QR code e prova de entrega. |
| **App Garçom** | Atendente (`waiter`) | `/waiter` | Abertura de comandas por mesa, lançamento de itens em tempo real e fechamento de conta. |

---

## 🛠️ 5. Resumo Técnico de Compilação & Qualidade

* **Framework:** Angular v21.0.0 (Zoneless puro)
* **Gerenciamento de Estado:** Signals (`signal`, `computed`, `effect`)
* **Animações:** CSS Tailwind 4 + Vanilla JS Motion
* **Validação de Código:** 100% de aprovação nos testes `ng lint` e compilação AOT `compile_applet`.

---

## ⚙️ 6. Arquitetura de Motores Core & Modo Sandbox (Simulação vs. Produção Real)

Para garantir resiliência, isolamento estrito e conformidade com as diretrizes do ecossistema (sem Firebase e sem contaminação contábil):

1. **`FinancialCoreEngine`**: Calcula o split contábil de comissões (8% plataforma), taxas de serviço, retenção fiscal e projeções de faturamento.
2. **`LogisticsCoreEngine`**: Processa matrizes de distância geodésica (Haversine/Shoelace) e taxas de entrega por quilometragem excedente.
3. **`InventoryCoreEngine`**: Gerencia o estoque no ERP e executa simuladores de prevenção de ruptura de estoque.
4. **`OrderWorkflowCoreEngine`**: Controla a esteira de status de comandas e pedidos (`pending` ➔ `preparing` ➔ `ready` ➔ `dispatched` ➔ `completed`).
5. **`SimulationSandboxEngine` & Segregação Real/Simulação**:
   - **Isolamento de Coleções**: O `EcosystemService` mantém coleções segregadas via signals (`realOrders` vs. `simulatedOrders` e `realFinancials` vs. `simulatedFinancials`).
   - **Indicadores Contábeis Transparentes**: Em modo real, o faturamento da plataforma (`hqPublicSalesTotal`) e os relatórios DRE da loja calculam estritamente transações reais (`isSimulated: false`).
   - **Purga Imediata de Testes**: O botão `Limpar Testes` aciona `clearSimulationData()`, removendo instantaneamente todos os pedidos, transações e rotas de teste sem impactar os registros reais salvos no `localStorage`.
   - **Motores Locais Puros**: O sistema opera 100% com regras de negócio em motores TypeScript puros, com o serviço Firebase desativado por padrão para assegurar autonomia técnica e ausência de dependências externas.

