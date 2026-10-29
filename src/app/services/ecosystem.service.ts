import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MapToolsService } from './map-tools.service';
import {
  ActiveEcosystemTab,
  CompanyTenant,
  POSDevice,
  MarketplaceAppModule,
  ProductItem,
  OrderTransaction,
  TableInfo,
  FinancialRecord,
  AuditLog,
  UserSession,
  SocialMessage,
  MarketingCampaign,
  ExternalOrder,
  Appointment,
  MemoNote,
  CustomerProfile,
  Supplier,
  ServiceOrder,
  Promotion,
  RegionalMarketplaceConfig,
  Employee,
  StoreDriver,
  ConsumerAccount,
  DeliveryRoute,
  DeliveryWaypoint,
  ClockEvent,
  LicensePlan,
  SystemAuditReport
} from '../models/ecosystem.model';

import { FinancialCoreEngine } from '../core/engines/financial-core.engine';
import { LogisticsCoreEngine } from '../core/engines/logistics-core.engine';
import { InventoryCoreEngine } from '../core/engines/inventory-core.engine';
import { OrderWorkflowCoreEngine } from '../core/engines/order-workflow-core.engine';
import { SimulationSandboxEngine } from '../core/engines/simulation-sandbox.engine';
import { PaymentEngine } from '../core/engines/payment.engine';
import { FirebaseService } from '../core/firebase/firebase.service';

@Injectable({
  providedIn: 'root'
})
export class EcosystemService {
  private readonly router = inject(Router);
  public readonly mapTools = inject(MapToolsService);
  public readonly firebase = inject(FirebaseService);

  // Core Business Engines
  public readonly financialEngine = inject(FinancialCoreEngine);
  public readonly logisticsEngine = inject(LogisticsCoreEngine);
  public readonly inventoryEngine = inject(InventoryCoreEngine);
  public readonly orderEngine = inject(OrderWorkflowCoreEngine);
  public readonly sandboxEngine = inject(SimulationSandboxEngine);
  public readonly paymentEngine = inject(PaymentEngine);

  constructor() {
    this.loadRealDataLocally();
  }

  // Active navigation tab (Legacy/Internal tracking)
  readonly activeTab = signal<ActiveEcosystemTab>('login');
  readonly currentView = signal<'os' | 'hq' | 'marketplace' | 'login'>('login');

  // Global notification toast (replacing window.alert for clean iframe execution)
  readonly notification = signal<{ message: string; type: 'success' | 'info' | 'warning'; id: number } | null>(null);

  notify(message: string, type: 'success' | 'info' | 'warning' = 'success') {
    const id = Date.now();
    this.notification.set({ message, type, id });
    setTimeout(() => {
      if (this.notification()?.id === id) {
        this.notification.set(null);
      }
    }, 3800);
  }

  clearNotification() {
    this.notification.set(null);
  }

  // Active user session (starts unauthenticated by default)
  readonly currentSession = signal<UserSession | null>(null);

  // Selected active tenant in OS Client
  readonly currentTenantId = signal<string>('tenant-1');

  // User's Geographic Reference for Regional Discovery (Marketplace de Todas na Área)
  readonly userReferenceAddress = signal<string>('Avenida Paulista, 1000 - Bela Vista, São Paulo - SP, 01310-100');
  readonly userReferenceCoords = signal<{ lat: number; lng: number }>({ lat: -23.5651, lng: -46.6521 });
  readonly maxDiscoveryRadiusKm = signal<number>(30);

  // Regional Marketplace Configuration (Governed by Executive HQ)
  readonly regionalConfig = signal<RegionalMarketplaceConfig>({
    heroTitle: 'Encontre Estabelecimentos pelo Ecossistema 3eatcru',
    heroSubtitle: 'Explore fichas comerciais em modo Fichário, consulte o Livro-Razão Contábil ou localize pela Mesa Cartográfica com cálculo geodésico de distância real.',
    heroTag: 'ARQUIVO DE NEGÓCIOS LOCAIS & BALCÕES PÚBLICOS',
    heroBannerImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1600&q=80',
    heroCtaText: 'Explorar Balcões da Região',
    heroAnnouncement: '🚚 Festival Gastronômico da Paulista: Entregas expressas em até 30 minutos em todo o perímetro central!',
    showHeroAnnouncement: true,
    featuredTenantIds: ['tenant-1', 'tenant-2', 'tenant-4'],
    defaultSearchRadiusKm: 15,
    activeRegionName: 'Grande São Paulo • Polo Central Paulista'
  });

  // Global System Health & Infrastructure (Governed by App Owner)
  readonly uptimePercent = signal<number>(99.99);
  readonly activeSessionsCount = computed(() => 120 + Math.floor(this.devices().length * 1.5) + (this.orders().length % 20));
  readonly avgLatencyMs = computed(() => Math.round(10 + (this.activeSessionsCount() / 50)));
  readonly maintenanceMode = signal<boolean>(false);
  readonly globalBroadcastMessage = signal<string | null>(null);

  // Final Audit Verification State & Report
  readonly systemAuditVerified = signal<boolean>(false);
  readonly lastSystemAuditReport = signal<SystemAuditReport | null>(null);

  runFullSystemAudit(): SystemAuditReport {
    const issues: string[] = [];
    const tenantsList = this.tenants();
    const productsList = this.products();
    const ordersList = this.orders();
    const devicesList = this.devices();

    const tenantIdSet = new Set(tenantsList.map(t => t.id));

    // 1. Audit Tenants
    for (const t of tenantsList) {
      if (!t.id || !t.name) {
        issues.push('Registro de Tenant incompleto sem ID ou nome.');
      }
      if (!t.cnpj || t.cnpj.trim().length < 11) {
        issues.push(`Tenant [${t.name}] com CNPJ/documento incompleto: ${t.cnpj || 'não informado'}`);
      }
      if (t.activeDevicesCount > t.devicesLimit) {
        issues.push(`Tenant [${t.name}] excedeu limite de dispositivos contratados (${t.activeDevicesCount}/${t.devicesLimit}).`);
      }
    }

    // 2. Audit Products
    for (const p of productsList) {
      if (!p.tenantId || !tenantIdSet.has(p.tenantId)) {
        issues.push(`Produto [${p.name}] associado a tenant inexistente (${p.tenantId || 'não informado'}).`);
      }
      if (p.price <= 0) {
        issues.push(`Produto [${p.name}] cadastrado com valor zerado ou negativo (R$ ${p.price}).`);
      }
      if (p.stock < 0) {
        issues.push(`Produto [${p.name}] com estoque negativo inconsistente (${p.stock}).`);
      }
    }

    // 3. Audit Orders Arithmetic & Ledger Reference
    let ledgerConsistent = true;
    for (const o of ordersList) {
      if (!tenantIdSet.has(o.tenantId) && o.tenantId !== 'hq') {
        issues.push(`Pedido #${o.orderNumber} vinculado a estabelecimento desconhecido: ${o.tenantId}`);
      }
      const expectedTotal = Math.max(0, o.subtotal + (o.tax || 0) - (o.discount || 0));
      if (Math.abs(expectedTotal - o.total) > 0.15) {
        ledgerConsistent = false;
        issues.push(`Inconsistência aritmética no pedido #${o.orderNumber}: esperado R$ ${expectedTotal.toFixed(2)} vs registrado R$ ${o.total.toFixed(2)}`);
      }
    }

    const status: 'passed' | 'warning' | 'failed' = issues.length === 0 ? 'passed' : (ledgerConsistent ? 'warning' : 'failed');

    const report: SystemAuditReport = {
      timestamp: new Date().toLocaleString('pt-BR'),
      tenantsChecked: tenantsList.length,
      productsChecked: productsList.length,
      ordersChecked: ordersList.length,
      devicesChecked: devicesList.length,
      ledgerConsistent,
      issuesFound: issues,
      status
    };

    this.lastSystemAuditReport.set(report);
    return report;
  }

  verifyFullSystemAudit() {
    const report = this.runFullSystemAudit();
    this.systemAuditVerified.set(true);

    if (report.status === 'passed') {
      this.logAudit(
        'Auditoria Estrutural Concluída',
        'HQ',
        `Auditoria executada: ${report.tenantsChecked} lojas, ${report.productsChecked} produtos e ${report.ordersChecked} pedidos inspecionados. 100% íntegro.`,
        'info'
      );
      this.notify(`Auditoria Estrutural concluída: ${report.tenantsChecked} lojas e ${report.ordersChecked} pedidos inspecionados com integridade confirmada.`, 'success');
    } else {
      this.logAudit(
        'Auditoria com Apontamentos',
        'HQ',
        `Auditoria executada: ${report.issuesFound.length} apontamento(s). Consistência contábil: ${report.ledgerConsistent ? 'OK' : 'Divergência'}.`,
        'warning'
      );
      this.notify(`Auditoria concluída com ${report.issuesFound.length} apontamento(s). Consulte o painel HQ.`, 'warning');
    }
  }

  updateRegionalConfig(updates: Partial<RegionalMarketplaceConfig>) {
    this.regionalConfig.update(cfg => ({ ...cfg, ...updates }));
    this.notify('Portal Regional atualizado pelo Gabinete Executivo HQ com sucesso!', 'success');
  }

  // Haversine geodesic distance in kilometers
  calculateDistanceToUser(destLat?: number, destLng?: number): number {
    if (!destLat || !destLng) return 1.2;
    const user = this.userReferenceCoords();
    return this.mapTools.calculateDistance(user, { lat: destLat, lng: destLng }).km;
  }

