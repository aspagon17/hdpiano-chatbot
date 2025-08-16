DROP INDEX "songIndex";--> statement-breakpoint
CREATE INDEX "songTitleIdx" ON "songs" USING btree ("title");--> statement-breakpoint
CREATE INDEX "songArtistIdx" ON "songs" USING btree ("artist");--> statement-breakpoint
CREATE INDEX "songDifficultyIdx" ON "songs" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "songGenreIdx" ON "songs" USING btree ("genre");--> statement-breakpoint
CREATE INDEX "songDecadeIdx" ON "songs" USING btree ("decade");--> statement-breakpoint
CREATE INDEX "songTitleTrgm" ON "songs" USING gin ("title" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "songArtistTrgm" ON "songs" USING gin ("artist" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "songMoodTrgm" ON "songs" USING gin ("mood" gin_trgm_ops);