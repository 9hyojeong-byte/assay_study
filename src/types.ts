export interface EssayContent {
  id: string;
  title: string;
  createdAt: string; // YYYY-MM-DD string representation of creation date
  koreanSentences: string[];
  englishSentences: string[];
  memo: string;
  confidence: number; // -2, -1, 0, 1, 2 etc.
  isFavorite: boolean;
}

export type ViewMode = 'calendar' | 'list';

export interface TranslationResponse {
  title: string;
  translations: string[];
}
