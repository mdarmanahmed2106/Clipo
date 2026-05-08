import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Zap, RefreshCw, Trash2, ClipboardCopy,
  Clock, ChevronRight, Lock, AlertTriangle, Flame
} from 'lucide-react';
import { useSendClip } from '../hooks/useClip';
import { isCryptoAvailable } from '../lib/crypto';

const FEATURES = [
  {
    icon: <Lock size={20} />,
    title: 'Encrypted Flow',
    desc: 'Your content is wrapped in AES-256-GCM encryption before it ever leaves your browser.',
    color: '#007AFF',
  },
  {
    icon: <Zap size={20} />,
    title: 'Instant Sync',
    desc: 'Retrieve snippets on any device using a unique ephemeral key. No accounts needed.',
    color: '#5e5ce6',
  },
  {
    icon: <Trash2 size={20} />,
    title: 'Self Destruct',
    desc: 'Set your data to vanish into thin air. Once it\'s gone, it\'s gone forever from our servers.',
    color: '#ff453a',
  },
  {
    icon: <Shield size={20} />,
    title: 'Zero Logs',
    desc: 'Data is encrypted client-side. No logs, no tracking, no permanent storage.',
    color: '#30d158',
  },
];

const RETENTION = [
  { label: '15 min', value: 15 },
  { label: '1 hour', value: 60 },
  { label: '6 hours', value: 360 },
  { label: '24 hours', value: 1440 },
];

const MAX_BYTES = 100 * 1024; // 100 KB

export default function LandingPage() {
  const navigate = useNavigate();
  const { send, loading, error } = useSendClip();
  const [content, setContent] = useState('');
  const [retention, setRetention] = useState(60);
  const [burnOnRead, setBurnOnRead] = useState(false);

  const byteSize = new TextEncoder().encode(content).length;
  const isOverLimit = byteSize > MAX_BYTES;
  const cryptoOk = isCryptoAvailable();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || isOverLimit || !cryptoOk) return;
    try {
      const result = await send({ content, retentionMinutes: retention, burnOnRead });
      navigate('/sent', { state: { code: result.code, shareLink: result.shareLink, retention, expiresAt: result.expiresAt } });
    } catch {
      // error is shown from hook
    }
  };

  return (
    <main className="section" style={{ gap: 64 }}>
      {/* Crypto not available warning */}
      {!cryptoOk && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px',
          background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)',
          borderRadius: 'var(--radius-md)', color: '#ff453a', fontSize: 14,
          maxWidth: 600, width: '100%',
        }}>
          <AlertTriangle size={16} />
          Your browser does not support Web Crypto API. Please upgrade to a modern browser.
        </div>
      )}

      {/* Hero */}
      <div className="text-center animate-fadeUp" style={{ maxWidth: 640 }}>
        <div className="hero-eyebrow">
          <Shield size={12} />
          Anonymous &amp; Encrypted Clipboard
        </div>
        <h1 className="hero-title">
          Share clips with<br /><span>zero trace</span>
        </h1>
        <p className="hero-subtitle">
          Paste any text, code, or data and share it across devices instantly.
          No accounts. No logs. Everything encrypted with AES-256-GCM, client-side.
        </p>
      </div>

      {/* Main Form Card */}
      <div
        className="card card-glow-accent animate-fadeUp w-full"
        style={{ maxWidth: 600, padding: '36px 40px', animationDelay: '0.1s' }}
      >
        <form onSubmit={handleSend}>
          {/* Retention settings header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} color="var(--color-accent)" />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Retention Settings
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {RETENTION.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRetention(r.value)}
                  className="btn btn-sm"
                  style={{
                    background: retention === r.value ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                    color: retention === r.value ? '#fff' : 'var(--color-text-secondary)',
                    border: `1px solid ${retention === r.value ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    padding: '4px 10px',
                    fontSize: 12,
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="input-group" style={{ marginBottom: 16 }}>
            <label className="input-label" htmlFor="clip-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Clipboard Content</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      setContent(text);
                    } catch (err) {
                      alert('Please paste using Ctrl+V (or Cmd+V on Mac)');
                    }
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)' }}
                >
                  Paste
                </button>
                <button 
                  type="button" 
                  onClick={() => setContent('')}
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '2px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)' }}
                >
                  Clear
                </button>
              </div>
            </label>
            <textarea
              id="clip-content"
              className="input-field textarea-field mono"
              placeholder="Paste your text, code, or data here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={8}
              required
              autoFocus
            />
            {/* Byte counter */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <span className="text-muted" style={{ fontSize: 12, color: isOverLimit ? '#ff453a' : undefined }}>
                {byteSize >= 1024
                  ? `${(byteSize / 1024).toFixed(1)} KB`
                  : `${byteSize} B`} / 100 KB
                {isOverLimit && ' — content too large'}
              </span>
            </div>
          </div>

          {/* Burn on read toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 14px',
            background: burnOnRead ? 'rgba(255,69,58,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${burnOnRead ? 'rgba(255,69,58,0.25)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
            onClick={() => setBurnOnRead(b => !b)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Flame size={16} color={burnOnRead ? '#ff453a' : 'var(--color-text-muted)'} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: burnOnRead ? '#ff453a' : 'var(--color-text-primary)' }}>
                  Burn on Read
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                  Clip self-destructs after the first retrieval
                </div>
              </div>
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 40, height: 22,
              background: burnOnRead ? '#ff453a' : 'rgba(255,255,255,0.12)',
              borderRadius: 11,
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute',
                top: 3, left: burnOnRead ? 20 : 3,
                width: 16, height: 16,
                borderRadius: '50%',
                background: '#fff',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </div>

          {/* API Error */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(255,69,58,0.08)',
              border: '1px solid rgba(255,69,58,0.25)',
              borderRadius: 'var(--radius-md)',
              color: '#ff453a', fontSize: 14, marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertTriangle size={14} />
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={!content.trim() || loading || isOverLimit || !cryptoOk}
            id="send-clip-btn"
          >
            {loading ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Encrypting &amp; Sending...
              </>
            ) : (
              <>
                <ClipboardCopy size={16} />
                Send to Clipboard
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Feature grid */}
      <div className="animate-fadeUp" style={{ width: '100%', maxWidth: 900, animationDelay: '0.2s' }}>
        <h2 className="text-center" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 24 }}>
          Why Clipo?
        </h2>
        <div className="feature-grid">
          {FEATURES.map(f => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon" style={{ background: `${f.color}18`, color: f.color }}>
                {f.icon}
              </div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>


    </main>
  );
}
