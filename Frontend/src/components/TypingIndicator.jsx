import React from 'react';
import './TypingIndicator.css';

export default function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="typing-avatar">
        <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
          <rect x="4" y="9" width="20" height="15" rx="4" fill="url(#tGrad)"/>
          <rect x="9" y="13" width="3" height="3" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="16" y="13" width="3" height="3" rx="1.5" fill="white" opacity="0.9"/>
          <line x1="14" y1="9" x2="14" y2="5" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="14" cy="4" r="2" fill="#00e5ff"/>
          <defs>
            <linearGradient id="tGrad" x1="4" y1="9" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1976d2"/><stop offset="100%" stopColor="#0d47a1"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="typing-bubble">
        <div className="typing-label">Rapt Ai is thinking</div>
        <div className="typing-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
