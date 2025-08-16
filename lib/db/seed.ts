import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';
import { db } from './index';
import { songs } from './schema';

export async function seed() {
  const results: any[] = [];
  const csvFilePath = path.join(process.cwd(), 'hdpiano_songs_full.csv');

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data: any) => results.push(data))
      .on('end', resolve)
      .on('error', reject);
  });

  for (const row of results) {
    await db.insert(songs).values({
      // id: row.id,
      title: row.title, 
      artist: row.artist,
      difficulty: row.difficulty,
      genre: row.genre,
      decade: row.decade,
      mood: row.mood,
      key: row.key,
      tempo_bpm: row.tempo_bpm,
      hdpiano_path: row.hdpiano_path,
      hdpiano_url: row.hdpiano_url
    });
  }

  console.log(`Seeded ${results.length} songs`);

  return {
    songs: results,
  };
}


seed().catch(console.error);