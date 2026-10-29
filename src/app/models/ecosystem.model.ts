export type ActiveEcosystemTab = 'login' | 'hq' | 'client' | 'marketplace' | 'storefront' | 'driver';

export interface UserSession {
  name: string;
  role: 'operator' | 'hq_admin' | 'guest';
  email: string;
  tenantName: string;
}

export interface StoreAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement?: string;
}

export interface DriverRateConfig {
  baseFee: number;        // Valor mínimo base por entrega (ex: R$ 7.00)
  includedKm: number;     // Raio/Distância inclusa no valor base (ex: 3.0 km)
  extraKmFee: number;     // Valor por km adicional excedente (ex: R$ 1.50 / km)
  extraStopBonus: number; // Bônus por parada adicional em rota agrupada (ex: R$ 3.00)
}

export interface CompanyTenant {
  id: string;
  name: string;
  legalName: string;
  cnpj: string;
  category: 'restaurant' | 'retail' | 'services' | 'hybrid' | 'health' | 'education' | 'automotive' | 'beauty' | 'petshop';
  plan: 'Starter' | 'Professional' | 'Enterprise';
  status: 'active' | 'suspended' | 'trial';
  devicesLimit: number;
  activeDevicesCount: number;
  contactEmail: string;
  phone: string;
  createdAt: string;
  address: StoreAddress;
  deliveryRadiusKm: number;
  serviceFeePercent: number;
  openingHours: string;
  // Geolocation & Marketplace Enhancements
  fichaCode?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
  tagline?: string;
  badgeCategory?: string;
  supportsDelivery?: boolean;
  supportsTakeout?: boolean;
  supportsReservation?: boolean;
  isOpen?: boolean;
  estimatedDeliveryMinutes?: string;
  deliveryFee?: number;
  logo?: string;
  coverImage?: string;
  icon?: string;
  specialties?: string[];
  // Public Storefront Customization
  storeSlug?: string;
  themeColor?: 'amber' | 'emerald' | 'indigo' | 'rose' | 'orange' | 'cyan';
  announcementText?: string;
  showAnnouncement?: boolean;
  announcementType?: 'promo' | 'alert' | 'news';
  whatsappNumber?: string;
  instagramHandle?: string;
  aboutText?: string;
  highlightedProductIds?: string[];
  // Driver Rate Configuration (Valor mínimo por entrega + Km extra)
  driverRateConfig?: DriverRateConfig;
  // Delivery Rules (Lojista decide)
  minOrderValue?: number;                             // Pedido Mínimo para Delivery (ex: R$ 25.00)
  deliveryFleetType?: 'own' | 'platform' | 'hybrid';  // Frota Própria da Loja vs Frota Plataforma
}

export interface RegionalMarketplaceConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroTag: string;
  heroBannerImage: string;
  heroCtaText: string;
  heroAnnouncement: string;
  showHeroAnnouncement: boolean;
  featuredTenantIds: string[];
  defaultSearchRadiusKm: number;
  activeRegionName: string;
}

export interface POSDevice {
  id: string;
  tenantId: string;
  tenantName: string;
  deviceName: string;
  type: 'terminal' | 'tablet' | 'mobile' | 'kiosk';
  serialNumber: string;
  macAddress: string;
  ipAddress: string;
  osVersion: string;
  appVersion: string;
  status: 'online' | 'offline' | 'locked' | 'updating';
  lastPing: string;
  location: string;
  batteryLevel?: number;
}

export interface LicensePlan {
  id: string;
  name: string;
  priceMonthly: number;
  maxDevices: number;
  includedModules: string[];
  description: string;
}

export interface MarketplaceAppModule {
  id: string;
  name: string;
  category: 'POS & Sales' | 'Kitchen & Tables' | 'Inventory & ERP' | 'Financial & Tax' | 'Delivery & Marketplace' | 'CRM & Loyalty';
  version: string;
  publisher: string;
  description: string;
  price: number;
  rating: number;
  installedCount: number;
  isInstalled: boolean;
  isCore: boolean;
  icon: string;
  compatibility: string[];
}

export interface ProductItem {
  id: string;
  tenantId?: string;
  supplierId?: string;
  name: string;
  category: string;
  price: number;
  wholesalePrice?: number;
  costPrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  sku: string;
  image: string;
  availableOnline: boolean;
  description: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  email: string;
  phone: string;
  category: string;
  deliveryDays: string[];
}

export interface CustomerProfile {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  storeCredit: number;
  lastPurchaseDate?: string;
}

export interface CartItem {
  product: ProductItem;
  quantity: number;
  notes?: string;
}

export interface OrderTransaction {
  id: string;
  tenantId: string;
  orderNumber: string;
  type: 'dine-in' | 'takeout' | 'delivery' | 'pos-counter';
  tableNumber?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'pix' | 'online';
  status: 'pending' | 'preparing' | 'ready' | 'dispatched' | 'completed' | 'cancelled' | 'delivered';
  createdAt: string;
  channel: 'POS' | 'Customer Storefront' | 'Table QR' | 'iFood' | 'WhatsApp' | 'Online Marketplace';
  lat?: number;
  lng?: number;
  // Segregação Real vs Simulação
  isSimulated?: boolean;
  mode?: SystemExecutionMode;
}

