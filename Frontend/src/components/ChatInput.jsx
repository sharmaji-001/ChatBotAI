import React, { useState, useRef, useEffect } from 'react';
import './ChatInput.css';

const SendIcon = ({ active }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
      stroke={active ? 'white' : 'currentColor'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function ChatInput({ onSend, isLoading, started }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);
  const canSend = value.trim().length > 0 && !isLoading;

  /* Auto resize */
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = `${Math.min(ta.scrollHeight, 140)}px`;
    }
  }, [value]);

  /* Auto focus when reply finishes */
  useEffect(() => {
    if (!isLoading) {
      const t = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [isLoading]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(value);
    setValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-zone">
      <div className="chat-input-bar">

        {/* Floating Placeholder Wrapper */}
        <div className="textarea-wrapper">
          <span
            className={`floating-placeholder ${value ? 'hidden' : ''}`}
          >
            {started
              ? 'Hello Rapt AI here'
              : 'Ask anything about Raptbot'}
          </span>

          <textarea
            ref={textareaRef}
            className="chat-textarea"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
            aria-label="Message input"
          />
        </div>

        <button
          className={`send-btn ${canSend ? 'active' : ''}`}
          onClick={handleSend}
          disabled={!canSend}
          aria-label="Send message"
          title={isLoading ? 'Waiting for response…' : 'Send (Enter)'}
        >
          {isLoading ? (
            <div className="send-spinner" />
          ) : (
            <SendIcon active={canSend} />
          )}
        </button>

      </div>

      <p className="input-hint">
        Press <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for new line
        · Powered by <span className="brand-hint">Raptbot Technologies</span>
      </p>
    </div>
  );
}