import React from 'react';
import './SessionBanner.css';

function formatRelativeTime(isoString) {
  if (!isoString) return 'a previous session';
  try {
    const d       = new Date(isoString);
    const diffMs  = Date.now() - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr  = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1)   return 'moments ago';
    if (diffMin < 60)  return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHr  < 24)  return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
    if (diffDay === 1) return 'yesterday';
    return `${diffDay} days ago`;
  } catch { return 'earlier'; }
}

export default function SessionBanner({ messageCount, startedAt, onDismiss }) {
  const when = formatRelativeTime(startedAt);

  return (
    <div className="session-banner">
      <div className="session-banner-left">
        <span className="session-banner-icon">🔄</span>
        <div className="session-banner-text">
          <strong>Session resumed</strong>
          <span>
            You have {messageCount} message{messageCount !== 1 ? 's' : ''} from {when}.
            Pick up right where you left off!
          </span>
        </div>
      </div>
      <button className="session-banner-dismiss" onClick={onDismiss} title="Dismiss">
        ✕
      </button>
    </div>
  );
}
