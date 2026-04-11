import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Sparkles, Loader2, Wifi, WifiOff, Zap } from 'lucide-react';

const SYSTEM_PROMPT = `당신은 성경 말씀 해석을 돕는 따뜻하고 지혜로운 신앙 도우미입니다.
사용자가 성경 구절에 대해 질문하면, 한국어로 명확하고 감동적이며 깊이 있는 답변을 제공하세요.
구절의 배경과 의미, 삶에 적용할 방법, 관련 성경 구절을 포함해 답변해 주세요.
따뜻하고 친근한 어조를 유지하되 신학적 깊이를 갖추세요. 답변은 적절한 줄바꿈과 단락으로 읽기 좋게 구성하세요.`;

const OLLAMA_API = 'http://localhost:11434/v1/chat/completions';
const OLLAMA_MODEL = 'gemma3:4b';

const GEMINI_KEY = 'AIzaSyDwjTGXhQQKAzy42rXO-X4UMUl4EC_k1nA';
const GEMINI_API = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;

// Ollama 호출
const callOllama = async (messages) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃
  try {
    const res = await fetch(OLLAMA_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ollama' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
        stream: false,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`ollama_error:${res.status}`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
};

// Gemini 호출
const callGemini = async (messages) => {
  // 대화 히스토리 변환 (Gemini 형식)
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const res = await fetch(GEMINI_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { temperature: 0.85, maxOutputTokens: 1024 },
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `gemini_error:${res.status}`);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 받지 못했습니다.';
};

const SUGGESTIONS = [
  '불안할 때 힘이 되는 말씀 추천해줘',
  '요한복음 3:16을 쉽게 설명해줘',
  '인내에 대한 말씀은?',
  '기도문을 작성해줘',
  '시편 23편의 의미는?',
  '오늘 힘들어. 위로해줘',
];

const AiAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '안녕하세요! 저는 Joshua 말씀묵상의 신앙 AI 도우미입니다. ✨\n\n성경 구절의 의미가 궁금하거나, 지금 마음에 위로가 필요하거나, 말씀을 삶에 어떻게 적용할지 고민되신다면 편하게 질문해 주세요.\n\n예) "요한복음 3:16의 의미를 쉽게 설명해줘" 또는 "지금 많이 지쳐있어, 위로의 말씀 추천해줘"',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState(null); // 'ollama' | 'gemini' | null
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input };
    const history = [...messages.filter(m => m.role !== 'system'), userMsg];
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    let reply = '';
    try {
      // 1순위: Ollama
      reply = await callOllama(history);
      setAiSource('ollama');
    } catch {
      // 2순위: Gemini fallback
      try {
        reply = await callGemini(history);
        setAiSource('gemini');
      } catch (geminiErr) {
        reply = `죄송합니다. AI 연결에 실패했습니다.\n\n오류: ${geminiErr.message}`;
        setAiSource(null);
      }
    }

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - var(--navbar-height) - var(--bottomnav-height) - 2rem)', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--accent-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <Sparkles size={24} /> 신앙 AI 도우미
        </h2>
        {/* AI 연결 상태 뱃지 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {aiSource === 'ollama' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.9rem',
              borderRadius: '20px', background: 'rgba(91,191,110,0.12)', border: '1px solid rgba(91,191,110,0.3)',
              color: '#5bbf6e', fontSize: '0.78rem', fontWeight: 600 }}>
              <Wifi size={12} /> Ollama 로컬 모델
            </span>
          )}
          {aiSource === 'gemini' && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.9rem',
              borderRadius: '20px', background: 'rgba(79,134,198,0.12)', border: '1px solid rgba(79,134,198,0.3)',
              color: '#4f86c6', fontSize: '0.78rem', fontWeight: 600 }}>
              <Zap size={12} /> Gemini 2.0 Flash
            </span>
          )}
          {aiSource === null && !loading && messages.length > 1 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.9rem',
              borderRadius: '20px', background: 'rgba(255,100,100,0.08)', border: '1px solid rgba(255,100,100,0.2)',
              color: '#e53e3e', fontSize: '0.78rem' }}>
              <WifiOff size={12} /> 연결 없음
            </span>
          )}
          {aiSource === null && messages.length === 1 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Ollama → Gemini 자동 연결
            </span>
          )}
        </div>
      </div>

      {/* Suggestion chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
        {SUGGESTIONS.map((s, i) => (
          <button key={i} onClick={() => setInput(s)}
            style={{ padding: '0.35rem 0.9rem', borderRadius: '20px', border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer',
              transition: 'all 0.2s', minHeight: '32px', whiteSpace: 'nowrap' }}
            onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent-gold)'; e.currentTarget.style.color = 'var(--accent-gold)'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
            {s}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, minHeight: 0 }}>
        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.2rem', minHeight: 0 }}>
          {messages.map((msg, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: 'min(80%, 640px)',
                background: msg.role === 'user' ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                padding: '0.9rem 1.2rem',
                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                border: msg.role === 'assistant' ? '1px solid var(--glass-border)' : 'none',
                boxShadow: 'var(--shadow-sm)',
              }}>
              <p style={{ lineHeight: 1.85, whiteSpace: 'pre-wrap', wordBreak: 'keep-all', fontSize: '0.95rem' }}>
                {msg.content}
              </p>
            </motion.div>
          ))}

          {loading && (
            <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.9rem 1.2rem',
              background: 'var(--bg-secondary)', borderRadius: '18px 18px 18px 4px', border: '1px solid var(--glass-border)' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent-gold)', flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {aiSource === 'gemini' ? 'Gemini가 말씀을 탐색하는 중...' : 'AI가 말씀을 탐색하는 중...'}
              </span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.8rem', alignItems: 'center', background: 'var(--glass-bg)', flexShrink: 0 }}>
          <input type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="성경 질문을 자유롭게 입력하세요..."
            style={{ flex: 1, padding: '0.85rem 1.2rem', borderRadius: '30px', border: '1px solid var(--glass-border)',
              background: 'transparent', color: 'var(--text-primary)', outline: 'none', fontSize: '1rem', minWidth: 0 }} />
          <button onClick={sendMessage} disabled={loading || !input.trim()}
            style={{ padding: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
              background: loading || !input.trim() ? 'var(--text-secondary)' : 'var(--accent-gold)',
              color: '#fff', border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s', flexShrink: 0, minWidth: '48px', minHeight: '48px' }}>
            {loading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={20} />}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  );
};

export default AiAssistant;
