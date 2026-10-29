import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EcosystemService } from '../../services/ecosystem.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-rh-window',
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#1d1008] text-stone-200 font-sans">
      
      <!-- SUB-HEADER BAR -->
      <div class="bg-[#170b04] border-b border-[#3d200f] p-4 flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black shadow-md">
            <mat-icon>badge</mat-icon>
          </div>
          <div>
            <h2 class="font-serif font-black text-base text-white">RH &amp; Gestão de Pessoal da Loja</h2>
            <p class="text-xs text-stone-400">Registro de funcionários, folha de pagamento, comissões e escala da equipe.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <span class="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800/60 px-3 py-1 rounded-xl font-bold">
            FOLHA MENSAL: R$ {{ totalPayroll().toFixed(2) }}
          </span>

          <button
            type="button"
            (click)="showNewModal.set(true)"
            class="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg border border-amber-400/50 cursor-pointer">
            <mat-icon class="text-sm">person_add</mat-icon>
            <span>Novo Funcionário</span>
          </button>
        </div>
      </div>

      <!-- MAIN CONTENT: TABLE & METRICS -->
      <div class="flex-1 p-5 overflow-y-auto space-y-5">
        
        <!-- SUMMARY HUD -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-3.5 text-stone-200">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Total da Equipe</span>
            <strong class="text-xl font-serif font-black text-white">{{ storeEmployees().length }}</strong>
          </div>

          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-3.5 text-stone-200">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Caixas &amp; Atendimento</span>
            <strong class="text-xl font-serif font-black text-amber-300">{{ caixasCount() }}</strong>
          </div>

          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-3.5 text-stone-200">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Cozinha &amp; Preparo</span>
            <strong class="text-xl font-serif font-black text-amber-300">{{ cooksCount() }}</strong>
          </div>

          <div class="bg-[#2a160b] border border-[#482814] rounded-2xl p-3.5 text-stone-200">
            <span class="text-[10px] font-mono text-amber-500 block uppercase font-bold">Entregadores Próprios</span>
            <strong class="text-xl font-serif font-black text-emerald-400">{{ driversCount() }}</strong>
          </div>
        </div>

        <!-- EMPLOYEES TABLE -->
        <div class="bg-[#231208] border border-[#4d2813] rounded-2xl p-4 shadow-xl">
          <div class="flex justify-between items-center pb-3 border-b border-[#3d200f] mb-3">
            <h3 class="font-serif font-bold text-amber-400 text-sm flex items-center gap-2">
              <mat-icon class="text-amber-500">groups</mat-icon>
              <span>Quadro de Funcionários Cadastrados</span>
            </h3>
            <span class="text-[10px] font-mono text-stone-400">Ambiente de RH 3EATCRU OS</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-[#3d200f] text-[10px] font-mono font-bold uppercase tracking-wider text-amber-500">
                  <th class="py-2.5 px-3">FUNCIONÁRIO</th>
                  <th class="py-2.5 px-3">CARGO / FUNÇÃO</th>
                  <th class="py-2.5 px-3">ESCALA</th>
                  <th class="py-2.5 px-3">SALÁRIO MENSAL</th>
                  <th class="py-2.5 px-3">STATUS</th>
                  <th class="py-2.5 px-3">PONTO HOJE</th>
                  <th class="py-2.5 px-3 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#3d200f]">
                @for (emp of storeEmployees(); track emp.id) {
                  @let lastEvent = getLastClockEvent(emp.id);
                  <tr class="hover:bg-[#2e190d] transition-colors">
                    <td class="py-3 px-3">
                      <div class="font-bold text-white">{{ emp.name }}</div>
                      <div class="text-[10px] font-mono text-stone-400">CPF: {{ emp.cpf }} • Tel: {{ emp.phone }}</div>
                    </td>

                    <td class="py-3 px-3">
                      <span class="bg-[#381d0e] border border-[#522a13] text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] font-mono uppercase">
                        {{ emp.role }}
                      </span>
                      @if (emp.commissionPercent) {
                        <div class="text-[9px] text-emerald-400 font-mono mt-0.5">+{{ emp.commissionPercent }}% comissão</div>
                      }
                    </td>

                    <td class="py-3 px-3 font-mono text-stone-300 text-[11px] capitalize">
                      {{ emp.shift }}
                    </td>

                    <td class="py-3 px-3 font-mono font-bold text-amber-200">
                      R$ {{ emp.salary.toFixed(2) }}
                    </td>

                    <td class="py-3 px-3">
                      <span [class]="emp.status === 'active' ? 'text-emerald-400' : 'text-rose-400'" class="font-bold flex items-center gap-1 text-[11px]">
                        <span [class]="emp.status === 'active' ? 'bg-emerald-400' : 'bg-rose-500'" class="w-2 h-2 rounded-full"></span>
                        {{ emp.status === 'active' ? 'Ativo' : 'Afastado' }}
                      </span>
                    </td>

                    <td class="py-3 px-3">
                      @if (lastEvent) {
                        <div class="flex flex-col">
                          <span [class]="lastEvent.type === 'in' ? 'text-emerald-400' : 'text-amber-500'" class="font-bold uppercase text-[9px] font-mono">
                            {{ lastEvent.type === 'in' ? 'Entrada' : 'Saída' }}
                          </span>
                          <span class="text-[10px] text-stone-400 font-mono">
                            {{ lastEvent.timestamp | date:'HH:mm:ss' }}
                          </span>
                        </div>
                      } @else {
                        <span class="text-stone-600 italic text-[10px]">Sem registro</span>
                      }
                    </td>

                    <td class="py-3 px-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          (click)="ecosystem.toggleClock(emp.id)"
                          [class]="lastEvent?.type === 'in' ? 'bg-amber-600 text-stone-950 shadow-md scale-105' : 'bg-stone-800 text-amber-400 border-amber-800/40 hover:bg-stone-700'"
                          class="px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer flex items-center gap-1 uppercase tracking-tighter">
                          <mat-icon class="text-[14px]">{{ lastEvent?.type === 'in' ? 'timer_off' : 'timer' }}</mat-icon>
                          {{ lastEvent?.type === 'in' ? 'Registrar Saída' : 'Bater Ponto' }}
                        </button>
                        
                        <button
                          type="button"
                          (click)="ecosystem.deleteEmployee(emp.id)"
                          class="bg-rose-950/40 hover:bg-rose-900 text-rose-400 border border-rose-900/60 font-bold px-2 py-1.5 rounded-xl text-[10px] cursor-pointer transition-colors">
                          <mat-icon class="text-[14px]">delete_sweep</mat-icon>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- NEW EMPLOYEE MODAL -->
      @if (showNewModal()) {
        <div class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-[#1d1008] border-2 border-[#4d2813] rounded-3xl max-w-md w-full p-6 text-stone-200 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div class="flex justify-between items-center pb-3 border-b border-[#3d200f]">
              <h3 class="font-serif font-bold text-amber-400 text-sm flex items-center gap-2">
                <mat-icon class="text-amber-500">person_add</mat-icon>
                <span>Cadastrar Novo Funcionário</span>
              </h3>
              <button type="button" (click)="showNewModal.set(false)" class="text-stone-400 hover:text-white font-bold">✕</button>
            </div>

            <form [formGroup]="empForm" (ngSubmit)="onSubmitForm()" class="space-y-3 text-xs">
              <div>
                <label for="rhEmpName" class="block font-bold text-amber-300 mb-1">Nome Completo</label>
                <input
                  id="rhEmpName"
                  type="text"
                  formControlName="name"
                  placeholder="Ex: João da Silva"
                  class="w-full bg-[#2a160b] border border-[#482814] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500 font-sans">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="rhEmpRole" class="block font-bold text-amber-300 mb-1">Cargo / Função</label>
                  <select
                    id="rhEmpRole"
                    formControlName="role"
                    class="w-full bg-[#2a160b] border border-[#482814] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500">
                    <option value="caixa">Caixa</option>
                    <option value="cozinheiro">Cozinheiro</option>
                    <option value="garcom">Garçom</option>
                    <option value="entregador">Entregador Próprio</option>
                    <option value="atendente">Atendente</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>

                <div>
                  <label for="rhEmpShift" class="block font-bold text-amber-300 mb-1">Escala de Trabalho</label>
                  <select
                    id="rhEmpShift"
                    formControlName="shift"
                    class="w-full bg-[#2a160b] border border-[#482814] rounded-xl p-2.5 text-white focus:outline-none focus:border-amber-500">
                    <option value="integral">Integral (44h)</option>
                    <option value="manha">Turno Manhã</option>
                    <option value="tarde">Turno Tarde</option>
                    <option value="noite">Turno Noite</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="rhEmpCpf" class="block font-bold text-amber-300 mb-1">CPF</label>
                  <input
                    id="rhEmpCpf"
                    type="text"
                    formControlName="cpf"
                    placeholder="000.000.000-00"
                    class="w-full bg-[#2a160b] border border-[#482814] rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500">
                </div>

                <div>
                  <label for="rhEmpPhone" class="block font-bold text-amber-300 mb-1">Telefone / WhatsApp</label>
                  <input
                    id="rhEmpPhone"
                    type="text"
                    formControlName="phone"
                    placeholder="(11) 90000-0000"
                    class="w-full bg-[#2a160b] border border-[#482814] rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500">
                </div>
              </div>

              <div>
                <label for="rhEmpSalary" class="block font-bold text-amber-300 mb-1">Salário Base (R$)</label>
                <input
                  id="rhEmpSalary"
                  type="number"
                  formControlName="salary"
                  placeholder="2500.00"
                  class="w-full bg-[#2a160b] border border-[#482814] rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-amber-500">
              </div>

              <div class="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  (click)="showNewModal.set(false)"
                  class="bg-[#2a160b] hover:bg-[#381e0e] text-stone-300 px-4 py-2 rounded-xl border border-[#4d2813] font-bold">
                  Cancelar
                </button>

                <button
                  type="submit"
                  [disabled]="empForm.invalid"
                  class="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black px-5 py-2 rounded-xl shadow border border-amber-400 cursor-pointer disabled:opacity-50">
                  Cadastrar no RH
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class RhWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  private readonly fb = inject(FormBuilder);

  readonly showNewModal = signal<boolean>(false);

  readonly empForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    role: ['caixa', Validators.required],
    shift: ['integral', Validators.required],
    cpf: ['', Validators.required],
    phone: ['', Validators.required],
    salary: [2500, [Validators.required, Validators.min(0)]]
  });

  readonly storeEmployees = computed(() => {
    const tenantId = this.ecosystem.currentTenantId();
    return this.ecosystem.employees().filter(e => e.tenantId === tenantId);
  });

  readonly totalPayroll = computed(() => {
    return this.storeEmployees().reduce((sum, e) => sum + e.salary, 0);
  });

  readonly caixasCount = computed(() => this.storeEmployees().filter(e => e.role === 'caixa' || e.role === 'atendente').length);
  readonly cooksCount = computed(() => this.storeEmployees().filter(e => e.role === 'cozinheiro').length);
  readonly driversCount = computed(() => this.storeEmployees().filter(e => e.role === 'entregador').length);

  getLastClockEvent(employeeId: string) {
    return [...this.ecosystem.clockEvents()]
      .reverse()
      .find(ev => ev.employeeId === employeeId);
  }

  onSubmitForm() {
    if (this.empForm.invalid) return;
    const val = this.empForm.value;
    this.ecosystem.addEmployee({
      tenantId: this.ecosystem.currentTenantId(),
      name: val.name,
      role: val.role,
      shift: val.shift,
      cpf: val.cpf,
      phone: val.phone,
      salary: Number(val.salary),
      status: 'active',
      hireDate: new Date().toISOString().split('T')[0]
    });
    this.showNewModal.set(false);
    this.empForm.reset({
      role: 'caixa',
      shift: 'integral',
      salary: 2500
    });
  }
}
