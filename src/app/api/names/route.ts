import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { NextResponse } from 'next/server';
import type { NameData } from '../../../types/name';

export async function GET() {
  try {
    const dataDir = path.join(process.cwd(), 'src', 'data');
    
    // 모든 CSV 파일 읽기
    const [koreanMale, koreanFemale, japaneseMale, japaneseFemale] = await Promise.all([
      readNameData(path.join(dataDir, 'korean_male_names.csv')),
      readNameData(path.join(dataDir, 'korean_female_names.csv')),
      readNameData(path.join(dataDir, 'japanese_male_names.csv')),
      readNameData(path.join(dataDir, 'japanese_female_names.csv')),
    ]);

    return NextResponse.json({
      koreanMale,
      koreanFemale,
      japaneseMale,
      japaneseFemale,
    });
  } catch (error) {
    console.error('Error loading name data:', error);
    return NextResponse.json(
      { error: 'Failed to load name data' },
      { status: 500 }
    );
  }
}

async function readNameData(filePath: string): Promise<NameData[]> {
  const fileContent = await fs.readFile(filePath, 'utf-8');
  
  // Remove any BOM and normalize line endings
  const normalizedContent = fileContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  
  const records = parse(normalizedContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    delimiter: ',',
    relax_column_count: false,
    skip_records_with_error: false,
    from_line: 1
  });

  return records.map((record: any) => ({
    rank: parseInt(record.Rank),
    name: record.Name,
    birthCount: parseInt(record.Birth_Count.replace(/,/g, '')),
    ...(record.Kana && { kana: record.Kana.trim() })
  }));
} 