export interface TableInfo {
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'billing';
  currentOrderId?: string;
  server?: string;
  guests?: number;
  currentTotal?: number;
  zone?: string;
}

export interface FinancialRecord {
  id: string;
  date: string;
  type: 'sale' | 'expense' | 'payout' | 'adjustment';
  category: string;
  description: string;
  amount: number;
  paymentMethod: string;
  referenceId: string;
  // Segregação Real vs Simulação
  isSimulated?: boolean;
  mode?: SystemExecutionMode;
}

export interface SocialMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  time: string;
  platform: 'whatsapp' | 'instagram' | 'messenger';
  unread: boolean;
  isMarketing?: boolean;
}

export interface MarketingCampaign {
  id: string;
  title: string;
  status: 'active' | 'scheduled' | 'completed';
  platform: 'whatsapp' | 'instagram' | 'email';
  reach: number;
  conversions: number;
  sentAt: string;
}

export interface ExternalOrder {
  id: string;
  source: 'ifood' | 'whatsapp' | 'rappi';
  orderId: string;
  customerName: string;
  items: string[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'dispatched' | 'delivered' | 'rejected';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: 'HQ' | 'OS Client' | 'Marketplace' | 'System';
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface Appointment {
  id: string;
  tenantId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  serviceType: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MemoNote {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  color: 'yellow' | 'blue' | 'green' | 'red' | 'purple';
}

export interface ServicePart {
  productId: string;
  name: string;
  qty: number;
  unitPrice: number;
}

export interface ServiceOrder {
  id: string;
  osNumber: string;
  clientName: string;
  equipment: string;
  technician: string;
  description: string;
  priority: 'Normal' | 'Crítico';
  status: 'triagem' | 'execucao' | 'finalizado';
  parts: ServicePart[];
  laborPrice: number;
  price: number;
  progressPercent: number;
  createdAt: string;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'bundle' | 'buy_get_free' | 'percentage' | 'fixed_discount';
  tenantId: string;
  triggerProductIds: string[];
  rewardProductId?: string;
  discountValue: number;
  isActive: boolean;
  minQuantity?: number;
}

export interface ClockEvent {
  id: string;
  employeeId: string;
  employeeName: string;
  timestamp: string;
  type: 'in' | 'out';
  location?: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  name: string;
  role: 'gerente' | 'caixa' | 'cozinheiro' | 'garcom' | 'entregador' | 'atendente';
  cpf: string;
  phone: string;
  salary: number;
  commissionPercent?: number;
  status: 'active' | 'on_leave' | 'inactive';
  shift: 'manha' | 'tarde' | 'noite' | 'integral';
  hireDate: string;
}

export interface StoreDriver {
  id: string;
  tenantId?: string;
  name: string;
  phone: string;
  vehicleType: 'moto' | 'bike' | 'carro' | 'patinete';
  licensePlate?: string;
  status: 'available' | 'delivering' | 'offline';
  activeDeliveriesCount: number;
  rating: number;
  completedTodayCount: number;
  driverType: 'private' | 'platform';
  // MDM Telemetry & Compliance
  deviceName?: string;
  appVersion?: string;
  batteryLevel?: number;
  lastGpsPing?: string;
  currentLocationName?: string;
  complianceVerified?: boolean;
  cnhNumber?: string;
}

export interface ConsumerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  primaryAddress: string;
  neighborhood: string;
  city: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'blocked';
  registeredAt: string;
}

export interface DeliveryWaypoint {
  id: string;
  orderId?: string;
  customerName: string;
  customerPhone: string;
  address: string;
  cityState: string;
  distanceKm: number;
  etaMinutes: number;
  productSummary: string;
  weightKg?: number;
  packageDimensions?: string;
  notes?: string;
  status: 'pending' | 'in_transit' | 'arrived' | 'completed' | 'failed';
  sequenceNumber: number;
  lat?: number;
  lng?: number;
}

export interface DeliveryRoute {
  id: string;
  routeCode: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  tenantId: string;
  date: string;
  timeWindow: string;
  totalDistanceKm: number;
  estimatedDuration: string;
  totalEarnings: number;
  waypoints: DeliveryWaypoint[];
  status: 'available' | 'accepted' | 'at_store' | 'in_progress' | 'completed';
  completedAt?: string;
  proofSignatureUrl?: string;
  totalDeliveredCount: number;
}

export type SystemExecutionMode = 'real' | 'simulation';

export interface CoreEngineMetrics {
  activeMode: SystemExecutionMode;
  realOrdersProcessed: number;
  simulatedOrdersProcessed: number;
  realLedgerVolumeTotal: number;
  simulatedLedgerVolumeTotal: number;
  activeRealDriversCount: number;
  activeSimulatedDriversCount: number;
  lastEngineSyncTimestamp: string;
}

export interface SimulationScenarioConfig {
  demandMultiplier: number;
  trafficDelayMinutes: number;
  simulatedCancelRatePercent: number;
  hqCommissionOverridePercent?: number;
}

export interface SystemAuditReport {
  timestamp: string;
  tenantsChecked: number;
  productsChecked: number;
  ordersChecked: number;
  devicesChecked: number;
  ledgerConsistent: boolean;
  issuesFound: string[];
  status: 'passed' | 'warning' | 'failed';
}
