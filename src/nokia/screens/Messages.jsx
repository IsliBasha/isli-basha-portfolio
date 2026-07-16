import { useEffect, useState } from 'react';
import { NokiaShell, SectionHeader } from '../NokiaShell.jsx';
import { counterLabel } from './smsCounter.js';

// 3 MESSAGES — a Nokia SMS composer. Message-only: there is deliberately no
// "from" field, matching /api/contact (which validates { message } and nothing
// else). Left softkey Send; the right softkey clears while there's text and
// otherwise goes Back. Esc always backs out. The counter (see smsCounter.js)
// mimics SMS: n/160 for one message, then "k msg" once it spans k segments.
const MAX_LEN = 500; // server slices to 500; cap the field to match.

export function Messages({ onSent, onBack }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const onKey = (event) => {
      // Only intercept Escape so typed characters still reach the textarea.
      if (event.key === 'Escape') {
        event.preventDefault();
        onBack();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onBack]);

  const send = async () => {
    const text = message.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error(`contact ${res.status}`);
      onSent();
    } catch {
      setError('Not sent — try again.');
      setSending(false);
    }
  };

  const hasText = message.length > 0;
  const rightKey = hasText
    ? { label: 'Clear', action: () => setMessage('') }
    : { label: 'Back', action: onBack };

  return (
    <NokiaShell
      header={<SectionHeader title="3 Messages" context={counterLabel(message.length)} />}
      leftKey={{ label: sending ? 'Sending' : 'Send', action: send }}
      rightKey={rightKey}
      className="nk-screen--messages"
    >
      <div className="nk-msg__mode" aria-hidden="true">
        abc
      </div>
      <label className="nk-sr-only" htmlFor="nk-msg-input">
        Your message
      </label>
      <textarea
        id="nk-msg-input"
        className="nk-msg__input nk-body"
        value={message}
        maxLength={MAX_LEN}
        placeholder="Type a message…"
        onChange={(event) => setMessage(event.target.value)}
      />
      {error ? (
        <div className="nk-msg__error" role="alert">
          {error}
        </div>
      ) : (
        <div className="nk-msg__hint" aria-hidden="true">
          message only · no reply-to
        </div>
      )}
    </NokiaShell>
  );
}
