import { NameData, Gender, NameMatch, KanjiInfo, NameEtymology } from '../types/name';

// 순위별 이모지 매핑
export function getRankEmoji(rank: number, gender: Gender): string {
  if (rank <= 100) return gender === 'male' ? '👶' : '👧';
  if (rank <= 200) return gender === 'male' ? '👦' : '🧒';
  if (rank <= 300) return gender === 'male' ? '🧑' : '👩';
  if (rank <= 400) return gender === 'male' ? '👨' : '🧑';
  if (rank <= 500) return gender === 'male' ? '🧑‍🦱' : '👩‍🦱';
  if (rank <= 600) return gender === 'male' ? '👨‍🦰' : '🧑‍🦰';
  if (rank <= 700) return gender === 'male' ? '👱' : '👱‍♀️';
  if (rank <= 800) return gender === 'male' ? '🧔' : '🧔‍♀️';
  if (rank <= 900) return gender === 'male' ? '🧓' : '👵';
  return gender === 'male' ? '👨‍🦳' : '🧑‍🦳';
}

// 순위별 코멘트
export function getRankComment(rank: number): string {
  // 平成 시대 인기 이름 (1-400위)
  if (rank <= 100) {
    return '이 이름은 平成 시대 초기에 최고의 인기를 누린 이름이에요. 당시 많은 부모님들이 자녀에게 현대적이고 밝은 미래를 상징하는 이름을 지어주고자 했답니다.';
  }
  if (rank <= 200) {
    return '平成 시대를 대표하는 트렌디한 이름이에요. 새로운 시대의 희망과 기대를 담아 지어진 이름이랍니다.';
  }
  if (rank <= 300) {
    return '平成 시대 초중반에 사랑받은 이름이에요. 전통과 현대성을 절묘하게 조화시킨 세련된 이름이죠.';
  }
  if (rank <= 400) {
    return '平成 시대의 안정감 있는 이름이에요. 변화의 시기에도 변함없이 사랑받은 이름이랍니다.';
  }

  // 昭和와 平成 시대에 걸쳐 사용된 이름 (401-700위)
  if (rank <= 500) {
    return '昭和 시대 후반부터 平成 시대까지 이어져 온 클래식한 이름이에요. 시대를 초월한 매력을 가진 이름이죠.';
  }
  if (rank <= 600) {
    return '昭和 시대의 정서가 담긴 이름이면서도 平成 시대에도 꾸준히 사랑받았어요. 두 시대의 좋은 특징을 모두 가진 이름이랍니다.';
  }
  if (rank <= 700) {
    return '昭和 시대부터 이어져 온 전통성 있는 이름이에요. 平成 시대에도 그 가치를 인정받은 멋진 이름이죠.';
  }

  // 세 시대를 아우르는 이름 (701-1000위)
  if (rank <= 800) {
    return '昭和, 平成, 그리고 令和까지 이어지는 시대를 관통하는 이름이에요. 시간이 흘러도 변치 않는 깊은 의미를 가진 이름이랍니다.';
  }
  if (rank <= 900) {
    return '세 시대를 거치며 꾸준히 사랑받아온 전통적인 이름이에요. 오랜 세월 동안 그 가치를 인정받은 의미 있는 이름이죠.';
  }
  return '昭和에서 令和까지, 일본의 현대사를 관통하는 역사적인 이름이에요. 시대가 변해도 변치 않는 깊은 의미를 담고 있답니다.';
}

// 기본적인 한자 정보 데이터
const KANJI_INFO: { [key: string]: KanjiInfo } = {
  '龍': { kanji: '龍', meaning: '용, 신령스러운 존재', commonUse: '힘과 길상을 상징하는 한자' },
  '竜': { kanji: '竜', meaning: '용, 신령스러운 존재', commonUse: '龍의 간체자' },
  '太': { kanji: '太', meaning: '크다, 매우', commonUse: '건강하고 훌륭함을 의미' },
  '郎': { kanji: '郎', meaning: '남자, 젊은이', commonUse: '남자 이름에 자주 사용' },
  '翔': { kanji: '翔', meaning: '날다, 비상하다', commonUse: '높이 날아오름을 상징' },
  '大': { kanji: '大', meaning: '크다, 위대하다', commonUse: '큰 꿈과 포부를 상징' },
  '輔': { kanji: '輔', meaning: '돕다, 보좌하다', commonUse: '주변을 도우며 살아가는 사람을 의미' },
  '介': { kanji: '介', meaning: '사이, 개입하다', commonUse: '중재자, 조화로운 사람을 의미' },
  '樹': { kanji: '樹', meaning: '나무, 세우다', commonUse: '굳건하게 자라나는 나무처럼 성장하기를 바라는 의미' },
  // 필요한 한자 정보 추가
};

// 이름 유래 정보 생성
function getNameEtymology(name: string): NameEtymology | undefined {
  const nameKanjis = name.split('').map(kanji => KANJI_INFO[kanji]).filter(Boolean);
  
  if (nameKanjis.length === 0) return undefined;

  const etymology: NameEtymology = {
    nameKanjis,
    commonUsage: `${name}라는 이름은 ${nameKanjis.map(k => k.meaning).join(', ')}의 의미를 담고 있습니다.`
  };

  // 특별한 이름 패턴에 대한 문화적 설명 추가
  if (name.endsWith('太郎')) {
    etymology.culturalNote = '〇太郎(たろう)는 일본의 전통적인 작명법으로, 특히 장남에게 자주 사용되었습니다.';
  } else if (name.endsWith('輔') || name.endsWith('介')) {
    etymology.culturalNote = '〇輔/介(すけ)로 끝나는 이름은 주변을 돕고 조화를 이루는 사람이 되기를 바라는 의미를 담고 있습니다.';
  }

  return etymology;
}

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

  // 이름 유래 정보 추가
  const etymology = getNameEtymology(japaneseNameData.name);

  return {
    koreanName: koreanNameData,
    japaneseName: japaneseNameData as NameData & { kana: string },
    gender,
    etymology,
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