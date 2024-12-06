import { redirect } from 'next/navigation';
import React from 'react'

export default function PostContent({ content }: { content: string }) {
    const parseContent = (text: string) => {
        // Regex to match hashtags
        const hashtagRegex = /#\w+/g;

        // Split text while keeping hashtags
        const parts = text.split(/(#[^\s]+)/g);

        // Map over the parts to render text and hashtags
        return parts.map((part, index) => {
            if (hashtagRegex.test(part)) {
                // If the part is a hashtag, render as a clickable link
                const hashtag = part.slice(1); // Remove '#' for the URL
                return (
                    <a
                        key={index}
                        href={`/hashtag/${hashtag}`}
                        className="text-blue-500 hover:underline"
                        onClick={() => {
                            redirect(`http://localhost:3000/hashtag/${hashtag}`);
                        }}
                    >
                        {part}
                    </a>
                );
            }
            // Render non-hashtag parts as plain text
            return <span key={index}>{part}</span>;
        });
    };

    return <p>{parseContent(content)}</p>;
}
