'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import { Thread } from '../components/Thread';

// Interface B: quick-action intents. Conversational, low-typing. Every button
// fires a REAL model query (no canned answers), so it has to be accurate.
export default function Quick() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const busy = status === 'submitted' || status === 'streaming';

  function ask(text: string, files?: FileList) {
    if (!text.trim() && !files?.length) return;
    sendMessage({ text, files });
    setInput('');
  }

  return (
    <div className="quick">
      <div className="actions">
        <button
          disabled={busy}
          onClick={() => ask('Help me figure out where I am in the groom and what to do next.')}
        >
          What do I do next?
        </button>
        <button disabled={busy} onClick={() => fileRef.current?.click()}>
          How&apos;s it looking? 📸
        </button>
        <button disabled={busy} onClick={() => setInput('How do I ')}>
          How do I…
        </button>
        <button disabled={busy} onClick={() => setInput('Is it okay to ')}>
          Wait, is this okay?
        </button>
        <button disabled={busy} onClick={() => setInput('Show me what a ')}>
          Show me one
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => {
          const f = e.target.files ?? undefined;
          if (f?.length) {
            ask("Here's what I've got so far, how's it looking and what should I fix first?", f);
          }
          if (fileRef.current) fileRef.current.value = '';
        }}
      />

      {messages.length === 0 && (
        <p className="qhint">Tap one above, or just tell me what&apos;s going on down there 👇</p>
      )}

      <Thread messages={messages} />

      <div className="composer">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              ask(input);
            }
          }}
          placeholder="Or just ask me anything…"
          rows={1}
        />
        <button onClick={() => ask(input)} disabled={busy}>
          {busy ? '…' : 'Send'}
        </button>
      </div>
    </div>
  );
}