  // Tenants (HQ & Regional Directory)
  readonly tenants = signal<CompanyTenant[]>([
    {
      id: 'tenant-1',
      name: 'Burger & Co Gourmet',
      legalName: 'Burger & Co Gastronomia Artesanal S.A.',
      cnpj: '14.882.910/0001-44',
      category: 'restaurant',
      plan: 'Professional',
      status: 'active',
      devicesLimit: 6,
      activeDevicesCount: 4,
      contactEmail: 'gerencia@burgerco.com.br',
      phone: '+55 11 3254-8899',
      createdAt: '2024-11-20',
      address: {
        street: 'Rua Augusta',
        number: '1500',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01304-001',
        complement: 'Salão Térreo e Balcão'
      },
      deliveryRadiusKm: 8,
      serviceFeePercent: 10,
      openingHours: 'Terça a Domingo, das 11:30 às 23:45',
      fichaCode: '#001',
      lat: -23.5578,
      lng: -46.6599,
      rating: 4.9,
      reviewCount: 238,
      tagline: 'Alimentos & Bebidas • Hamburgueria Artesanal & Chopps',
      badgeCategory: 'RESTAURANTES',
      supportsDelivery: true,
      supportsTakeout: true,
      supportsReservation: true,
      isOpen: true,
      estimatedDeliveryMinutes: '30-45 min',
      deliveryFee: 5.0,
      logo: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=200&q=80',
      specialties: ['Smash Burgers', 'Queijo Brie Trufado', 'Batata Rústica', 'Craft Beers'],
      storeSlug: 'burger-co',
      themeColor: 'amber',
      announcementText: '🔥 Especial de Quarta: Combo Burger Artisan + Chopp com 20% OFF!',
      showAnnouncement: true,
      announcementType: 'promo',
      whatsappNumber: '+55 11 98765-4321',
      instagramHandle: '@burgercogourmet',
      aboutText: 'Hamburgueria artesanal de alta gastronomia com cortes nobres selecionados, pães de fermentação natural e chopps artesanais locais.',
      highlightedProductIds: ['prod-1', 'prod-3'],
      minOrderValue: 25.00,
      deliveryFleetType: 'platform',
      driverRateConfig: {
        baseFee: 7.00,
        includedKm: 3.0,
        extraKmFee: 1.50,
        extraStopBonus: 3.00
      }
    },
    {
      id: 'tenant-2',
      name: 'Padaria & Empório Estrela',
      legalName: 'Estrela Bela Vista Panificação e Empório Ltda',
      cnpj: '28.199.412/0001-89',
      category: 'retail',
      plan: 'Enterprise',
      status: 'active',
      devicesLimit: 8,
      activeDevicesCount: 5,
      contactEmail: 'pedidos@padariaestrela.com.br',
      phone: '+55 11 3105-1222',
      createdAt: '2024-08-14',
      address: {
        street: 'Alameda Joaquim Eugênio de Lima',
        number: '680',
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01403-000',
        complement: 'Esquina c/ Alameda Santos'
      },
      deliveryRadiusKm: 12,
      serviceFeePercent: 8,
      openingHours: 'Todos os dias, das 06:00 às 22:30',
      fichaCode: '#002',
      lat: -23.5684,
      lng: -46.6492,
      rating: 4.8,
      reviewCount: 312,
      tagline: 'Varejo & Padaria • Fermentação Natural, Frios & Cafés Especiais',
      badgeCategory: 'VAREJO',
      supportsDelivery: true,
      supportsTakeout: true,
      supportsReservation: false,
      isOpen: true,
      estimatedDeliveryMinutes: '25-40 min',
      deliveryFee: 4.5,
      logo: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
      specialties: ['Croissant Amêndoas', 'Pão de Fermentação', 'Café Filtrado', 'Doces Finos'],
      minOrderValue: 15.00,
      deliveryFleetType: 'own'
    },
    {
      id: 'tenant-3',
      name: 'Drogaria FarmaCru Paulista',
      legalName: 'FarmaCru Medicamentos e Cosméticos Ltda',
      cnpj: '33.910.822/0001-12',
      category: 'retail',
      plan: 'Starter',
      status: 'active',
      devicesLimit: 4,
      activeDevicesCount: 3,
      contactEmail: 'atendimento@farmacru.com.br',
      phone: '+55 11 3289-4455',
      createdAt: '2025-01-10',
      address: {
        street: 'Avenida Brigadeiro Luís Antônio',
        number: '2100',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01318-002'
      },
      deliveryRadiusKm: 15,
      serviceFeePercent: 0,
      openingHours: '24 Horas Ininterrupto',
      fichaCode: '#003',
      lat: -23.5642,
      lng: -46.6478,
      rating: 4.7,
      reviewCount: 154,
      tagline: 'Varejo Farmacêutico • Medicamentos, Cuidados Pessoais & Suplementos',
      badgeCategory: 'VAREJO',
      supportsDelivery: true,
      supportsTakeout: true,
      supportsReservation: false,
      isOpen: true,
      estimatedDeliveryMinutes: '20-35 min',
      deliveryFee: 3.0,
      logo: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
      specialties: ['Medicamentos', 'Vitaminas', 'Dermocosméticos', 'Primeiros Socorros'],
      minOrderValue: 20.00,
      deliveryFleetType: 'platform'
    },
    {
      id: 'tenant-4',
      name: 'Alpha Barber & Spa Masculino',
      legalName: 'Alpha Serviços Estéticos e Barbearia S/S',
      cnpj: '45.109.301/0001-90',
      category: 'services',
      plan: 'Professional',
      status: 'active',
      devicesLimit: 3,
      activeDevicesCount: 2,
      contactEmail: 'contato@alphabarber.com.br',
      phone: '+55 11 3062-7711',
      createdAt: '2025-02-01',
      address: {
        street: 'Rua Oscar Freire',
        number: '890',
        neighborhood: 'Cerqueira César',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-000'
      },
      deliveryRadiusKm: 5,
      serviceFeePercent: 0,
      openingHours: 'Segunda a Sábado, das 09:00 às 21:00',
      fichaCode: '#004',
      lat: -23.5631,
      lng: -46.6698,
      rating: 4.95,
      reviewCount: 420,
      tagline: 'Serviços & Estética • Corte Premium, Barba Terapia & Agendamentos',
      badgeCategory: 'SERVIÇOS',
      supportsDelivery: false,
      supportsTakeout: false,
      supportsReservation: true,
      isOpen: true,
      estimatedDeliveryMinutes: 'Sob Agendamento',
      deliveryFee: 0,
      logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80',
      specialties: ['Barboterapia', 'Corte Degradê', 'Limpeza de Pele', 'Tratamento Capilar'],
      minOrderValue: 0.00,
      deliveryFleetType: 'own'
    },
    {
      id: 'tenant-5',
      name: 'TechStore Express Paulista',
      legalName: 'Tech Varejo Digital & Suporte Informática Ltda',
      cnpj: '19.400.112/0001-33',
      category: 'retail',
      plan: 'Starter',
      status: 'active',
      devicesLimit: 3,
      activeDevicesCount: 2,
      contactEmail: 'vendas@techpaulista.com.br',
      phone: '+55 11 3141-9900',
      createdAt: '2025-02-15',
      address: {
        street: 'Rua Santa Ifigênia',
        number: '280',
        neighborhood: 'República',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01207-000'
      },
      deliveryRadiusKm: 20,
      serviceFeePercent: 0,
      openingHours: 'Segunda a Sábado, das 08:30 às 18:00',
      fichaCode: '#005',
      lat: -23.5415,
      lng: -46.6378,
      rating: 4.6,
      reviewCount: 180,
      tagline: 'Varejo & Informática • Acessórios, Cabos, Hardware & Periféricos POS',
      badgeCategory: 'VAREJO',
      supportsDelivery: true,
      supportsTakeout: true,
      supportsReservation: false,
      isOpen: false,
      estimatedDeliveryMinutes: '45-60 min',
      deliveryFee: 8.0,
      logo: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      specialties: ['Cabos USB-C', 'Terminais POS', 'Roteadores Wi-Fi 6', 'Headsets'],
      minOrderValue: 50.00,
      deliveryFleetType: 'own'
    },
    {
      id: 'tenant-6',
      name: 'FixPro Oficina & Manutenção',
      legalName: 'FixPro Serviços Automotivos e Motores Ltda',
      cnpj: '51.309.811/0001-65',
      category: 'services',
      plan: 'Starter',
      status: 'active',
      devicesLimit: 2,
      activeDevicesCount: 2,
      contactEmail: 'oficina@fixpro.com.br',
      phone: '+55 11 3887-2345',
      createdAt: '2025-03-01',
      address: {
        street: 'Rua Tutóia',
        number: '550',
        neighborhood: 'Vila Mariana',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04007-002'
      },
      deliveryRadiusKm: 10,
      serviceFeePercent: 0,
      openingHours: 'Segunda a Sexta, das 08:00 às 18:00',
      fichaCode: '#006',
      lat: -23.5782,
      lng: -46.6511,
      rating: 4.75,
      reviewCount: 96,
      tagline: 'Serviços Mecânicos • Troca de Óleo, Alinhamento & Diagnóstico Computadorizado',
      badgeCategory: 'SERVIÇOS',
      supportsDelivery: false,
      supportsTakeout: false,
      supportsReservation: true,
      isOpen: true,
      estimatedDeliveryMinutes: 'Agendamento Direto',
      deliveryFee: 0,
      logo: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=200&q=80',
      coverImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
      specialties: ['Revisão Preventiva', 'Freios e Suspensão', 'Troca de Óleo Express'],
      minOrderValue: 0.00,
      deliveryFleetType: 'own'
    }
  ]);

  readonly currentTenant = computed(() => {
    const id = this.currentTenantId();
    return this.tenants().find(t => t.id === id) || this.tenants()[0];
  });

  // Devices (HQ & OS Client MDM Fleet)
  readonly devices = signal<POSDevice[]>([
    {
      id: 'dev-hq-1',
      tenantId: 'hq',
      tenantName: 'HQ Central (Infraestrutura)',
      deviceName: 'HQ Central Node Alpha',
      type: 'terminal',
      serialNumber: 'HQ-MASTER-001-SP',
      macAddress: '00:1A:2B:3C:4D:5E',
      ipAddress: '10.0.0.1',
      osVersion: '3EATCRU HQ Kernel 5.0.0',
      appVersion: 'v3.0.0',
      status: 'online',
      lastPing: new Date().toISOString(),
      location: 'Data Center HQ - Servidor Central',
      batteryLevel: 100
    },
    {
      id: 'dev-1',
      tenantId: 'tenant-1',
      tenantName: 'Burger & Co Gourmet',
      deviceName: 'PDV Principal - Caixa 1',
      type: 'terminal',
      serialNumber: 'SN-3EAT-9981-BR',
      macAddress: 'B4:2E:99:A1:02:11',
      ipAddress: '192.168.1.101',
      osVersion: '3EATCRU OS Pro 4.2.0',
      appVersion: 'v2.8.4',
      status: 'online',
      lastPing: new Date().toISOString(),
      location: 'Salão Principal - Frente de Caixa',
      batteryLevel: 100
    },
    {
      id: 'dev-2',
      tenantId: 'tenant-1',
      tenantName: 'Burger & Co Gourmet',
      deviceName: 'Tablet Garçom 01',
      type: 'tablet',
      serialNumber: 'SN-3EAT-4412-BR',
      macAddress: 'D8:3A:48:99:12:F4',
      ipAddress: '192.168.1.108',
      osVersion: '3EATCRU OS Mobile 4.2.0',
      appVersion: 'v2.8.4',
      status: 'online',
      lastPing: new Date(Date.now() - 2 * 60000).toISOString(),
      location: 'Salão & Área Externa',
      batteryLevel: 84
    },
    {
      id: 'dev-3',
      tenantId: 'tenant-1',
      tenantName: 'Burger & Co Gourmet',
      deviceName: 'KDS Cozinha Master',
      type: 'terminal',
      serialNumber: 'SN-3EAT-1029-BR',
      macAddress: 'F0:79:59:71:34:AA',
      ipAddress: '192.168.1.115',
      osVersion: '3EATCRU OS Pro 4.2.1',
      appVersion: 'v2.9.0',
      status: 'online',
      lastPing: new Date().toISOString(),
      location: 'Cozinha Quente / Expedição',
      batteryLevel: 100
    },
    {
      id: 'dev-4',
      tenantId: 'tenant-2',
      tenantName: 'Padaria & Empório Estrela',
      deviceName: 'PDV Balcão Panificação',
      type: 'terminal',
      serialNumber: 'SN-3EAT-5561-BR',
      macAddress: '22:8A:4F:19:90:3C',
      ipAddress: '192.168.2.50',
      osVersion: '3EATCRU OS Kiosk 4.1.9',
      appVersion: 'v2.8.0',
      status: 'online',
      lastPing: new Date(Date.now() - 5 * 60000).toISOString(),
      location: 'Balcão de Frios & Pães',
      batteryLevel: 95
    },
    {
      id: 'dev-5',
      tenantId: 'tenant-3',
      tenantName: 'Drogaria FarmaCru Paulista',
      deviceName: 'PDV Farma Express 01',
      type: 'terminal',
      serialNumber: 'SN-3EAT-8812-BR',
      macAddress: '33:9B:5E:20:01:A2',
      ipAddress: '192.168.3.10',
      osVersion: '3EATCRU OS Pro 4.2.0',
      appVersion: 'v2.8.4',
      status: 'online',
      lastPing: new Date().toISOString(),
      location: 'Frente de Caixa Farma',
      batteryLevel: 100
    }
  ]);

  // Marketplace App Modules
  readonly marketplaceApps = signal<MarketplaceAppModule[]>([
    {
      id: 'app-pos',
      name: '3EATCRU PDV Pro',
      category: 'POS & Sales',
      version: 'v3.1.0',
      publisher: '3EATCRU Core Team',
      description: 'Ponto de Venda ultrarrápido com leitor de código de barras, PIX, cartão e impressora fiscal.',
      price: 0,
      rating: 4.9,
      installedCount: 1420,
      isInstalled: true,
      isCore: true,
      icon: 'point_of_sale',
      compatibility: ['restaurant', 'retail', 'services', 'hybrid']
    },
    {
      id: 'app-kds',
      name: 'KDS Kitchen & Tables',
      category: 'Kitchen & Tables',
      version: 'v2.9.0',
      publisher: '3EATCRU Core Team',
      description: 'Gestão visual de comandas, mesas, QR code para pedidos na mesa e integração com a cozinha.',
      price: 49.90,
      rating: 4.8,
      installedCount: 890,
      isInstalled: true,
      isCore: false,
      icon: 'restaurant_menu',
      compatibility: ['restaurant', 'hybrid']
    },
    {
      id: 'app-inventory',
      name: 'Smart ERP Inventory',
      category: 'Inventory & ERP',
      version: 'v3.0.2',
      publisher: 'LogiFlow Systems',
      description: 'Controle de estoque em tempo real, lotes, validade, alertas de reposição e fornecedores.',
      price: 69.90,
      rating: 4.7,
      installedCount: 1150,
      isInstalled: true,
      isCore: false,
      icon: 'inventory_2',
      compatibility: ['restaurant', 'retail', 'services', 'hybrid']
    },
    {
      id: 'app-finance',
      name: '3EATCRU Finance & Cashier',
      category: 'Financial & Tax',
      version: 'v2.5.1',
      publisher: '3EATCRU Core Team',
      description: 'Fluxo de caixa, conciliação bancária automática, DRE gerencial e emissão de notas fiscais.',
      price: 79.90,
      rating: 4.9,
      installedCount: 1310,
      isInstalled: true,
      isCore: false,
      icon: 'account_balance',
      compatibility: ['restaurant', 'retail', 'services', 'hybrid']
    },
    {
      id: 'app-delivery',
      name: 'Omni Delivery & Marketplace',
      category: 'Delivery & Marketplace',
      version: 'v4.0.0',
      publisher: '3EATCRU Connect',
      description: 'Página exclusiva de pedidos online (estilo UberEats) integrada direto ao seu PDV e Cozinha.',
      price: 99.90,
      rating: 4.9,
      installedCount: 740,
      isInstalled: true,
      isCore: false,
      icon: 'delivery_dining',
      compatibility: ['restaurant', 'retail']
    },
    {
      id: 'app-crm',
      name: 'Fidelidade & CRM 3EAT',
      category: 'CRM & Loyalty',
      version: 'v1.8.0',
      publisher: 'RetentionX',
      description: 'Clube de pontos, campanhas de cashback, cupons automatizados e WhatsApp marketing.',
      price: 59.90,
      rating: 4.6,
      installedCount: 420,
      isInstalled: false,
      isCore: false,
      icon: 'loyalty',
      compatibility: ['restaurant', 'retail', 'services']
    }
  ]);

