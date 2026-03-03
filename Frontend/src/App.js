import React, { useState, useRef, useEffect, useCallback } from 'react';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import WelcomeScreen from './components/WelcomeScreen';
import SessionBanner from './components/SessionBanner';
import './App.css';

// ── Replace with your deployed backend URL ──────────────────────────
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';
// ────────────────────────────────────────────────────────────────────

const STORAGE_KEY_MESSAGES   = 'rapt_chat_messages';
const STORAGE_KEY_SESSION_ID = 'rapt_session_id';
const STORAGE_KEY_STARTED_AT = 'rapt_session_started_at';

// ── Helpers: load & save to localStorage ────────────────────────────
function loadSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
    const msgs = raw ? JSON.parse(raw) : [];
    // Re-hydrate Date objects from JSON strings
    const hydrated = msgs.map(m => ({ ...m, timestamp: new Date(m.timestamp) }));
    return {
      messages:   hydrated,
      sessionId:  localStorage.getItem(STORAGE_KEY_SESSION_ID) || null,
      startedAt:  localStorage.getItem(STORAGE_KEY_STARTED_AT) || null,
    };
  } catch {
    return { messages: [], sessionId: null, startedAt: null };
  }
}

function saveSession(messages, sessionId, startedAt) {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES,   JSON.stringify(messages));
    localStorage.setItem(STORAGE_KEY_SESSION_ID, sessionId  || '');
    localStorage.setItem(STORAGE_KEY_STARTED_AT, startedAt || '');
  } catch { /* storage full — ignore */ }
}

function clearSession() {
  localStorage.removeItem(STORAGE_KEY_MESSAGES);
  localStorage.removeItem(STORAGE_KEY_SESSION_ID);
  localStorage.removeItem(STORAGE_KEY_STARTED_AT);
}
// ────────────────────────────────────────────────────────────────────

function App() {
  const saved = loadSession();

  const [messages,   setMessages]   = useState(saved.messages);
  const [sessionId,  setSessionId]  = useState(saved.sessionId);
  const [startedAt,  setStartedAt]  = useState(saved.startedAt);
  const [isLoading,  setIsLoading]  = useState(false);
  const [error,      setError]      = useState(null);
  const [showBanner, setShowBanner] = useState(saved.messages.length > 0); // show "resuming" banner

  const started      = messages.length > 0;
  const messagesEndRef = useRef(null);

  // ── Persist to localStorage whenever messages/session change ──────
  useEffect(() => {
    saveSession(messages, sessionId, startedAt);
  }, [messages, sessionId, startedAt]);

  // ── Auto-scroll ───────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isLoading, scrollToBottom]);

  // ── Hide resume banner after 4s ───────────────────────────────────
  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => setShowBanner(false), 4000);
      return () => clearTimeout(t);
    }
  }, [showBanner]);

  // ── Send message ─────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;
    setShowBanner(false);
    setError(null);

    const now = new Date();

    // Set startedAt only once (very first message)
    if (!startedAt) {
      setStartedAt(now.toISOString());
    }

    const userMsg = {
      id:        Date.now(),
      role:      'user',
      text:      text.trim(),
      timestamp: now,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text.trim(), session_id: sessionId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error (${res.status})`);
      }

      const data = await res.json();

      // Save session ID returned by backend
      if (data.session_id) setSessionId(data.session_id);

      const botMsg = {
        id:             Date.now() + 1,
        role:           'assistant',
        text:           data.reply,
        timestamp:      new Date(data.timestamp),
        responseTimeMs: data.response_time_ms,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, startedAt]);

  // ── Clear everything ──────────────────────────────────────────────
  const clearChat = useCallback(() => {
    clearSession();
    setMessages([]);
    setSessionId(null);
    setStartedAt(null);
    setError(null);
    setShowBanner(false);
  }, []);

  return (
    <div className="app-shell">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="chat-window">
        <ChatHeader
          onClear={clearChat}
          hasMessages={started}
          sessionId={sessionId}
          startedAt={startedAt}
          messageCount={messages.length}
        />

        {/* Resume banner — shown when user comes back to an existing session */}
        {showBanner && (
          <SessionBanner
            messageCount={messages.length}
            startedAt={startedAt}
            onDismiss={() => setShowBanner(false)}
          />
        )}

        <div className="chat-body">
          {!started ? (
            <WelcomeScreen onSend={sendMessage} />
          ) : (
            <MessageList
              messages={messages}
              isLoading={isLoading}
              error={error}
              onRetry={() => setError(null)}
              messagesEndRef={messagesEndRef}
            />
          )}
        </div>

        <ChatInput onSend={sendMessage} isLoading={isLoading} started={started} />
      </div>
    </div>
  );
}

export default App;
