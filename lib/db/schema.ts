import { nanoid } from "@/lib/utils";
import { index, pgTable, text, varchar, vector, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 }).references(
      () => resources.id,
      { onDelete: "cascade" },
    ),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
  },
  (table) => [
    index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  ]
)

export const resources = pgTable(
  "resources",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    content: text("content").notNull(),

    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`),
  });

//create title table for hdpiano_songs_full.csv
// title,artist,difficulty,genre,decade,mood,key,tempo_bpm,hdpiano_path,hdpiano_url
// River Flows in You,Yiruma,MEDIUM,Classical / New Age,2000s,"tender, romantic, calm",A major,65.0,/lesson/river-flows-in-you-by-yiruma,https://hdpiano.com/lesson/river-flows-in-you-by-yiruma
// Still D.R.E.,Dr. Dre & Snoop Dogg,EASY,Hip Hop,1990s,"confident, cool, minimal",,93.0,/lesson/still-dre-by-dr-dre-and-snoop-dogg,https://hdpiano.com/lesson/still-dre-by-dr-dre-and-snoop-dogg
// Für Elise,Ludwig van Beethoven,HARD,Classical,1810s,"nostalgic, lyrical",A minor,75.0,/lesson/fur-elise-by-ludwig-van-beethoven,https://hdpiano.com/lesson/fur-elise-by-ludwig-van-beethoven
// Bohemian Rhapsody,Queen,HARD,Classic Rock,1970s,"epic, dramatic",Various,,/lesson/bohemian-rhapsody-by-queen,https://hdpiano.com/lesson/bohemian-rhapsody-by-queen
// When I Was Your Man,Bruno Mars,EASY,Pop,2010s,"heartfelt, melancholic",C major,73.0,/lesson/when-i-was-your-man-by-bruno-mars,https://hdpiano.com/lesson/when-i-was-your-man-by-bruno-mars
// Life on Mars?,David Bowie,HARD,Art Rock / Glam Rock,1970s,"wistful, cinematic",,72.0,/lesson/life-on-mars-by-david-bowie,https://hdpiano.com/lesson/life-on-mars-by-david-bowie
// Great Balls of Fire,Jerry Lee Lewis,HARD,Rock & Roll,1950s,"energetic, playful",C major,168.0,/lesson/great-balls-of-fire-by-jerry-lee-lewis,https://hdpiano.com/lesson/great-balls-of-fire-by-jerry-lee-lewis
// All of Me,John Legend,MEDIUM,Pop / Soul,2010s,"romantic, intimate",A♭ major,120.0,/lesson/all-of-me-by-john-legend,https://hdpiano.com/lesson/all-of-me-by-john-legend
// Hall of Fame,The Script,HARD,Pop Rock,2010s,"uplifting, motivational",,85.0,/lesson/hall-of-fame-by-the-script,https://hdpiano.com/lesson/hall-of-fame-by-the-script
// Moonlight Sonata,Ludwig van Beethoven,HARD,Classical,1800s,"somber, introspective",C♯ minor,52.0,/lesson/moonlight-sonata-by-ludwig-van-beethoven,https://hdpiano.com/lesson/moonlight-sonata-by-ludwig-van-beethoven
// Love Yourself,Justin Bieber,EASY,Pop,2010s,"laid-back, sassy",E major,100.0,/lesson/love-yourself-by-justin-bieber,https://hdpiano.com/lesson/love-yourself-by-justin-bieber
// How to Save a Life,The Fray,EASY,Pop Rock,2000s,"reflective, earnest",,122.0,/lesson/how-to-save-a-life-by-the-fray,https://hdpiano.com/lesson/how-to-save-a-life-by-the-fray
// Heathens,Twenty One Pilots,MEDIUM,Alternative / Indie,2010s,"dark, brooding",,90.0,/lesson/heathens-by-twenty-one-pilots,https://hdpiano.com/lesson/heathens-by-twenty-one-pilots
// Canon in D,Johann Pachelbel,MEDIUM,Baroque / Classical,1680s,"elegant, ceremonial",D major,68.0,/lesson/canon-in-d-by-johann-pachelbel,https://hdpiano.com/lesson/canon-in-d-by-johann-pachelbel
// If I Ain't Got You,Alicia Keys,HARD,R&B / Soul,2000s,"soulful, passionate",,86.0,/lesson/if-i-aint-got-you-by-alicia-keys,https://hdpiano.com/lesson/if-i-aint-got-you-by-alicia-keys
// My Heart Will Go On,Titanic & Celine Dion,MEDIUM,Movie Theme / Pop,1990s,"sentimental, sweeping",,99.0,/lesson/my-heart-will-go-on-by-celine-dion,https://hdpiano.com/lesson/my-heart-will-go-on-by-celine-dion
// Purple Rain,Prince,EASY,Rock / Pop,1980s,"anthemic, emotional",B♭ major,84.0,/lesson/purple-rain-by-prince,https://hdpiano.com/lesson/purple-rain-by-prince
// Clair de Lune,Claude Debussy,HARD,Classical (Impressionist),1900s,"dreamy, serene",D♭ major,66.0,/lesson/clair-de-lune-by-claude-debussy-tutorial,https://hdpiano.com/lesson/clair-de-lune-by-claude-debussy-tutorial
// Another Love,Tom Odell,HARD,Indie Pop,2010s,"yearning, cathartic",,124.0,/lesson/another-love-by-tom-odell,https://hdpiano.com/lesson/another-love-by-tom-odell
// Purpose,Justin Bieber,MEDIUM,Pop / R&B,2010s,"intimate, hopeful",,120.0,/lesson/purpose-by-justin-bieber,https://hdpiano.com/lesson/purpose-by-justin-bieber

export const songs = pgTable(
  "songs",
  {
    id: uuid('id').primaryKey().notNull().defaultRandom(),
    title: varchar("title").notNull(),
    artist: varchar("artist").notNull(),
    difficulty: varchar("difficulty").notNull(),
    genre: varchar("genre").notNull(),
    decade: varchar("decade").notNull(),
    mood: varchar("mood"),
    key: varchar("key"),
    tempo_bpm: varchar("tempo_bpm"),
    hdpiano_path: varchar("hdpiano_path").notNull(),
    hdpiano_url: varchar("hdpiano_url").notNull(),
  },
  (table) => [
    // B-tree indexes for equality filters and sorting
    index("songTitleIdx").on(table.title),
    index("songArtistIdx").on(table.artist),
    index("songDifficultyIdx").on(table.difficulty),
    index("songGenreIdx").on(table.genre),
    index("songDecadeIdx").on(table.decade),
    // Trigram GIN indexes for fast ILIKE/substring searches (requires pg_trgm)
    index("songTitleTrgm").using("gin", table.title.op("gin_trgm_ops")),
    index("songArtistTrgm").using("gin", table.artist.op("gin_trgm_ops")),
    index("songMoodTrgm").using("gin", table.mood.op("gin_trgm_ops")),
  ]
);

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resources)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for resources - used to type API request params and within Components
export type NewResourceParams = z.infer<typeof insertResourceSchema>;

