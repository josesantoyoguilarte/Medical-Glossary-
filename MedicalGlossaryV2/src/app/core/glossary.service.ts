import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import Fuse, { type IFuseOptions } from 'fuse.js';
import { Observable, map, of, shareReplay, switchMap } from 'rxjs';

import {
  ConversationLine,
  EntryDetail,
  Locale,
  TermSummary,
} from './models/glossary.models';

/**
 * Single source of truth for glossary data. Loads JSON from `assets/data/`
 * (mirrored from the legacy Cordova app) and exposes typed, cached observables
 * plus a Fuse.js-powered full-text search across all locales.
 */
@Injectable({ providedIn: 'root' })
export class GlossaryService {
  private readonly http = inject(HttpClient);

  /** UI/content locale, as a reactive signal. */
  readonly locale = signal<Locale>('eng');

  private readonly base = 'assets/data';

  // ---- cached HTTP responses (one network call per resource) -------------

  private readonly categories$ = this.http
    .get<Record<string, Record<string, string>>>(`${this.base}/categories.json`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly tree$ = this.http
    .get<unknown>(`${this.base}/tree-map.json`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  private readonly termsCache = new Map<Locale, Observable<TermSummary[]>>();
  private readonly entryCache = new Map<string, Observable<EntryDetail>>();

  // ---- categories / tree -------------------------------------------------

  getCategories(): Observable<Record<string, Record<string, string>>> {
    return this.categories$;
  }

  getCategoryTree(): Observable<unknown> {
    return this.tree$;
  }

  // ---- terms list (per locale) -------------------------------------------

  getTerms(locale: Locale = this.locale()): Observable<TermSummary[]> {
    let cached = this.termsCache.get(locale);
    if (!cached) {
      cached = this.http
        .get<Array<{ Term: { uuid: string }; TermTranslation: TermSummary }>>(
          `${this.base}/${locale}/terms.json`,
        )
        .pipe(
          map((rows) =>
            rows.map<TermSummary>((row) => ({
              uuid: row.Term.uuid,
              term: row.TermTranslation.term,
              definition: row.TermTranslation.definition ?? '',
              locale: row.TermTranslation.locale as Locale,
            })),
          ),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      this.termsCache.set(locale, cached);
    }
    return cached;
  }

  // ---- full entry (all locales for one uuid) -----------------------------

  getEntry(uuid: string): Observable<EntryDetail> {
    let cached = this.entryCache.get(uuid);
    if (!cached) {
      cached = this.http
        .get<EntryDetail>(`${this.base}/entries/${uuid}.json`)
        .pipe(shareReplay({ bufferSize: 1, refCount: false }));
      this.entryCache.set(uuid, cached);
    }
    return cached;
  }

  // ---- search ------------------------------------------------------------

  /**
   * Fuzzy, diacritic-insensitive search across `term` and `definition` for
   * the current locale. Returns an empty array for an empty query.
   */
  search(query: string, locale: Locale = this.locale()): Observable<TermSummary[]> {
    const q = query.trim();
    if (!q) return this.getTerms(locale);
    return this.getTerms(locale).pipe(
      map((terms) => {
        const fuse = new Fuse<TermSummary>(terms, FUSE_OPTIONS);
        return fuse.search(q).map((r) => r.item);
      }),
    );
  }

  // ---- conversations -----------------------------------------------------

  getConversation(
    name = 'McGill_Pain_Questionnaire',
    locale: Locale = this.locale(),
  ): Observable<ConversationLine[]> {
    return this.http
      .get<Record<string, { Translations: ConversationLine['translations'] }>>(
        `${this.base}/conversation/${locale}/${name}.json`,
      )
      .pipe(
        map((dict) =>
          Object.entries(dict).map(([id, value]) => ({
            id,
            translations: value.Translations ?? [],
          })),
        ),
      );
  }

  // ---- helpers -----------------------------------------------------------

  /** Resource URL for an audio file referenced by a conversation/entry. */
  audioUrl(filename: string): string {
    return `${this.base}/audio/${filename}`;
  }

  /** Resource URL for a diagram/image asset. */
  imageUrl(filename: string): string {
    return `${this.base}/images/${filename}`;
  }

  /** Convenience: switch locale and return the matching terms stream. */
  setLocale(locale: Locale): Observable<TermSummary[]> {
    this.locale.set(locale);
    return of(locale).pipe(switchMap((l) => this.getTerms(l)));
  }
}

const FUSE_OPTIONS: IFuseOptions<TermSummary> = {
  keys: [
    { name: 'term', weight: 0.7 },
    { name: 'definition', weight: 0.3 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  ignoreDiacritics: true,
  minMatchCharLength: 2,
};
