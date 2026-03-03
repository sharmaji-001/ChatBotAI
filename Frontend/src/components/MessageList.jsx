import React from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import './MessageList.css';

function formatDateDivider(dateA, dateB) {
  const a = new Date(dateA);
  const b = dateB ? new Date(dateB) : null;
  const today     = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  const sameDay = (x, y) =>
    x.getFullYear() === y.getFullYear() &&
    x.getMonth()    === y.getMonth()    &&
    x.getDate()     === y.getDate();

  // Show divider only when the day changes between two messages
  if (b && sameDay(a, b)) return null;

  if (sameDay(a, today))     return 'Today';
  if (sameDay(a, yesterday)) return 'Yesterday';
  return a.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function MessageList({ messages, isLoading, error, onRetry, messagesEndRef }) {
  return (
    <div className="message-list">
      <div className="message-list-inner">
        {messages.map((msg, idx) => {
          const prevMsg   = messages[idx - 1];
          const divider   = formatDateDivider(msg.timestamp, prevMsg?.timestamp);

          return (
            <React.Fragment key={msg.id}>
              {divider && (
                <div className="date-divider">
                  <span>{divider}</span>
                </div>
              )}
              <Message message={msg} isLast={idx === messages.length - 1} />
            </React.Fragment>
          );
        })}

        {isLoading && <TypingIndicator />}

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error}</span>
            <button className="retry-btn" onClick={onRetry}>Dismiss</button>
          </div>
        )}

        <div ref={messagesEndRef} style={{ height: 1 }} />
      </div>
    </div>
  );
}
