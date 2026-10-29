# Documentação de Arquitetura & Motores Core (3EATCRU Gastronomic Ecosystem)

Este documento define a arquitetura técnica, divisão de papéis, motores de regras de negócio (Core Engines) e estrutura de dados do Ecossistema SaaS Tripartite **3EATCRU**.

---

## 🏛️ 1. Visão Geral da Arquitetura Tripartite

O sistema é rigorosamente dividido em três esferas de controle independentes:

```
                  ┌──────────────────────────────────────────────┐
                  │               HQ CENTRAL (/hq)               │
                  │     Super Admin • Dono do App / Plataforma   │
                  └──────────────────────┬───────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
       ┌───────────▼───────────┐                   ┌───────────▼───────────┐
       │     STORE OS (/os)    │                   │   PÁGINAS PÚBLICAS    │
       │ Terminal de Operações │                   │    (/regional, /p/)   │
       │    Empresa / Loja     │                   │    Consumidor Final   │
       └───────────────────────┘                   └───────────────────────┘
```

### Regra de Ouro de Isolamento de Acesso (RBAC) e Localização
- **HQ Central (`/hq` • `role: 'hq_admin'`):** Pertence EXCLUSIVAMENTE ao Dono do App / Plataforma. Contém governança de todas as lojas, split contábil de 8%, gestão de planos SaaS, supervisão da frota MDM global e curadoria da capa do Marketplace Regional. **Não contém o Store OS dentro dele e não opera caixas ou PDV de lojas.**
- **Store OS (`/os` • `role: 'operator'`):** Pertence à Empresa/Loja Cadastrada. É a estação de trabalho do lojista com PDV Frente de Caixa, KDS Cozinha, Salão de Mesas, Estoque NFe, DRE Local e a **Diretoria da Unidade** (painel administrativo local da filial). **O cliente consumidor final NÃO tem acesso a este sistema.**
- **Páginas Públicas do Consumidor (`/regional` e `/p/:id` • `role: 'guest' | 'consumer'`):** Interface pública para o consumidor final explorar restaurantes por raio geodésico (km), consultar cardápios, montar carrinho e efetuar pedidos online. **Sem acesso a painéis de gestão da loja ou do HQ.**

### Segregação entre Real e Simulação (App em Desenvolvimento)
1. **Modo Produção Real:** Vendas efetuadas no PDV ou vitrine pública geram registros contábeis persistidos localmente no navegador (`LocalStorage`), baixam estoque e geram comissão real do HQ.
2. **Modo Simulação (Sandbox):** Transações de teste e lotes gerados recebem a tag `isSimulated: true`, sufixo `-SIM` e insígnia âmbar `[SIMULAÇÃO TESTE]`, ficando restritos ao sandbox sem poluir o histórico fiscal oficial.

---

## ⚙️ 2. Motores Core de Negócio (Core Engines)

### 2.1 Motor de Mapeamento Geodésico & Ferramentas Livres (`MapToolsService`)
Para eliminar custos com APIs pagas de mapas mantendo precisão profissional, o ecossistema utiliza **Leaflet + OpenFreeMap Liberty** integrado a algoritmos geodésicos puros no frontend:
- **Haversine Distance Engine:** Calcula a distância real em km entre a referência do consumidor e o balcão comercial (`calculateDistance`).
- **Shoelace Area Engine:** Determina a área em m² e km² de polígonos desenhados para delimitação de zonas de entrega e raios de atuação (`calculateArea`).
- **DMS Converter:** Converte coordenadas decimais em Graus, Minutos e Segundos (`toDMS`) para auditoria técnica de localização de terminais e frota.

### 2.2 Motor de Transações, Splits & Ledger (`EcosystemService`)
- **Split Automático:** Aplica a comissão global da plataforma (padrão 8%) sobre o valor total do pedido.
- **Ledger Contábil Reativo:** Registra todas as vendas, taxas e movimentações financeiras das lojas e do HQ com rastreabilidade completa.
- **Log de Auditoria Global:** Registra eventos do sistema com marca temporal, ator, módulo e severidade (`info`, `warning`, `critical`).

### 2.3 Motor de Gestão de Frota e Roteamento (`DriversWindowComponent` & `DriverAppComponent`)
- **App Único do Motorista (3EAT Driver App PWA - `/driver`):** Aplicação unificada em PWA utilizada por todos os entregadores (sejam motoristas particulares da loja ou motoristas da plataforma HQ).
- **Frota da Loja vs Frota da Plataforma:**
  - *Frota Própria da Loja (Particular):* Entregadores contratados diretamente pela loja para entregas locais dedicadas.
  - *Frota On-Demand da Plataforma (HQ):* Pool regional de motoristas gerenciados globalmente pelo HQ Central e disponibilizados sob demanda para qualquer loja credenciada.
- **Agrupamento Automático (Clustering):** Agrupa pedidos de entrega por raio de proximidade em rotas otimizadas de até 3 pedidos.
- **Waypoints Tracking & Prova de Entrega:** Rastreamento geodésico da rota com leitura de QR Code na loja, captura de assinatura digital e foto de comprovante.

