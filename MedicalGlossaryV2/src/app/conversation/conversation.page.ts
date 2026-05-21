import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { GlossaryService } from '../core/glossary.service';
import { ConversationLine } from '../core/models/glossary.models';

/**
 * Conversation walkthrough (currently the McGill Pain Questionnaire). Renders
 * each question with all translations side-by-side and plays the associated
 * Cree audio clip on demand. Standalone component so it can be lazy-loaded
 * from any route.
 */
@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab3"></ion-back-button>
        </ion-buttons>
        <ion-title>Conversation</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-list>
        <ng-container *ngIf="!loading; else loadingTpl">
          <ion-item-group *ngFor="let line of lines">
            <ion-item-divider color="light">
              <ion-label>{{ english(line) }}</ion-label>
            </ion-item-divider>
            <ion-item *ngFor="let tr of line.translations" lines="full">
              <ion-label class="ion-text-wrap">
                <h3>
                  <ion-badge color="medium">{{ tr.locale }}</ion-badge>
                  {{ tr.text }}
                </h3>
              </ion-label>
              <ion-button
                *ngIf="tr.media?.length"
                fill="clear"
                slot="end"
                (click)="play(tr.media![0], tr.locale)"
                aria-label="Play audio">
                <ion-icon name="play-circle-outline" slot="icon-only"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-item-group>
        </ng-container>

        <ng-template #loadingTpl>
          <ion-item lines="none">
            <ion-spinner name="dots"></ion-spinner>
            <ion-label class="ion-margin-start">Loading conversation…</ion-label>
          </ion-item>
        </ng-template>
      </ion-list>
    </ion-content>
  `,
})
export class ConversationPage implements OnInit {
  private readonly glossary = inject(GlossaryService);
  private current?: HTMLAudioElement;

  lines: ConversationLine[] = [];
  loading = true;

  ngOnInit(): void {
    // English source file ships the full multi-locale Translations list.
    this.glossary.getConversation('McGill_Pain_Questionnaire', 'eng').subscribe((rows) => {
      this.lines = rows;
      this.loading = false;
    });
  }

  english(line: ConversationLine): string {
    return line.translations.find((t) => t.locale === 'eng')?.text ?? '';
  }

  play(filename: string, locale: string): void {
    this.current?.pause();
    this.current = new Audio(this.glossary.conversationAudioUrl(filename, locale));
    this.current.play().catch(() => undefined);
  }
}
