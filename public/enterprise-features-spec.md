# 3EATCRU Enterprise Ecosystem • Feature Specification & Architectural Blueprint
*(Benchmark: UberEats Manager, Deliveroo Restaurant Hub, Oracle Micros Simphony POS)*

Este documento detalha o inventário completo de funcionalidades de nível industrial ("Enterprise Grade") integradas ao **HQ Central** e ao ecossistema multi-tenant 3EATCRU.

---

## 1. Gestão de Filiais & Multi-Tenancy (Estilo Oracle Simphony HQ)
* **Estrutura Hierárquica Global:** Permite ao Super Admin gerenciar dezenas ou milhares de estabelecimentos e filiais independentes a partir de um único painel central.
* **Isolamento de Dados & Configurações por Tenant:** Cada filial possui seu próprio CNPJ, horário de funcionamento, raio de entrega, catálogo de produtos, estoque e regras de impostos.
* **Planos de Assinatura Dinâmicos:** Classificação em *Starter*, *Professional* e *Enterprise*, com limites configuráveis de terminais POS e taxas de serviço.
* **Modo Auditoria Super Admin:** Acesso instantâneo de inspeção (Supervision Mode) onde o Dono da Plataforma pode entrar no painel OS de qualquer loja sem necessidade de credenciais adicionais, com registro imutável em log de auditoria.

---

## 2. Gestão de Frotas & Terminais POS / MDM (Estilo Oracle Micros HW Management)
* **Controle Remoto de Hardware:** Monitoramento em tempo real de maquininhas de cartão, tablets de garçom e totens Kiosk.
* **Telemetria de Campo:** Indicadores de nível de bateria, força de sinal (4G/Wi-Fi), endereço IP, endereço MAC e versão de firmware/app instalada.
* **Ações Remotas de Segurança:**
  * **Bloqueio Remoto (Remote Lock):** Desativa imediatamente um terminal roubado, perdido ou inadimplente.
  * **Reinicialização Forçada (Reboot / OTA Update):** Envia pacotes de atualização de cardápio e firmware over-the-air.
  * **Pareamento Criptografado (MDM Enrollment):** Registro de novos terminais via QR Code ou número de série.

---

## 3. Motor Logístico & Roteirização Inteligente (Estilo UberEats / Deliveroo Dispatch)
* **Agrupamento de Proximidade (Batching):** Algoritmo geodésico que agrupa automaticamente até **3 pedidos** próximos em uma única rota otimizada, reduzindo o custo por entrega.
* **Cálculo Dinâmico de Tarifas (Driver Rate Engine):**
  * Valor base por entrega (ex: R$ 7.00 inclusos até 3.0 km).
  * Adicional por quilômetro excedente (ex: R$ 1.50 / km).
  * Bônus por parada adicional em rotas agrupadas (ex: R$ 3.00 por parada extra).
* **Gestão de Presença (Clock-in / Clock-off):**
  * **Motoristas Próprios:** Clock-in via QR Code na entrada da loja e Clock-off na saída gerenciado pelo operador da loja.
  * **Motoristas de Plataforma:** Modelo em nuvem (estilo Uber), permitindo aceitar rotas disponíveis em tempo real.

---

## 4. Livro-Razão Contábil & Split Automático (Estilo Stripe Connect)
* **Gestão de GMV (Gross Merchandise Volume):** Acompanhamento em tempo real do faturamento bruto consolidado e fracionado por praça e filial.
* **Split de Receita Automatizado:** Retenção automática da taxa de serviço da plataforma (ex: 8% a 10%) e agendamento de repasses líquidos para as contas bancárias das lojas parceiras (D+1).
* **Central de Pagamento de Entregadores:** Compensação instantânea de diárias e ganhos por rota com baixa automática no fluxo de caixa.

---

## 5. Governança do Marketplace Regional (Estilo Deliveroo Editions / Uber Direct)
* **Curadoria de Praça:** Ativação de banners de destaque (Hero Banner), campanhas sazonais e anúncios promocionais na página principal do marketplace.
* **Geofencing & Raio de Descoberta:** Ajuste dinâmico do raio geodésico para exibição de estabelecimentos com base na coordenada GPS do consumidor.

---

## 6. Segurança e Auditoria Imutável (Compliance Empresarial)
* **Trilha de Auditoria (Audit Trail):** Registro de todas as ações administrativas (alteração de tarifas, bloqueio de dispositivos, provisões de tenants e acessos) com carimbo de horário, usuário, módulo e gravidade (`info`, `warning`, `critical`).
* **Paleta de Comandos (`Ctrl+K`):** Navegação e execução rápida de comandos sem fricção para operadores e administradores de alta performance.
