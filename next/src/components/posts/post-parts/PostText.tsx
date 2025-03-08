import Link from 'next/link';
import React from 'react'

export default function PostText({ content, searchSegments }: { content: string | undefined, searchSegments?: string[] }) {
    if (!content) return <p></p>;

    const parseContent = (text: string) => {
        // Regex to match hashtags
        const hashtagRegex = /#\w+/g;

        // Regex to match tags
        const tagRegex = /@\w+/g;

        // Regex to match URLs (http, https, www)
        const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi;

        const highlightSegments = searchSegments?.map(segment => segment.toLowerCase()) || [];
        const wordRegex = highlightSegments.length
            ? new RegExp(`(${highlightSegments.join("|")})`, "gi")
            : null;

        // Split text while keeping hashtags, tags, and URLs
        const parts = text.split(/([#@][^\s]+|https?:\/\/[^\s]+|www\.[^\s]+)/g);

        // Map over the parts to render text and hashtags
        return parts.map((part, index) => {
            if (hashtagRegex.test(part)) {
                // If the part is a hashtag, render as a clickable link
                const hashtag = part.slice(1); // Remove '#' for the URL
                return (
                    <Link key={index} href={`http://localhost:3000/search?q=${encodeURIComponent(`#${hashtag}`)}`}
                        className={`text-primary hover:underline ${searchSegments && searchSegments.some((word) => word.toLowerCase() === part.toLowerCase()) ? 'font-bold' : ''}`}
                        onClick={(e) => e.stopPropagation()}
                        >
                    {part}
                    </Link>
                );
            } else if (tagRegex.test(part)) {
                // If the part is a tag, render as a clickable link
                const tag = part.slice(1).toLowerCase(); // Remove '@' for the URL
                return (
                    <Link key={index} href={`http://localhost:3000/${tag}`}
                        className='text-primary hover:underline'
                        onClick={(e) => e.stopPropagation()}
                    >
                        {part}
                    </Link>
                );
            } else if (urlRegex.test(part)) {
                // Ensure the URL starts with http or https
                const url = part.startsWith('http') ? part : `https://${part}`;
                return (
                    <Link key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
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
