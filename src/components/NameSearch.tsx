'use client';

import { useState, useEffect } from 'react';
import { useGender } from '../context/GenderContext';
import { getKoreanNames, findMatchingName, initializeNameData, isDataInitialized } from '../utils/nameUtils';
import { NameMatch } from '../types/name';

export default function NameSearch() {
  const { gender } = useGender();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [matchResult, setMatchResult] = useState<NameMatch | null>(null);
  const [koreanNames, setKoreanNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 초기화
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!isDataInitialized()) {
          await initializeNameData();
        }
        
        const names = getKoreanNames(gender);
        setKoreanNames(names);
      } catch (error) {
        console.error('Failed to load name data:', error);
        setError('データの読み込みに失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [gender]);

  // 검색어 변경 시 자동완성 목록 업데이트
  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = koreanNames.filter(name =>
        name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, koreanNames]);

  // 이름 선택 시 매칭 결과 찾기
  const handleNameSelect = (name: string) => {
    setSearchTerm(name);
    setSuggestions([]);
    const match = findMatchingName(name, gender);
    setMatchResult(match);
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-center">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-40 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md mx-auto p-4 text-center">
        <div className="text-red-500">{error}</div>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          もう一度試す
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="推しの韓国語の名前を入力してください"
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-2 text-sm text-gray-500 px-1">
          例：名字を省略し、名前だけ入力してください。
          <br />
          <span className="text-gray-400">（キム・テヒョン → 태형、パク・ジミン → 지민）</span>
        </p>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
            {suggestions.map((name) => (
              <li
                key={name}
                onClick={() => handleNameSelect(name)}
                className="p-3 hover:bg-gray-100 cursor-pointer"
              >
                {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {matchResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          gender === 'male' ? 'bg-blue-50' : 'bg-pink-50'
        }`}>
          <h3 className="text-lg font-semibold mb-2">平成ネームマッチング</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">2024年の名前</p>
              <p className="font-bold">{matchResult.koreanName.name}</p>
              <p className="text-sm text-gray-500">順位: {matchResult.koreanName.rank}位</p>
              <p className="text-sm text-gray-500">出生数: {matchResult.koreanName.birthCount}人</p>
            </div>
            <div>
              <p className="text-gray-600">平成元年の名前</p>
              <p className="font-bold">
                {matchResult.japaneseName.name}
                <span className="font-normal text-gray-600 ml-1">
                  （{matchResult.japaneseName.kana}）
                </span>
              </p>
              <p className="text-sm text-gray-500">順位: {matchResult.japaneseName.rank}位</p>
              <p className="text-sm text-gray-500">出生数: {matchResult.japaneseName.birthCount}人</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500 bg-white p-3 rounded-lg">
            <p>
              もし{matchResult.koreanName.name}が平成元年に生まれていたら、
              {matchResult.japaneseName.name}（{matchResult.japaneseName.kana}）という名前が付けられていたかもしれません。
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 