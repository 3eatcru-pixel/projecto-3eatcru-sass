import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { EcosystemService } from './services/ecosystem.service';

import { EcosystemSwitcherComponent } from './components/shared/ecosystem-switcher';
import { NotificationToastComponent } from './components/shared/notification-toast';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    EcosystemSwitcherComponent,
    NotificationToastComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly ecosystem = inject(EcosystemService);
  private readonly router = inject(Router);

  readonly showEcosystemSwitcher = signal<boolean>(false);
  
  // Explicitly ensuring isHqAdmin is a computed signal
  readonly isHqAdmin = computed(() => {
    const session = this.ecosystem.currentSession();
    return session && session.role === 'hq_admin';
  });

  toggleSwitcher() {
    if (!this.isHqAdmin()) {
      this.ecosystem.notify('Acesso restrito ao Administrador HQ Central.', 'warning');
      return;
    }
    this.showEcosystemSwitcher.update(v => !v);
  }

  navigateTo(path: string) {
    if (!this.isHqAdmin() && path === '/hq') {
      this.ecosystem.notify('Acesso restrito ao Dono do App.', 'warning');
      return;
    }
    this.router.navigate([path]);
    this.showEcosystemSwitcher.set(false);
  }
}
