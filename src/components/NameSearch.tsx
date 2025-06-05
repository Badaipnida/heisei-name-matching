'use client';

import { useState, useEffect } from 'react';
import { useGender } from '../context/GenderContext';
import { getKoreanNames, findMatchingName, initializeNameData, isDataInitialized, getRankEmoji, getRankComment } from '../utils/nameUtils';
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

  // Enter 키 입력 시 검색 실행
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      const match = findMatchingName(searchTerm.trim(), gender);
      setMatchResult(match);
      setSuggestions([]);
    }
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
    <div className="w-full max-w-md mx-auto p-2 sm:p-4">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg sm:text-xl text-gray-400 pointer-events-none">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="推しの韓国語の名前を入力してください"
          className="w-full pl-10 p-3 border-2 border-gray-200 rounded-xl shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all text-base sm:text-lg bg-white"
        />
        <p className="mt-2 text-xs sm:text-sm text-gray-500 px-1">
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
                className="flex items-center gap-2 p-2 sm:p-3 hover:bg-blue-50 cursor-pointer text-base sm:text-lg"
              >
                <span className="text-blue-400">✨</span> {name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {matchResult && (
        <div className={`mt-6 p-4 sm:p-6 rounded-2xl border-2 shadow-xl transition-all ${
          gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200'
        }`}>
          <h3 className="text-4xl sm:text-6xl font-bold mb-6 text-center">
            {getRankEmoji(matchResult.japaneseName.rank, gender)}
          </h3>
          
          <div className="text-center mb-8">
            <p className="text-lg sm:text-xl text-gray-700">
              <span className="font-bold text-gray-900">{matchResult.koreanName.name}</span> という名前のあなたは
            </p>
            <p className="text-lg sm:text-xl text-gray-700 mt-2">
              日本では <span className="font-bold text-gray-900">{matchResult.japaneseName.name}</span> です。
            </p>
            {matchResult.koreanName.isRandomMatch && (
              <p className="text-base sm:text-lg text-gray-600 mt-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                申し訳ありませんが、この名前は韓国2025年の新生児名登録データにありませんでした。
                残念ながら1対1でマッチする日本語の名前がありません。
                代わりに、ランダムな日本語の名前でマッチングさせていただきます...！
              </p>
            )}
            <p className="text-base sm:text-lg text-gray-600 mt-4 bg-white/50 p-4 rounded-xl">
              {getRankComment(matchResult.japaneseName.rank)}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">📊</span> 名前のランキング情報
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">韓国ランキング</p>
                  <p className="font-bold text-lg">{matchResult.koreanName.rank}位</p>
                  <p className="text-xs text-gray-500">出生数: {matchResult.koreanName.birthCount}人</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">日本ランキング</p>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-lg">{matchResult.japaneseName.rank}位</p>
                    <span className="text-2xl">{getRankEmoji(matchResult.japaneseName.rank, gender)}</span>
                  </div>
                  <p className="text-xs text-gray-500">出生数: {matchResult.japaneseName.birthCount}人</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">🎌</span> 日本語の読み方
              </h4>
              <p className="text-lg font-medium text-gray-800">{matchResult.japaneseName.kana}</p>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">日本語の読み方</h3>
                <p className="text-gray-700">
                  {matchResult.japaneseName.name}の日本語の発音です。(名前は様々な読み方や発音の可能性があります。)
                </p>
              </div>
            </div>

            {matchResult.etymology && (
              <div className="bg-white rounded-xl p-4 shadow-md">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="text-xl">📚</span> 名前の意味
                </h4>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {matchResult.etymology.nameKanjis.map((kanji, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-2">
                        <p className="text-2xl font-bold text-gray-900 mb-1">{kanji.kanji}</p>
                        <p className="text-xs text-gray-600">{kanji.meaning}</p>
                        {kanji.commonUse && (
                          <p className="text-xs text-gray-500 mt-1">{kanji.commonUse}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {matchResult.etymology.commonUsage && (
                    <p className="text-sm text-gray-700">
                      {matchResult.etymology.commonUsage}
                    </p>
                  )}
                  {matchResult.etymology.culturalNote && (
                    <p className="text-sm text-gray-600 italic">
                      {matchResult.etymology.culturalNote}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 shadow-md">
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-xl">💡</span> おもしろい事実
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {matchResult.koreanName.name}さんの名前は1989年の日本で
                <span className="font-medium"> {matchResult.japaneseName.birthCount}人</span>の子供たちが
                <span className="font-medium"> {matchResult.japaneseName.name}</span>という名前で生まれたときの
                人気と同様のレベルです！
              </p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setMatchResult(null)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              別の名前を検索する 🔍
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 