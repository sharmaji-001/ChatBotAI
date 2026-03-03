import React, { useState } from 'react';
import './Message.css';

function formatTime(date) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date instanceof Date ? date : new Date(date));
}

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function Message({ message, isLast }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  /* Render simple markdown-like formatting without external lib */
  const renderText = (text) => {
    const paragraphs = text.split(/\n\n+/);
    return paragraphs.map((para, i) => {
      const lines = para.split('\n');
      return (
        <p key={i} className="msg-para">
          {lines.map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {renderInline(line)}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  const renderInline = (text) => {
    // Bold **text**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`message-row ${isUser ? 'user' : 'bot'} ${isLast ? 'last' : ''}`}>
      {!isUser && (
        <div className="msg-avatar bot-avatar-sm">
          <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
            <rect x="4" y="9" width="20" height="15" rx="4" fill="url(#bGrad)"/>
            <rect x="9" y="13" width="3" height="3" rx="1.5" fill="white" opacity="0.9"/>
            <rect x="16" y="13" width="3" height="3" rx="1.5" fill="white" opacity="0.9"/>
            <path d="M10 20 Q14 22 18 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            <line x1="14" y1="9" x2="14" y2="5" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="14" cy="4" r="2" fill="#00e5ff"/>
            <defs>
              <linearGradient id="bGrad" x1="4" y1="9" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1976d2"/><stop offset="100%" stopColor="#0d47a1"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}

      <div className="msg-content-wrapper">
        {!isUser && <span className="msg-sender-label">Rapt Ai </span>}

        <div className={`msg-bubble ${isUser ? 'bubble-user' : 'bubble-bot'}`}>
          <div className="msg-text">
            {renderText(message.text)}
          </div>
        </div>

        <div className="msg-meta">
          <span className="msg-time">{formatTime(message.timestamp)}</span>
          {!isUser && message.responseTimeMs && (
            <span className="msg-speed">{message.responseTimeMs}ms</span>
          )}
          {!isUser && (
            <button className="copy-btn" onClick={handleCopy} title="Copy message">
              {copied ? <CheckIcon /> : <CopyIcon />}
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div className="msg-avatar user-avatar-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      )}
    </div>
  );
}
