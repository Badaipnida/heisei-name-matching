export interface NameData {
  rank: number;
  name: string;
  birthCount: number;
  kana?: string; // Optional for Korean names, required for Japanese names
}

export type Gender = 'male' | 'female';

export interface NameMatch {
  koreanName: NameData;
  japaneseName: NameData & { kana: string }; // Japanese names must have kana
  gender: Gender;
} 