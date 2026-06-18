'use client';

import type { UIMessage } from 'ai';

// Shared message renderer for both interfaces. Renders text and any reference
// images returned by the findReferenceImages tool.
export function Thread({ messages }: { messages: UIMessage[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="thread">
      {messages.map((m) => (
        <div key={m.id} className={`msg ${m.role}`}>
          {m.parts.map((part, i) => {
            if (part.type === 'text') return <p key={i}>{part.text}</p>;
            if (
              part.type === 'tool-findReferenceImages' &&
              'state' in part &&
              part.state === 'output-available'
            ) {
              const matches =
                (part.output as Array<{ id: string; url: string; caption: string }>) ?? [];
              return matches.map((img) => (
                <figure key={img.id} className="ref">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption} />
                  <figcaption>{img.caption}</figcaption>
                </figure>
              ));
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
}
