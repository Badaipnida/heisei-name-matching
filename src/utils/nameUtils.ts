import { NameData, Gender, NameMatch } from '../types/name';

// 캐시된 데이터를 저장할 객체
let nameDataCache: {
  koreanMale?: NameData[];
  koreanFemale?: NameData[];
  japaneseMale?: NameData[];
  japaneseFemale?: NameData[];
} = {};

// 데이터 초기화 함수
export async function initializeNameData() {
  try {
    const response = await fetch('/api/names');
    if (!response.ok) {
      throw new Error('Failed to fetch name data');
    }
    
    const data = await response.json();
    nameDataCache = data;
  } catch (error) {
    console.error('Error initializing name data:', error);
    throw error;
  }
}

// 한글 이름으로 매칭된 일본 이름 찾기
export function findMatchingName(koreanName: string, gender: Gender): NameMatch | null {
  const koreanData = gender === 'male' ? nameDataCache.koreanMale : nameDataCache.koreanFemale;
  const japaneseData = gender === 'male' ? nameDataCache.japaneseMale : nameDataCache.japaneseFemale;

  if (!koreanData || !japaneseData) {
    throw new Error('Name data not initialized');
  }

  const koreanNameData = koreanData.find(data => data.name === koreanName);
  if (!koreanNameData) {
    return null;
  }

  // 순위 기반 매칭: 같은 순위의 일본 이름 찾기
  const japaneseNameData = japaneseData.find(data => data.rank === koreanNameData.rank);
  if (!japaneseNameData) {
    return null;
  }

  return {
    koreanName: koreanNameData,
    japaneseName: japaneseNameData as NameData & { kana: string },
    gender,
  };
}

// 모든 한글 이름 목록 가져오기
export function getKoreanNames(gender: Gender): string[] {
  const data = gender === 'male' ? nameDataCache.koreanMale : nameDataCache.koreanFemale;
  if (!data) {
    throw new Error('Name data not initialized');
  }
  return data.map(item => item.name);
}

// 데이터가 초기화되었는지 확인
export function isDataInitialized(): boolean {
  return !!(
    nameDataCache.koreanMale &&
    nameDataCache.koreanFemale &&
    nameDataCache.japaneseMale &&
    nameDataCache.japaneseFemale
  );
} 