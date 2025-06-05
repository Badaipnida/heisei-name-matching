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
    return 'この名前は平成時代初期に最高の人気を誇った名前です。当時、多くの親が子供に現代的で明るい未来を象徴する名前をつけたいと考えていました。';
  }
  if (rank <= 200) {
    return '平成時代を代表するトレンディな名前です。新しい時代の希望と期待を込めてつけられた名前です。';
  }
  if (rank <= 300) {
    return '平成時代の初・中期に愛された名前です。伝統と現代性を絶妙に調和させた洗練された名前です。';
  }
  if (rank <= 400) {
    return '平成時代の安定感のある名前です。変化の時代にも変わらず愛された名前です。';
  }

  // 昭和와 平成 시대에 걸쳐 사용된 이름 (401-700위)
  if (rank <= 500) {
    return '昭和時代後期から平成時代まで続いてきたクラシックな名前です。時代を超えた魅力を持つ名前です。';
  }
  if (rank <= 600) {
    return '昭和時代の情緒が込められた名前でありながら、平成時代にも着実に愛されました。二つの時代の良い特徴を兼ね備えた名前です。';
  }
  if (rank <= 700) {
    return '昭和時代から続く伝統的な名前です。平成時代にもその価値が認められた素晴らしい名前です。';
  }

  // 세 시대를 아우르는 이름 (701-1000위)
  if (rank <= 800) {
    return '昭和、平成、そして令和まで続く時代を貫く名前です。時が経っても変わらない深い意味を持つ名前です。';
  }
  if (rank <= 900) {
    return '三つの時代を通じて着実に愛されてきた伝統的な名前です。長い年月にわたってその価値が認められた意味のある名前です。';
  }
  return '時代を超えて愛されてきた伝統的な名前です。その深い意味と歴史が、これからも受け継がれていくことでしょう。';
}

// 기본적인 한자 정보 데이터
const KANJI_INFO: { [key: string]: KanjiInfo } = {
  '龍': { kanji: '龍', meaning: '竜、神聖な存在', commonUse: '力と吉祥を象徴する漢字' },
  '竜': { kanji: '竜', meaning: '竜、神聖な存在', commonUse: '龍の簡体字' },
  '太': { kanji: '太', meaning: '大きい、非常に', commonUse: '健康で立派であることを意味' },
  '郎': { kanji: '郎', meaning: '男性、若者', commonUse: '男性の名前に頻繁に使用' },
  '翔': { kanji: '翔', meaning: '飛ぶ、飛翔する', commonUse: '高く飛び立つことを象徴' },
  '大': { kanji: '大', meaning: '大きい、偉大', commonUse: '大きな夢と抱負を象徴' },
  '輔': { kanji: '輔', meaning: '助ける、補佐する', commonUse: '周囲を助けながら生きる人を意味' },
  '介': { kanji: '介', meaning: '間、介入する', commonUse: '調停者、調和の取れた人を意味' },
  '樹': { kanji: '樹', meaning: '木、立てる', commonUse: 'しっかりと成長する木のように育つことを願う意味' },
  // 必要な漢字情報を追加
};

// 이름 유래 정보 생성
function getNameEtymology(name: string): NameEtymology | undefined {
  const nameKanjis = name.split('').map(kanji => KANJI_INFO[kanji]).filter(Boolean);
  
  if (nameKanjis.length === 0) return undefined;

  const etymology: NameEtymology = {
    nameKanjis,
    commonUsage: `${name}という名前は${nameKanjis.map(k => k.meaning).join('、')}の意味を持っています。`
  };

  // 특별한 이름 패턴에 대한 문화적 설명 추가
  if (name.endsWith('太郎')) {
    etymology.culturalNote = '〇太郎(たろう)は日本の伝統的な命名法で、特に長男によく使用されました。';
  } else if (name.endsWith('輔') || name.endsWith('介')) {
    etymology.culturalNote = '〇輔/介(すけ)で終わる名前は、周囲を助け調和を成す人になることを願う意味を持っています。';
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
  
  // 데이터베이스에 없는 이름인 경우
  if (!koreanNameData) {
    // 1-1000위 사이의 랜덤한 순위 선택
    const randomRank = Math.floor(Math.random() * 1000) + 1;
    const japaneseNameData = japaneseData.find(data => data.rank === randomRank);
    
    if (!japaneseNameData) {
      return null;
    }

    // 이름 유래 정보 추가
    const etymology = getNameEtymology(japaneseNameData.name);

    return {
      koreanName: {
        name: koreanName,
        rank: 0,
        birthCount: 0,
        isRandomMatch: true
      },
      japaneseName: japaneseNameData as NameData & { kana: string },
      gender,
      etymology,
    };
  }

  // 기존 로직: 같은 순위의 일본 이름 찾기
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