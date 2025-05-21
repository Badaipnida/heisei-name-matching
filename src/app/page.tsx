'use client';

import GenderSelector from '../components/GenderSelector';
import NameSearch from '../components/NameSearch';
import { GenderProvider } from '../context/GenderContext';

export default function Home() {
  return (
    <GenderProvider>
      <main className="min-h-screen bg-gradient-to-b from-white to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-4 text-gray-800">
            推しの平成ネーム
          </h1>
          <p className="text-center text-gray-600 mb-4">
            もし推しが平成元年に生まれていたら？
          </p>
          <p className="text-center text-sm text-gray-500 mb-8">
            2024年の韓国アイドルの名前を1989年（平成元年）の日本の名前ランキングと照らし合わせてみましょう！
          </p>
          
          <div className="max-w-2xl mx-auto">
            <GenderSelector />
            <NameSearch />
          </div>

          <div className="mt-12 max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              🎌 平成ネームとは？
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                1989年（平成元年）は、日本のポップカルチャーが大きく変化し始めた時期。
                その年の人気の名前と現代の韓国アイドルの名前を比べることで、
                もし推しが平成時代に生まれていたら、どんな名前が付けられていたかを想像できます。
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm">
                  ※ 韓国の名前データは2024年最新のものを使用
                  <br />
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
