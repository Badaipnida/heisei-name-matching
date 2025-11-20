# 프로젝트 구조 리뷰

## 📋 개요
한국 아이돌 이름을 1989년(平成元年) 일본 이름과 매칭하는 Next.js 애플리케이션

---

## ✅ 잘 구성된 부분

### 1. **코드 구조**
- ✅ 컴포넌트, 컨텍스트, 유틸리티, 타입이 명확하게 분리됨
- ✅ TypeScript 타입 정의가 잘 되어 있음
- ✅ React Context를 활용한 상태 관리
- ✅ 반응형 UI 디자인

### 2. **기능 구현**
- ✅ API 라우트가 깔끔하게 구성됨
- ✅ 클라이언트 사이드 데이터 캐싱
- ✅ 자동완성 기능
- ✅ 에러 핸들링

---

## ⚠️ 개선이 필요한 부분

### 1. **데이터 디렉토리 구조 문제** 🔴 중요

**현재 상황:**
- `/data` 디렉토리: JSON 파일들 (`name_readings.json`, `idol_names.json` 등)
- `/src/data` 디렉토리: 실제 사용되는 CSV 파일들
- 스크립트들이 두 경로를 혼용하여 참조

**문제점:**
- 데이터 파일 위치가 일관되지 않음
- `/data`의 JSON 파일들이 실제로 사용되는지 불명확
- 빌드 시 `/src/data`의 CSV 파일이 번들에 포함될 수 있음

**권장 사항:**
```
/data/                    # 루트에 데이터 디렉토리
  ├── csv/               # CSV 파일들
  │   ├── korean_male_names.csv
  │   ├── korean_female_names.csv
  │   ├── japanese_male_names.csv
  │   └── japanese_female_names.csv
  └── json/              # 생성된 JSON 파일들
      ├── name_readings.json
      └── ...
```

또는 Next.js의 `public` 디렉토리 사용:
```
/public/data/
  └── *.csv
```

### 2. **API 성능 문제** 🔴 중요

**현재 코드:**
```typescript
// 매 요청마다 파일을 읽음
export async function GET() {
  const dataDir = path.join(process.cwd(), 'src', 'data');
  // 파일 읽기...
}
```

**문제점:**
- 매 API 요청마다 디스크 I/O 발생
- 서버 메모리에 캐시가 없음
- 프로덕션 환경에서 성능 저하 가능

**권장 사항:**
```typescript
// 서버 사이드 캐싱 추가
let nameDataCache: {
  koreanMale?: NameData[];
  koreanFemale?: NameData[];
  japaneseMale?: NameData[];
  japaneseFemale?: NameData[];
} | null = null;

export async function GET() {
  if (!nameDataCache) {
    // 초기 로드 시에만 파일 읽기
    nameDataCache = await loadAllNameData();
  }
  return NextResponse.json(nameDataCache);
}
```

### 3. **설정 파일 중복** 🟡 중간

**현재 상황:**
- `postcss.config.js` (CommonJS)
- `postcss.config.mjs` (ESM)

**문제점:**
- 두 파일이 공존하여 혼란 가능
- Next.js가 어떤 파일을 사용하는지 불명확

**권장 사항:**
- 하나만 유지 (Next.js는 `.mjs`를 우선적으로 사용)
- `postcss.config.js` 삭제

### 4. **빈 디렉토리** 🟡 중간

**현재 상황:**
- `src/data/src/scripts/` - 빈 디렉토리

**권장 사항:**
- 삭제

### 5. **README 파일** 🟡 중간

**현재 상황:**
- 기본 Next.js 템플릿 내용만 있음

**권장 사항:**
- 프로젝트 설명 추가
- 설치 및 실행 방법
- 데이터 구조 설명
- API 엔드포인트 문서화

### 6. **TikTok iframe 통합** 🟢 낮음

**현재 상황:**
- `page.tsx`에 TikTok 팔로워 카운터 iframe이 포함됨
- 메인 앱 기능과 직접적인 연관성이 없어 보임

**권장 사항:**
- 별도 컴포넌트로 분리
- 또는 별도 페이지로 이동

### 7. **타입 안정성** 🟡 중간

**현재 코드:**
```typescript
const records = parse(normalizedContent, {
  // ...
});

return records.map((record: any) => ({  // any 사용
  // ...
}));
```

**권장 사항:**
- CSV 레코드에 대한 타입 정의 추가
- `any` 타입 제거

### 8. **에러 처리** 🟡 중간

**현재 상황:**
- 기본적인 에러 처리만 있음
- 파일이 없을 때의 처리 부족

**권장 사항:**
- 더 구체적인 에러 메시지
- 파일 존재 여부 확인
- 로깅 개선

---

## 📁 권장 디렉토리 구조

```
heisei-name-app/
├── data/                    # 데이터 파일 (루트)
│   ├── csv/
│   │   ├── korean_male_names.csv
│   │   ├── korean_female_names.csv
│   │   ├── japanese_male_names.csv
│   │   └── japanese_female_names.csv
│   └── json/                # 생성된 JSON 파일들
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── names/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── GenderSelector.tsx
│   │   └── NameSearch.tsx
│   ├── context/
│   │   └── GenderContext.tsx
│   ├── types/
│   │   └── name.ts
│   ├── utils/
│   │   └── nameUtils.ts
│   └── scripts/             # 데이터 처리 스크립트
│       ├── updateNameReadings.js
│       └── ...
│
├── public/                  # 정적 파일
│   └── ...
│
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.mjs       # 하나만 유지
```

---

## 🔧 우선순위별 개선 작업

### 높은 우선순위
1. ✅ API 서버 사이드 캐싱 추가
2. ✅ 데이터 디렉토리 구조 정리
3. ✅ PostCSS 설정 파일 통합

### 중간 우선순위
4. ✅ README 파일 업데이트
5. ✅ 타입 안정성 개선 (`any` 제거)
6. ✅ 빈 디렉토리 정리

### 낮은 우선순위
7. ✅ TikTok iframe 컴포넌트 분리
8. ✅ 에러 처리 개선

---

## 📝 추가 제안

### 1. 환경 변수
- 데이터 파일 경로를 환경 변수로 관리
- 개발/프로덕션 환경 분리

### 2. 테스트
- 유닛 테스트 추가
- API 라우트 테스트
- 컴포넌트 테스트

### 3. 성능 최적화
- 데이터 파일 압축 고려
- 필요시 데이터베이스로 마이그레이션 검토

### 4. 문서화
- API 문서화 (Swagger/OpenAPI)
- 컴포넌트 스토리북 고려

---

## 결론

전반적으로 잘 구성된 프로젝트입니다. 주요 개선점은:
1. 데이터 디렉토리 구조 정리
2. API 성능 최적화 (캐싱)
3. 설정 파일 정리

이 세 가지만 개선해도 프로젝트의 유지보수성과 성능이 크게 향상될 것입니다.

