import { createResource } from "@/lib/actions/resources";
import { searchSongsByFilters } from "@/lib/db/queries";
import { findRelevantContent } from "@/lib/ai/embedding";
import { openai } from "@ai-sdk/openai";
import { anthropic } from '@ai-sdk/anthropic';

import { generateObject, streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are a helpful assistant acting as the users' second brain.
    Use tools on every request.
    Be sure to getInformation from your knowledge base before answering any questions.
    If the user presents information about themselves, use the addResource tool to store it.
    If a response requires multiple tools, call one tool after another without responding to the user.
    If a response requires information from an additional tool to generate a response, call the appropriate tools in order before responding to the user.
    ONLY respond to questions using information from tool calls.
    if no relevant information is found in the tool calls, respond, "Sorry, I don't know."
    Be sure to adhere to any instructions in tool calls ie. if they say to respond like "...", do exactly that.
    If the relevant information is not a direct match to the users prompt, you can be creative in deducing the answer.
    Keep responses short and concise. Answer in a single sentence where possible.
    If you are unsure, use the getInformation tool and you can use common sense to reason based on the information you do have.
    Use your abilities as a reasoning machine to answer questions based on the information you do have.
`,
    tools: {
      addResource: tool({
        description: `add a resource to your knowledge base.
          If the user provides a random piece of knowledge unprompted, use this tool without asking for confirmation.`,
        parameters: z.object({
          content: z
            .string()
            .describe("the content or resource to add to the knowledge base"),
        }),
        execute: async ({ content }) => createResource({ content }),
      }),
      getInformation: tool({
        description: `get information from your knowledge base to answer questions.`,
        parameters: z.object({
          question: z.string().describe("the users question"),
          similarQuestions: z.array(z.string()).describe("keywords to search"),
        }),
        execute: async ({ similarQuestions }) => {
          const results = await Promise.all(
            similarQuestions.map(
              async (question) => await findRelevantContent(question),
            ),
          );
          // Flatten the array of arrays and remove duplicates based on 'name'
          const uniqueResults = Array.from(
            new Map(results.flat().map((item) => [item?.name, item])).values(),
          );
          return uniqueResults;
        },
      }),
      understandQuery: tool({
        description: `understand the users query. use this tool on every prompt.`,
        parameters: z.object({
          query: z.string().describe("the users query"),
          toolsToCallInOrder: z
            .array(z.string())
            .describe(
              "these are the tools you need to call in the order necessary to respond to the users query",
            ),
        }),
        execute: async ({ query }) => {
          const { object } = await generateObject({
            model: openai("gpt-4o"),
            system:
              "You are a query understanding assistant. Analyze the user query and generate similar questions.",
            schema: z.object({
              questions: z
                .array(z.string())
                .max(3)
                .describe("similar questions to the user's query. be concise."),
            }),
            prompt: `Analyze this query: "${query}". Provide the following:
                    3 similar questions that could help answer the user's query`,
          });
          return object.questions;
        },
      }),
      generateSqlQueryForSongSearch: tool({
        description: `Convert an open-ended question into structured song filters. Do NOT return SQL.`,
        parameters: z.object({
          query: z.string().describe("the user's question, e.g. 'easy beginner songs'"),
        }),
        execute: async ({ query }) => {
          const { object } = await generateObject({
            model: openai("gpt-4o"),
            system: `You map natural language to structured filters for a songs catalog.
Return fields only from this set: [title, artist, difficulty, genre, decade, mood, key, tempo_bpm].
Use match 'equals' for exact category matches (e.g., difficulty, genre, decade). Use 'contains' for substring text search (e.g., title, artist, mood).
Map beginner/easy -> difficulty=EASY, medium -> MEDIUM, hard/advanced -> HARD.
If unspecified, return a reasonable default like difficulty inferred from 'beginner/easy/medium/hard'. Keep filters under 4 items.`,
            schema: z.object({
              filters: z
                .array(
                  z.object({
                    field: z.enum([
                      "title",
                      "artist",
                      "difficulty",
                      "genre",
                      "decade",
                      "mood",
                      "key",
                      "tempo_bpm",
                    ]),
                    match: z.enum(["equals", "contains"]).default("equals"),
                    value: z.string().min(1),
                  }),
                )
                .max(4),
              sortBy: z
                .enum(["title", "artist", "decade", "tempo_bpm"]) // optional
                .optional(),
              sortOrder: z.enum(["asc", "desc"]).optional(),
              limit: z.number().int().min(1).max(50).optional(),
            }),
            prompt: `User question: ${query}`,
          });
          return object;
        },
      }),
      searchSongs: tool({
        description: `Execute a songs search using structured filters. Use this after generating filters.`,
        parameters: z.object({
          filters: z.array(
            z.object({
              field: z.enum([
                "title",
                "artist",
                "difficulty",
                "genre",
                "decade",
                "mood",
                "key",
                "tempo_bpm",
              ]),
              match: z.enum(["equals", "contains"]).default("equals"),
              value: z.string(),
            }),
          ),
          sortBy: z.enum(["title", "artist", "decade", "tempo_bpm"]).optional(),
          sortOrder: z.enum(["asc", "desc"]).optional(),
          limit: z.number().int().min(1).max(50).optional(),
        }),
        execute: async ({ filters, sortBy, sortOrder, limit }) => {
          const rows = await searchSongsByFilters({ filters, sortBy, sortOrder, limit });
          return rows;
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
