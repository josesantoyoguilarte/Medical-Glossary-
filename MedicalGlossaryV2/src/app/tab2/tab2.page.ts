import { Component, inject } from '@angular/core';

import { GlossaryService } from '../core/glossary.service';

interface Region {
  label: string;
  /** Percentage values (0..100) of the underlying 26.png image. */
  x: number;
  y: number;
  w: number;
  h: number;
  audio: string; // file under data/audio/crl/
}

/**
 * Body diagram with clickable regions. Modernised replacement for the legacy
 * jQuery `rwdImageMaps` + HTML `<map>` implementation: percentage-positioned
 * <button> overlays scale responsively with the underlying image and remain
 * fully accessible (keyboard focus, aria-label, no jQuery).
 */
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page {
  private readonly glossary = inject(GlossaryService);
  private current?: HTMLAudioElement;

  /** Original 26.png is 1206 × 1525 (see legacy diagram-26.html coords). */
  private static readonly IMG_W = 1206;
  private static readonly IMG_H = 1525;

  readonly imageUrl = this.glossary.imageUrl('eng/26.png');

  readonly regions: Region[] = [
    this.toPct({ label: 'liver',           x: 151, y: 81,   w: 448, h: 219,  audio: 'uskun.mp3' }),
    this.toPct({ label: 'gallbladder',     x: 73,  y: 320,  w: 448, h: 180,  audio: 'wiisipui.mp3' }),
    this.toPct({ label: 'large intestine', x: 51,  y: 520,  w: 334, h: 323,  audio: 'utichishiih.mp3' }),
    this.toPct({ label: 'small intestine', x: 52,  y: 900,  w: 343, h: 547,  audio: 'utichishiih.mp3' }),
    this.toPct({ label: 'esophagus',       x: 800, y: 95,   w: 400, h: 83,   audio: 'ukuhtishkwaayaapii.mp3' }),
    this.toPct({ label: 'stomach',         x: 800, y: 300,  w: 400, h: 150,  audio: 'uchisch.mp3' }),
    this.toPct({ label: 'bile duct',       x: 800, y: 550,  w: 406, h: 150,  audio: 'utiyi.mp3' }),
    this.toPct({ label: 'rectum',          x: 800, y: 750,  w: 400, h: 150,  audio: 'uchisch.mp3' }),
    this.toPct({ label: 'anus',            x: 800, y: 950,  w: 400, h: 250,  audio: 'uchisch.mp3' }),
  ];

  play(region: Region): void {
    this.current?.pause();
    const url = this.glossary.audioUrl(region.audio, 'crl');
    this.current = new Audio(url);
    this.current.play().catch(() => undefined);
  }

  trackByLabel = (_: number, r: Region) => r.label;

  private toPct(r: { label: string; x: number; y: number; w: number; h: number; audio: string }): Region {
    return {
      label: r.label,
      audio: r.audio,
      x: (r.x / Tab2Page.IMG_W) * 100,
      y: (r.y / Tab2Page.IMG_H) * 100,
      w: (r.w / Tab2Page.IMG_W) * 100,
      h: (r.h / Tab2Page.IMG_H) * 100,
    };
  }
}
