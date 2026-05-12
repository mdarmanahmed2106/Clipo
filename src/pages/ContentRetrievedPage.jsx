import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Trash2, Shield, Eye, EyeOff, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import { useDestroyClip, useRetrieveClip } from '../hooks/useClip';

export default function ContentRetrievedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { destroy, loading: destroying } = useDestroyClip();

  const { retrieve, loading: fetching, error: retrieveError } = useRetrieveClip();
  const fetchStarted = useRef(false);
  const [retrievedData, setRetrievedData] = useState(null);

  const finalData = location.state || retrievedData;
  const {
    code,
    content,
    expiresAt,
    burnOnRead = false,
    createdAt,
  } = finalData || {};

  const [copied, setCopied] = useState(false);
  const [masked, setMasked] = useState(false);
  const [destroyed, setDestroyed] = useState(false);

  // Handle retrieval from hash on mount
  useEffect(() => {
    // 1. Skip if we already have content from navigation state
    if (location.state && location.state.content) return;

    // 2. Prevent double-fetch in React 18 dev mode (StrictMode)
    if (fetchStarted.current) return;

    const hash = window.location.hash.slice(1);
    if (hash) {
      fetchStarted.current = true;
      retrieve(hash)
        .then(data => setRetrievedData(data))
        .catch(() => {
          // If retrieval fails, the error will be in retrieveError
          fetchStarted.current = false; // allow retry if failed? 
        });
    } else if (!location.state) {
      // No state and no hash? Go home.
      const timer = setTimeout(() => navigate('/retrieve'), 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state, navigate, retrieve]);

  if (fetching) {
    return (
      <main className="section animate-fadeIn">
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: '48px 40px', textAlign: 'center' }}>
          <RefreshCw size={32} className="spin" style={{ marginBottom: 16, color: 'var(--color-accent)' }} />
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Fetching & Decrypting...</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Accessing your secure clip using the provided key.
          </p>
        </div>
      </main>
    );
  }

  if (retrieveError) {
    return (
      <main className="section animate-fadeIn">
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: '#ff453a' }}>Retrieval Failed</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24 }}>
            {retrieveError}
          </p>
          <button className="btn btn-primary btn-full" onClick={() => navigate('/retrieve')}>
            Try Manually
          </button>
        </div>
      </main>
    );
  }

  if (!finalData || !content) {
    return (
      <main className="section">
        <div className="card" style={{ maxWidth: 400, padding: 40, textAlign: 'center' }}>
          <AlertTriangle size={32} style={{ color: 'var(--color-warning)', marginBottom: 16 }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No Content Found</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            Redirecting to retrieval page...
          </p>
        </div>
      </main>
    );
  }

  const expiresAtDate = expiresAt ? new Date(expiresAt) : null;
  const minutesLeft = expiresAtDate
    ? Math.max(0, Math.round((expiresAtDate.getTime() - Date.now()) / 60000))
    : null;

  const handleCopy = async () => {
    try { 
      await navigator.clipboard.writeText(content); 
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fix #17: Fallback message for clipboard failure
      alert('Failed to copy to clipboard. Please select the text and copy manually.');
    }
  };

  const handleDestroy = async () => {
    try {
      await destroy(code);
    } catch {
      // Non-critical — clip may already be expired
    }
    setDestroyed(true);
    setTimeout(() => navigate('/'), 2500);
  };

  if (destroyed) {
    return (
      <main className="section animate-fadeIn">
        <div className="card" style={{ maxWidth: 420, width: '100%', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: '#ff453a' }}>Clip Destroyed</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
            This content has been permanently deleted from our servers and cannot be recovered.
          </p>
          <div style={{ marginTop: 20, color: 'var(--color-text-muted)', fontSize: 13 }}>Redirecting...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="section animate-fadeIn" style={{ gap: 0, padding: '40px 24px' }}>
      <div style={{ maxWidth: 680, width: '100%' }}>
        {/* Header */}
        <div className="animate-fadeUp" style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div className="success-icon" style={{ width: 44, height: 44, flexShrink: 0 }}>
              <CheckCircle size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.3px' }}>
                Clipboard Content Retrieved
              </h1>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                Decrypted using AES-256-GCM encryption.
              </p>
            </div>
          </div>

          {/* Warning / info strip */}
          {burnOnRead ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px',
              background: 'rgba(255,69,58,0.07)',
              border: '1px solid rgba(255,69,58,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13, color: '#ff453a',
            }}>
              <AlertTriangle size={14} />
              This was a burn-on-read clip — it has been permanently deleted from the server.
            </div>
          ) : minutesLeft !== null && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px',
              background: 'rgba(255,69,58,0.07)',
              border: '1px solid rgba(255,69,58,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: 13, color: '#ff453a',
            }}>
              <Clock size={14} />
              This content self-destructs in ~{minutesLeft} minute{minutesLeft !== 1 ? 's' : ''}. It cannot be recovered once deleted.
            </div>
          )}
        </div>

        {/* Content card */}
        <div className="card card-glow-accent animate-fadeUp" style={{ padding: 28, animationDelay: '0.1s' }}>
          {/* Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="badge badge-green">
                <Shield size={10} />
                Securely Decrypted
              </span>
              <span className="badge badge-blue">
                Code: {code}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setMasked(m => !m)}
                title={masked ? 'Show' : 'Hide'}
                id="toggle-mask-btn"
              >
                {masked ? <Eye size={14} /> : <EyeOff size={14} />}
                {masked ? 'Show' : 'Hide'}
              </button>
              <div className="relative">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopy}
                  id="copy-content-btn"
                >
                  <Copy size={14} />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                {copied && <div className="copy-feedback">Copied!</div>}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="code-box" style={{ filter: masked ? 'blur(6px)' : 'none', transition: 'filter 0.3s ease', userSelect: masked ? 'none' : 'text' }}>
            {content}
          </div>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 14, marginTop: 20 }} className="animate-fadeUp">
          {[
            { icon: <Shield size={18}/>, title: 'Encrypted Transit', desc: 'Your data is protected by AES-256-GCM encryption from end to end.' },
            { icon: <RefreshCw size={18}/>, title: 'Instant Sync', desc: 'Shared across machines using a unique 6-character code. No accounts required.' },
            { icon: <Eye size={18}/>, title: 'Secure Decryption', desc: 'Content is decrypted using a unique key associated with your code.' },
          ].map(item => (
            <div className="feature-card" key={item.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 18 }}>
              <div className="feature-icon" style={{ flexShrink: 0, width: 36, height: 36 }}>{item.icon}</div>
              <div>
                <div className="feature-title" style={{ fontSize: 13 }}>{item.title}</div>
                <div className="feature-desc" style={{ fontSize: 12 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }} className="animate-fadeUp">
          <button className="btn btn-ghost btn-full" onClick={() => navigate('/')} id="back-home-btn">
            <RefreshCw size={15} />
            New Clip
          </button>
          <button
            className="btn btn-full"
            style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a', border: '1px solid rgba(255,69,58,0.25)' }}
            onClick={handleDestroy}
            disabled={destroying}
            id="destroy-clip-btn"
          >
            {destroying
              ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <Trash2 size={15} />
            }
            {destroying ? 'Destroying...' : 'Destroy Now'}
          </button>
        </div>
      </div>

    </main>
  );
}
