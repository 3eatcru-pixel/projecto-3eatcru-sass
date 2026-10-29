import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { FirebaseApp } from 'firebase/app';
import {
  Firestore,
  doc,
  getDocFromServer,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import {
  Auth,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from 'firebase/auth';

import { CompanyTenant, OrderTransaction, DeliveryRoute, StoreDriver } from '../../models/ecosystem.model';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private readonly platformId = inject(PLATFORM_ID);
  public readonly isBrowser = isPlatformBrowser(this.platformId);

  public app: FirebaseApp | null = null;
  public db: Firestore | null = null;
  public auth: Auth | null = null;

  public readonly isConnected = signal<boolean>(false);
  public readonly isInitialized = signal<boolean>(false);
  public readonly currentUser = signal<User | null>(null);
  public readonly authLoading = signal<boolean>(true);
  public readonly lastError = signal<string | null>(null);

  constructor() {
    // Firebase auto-initialization disabled per architectural scope restrictions (No external Firebase).
    this.authLoading.set(false);
    this.isConnected.set(false);
    this.isInitialized.set(false);
  }

  private initFirebase(): void {
    // Explicitly disabled: 3EATCRU OS operates purely with local core engines and in-memory/local stores.
  }

  public async testConnection(): Promise<void> {
    if (!this.db) return;
    try {
      await getDocFromServer(doc(this.db, 'test', 'connection'));
      this.isConnected.set(true);
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration: client is offline.');
        this.isConnected.set(false);
      } else {
        // Permission denied is expected for unauthenticated /test/connection per rules default deny
        this.isConnected.set(true);
      }
    }
  }

  public handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: this.auth?.currentUser?.uid,
        email: this.auth?.currentUser?.email,
        emailVerified: this.auth?.currentUser?.emailVerified,
        isAnonymous: this.auth?.currentUser?.isAnonymous,
        tenantId: this.auth?.currentUser?.tenantId,
        providerInfo: this.auth?.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    this.lastError.set(errInfo.error);
    throw new Error(JSON.stringify(errInfo));
  }

  // Authentication Helpers
  public async loginWithGoogle(): Promise<User | null> {
    if (!this.auth) return null;
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(this.auth, provider);
      this.currentUser.set(credential.user);
      return credential.user;
    } catch (err: unknown) {
      console.error('Login error:', err);
      throw err;
    }
  }

  public async logout(): Promise<void> {
    if (!this.auth) return;
    try {
      await signOut(this.auth);
      this.currentUser.set(null);
    } catch (err: unknown) {
      console.error('Logout error:', err);
    }
  }

  // Tenant Operations
  public async getTenants(): Promise<CompanyTenant[]> {
    if (!this.db) return [];
    const path = 'tenants';
    try {
      const snap = await getDocs(collection(this.db, path));
      return snap.docs.map(d => d.data() as CompanyTenant);
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.LIST, path);
    }
  }

  public async saveTenant(tenant: CompanyTenant): Promise<void> {
    if (!this.db) return;
    const path = `tenants/${tenant.id}`;
    try {
      await setDoc(doc(this.db, 'tenants', tenant.id), tenant, { merge: true });
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  // Order Operations
  public async createTenantOrder(tenantId: string, order: OrderTransaction): Promise<void> {
    if (!this.db) return;
    const path = `tenants/${tenantId}/orders/${order.id}`;
    try {
      await setDoc(doc(this.db, 'tenants', tenantId, 'orders', order.id), order);
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  public async updateTenantOrderStatus(tenantId: string, orderId: string, status: OrderTransaction['status']): Promise<void> {
    if (!this.db) return;
    const path = `tenants/${tenantId}/orders/${orderId}`;
    try {
      await updateDoc(doc(this.db, 'tenants', tenantId, 'orders', orderId), { status });
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public listenTenantOrders(tenantId: string, onUpdate: (orders: OrderTransaction[]) => void): Unsubscribe | null {
    if (!this.db) return null;
    const path = `tenants/${tenantId}/orders`;
    try {
      return onSnapshot(
        collection(this.db, 'tenants', tenantId, 'orders'),
        (snapshot) => {
          const list = snapshot.docs.map(d => d.data() as OrderTransaction);
          onUpdate(list);
        },
        (error) => {
          this.handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.GET, path);
    }
  }

  // Delivery Routes (HQ Pro Dispatcher)
  public async saveDeliveryRoute(route: DeliveryRoute): Promise<void> {
    if (!this.db) return;
    const path = `delivery_routes/${route.id}`;
    try {
      await setDoc(doc(this.db, 'delivery_routes', route.id), route, { merge: true });
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.WRITE, path);
    }
  }

  public listenDeliveryRoutes(onUpdate: (routes: DeliveryRoute[]) => void): Unsubscribe | null {
    if (!this.db) return null;
    const path = 'delivery_routes';
    try {
      return onSnapshot(
        collection(this.db, path),
        (snapshot) => {
          const routes = snapshot.docs.map(d => d.data() as DeliveryRoute);
          onUpdate(routes);
        },
        (error) => {
          this.handleFirestoreError(error, OperationType.GET, path);
        }
      );
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.GET, path);
    }
  }

  // Driver Telemetry & Compliance
  public async updateDriverStatus(driverId: string, status: StoreDriver['status'], locationName?: string): Promise<void> {
    if (!this.db) return;
    const path = `drivers/${driverId}`;
    try {
      const payload: Record<string, unknown> = {
        status,
        lastGpsPing: new Date().toISOString()
      };
      if (locationName) payload['currentLocationName'] = locationName;
      await updateDoc(doc(this.db, 'drivers', driverId), payload);
    } catch (error: unknown) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
}
