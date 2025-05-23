export interface NameData {
  rank: number;
  name: string;
  birthCount: number;
  kana?: string; // Optional for Korean names, required for Japanese names
}

export interface KanjiInfo {
  kanji: string;
  meaning: string;
  commonUse?: string;
}

export interface NameEtymology {
  nameKanjis: KanjiInfo[];
  commonUsage?: string;
  culturalNote?: string;
}

export type Gender = 'male' | 'female';

export interface NameMatch {
  koreanName: NameData;
  japaneseName: NameData & { kana: string }; // Japanese names must have kana
  gender: Gender;
  etymology?: NameEtymology;
} 