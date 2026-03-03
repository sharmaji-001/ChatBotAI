import React, { useState } from 'react';
import './ChatHeader.css';
import icon from './image.jpg';

//const BotIcon = () => (
  //<svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    //<rect x="4" y="9" width="20" height="15" rx="4" fill="url(#botGrad)" />
    //<rect x="10" y="13" width="3" height="3" rx="1.5" fill="white" opacity="0.9"/>
    //<rect x="15" y="13" width="3" height="3" rx="1.5" fill="white" opacity="0.9"/>
    //<path d="M11 20 Q14 22 17 20" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8"/>
    //<line x1="14" y1="9" x2="14" y2="5" stroke="#42a5f5" strokeWidth="2" strokeLinecap="round"/>
    //<circle cx="14" cy="4" r="2" fill="#00e5ff"/>
    //<rect x="1" y="13" width="3" height="7" rx="1.5" fill="#1565c0" opacity="0.7"/>
    //<rect x="24" y="13" width="3" height="7" rx="1.5" fill="#1565c0" opacity="0.7"/>
    //<defs>
      //<linearGradient id="botGrad" x1="4" y1="9" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        //<stop offset="0%" stopColor="#1976d2"/>
        //<stop offset="100%" stopColor="#0d47a1"/>
      //</linearGradient>
    //</defs>
  //</svg>
//);


const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const MsgIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

function formatSessionDate(isoString) {
  if (!isoString) return null;
  try {
    const d       = new Date(isoString);
    const diffMs  = Date.now() - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1)   return 'Just now';
    if (diffMin < 60)  return `${diffMin}m ago`;
    if (diffHr  < 24)  return `${diffHr}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch { return null; }
}

export default function ChatHeader({ onClear, hasMessages, sessionId, startedAt, messageCount }) {
  const [confirmClear,     setConfirmClear]     = useState(false);
  const [showSessionInfo,  setShowSessionInfo]  = useState(false);

  const handleClear = () => {
    if (confirmClear) { onClear(); setConfirmClear(false); }
    else              { setConfirmClear(true); setTimeout(() => setConfirmClear(false), 3000); }
  };

  const sessionAge   = formatSessionDate(startedAt);
  const shortSession = sessionId ? sessionId.slice(0, 8).toUpperCase() : null;

  return (
    <header className="chat-header">
      <div className="header-left">
        <div className="bot-avatar">
         
<img src={icon} alt="logo" />
          <span className="status-dot" />
        </div>
        <div className="header-info">
          <h1 className="header-title">Chat with Raptbot</h1>
          <p className="header-sub">Rapt AI</p>
        </div>
      </div>

      <div className="header-right">
        <span className="live-badge">
          <span className="live-dot" />
          Online
        </span>

        {/* Session pill — click to see session details */}
        
        {hasMessages && (
          <button
            className={`clear-btn ${confirmClear ? 'confirm' : ''}`}
            onClick={handleClear}
            title="Clear chat and start a new session"
          >
            
            <span>{confirmClear ? 'Confirm?' : 'New Chat'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