  // HQ Platform Fee Rate (8% on all public marketplace orders)
  readonly hqCommissionRate = signal<number>(0.08);

  // License Plans (Preços dos planos controlados pelo HQ Central)
  readonly licensePlans = signal<LicensePlan[]>([
    {
      id: 'Starter',
      name: 'Starter (Iniciante)',
      priceMonthly: 149.00,
      maxDevices: 2,
      includedModules: ['PDV Caixa', 'Estoque Básica', 'Relatórios Simples'],
      description: 'Ideal para pequenos comércios e balcões individuais.'
    },
    {
      id: 'Professional',
      name: 'Professional (Avançado)',
      priceMonthly: 299.00,
      maxDevices: 5,
      includedModules: ['PDV Avançado', 'KDS Cozinha', 'Mesas & Salão', 'Estoque ERP', 'Hub Logística'],
      description: 'Perfeito para restaurantes e lojas com grande fluxo de atendimento.'
    },
    {
      id: 'Enterprise',
      name: 'Enterprise (Corporativo Ilimitado)',
      priceMonthly: 599.00,
      maxDevices: 20,
      includedModules: ['Todos os Módulos', 'MDM Frota de Hardware', 'Suporte VIP 24h', 'API Dedicada'],
      description: 'Para redes de franquias e operações multiloja de alto desempenho.'
    }
  ]);

  updatePlanPrice(planId: string, newPrice: number) {
    this.licensePlans.update(plans =>
      plans.map(p => p.id === planId ? { ...p, priceMonthly: newPrice } : p)
    );
    this.notify(`Preço do plano ${planId} atualizado com sucesso pelo HQ Central para R$ ${newPrice.toFixed(2)}/mês.`, 'success');
  }

  readonly isSimulationActive = computed(() => this.sandboxEngine.activeExecutionMode() === 'simulation');

  // Real orders only (Production)
  readonly realOrders = computed(() => {
    return this.orders().filter(o => !o.isSimulated && o.mode !== 'simulation');
  });

  // Simulated test orders (Sandbox)
  readonly simulatedOrders = computed(() => {
    return this.orders().filter(o => o.isSimulated || o.mode === 'simulation');
  });

  // Real financial records only (Production)
  readonly realFinancials = computed(() => {
    return this.financials().filter(f => !f.isSimulated && f.mode !== 'simulation');
  });

  // Simulated financial records (Sandbox)
  readonly simulatedFinancials = computed(() => {
    return this.financials().filter(f => f.isSimulated || f.mode === 'simulation');
  });

  readonly hqPublicSalesTotal = computed(() => {
    const list = this.isSimulationActive() ? this.orders() : this.realOrders();
    return list
      .filter(o => o.channel === 'Customer Storefront' || o.channel === 'Online Marketplace')
      .reduce((sum, o) => sum + o.total, 0);
  });

  readonly hqTotalCommissionRevenue = computed(() => {
    return this.hqPublicSalesTotal() * this.hqCommissionRate();
  });

  // HR Employees (Registro de Funcionários por Loja)
  readonly employees = signal<Employee[]>([
    {
      id: 'emp-1',
      tenantId: 'tenant-1',
      name: 'Lucas Souza',
      role: 'gerente',
      cpf: '342.118.990-12',
      phone: '(11) 98765-1122',
      salary: 4500.00,
      commissionPercent: 2,
      status: 'active',
      shift: 'integral',
      hireDate: '2023-03-15'
    },
    {
      id: 'emp-2',
      tenantId: 'tenant-1',
      name: 'Mariana Lima',
      role: 'caixa',
      cpf: '412.338.100-55',
      phone: '(11) 97711-2233',
      salary: 2600.00,
      status: 'active',
      shift: 'tarde',
      hireDate: '2023-08-01'
    },
    {
      id: 'emp-3',
      tenantId: 'tenant-1',
      name: 'Chef Rodrigo Santos',
      role: 'cozinheiro',
      cpf: '219.004.881-99',
      phone: '(11) 96622-3344',
      salary: 3800.00,
      status: 'active',
      shift: 'noite',
      hireDate: '2022-11-10'
    },
    {
      id: 'emp-4',
      tenantId: 'tenant-1',
      name: 'Carlos Oliveira',
      role: 'entregador',
      cpf: '189.554.210-33',
      phone: '(11) 95533-4455',
      salary: 2200.00,
      commissionPercent: 5,
      status: 'active',
      shift: 'noite',
      hireDate: '2024-01-20'
    }
  ]);

  // HR Clock Events (Registro de Ponto em Tempo Real)
  readonly clockEvents = signal<ClockEvent[]>([]);

  toggleClock(employeeId: string) {
    const emp = this.employees().find(e => e.id === employeeId);
    if (!emp) return;

    const lastEvent = [...this.clockEvents()]
      .reverse()
      .find(ev => ev.employeeId === employeeId);
    
    const type = !lastEvent || lastEvent.type === 'out' ? 'in' : 'out';
    
    const newEvent: ClockEvent = {
      id: 'clk-' + Date.now(),
      employeeId,
      employeeName: emp.name,
      timestamp: new Date().toISOString(),
      type
    };

    this.clockEvents.update(evs => [...evs, newEvent]);
    this.notify(`Ponto ${type === 'in' ? 'Batido (Entrada)' : 'Encerrado (Saída)'}: ${emp.name}`, 'success');
  }

  // Drivers Fleet (Motoristas Particulares da Loja + Motoristas Globais da Plataforma HQ)
  readonly drivers = signal<StoreDriver[]>([
    {
      id: 'drv-1',
      tenantId: 'tenant-1',
      name: 'Carlos Oliveira',
      phone: '(11) 95533-4455',
      vehicleType: 'moto',
      licensePlate: 'ABC-4E12',
      status: 'available',
      activeDeliveriesCount: 0,
      rating: 4.9,
      completedTodayCount: 14,
      driverType: 'private',
      deviceName: 'Motorola Moto G84 (Loja)',
      appVersion: '3EAT Driver App v3.2.0',
      batteryLevel: 88,
      lastGpsPing: new Date().toISOString(),
      currentLocationName: 'Consolação - Rua Augusta, 1500',
      complianceVerified: true,
      cnhNumber: '99218201928'
    },
    {
      id: 'drv-2',
      tenantId: 'tenant-1',
      name: 'Felipe "Flash" Silva',
      phone: '(11) 94422-1100',
      vehicleType: 'moto',
      licensePlate: 'XYZ-8K90',
      status: 'delivering',
      activeDeliveriesCount: 2,
      rating: 5.0,
      completedTodayCount: 18,
      driverType: 'platform',
      deviceName: 'Samsung Galaxy A54 (Plataforma HQ)',
      appVersion: '3EAT Driver App v3.2.0',
      batteryLevel: 94,
      lastGpsPing: new Date(Date.now() - 60000).toISOString(),
      currentLocationName: 'Bela Vista - Av. Paulista, 1000',
      complianceVerified: true,
      cnhNumber: '10293847561'
    },
    {
      id: 'drv-3',
      tenantId: 'tenant-1',
      name: 'Eduardo Pedala',
      phone: '(11) 93311-9988',
      vehicleType: 'bike',
      status: 'offline',
      activeDeliveriesCount: 0,
      rating: 4.8,
      completedTodayCount: 0,
      driverType: 'private',
      deviceName: 'Xiaomi Redmi Note 12',
      appVersion: '3EAT Driver App v3.1.8',
      batteryLevel: 45,
      lastGpsPing: new Date(Date.now() - 32 * 60000).toISOString(),
      currentLocationName: 'Jardins - Al. Santos, 400',
      complianceVerified: true,
      cnhNumber: '55443322110'
    },
    {
      id: 'drv-hq-1',
      tenantId: 'hq',
      name: 'Bruno "Veloce" Souza',
      phone: '(11) 91122-3344',
      vehicleType: 'moto',
      licensePlate: 'PLAT-1E23',
      status: 'available',
      activeDeliveriesCount: 0,
      rating: 4.95,
      completedTodayCount: 22,
      driverType: 'platform',
      deviceName: 'Samsung Galaxy S23 (Frota Global HQ)',
      appVersion: '3EAT Driver App v3.2.0',
      batteryLevel: 98,
      lastGpsPing: new Date().toISOString(),
      currentLocationName: 'Polo Central - Praça da Sé',
      complianceVerified: true,
      cnhNumber: '88776655443'
    },
    {
      id: 'drv-hq-2',
      tenantId: 'hq',
      name: 'Renata Castro Express',
      phone: '(11) 97788-9900',
      vehicleType: 'carro',
      licensePlate: 'EXP-9K88',
      status: 'available',
      activeDeliveriesCount: 0,
      rating: 4.88,
      completedTodayCount: 15,
      driverType: 'platform',
      deviceName: 'iPhone 14 (Frota Global HQ)',
      appVersion: '3EAT Driver App v3.2.0',
      batteryLevel: 76,
      lastGpsPing: new Date(Date.now() - 2 * 60000).toISOString(),
      currentLocationName: 'Pinheiros - Faria Lima, 2000',
      complianceVerified: true,
      cnhNumber: '44332211099'
    }
  ]);

  // 3EAT Entregas - Driver App Routes
  readonly deliveryRoutes = signal<DeliveryRoute[]>([
    {
      id: 'route-2847',
      routeCode: 'Rota #2847',
      tenantId: 'tenant-1',
      date: 'Hoje, 08:12',
      timeWindow: '08:12 - 09:24',
      totalDistanceKm: 18.6,
      estimatedDuration: '1h 12min',
      totalEarnings: 72.50,
      status: 'available',
      totalDeliveredCount: 8,
      waypoints: [
        {
          id: 'wp-1',
          orderId: 'ord-101',
          customerName: 'Maria Silva',
          customerPhone: '(43) 99123-4567',
          address: 'Rua das Acácias, 456 - Jd. das Flores',
          cityState: 'Londrina/PR',
          distanceKm: 2.4,
          etaMinutes: 8,
          productSummary: '1x Caixa médio (25x20x15cm) • Peso: 3,5 kg',
          weightKg: 3.5,
          packageDimensions: '25x20x15cm',
          notes: 'Entrega no portão principal. Tocar interfone 12.',
          status: 'in_transit',
          sequenceNumber: 1
        },
        {
          id: 'wp-2',
          orderId: 'ord-102',
          customerName: 'João Santos',
          customerPhone: '(43) 98877-6655',
          address: 'Avenida Higienópolis, 1200 - Apto 802',
          cityState: 'Londrina/PR',
          distanceKm: 4.1,
          etaMinutes: 14,
          productSummary: '2x Sacola Térmica Gourmet',
          weightKg: 2.0,
          packageDimensions: 'Sacola Padrão',
          notes: 'Deixar na portaria com o seu Antônio.',
          status: 'pending',
          sequenceNumber: 2
        },
        {
          id: 'wp-3',
          orderId: 'ord-103',
          customerName: 'Carla Rocha',
          customerPhone: '(43) 97711-2233',
          address: 'Rua Paranaguá, 380',
          cityState: 'Londrina/PR',
          distanceKm: 3.8,
          etaMinutes: 12,
          productSummary: '1x Combo Lanche + Bebida',
          weightKg: 1.2,
          notes: 'Cliente aguardando na frente da empresa.',
          status: 'pending',
          sequenceNumber: 3
        }
      ]
    },
    {
      id: 'route-2848',
      routeCode: 'Rota #2848',
      tenantId: 'tenant-1',
      date: 'Hoje, 10:30',
      timeWindow: '10:30 - 12:15',
      totalDistanceKm: 22.4,
      estimatedDuration: '1h 45min',
      totalEarnings: 85.00,
      status: 'available',
      totalDeliveredCount: 10,
      waypoints: [
        {
          id: 'wp-201',
          customerName: 'Roberto Alves',
          customerPhone: '(43) 99888-1122',
          address: 'Rua Santos, 500',
          cityState: 'Londrina/PR',
          distanceKm: 5.2,
          etaMinutes: 18,
          productSummary: '3x Pacotes Varejo',
          status: 'pending',
          sequenceNumber: 1
        }
      ]
    },
    {
      id: 'route-2849',
      routeCode: 'Rota #2849',
      tenantId: 'tenant-1',
      date: 'Hoje, 14:00',
      timeWindow: '14:00 - 15:20',
      totalDistanceKm: 16.8,
      estimatedDuration: '1h 20min',
      totalEarnings: 63.00,
      status: 'available',
      totalDeliveredCount: 6,
      waypoints: [
        {
          id: 'wp-301',
          customerName: 'Fernanda Lima',
          customerPhone: '(43) 99111-3344',
          address: 'Avenida Bandeirantes, 850',
          cityState: 'Londrina/PR',
          distanceKm: 3.2,
          etaMinutes: 10,
          productSummary: '1x Encomenda Especial',
          status: 'pending',
          sequenceNumber: 1
        }
      ]
    }
  ]);

