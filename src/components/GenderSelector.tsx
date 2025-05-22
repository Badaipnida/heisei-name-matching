'use client';

import { useGender } from '../context/GenderContext';
import { Gender } from '../types/name';

export default function GenderSelector() {
  const { gender, setGender } = useGender();

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
  };

  return (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        onClick={() => handleGenderChange('male')}
        className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-blue-300 text-lg
          ${
            gender === 'male'
              ? 'bg-blue-500 text-white border-blue-500 shadow-lg scale-105'
              : 'bg-white text-blue-500 border-blue-200 hover:bg-blue-50'
          }
        `}
        aria-pressed={gender === 'male'}
      >
        <span className="text-2xl">👦</span> 男性アイドル
      </button>
      <button
        onClick={() => handleGenderChange('female')}
        className={`flex items-center gap-2 px-6 py-2 rounded-xl font-semibold transition-all duration-150 shadow-sm border-2 focus:outline-none focus:ring-2 focus:ring-pink-300 text-lg
          ${
            gender === 'female'
              ? 'bg-pink-500 text-white border-pink-500 shadow-lg scale-105'
              : 'bg-white text-pink-500 border-pink-200 hover:bg-pink-50'
          }
        `}
        aria-pressed={gender === 'female'}
      >
        <span className="text-2xl">👧</span> 女性アイドル
      </button>
    </div>
  );
} 