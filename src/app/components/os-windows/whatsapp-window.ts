import { ChangeDetectionStrategy, Component, inject, signal, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { SocialMessage } from '../../models/ecosystem.model';
import { animate } from 'motion';

export interface CannedResponse {
  title: string;
  category: string;
  shortcut: string;
  text: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-whatsapp-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex h-full bg-slate-950 text-slate-200 overflow-hidden rounded-[2rem] border border-white/5 shadow-2xl">
      <!-- SIDEBAR: CHAT LIST & QUICK ACTIONS -->
      <div class="w-80 border-r border-white/5 flex flex-col bg-slate-900/40 backdrop-blur-md">
        <div class="p-6 bg-slate-950/40 border-b border-white/5 flex items-center justify-between">
          <div class="flex flex-col">
            <h2 class="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Comm Node</h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span class="text-sm font-black text-white uppercase tracking-tight">WhatsApp CRM</span>
            </div>
          </div>
          <button 
            type="button" 
            (click)="homologIncomingCustomerBot()"
            class="p-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-slate-950 transition-all border border-emerald-500/30 cursor-pointer"
            title="Homologar Entrada de Cliente via Bot">
            <mat-icon class="text-lg">smart_toy</mat-icon>
          </button>
        </div>

        <!-- Search Node -->
        <div class="p-4">
          <div class="relative group">
            <mat-icon class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-sm group-focus-within:text-emerald-500 transition-colors">search</mat-icon>
            <input 
              type="text" 
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="LOCALIZAR CLIENTE / TELEFONE..." 
              class="w-full bg-slate-950 border border-white/5 rounded-2xl pl-10 pr-4 py-3 text-[10px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-emerald-500/30 transition-all">
          </div>
        </div>

        <div class="flex-1 overflow-y-auto custom-scrollbar">
          @for (msg of ecosystem.socialMessages(); track msg.id) {
            @if (msg.platform === 'whatsapp' && matchesSearch(msg)) {
              <button 
                type="button"
                (click)="selectChat(msg)"
                [class.bg-emerald-500/5]="selectedChat()?.id === msg.id"
                [class.border-emerald-500/20]="selectedChat()?.id === msg.id"
                class="w-full flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-all border-b border-white/5 text-left focus:outline-none group relative overflow-hidden">
                
                @if (selectedChat()?.id === msg.id) {
                  <div class="absolute left-0 top-0 w-1 h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                }

                <div class="relative shrink-0">
                  <img [src]="msg.avatar" class="w-12 h-12 rounded-2xl border border-white/10 group-hover:scale-105 transition-transform" alt="avatar" referrerpolicy="no-referrer">
                  @if (msg.unread) {
                    <div class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[8px] font-black flex items-center justify-center border-2 border-slate-900 shadow-lg">1</div>
                  }
                </div>
                
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between items-baseline mb-0.5">
                    <h4 class="font-black text-[11px] text-white uppercase tracking-tight truncate">{{ msg.sender }}</h4>
                    <span class="text-[8px] font-black text-slate-600 uppercase">{{ msg.time }}</span>
                  </div>
                  <p class="text-[10px] text-slate-500 truncate font-black uppercase tracking-widest">
                    @if (msg.isMarketing) {
                      <span class="text-emerald-500">[CAMP]</span>
                    }
                    {{ msg.text }}
                  </p>
                </div>
              </button>
            }
          }
        </div>

        <!-- Quick Broadcast Panel -->
        <div class="p-4 border-t border-white/5 bg-slate-950/40">
          <button 
            type="button"
            (click)="dispatchGlobalCampaign()"
            class="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 py-3 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 border border-emerald-400/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95">
            <mat-icon class="text-sm">campaign</mat-icon> Disparar Promoção em Massa
          </button>
        </div>
      </div>

      <!-- MAIN CHAT AREA -->
      <div class="flex-1 flex flex-col relative bg-slate-950">
        <!-- Scanline Overlay -->
        <div class="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] z-10"></div>

        @if (selectedChat(); as chat) {
          <!-- Chat Header -->
          <div class="p-4 bg-slate-900/60 backdrop-blur-md flex items-center justify-between border-b border-white/5 relative z-20">
            <div class="flex items-center gap-4">
              <div class="relative group cursor-help">
                <img [src]="chat.avatar" class="w-12 h-12 rounded-2xl border border-white/10 shadow-xl group-hover:scale-110 transition-transform" alt="avatar" referrerpolicy="no-referrer">
                <div class="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                
                <!-- Hover Profile Card -->
                <div class="absolute top-14 left-0 w-48 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  <p class="text-[9px] font-black text-indigo-400 uppercase mb-2 tracking-widest">Perfil CRM</p>
                  <div class="space-y-1.5">
                    <p class="text-[10px] font-bold text-white">Última Compra: 2d atrás</p>
                    <p class="text-[10px] font-bold text-emerald-400">Lifetime Value: R$ 450,00</p>
                    <p class="text-[10px] font-bold text-amber-400">Score: 4.8 ★</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 class="font-black text-sm text-white uppercase tracking-tight">{{ chat.sender }}</h4>
                <div class="flex items-center gap-2 mt-0.5">
                   <span class="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">Online Agora</span>
                   <span class="text-[8px] font-black text-slate-600 uppercase">•</span>
                   <span class="text-[8px] font-black text-slate-500 uppercase">Protocolo #{{ chat.id.split('-').pop() }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button"
                (click)="sendPixPaymentLink(chat)"
                class="bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-slate-950 font-black px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 border border-amber-500/30 cursor-pointer">
                <mat-icon class="text-sm">qr_code_2</mat-icon> Link Pagto
              </button>
              <button 
                type="button"
                (click)="createOrderFromChat(chat)"
                class="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black px-4 py-2 rounded-xl text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all active:scale-95 border border-emerald-400/20 cursor-pointer">
                <mat-icon class="text-sm">add_shopping_cart</mat-icon> Enviar KDS
              </button>
            </div>
          </div>

          <!-- Messages Body -->
          <div #messageBody class="flex-1 p-8 overflow-y-auto space-y-6 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:24px_24px] relative z-0">
            <div class="flex justify-center mb-4">
              <span class="bg-slate-900 border border-white/5 text-[8px] text-slate-500 px-4 py-1 rounded-full uppercase tracking-[0.3em] font-black">Sessão Criptografada WhatsApp Business</span>
            </div>

            <!-- Initial Customer Message -->
            <div class="flex justify-start">
              <div class="max-w-[80%] bg-slate-900/80 backdrop-blur-sm border border-white/5 p-5 rounded-[2rem] rounded-tl-sm shadow-2xl relative group">
                <p class="text-sm font-black text-slate-300 uppercase tracking-tight leading-relaxed">{{ chat.text }}</p>
                <div class="flex justify-end items-center gap-2 mt-3 opacity-40 group-hover:opacity-100 transition-opacity">
                   <span class="text-[8px] font-black text-slate-500 uppercase">{{ chat.time }}</span>
                   <mat-icon class="text-[12px] w-3 h-3 text-emerald-500">done_all</mat-icon>
                </div>
              </div>
            </div>

            <!-- Sent Thread -->
            @for (msg of chatThread(); track $index) {
              <div [class]="msg.sender === 'bot' || msg.sender === 'user' ? 'flex justify-end' : 'flex justify-start'">
                <div [class]="msg.sender === 'bot' || msg.sender === 'user' ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-100 rounded-tr-sm' : 'bg-slate-900/80 border-white/5 text-slate-200 rounded-tl-sm'" class="max-w-[80%] border p-5 rounded-[2rem] shadow-2xl relative group space-y-2">
                  <p class="text-xs font-black uppercase tracking-tight leading-relaxed whitespace-pre-line">{{ msg.text }}</p>
                  <div class="flex justify-end items-center gap-2 opacity-60">
                     <span class="text-[8px] font-black uppercase">{{ msg.time }}</span>
                     <mat-icon class="text-[12px] w-3 h-3 text-emerald-400">done_all</mat-icon>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Automation Quick Panel -->
          <div class="px-6 py-3 bg-slate-900/60 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-4">
             <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span class="text-[8px] font-black uppercase text-slate-500">Auto-Atendente:</span>
                <div class="w-8 h-4 bg-emerald-600 rounded-full relative cursor-pointer"><div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
             </div>
             <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span class="text-[8px] font-black uppercase text-slate-500">IA Cardápio:</span>
                <div class="w-8 h-4 bg-emerald-600 rounded-full relative cursor-pointer"><div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
             </div>
             <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span class="text-[8px] font-black uppercase text-slate-500">Pesquisa Satisfação:</span>
                <div class="w-8 h-4 bg-slate-800 rounded-full relative cursor-pointer"><div class="absolute left-0.5 top-0.5 w-3 h-3 bg-slate-400 rounded-full"></div></div>
             </div>
             <div class="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-white/5">
                <span class="text-[8px] font-black uppercase text-slate-500">Filtro Spam:</span>
                <div class="w-8 h-4 bg-emerald-600 rounded-full relative cursor-pointer"><div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div></div>
             </div>
          </div>

          <!-- Quick Templates Bar -->
          <div class="px-6 py-2 bg-slate-950/80 border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
            @for (tpl of cannedResponses; track tpl.title) {
              <button 
                type="button"
                (click)="sendCannedResponse(tpl.text)"
                class="bg-slate-900 hover:bg-emerald-600/20 text-slate-400 hover:text-emerald-400 px-3 py-1.5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer">
                {{ tpl.title }}
              </button>
            }
          </div>

          <!-- Message Input -->
          <div class="p-6 bg-slate-900/40 backdrop-blur-md border-t border-white/5 relative z-20">
            <div class="flex items-center gap-4">
              <button type="button" (click)="sendCannedResponse('Olá! Seja bem-vindo ao nosso restaurante. Como podemos te servir hoje?')" class="p-2 rounded-xl hover:bg-white/5 text-slate-500 transition-colors cursor-pointer" title="Saudação Padrão"><mat-icon>sentiment_satisfied_alt</mat-icon></button>
              <div class="flex-1 bg-slate-950 border border-white/5 rounded-[1.5rem] px-6 py-4 shadow-inner group">
                <input 
                  type="text" 
                  [value]="draftMessage()"
                  (input)="draftMessage.set($any($event.target).value)"
                  (keydown.enter)="sendMessage()"
                  placeholder="DIGITE SUA RESPOSTA OU SELECIONE UM MODELO RÁPIDO..." 
                  class="bg-transparent border-none focus:outline-none text-[10px] font-black w-full text-white uppercase tracking-widest placeholder:text-slate-700">
              </div>
              <button 
                type="button"
                (click)="sendMessage()"
                class="w-14 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 flex items-center justify-center transition-all shadow-lg shadow-emerald-600/20 border border-emerald-400/20 active:scale-95 cursor-pointer">
                <mat-icon class="font-black">send</mat-icon>
              </button>
            </div>
          </div>
        } @else {
          <!-- Empty State -->
          <div class="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-8">
            <div class="relative">
              <div class="w-32 h-32 rounded-[2.5rem] bg-slate-900/40 border border-white/5 flex items-center justify-center text-slate-800 shadow-inner">
                <mat-icon class="text-7xl">sensors</mat-icon>
              </div>
              <div class="absolute inset-0 w-32 h-32 rounded-[2.5rem] border-2 border-emerald-500/20 animate-ping"></div>
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-black text-white uppercase tracking-tight">Atendimento WhatsApp Automatizado</h3>
              <p class="text-[10px] text-slate-500 max-w-xs mx-auto font-black uppercase tracking-[0.2em] leading-relaxed">Selecione uma conversa ou homologue a entrada de um pedido de cliente via robô.</p>
            </div>
            <button 
              type="button" 
              (click)="homologIncomingCustomerBot()"
              class="bg-emerald-600 hover:bg-emerald-500 text-slate-950 px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 border border-emerald-400/20 active:scale-95 cursor-pointer">
              Homologar Interação Automatizada de Cliente
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
    .no-scrollbar::-webkit-scrollbar { display: none; }
  `]
})
export class WhatsappWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  readonly selectedChat = signal<SocialMessage | null>(null);
  readonly draftMessage = signal<string>('');
  readonly searchQuery = signal<string>('');
  readonly chatThread = signal<{ sender: 'user' | 'bot' | 'customer'; text: string; time: string }[]>([]);
  
  private readonly messageBody = viewChild<ElementRef>('messageBody');

  constructor() {
    effect(() => {
      const selected = this.selectedChat();
      if (!selected) return;

      // Watch for updates in the service's social messages for the selected sender
      const allMsgs = this.ecosystem.socialMessages();
      const current = allMsgs.find(m => m.id === selected.id);
      
      if (current && current.unread) {
        // If there's a new unread message for the selected chat, add it to thread
        this.chatThread.update(thread => [
          ...thread, 
          { sender: 'customer', text: current.text, time: current.time }
        ]);
        
        // Mark as read in service
        this.ecosystem.socialMessages.update(msgs => 
          msgs.map(m => m.id === current.id ? { ...m, unread: false } : m)
        );
        
        this.scrollToBottom();
      }
    });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const body = this.messageBody()?.nativeElement;
      if (body) {
        body.scrollTop = body.scrollHeight;
      }
    });
  }

  readonly cannedResponses: CannedResponse[] = [
    { title: '📜 Cardápio PDF', category: 'Informação', shortcut: '/cardapio', text: 'Aqui está nosso cardápio completo em formato PDF digital: https://3eatcru.app/cardapio.pdf' },
    { title: '⏰ Horário de Funcionamento', category: 'Informação', shortcut: '/horario', text: 'Funcionamos de Terça a Domingo das 11:30 às 23:30. Atendemos salão e delivery!' },
    { title: '📍 Endereço da Loja', category: 'Informação', shortcut: '/endereco', text: 'Estamos localizados na Av. Paulista, 1000 - Bela Vista, São Paulo.' },
    { title: '🛵 Status do Pedido', category: 'Atendimento', shortcut: '/status', text: 'Seu pedido já foi aprovado pela cozinha e está em fase final de preparo!' }
  ];

  matchesSearch(msg: SocialMessage): boolean {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return true;
    return msg.sender.toLowerCase().includes(q) || msg.text.toLowerCase().includes(q);
  }

  selectChat(chat: SocialMessage) {
    this.selectedChat.set(chat);
    this.chatThread.set([]);
    setTimeout(() => {
      const body = this.messageBody()?.nativeElement;
      if (body) {
        animate(body, { opacity: [0, 1], y: [10, 0] }, { duration: 0.4 });
      }
    });
  }

  sendMessage() {
    const text = this.draftMessage().trim();
    if (!text || !this.selectedChat()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatThread.update(thread => [...thread, { sender: 'user', text, time }]);
    this.draftMessage.set('');

    setTimeout(() => {
      this.ecosystem.notify(`Mensagem enviada para ${this.selectedChat()?.sender}.`, 'success');
    }, 300);
  }

  sendCannedResponse(text: string) {
    if (!this.selectedChat()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatThread.update(thread => [...thread, { sender: 'user', text, time }]);
    this.ecosystem.notify('Resposta rápida disparada no WhatsApp.', 'info');
  }

  sendPixPaymentLink(chat: SocialMessage) {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const pixText = `🔑 Chave Pix Copia e Cola Gerada:\n00020126580014BR.GOV.BCB.PIX01363eatcru-gastronomia-2026520400005303986540578.905802BR5915GASTROOS_3EAT6009SAO_PAULO620705031026304C102\n\nTotal: R$ 78,90. O comprovante é validado automaticamente.`;
    
    this.chatThread.update(thread => [...thread, { sender: 'bot', text: pixText, time }]);
    this.ecosystem.notify(`Código Pix Copia e Cola enviado para ${chat.sender}!`, 'success');
  }

  homologIncomingCustomerBot() {
    const newMsg: SocialMessage = {
      id: 'wa-bot-' + Date.now(),
      platform: 'whatsapp',
      sender: 'Camila Alcantara',
      avatar: 'https://picsum.photos/seed/camila/100/100',
      text: 'Gostaria de fazer um pedido delivery: 1x Burger Trufado e 1x Refrigerante.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    };

    this.ecosystem.socialMessages.update(msgs => [newMsg, ...msgs]);
    this.selectChat(newMsg);
    this.ecosystem.notify('Novo atendimento WhatsApp homologado via Robô!', 'info');
  }

  createOrderFromChat(chat: SocialMessage) {
    const product = this.ecosystem.products()[0];
    const order = this.ecosystem.addOrder({
      tenantId: this.ecosystem.currentTenantId(),
      orderNumber: '#WA-' + Math.floor(Math.random() * 900 + 100),
      type: 'delivery',
      customerName: chat.sender,
      items: [{ product, quantity: 1, notes: 'Comanda criada via WhatsApp CRM' }],
      subtotal: product.price,
      tax: 0,
      discount: 0,
      total: product.price,
      paymentMethod: 'pix',
      status: 'pending',
      channel: 'WhatsApp'
    });

    this.ecosystem.notify(`Comanda ${order.orderNumber} criada para ${chat.sender}! Encaminhada para o KDS.`, 'success');
  }

  dispatchGlobalCampaign() {
    this.ecosystem.notify('Campanha WhatsApp "Almoço Executivo" enviada para 450 contatos.', 'info');
  }
}
