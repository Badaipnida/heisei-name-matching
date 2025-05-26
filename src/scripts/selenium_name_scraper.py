from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
from urllib.parse import quote

def setup_driver():
    """
    Selenium WebDriver를 설정하고 반환합니다.
    """
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # GUI 없이 실행
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--lang=ja")  # 일본어로 설정
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def get_google_search_result(driver, name):
    """
    Google에서 이름 읽는 방법을 검색하고 최상단 결과를 가져옵니다.
    
    Args:
        driver: Selenium WebDriver 인스턴스
        name (str): 검색할 일본어 이름 (예: '健太郎')
    
    Returns:
        str: 검색 결과의 첫 번째 설명 텍스트
    """
    query = f"{name} 読み方"
    encoded_query = quote(query)
    url = f"https://www.google.com/search?q={encoded_query}&hl=ja"
    
    try:
        driver.get(url)
        
        # 최대 10초 동안 결과가 로드되기를 기다림
        wait = WebDriverWait(driver, 10)
        
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
                element = wait.until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                )
                text = element.text.strip()
                if text:
                    return text
            except (TimeoutException, NoSuchElementException):
                continue
        
        return None
        
    except Exception as e:
        print(f"Error searching for {name}: {str(e)}")
        return None

def process_names_batch(names, output_file='name_readings.json', delay=2):
    """
    여러 이름에 대한 검색을 수행하고 결과를 JSON 파일로 저장합니다.
    
    Args:
        names (list): 검색할 이름 리스트
        output_file (str): 결과를 저장할 JSON 파일 경로
        delay (int): 요청 간 대기 시간(초)
    """
    driver = setup_driver()
    results = {}
    
    try:
        for name in names:
            print(f"Searching for {name}...")
            result = get_google_search_result(driver, name)
            if result:
                results[name] = result
            time.sleep(delay)  # Google 차단 방지를 위한 대기
        
        # 결과를 JSON 파일로 저장
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        
        print(f"Results saved to {output_file}")
        
    finally:
        driver.quit()

if __name__ == "__main__":
    # 테스트용 이름 리스트
    test_names = ["健太郎", "光太郎", "誠", "健一", "太郎"]
    process_names_batch(test_names) 