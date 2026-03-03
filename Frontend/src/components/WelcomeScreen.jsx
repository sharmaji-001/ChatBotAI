import React from 'react';
import './WelcomeScreen.css';

const QUICK_PROMPTS = [
  { icon: '⚡', label: 'What services do you offer?',         text: 'What Salesforce services does Raptbot offer?' },
  { icon: '💰', label: 'How does pricing work?',              text: 'How does your pricing and engagement model work?' },
  { icon: '🌍', label: 'Which regions do you serve?',         text: 'Which countries and regions does Raptbot serve?' },
  { icon: '🔗', label: 'Can you do Salesforce integrations?', text: 'What third-party integrations can you help with in Salesforce?' },
  { icon: '👥', label: 'Tell me about staff augmentation',    text: 'How does your Salesforce staff augmentation service work?' },
  { icon: '🚀', label: 'How do I get started?',               text: 'How do I get started working with Raptbot Technologies?' },
];

export default function WelcomeScreen({ onSend }) {
  return (
    <div className="welcome-screen">
      <div className="welcome-hero">
        <div className="welcome-bot-ring">
          <div className="ring ring-outer" />
          <div className="ring ring-inner" />
          <div className="welcome-bot-icon">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="6" y="13" width="28" height="20" rx="6" fill="url(#wbGrad)"/>
              <rect x="13" y="19" width="5" height="5" rx="2.5" fill="white" opacity="0.95"/>
              <rect x="22" y="19" width="5" height="5" rx="2.5" fill="white" opacity="0.95"/>
              <path d="M15 29 Q20 32 25 29" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <line x1="20" y1="13" x2="20" y2="7" stroke="#00e5ff" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="20" cy="5" r="3" fill="#00e5ff"/>
              <rect x="1" y="18" width="5" height="10" rx="2.5" fill="#1565c0" opacity="0.6"/>
              <rect x="34" y="18" width="5" height="10" rx="2.5" fill="#1565c0" opacity="0.6"/>
              <defs>
                <linearGradient id="wbGrad" x1="6" y1="13" x2="34" y2="33" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1976d2"/>
                  <stop offset="100%" stopColor="#0d47a1"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h2 className="welcome-title">
          Hi, I'm <span className="accent-text">Rapt AI</span>
        </h2>
        <p className="welcome-sub">
          Your AI assistant at Raptbot Technologies — here to help with everything
         Raptbot Technologies. Ask me anything.
        </p>
      </div>

      <div className="quick-prompts-grid">
        {QUICK_PROMPTS.map((p, i) => (
          <button
            key={i}
            className="quick-prompt-card"
            style={{ animationDelay: `${i * 0.07}s` }}
            onClick={() => onSend(p.text)}
          >
            <span className="qp-icon">{p.icon}</span>
            <span className="qp-label">{p.label}</span>
            <span className="qp-arrow">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
