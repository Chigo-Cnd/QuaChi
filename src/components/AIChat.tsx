import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Trash2, Loader2, Settings } from 'lucide-react';
import { useAIChatStore, useUserStore } from '@/store';
import type { ChatMessage, AIMode } from '@/types';

const AI_MODES: { value: AIMode; label: string }[] = [
  { value: 'general',    label: 'General Tutor'  },
  { value: 'experiment', label: 'Experiment Help' },
  { value: 'calculator', label: 'Calc Assistant' },
  { value: 'report',     label: 'Report Writer'  },
];

const FREE_LIMIT = 20;

interface Props {
  fullPage?: boolean;
  embedded?: boolean;
}

export default function AIChat({ fullPage, embedded }: Props) {
  const { messages, isStreaming, context, addMessage, clearMessages, setStreaming, appendToLastMessage, setContext } = useAIChatStore();
  const { tier } = useUserStore();
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const msgCount = messages.filter(m => m.role === 'user').length;
  const overLimit = tier === 'free' && msgCount >= FREE_LIMIT;

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isStreaming || overLimit) return;
    setInput('');

    const userMsg: ChatMessage = {
      id:        Date.now().toString(),
      role:      'user',
      content:   text,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    const aiMsg: ChatMessage = {
      id:        (Date.now() + 1).toString(),
      role:      'assistant',
      content:   '',
      timestamp: new Date(),
    };
    addMessage(aiMsg);
    setStreaming(true);

    try {
      const body = JSON.stringify({
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
        context,
      });

      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) throw new Error('AI service error');
      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) appendToLastMessage(parsed.text);
          } catch {}
        }
      }
    } catch (err) {
      appendToLastMessage('\n\n*Sorry, there was an error connecting to QuaChi AI. Please check your API key and try again.*');
    } finally {
      setStreaming(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const QUICK_PROMPTS = [
    'Explain this experiment to me',
    'What are the safety precautions?',
    'How do I calculate the result?',
    'What is the theory behind this?',
  ];

  return (
    <div className={`flex flex-col ${fullPage ? 'h-[calc(100vh-56px)]' : 'h-full'}`}>
      {/* ── Header ── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
        <Bot size={20} style={{ color: 'var(--accent)' }} />
        <div className="flex-1">
          <span className="font-bold text-sm">QuaChi AI</span>
          <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
            {tier === 'free' ? `${msgCount}/${FREE_LIMIT} messages` : 'Pro — unlimited'}
          </span>
        </div>
        <button onClick={() => setShowSettings(s => !s)}
          className="p-1.5 rounded-lg hover:bg-[var(--accent-light)] transition-colors">
          <Settings size={16} style={{ color: 'var(--text-muted)' }} />
        </button>
        {messages.length > 0 && (
          <button onClick={clearMessages}
            className="p-1.5 rounded-lg hover:bg-[var(--accent-light)] transition-colors"
            title="Clear chat">
            <Trash2 size={16} style={{ color: 'var(--text-muted)' }} />
          </button>
        )}
      </div>

      {/* Mode Selector */}
      {showSettings && (
        <div className="px-4 py-2 border-b flex gap-2 overflow-x-auto flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)' }}>
          {AI_MODES.map(m => (
            <button key={m.value}
              onClick={() => setContext({ mode: m.value })}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: context.mode === m.value ? 'var(--accent)' : 'var(--surface)',
                color:      context.mode === m.value ? 'white' : 'var(--text-secondary)',
              }}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Bot size={40} className="mx-auto mb-3" style={{ color: 'var(--accent)' }} />
            <h3 className="font-bold mb-1">QuaChi AI</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Your personal chemistry tutor. Ask me anything!
            </p>
            <div className="grid grid-cols-1 gap-2">
              {QUICK_PROMPTS.map(p => (
                <button key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="text-left px-3 py-2.5 rounded-xl text-sm border transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent-light)]"
                  style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-tertiary)' }}>
              {msg.role === 'user'
                ? <User size={16} color="white" />
                : <Bot size={16} style={{ color: 'var(--accent)' }} />
              }
            </div>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user' ? 'rounded-tr-sm' : 'rounded-tl-sm'
            }`}
              style={{
                background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)',
                color:      msg.role === 'user' ? 'white' : 'var(--text-primary)',
                border:     msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
              }}>
              {msg.content || (isStreaming && msg.role === 'assistant' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : '')}
            </div>
          </div>
        ))}

        {isStreaming && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}>
              <Bot size={16} style={{ color: 'var(--accent)' }} />
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm flex items-center gap-2"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
              <span style={{ color: 'var(--text-muted)' }}>QuaChi AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input ── */}
      {overLimit ? (
        <div className="p-4 text-center border-t" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
            Free limit reached ({FREE_LIMIT} messages/day)
          </p>
          <button className="btn-primary text-sm w-full justify-center">
            Upgrade to Pro — Unlimited AI
          </button>
        </div>
      ) : (
        <div className="p-3 border-t flex gap-2 flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask QuaChi AI a chemistry question..."
            rows={2}
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] transition-colors"
            style={{
              background:   'var(--surface)',
              border:       '1px solid var(--border)',
              color:        'var(--text-primary)',
              lineHeight:   '1.5',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isStreaming}
            className="self-end p-2.5 rounded-xl transition-all flex-shrink-0"
            style={{
              background: input.trim() && !isStreaming ? 'var(--accent)' : 'var(--bg-tertiary)',
              color:      input.trim() && !isStreaming ? 'white' : 'var(--text-muted)',
            }}>
            {isStreaming
              ? <Loader2 size={18} className="animate-spin" />
              : <Send size={18} />
            }
          </button>
        </div>
      )}
    </div>
  );
}
