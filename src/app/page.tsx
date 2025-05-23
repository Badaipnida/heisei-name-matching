'use client';

import GenderSelector from '../components/GenderSelector';
import NameSearch from '../components/NameSearch';
import { GenderProvider } from '../context/GenderContext';

export default function Home() {
  return (
    <GenderProvider>
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-4 text-blue-700 flex items-center justify-center gap-2 sm:gap-3 drop-shadow leading-tight">
            <span>🌸</span> 推しの平成ネーム <span>✨</span>
          </h1>
          <p className="text-center text-base sm:text-lg text-blue-500 mb-2 font-medium px-2">
            もし推しが平成元年に生まれていたら？
          </p>
          <p className="text-center text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 px-2">
            2024年の韓国アイドルの名前を1989年（平成元年）の日本の名前ランキングと照らし合わせてみましょう！
          </p>
          
          <div className="max-w-2xl mx-auto px-2">
            <GenderSelector />
            <NameSearch />
          </div>

          <div className="mt-12 sm:mt-16 max-w-2xl mx-auto p-6 sm:p-8 bg-white rounded-2xl shadow-xl border-2 border-blue-100">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
              <span>🎌</span> 平成ネームとは？
            </h2>
            <div className="space-y-4 text-gray-600 text-sm sm:text-base">
              <p>
                <span className="text-lg">🕰️</span> 1989年（平成元年）は、日本のポップカルチャーが大きく変化し始めた時期。
                その年の人気の名前と現代の韓国アイドルの名前を比べることで、
                もし推しが平成時代に生まれていたら、どんな名前が付けられていたかを想像できます。
              </p>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start sm:items-center gap-2">
                <span className="text-xl mt-1 sm:mt-0">📊</span>
                <p className="text-xs sm:text-sm">
                  ※ 韓国の名前データは2024年最新のものを使用<br />
                  ※ 日本の名前データは1989年（平成元年）のものを使用
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </GenderProvider>
  );
}
