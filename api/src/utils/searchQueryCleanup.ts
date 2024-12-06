import { z } from "zod";

// Define the Zod schema for validation
const searchSchema = z
    .string()
    .trim()
    .min(1, "Search query cannot be empty.")
    .max(100, "Search query cannot exceed 100 characters.")
    .regex(/^[a-zA-Z0-9\s\-_'$#@]+$/, "Search query contains invalid characters.");

export function searchQueryCleanup(query: string) {
    // Validate query against the schema
    const validatedQuery = searchSchema.parse(query);

    // Split the query into words for advanced search capabilities
    const segments = validatedQuery
        .split(/\s+/) // Split by whitespace
        .filter((segment) => segment.length > 0); // Remove empty segments

    // Create a structure for the cleaned query
    const searchParams = {
        raw: validatedQuery, // The full, cleaned query string
        segments: segments, // The query split into parts
        stringSegments: segments
            .filter((segment) => /^[a-zA-Z0-9]+$/.test(segment)),
        usernames: segments
            .filter((segment) => segment.startsWith('@'))
            .map((hashtag) => hashtag.slice(1)),
        hashtags: segments
            .filter((segment) => segment.startsWith('#'))
            .map((hashtag) => hashtag.slice(1)),
    };

    return searchParams;
}