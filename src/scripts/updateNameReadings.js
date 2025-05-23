const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// 한자-카타카나 매핑을 저장할 객체
const kanjiReadings = new Map();
let commonReadings = {};

// 파일 경로
const KANJIDIC_PATH = path.join(__dirname, '../data/kanjidic2.xml');
const COMMON_READINGS_PATH = path.join(__dirname, '../data/common_readings.json');
const MALE_NAMES_PATH = path.join(__dirname, '../data/japanese_male_names.csv');
const FEMALE_NAMES_PATH = path.join(__dirname, '../data/japanese_female_names.csv');

// 자주 사용되는 이름 패턴
const COMMON_NAME_PATTERNS = {
  '太郎': 'タロウ',
  '次郎': 'ジロウ',
  '三郎': 'サブロウ',
  '四郎': 'シロウ',
  '五郎': 'ゴロウ',
  '一郎': 'イチロウ',
  '大輔': 'ダイスケ',
  '健一': 'ケンイチ',
  '和夫': 'カズオ',
  '裕子': 'ユウコ',
  '恵子': 'ケイコ',
  '洋子': 'ヨウコ'
};

// e-Stat 데이터 로드
function loadCommonReadings() {
  try {
    if (fs.existsSync(COMMON_READINGS_PATH)) {
      commonReadings = JSON.parse(fs.readFileSync(COMMON_READINGS_PATH, 'utf8'));
      console.log('e-Stat 이름 데이터 로드 완료');
      return true;
    }
  } catch (error) {
    console.error('e-Stat 이름 데이터 로드 실패:', error);
  }
  return false;
}

// 인명용 한자 읽기 추출
async function extractNameReadings() {
  try {
    const xmlData = fs.readFileSync(KANJIDIC_PATH, 'utf8');
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlData);

    // 각 한자에 대해 처리
    result.kanjidic2.character.forEach(char => {
      const kanji = char.literal[0];
      const readings = char.reading_meaning?.[0]?.rmgroup?.[0]?.reading || [];
      
      // 읽기 타입별로 분류
      const nanori = readings
        .filter(r => r.$.r_type === 'nanori')
        .map(r => r._);
      
      const onYomi = readings
        .filter(r => r.$.r_type === 'ja_on')
        .map(r => r._);
        
      const kunYomi = readings
        .filter(r => r.$.r_type === 'ja_kun')
        .map(r => r._)
        .map(r => r.split('.')[0]); // 활용형 제거
      
      // 우선순위: 인명용 읽기 > 음독 > 훈독
      const allReadings = [...nanori, ...onYomi, ...kunYomi];
      
      if (allReadings.length > 0) {
        kanjiReadings.set(kanji, allReadings);
      }
    });

    console.log('한자 읽기 데이터 추출 완료');
    return true;
  } catch (error) {
    console.error('한자 읽기 데이터 추출 실패:', error);
    return false;
  }
}

// 이름의 읽기 추출
function getNameReading(name) {
  // 1. 자주 사용되는 이름 패턴 확인
  if (COMMON_NAME_PATTERNS[name]) {
    return COMMON_NAME_PATTERNS[name];
  }

  // 2. e-Stat 데이터에서 전체 이름 매칭 확인
  if (commonReadings[name]) {
    return commonReadings[name];
  }

  // 3. 각 한자별로 처리
  const nameKanji = name.split('');
  const readings = nameKanji.map(kanji => {
    // e-Stat 데이터에서 개별 한자 확인
    if (commonReadings[kanji]) {
      return commonReadings[kanji];
    }
    // KANJIDIC 데이터에서 확인
    const kanjiReadingList = kanjiReadings.get(kanji);
    return kanjiReadingList ? kanjiReadingList[0] : null;
  });

  // 모든 한자의 읽기를 찾은 경우에만 결합
  return readings.every(r => r) ? readings.join('') : null;
}

// CSV 파일 업데이트
async function updateNameReadings(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const header = lines[0];
    const updatedLines = [header];

    // 헤더를 제외한 각 줄 처리
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const [rank, name, birthCount, kana] = lines[i].split(',');
      
      // 기존 카타카나가 있고 유효해 보이면 유지
      if (kana && kana.trim() && /^[ァ-ヶー]+$/.test(kana.trim())) {
        updatedLines.push(lines[i]);
        continue;
      }

      const newKana = getNameReading(name) || kana;
      updatedLines.push([rank, name, birthCount, newKana].join(','));
    }

    // 파일 저장
    fs.writeFileSync(filePath, updatedLines.join('\n'));
    console.log(`${filePath} 업데이트 완료`);
    return true;
  } catch (error) {
    console.error(`${filePath} 업데이트 실패:`, error);
    return false;
  }
}

// 메인 실행 함수
async function main() {
  console.log('한자 이름 읽기 업데이트 시작...');
  
  // xml2js 패키지 설치 확인
  try {
    require('xml2js');
  } catch (error) {
    console.log('xml2js 패키지 설치 중...');
    require('child_process').execSync('npm install xml2js');
  }

  // e-Stat 데이터 로드
  loadCommonReadings();

  // 한자 읽기 데이터 추출
  const extractSuccess = await extractNameReadings();
  if (!extractSuccess) {
    console.error('한자 읽기 데이터 추출 실패');
    return;
  }

  // 남성/여성 이름 CSV 파일 업데이트
  await updateNameReadings(MALE_NAMES_PATH);
  await updateNameReadings(FEMALE_NAMES_PATH);
  
  console.log('모든 처리 완료!');
}

main(); 