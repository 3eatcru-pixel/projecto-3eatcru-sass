import { ChangeDetectionStrategy, Component, inject, ElementRef, viewChild, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EcosystemService } from '../../services/ecosystem.service';
import { MemoNote } from '../../models/ecosystem.model';
import { animate, stagger } from 'motion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notes-window',
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="flex flex-col h-full space-y-6 bg-slate-950/20 p-2">
      <!-- Notes Tactical Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-sm shrink-0">
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-2xl bg-amber-600/10 text-amber-500 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <mat-icon class="text-2xl">description</mat-icon>
          </div>
          <div>
            <h2 class="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Field Intelligence</h2>
            <div class="flex items-center gap-3 mt-1">
              <h1 class="text-lg font-black text-white uppercase tracking-tight">Memos & Protocolos</h1>
              <span class="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest">Internal Only</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          (click)="createNewNote()"
          class="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-amber-400/20 transition-all shadow-lg hover:shadow-amber-600/20 flex items-center gap-2">
          <mat-icon class="text-sm">add_note</mat-icon> Gerar Novo Memo
        </button>
      </div>

      <div #notesGrid class="flex-1 overflow-y-auto custom-scrollbar pb-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (note of ecosystem.notes(); track note.id) {
            <div
              class="note-card relative min-h-[220px] p-6 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02] flex flex-col shadow-2xl overflow-hidden group"
              [class]="getNoteBg(note.color)">
              
              <!-- Tactical Scanline Overlay -->
              <div class="absolute inset-0 pointer-events-none opacity-[0.05] bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px]"></div>

              <!-- Top Controls -->
              <div class="flex justify-between items-start mb-4 relative z-10">
                <input
                  #titleInput
                  type="text"
                  [value]="note.title"
                  (input)="updateNote(note.id, { title: titleInput.value })"
                  class="bg-transparent border-none text-[11px] font-black uppercase tracking-widest focus:outline-none w-full placeholder:opacity-30"
                  placeholder="ID PROTOCOLO..."
                />
                <button
                  type="button"
                  (click)="ecosystem.deleteNote(note.id)"
                  class="p-2 rounded-xl hover:bg-black/10 transition-colors">
                  <mat-icon class="text-sm">delete_forever</mat-icon>
                </button>
              </div>

              <!-- Content Area -->
              <textarea
                #contentInput
                [value]="note.content"
                (input)="updateNote(note.id, { content: contentInput.value })"
                class="flex-1 bg-transparent border-none text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed resize-none focus:outline-none placeholder:opacity-20"
                placeholder="REGISTRAR OBSERVAÇÃO TÉCNICA...">
              </textarea>

              <!-- Footer Actions -->
              <div class="mt-6 pt-4 border-t border-black/5 flex items-center justify-between relative z-10">
                <span class="text-[8px] font-black uppercase tracking-widest opacity-40">{{ note.updatedAt }}</span>
                <div class="flex gap-1.5 p-1 bg-black/5 rounded-full">
                  @for (c of colors; track c) {
                    <button
                      type="button"
                      (click)="updateNote(note.id, { color: c })"
                      [class]="getCircleBg(c)"
                      [class.scale-125]="note.color === c"
                      [class.shadow-lg]="note.color === c"
                      class="w-4 h-4 rounded-full border border-black/10 transition-all hover:scale-110">
                    </button>
                  }
                </div>
              </div>
            </div>
          } @empty {
            <div class="col-span-full h-80 flex flex-col items-center justify-center text-slate-700 space-y-4 opacity-40">
              <div class="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center border border-white/5 shadow-inner">
                <mat-icon class="text-5xl">note_stack</mat-icon>
              </div>
              <div class="text-center">
                <p class="text-[10px] font-black uppercase tracking-widest">Base de Dados Vazia</p>
                <p class="text-[9px] uppercase mt-1">Inicie um novo protocolo para persistir informações operacionais</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
    .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
    .note-card {
      transform-origin: center center;
    }
  `]
})
export class NotesWindowComponent {
  readonly ecosystem = inject(EcosystemService);
  
  private readonly notesGrid = viewChild<ElementRef>('notesGrid');

  readonly colors: MemoNote['color'][] = ['yellow', 'blue', 'green', 'red', 'purple'];

  constructor() {
    effect(() => {
      // Animate cards entrance
      this.ecosystem.notes();
      this.animateCards();
    });
  }

  private animateCards() {
    setTimeout(() => {
      const cards = this.notesGrid()?.nativeElement.querySelectorAll('.note-card');
      if (cards && cards.length > 0) {
        animate(cards, { opacity: [0, 1], scale: [0.95, 1], rotate: [2, 0] }, { duration: 0.5, delay: stagger(0.05) });
      }
    });
  }

  createNewNote() {
    this.ecosystem.addNote('MEMO-TX-' + Math.floor(Math.random() * 900), '', 'yellow');
  }

  updateNote(id: string, updates: Partial<MemoNote>) {
    this.ecosystem.notes.update(notes => 
      notes.map(n => n.id === id ? { ...n, ...updates } : n)
    );
  }

  getNoteBg(color: MemoNote['color']) {
    switch (color) {
      case 'yellow': return 'bg-amber-400 border-amber-500 text-amber-950';
      case 'blue': return 'bg-sky-400 border-sky-500 text-sky-950';
      case 'green': return 'bg-emerald-400 border-emerald-500 text-emerald-950';
      case 'red': return 'bg-rose-400 border-rose-500 text-rose-950';
      case 'purple': return 'bg-purple-400 border-purple-500 text-purple-950';
      default: return 'bg-slate-300 border-slate-400 text-slate-900';
    }
  }

  getCircleBg(color: MemoNote['color']) {
    switch (color) {
      case 'yellow': return 'bg-amber-600';
      case 'blue': return 'bg-sky-600';
      case 'green': return 'bg-emerald-600';
      case 'red': return 'bg-rose-600';
      case 'purple': return 'bg-purple-600';
      default: return 'bg-slate-500';
    }
  }
}
