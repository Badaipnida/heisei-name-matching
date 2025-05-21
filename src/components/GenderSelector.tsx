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
        className={`px-6 py-2 rounded-lg transition-colors ${
          gender === 'male'
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        男性アイドル
      </button>
      <button
        onClick={() => handleGenderChange('female')}
        className={`px-6 py-2 rounded-lg transition-colors ${
          gender === 'female'
            ? 'bg-pink-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        女性アイドル
      </button>
    </div>
  );
} 