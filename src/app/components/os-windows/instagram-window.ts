import { ChangeDetectionStrategy, Component, inject, signal, computed, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EcosystemService } from '../../services/ecosystem.service';
import { animate, stagger } from 'motion';

export interface InstagramPost {
  id: string;
  author: string;
  avatar: string;
  image: string;
  type: 'feed' | 'reels' | 'story';
  time: string;
  scheduledFor?: string;
  status: 'published' | 'scheduled' | 'draft';
  likes: number;
  reach: string;
  caption: string;
  hashtags: string[];
  commentsCount: number;
  isLiked: boolean;
  comments: { user: string; text: string; time: string }[];
}

export interface CaptionTemplate {
  id: string;
  title: string;
  icon: string;
  caption: string;
  hashtags: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-instagram-window',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="h-full flex flex-col bg-[#12080e] text-stone-200 font-sans selection:bg-rose-600 selection:text-white">
      
      <!-- SUB-HEADER BAR -->
      <div class="bg-[#0b0409] border-b border-[#311228] p-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-black shadow-lg">
            <mat-icon>camera_alt</mat-icon>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="font-serif font-black text-base text-white">Instagram Studio &amp; Agendador Social</h2>
              <span class="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-tighter">
                Templates &amp; Agendamento
              </span>
            </div>
            <p class="text-xs text-stone-400">Crie publicações com modelos prontos, agende horários de pico e acompanhe o engajamento.</p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono bg-purple-950 text-purple-300 border border-purple-800/80 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5">
            <mat-icon class="text-xs">schedule</mat-icon>
            {{ scheduledPostsCount() }} AGENDADOS
          </span>

          <button
            type="button"
            (click)="activeTab.set('create')"
            class="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg transition-all">
            <mat-icon class="text-sm">add_circle</mat-icon>
            <span>+ Criar / Agendar Post</span>
          </button>
        </div>
      </div>

      <!-- TABS NAVIGATION BAR -->
      <div class="bg-[#0e050c] px-4 py-2 border-b border-[#280d20] flex items-center gap-2 text-xs font-bold shrink-0">
        <button
          type="button"
          (click)="activeTab.set('feed')"
          [class]="activeTab() === 'feed' ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow' : 'bg-[#1a0916] text-stone-400 hover:text-white border border-[#38132d]'"
          class="px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">grid_on</mat-icon>
          <span>Feed de Publicações</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('create')"
          [class]="activeTab() === 'create' ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow' : 'bg-[#1a0916] text-stone-400 hover:text-white border border-[#38132d]'"
          class="px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">collections_bookmark</mat-icon>
          <span>Estúdio de Criação &amp; Templates</span>
        </button>

        <button
          type="button"
          (click)="activeTab.set('scheduled')"
          [class]="activeTab() === 'scheduled' ? 'bg-gradient-to-r from-rose-600 to-purple-600 text-white shadow' : 'bg-[#1a0916] text-stone-400 hover:text-white border border-[#38132d]'"
          class="px-4 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5">
          <mat-icon class="text-sm">calendar_month</mat-icon>
          <span>Fila de Agendamentos ({{ scheduledPostsCount() }})</span>
        </button>
      </div>

      <!-- MAIN TAB CONTENT AREA -->
      <div class="flex-1 p-4 sm:p-6 overflow-y-auto custom-scrollbar">
        
