import requests
from bs4 import BeautifulSoup
from fake_useragent import UserAgent
import time
import json
from urllib.parse import quote

def get_google_search_result(name):
    """
    Google에서 이름 읽는 방법을 검색하고 최상단 결과를 가져옵니다.
    
    Args:
        name (str): 검색할 일본어 이름 (예: '健太郎')
    
    Returns:
        str: 검색 결과의 첫 번째 설명 텍스트
    """
    # 검색어 생성
    query = f"{name} 読み方"
    encoded_query = quote(query)
    
    # User-Agent 랜덤 생성
    ua = UserAgent()
    
    # 헤더 설정
    headers = {
        'User-Agent': ua.random,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ja,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
    }
    
    # Google 검색 URL
    url = f"https://www.google.com/search?q={encoded_query}&hl=ja"
    
    try:
        # 요청 보내기
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # HTML 파싱
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 검색 결과 중 첫 번째 설명 찾기
        # 여러 가능한 클래스나 구조를 시도
        possible_elements = [
            soup.select_one('.kno-rdesc span'),  # Knowledge Graph 설명
            soup.select_one('.hgKElc'),          # Featured Snippet
            soup.select_one('.ILfuVd'),          # 다른 형식의 Featured Snippet
            soup.select_one('.Z0LcW'),           # Direct Answer Box
        ]
        
        # 첫 번째로 찾은 유효한 요소의 텍스트 반환
        for element in possible_elements:
            if element and element.text.strip():
                return element.text.strip()
        
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
    results = {}
    
    for name in names:
        print(f"Searching for {name}...")
        result = get_google_search_result(name)
        if result:
            results[name] = result
        time.sleep(delay)  # Google 차단 방지를 위한 대기
    
    # 결과를 JSON 파일로 저장
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"Results saved to {output_file}")

if __name__ == "__main__":
    # 테스트용 이름 리스트
    test_names = ["健太郎", "光太郎", "誠"]
    process_names_batch(test_names) 