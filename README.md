# 3EATCRU Gastronomic Ecosystem & HQ Central

Plataforma SaaS Tripartida para o Ecossistema Gastronômico: Separação rigorosa de responsabilidades entre Governança Global (**HQ Central** - Dono do App / Plataforma), Operação de Loja (**Store OS** - Empresa / Loja Cadastrada) e Marketplace Consumidor (**Páginas Públicas / Marketplace & Catálogo** - Consumidor Final).

---

## 🌟 Estrutura das 3 Esferas

```
                            ┌────────────────────────┐
                            │       HQ CENTRAL       │
                            │   Super Admin (Dono)   │
                            └───────────┬────────────┘
                                        │
                      ┌─────────────────┴─────────────────┐
                      │                                   │
          ┌───────────▼───────────┐           ┌───────────▼───────────┐
          │       STORE OS        │           │  PÁGINAS PÚBLICAS     │
          │  Terminal de Operação │           │  Marketplace Regional │
          │   (Empresa / Loja)    │           │   (Consumidor Final)  │
          └───────────────────────┘           └───────────────────────┘
```

### 1. HQ Central (Esfera do Dono do App / Plataforma)
- **Governança Executiva:** Licenciamento e provisionamento de estabelecimentos (tenants), splits de comissão global (8% padrão), planos SaaS e métricas consolidadas.
- **Gestão de Frota MDM:** Bloqueio remoto, atualização de firmware e monitoramento em tempo real de hardware POS e telemetria de motoristas no campo.
- **Transmissão Global (Broadcast):** Disparo de comunicados e alertas em tempo real para os terminais ativos das lojas.
- **Auditoria Master & Infraestrutura:** Acompanhamento de latência, uptime (99.99%) e logs de segurança unificados.
- **Isolamento Estrito:** Não contém telas de PDV ou caixas de lojas; é a central de comando suprema da plataforma.

### 2. Store OS (Esfera da Empresa / Loja Cadastrada)
- **Diretoria da Unidade (Admin Hub):** Painel administrativo local exclusivo da filial para gerenciar assinatura, contas locais e terminais da loja.
- **Módulos Operacionais:** PDV (Ponto de Venda/Balcão com sangria, balança e leitor), KDS (Cozinha), Gestão de Mesas & Comandas, Estoque ERP com importação NFe XML e DRE Financeiro.
- **Hub de Logística & Entregadores Locais:** Roteamento de entregas locais, waypoints e cálculo de diárias e km.
- **Personalização "Minha Loja":** Customização da vitrine pública da loja (cores, banners, destaques e regras de pedido mínimo e taxa de entrega).
- **Isolamento Estrito:** Acessado apenas por operadores e gerentes da loja. Consumidores finais não têm acesso.

### 3. Páginas Públicas & Marketplace Regional (Esfera do Consumidor Final)
- **Descoberta Regional (`/regional`):** Busca de estabelecimentos por raio geodésico GPS (km via Haversine), especialidade e modalidades (Delivery, Retirada, Consumo no Local).
- **Vitrines Públicas (`/p/:id`):** Catálogo online individual de cada loja com carrinho, validação de pedido mínimo e checkout PIX.
- **Ferramentas de Mapeamento Livre (OpenFreeMap + Geodesia):** Medição de distância real em km, raio de alcance e navegação em mapa interativo sem chaves de API pagas.
- **Visualizações Múltiplas:** Modos **Fichário** (Grid), **Livro-Razão** (Lista Contábil) e **Mesa Cartográfica** (Mapa Interativo).

---

## 📚 Documentação Técnica

- **[ARCHITECTURE.md](./ARCHITECTURE.md):** Arquitetura detalhada, diagrama de papéis, especificações dos motores core e diretrizes de desenvolvimento.
- **[BUGS_AND_SOLUTIONS.md](./BUGS_AND_SOLUTIONS.md):** Registro vivo de histórico de bugs, soluções aplicadas, prevenção de falhas de IA e diretrizes de qualidade.

---

## 🛠️ Tecnologias & Comandos

- **Framework:** Angular 21 (Zoneless, Signals, Standalone, OnPush)
- **Estilização:** Tailwind CSS v4+
- **Mapas:** Leaflet + OpenFreeMap Liberty & MapToolsService (Haversine/Shoelace)
- **Servidor:** Express SSR (`src/server.ts`)

### Comandos de Verificação e Teste:
```bash
# Executa lint do ESLint Angular e suíte de testes unitários
bun run check

# Executa bateria de testes automatizados
bun run test:ci

# Valida tipagem e regras estáticas
bun run lint

# Compilação de produção AOT
bun run build
```