  // Consumer Directory (Administrado e auditado pelo HQ)
  readonly consumerAccounts = signal<ConsumerAccount[]>([
    {
      id: 'cons-1',
      name: 'Carlos Eduardo',
      email: 'carlos.eduardo@gmail.com',
      phone: '(11) 98888-7777',
      cpf: '320.198.441-00',
      primaryAddress: 'Rua Augusta, 1200 - Apto 42',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      totalOrders: 12,
      totalSpent: 840.50,
      status: 'active',
      registeredAt: '2024-02-10'
    },
    {
      id: 'cons-2',
      name: 'Fernanda Rocha',
      email: 'fernanda.rocha@hotmail.com',
      phone: '(43) 99123-4455',
      cpf: '411.229.880-11',
      primaryAddress: 'Avenida Higienópolis, 500',
      neighborhood: 'Centro',
      city: 'Londrina',
      totalOrders: 8,
      totalSpent: 520.00,
      status: 'active',
      registeredAt: '2024-04-15'
    }
  ]);

  readonly activeConsumer = signal<ConsumerAccount | null>({
    id: 'cons-1',
    name: 'Carlos Eduardo',
    email: 'carlos.eduardo@gmail.com',
    phone: '(11) 98888-7777',
    cpf: '320.198.441-00',
    primaryAddress: 'Rua Augusta, 1200 - Apto 42',
    neighborhood: 'Consolação',
    city: 'São Paulo',
    totalOrders: 12,
    totalSpent: 840.50,
    status: 'active',
    registeredAt: '2024-02-10'
  });

  // Inventory Products (Shared between POS, Inventory, and Storefront)
  readonly products = signal<ProductItem[]>([
    // Tenant 1: Burger & Co Gourmet
    {
      id: 'prod-1',
      tenantId: 'tenant-1',
      supplierId: 'sup-1',
      name: 'Burger Artisan Trufado',
      category: 'Burgers & Grill',
      price: 48.90,
      costPrice: 16.50,
      stock: 45,
      minStock: 10,
      barcode: '7891028300011',
      sku: 'BUR-TRU-01',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Blend Angus 180g, queijo brie maçaricado, maionese trufada artesanal no pão brioche amanteigado.'
    },
    {
      id: 'prod-2',
      tenantId: 'tenant-1',
      name: 'Batata Rústica com Cheddar e Bacon',
      category: 'Acompanhamentos',
      price: 32.00,
      costPrice: 8.00,
      stock: 60,
      minStock: 15,
      barcode: '7891028300028',
      sku: 'BAT-CHED-02',
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Batatas rústicas temperadas com alecrim, cobertas com cheddar cremoso inglês e bacon crocante.'
    },
    {
      id: 'prod-3',
      tenantId: 'tenant-1',
      name: 'Craft IPA Beer 500ml',
      category: 'Bebidas & Chopp',
      price: 24.90,
      costPrice: 9.00,
      stock: 120,
      minStock: 30,
      barcode: '7891028300035',
      sku: 'BEV-IPA-03',
      image: 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Cerveja artesanal India Pale Ale com notas cítricas de maracujá e aroma marcante de lúpulo.'
    },
    {
      id: 'prod-4',
      tenantId: 'tenant-1',
      name: 'Cheesecake de Frutas Vermelhas',
      category: 'Sobremesas',
      price: 26.00,
      costPrice: 7.50,
      stock: 18,
      minStock: 5,
      barcode: '7891028300042',
      sku: 'DES-CHE-04',
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Fatia generosa de cheesecake estilo Nova York com calda artesanal de amora e framboesa fresca.'
    },
    {
      id: 'prod-5',
      tenantId: 'tenant-1',
      name: 'Coca-Cola Zero 350ml',
      category: 'Bebidas & Chopp',
      price: 8.50,
      costPrice: 3.20,
      stock: 150,
      minStock: 30,
      barcode: '7891028300059',
      sku: 'BEV-COC-05',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Lata 350ml gelada.'
    },
    {
      id: 'prod-6',
      tenantId: 'tenant-1',
      name: 'Smash Bacon Double Supreme',
      category: 'Burgers & Grill',
      price: 42.00,
      costPrice: 13.00,
      stock: 35,
      minStock: 8,
      barcode: '7891028300066',
      sku: 'BUR-SMA-06',
      image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Dois ultra-smashes de 90g, queijo cheddar derretido, farofa de bacon crocante e molho especial.'
    },

    // Tenant 2: Padaria & Empório Estrela
    {
      id: 'prod-201',
      tenantId: 'tenant-2',
      supplierId: 'sup-1',
      name: 'Croissant Francês Amêndoas & Creme',
      category: 'Padaria Fina',
      price: 18.50,
      wholesalePrice: 15.00,
      costPrice: 5.20,
      stock: 40,
      minStock: 10,
      barcode: '7892000000010',
      sku: 'PAD-CRO-01',
      image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Massa folhada artesanal com manteiga francesa, recheio de creme frangipane e amêndoas laminadas tostadas.'
    },
    {
      id: 'prod-202',
      tenantId: 'tenant-2',
      name: 'Pão de Campanha Fermentação Natural (Levain)',
      category: 'Padaria Artesanal',
      price: 24.00,
      costPrice: 6.00,
      stock: 25,
      minStock: 5,
      barcode: '7892000000027',
      sku: 'PAD-LEV-02',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Pão rústico de 500g fermentado por 36 horas com crosta crocante e miolo alvéolo macio.'
    },
    {
      id: 'prod-203',
      tenantId: 'tenant-2',
      name: 'Café Especial Microlote Filtrado V60 (250g)',
      category: 'Cafés & Bebidas',
      price: 36.00,
      costPrice: 14.00,
      stock: 50,
      minStock: 15,
      barcode: '7892000000034',
      sku: 'CAF-MIC-03',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Grãos arábica 100% da Mantiqueira de Minas com notas de caramelo, mel e acidez cítrica equilibrada.'
    },

    // Tenant 3: Drogaria FarmaCru Paulista
    {
      id: 'prod-301',
      tenantId: 'tenant-3',
      name: 'Vitamina C + Zinco Efervescente 30 comp',
      category: 'Suplementos & Vitaminas',
      price: 29.90,
      wholesalePrice: 24.50,
      costPrice: 12.00,
      stock: 80,
      minStock: 20,
      barcode: '7893000000019',
      sku: 'FAR-VIT-01',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Fórmula de alta absorção para suporte imunológico e energia diária sabor laranja.'
    },
    {
      id: 'prod-302',
      tenantId: 'tenant-3',
      name: 'Protetor Solar Facial Toque Seco FPS 60',
      category: 'Dermocosméticos',
      price: 68.00,
      costPrice: 32.00,
      stock: 35,
      minStock: 10,
      barcode: '7893000000026',
      sku: 'FAR-SOL-02',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Controle de oleosidade por 12 horas, textura gel-creme ultraleve não comedogênica.'
    },

    // Tenant 4: Alpha Barber & Spa
    {
      id: 'prod-401',
      tenantId: 'tenant-4',
      name: 'Sessão Barba Terapia c/ Toalha Quente & Ozônio',
      category: 'Serviços & Barboterapia',
      price: 75.00,
      costPrice: 15.00,
      stock: 999,
      minStock: 1,
      barcode: '7894000000018',
      sku: 'SRV-BAR-01',
      image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Aparação geométrica, navalha com lâmina descartável, óleo de argan e hidratação facial com toalha aromatizada.'
    },
    {
      id: 'prod-402',
      tenantId: 'tenant-4',
      name: 'Corte de Cabelo Masculino Signature & Styling',
      category: 'Serviços de Barbearia',
      price: 85.00,
      costPrice: 18.00,
      stock: 999,
      minStock: 1,
      barcode: '7894000000025',
      sku: 'SRV-COR-02',
      image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Consultoria de visagismo, lavagem relaxante com massagem capilar e finalização com pomada matte importada.'
    },

    // Tenant 5: TechStore Express
    {
      id: 'prod-501',
      tenantId: 'tenant-5',
      name: 'Cabo USB-C Trançado Blindado 100W 2m',
      category: 'Acessórios & Cabos',
      price: 49.00,
      costPrice: 15.00,
      stock: 95,
      minStock: 25,
      barcode: '7895000000017',
      sku: 'TEC-CAB-01',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
      availableOnline: true,
      description: 'Carregamento ultrarrápido Power Delivery com conector reforçado em liga de alumínio aeroespacial.'
    }
  ]);

  // Tables for Restaurant Module
  readonly tables = signal<TableInfo[]>([
    { id: 't-1', number: 1, capacity: 4, status: 'occupied', server: 'Carlos M.', guests: 3, currentTotal: 147.60, zone: 'Salão Principal' },
    { id: 't-2', number: 2, capacity: 2, status: 'available', zone: 'Salão Principal' },
    { id: 't-3', number: 3, capacity: 6, status: 'billing', server: 'Ana P.', guests: 5, currentTotal: 245.50, zone: 'Varanda Externa' },
    { id: 't-4', number: 4, capacity: 4, status: 'available', zone: 'Salão Principal' },
    { id: 't-5', number: 5, capacity: 2, status: 'occupied', server: 'Carlos M.', guests: 2, currentTotal: 88.00, zone: 'Varanda Externa' },
    { id: 't-6', number: 6, capacity: 8, status: 'reserved', server: 'Ana P.', zone: 'Bar & Lounge' }
  ]);

  // Orders / Transactions (Shared between POS, KDS & Storefront)
  readonly orders = signal<OrderTransaction[]>([
    {
      id: 'ord-101',
      tenantId: 'tenant-1',
      orderNumber: '#101',
      type: 'dine-in',
      tableNumber: 'Mesa 1',
      customerName: 'Roberto Silva',
      items: [
        { product: this.products()[0], quantity: 2, notes: 'Ponto ao ponto, sem cebola' },
        { product: this.products()[2], quantity: 2 }
      ],
      subtotal: 147.60,
      tax: 14.76,
      discount: 0,
      total: 162.36,
      paymentMethod: 'card',
      status: 'preparing',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      channel: 'POS',
      lat: -23.5580,
      lng: -46.6601
    },
    {
      id: 'ord-102',
      tenantId: 'tenant-1',
      orderNumber: '#102',
      type: 'delivery',
      customerName: 'Mariana Costa',
      customerPhone: '+55 11 98111-2233',
      items: [
        { product: this.products()[5], quantity: 1, notes: 'Borda recheada' },
        { product: this.products()[4], quantity: 2 }
      ],
      subtotal: 85.00,
      tax: 8.50,
      discount: 5.00,
      total: 88.50,
      paymentMethod: 'online',
      status: 'pending',
      createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
      channel: 'Customer Storefront',
      lat: -23.5645,
      lng: -46.6525
    },
    {
      id: 'ord-103',
      tenantId: 'tenant-1',
      orderNumber: '#103',
      type: 'delivery',
      customerName: 'Roberto Alves',
      customerPhone: '+55 11 97766-5544',
      items: [{ product: this.products()[0], quantity: 1 }],
      subtotal: 48.90,
      tax: 4.89,
      discount: 0,
      total: 53.79,
      paymentMethod: 'pix',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      channel: 'Online Marketplace',
      lat: -23.5670,
      lng: -46.6480
    },
    {
      id: 'ord-104',
      tenantId: 'tenant-1',
      orderNumber: '#104',
      type: 'delivery',
      customerName: 'Carla Dias',
      customerPhone: '+55 11 96655-4433',
      items: [{ product: this.products()[1], quantity: 2 }],
      subtotal: 64.00,
      tax: 6.40,
      discount: 0,
      total: 70.40,
      paymentMethod: 'card',
      status: 'pending',
      createdAt: new Date().toISOString(),
      channel: 'Customer Storefront',
      lat: -23.5620,
      lng: -46.6550
    },
    {
      id: 'ord-105',
      tenantId: 'tenant-2',
      orderNumber: '#E05',
      type: 'delivery',
      customerName: 'Sérgio Santos',
      customerPhone: '+55 11 95544-3322',
      items: [{ product: this.products()[6], quantity: 3 }],
      subtotal: 55.50,
      tax: 0,
      discount: 0,
      total: 55.50,
      paymentMethod: 'pix',
      status: 'pending',
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      channel: 'Customer Storefront',
      lat: -23.5684,
      lng: -46.6492
    }
  ]);

