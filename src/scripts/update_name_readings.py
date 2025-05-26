from playwright.sync_api import sync_playwright
import json
import time
import random
from urllib.parse import quote
import csv
import re

def extract_readings(text):
    """
    텍스트에서 일본어 읽기 방를 추출합니다.
    
    Args:
        text (str): Google 검색 결과 텍스트
    
    Returns:
        list: 추출된 읽기 방 리스트
    """
    readings = []
    
    # 読み方 패턴 - 더 구체적인 패턴으로 수정
    patterns = [
        r'読み方は「([ぁ-んァ-ンー]{2,8})」',  # 読み方は「よみかた」
        r'「([ぁ-んァ-ンー]{2,8})」という読み方',  # 「よみかた」という読み方
        r'([ぁ-んァ-ンー]{2,8})と読みます',  # よみかたと読みます
        r'([ぁ-んァ-ンー]{2,8})と読む',  # よみかたと読む
        r'読み方は\s*[「『]?\s*([ぁ-んァ-ンー]{2,8})[」』]?',  # 読み方は よみかた
        r'([ぁ-んァ-ンー]{2,8})（[ぁ-んァ-ンー]{2,8}）',  # よみかた（ヨミカタ）
    ]
    
    # 제외할 단어/패턴 리스트
    exclude_words = [
        'トップ', 'だった', 'です', 'します', 'ます', 'である', 'でした',
        'という', 'とは', 'など', 'または', 'および', 'または',
        'について', 'における', 'による', 'として', 'ための',
        'いたし', 'なり', 'する', 'される', 'れる', 'られる',
        'ください', 'おり', 'いる', 'ある', 'なる', 'どう', 'です',
        'ません', 'でも', 'から', 'まで', 'ので', 'のに', 'のは',
        'バースデイ', 'バースデー', 'どうでも', 'いいのです'
    ]
    
    # 성씨 패턴 (예: さかぐち, やまぐち, いとう 등)
    surname_patterns = [
        r'[あ-んア-ン]{3,}[ぁ-んァ-ンー]+',  # 3자 이상의 성씨 + 이름 읽기
    ]
    
    for pattern in patterns:
        matches = re.findall(pattern, text)
        readings.extend([m for m in matches if m])
    
    # 중복 제거 및 필터링
    readings = list(set(readings))
    
    # 유효한 읽기 방만 포함
    valid_readings = []
    for reading in readings:
        # 최소 2자, 최대 8자의 히라가나/카타카나로 구성된 읽기 방만 포함
        if (2 <= len(reading) <= 8 and 
            re.match(r'^[ぁ-んァ-ンー]+$', reading) and
            not any(exclude in reading for exclude in exclude_words) and
            not any(re.match(surname, reading) for surname in surname_patterns)):
            valid_readings.append(reading)
    
    return valid_readings

def get_google_search_result(page, name):
    """
    Google에서 이름 읽는 방법을 검색하고 최상단 결과를 가져옵니다.
    
    Args:
        page: Playwright Page 객체
        name (str): 검색할 일본어 이름 (예: '健太郎')
    
    Returns:
        list: 추출된 읽기 방 리스트
    """
    query = f"{name} 読み方"
    encoded_query = quote(query)
    url = f"https://www.google.com/search?q={encoded_query}&hl=ja"
    
    try:
        # 랜덤 지연 시간 추가 (2-5초)
        time.sleep(random.uniform(2, 5))
        page.goto(url, wait_until="networkidle")
        
        # 페이지가 완전히 로드될 때까지 추가 대기
        page.wait_for_load_state("networkidle")
        
        # 여러 가능한 요소 선택자를 시도
        selectors = [
            ".kno-rdesc span",  # Knowledge Graph 설명
            ".hgKElc",          # Featured Snippet
            ".ILfuVd",          # 다른 형식의 Featured Snippet
            ".Z0LcW",           # Direct Answer Box
            ".VwiC3b"           # 일반 검색 결과 설명
        ]
        
        all_text = []
        for selector in selectors:
            try:
                elements = page.query_selector_all(selector)
                for element in elements:
                    text = element.text_content()
                    if text and text.strip():
                        all_text.append(text.strip())
            except Exception as e:
                print(f"Selector {selector} failed: {str(e)}")
                continue
        
        if all_text:
            # 모든 텍스트에서 읽기 방 추출
            readings = []
            for text in all_text:
                extracted = extract_readings(text)
                if extracted:
                    readings.extend(extracted)
            
            if readings:
                # 중복 제거
                readings = list(set(readings))
                print(f"Found readings for {name}: {readings}")
                return readings
        
        print(f"No readings found for {name}")
        return []
        
    except Exception as e:
        print(f"Error searching for {name}: {str(e)}")
        return []

