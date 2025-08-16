import { and, asc, desc, eq, ilike, InferSelectModel } from "drizzle-orm";
import { db } from "./index";
import { songs } from "./schema";

export type Song = InferSelectModel<typeof songs>;

export type SongFilterField =
  | "difficulty"
  | "genre"
  | "artist"
  | "title"
  | "decade"
  | "mood"
  | "key"
  | "tempo_bpm";

export type SongFilterMatch = "equals" | "contains";

export type SongFilter = {
  field: SongFilterField;
  match: SongFilterMatch;
  value: string;
};

const columnMap = {
  difficulty: songs.difficulty,
  genre: songs.genre,
  artist: songs.artist,
  title: songs.title,
  decade: songs.decade,
  mood: songs.mood,
  key: songs.key,
  tempo_bpm: songs.tempo_bpm,
} as const;

export async function searchSongsByFilters({
  filters,
  limit = 20,
  sortBy,
  sortOrder = "asc",
}: {
  filters: SongFilter[];
  limit?: number;
  sortBy?: "title" | "artist" | "decade" | "tempo_bpm";
  sortOrder?: "asc" | "desc";
}): Promise<Song[]> {
  const conditions = [] as any[];

  for (const f of filters) {
    const col = columnMap[f.field as keyof typeof columnMap];
    if (!col) continue;

    if (f.field === "difficulty") {
      const normalized = f.value.trim().toUpperCase();
      conditions.push(eq(col, normalized));
      continue;
    }

    if (f.match === "contains") {
      conditions.push(ilike(col, `%${f.value}%`));
    } else {
      conditions.push(eq(col, f.value));
    }
  }

  const base = db.select().from(songs);
  const withWhere = conditions.length ? base.where(and(...conditions)) : base;
  const withOrder = (() => {
    if (!sortBy) return withWhere;
    const sortCol = columnMap[sortBy as keyof typeof columnMap];
    if (!sortCol) return withWhere;
    return withWhere.orderBy(sortOrder === "desc" ? desc(sortCol) : asc(sortCol));
  })();
  const withLimit = withOrder.limit(Math.min(Math.max(limit, 1), 50));
  return await withLimit;
}