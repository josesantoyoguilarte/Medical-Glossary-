import { Component, inject } from '@angular/core';

import { GlossaryService } from '../core/glossary.service';
import { Locale } from '../core/models/glossary.models';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  private readonly glossary = inject(GlossaryService);

  readonly locale = this.glossary.locale;

  setLocale(value: Locale): void {
    this.glossary.setLocale(value).subscribe();
  }
}