def hiragana_to_katakana(text):
    """
    히라가나를 카타카나로 변환합니다.
    """
    hiragana = "ぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろわをんー"
    katakana = "ァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロワヲンー"
    trans_table = str.maketrans(hiragana, katakana)
    return text.translate(trans_table)

def is_valid_reading(reading):
    """
    읽기 방이 유효한지 검증합니다.
    """
    # 최소 2자, 최대 8자
    if not (2 <= len(reading) <= 8):
        return False
        
    # 히라가나나 카타카나로만 구성되어 있는지 확인
    if not re.match(r'^[ぁ-んァ-ンー]+$', reading):
        return False
        
    # 제외할 단어 목록
    exclude_words = [
        'トップ', 'だった', 'です', 'します', 'ます', 'である', 'でした',
        'という', 'とは', 'など', 'または', 'および', 'または',
        'について', 'における', 'による', 'として', 'ための',
        'いたし', 'なり', 'する', 'される', 'れる', 'られる',
        'ください', 'おり', 'いる', 'ある', 'なる', 'どう', 'です',
        'ません', 'でも', 'から', 'まで', 'ので', 'のに', 'のは',
        'バースデイ', 'バースデー', 'どうでも', 'いいのです'
    ]
    
    # 제외할 단어가 포함되어 있는지 확인
    if any(exclude in reading for exclude in exclude_words):
        return False
        
    return True

def read_names_from_csv(csv_file):
    """
    CSV 파일에서 이름 목록을 읽어옵니다.
    
    Args:
        csv_file (str): CSV 파일 경로
    
    Returns:
        list: (이름, 기존_카나) 튜플 리스트
    """
    names = []
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                name = row.get('Name', row.get('名前', ''))
                kana = row.get('Kana', row.get('カナ', ''))
                if name:  # 이름이 있는 경우만 추가
                    names.append((name, kana))
    except Exception as e:
        print(f"Error reading CSV file: {str(e)}")
    return names

def update_name_readings(csv_file, output_file='data/name_readings.json', delay=3):
    """
    여러 이름에 대한 검색을 수행하고 결과를 JSON 파일로 저장합니다.
    
    Args:
        csv_file (str): 입력 CSV 파일 경로
        output_file (str): 결과를 저장할 JSON 파일 경로
        delay (int): 요청 간 최소 대기 시간(초)
    """
    # 기존 데이터 로드
    try:
        with open(output_file, 'r', encoding='utf-8') as f:
            results = json.load(f)
    except FileNotFoundError:
        results = {}
    
    # CSV에서 이름 목록 읽기
    names = read_names_from_csv(csv_file)
    
    with sync_playwright() as p:
        # 브라우저 설정
        browser = p.chromium.launch(
            headless=True,
            args=[
                '--disable-blink-features=AutomationControlled',
                '--disable-infobars',
                '--window-size=1920,1080',
                '--start-maximized'
            ]
        )
        
        # 브라우저 컨텍스트 설정
        context = browser.new_context(
            locale='ja-JP',
            timezone_id='Asia/Tokyo',
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        )
        
        page = context.new_page()
        
        try:
            for name, original_kana in names:
                if name in results:
                    print(f"Skipping {name} - already processed")
                    continue
                    
                print(f"Processing {name} (Original Kana: {original_kana})...")
                
                # 이름이 이미 히라가나인 경우
                if re.match(r'^[ぁ-ん]+$', name):
                    readings = [hiragana_to_katakana(name)]
                else:
                    # Google 검색으로 읽기 방 찾기
                    readings = get_google_search_result(page, name)
                
                # 읽기 방 검증 및 변환
                valid_readings = []
                for reading in readings:
                    # 히라가나인 경우 카타카나로 변환
                    if re.match(r'^[ぁ-ん]+$', reading):
                        reading = hiragana_to_katakana(reading)
                    
                    # 유효성 검사
                    if is_valid_reading(reading):
                        valid_readings.append(reading)
                
                if valid_readings:
                    results[name] = {
                        'readings': valid_readings,
                        'original_kana': original_kana
                    }
                    
                    # 중간 결과 저장
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(results, f, ensure_ascii=False, indent=2)
                
                # 딜레이 추가
                time.sleep(random.uniform(delay, delay + 2))
                
        except Exception as e:
            print(f"Error during processing: {str(e)}")
        finally:
            # 최종 결과 저장
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    # 여성 이름 처리
    update_name_readings('src/data/japanese_female_names.csv', 'data/female_name_readings.json')
    
    # 남성 이름 처리
    update_name_readings('src/data/japanese_male_names.csv', 'data/male_name_readings.json') 