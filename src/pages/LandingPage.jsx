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
    <main className="section" style={{ gap: 48, paddingBottom: 64 }}>
      {/* Crypto not available warning */}
      {!cryptoOk && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 18px',
          background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)',
          borderRadius: 'var(--radius-md)', color: '#ff453a', fontSize: 14,
          maxWidth: 600, width: '100%', marginBottom: -16
        }}>
          <AlertTriangle size={16} />
          Your browser does not support Web Crypto API. Please upgrade to a modern browser.
        </div>
      )}

      {/* Landing Container: Hero + Form */}
      <div className="landing-hero-container animate-fadeUp">
        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <Shield size={12} />
            Anonymous &amp; Encrypted Clipboard
          </div>
          <h1 className="hero-title">
            Share clips with<br /><span>zero trace</span>
          </h1>
          <p className="hero-subtitle">
            Paste any text, code, or data and share it across devices instantly.
            No accounts. No logs. Everything encrypted with AES-256-GCM.
          </p>
        </div>

        {/* Main Form Card */}
        <div className="hero-card-wrap">
          <div
            className="card card-glow-accent w-full"
            style={{ maxWidth: 520, padding: '32px 32px' }}
          >
            <form onSubmit={handleSend}>
              {/* Retention settings header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Clock size={16} color="var(--color-accent)" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Retention
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
                        fontSize: 11,
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea */}
              <div className="input-group" style={{ marginBottom: 14 }}>
                <textarea
                  id="clip-content"
                  className="input-field textarea-field mono"
                  placeholder="Paste your text, code, or data here..."
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={6}
                  required
                  autoFocus
                  style={{ minHeight: 140 }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button 
                      type="button" 
                      onClick={async () => {
                        try {
                          const text = await navigator.clipboard.readText();
                          setContent(text);
                        } catch (err) {
                          alert('Please paste using Ctrl+V');
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
                  <span className="text-muted" style={{ fontSize: 11, color: isOverLimit ? '#ff453a' : undefined }}>
                    {byteSize >= 1024
                      ? `${(byteSize / 1024).toFixed(1)} KB`
                      : `${byteSize} B`} / 100 KB
                  </span>
                </div>
              </div>

              {/* Burn on read toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px',
                background: burnOnRead ? 'rgba(255,69,58,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${burnOnRead ? 'rgba(255,69,58,0.25)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-md)',
                marginBottom: 16,
                cursor: 'pointer',
              }}
                onClick={() => setBurnOnRead(b => !b)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Flame size={14} color={burnOnRead ? '#ff453a' : 'var(--color-text-muted)'} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: burnOnRead ? '#ff453a' : 'var(--color-text-primary)' }}>
                    Burn on Read
                  </span>
                </div>
                {/* Toggle switch */}
                <div style={{
                  width: 32, height: 18,
                  background: burnOnRead ? '#ff453a' : 'rgba(255,255,255,0.12)',
                  borderRadius: 9,
                  position: 'relative',
                  transition: 'background 0.2s',
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 2, left: burnOnRead ? 16 : 2,
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }} />
                </div>
              </div>

              {/* CTA */}
              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={!content.trim() || loading || isOverLimit || !cryptoOk}
                id="send-clip-btn"
                style={{ height: 52 }}
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Encrypting...
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
        </div>
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
