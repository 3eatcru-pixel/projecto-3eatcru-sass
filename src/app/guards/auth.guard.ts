import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { EcosystemService } from '../services/ecosystem.service';

/**
 * Functional Guard for HQ Central
 * Allows access exclusively to users with 'hq_admin' role.
 */
export const hqAdminGuard: CanActivateFn = () => {
  const ecosystem = inject(EcosystemService);
  const router = inject(Router);

  const session = ecosystem.currentSession();
  if (session && session.role === 'hq_admin') {
    return true;
  }

  ecosystem.notify('Acesso negado: O HQ Central é restrito ao Administrador Global (Dono do App).', 'warning');
  router.navigate(['/login']);
  return false;
};

/**
 * Functional Guard for Store OS
 * Allows access to operators or administrators. Blocks unauthenticated or guest users.
 */
export const storeOperatorGuard: CanActivateFn = () => {
  const ecosystem = inject(EcosystemService);
  const router = inject(Router);

  const session = ecosystem.currentSession();
  if (session && (session.role === 'operator' || session.role === 'hq_admin')) {
    return true;
  }

  ecosystem.notify('Acesso negado: Autentique-se com perfil de Operador ou Gerente para acessar o Store OS.', 'warning');
  router.navigate(['/login']);
  return false;
};