### 2.4 Motor de Gestão e Atualização MDM de Terminais POS & Frota (`HqCentralComponent`)
- **Supervisão MDM Dual:** Monitoramento de hardware físico (Terminais POS) e telemetria GPS em tempo real da Frota de Motoristas da Plataforma.
- **Controle Remoto de Dispositivos:** Bloqueio e desbloqueio em tempo real de terminais PDV e licenças de motoristas no campo.
- **Telemetria de Hardware & GPS:** Monitoramento de bateria, versão de firmware/app PWA, status do GPS e ping geodésico em tempo real.
### 2.5 Motor de Emulação & Build Android Native Apps (`HqAppsPreviewComponent`)
- **Simulador Nativo no HQ Central:** Visualizador em tempo real dos apps móveis individuais que serão compilados para Android (APK/AAB):
  - `3EAT Driver App (com.eatcru.driver)`: App nativo do entregador para rotas, GPS e comprovantes.
  - `3EAT Consumer App (com.eatcru.consumer)`: App nativo do cliente final para navegação no marketplace e compras.
  - `3EAT Storefront App (com.eatcru.storefront)`: App nativo da vitrine do lojista.
- **Ferramentas de Emulação:** Permite alternar entre modelos de smartphone (Google Pixel, Samsung Galaxy, Xiaomi), disparar Notificações Push simuladas de teste e inspecionar o `AndroidManifest.xml` com declarações de permissões nativas (GPS, Câmera, Push).

### 2.6 Motor de Adaptação de Form Factor (Desktop & Tablet Workstations vs Smartphone Native Apps)
- **Store OS (`/os`) — Exclusivo Desktop & Tablet Workstation:**
  - O **Store OS da Loja** é projetado exclusivamente para telas de estação de trabalho de alta produtividade: **Terminais POS/PDV Touch Widescreen**, **Monitores KDS de Cozinha** e **Tablets de Operação Comercial (1280px+ ou Tablet Landscape)**.
  - *Diretriz Fundamental:* O Store OS **NÃO necessita de visualização para Smartphone**. Toda a operação do lojista (PDV, KDS, Mesas, Estoque ERP, Financeiro) é mantida em layout expandido para telas grandes.
- **Apps Nativos Mobile — Smartphone Native (`/driver`, `/marketplace` & `/waiter`):**
  - O **App do Motorista (`com.eatcru.driver`)**, o **App do Consumidor (`com.eatcru.consumer`)** e o **App do Garçom (`com.eatcru.waiter`)** possuem visualização para **Smartphones em modo Portrait** (Smartphones Android, APK/AAB), além de suporte para Tablet.
- **Seletor de Form Factor no Emulador HQ:** Alternador rápido `[Smartphone]` vs `[Tablet / Desktop]` no simulador do HQ Central para auditar a responsividade dos aplicativos nativos Android.

### 2.7 App Mobile de Garçom (`com.eatcru.waiter`) & Pareamento Desktop por QR Code
- **Form Factor Mobile Nativo (`/waiter`):** O aplicativo de garçom foi projetado como app de smartphone portrait para agilidade no atendimento de salão (lançamento de pedidos rápidos, comandas por mesa, controle de 3 tempos de cozinha: `entrada`, `principal`, `sobremesa`, e solicitação de fechamento com divisão por pessoa).
- **Pareamento Desktop por QR Code (`TablesWindowComponent`):** A visão de salão no Store OS permanece em widescreen desktop/tablet para o caixa e recepcionista, contendo botão `[Parear App Garçom (QR Code)]` com SVG de alta fidelidade, PIN numérico e monitoramento de terminais pareados.
- **Integração no Simulador HQ:** O app do garçom é auditável e testável no simulador de smartphone e tablet do HQ Central com disparo de push notification de teste.

---

## 🛠️ 3. Padrões de Código e Diretrizes Tecnológicas

- **Framework:** Angular 21 (Arquitetura Zoneless, Signals, Standalone Components, OnPush Change Detection).
- **SSR & Express Integration:** Servidor Express em `src/server.ts` integrando renderização do Angular e tratamento seguro de APIs.
- **Estilização:** Tailwind CSS v4 com paletas exclusivas por esfera (Amber/Wood/Stone para o Marketplace e Store OS; Slate/Zinc/Emerald para o HQ Central).
- **Sem Dependências Proibidas:** Não utilizar `@angular/animations`, `FormsModule`, `ngModel` ou `zone.js`. Utilizar `motion` (JS vanilla) e CSS puro/Tailwind para animações.

---

## 🧪 4. Estratégia de Testes e Qualidade

O ciclo de integração contínua utiliza os comandos gerenciados via Bun:
1. `bun run check`: Análise estática com ESLint Angular e suíte de testes unitários (`vitest`).
2. `compile_applet`: Compilação estrita AOT com Angular CLI.
3. **Auditoria de Acessibilidade:** Uso exclusivo de tags interativas sem quebrar o suporte a navegação via teclado (`aria-label`, `<button type="button">`).
