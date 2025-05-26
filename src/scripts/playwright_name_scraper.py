from playwright.sync_api import sync_playwright
import json
import time
import random
from urllib.parse import quote

def get_google_search_result(page, name):
    """
    Google에서 이름 읽는 방법을 검색하고 최상단 결과를 가져옵니다.
    
    Args:
        page: Playwright Page 객체
        name (str): 검색할 일본어 이름 (예: '健太郎')
    
    Returns:
        str: 검색 결과의 첫 번째 설명 텍스트
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
        
        for selector in selectors:
            try:
                # 타임아웃 증가 (10초)
                element = page.wait_for_selector(selector, timeout=10000)
                if element:
                    text = element.text_content()
                    if text and text.strip():
                        print(f"Found result for {name}: {text.strip()}")
                        return text.strip()
            except Exception as e:
                print(f"Selector {selector} failed: {str(e)}")
                continue
        
        print(f"No result found for {name}")
        return None
        
    except Exception as e:
        print(f"Error searching for {name}: {str(e)}")
        return None

def process_names_batch(names, output_file='name_readings.json', delay=3):
    """
    여러 이름에 대한 검색을 수행하고 결과를 JSON 파일로 저장합니다.
    
    Args:
        names (list): 검색할 이름 리스트
        output_file (str): 결과를 저장할 JSON 파일 경로
        delay (int): 요청 간 최소 대기 시간(초)
    """
    results = {}
    
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
            for name in names:
                print(f"Searching for {name}...")
                result = get_google_search_result(page, name)
                if result:
                    results[name] = result
                # 랜덤 지연 시간 추가 (delay에서 delay*2 사이)
                time.sleep(random.uniform(delay, delay * 2))
            
            # 결과를 JSON 파일로 저장
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(results, f, ensure_ascii=False, indent=2)
            
            print(f"Results saved to {output_file}")
            
        finally:
            browser.close()

if __name__ == "__main__":
    # 테스트용 이름 리스트
    test_names = ["健太郎", "光太郎", "誠", "健一", "太郎"]
    process_names_batch(test_names, delay=3) 