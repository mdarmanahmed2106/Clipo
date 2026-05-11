import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Copy, RefreshCw, ArrowRight, Shield, Clock, Share2, QrCode } from 'lucide-react';

function useCountdown(expiresAt) {
  const [now, setNow] = useState(Date.now());

  // Fix #6: Update every second using useEffect
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const ms = new Date(expiresAt).getTime() - now;
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function SentSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    code = 'XXXXXX',
    fullCode = '',
    shareLink = '',
    retention = 60,
    expiresAt,
  } = location.state || {};

  const countdown = useCountdown(expiresAt || new Date(Date.now() + retention * 60 * 1000));
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyCode = async () => {
    try { await navigator.clipboard.writeText(fullCode || code); } catch {}
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = async () => {
    try { await navigator.clipboard.writeText(shareLink); } catch {}
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Fix #13: Redirect to home if accessed directly without state (in useEffect)
  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location.state, navigate]);

  if (!location.state) {
    return null;
  }

  return (
    <main className="section animate-fadeIn">
      <div
        className="card card-glow-success animate-fadeUp"
        style={{ maxWidth: 520, width: '100%', padding: '48px 44px', textAlign: 'center' }}
      >
        {/* Success icon */}
        <div style={{ display: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <div className="success-icon">
            <CheckCircle size={36} strokeWidth={1.5} />
          </div>
        </div>

        {/* Title — Fix #9: Brand Unification */}
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 8 }}>
          Clipo Secured
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 15, marginBottom: 36, lineHeight: 1.6 }}>
          Your clip has been encrypted and uploaded. Share the sync code or link below.
        </p>

        {/* Sync code */}
        <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Sync Code
        </div>
        <div className="relative" style={{ marginBottom: 16 }}>
          <div className="sync-code" id="sync-code-display" style={{ fontSize: (fullCode || code).length > 20 ? 14 : 28, letterSpacing: (fullCode || code).length > 20 ? '0.05em' : '0.25em' }}>
            {fullCode || code}
          </div>
          {copiedCode && <div className="copy-feedback">Copied!</div>}
        </div>

        {/* Copy code button */}
        <button
          className="btn btn-secondary btn-full"
          style={{ marginBottom: 10 }}
          onClick={handleCopyCode}
          id="copy-code-btn"
        >
          <Copy size={16} />
          {copiedCode ? 'Copied to clipboard' : 'Copy Sync Code'}
        </button>

        {/* Copy share link button */}
        {shareLink && (
          <button
            className="btn btn-ghost btn-full"
            style={{ marginBottom: 20 }}
            onClick={handleCopyLink}
            id="copy-link-btn"
          >
            <Share2 size={16} />
            {copiedLink ? 'Link copied!' : 'Copy Full Share Link'}
          </button>
        )}

        {/* Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            padding: '14px 20px',
            background: 'rgba(255,159,10,0.06)',
            border: '1px solid rgba(255,159,10,0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 28,
          }}
        >
          <Clock size={16} color="var(--color-warning)" />
          <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
            Deletes in
          </span>
          <span className="timer-display" style={{ fontSize: 22 }}>{countdown}</span>
        </div>

        <div className="divider" style={{ marginBottom: 24 }} />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-ghost btn-full"
            onClick={() => navigate('/')}
            id="new-clip-btn"
          >
            <RefreshCw size={15} />
            New Clip
          </button>
          <Link to="/retrieve" className="btn btn-primary btn-full" id="retrieve-clip-btn">
            <Shield size={15} />
            Retrieve Clip
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </main>
  );
}
