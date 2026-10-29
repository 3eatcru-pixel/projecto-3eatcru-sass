import {Routes} from '@angular/router';
import {LoginBancadaComponent} from './components/login-bancada';
import {HQCentralComponent} from './components/hq-central';
import {ClientOsComponent} from './components/client-os';
import {MarketplaceComponent} from './components/marketplace';
import { CustomerStorefrontComponent } from './components/customer-storefront';
import { RegionalMarketplaceComponent } from './components/regional-marketplace';
import { DriverAppComponent } from './components/driver-app';
import { WaiterAppComponent } from './components/waiter-app';
import { hqAdminGuard, storeOperatorGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginBancadaComponent },
  { path: 'hq', component: HQCentralComponent, canActivate: [hqAdminGuard] },
  { path: 'os', component: ClientOsComponent, canActivate: [storeOperatorGuard] },
  { path: 'marketplace', component: MarketplaceComponent },
  { path: 'regional', component: RegionalMarketplaceComponent },
  { path: 'driver', component: DriverAppComponent },
  { path: 'waiter', component: WaiterAppComponent },
  { path: 'p/:id', component: CustomerStorefrontComponent },
  { path: '**', redirectTo: 'login' }
];