        <!-- TAB 1: FEED & STREAM -->
        @if (activeTab() === 'feed') {
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-6xl mx-auto">
            
            <!-- LEFT: INSTAGRAM FEED POSTS (7 COLS) -->
            <div class="lg:col-span-7 space-y-6" #feedContainer>
              
              <!-- STORIES BAR -->
              <div class="bg-[#1b0918] border border-[#3b1531] rounded-3xl p-4 shadow-xl flex items-center gap-4 overflow-x-auto custom-scrollbar">
                <div (click)="activeTab.set('create')" (keyup.enter)="activeTab.set('create')" tabindex="0" class="flex flex-col items-center shrink-0 cursor-pointer group">
                  <div class="w-16 h-16 rounded-2xl bg-[#280d24] border-2 border-dashed border-rose-500/60 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-all">
                    <mat-icon class="text-2xl">add</mat-icon>
                  </div>
                  <span class="text-[10px] text-stone-300 font-bold mt-1">Seu Story</span>
                </div>

                @for (t of ecosystem.tenants(); track t.id) {
                  <div class="flex flex-col items-center shrink-0 group cursor-pointer">
                    <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5 group-hover:scale-105 transition-all shadow-md">
                      <img [src]="t.logo" class="w-full h-full object-cover rounded-[14px] border-2 border-[#1b0918]" [alt]="t.name" referrerpolicy="no-referrer">
                    </div>
                    <span class="text-[10px] text-stone-300 font-bold mt-1 truncate max-w-[64px]">{{ t.name.split(' ')[0] }}</span>
                  </div>
                }
              </div>

              <!-- FEED POST CARDS -->
              @for (post of publishedPosts(); track post.id) {
                <div class="post-card bg-[#1b0918] border border-[#3b1531] rounded-3xl overflow-hidden shadow-2xl space-y-3">
                  <!-- Header -->
                  <div class="p-4 flex justify-between items-center border-b border-[#2d0f25]">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 to-purple-600 p-0.5 shrink-0">
                        <img [src]="post.avatar" class="w-full h-full object-cover rounded-[10px]" [alt]="post.author" referrerpolicy="no-referrer">
                      </div>
                      <div>
                        <div class="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{{ post.author }}</span>
                          <mat-icon class="text-sky-400 text-xs">verified</mat-icon>
                        </div>
                        <div class="text-[10px] text-stone-400 font-mono">{{ post.time }}</div>
                      </div>
                    </div>
                    <span class="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold uppercase">
                      Publicado
                    </span>
                  </div>

                  <!-- Post Image -->
                  <div class="aspect-square bg-stone-900 overflow-hidden relative group">
                    <img [src]="post.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" [alt]="post.author" referrerpolicy="no-referrer">
                    <div class="absolute bottom-3 right-3 bg-black/80 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-mono text-stone-300 border border-white/10">
                      Alcance: {{ post.reach }}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="px-4 pt-1 flex justify-between items-center text-stone-300">
                    <div class="flex items-center gap-4">
                      <button
                        type="button"
                        (click)="toggleLike(post.id)"
                        class="flex items-center gap-1 text-xs font-bold cursor-pointer hover:text-rose-400 transition-colors">
                        <mat-icon [class.text-rose-500]="post.isLiked" class="text-base">{{ post.isLiked ? 'favorite' : 'favorite_border' }}</mat-icon>
                        <span>{{ post.likes }}</span>
                      </button>

                      <button
                        type="button"
                        (click)="addCommentPrompt(post.id)"
                        class="flex items-center gap-1 text-xs font-bold cursor-pointer hover:text-rose-400 transition-colors">
                        <mat-icon class="text-base">chat_bubble_outline</mat-icon>
                        <span>{{ post.commentsCount }}</span>
                      </button>

                      <button
                        type="button"
                        (click)="sharePost(post.id)"
                        class="text-xs font-bold cursor-pointer hover:text-rose-400 transition-colors">
                        <mat-icon class="text-base">send</mat-icon>
                      </button>
                    </div>

                    <mat-icon class="text-base text-stone-500 cursor-pointer hover:text-white">bookmark_border</mat-icon>
                  </div>

                  <!-- Caption & Comments -->
                  <div class="px-4 pb-4 space-y-2 text-xs">
                    <p class="text-stone-200 leading-relaxed font-medium">
                      <strong class="text-white font-bold mr-1">{{ post.author }}</strong>
                      {{ post.caption }}
                    </p>

                    <div class="flex flex-wrap gap-1 pt-1">
                      @for (tag of post.hashtags; track tag) {
                        <span class="text-[10px] font-mono text-rose-400 hover:underline cursor-pointer">#{{ tag }}</span>
                      }
                    </div>

                    @if (post.comments.length > 0) {
                      <div class="bg-[#120510] p-3 rounded-2xl space-y-1.5 border border-[#2b0d23] mt-2">
                        @for (c of post.comments; track c.text) {
                          <div class="text-[11px] text-stone-300">
                            <strong class="text-rose-300 mr-1">{{ c.user }}:</strong> {{ c.text }}
                          </div>
                        }
                      </div>
                    }
                  </div>

                </div>
              }
            </div>

            <!-- RIGHT: INSTAGRAM INSIGHTS & STATS (5 COLS) -->
            <div class="lg:col-span-5 space-y-4">
              <div class="bg-[#1b0918] border border-[#3b1531] rounded-3xl p-5 shadow-2xl space-y-4">
                <h3 class="font-serif font-black text-white text-sm flex items-center gap-2 border-b border-[#2d0f25] pb-3">
                  <mat-icon class="text-rose-400">insights</mat-icon> Métricas de Engajamento Instagram
                </h3>

                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-[#120510] border border-[#2d0f25] rounded-2xl p-3.5">
                    <span class="text-[10px] font-mono text-stone-400 block uppercase font-bold">Impressões Totais</span>
                    <strong class="text-2xl font-serif font-black text-white">42.8k</strong>
                    <span class="text-[10px] text-emerald-400 font-bold block mt-0.5">+18.2% esta semana</span>
                  </div>

                  <div class="bg-[#120510] border border-[#2d0f25] rounded-2xl p-3.5">
                    <span class="text-[10px] font-mono text-stone-400 block uppercase font-bold">Taxa de Engajamento</span>
                    <strong class="text-2xl font-serif font-black text-rose-400">8.4%</strong>
                    <span class="text-[10px] text-stone-400 block mt-0.5">Acima da média do setor</span>
                  </div>
                </div>

                <div class="bg-[#120510] border border-[#2d0f25] rounded-2xl p-4 space-y-2">
                  <div class="font-bold text-white text-xs uppercase flex items-center justify-between">
                    <span>Horários de Pico de Audiência</span>
                    <mat-icon class="text-amber-400 text-sm">schedule</mat-icon>
                  </div>
                  <p class="text-[11px] text-stone-400">Sua audiência no ecossistema está mais ativa nos horários:</p>
                  <div class="flex gap-2 text-[10px] font-mono font-bold">
                    <span class="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-1 rounded-lg">11:30 - 13:30</span>
                    <span class="bg-purple-950 text-purple-300 border border-purple-800 px-2 py-1 rounded-lg">18:00 - 21:30</span>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="activeTab.set('create')"
                  class="w-full bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white font-black py-3 rounded-2xl text-xs uppercase cursor-pointer shadow-lg transition-all flex items-center justify-center gap-1.5">
                  <mat-icon class="text-sm">collections_bookmark</mat-icon>
                  <span>Agendar Publicação com Templates</span>
                </button>
              </div>
            </div>

          </div>
        }

        <!-- TAB 2: POST CREATION & TEMPLATE LIBRARY -->
        @if (activeTab() === 'create') {
          <div class="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- LEFT: FORM & TEMPLATES (7 COLS) -->
            <div class="lg:col-span-7 bg-[#1b0918] border border-[#3b1531] rounded-3xl p-6 shadow-2xl space-y-5">
              <div class="border-b border-[#2d0f25] pb-4">
                <h3 class="font-serif font-black text-white text-base flex items-center gap-2">
                  <mat-icon class="text-rose-400">collections_bookmark</mat-icon> Estúdio de Criação &amp; Modelos
                </h3>
                <p class="text-xs text-stone-400">Escolha um modelo pronto de legenda, ajuste a mídia e defina a data de publicação.</p>
              </div>

              <!-- TEMPLATES BIBLIOTECA SELECTOR -->
              <div class="space-y-2">
                <span class="block text-[10px] font-mono font-bold text-rose-300 uppercase">Biblioteca de Templates Prontos:</span>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  @for (tmpl of captionTemplates; track tmpl.id) {
                    <button
                      type="button"
                      (click)="applyTemplate(tmpl)"
                      class="bg-[#120510] hover:bg-[#280d24] border border-[#2d0f25] hover:border-rose-500 p-2.5 rounded-2xl text-left transition-all cursor-pointer group">
                      <div class="flex items-center gap-2 text-white font-bold text-xs group-hover:text-rose-300">
                        <mat-icon class="text-rose-400 text-sm">{{ tmpl.icon }}</mat-icon>
                        <span>{{ tmpl.title }}</span>
                      </div>
                      <p class="text-[10px] text-stone-400 line-clamp-1 mt-0.5">{{ tmpl.caption }}</p>
                    </button>
                  }
                </div>
              </div>

              <form [formGroup]="postForm" (ngSubmit)="onSavePost()" class="space-y-4 text-xs font-sans pt-2 border-t border-[#2d0f25]">
                <!-- TYPE SELECTOR -->
                <div>
                  <span class="block font-bold text-stone-300 mb-1.5 uppercase text-[10px]">Formato do Conteúdo</span>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      (click)="setPostType('feed')"
                      [class]="postForm.value.type === 'feed' ? 'bg-rose-600 text-white font-bold border-rose-500' : 'bg-[#120510] text-stone-400 border-[#2d0f25]'"
                      class="border p-2.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <mat-icon class="text-sm">grid_on</mat-icon>
                      <span>Post Feed</span>
                    </button>

                    <button
                      type="button"
                      (click)="setPostType('reels')"
                      [class]="postForm.value.type === 'reels' ? 'bg-rose-600 text-white font-bold border-rose-500' : 'bg-[#120510] text-stone-400 border-[#2d0f25]'"
                      class="border p-2.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <mat-icon class="text-sm">video_library</mat-icon>
                      <span>Reels / Vídeo</span>
                    </button>

                    <button
                      type="button"
                      (click)="setPostType('story')"
                      [class]="postForm.value.type === 'story' ? 'bg-rose-600 text-white font-bold border-rose-500' : 'bg-[#120510] text-stone-400 border-[#2d0f25]'"
                      class="border p-2.5 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                      <mat-icon class="text-sm">history_toggle_off</mat-icon>
                      <span>Story (24h)</span>
                    </button>
                  </div>
                </div>

                <!-- PRESET IMAGE SELECTOR OR URL -->
                <div>
                  <label for="postImageInput" class="block font-bold text-stone-300 mb-1 uppercase text-[10px]">URL da Mídia ou Selecionar Modelo de Foto</label>
                  <input
                    id="postImageInput"
                    formControlName="image"
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    class="w-full bg-[#120510] border border-[#2d0f25] rounded-xl px-3 py-2 text-stone-100 font-mono focus:outline-none focus:border-rose-500">
                  
                  <div class="flex items-center gap-2 mt-2 overflow-x-auto pb-1 custom-scrollbar">
                    <span class="text-[10px] font-mono text-stone-400 uppercase font-bold shrink-0">Fotos do Balcão:</span>
                    @for (preset of imagePresets; track preset.name) {
                      <button
                        type="button"
                        (click)="postForm.patchValue({ image: preset.url })"
                        class="bg-[#240c20] hover:bg-[#381332] text-rose-300 border border-[#3d1637] text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer">
                        {{ preset.name }}
                      </button>
                    }
                  </div>
                </div>

                <!-- CAPTION TEXTAREA -->
                <div>
                  <label for="postCaptionInput" class="block font-bold text-stone-300 mb-1 uppercase text-[10px]">Legenda da Publicação</label>
                  <textarea
                    id="postCaptionInput"
                    formControlName="caption"
                    rows="4"
                    placeholder="Digite a legenda ou clique em um template acima..."
                    class="w-full bg-[#120510] border border-[#2d0f25] rounded-xl p-3 text-stone-100 font-medium focus:outline-none focus:border-rose-500 resize-none"></textarea>
                </div>

                <!-- HASHTAGS -->
                <div>
                  <label for="postHashtagsInput" class="block font-bold text-stone-300 mb-1 uppercase text-[10px]">Hashtags (separadas por vírgula)</label>
                  <input
                    id="postHashtagsInput"
                    formControlName="hashtagsStr"
                    type="text"
                    placeholder="gastronomia, artesanal, delivery, sp, promo"
                    class="w-full bg-[#120510] border border-[#2d0f25] rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-none focus:border-rose-500">
                </div>

                <!-- SCHEDULING MODE OR INSTANT -->
                <div class="pt-2 border-t border-[#2d0f25] space-y-3">
                  <div class="flex items-center justify-between">
                    <label for="isScheduledCheckbox" class="font-bold text-white text-xs flex items-center gap-2 cursor-pointer">
                      <input
                        id="isScheduledCheckbox"
                        type="checkbox"
                        [checked]="isScheduling()"
                        (change)="isScheduling.set($any($event.target).checked)"
                        class="accent-rose-500">
                      <span>Agendar Publicação para Data/Hora Futura</span>
                    </label>
                  </div>

                  @if (isScheduling()) {
                    <div class="grid grid-cols-2 gap-3 bg-[#120510] p-3 rounded-2xl border border-[#2d0f25] animate-in fade-in-50">
                      <div>
                        <label for="scheduleDateInput" class="block font-bold text-stone-300 mb-1 uppercase text-[10px]">Data de Disparo</label>
                        <input
                          id="scheduleDateInput"
                          formControlName="scheduleDate"
                          type="date"
                          class="w-full bg-[#1b0918] border border-[#3b1531] rounded-xl px-3 py-2 text-stone-100 font-mono font-bold">
                      </div>
                      <div>
                        <label for="scheduleTimeInput" class="block font-bold text-stone-300 mb-1 uppercase text-[10px]">Horário de Disparo</label>
                        <input
                          id="scheduleTimeInput"
                          formControlName="scheduleTime"
                          type="time"
                          class="w-full bg-[#1b0918] border border-[#3b1531] rounded-xl px-3 py-2 text-stone-100 font-mono font-bold">
                      </div>
                    </div>
                  }
                </div>

                <!-- ACTION BUTTONS -->
                <div class="flex gap-3 pt-3">
                  <button
                    type="button"
                    (click)="activeTab.set('feed')"
                    class="flex-1 bg-[#120510] text-stone-400 font-bold py-3 rounded-xl border border-[#2d0f25] text-xs">
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    class="flex-1 bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:opacity-90 text-white font-black py-3 rounded-xl shadow-lg text-xs uppercase cursor-pointer flex items-center justify-center gap-1.5">
                    <mat-icon class="text-sm">{{ isScheduling() ? 'calendar_today' : 'send' }}</mat-icon>
                    <span>{{ isScheduling() ? 'Agendar Publicação' : 'Publicar Agora' }}</span>
                  </button>
                </div>
              </form>
            </div>

            <!-- RIGHT: INSTAGRAM PHONE PREVIEW FRAME (5 COLS) -->
            <div class="lg:col-span-5 flex flex-col items-center justify-start">
              <div class="w-full max-w-xs bg-black rounded-[40px] p-4 border-4 border-[#3b1531] shadow-2xl space-y-3 relative overflow-hidden">
                <!-- Phone Top Bar -->
                <div class="flex justify-between items-center text-[10px] font-mono text-stone-400 px-2 pt-1">
                  <span>9:41</span>
                  <div class="w-16 h-3 bg-stone-900 rounded-full"></div>
                  <div class="flex gap-1">
                    <mat-icon class="text-xs">wifi</mat-icon>
                    <mat-icon class="text-xs">battery_full</mat-icon>
                  </div>
                </div>

                <!-- Instagram Header -->
                <div class="flex justify-between items-center px-1 pb-1 border-b border-stone-800">
                  <span class="font-serif font-black text-white text-sm tracking-tight">Instagram</span>
                  <div class="flex gap-2 text-stone-300">
                    <mat-icon class="text-sm">favorite_border</mat-icon>
                    <mat-icon class="text-sm">send</mat-icon>
                  </div>
                </div>

                <!-- Preview Post Header -->
                <div class="flex items-center gap-2 px-1">
                  <div class="w-7 h-7 rounded-full bg-rose-500 p-0.5">
                    <img [src]="currentTenantLogo()" class="w-full h-full object-cover rounded-full" alt="avatar" referrerpolicy="no-referrer">
                  </div>
                  <span class="font-bold text-white text-xs">{{ currentTenantName() }}</span>
                </div>

                <!-- Preview Image -->
                <div class="aspect-square bg-stone-900 rounded-2xl overflow-hidden border border-stone-800">
                  <img
                    [src]="postForm.value.image || 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80'"
                    class="w-full h-full object-cover"
                    alt="preview"
                    referrerpolicy="no-referrer">
                </div>

                <!-- Preview Caption -->
                <div class="px-1 text-[11px] space-y-1">
                  <p class="text-stone-300 line-clamp-3">
                    <strong class="text-white mr-1">{{ currentTenantName() }}</strong>
                    {{ postForm.value.caption || 'Sua legenda aparecerá aqui...' }}
                  </p>
                  @if (postForm.value.hashtagsStr) {
                    <p class="text-[9px] font-mono text-rose-400">{{ formatHashtagsPreview(postForm.value.hashtagsStr) }}</p>
                  }
                </div>

                <!-- Status Badge -->
                <div class="pt-2 text-center border-t border-stone-900">
                  <span class="text-[9px] font-mono text-stone-400 uppercase font-bold">
                    {{ isScheduling() ? '🗓️ Prévia de Post Agendado' : '🚀 Publicação Imediata' }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        }

        <!-- TAB 3: SCHEDULED POSTS QUEUE -->
        @if (activeTab() === 'scheduled') {
          <div class="max-w-5xl mx-auto bg-[#1b0918] border border-[#3b1531] rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-[#2d0f25] pb-4">
              <div>
                <h3 class="font-serif font-black text-white text-base flex items-center gap-2">
                  <mat-icon class="text-purple-400">calendar_month</mat-icon> Fila de Publicações Agendadas
                </h3>
                <p class="text-xs text-stone-400">Gerencie posts programados para disparo automático nos melhores horários.</p>
              </div>

              <button
                type="button"
                (click)="activeTab.set('create')"
                class="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow">
                <mat-icon class="text-sm">add</mat-icon>
                <span>Agendar Novo Post</span>
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (post of scheduledPosts(); track post.id) {
                <div class="bg-[#120510] border border-[#2d0f25] rounded-2xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
                  <div class="space-y-2">
                    <div class="flex justify-between items-start">
                      <span class="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded font-bold uppercase">
                        🗓️ {{ post.scheduledFor }}
                      </span>
                      <span class="text-[10px] font-mono text-stone-400 uppercase font-bold">{{ post.type }}</span>
                    </div>

                    <div class="aspect-video bg-stone-900 rounded-xl overflow-hidden border border-[#2d0f25]">
                      <img [src]="post.image" class="w-full h-full object-cover" [alt]="post.author" referrerpolicy="no-referrer">
                    </div>

                    <p class="text-xs text-stone-300 font-medium line-clamp-2">
                      {{ post.caption }}
                    </p>
                  </div>

                  <div class="pt-3 border-t border-[#2d0f25] flex gap-2">
                    <button
                      type="button"
                      (click)="publishNow(post.id)"
                      class="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-1.5 rounded-xl text-[11px] uppercase cursor-pointer shadow transition-all flex items-center justify-center gap-1">
                      <mat-icon class="text-xs">send</mat-icon>
                      <span>Publicar Agora</span>
                    </button>

                    <button
                      type="button"
                      (click)="cancelScheduledPost(post.id)"
                      class="bg-[#1a0916] hover:bg-rose-950 text-rose-300 border border-rose-800/80 font-bold px-2.5 py-1.5 rounded-xl text-[11px] cursor-pointer">
                      Cancelar
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full py-12 text-center text-stone-400 font-serif italic text-xs space-y-2">
                  <mat-icon class="text-3xl text-stone-600">event_busy</mat-icon>
                  <div>Nenhum post agendado na fila no momento.</div>
                  <button
                    type="button"
                    (click)="activeTab.set('create')"
                    class="mt-2 text-rose-400 font-bold hover:underline cursor-pointer">
                    Clique aqui para agendar uma publicação
                  </button>
                </div>
              }
            </div>
          </div>
        }

      </div>

    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 5px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 10px; }
  `]
})
export class InstagramWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  private readonly fb = inject(FormBuilder);

  private readonly feedContainer = viewChild<ElementRef>('feedContainer');

  readonly activeTab = signal<'feed' | 'create' | 'scheduled'>('feed');
  readonly isScheduling = signal<boolean>(false);

  readonly captionTemplates: CaptionTemplate[] = [
    {
      id: 'tmpl-1',
      title: '🔥 Promoção Especial do Dia',
      icon: 'local_fire_department',
      caption: '🔥 PROMOÇÃO ESPECIAL NO BALCÃO & DELIVERY! Hoje o nosso especial do dia está com desconto exclusivo. Peça agora pelo aplicativo e receba bem quentinho!',
      hashtags: 'promododia, especial, artesanal, deliverysp, gastronomia'
    },
    {
      id: 'tmpl-2',
      title: '✨ Lançamento de Novidade',
      icon: 'stars',
      caption: '✨ NOVIDADE NO CARDÁPIO! Apresentamos a mais nova receita exclusiva preparada pela nossa equipe. Venha conferir o sabor autêntico!',
      hashtags: 'novidade, cardapionovo, novidades, gourmet, artesanal'
    },
    {
      id: 'tmpl-3',
      title: '🍹 Happy Hour & Fim de Semana',
      icon: 'local_bar',
      caption: '🍹 O FIM DE SEMANA CHEGOU! Traga os amigos para curtir nosso Happy Hour com bebidas geladas e porções especiais no balcão e salão.',
      hashtags: 'happyhour, fimdesemana, chopp, porçoes, amigos'
    },
    {
      id: 'tmpl-4',
      title: '💬 Pergunta & Engajamento',
      icon: 'forum',
      caption: '💬 Qual o seu item favorito do nosso cardápio? Comente aqui embaixo qual o seu pedido preferido!',
      hashtags: 'enquete, opiniao, clientes, gastronomia, sp'
    }
  ];

  readonly imagePresets = [
    { name: '🍔 Artisan Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80' },
    { name: '🍕 Pizza Gourmet', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80' },
    { name: '🥐 Panificação & Café', url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80' },
    { name: '🍣 Japa & Sushi', url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80' },
    { name: '🍹 Drinks & Chopp', url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80' }
  ];

  readonly postForm: FormGroup = this.fb.group({
    type: ['feed', [Validators.required]],
    image: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', [Validators.required]],
    caption: ['🔥 Promoção Especial no Balcão! Venha saborear nossos hambúrgueres artesanais preparados na hora com os melhores ingredientes selecionados.', [Validators.required]],
    hashtagsStr: ['gastronomia, artesanal, burger, delivery, sp, promo'],
    scheduleDate: ['2026-10-29'],
    scheduleTime: ['18:30']
  });

  readonly allPosts = signal<InstagramPost[]>([
    {
      id: 'post-1',
      author: 'BURGERCO_ARTISAN',
      avatar: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
      type: 'feed',
      time: 'Há 2h',
      status: 'published',
      likes: 1240,
      reach: '4.2k',
      caption: 'Protocolo de sabor iniciado! Nosso Smash Burger Artisan Trufado está com 20% OFF no pedido direto via App.',
      hashtags: ['smashburger', 'gourmet', 'artesanal', 'deliverysp'],
      commentsCount: 48,
      isLiked: true,
      comments: [
        { user: 'roberto_gourmet', text: 'Melhor burger da região! Já pedi o meu.', time: '1h atrás' },
        { user: 'ana_paulasp', text: 'Chega quentinho mesmo no delivery?', time: '30min atrás' }
      ]
    },
    {
      id: 'post-2',
      author: 'ESTRELA_SP_BAKERY',
      avatar: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=100&q=80',
      image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80',
      type: 'feed',
      time: 'Há 5h',
      status: 'published',
      likes: 850,
      reach: '2.8k',
      caption: 'Fornada nova de Croissants de Amêndoas saindo agora do forno! Venha tomar um café especial com a gente.',
      hashtags: ['padaria', 'croissant', 'cafeespecial', 'bela-vista'],
      commentsCount: 19,
      isLiked: false,
      comments: [
        { user: 'mariana_cafe', text: 'Guardem um pra mim! Chego em 10min.', time: '2h atrás' }
      ]
    },
    {
      id: 'post-sch-1',
      author: 'BURGERCO_ARTISAN',
      avatar: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      type: 'feed',
      time: 'Agendado',
      scheduledFor: 'Amanhã às 18:30',
      status: 'scheduled',
      likes: 0,
      reach: '0',
      caption: '🍹 Happy Hour 3EAT! Chopp em dobro a noite toda para pedidos no balcão e mesas.',
      hashtags: ['happyhour', 'chopp', 'cervejaartesanal', 'sp'],
      commentsCount: 0,
      isLiked: false,
      comments: []
    }
  ]);

  readonly publishedPosts = computed(() => this.allPosts().filter(p => p.status === 'published'));
  readonly scheduledPosts = computed(() => this.allPosts().filter(p => p.status === 'scheduled'));
  readonly scheduledPostsCount = computed(() => this.scheduledPosts().length);

  readonly currentTenantName = computed(() => {
    const t = this.ecosystem.tenants().find(x => x.id === this.ecosystem.currentTenantId());
    return t ? t.name.toUpperCase().replace(/\s+/g, '_') : '3EAT_STORE';
  });

  readonly currentTenantLogo = computed(() => {
    const t = this.ecosystem.tenants().find(x => x.id === this.ecosystem.currentTenantId());
    return t?.logo || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80';
  });

  constructor() {
    effect(() => {
      this.animateFeed();
    });
  }

  private animateFeed() {
    setTimeout(() => {
      const cards = this.feedContainer()?.nativeElement.querySelectorAll('.post-card');
      if (cards && cards.length > 0) {
        animate(cards, { opacity: [0, 1], y: [20, 0] }, { duration: 0.5, delay: stagger(0.1) });
      }
    });
  }

  setPostType(type: 'feed' | 'reels' | 'story') {
    this.postForm.patchValue({ type });
  }

  applyTemplate(tmpl: CaptionTemplate) {
    this.postForm.patchValue({
      caption: tmpl.caption,
      hashtagsStr: tmpl.hashtags
    });
    this.ecosystem.notify(`Modelo "${tmpl.title}" aplicado com sucesso!`, 'success');
  }

  formatHashtagsPreview(str: string): string {
    return str.split(',')
      .map(s => s.trim().replace(/^#/, ''))
      .filter(s => s.length > 0)
      .map(s => `#${s}`)
      .join(' ');
  }

