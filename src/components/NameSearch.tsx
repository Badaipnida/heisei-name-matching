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
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 pointer-events-none">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="推しの韓国語の名前を入力してください"
          className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-lg bg-white"
        />
        <p className="mt-2 text-sm text-gray-500 px-1">
          例：名字を省略し、名前だけ入力してください。
          <br />
          <span className="text-gray-400">（キム・テヒョン → 태형、パク・ジミン → 지민）</span>
        </p>
        {suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border-2 border-blue-100 rounded-xl mt-1 shadow-lg">
            {suggestions.map((name) => (
              <li
                key={name}
                onClick={() => handleNameSelect(name)}
                className="flex items-center gap-2 p-3 hover:bg-blue-50 cursor-pointer text-lg"
              >
                <span className="text-blue-400">✨</span> {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {matchResult && (
        <div className={`mt-6 p-6 rounded-2xl border-2 shadow-xl transition-all ${
          gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200'
        }`}>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🧩</span> 平成ネームマッチング
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center">
              <span className="text-2xl mb-1">🇰🇷</span>
              <p className="text-gray-600">2024年の名前</p>
              <p className="font-bold text-lg">{matchResult.koreanName.name}</p>
              <p className="text-sm text-gray-500">順位: {matchResult.koreanName.rank}位</p>
              <p className="text-sm text-gray-500">出生数: {matchResult.koreanName.birthCount}人</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow flex flex-col items-center">
              <span className="text-2xl mb-1">🇯🇵</span>
              <p className="text-gray-600">平成元年の名前</p>
              <p className="font-bold text-lg">
                {matchResult.japaneseName.name}
              </p>
              <p className="text-sm text-gray-500">順位: {matchResult.japaneseName.rank}位</p>
              <p className="text-sm text-gray-500">出生数: {matchResult.japaneseName.birthCount}人</p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-700 bg-white p-4 rounded-xl shadow flex items-center gap-2">
            <span className="text-xl">💡</span>
            <p>
              もし{matchResult.koreanName.name}が平成元年に生まれていたら、
              {matchResult.japaneseName.name}という名前が付けられていたかもしれません。
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 