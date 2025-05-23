const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// 이름-카타카나 매핑을 저장할 객체
const nameReadings = new Map();

// e-Stat 데이터 파일 경로
const ESTAT_PATH = path.join(__dirname, '../data/estat_names.csv');
const COMMON_READINGS_PATH = path.join(__dirname, '../data/common_readings.json');

// e-Stat CSV 파일에서 이름 읽기 추출
async function extractEstatReadings() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(ESTAT_PATH)
      .pipe(csv())
      .on('data', (row) => {
        // e-Stat CSV 파일의 구조에 맞게 수정 필요
        const { kanji, kana, frequency } = row;
        
        if (!nameReadings.has(kanji)) {
          nameReadings.set(kanji, []);
        }
        
        // 빈도수와 함께 저장
        nameReadings.get(kanji).push({
          reading: kana,
          frequency: parseInt(frequency, 10)
        });
      })
      .on('end', () => {
        // 각 이름에 대해 빈도수로 정렬
        for (const [kanji, readings] of nameReadings) {
          readings.sort((a, b) => b.frequency - a.frequency);
        }
        
        // 가장 일반적인 읽기만 JSON으로 저장
        const commonReadings = {};
        for (const [kanji, readings] of nameReadings) {
          if (readings.length > 0) {
            commonReadings[kanji] = readings[0].reading;
          }
        }
        
        fs.writeFileSync(
          COMMON_READINGS_PATH,
          JSON.stringify(commonReadings, null, 2)
        );
        
        console.log('이름 읽기 데이터 추출 완료');
        resolve(true);
      })
      .on('error', (error) => {
        console.error('이름 읽기 데이터 추출 실패:', error);
        reject(error);
      });
  });
}

// 메인 실행 함수
async function main() {
  console.log('e-Stat 이름 데이터 처리 시작...');
  
  // csv-parser 패키지 설치 확인
  try {
    require('csv-parser');
  } catch (error) {
    console.log('csv-parser 패키지 설치 중...');
    require('child_process').execSync('npm install csv-parser');
  }

  try {
    await extractEstatReadings();
    console.log('모든 처리 완료!');
  } catch (error) {
    console.error('처리 실패:', error);
  }
}

main(); 