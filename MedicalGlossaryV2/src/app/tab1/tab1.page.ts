import { Component, OnInit, inject, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs';

import { GlossaryService } from '../core/glossary.service';
import { EntryDetail, Locale, TermSummary } from '../core/models/glossary.models';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements OnInit {
  private readonly glossary = inject(GlossaryService);

  readonly query$ = new BehaviorSubject<string>('');
  readonly locale = this.glossary.locale;

  readonly expanded = signal<Record<string, boolean>>({});
  readonly entries = signal<Record<string, EntryDetail | undefined>>({});

  results: TermSummary[] = [];
  loading = true;

  ngOnInit(): void {
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

  onSearchChange(value: string | null | undefined): void {
    this.query$.next(value ?? '');
  }

  toggle(uuid: string): void {
    const next = { ...this.expanded(), [uuid]: !this.expanded()[uuid] };
    this.expanded.set(next);
    if (next[uuid] && !this.entries()[uuid]) {
      this.glossary.getEntry(uuid).subscribe((entry) => {
        this.entries.set({ ...this.entries(), [uuid]: entry });
      });
    }
  }

  setLocale(value: Locale): void {
    this.glossary.setLocale(value).subscribe((rows) => {
      this.results = rows.slice(0, 200);
      this.expanded.set({});
    });
  }

  trackByUuid = (_: number, t: TermSummary) => t.uuid;
}
