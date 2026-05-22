import { Component, OnInit, inject, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';

import { GlossaryService } from '../core/glossary.service';
import { EntryDetail, Locale, TermSummary } from '../core/models/glossary.models';
import { UserDataService } from '../core/user-data.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  private readonly glossary = inject(GlossaryService);
  private readonly userData = inject(UserDataService);
  private currentAudio?: HTMLAudioElement;

  readonly query$ = new BehaviorSubject<string>('');
  readonly locale = this.glossary.locale;
  readonly favorites = this.userData.favorites;

  readonly expanded = signal<Record<string, boolean>>({});
  readonly entries = signal<Record<string, EntryDetail | undefined>>({});
  readonly favoritesOnly = signal(false);

  private audioManifest: { crj: Set<string>; crl: Set<string> } = {
    crj: new Set(),
    crl: new Set(),
  };
  private audioIndex: Set<string> = new Set();

  results: TermSummary[] = [];
  loading = true;

  ngOnInit(): void {
    this.glossary.audioManifest().subscribe((m) => (this.audioManifest = m));
    this.glossary.audioIndex().subscribe((idx) => (this.audioIndex = idx));
    combineLatest([
      this.query$.pipe(debounceTime(150), distinctUntilChanged()),
    ])
      .pipe(
        switchMap(([q]) => this.glossary.search(q)),
        map((rows) => rows.slice(0, 200)),
      )
      .subscribe((rows) => {
        this.results = rows;
        this.loading = false;
      });
  }

  visibleResults(): TermSummary[] {
    if (!this.favoritesOnly()) return this.results;
    const fav = this.favorites();
    return this.results.filter((t) => fav.has(t.uuid));
  }

  onSearchChange(value: string | null | undefined): void {
    this.query$.next(value ?? '');
  }

  toggle(uuid: string): void {
    const next = { ...this.expanded(), [uuid]: !this.expanded()[uuid] };
    this.expanded.set(next);
    if (next[uuid]) {
      this.userData.recordView(uuid);
      if (!this.entries()[uuid]) {
        this.glossary.getEntry(uuid).subscribe((entry) => {
          this.entries.set({ ...this.entries(), [uuid]: entry });
        });
      }
    }
  }

  toggleFavorite(event: Event, uuid: string): void {
    event.stopPropagation();
    this.userData.toggleFavorite(uuid);
  }

  isFavorite(uuid: string): boolean {
    return this.favorites().has(uuid);
  }

  toggleFavoritesFilter(): void {
    this.favoritesOnly.set(!this.favoritesOnly());
  }

  setLocale(value: Locale): void {
    this.glossary.setLocale(value).subscribe((rows) => {
      this.results = rows.slice(0, 200);
      this.expanded.set({});
    });
  }

  /** Whether any Cree translation of this term has a bundled pronunciation. */
  hasAudio(uuid: string): boolean {
    return this.audioIndex.has(uuid);
  }

  /** Build the audio URL if a recording exists for this Cree translation. */
  audioFor(term: string | null | undefined, locale: string | undefined): string | null {
    if (!term || !locale) return null;
    return this.glossary.termAudioUrl(term, locale, this.audioManifest);
  }

  playAudio(url: string): void {
    this.currentAudio?.pause();
    this.currentAudio = new Audio(url);
    this.currentAudio.play().catch(() => undefined);
  }

  trackByUuid = (_: number, t: TermSummary) => t.uuid;
}
