const fs = require('fs');
const path = require('path');
const https = require('https');

// e-Stat API 설정
const ESTAT_API_KEY = process.env.ESTAT_API_KEY;
const ESTAT_API_URL = 'https://api.e-stat.go.jp/rest/3.0/app/json/getStatsList';

// 저장 경로
const OUTPUT_PATH = path.join(__dirname, '../data/estat_names.csv');

// e-Stat API 호출
async function fetchEstatData() {
  const params = new URLSearchParams({
    appId: ESTAT_API_KEY,
    lang: 'J',
    searchWord: '名前',
    searchKind: '1',
    statsCode: '00200521', // 인구동태조사
    surveyYears: '2020'
  });

  return new Promise((resolve, reject) => {
    https.get(`${ESTAT_API_URL}?${params}`, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

// CSV 파일로 저장
function saveToCSV(data) {
  const header = 'kanji,kana,frequency\n';
  const rows = data.map(item => 
    `${item.kanji},${item.kana},${item.frequency}`
  ).join('\n');

  fs.writeFileSync(OUTPUT_PATH, header + rows);
  console.log(`데이터가 ${OUTPUT_PATH}에 저장되었습니다.`);
}

// 메인 실행 함수
async function main() {
  console.log('e-Stat 데이터 다운로드 시작...');

  if (!ESTAT_API_KEY) {
    console.error('ESTAT_API_KEY가 설정되지 않았습니다.');
    console.log('다음 명령어로 API 키를 설정해주세요:');
    console.log('export ESTAT_API_KEY=your_api_key');
    return;
  }

  try {
    const data = await fetchEstatData();
    // API 응답 구조에 맞게 데이터 처리
    const processedData = []; // API 응답 구조에 맞게 처리 로직 구현 필요
    saveToCSV(processedData);
    console.log('데이터 다운로드 완료!');
  } catch (error) {
    console.error('데이터 다운로드 실패:', error);
  }
}

main(); 