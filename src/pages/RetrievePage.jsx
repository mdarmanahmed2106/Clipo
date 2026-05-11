import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, RefreshCw, Download, Lock, ChevronRight, AlertTriangle } from 'lucide-react';
import { useRetrieveClip } from '../hooks/useClip';

export default function RetrievePage() {
  const navigate = useNavigate();
  const { retrieve, loading, error } = useRetrieveClip();
  const [code, setCode] = useState('');

  // Auto-handle hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      navigate(`/retrieved#${hash}`, { replace: true });
    }
  }, [navigate]);

  const handleRetrieve = async (e) => {
    e.preventDefault();
    const input = code.trim();
    if (!input) return;
    
    try {
      // The retrieve hook now handles parsing (CODE:KEY, fragments, or full URLs)
      const result = await retrieve(input);
      navigate('/retrieved', {
        state: {
          code: result.code,
          content: result.content,
          expiresAt: result.expiresAt,
          burnOnRead: result.burnOnRead,
          createdAt: result.createdAt,
        }
      });
    } catch (err) {
      // error shown from hook
    }
  };

  const handleCodeChange = (e) => {
    const val = e.target.value;
    
    // If it's a simple 6-char code, uppercase it. 
    // If it's longer (has key or URL), keep original case for the key.
    if (val.length <= 6 && !val.includes(':') && !val.includes('http')) {
      setCode(val.toUpperCase().replace(/[^A-Z0-9]/g, ''));
    } else {
      setCode(val);
    }
  };

  return (
    <main className="section" style={{ gap: 48 }}>
      {/* Header */}
      <div className="text-center animate-fadeUp" style={{ maxWidth: 520 }}>
        <div className="hero-eyebrow">
          <Key size={12} />
          Retrieve Content
        </div>
        <h1 className="hero-title" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
          Access your <span>encrypted</span> clip
        </h1>
        <p className="hero-subtitle" style={{ fontSize: 15 }}>
          Paste the sync code or the full share link from your other device.
          Decryption happens entirely in your browser — the key never touches our servers.
        </p>
      </div>

      {/* Retrieve card */}
      <div
        className="card card-glow-accent animate-fadeUp w-full"
        style={{ maxWidth: 480, padding: '40px 40px', animationDelay: '0.1s' }}
      >
        <form onSubmit={handleRetrieve}>
          <div className="input-group" style={{ marginBottom: 20 }}>
            <label className="input-label" htmlFor="sync-code-input" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Sync Code or Share Link</span>
              <button 
                type="button" 
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    handleCodeChange({ target: { value: text } });
                  } catch (err) {
                    alert('Please paste using Ctrl+V (or Cmd+V on Mac)');
                  }
                }}
                className="btn btn-ghost btn-sm"
                style={{ padding: '2px 8px', fontSize: 11, background: 'rgba(255,255,255,0.05)' }}
              >
                Paste
              </button>
            </label>
            <input
              id="sync-code-input"
              type="text"
              className="input-field mono"
              placeholder="E.g. ABC123 or paste full link"
              value={code}
              onChange={handleCodeChange}
              autoComplete="off"
              autoFocus
              style={{ textAlign: 'center', fontSize: code.length > 10 ? 13 : 22, letterSpacing: code.length > 10 ? 0 : '0.2em', height: 60 }}
            />
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
              Paste the 6-character code or the full share link (includes decryption key).
            </p>
          </div>

          {error && (
            <div
              className="animate-slideDown"
              style={{
                padding: '12px 16px',
                background: 'rgba(255,69,58,0.08)',
                border: '1px solid rgba(255,69,58,0.25)',
                borderRadius: 'var(--radius-md)',
                color: '#ff453a',
                fontSize: 14,
                marginBottom: 16,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={code.length < 4 || loading}
            id="retrieve-btn"
          >
            {loading ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Fetching &amp; Decrypting...
              </>
            ) : (
              <>
                <Download size={16} />
                Retrieve Content
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Info */}
        <div style={{
          marginTop: 24,
          padding: '14px 16px',
          background: 'rgba(0,122,255,0.05)',
          border: '1px solid rgba(0,122,255,0.15)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)', marginBottom: 6 }}>
            🔑 How decryption works
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            The decryption key is embedded in the share link fragment (<code style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>#CODE:KEY</code>).
            Paste the full link and we'll decrypt it locally — the key is never sent to our server.
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 14, width: '100%', maxWidth: 760, animationDelay: '0.2s' }} className="animate-fadeUp">
        {[
          { icon: <Lock size={18} />, title: 'Zero-Knowledge', desc: 'Encryption keys never touch our servers. Decrypted locally.' },
          { icon: <RefreshCw size={18} />, title: 'Instant Sync', desc: 'Share across machines using a unique temporary ID.' },
        ].map(item => (
          <div className="feature-card" key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <div className="feature-icon" style={{ flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div className="feature-title">{item.title}</div>
              <div className="feature-desc">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>


    </main>
  );
}