  // Financial Records
  readonly financials = signal<FinancialRecord[]>([
    { id: 'fin-1', date: 'Hoje, 19:42', type: 'sale', category: 'Vendas PDV', description: 'Comanda Mesa 3 (Pago)', amount: 245.50, paymentMethod: 'Cartão Crédito', referenceId: 'ord-100' },
    { id: 'fin-2', date: 'Hoje, 18:15', type: 'sale', category: 'Delivery Online', description: 'Pedido Online #101', amount: 88.50, paymentMethod: 'PIX', referenceId: 'ord-102' },
    { id: 'fin-3', date: 'Hoje, 14:00', type: 'expense', category: 'Insumos / Hortifrúti', description: 'Compra diária de vegetais e hortifrúti', amount: 320.00, paymentMethod: 'Dinheiro', referenceId: 'sup-01' },
    { id: 'fin-4', date: 'Ontem, 22:30', type: 'sale', category: 'Vendas Balcão', description: 'Fechamento de Caixa Turno Noite', amount: 3450.00, paymentMethod: 'Misto', referenceId: 'shift-01' }
  ]);

  // Audit Logs
  readonly auditLogs = signal<AuditLog[]>([
    { id: 'log-1', timestamp: '2026-10-27 20:10', user: 'admin@3eatcru.com', action: 'Ativação de Dispositivo', module: 'HQ', details: 'Dispositivo SN-3EAT-4412 vinculado ao Bistrô Paris.', severity: 'info' },
    { id: 'log-2', timestamp: '2026-10-27 19:22', user: 'gerencia@bistroparis.com', action: 'Atualização de Estoque', module: 'OS Client', details: 'Reposição manual de Burger Artisan Trufado (+30 un)', severity: 'info' },
    { id: 'log-3', timestamp: '2026-10-27 18:05', user: 'system@3eatcru.com', action: 'Sincronização Marketplace', module: 'Marketplace', details: 'Módulo Omni Delivery atualizado para v4.0.0 com sucesso.', severity: 'info' },
    { id: 'log-4', timestamp: '2026-10-27 16:40', user: 'admin@3eatcru.com', action: 'Alerta de Licença', module: 'HQ', details: 'Urban Burger atingiu 10/12 dispositivos ativos.', severity: 'warning' }
  ]);

  // Social & Marketing Audit Interactions
  readonly socialMessages = signal<SocialMessage[]>([
    { id: 'sm-1', sender: 'Lucas Andrade', avatar: 'https://i.pravatar.cc/150?u=lucas', text: 'Olá! Gostaria de saber se vocês entregam no bairro Jardins?', time: '14:20', platform: 'whatsapp', unread: true },
    { id: 'sm-2', sender: 'Beatriz Martins', avatar: 'https://i.pravatar.cc/150?u=beatriz', text: 'Adorei o burger de ontem! Vou postar nos meus stories.', time: '13:45', platform: 'instagram', unread: false },
    { id: 'sm-3', sender: 'Carla Souza', avatar: 'https://i.pravatar.cc/150?u=carla', text: 'Tem opção vegetariana no cardápio de hoje?', time: '11:10', platform: 'whatsapp', unread: false },
    { id: 'sm-4', sender: 'Promoção Relâmpago', avatar: 'https://i.pravatar.cc/150?u=promo', text: 'Campanha de 20% OFF enviada para 450 clientes.', time: '09:00', platform: 'whatsapp', unread: false, isMarketing: true }
  ]);

  readonly marketingCampaigns = signal<MarketingCampaign[]>([
    { id: 'mc-1', title: 'Black Friday Antecipada', status: 'active', platform: 'whatsapp', reach: 1250, conversions: 45, sentAt: '2026-10-25' },
    { id: 'mc-2', title: 'Lançamento Burger Trufado', status: 'completed', platform: 'instagram', reach: 8500, conversions: 120, sentAt: '2026-10-20' },
    { id: 'mc-3', title: 'Cupom de Reativação', status: 'scheduled', platform: 'whatsapp', reach: 300, conversions: 0, sentAt: '2026-11-01' }
  ]);

  readonly externalOrders = signal<ExternalOrder[]>([
    { id: 'eo-1', source: 'ifood', orderId: '#9921', customerName: 'Felipe Melo', items: ['2x Burger Artisan', '1x Batata Rústica'], total: 129.80, status: 'pending', createdAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { id: 'eo-2', source: 'ifood', orderId: '#9918', customerName: 'Juliana Paes', items: ['1x Smash Bacon', '1x Coca Zero'], total: 50.50, status: 'accepted', createdAt: new Date(Date.now() - 18 * 60000).toISOString() },
    { id: 'eo-3', source: 'whatsapp', orderId: '#WA-882', customerName: 'Marcos Braz', items: ['1x Cheesecake'], total: 26.00, status: 'ready', createdAt: new Date(Date.now() - 25 * 60000).toISOString() }
  ]);

  // Appointments (Agenda)
  readonly appointments = signal<Appointment[]>([
    { id: 'ap-1', tenantId: 'tenant-1', customerName: 'João Ferreira', customerPhone: '11 98822-3344', date: '2026-10-27', time: '19:30', serviceType: 'Reserva de Mesa (6p)', status: 'confirmed' },
    { id: 'ap-2', tenantId: 'tenant-1', customerName: 'Carla Dias', customerPhone: '11 97711-2233', date: '2026-10-27', time: '20:00', serviceType: 'Aniversário - Mesa 4', status: 'pending' },
    { id: 'ap-3', tenantId: 'tenant-4', customerName: 'Marcos Paulo', customerPhone: '11 96655-4433', date: '2026-10-28', time: '10:00', serviceType: 'Corte Degradê + Barba', status: 'confirmed' },
    { id: 'ap-4', tenantId: 'tenant-6', customerName: 'Sandra Lima', customerPhone: '11 95544-3322', date: '2026-10-28', time: '14:30', serviceType: 'Revisão Preventiva (Fit)', status: 'confirmed' }
  ]);

  // Notes (Memos)
  readonly notes = signal<MemoNote[]>([
    { id: 'note-1', title: 'Lembrar: Pedir Insumos', content: 'Falar com distribuidor de batatas amanhã cedo.', updatedAt: 'Hoje, 15:20', color: 'yellow' },
    { id: 'note-2', title: 'Troca de Turno', content: 'Verificar sangria do caixa 2 antes das 22h.', updatedAt: 'Hoje, 18:45', color: 'blue' },
    { id: 'note-3', title: 'Manutenção', content: 'Agendar limpeza dos freezers no domingo.', updatedAt: 'Ontem, 10:00', color: 'green' }
  ]);

  readonly customers = signal<CustomerProfile[]>([
    { id: 'cust-1', name: 'Ricardo Oliveira', cpf: '123.456.789-00', email: 'ricardo@email.com', phone: '11 98888-7777', loyaltyPoints: 450, storeCredit: 50.00 },
    { id: 'cust-2', name: 'Aline Santos', cpf: '987.654.321-11', email: 'aline@email.com', phone: '11 97777-6666', loyaltyPoints: 1200, storeCredit: 15.50 },
    { id: 'cust-3', name: 'Bruno Lima', cpf: '456.123.789-22', email: 'bruno@email.com', phone: '11 96666-5555', loyaltyPoints: 0, storeCredit: 0 }
  ]);

  // Service Orders
  readonly serviceOrders = signal<ServiceOrder[]>([
    {
      id: 'os-1',
      osNumber: '#OS-1024',
      clientName: 'João Ferreira',
      equipment: 'Manutenção Caldeira Espresso Nuova',
      technician: 'Carlos Lima',
      description: 'Pressão inconstante e calcificação em válvula seladora.',
      priority: 'Crítico',
      status: 'triagem',
      parts: [],
      laborPrice: 300.00,
      price: 300.00,
      progressPercent: 10,
      createdAt: '10:30'
    },
    {
      id: 'os-2',
      osNumber: '#OS-1025',
      clientName: 'Restaurante Sabor & Arte',
      equipment: 'Revisão Seladora Vácuo Industrial',
      technician: 'Roberto A.',
      description: 'Troca de fita teflon e bomba de vácuo.',
      priority: 'Normal',
      status: 'triagem',
      parts: [],
      laborPrice: 250.00,
      price: 250.00,
      progressPercent: 0,
      createdAt: '11:15'
    }
  ]);

  // Promotions (Mix & Match / Retail Bundles)
  readonly promotions = signal<Promotion[]>([
    {
      id: 'promo-1',
      name: 'Combo Café + Croissant',
      type: 'bundle',
      tenantId: 'tenant-2',
      triggerProductIds: ['prod-201', 'prod-203'],
      discountValue: 10, // 10% OFF
      isActive: true
    },
    {
      id: 'promo-2',
      name: 'Leve 3 Pague 2 - Croissants',
      type: 'buy_get_free',
      tenantId: 'tenant-2',
      triggerProductIds: ['prod-201'],
      minQuantity: 3,
      discountValue: 100, // 100% discount on the free one
      isActive: true
    }
  ]);

  readonly suppliers = signal<Supplier[]>([
    { id: 'sup-1', name: 'Hortifrúti Central', contactName: 'Manoel', email: 'vendas@horticentral.com', phone: '11 91111-2222', category: 'Alimentos Frescos', deliveryDays: ['Segunda', 'Quarta', 'Sexta'] },
    { id: 'sup-2', name: 'Bebidas SP Distribuidora', contactName: 'Ricardo', email: 'pedidos@bebidassp.com', phone: '11 92222-3333', category: 'Bebidas & Alcoólicos', deliveryDays: ['Terça', 'Quinta'] },
    { id: 'sup-3', name: 'TechEquipamentos POS', contactName: 'Julia', email: 'julia@techequip.com', phone: '11 93333-4444', category: 'Equipamentos & Hardware', deliveryDays: ['Sexta'] }
  ]);

  // Computed metrics for HQ & Dashboard
  readonly totalActiveTenants = computed(() => this.tenants().filter(t => t.status === 'active').length);
  readonly totalOnlineDevices = computed(() => this.devices().filter(d => d.status === 'online').length);
  readonly totalDailyRevenue = computed(() => this.financials().filter(f => f.type === 'sale').reduce((sum, f) => sum + f.amount, 0));
  readonly pendingKdsOrders = computed(() => this.orders().filter(o => o.status === 'pending' || o.status === 'preparing').length);

  // Actions
  setActiveTab(tab: ActiveEcosystemTab) {
    this.activeTab.set(tab);
  }

  addOrder(newOrder: Omit<OrderTransaction, 'id' | 'createdAt'>): OrderTransaction {
    const id = 'ord-' + Math.floor(Math.random() * 9000 + 1000);
    const tenant = this.tenants().find(t => t.id === newOrder.tenantId);
    // Default coords if not provided (near the store)
    const lat = newOrder.lat || (tenant?.lat || -23.5651) + (Math.random() - 0.5) * 0.01;
    const lng = newOrder.lng || (tenant?.lng || -46.6521) + (Math.random() - 0.5) * 0.01;

    const currentMode = this.sandboxEngine.activeExecutionMode();
    const isSimulated = newOrder.isSimulated ?? (currentMode === 'simulation');

    const order: OrderTransaction = {
      ...newOrder,
      id,
      lat,
      lng,
      isSimulated,
      mode: isSimulated ? 'simulation' : 'real',
      createdAt: new Date().toISOString()
    };
    this.orders.update(orders => [order, ...orders]);
    this.saveRealDataLocally();

    // Also add to financials if completed/online
    if (order.status === 'completed' || order.paymentMethod === 'online') {
      this.addFinancialEntry({
        date: new Date().toISOString(),
        type: 'sale',
        category: order.channel === 'Customer Storefront' ? 'Delivery Online' : 'Vendas PDV',
        description: `[${order.isSimulated ? 'SIMULAÇÃO' : 'PRODUÇÃO REAL'}] Pedido ${order.orderNumber} (${order.channel})`,
        amount: order.total,
        paymentMethod: order.paymentMethod.toUpperCase(),
        referenceId: id,
        isSimulated: order.isSimulated,
        mode: order.mode
      });
    }

    // Deduct stock and trigger automated ERP inventory monitoring
    for (const item of order.items) {
      this.products.update(prods =>
        prods.map(p => {
          if (p.id === item.product.id) {
            const newStock = Math.max(0, p.stock - item.quantity);
            if (newStock <= p.minStock) {
              this.logAudit('Alerta de Estoque Mínimo', 'OS Client', `Produto "${p.name}" atingiu nível crítico (${newStock} un restantes, mínimo: ${p.minStock}).`, 'warning');
            }
            return { ...p, stock: newStock };
          }
          return p;
        })
      );
    }

    // Process platform split if order came through public channels
    if (order.channel === 'Customer Storefront' || order.channel === 'Online Marketplace') {
      const feeRate = (tenant?.serviceFeePercent && tenant.serviceFeePercent > 0) ? (tenant.serviceFeePercent / 100) : this.hqCommissionRate();
      const platformSplit = order.total * feeRate;
      const storeNet = order.total - platformSplit;
      this.logAudit(
        'Split de Pagamento Transacionado',
        'HQ',
        `Pedido ${order.orderNumber} (${order.channel}): Split HQ R$ ${platformSplit.toFixed(2)} (${Math.round(feeRate * 100)}%), Repasse Líquido Lojista R$ ${storeNet.toFixed(2)}.`,
        'info'
      );
    }

    // Update active consumer stats if applicable
    const active = this.activeConsumer();
    if (active && (order.channel === 'Customer Storefront' || order.channel === 'Online Marketplace')) {
      this.consumerAccounts.update(list =>
        list.map(c => c.id === active.id ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + order.total } : c)
      );
      this.activeConsumer.update(c => c ? { ...c, totalOrders: c.totalOrders + 1, totalSpent: c.totalSpent + order.total } : null);
    }

    // Cloud Database Persistence via Firebase
    if (this.firebase.isInitialized()) {
      this.firebase.createTenantOrder(order.tenantId, order).catch(err => {
        console.warn('Firebase order sync deferred:', err);
      });
    }

    return order;
  }

