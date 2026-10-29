import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {App} from './app';
import {EcosystemService} from './services/ecosystem.service';

describe('App', () => {
  let ecosystem: EcosystemService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    ecosystem = TestBed.inject(EcosystemService);
  });

  it('should create the app and initialize default state', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
    expect(app.showEcosystemSwitcher()).toBe(false);
  });

  it('should restrict ecosystem switcher to HQ Admin role only', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    // Default: guest / unauthenticated
    expect(app.isHqAdmin()).toBeFalsy();
    app.toggleSwitcher();
    expect(app.showEcosystemSwitcher()).toBe(false);

    // Simulate login as HQ Admin
    ecosystem.currentSession.set({
      role: 'hq_admin',
      email: 'admin@3eatcru.com.br',
      name: 'Super Admin HQ',
      tenantName: 'HQ Central'
    });

    expect(app.isHqAdmin()).toBe(true);
    app.toggleSwitcher();
    expect(app.showEcosystemSwitcher()).toBe(true);
  });
});