  toggleLike(postId: string) {
    this.allPosts.update(posts =>
      posts.map(p => p.id === postId ? {
        ...p,
        isLiked: !p.isLiked,
        likes: p.isLiked ? p.likes - 1 : p.likes + 1
      } : p)
    );
  }

  addCommentPrompt(postId: string) {
    const text = prompt('Digite seu comentário no post:');
    if (text && text.trim()) {
      this.allPosts.update(posts =>
        posts.map(p => p.id === postId ? {
          ...p,
          commentsCount: p.commentsCount + 1,
          comments: [...p.comments, { user: 'Operador_Store', text, time: 'Agora' }]
        } : p)
      );
      this.ecosystem.notify('Comentário registrado no post!', 'success');
    }
  }

  sharePost(postId: string) {
    const link = `https://3eatcru.com/p/${this.ecosystem.currentTenantId()}/post/${postId}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(link);
    }
    this.ecosystem.notify('Link da publicação copiado para a área de transferência!', 'info');
  }

  onSavePost() {
    if (this.postForm.valid) {
      const formVal = this.postForm.value;
      const hashtags = formVal.hashtagsStr
        ? formVal.hashtagsStr.split(',').map((s: string) => s.trim().replace(/^#/, '')).filter((s: string) => s.length > 0)
        : [];

      const isSched = this.isScheduling();
      const schedTimeStr = isSched ? `${formVal.scheduleDate} às ${formVal.scheduleTime}` : undefined;

      const newPost: InstagramPost = {
        id: 'post-' + Date.now(),
        author: this.currentTenantName(),
        avatar: this.currentTenantLogo(),
        image: formVal.image,
        type: formVal.type,
        time: isSched ? 'Agendado' : 'Agora mesmo',
        scheduledFor: schedTimeStr,
        status: isSched ? 'scheduled' : 'published',
        likes: 0,
        reach: '1',
        caption: formVal.caption,
        hashtags,
        commentsCount: 0,
        isLiked: false,
        comments: []
      };

      this.allPosts.update(p => [newPost, ...p]);
      this.ecosystem.notify(
        isSched ? `Post agendado com sucesso para ${schedTimeStr}!` : 'Publicação realizada no feed do ecossistema!',
        'success'
      );

      this.activeTab.set(isSched ? 'scheduled' : 'feed');
    }
  }

  publishNow(postId: string) {
    this.allPosts.update(posts =>
      posts.map(p => p.id === postId ? {
        ...p,
        status: 'published',
        time: 'Agora mesmo'
      } : p)
    );
    this.ecosystem.notify('Post da fila publicado com sucesso no feed!', 'success');
  }

  cancelScheduledPost(postId: string) {
    if (confirm('Cancelar o agendamento desta publicação?')) {
      this.allPosts.update(posts => posts.filter(p => p.id !== postId));
      this.ecosystem.notify('Agendamento cancelado.', 'warning');
    }
  }
}