  addFinancialEntry(entry: Omit<FinancialRecord, 'id'>) {
    const fin: FinancialRecord = {
      ...entry,
      date: entry.date === 'Agora mesmo' ? new Date().toISOString() : entry.date,
      id: 'fin-' + Math.floor(Math.random() * 9000 + 1000)
    };
    this.financials.update(f => [fin, ...f]);
  }

  updateOrderStatus(orderId: string, status: OrderTransaction['status']) {
    this.orders.update(orders =>
      orders.map(o => o.id === orderId ? { ...o, status } : o)
    );

    const order = this.orders().find(o => o.id === orderId);
    if (order) {
      if (this.firebase.isInitialized()) {
        this.firebase.updateTenantOrderStatus(order.tenantId, orderId, status).catch(err => {
          console.warn('Firebase order status update deferred:', err);
        });
      }

      if (order.type === 'delivery') {
        if (status === 'ready') {
          this.sendWhatsAppMessage(order.customerName || 'Cliente', order.customerPhone || '', `Seu pedido ${order.orderNumber} está pronto e aguardando um motorista! 🛵💨`);
        } else if ((status as string) === 'dispatched') {
          this.sendWhatsAppMessage(order.customerName || 'Cliente', order.customerPhone || '', `Seu pedido ${order.orderNumber} saiu para entrega! 🚚 Fique atento para receber.`);
        }
      }
    }
  }

  sendWhatsAppMessage(customerName: string, phone: string, text: string) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const existingChat = this.socialMessages().find(m => m.sender === customerName && m.platform === 'whatsapp');
    
    if (existingChat) {
      // Real-time update for social interactions state
      this.socialMessages.update(msgs => msgs.map(m => m.id === existingChat.id ? { ...m, text, time, unread: true } : m));
    } else {
      const newMsg: SocialMessage = {
        id: 'wa-' + Date.now(),
        platform: 'whatsapp',
        sender: customerName,
        avatar: `https://i.pravatar.cc/150?u=${customerName.replace(/\s+/g, '')}`,
        text,
        time,
        unread: true
      };
      this.socialMessages.update(msgs => [newMsg, ...msgs]);
    }
    
