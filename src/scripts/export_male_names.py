import csv
import json

def export_male_names_to_csv(input_file='data/male_names_1989.json', output_file='data/male_names.csv'):
    """
    JSON 파일에서 남자 이름을 읽어서 CSV 파일로 저장합니다.
    
    Args:
        input_file (str): 입력 JSON 파일 경로
        output_file (str): 출력 CSV 파일 경로
    """
    try:
        # JSON 파일 읽기
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # CSV 파일로 저장
        with open(output_file, 'w', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(['Rank', 'Name', 'Birth_Count', 'Kana'])  # 헤더 작성
            
            # 데이터 작성
            for rank, name_data in enumerate(data, 1):
                writer.writerow([
                    rank,
                    name_data['name'],
                    name_data.get('count', ''),
                    name_data.get('kana', '')
                ])
        
        print(f"Successfully exported {len(data)} names to {output_file}")
        
    except Exception as e:
        print(f"Error exporting names: {str(e)}")

if __name__ == "__main__":
    export_male_names_to_csv() 