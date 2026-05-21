/**
 * Domain models for the Medical Glossary, derived from the JSON files under
 * `src/assets/data/` (originally produced by the legacy Ionic 1 app).
 */

/** Supported content locales used in the JSON data files. */
export type Locale = 'eng' | 'fra' | 'crj' | 'crl';

/** Lightweight term entry used in the searchable glossary list. */
export interface TermSummary {
  uuid: string;
  term: string;
  definition: string;
  locale: Locale;
}

/** One translation/variant of a term (English, French, Cree dialects, ...). */
export interface TermTranslation {
  uuid: string;
  term: string;
  term_syllabics: string | null;
  locale: Locale | string;
  definition: string | null;
  definition_syllabics: string | null;
  source: string | null;
  Dialect?: string;
  Language?: string;
}

/** A full term entry with all translations + linked media/examples. */
export interface EntryDetail {
  Term: {
    uuid: string;
    id?: string;
    public_note_en?: string | null;
  };
  TermTranslation: TermTranslation[];
  Category: Array<{ uuid: string; slug?: string }>;
  Example: unknown[];
  Media: Array<{ filename?: string; type?: string } | string>;
}

/** One row in a conversation script (e.g. McGill Pain Questionnaire). */
export interface ConversationLine {
  id: string;
  translations: Array<{
    locale: Locale | string;
    text: string;
    media?: string[];
  }>;
}