    this.logAudit('Notificação WhatsApp', 'System', `[SIMULADOR INTERNO] Mensagem registrada para ${customerName}: ${text.substring(0, 40)}...`, 'info');
    this.notify(`[SIMULADOR] Notificação registrada no console WhatsApp para ${customerName}.`, 'info');
  }


  addProduct(product: Omit<ProductItem, 'id'>) {
    const newProd: ProductItem = {
      ...product,
      id: 'prod-' + Math.floor(Math.random() * 9000 + 1000)
    };
    this.products.update(p => [newProd, ...p]);
  }

  toggleAppInstallation(appId: string) {
    this.marketplaceApps.update(apps =>
      apps.map(app => app.id === appId ? { ...app, isInstalled: !app.isInstalled } : app)
    );
  }

  addTenant(tenant: Omit<CompanyTenant, 'createdAt'>) {
    const newT: CompanyTenant = {
      ...tenant,
      id: tenant.id || ('tenant-' + (this.tenants().length + 1)),
      createdAt: new Date().toISOString().split('T')[0]
    };
    this.tenants.update(t => [...t, newT]);
    if (this.firebase.isInitialized()) {
      this.firebase.saveTenant(newT).catch(err => console.warn('Firebase tenant sync deferred:', err));
    }
    this.logAudit('Nova Empresa Provisionada', 'HQ', `Empresa ${newT.name} (${newT.cnpj}) foi provisionada com sucesso.`, 'info');
  }

  updateTenant(tenantId: string, updatedData: Partial<CompanyTenant>) {
    this.tenants.update(tenants =>
      tenants.map(t => t.id === tenantId ? { ...t, ...updatedData } : t)
    );
    const tenant = this.tenants().find(t => t.id === tenantId);
    if (tenant && this.firebase.isInitialized()) {
      this.firebase.saveTenant(tenant).catch(err => console.warn('Firebase tenant update deferred:', err));
    }
    this.logAudit('Atualização de Empresa', 'HQ', `Configurações da empresa ${tenant?.name} foram alteradas.`, 'info');
    this.notify('Vitrine pública atualizada com sucesso! Todas as alterações já estão visíveis aos clientes.', 'success');
  }

  addDevice(newDevice: Omit<POSDevice, 'id' | 'lastPing'>) {
    const id = 'dev-' + Math.floor(Math.random() * 9000 + 1000);
    const dev: POSDevice = {
      ...newDevice,
      id,
      lastPing: 'Agora mesmo'
    };
    this.devices.update(devices => [dev, ...devices]);

    this.tenants.update(tenants =>
      tenants.map(t => t.id === dev.tenantId ? { ...t, activeDevicesCount: t.activeDevicesCount + 1 } : t)
    );

    this.auditLogs.update(logs => [
      {
        id: 'log-' + Math.floor(Math.random() * 9000 + 1000),
        timestamp: 'Agora mesmo',
        user: this.currentSession()?.email || 'Sistema',
        action: 'Provisionamento MDM',
        module: 'HQ',
        details: `Dispositivo ${dev.deviceName} (${dev.serialNumber}) pareado com sucesso.`,
        severity: 'info'
      },
      ...logs
    ]);
  }

  lockDevice(deviceId: string) {
    this.devices.update(devices =>
      devices.map(d => d.id === deviceId ? { ...d, status: 'locked' } : d)
    );
    this.auditLogs.update(logs => [
      {
        id: 'log-' + Math.floor(Math.random() * 9000 + 1000),
        timestamp: 'Agora mesmo',
        user: this.currentSession()?.email || 'Sistema',
        action: 'Bloqueio Remoto MDM',
        module: 'HQ',
        details: `Dispositivo ID ${deviceId} bloqueado remotamente por segurança.`,
        severity: 'warning'
      },
      ...logs
    ]);
  }

  unlockDevice(deviceId: string) {
    this.devices.update(devices =>
      devices.map(d => d.id === deviceId ? { ...d, status: 'online' } : d)
    );
  }

  revokeDevice(deviceId: string) {
    const dev = this.devices().find(d => d.id === deviceId);
    if (dev) {
      this.tenants.update(tenants =>
        tenants.map(t => t.id === dev.tenantId ? { ...t, activeDevicesCount: Math.max(0, t.activeDevicesCount - 1) } : t)
      );
    }
    this.devices.update(devices => devices.filter(d => d.id !== deviceId));
    this.auditLogs.update(logs => [
      {
        id: 'log-' + Math.floor(Math.random() * 9000 + 1000),
        timestamp: 'Agora mesmo',
        user: this.currentSession()?.email || 'Sistema',
        action: 'Revogação de Licença MDM',
        module: 'HQ',
        details: `Dispositivo ID ${deviceId} revogado e desvinculado do ecossistema.`,
        severity: 'critical'
      },
      ...logs
    ]);
  }

  restartDevice(deviceId: string) {
    const dev = this.devices().find(d => d.id === deviceId);
    this.devices.update(devices =>
      devices.map(d => d.id === deviceId ? { ...d, status: 'updating' } : d)
    );
    this.logAudit('Reinicialização MDM', 'HQ', `[SIMULAÇÃO DE COMANDO MDM] Ciclo de reinicialização simulado localmente para o terminal ${dev?.deviceName || deviceId}.`, 'info');
    this.notify(`[SIMULAÇÃO MDM] Comando de reinicialização enviado ao terminal ${dev?.deviceName || deviceId}.`, 'info');
    setTimeout(() => {
      this.devices.update(devices =>
        devices.map(d => d.id === deviceId ? { ...d, status: 'online', lastPing: 'Agora mesmo' } : d)
      );
    }, 2000);
  }

  loginAs(role: 'operator' | 'hq_admin' | 'guest', email: string, name: string, tenantName: string, targetTab: ActiveEcosystemTab) {
    this.currentSession.set({
      role,
      email,
      name,
      tenantName
    });
    this.activeTab.set(targetTab);
    const route = targetTab === 'login' ? '/login' : targetTab === 'hq' ? '/hq' : targetTab === 'client' ? '/os' : targetTab === 'marketplace' ? '/marketplace' : '/p/' + this.currentTenantId();
    
    if (role === 'hq_admin') {
      this.logAudit('Acesso Administrativo', 'HQ', `Administrador ${name} acessou o ambiente: ${tenantName}`, 'warning');
    }
    
    this.router.navigate([route]);
  }

  openStorefront(tenantId: string) {
    this.currentTenantId.set(tenantId);
    this.activeTab.set('storefront');
    this.router.navigate(['/p', tenantId]);
    const tenant = this.tenants().find(t => t.id === tenantId);
    if (tenant) {
      this.notify(`Vitrine aberta: ${tenant.name}. Exibindo cardápio e estoque cadastrados da unidade.`, 'info');
    }
  }

  openRegionalMarketplace() {
    this.activeTab.set('marketplace');
    this.router.navigate(['/regional']);
  }

  logout() {
    this.currentSession.set(null);
    this.activeConsumer.set(null);
    this.activeTab.set('login');
    this.notify('Sessão encerrada com sucesso.', 'info');
    this.router.navigate(['/login']);
  }

  // Agenda & Appointments
  addAppointment(apt: Omit<Appointment, 'id'>) {
    const id = 'ap-' + Math.floor(Math.random() * 9000 + 1000);
    this.appointments.update(aps => [...aps, { ...apt, id }]);
    this.notify('Agendamento registrado com sucesso.');
  }

  updateAppointmentStatus(id: string, status: Appointment['status']) {
    this.appointments.update(aps => aps.map(a => a.id === id ? { ...a, status } : a));
  }

  // Notes & Memos
  addNote(title: string, content: string, color: MemoNote['color'] = 'yellow') {
    const id = 'note-' + Math.floor(Math.random() * 9000 + 1000);
    const newNote: MemoNote = {
      id,
      title,
      content,
      updatedAt: 'Agora mesmo',
      color
    };
    this.notes.update(ns => [newNote, ...ns]);
  }

  deleteNote(id: string) {
    this.notes.update(ns => ns.filter(n => n.id !== id));
  }

  // Service Orders Actions
  addServiceOrder(os: Omit<ServiceOrder, 'id' | 'createdAt'>) {
    const id = 'os-' + Date.now();
    const newOS: ServiceOrder = {
      ...os,
      id,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.serviceOrders.update(orders => [newOS, ...orders]);
  }

  updateServiceOrderStatus(id: string, status: ServiceOrder['status'], progress?: number) {
    this.serviceOrders.update(orders =>
      orders.map(o => o.id === id ? { ...o, status, progressPercent: progress ?? o.progressPercent } : o)
    );
  }

  settleServiceOrder(osId: string, paymentMethod: string) {
    const os = this.serviceOrders().find(o => o.id === osId);
    if (!os) return;

    // Deduct parts from inventory
    for (const part of os.parts) {
      if (part.productId) {
        this.products.update(prods =>
          prods.map(p => p.id === part.productId ? { ...p, stock: Math.max(0, p.stock - part.qty) } : p)
        );
      }
    }

    // Add financial entry
    this.addFinancialEntry({
      date: 'Agora mesmo',
      type: 'sale',
      category: 'Serviços',
      description: `O.S. ${os.osNumber} - ${os.equipment} (${os.clientName})`,
      amount: os.price,
      paymentMethod,
      referenceId: os.id
    });

    // Remove OS (or could mark as archived/paid)
    this.serviceOrders.update(orders => orders.filter(o => o.id !== osId));
    this.notify(`O.S. ${os.osNumber} liquidada e estoque atualizado.`, 'success');
  }

  // HR & Employee Management Actions
  addEmployee(emp: Omit<Employee, 'id'>) {
    const newEmp: Employee = {
      ...emp,
      id: 'emp-' + Math.floor(Math.random() * 9000 + 1000)
    };
    this.employees.update(e => [newEmp, ...e]);
    this.notify(`Funcionário ${newEmp.name} cadastrado com sucesso no RH.`, 'success');
  }

  updateEmployee(id: string, data: Partial<Employee>) {
    this.employees.update(emps => emps.map(e => e.id === id ? { ...e, ...data } : e));
    this.notify('Registro de funcionário atualizado no RH.', 'info');
  }

  deleteEmployee(id: string) {
    this.employees.update(emps => emps.filter(e => e.id !== id));
    this.notify('Funcionário desvinculado do quadro de RH.', 'warning');
  }

  // Drivers & Delivery Fleet Management Actions
  addDriver(driver: Omit<StoreDriver, 'id' | 'activeDeliveriesCount' | 'completedTodayCount'>) {
    const newDriver: StoreDriver = {
      ...driver,
      id: 'drv-' + Math.floor(Math.random() * 9000 + 1000),
      activeDeliveriesCount: 0,
      completedTodayCount: 0
    };
    this.drivers.update(d => [newDriver, ...d]);
    this.notify(`Entregador ${newDriver.name} registrado na frota própria da loja.`, 'success');
  }

  updateDriverStatus(id: string, status: StoreDriver['status']) {
    this.drivers.update(drvs => drvs.map(d => d.id === id ? { ...d, status } : d));
    this.notify(`Status do motorista atualizado para: ${status}`, 'info');
  }

  assignDriverToRoute(routeId: string, driverId: string) {
    const driver = this.drivers().find(d => d.id === driverId);
    if (!driver) return;

    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? {
        ...r,
        driverId: driver.id,
        driverName: driver.name,
        driverPhone: driver.phone,
        driverVehicle: driver.licensePlate ? `${driver.vehicleType} (${driver.licensePlate})` : driver.vehicleType,
        status: 'accepted'
      } : r)
    );

    this.drivers.update(drvs =>
      drvs.map(d => d.id === driverId ? { ...d, status: 'delivering' } : d)
    );

    const tenant = this.tenants().find(t => t.id === this.currentTenantId());
    this.logAudit('Atribuição de Rota', 'OS Client', `Loja ${tenant?.name} atribuiu a rota ${routeId} diretamente ao motoqueiro ${driver.name}.`, 'info');
    this.notify(`Rota atribuída ao motoqueiro ${driver.name}! Notificação enviada para o app.`, 'success');
  }

  payDriver(driverId: string, amount: number, method: 'PIX' | 'Dinheiro' = 'PIX', andClockOff = false) {
    const driver = this.drivers().find(d => d.id === driverId);
    if (!driver || amount <= 0) return;

    this.addFinancialEntry({
      date: 'Agora mesmo',
      type: 'expense',
      category: 'Pagamento de Entregadores',
      description: `Pagamento de diária ao motorista ${driver.name} (${driver.completedTodayCount} entregas) via ${method}`,
      amount,
      paymentMethod: method,
      referenceId: 'payout-' + driver.id
    });

    const tenant = this.tenants().find(t => t.id === this.currentTenantId());
    this.logAudit('Pagamento de Entregador', 'OS Client', `Loja ${tenant?.name} pagou R$ ${amount.toFixed(2)} (${method}) para ${driver.name}.`, 'info');

    if (andClockOff) {
      this.clockOffDriver(driverId);
    } else {
      this.drivers.update(drvs => drvs.map(d => d.id === driverId ? { ...d, completedTodayCount: 0 } : d));
    }

    this.notify(`Pagamento de R$ ${amount.toFixed(2)} (${method}) ao entregador ${driver.name} realizado com sucesso!`, 'success');
  }

  clockInDriver(driverId: string) {
    const driver = this.drivers().find(d => d.id === driverId);
    if (!driver) return;

    this.drivers.update(drvs => drvs.map(d => d.id === driverId ? { ...d, status: 'available' } : d));
    this.logAudit('Início de Expediente', 'OS Client', `Motorista ${driver.name} realizou Clock-in na loja.`, 'info');
    this.notify(`Expediente iniciado para ${driver.name}!`, 'success');
  }

  clockOffDriver(driverId: string) {
    const driver = this.drivers().find(d => d.id === driverId);
    if (!driver) return;

    this.drivers.update(drvs => drvs.map(d => d.id === driverId ? { ...d, status: 'offline', completedTodayCount: 0 } : d));
    this.logAudit('Fim de Expediente', 'OS Client', `Motorista ${driver.name} realizou Clock-off (Expediente encerrado).`, 'warning');
    this.notify(`Expediente encerrado para ${driver.name}.`, 'info');
  }

  // Consumer Directory Actions (Governed by HQ)
  registerConsumer(consumer: Omit<ConsumerAccount, 'id' | 'totalOrders' | 'totalSpent' | 'status' | 'registeredAt'>) {
    const newConsumer: ConsumerAccount = {
      ...consumer,
      id: 'cons-' + Math.floor(Math.random() * 9000 + 1000),
      totalOrders: 0,
      totalSpent: 0,
      status: 'active',
      registeredAt: new Date().toISOString().split('T')[0]
    };
    this.consumerAccounts.update(c => [newConsumer, ...c]);
    this.activeConsumer.set(newConsumer);
    this.notify(`Conta de consumidor cadastrada com sucesso! Bem-vindo, ${newConsumer.name}.`, 'success');
  }

  toggleConsumerStatus(consumerId: string) {
    this.consumerAccounts.update(list =>
      list.map(c => c.id === consumerId ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c)
    );
    this.notify('Status do perfil do consumidor atualizado no HQ.', 'info');
  }

  loginConsumer(email: string) {
    const account = this.consumerAccounts().find(c => c.email === email);
    if (account) {
      this.activeConsumer.set(account);
      this.logAudit('Login de Consumidor', 'Marketplace', `Consumidor ${account.name} realizou login no portal público.`, 'info');
      this.notify(`Bem-vindo de volta, ${account.name}!`, 'success');
    }
  }

  logoutConsumer() {
    this.activeConsumer.set(null);
    this.notify('Você saiu da sua conta de consumidor.', 'info');
  }

  // Audit Logger Helper
  logAudit(action: string, module: 'HQ' | 'OS Client' | 'Marketplace' | 'System', details: string, severity: 'info' | 'warning' | 'critical' = 'info') {
    const id = 'log-' + Math.floor(Math.random() * 9000 + 1000);
    this.auditLogs.update(logs => [
      {
        id,
        timestamp: new Date().toLocaleString(),
        user: this.currentSession()?.email || 'Sistema',
        action,
        module,
        details,
        severity
      },
      ...logs
    ]);
  }

  // Driver Rate Config Action (Loja define valor mínimo + Km extra)
  updateDriverRateConfig(rateConfig: import('../models/ecosystem.model').DriverRateConfig) {
    const tenantId = this.currentTenantId();
    this.tenants.update(tenants =>
      tenants.map(t => t.id === tenantId ? { ...t, driverRateConfig: rateConfig } : t)
    );
    
    const tenant = this.tenants().find(t => t.id === tenantId);
    this.logAudit('Alteração de Tarifário', 'OS Client', `Loja ${tenant?.name} alterou frete base para R$ ${rateConfig.baseFee.toFixed(2)} e Km extra para R$ ${rateConfig.extraKmFee.toFixed(2)}.`, 'warning');
    
    this.notify(`Tabela de pagamento dos entregadores atualizada: Mínimo R$ ${rateConfig.baseFee.toFixed(2)} (até ${rateConfig.includedKm}km) + R$ ${rateConfig.extraKmFee.toFixed(2)}/km extra.`, 'success');
  }

  // 3EAT Entregas Driver App Actions
  autoClusterAndCreateRoutes(): DeliveryRoute[] {
    const tenantId = this.currentTenantId();
    const tenant = this.tenants().find(t => t.id === tenantId);
    const pendingOrders = this.orders().filter(o => o.tenantId === tenantId && o.type === 'delivery' && (o.status === 'pending' || o.status === 'preparing'));
    
    if (pendingOrders.length === 0) {
      this.notify('Nenhum pedido pendente para agrupamento automático.', 'warning');
      return [];
    }

    const createdRoutes: DeliveryRoute[] = [];
    const unclustered = [...pendingOrders];
    const tenantCoord = { lat: tenant?.lat || -23.5651, lng: tenant?.lng || -46.6521 };

    while (unclustered.length > 0) {
      // Start a cluster with the order furthest from the store or just the first one
      const baseOrder = unclustered.shift()!;
      const cluster = [baseOrder];
      
      // Greedily find up to 2 more orders closest to the last order added to cluster
      while (cluster.length < 3 && unclustered.length > 0) {
        const lastOrder = cluster[cluster.length - 1];
        const lastCoord = { lat: lastOrder.lat || tenantCoord.lat, lng: lastOrder.lng || tenantCoord.lng };
        
        let nearestIdx = -1;
        let minDist = Infinity;
        
        for (let i = 0; i < unclustered.length; i++) {
          const candidate = unclustered[i];
          const candCoord = { lat: candidate.lat || tenantCoord.lat, lng: candidate.lng || tenantCoord.lng };
          const dist = this.mapTools.calculateDistance(lastCoord, candCoord).km;
          
          if (dist < minDist) {
            minDist = dist;
            nearestIdx = i;
          }
        }
        
        if (nearestIdx !== -1) {
          cluster.push(unclustered.splice(nearestIdx, 1)[0]);
        } else {
          break;
        }
      }
      
      const route = this.createDeliveryRoute(cluster, undefined);
      createdRoutes.push(route);
    }

    this.logAudit('Agrupamento Geodésico', 'OS Client', `Sistema agrupou ${pendingOrders.length} pedidos em ${createdRoutes.length} rotas otimizadas por proximidade.`, 'info');
    this.notify(`Agrupamento geodésico concluído: ${createdRoutes.length} rotas otimizadas criadas!`, 'success');
    return createdRoutes;
  }

  createDeliveryRoute(ordersToBundle: OrderTransaction[], driverId?: string): DeliveryRoute {
    const routeId = 'route-' + Math.floor(Math.random() * 9000 + 1000);
    const codeNumber = Math.floor(Math.random() * 800 + 2850);
    const tenant = this.tenants().find(t => t.id === this.currentTenantId());
    
    const rateConfig = tenant?.driverRateConfig || {
      baseFee: 7.00,
      includedKm: 3.0,
      extraKmFee: 1.50,
      extraStopBonus: 3.00
    };

    const waypoints: DeliveryWaypoint[] = ordersToBundle.map((ord, index) => {
      const destLat = ord.lat || (tenant?.lat || -23.5651) + (Math.random() - 0.5) * 0.04;
      const destLng = ord.lng || (tenant?.lng || -46.6521) + (Math.random() - 0.5) * 0.04;
      
      // Calculate real distance from previous point (or store if first)
      const prevCoord = index === 0 
        ? { lat: tenant?.lat || -23.5651, lng: tenant?.lng || -46.6521 }
        : { lat: ordersToBundle[index-1].lat || (tenant?.lat || -23.5651), lng: ordersToBundle[index-1].lng || (tenant?.lng || -46.6521) };
      
      const distResult = this.mapTools.calculateDistance(prevCoord, { lat: destLat, lng: destLng });

      return {
        id: 'wp-' + Math.floor(Math.random() * 9000 + 1000),
        orderId: ord.id,
        customerName: ord.customerName || 'Cliente ' + (index + 1),
        customerPhone: ord.customerPhone || '(11) 98888-0000',
        address: ord.customerName ? `${ord.customerName} - Entrega Express` : 'Rua Augusta, ' + (1000 + index * 100),
        cityState: 'São Paulo/SP',
        distanceKm: Math.round(distResult.km * 10) / 10,
        etaMinutes: Math.round(distResult.km * 2.5) + 5, // ~2.5 mins per km + 5 mins stop
        productSummary: ord.items.map(i => `${i.quantity}x ${i.product.name}`).join(', '),
        weightKg: 1.5,
        status: 'pending' as const,
        sequenceNumber: index + 1,
        lat: destLat,
        lng: destLng
      };
    });

    const totalDist = waypoints.reduce((sum, w) => sum + w.distanceKm, 0);
    const totalEstMins = waypoints.reduce((sum, w) => sum + w.etaMinutes, 0);

    // Dynamic driver payout calculation based on store configuration
    let calculatedEarnings = 0;
    for (const wp of waypoints) {
      const extraKm = Math.max(0, wp.distanceKm - rateConfig.includedKm);
      const wpFee = rateConfig.baseFee + (extraKm * rateConfig.extraKmFee);
      calculatedEarnings += wpFee;
    }
    if (waypoints.length > 1) {
      calculatedEarnings += (waypoints.length - 1) * rateConfig.extraStopBonus;
    }

    const earnings = Math.round(calculatedEarnings * 100) / 100;

    const newRoute: DeliveryRoute = {
      id: routeId,
      routeCode: `Rota #${codeNumber}`,
      driverId,
      tenantId: this.currentTenantId(),
      date: 'Hoje, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeWindow: 'Express',
      totalDistanceKm: Math.round(totalDist * 10) / 10,
      estimatedDuration: totalEstMins > 60 ? `${Math.floor(totalEstMins / 60)}h ${totalEstMins % 60}min` : `${totalEstMins} min`,
      totalEarnings: earnings,
      status: driverId ? 'in_progress' : 'available',
      totalDeliveredCount: waypoints.length,
      waypoints
    };

    this.deliveryRoutes.update(routes => [newRoute, ...routes]);

    if (this.firebase.isInitialized()) {
      this.firebase.saveDeliveryRoute(newRoute).catch(err => console.warn('Firebase route sync deferred:', err));
    }

    if (driverId) {
      this.drivers.update(drvs =>
        drvs.map(d => d.id === driverId ? { ...d, status: 'delivering' } : d)
      );
    }

    for (const ord of ordersToBundle) {
      this.updateOrderStatus(ord.id, 'ready');
    }

    this.notify(`Nova Rota ${newRoute.routeCode} calculada (R$ ${earnings.toFixed(2)}) e despachada para o app!`, 'success');
    return newRoute;
  }

  acceptDeliveryRoute(routeId: string, driverId: string) {
    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? { ...r, status: 'accepted', driverId } : r)
    );
    this.drivers.update(drvs =>
      drvs.map(d => d.id === driverId ? { ...d, status: 'delivering' } : d)
    );
    this.notify(`Rota ${routeId.replace('route-', '#')} aceita! Navegação iniciada.`, 'success');
  }

  advanceWaypointStatus(routeId: string, waypointId: string, status: DeliveryWaypoint['status']) {
    this.deliveryRoutes.update(routes =>
      routes.map(r => {
        if (r.id !== routeId) return r;
        const updatedWps = r.waypoints.map((w: DeliveryWaypoint) => w.id === waypointId ? { ...w, status } : w);
        const allDone = updatedWps.every((w: DeliveryWaypoint) => w.status === 'completed');
        return {
          ...r,
          waypoints: updatedWps,
          status: allDone ? 'completed' : r.status
        };
      })
    );
    this.notify(`Status da parada atualizado: ${status.toUpperCase()}`, 'info');
  }

  completeDeliveryRoute(routeId: string) {
    const route = this.deliveryRoutes().find(r => r.id === routeId);
    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? { ...r, status: 'completed', completedAt: new Date().toLocaleTimeString() } : r)
    );
    if (route && route.driverId) {
      this.drivers.update(drvs =>
        drvs.map(d => d.id === route.driverId ? { ...d, status: 'available', completedTodayCount: d.completedTodayCount + route.totalDeliveredCount } : d)
      );
    }
    this.notify(`Rota ${route?.routeCode || routeId} concluída com sucesso! Valor creditado nos ganhos.`, 'success');
  }

  reorderRouteWaypoints(routeId: string, waypoints: DeliveryWaypoint[]) {
    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? { ...r, waypoints: waypoints.map((w, i) => ({ ...w, sequenceNumber: i + 1 })) } : r)
    );
    this.notify('Sequência de entregas otimizada e sincronizada com o app do motorista.', 'info');
  }

  cancelRoute(routeId: string) {
    const route = this.deliveryRoutes().find(r => r.id === routeId);
    if (!route) return;

    if (route.driverId) {
      this.drivers.update(drvs =>
        drvs.map(d => d.id === route.driverId ? { ...d, status: 'available' } : d)
      );
    }

    // Return orders to pending status
    for (const wp of route.waypoints) {
      if (wp.orderId) {
        this.updateOrderStatus(wp.orderId, 'pending');
      }
    }

    this.deliveryRoutes.update(routes => routes.filter(r => r.id !== routeId));
    this.logAudit('Cancelamento de Rota', 'OS Client', `Rota ${route.routeCode} foi cancelada e pedidos retornaram para expedição.`, 'warning');
    this.notify(`Rota ${route.routeCode} cancelada.`, 'warning');
  }

  markArrivedAtStore(routeId: string) {
    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? { ...r, status: 'at_store' } : r)
    );
    this.notify('Você chegou na loja! Prepare-se para a coleta.', 'info');
  }

  confirmPickup(routeId: string) {
    const route = this.deliveryRoutes().find(r => r.id === routeId);
    if (!route) return;

    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? { ...r, status: 'in_progress' } : r)
    );

    // Update orders status to dispatched
    for (const wp of route.waypoints) {
      if (wp.orderId) {
        this.updateOrderStatus(wp.orderId, 'dispatched');
      }
    }

    this.logAudit('Coleta de Pedidos', 'OS Client', `Motorista confirmou coleta de todos os pedidos da rota ${route.routeCode}`, 'info');
    this.notify('Coleta confirmada! Rota iniciada.', 'success');
  }

  clockInAtStore(routeId: string) {
    const route = this.deliveryRoutes().find(r => r.id === routeId);
    if (!route) return;

    this.deliveryRoutes.update(routes =>
      routes.map(r => r.id === routeId ? { ...r, status: 'at_store' } : r)
    );
    
    this.logAudit('Check-in de Motorista', 'OS Client', `Motorista confirmou presença física na loja para a rota ${route.routeCode}`, 'info');
    this.notify('Check-in na loja confirmado via QR Code!', 'success');
  }

  // CRM & Customer Loyalty Actions
  addCustomer(customer: Omit<CustomerProfile, 'id'>) {
    const id = 'cust-' + Math.floor(Math.random() * 9000 + 1000);
    const newCust: CustomerProfile = { ...customer, id };
    this.customers.update(custs => [newCust, ...custs]);
    this.notify(`Cliente ${newCust.name} cadastrado no CRM de Fidelidade.`, 'success');
  }

  updateCustomer(id: string, data: Partial<CustomerProfile>) {
    this.customers.update(custs => custs.map(c => c.id === id ? { ...c, ...data } : c));
    this.notify('Perfil do cliente atualizado.', 'info');
  }

  addLoyaltyPoints(customerId: string, points: number, reason: string) {
    this.customers.update(custs =>
      custs.map(c => c.id === customerId ? { ...c, loyaltyPoints: Math.max(0, c.loyaltyPoints + points) } : c)
    );
    const cust = this.customers().find(c => c.id === customerId);
    this.notify(`${points > 0 ? '+' : ''}${points} Pontos atribuídos a ${cust?.name || 'Cliente'} (${reason}).`, 'success');
  }

  addStoreCredit(customerId: string, amount: number, reason: string) {
    this.customers.update(custs =>
      custs.map(c => c.id === customerId ? { ...c, storeCredit: Math.max(0, c.storeCredit + amount) } : c)
    );
    const cust = this.customers().find(c => c.id === customerId);
    this.notify(`Crédito em loja de R$ ${amount.toFixed(2)} concedido a ${cust?.name || 'Cliente'} (${reason}).`, 'success');
  }

  createMarketingCampaign(campaign: Omit<MarketingCampaign, 'id' | 'reach' | 'conversions' | 'sentAt'>) {
    const id = 'camp-' + Math.floor(Math.random() * 9000 + 1000);
    const newCamp: MarketingCampaign = {
      ...campaign,
      id,
      reach: 0,
      conversions: 0,
      sentAt: 'Aguardando Disparo'
    };
    this.marketingCampaigns.update(camps => [newCamp, ...camps]);
    this.notify(`Campanha "${newCamp.title}" criada com sucesso!`, 'success');
  }

  dispatchCampaign(campaignId: string) {
    const camp = this.marketingCampaigns().find(c => c.id === campaignId);
    if (!camp) return;

    const totalCustomers = this.customers().length;
    const estReach = Math.floor(totalCustomers * (0.8 + Math.random() * 0.2));
    const estConv = Math.floor(estReach * (0.15 + Math.random() * 0.1));

    this.marketingCampaigns.update(camps =>
      camps.map(c => c.id === campaignId ? {
        ...c,
        status: 'active',
        reach: estReach,
        conversions: estConv,
        sentAt: 'Disparada agora'
      } : c)
    );

    this.logAudit('Disparo de Campanha CRM', 'OS Client', `Campanha "${camp.title}" disparada para ${estReach} contatos via ${camp.platform.toUpperCase()}.`, 'info');
    this.notify(`Campanha "${camp.title}" disparada para ${estReach} clientes via ${camp.platform.toUpperCase()}!`, 'success');
  }

  // LocalStorage Persistence for Real Data (Safely executed in browser, noop in SSR)
  saveRealDataLocally() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const realOrders = this.orders().filter(o => !o.isSimulated);
      localStorage.setItem('3eatcru_real_orders', JSON.stringify(realOrders.slice(0, 50)));
      localStorage.setItem('3eatcru_tenants_custom', JSON.stringify(this.tenants()));
    } catch {
      // safe fallback
    }
  }

  loadRealDataLocally() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const savedOrders = localStorage.getItem('3eatcru_real_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders) as OrderTransaction[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.orders.update(cur => {
            const ids = new Set(parsed.map(p => p.id));
            return [...parsed, ...cur.filter(c => !ids.has(c.id))];
          });
        }
      }
    } catch {
      // safe fallback
    }
  }

  /**
   * Cleans all sandbox and simulated data, restoring pure production state.
   */
  clearSimulationData() {
    this.sandboxEngine.clearSimulationData();
    // Purge simulated orders from ecosystem orders
    this.orders.update(orders => orders.filter(o => !o.isSimulated && o.mode !== 'simulation'));
    // Purge simulated entries from financial ledger
    this.financials.update(fins => fins.filter(f => !f.isSimulated && f.mode !== 'simulation'));
    // Purge simulated delivery routes
    this.deliveryRoutes.update(routes => routes.filter(r => !r.routeCode.includes('SIM')));
    this.saveRealDataLocally();
    this.logAudit('Limpeza de Sandbox', 'OS Client', 'Ambiente de testes limpo com sucesso. Registros reais preservados.', 'info');
  }
}



