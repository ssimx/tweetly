import Link from 'next/link';
import React from 'react'

export default function PostContent({ content, searchSegments }: { content: string, searchSegments?: string[] }) {
    const parseContent = (text: string) => {
        // Regex to match hashtags
        const hashtagRegex = /#\w+/g;

        const highlightWords = searchSegments?.map(segment => segment.toLowerCase()) || [];
        const wordRegex = highlightWords.length
            ? new RegExp(`\\b(${highlightWords.join("|")})\\b`, "gi")
            : null;

        // Split text while keeping hashtags
        const parts = text.split(/(#[^\s]+)/g);

        // Map over the parts to render text and hashtags
        return parts.map((part, index) => {
            if (hashtagRegex.test(part)) {
                // If the part is a hashtag, render as a clickable link
                const hashtag = part.slice(1); // Remove '#' for the URL
                return (
                    <Link key={index} href={`http://localhost:3000/search?q=${encodeURIComponent(`#${hashtag}`)}`}
                        className={`text-blue-500 hover:underline ${searchSegments && searchSegments.some((word) => word.toLowerCase() === part.toLowerCase()) ? 'font-bold' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        >
                    {part}
                    </Link>
                );
            } else if (wordRegex && wordRegex.test(part)) {
                // If the part matches a search segment, split further to highlight words
                const subParts = part.split(wordRegex);
                return subParts.map((subPart, subIndex) =>
                    wordRegex.test(subPart) ? (
                        <span key={`${index}-${subIndex}`} className="font-bold">
                            {subPart}
                        </span>
                    ) : (
                        <span key={`${index}-${subIndex}`}>{subPart}</span>
                    )
                );
            }
            // Render non-hashtag parts as plain text
            return <span key={index}>{part}</span>;
        });
    };

    return <p>{parseContent(content)}</p>;
}
