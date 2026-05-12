import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Copy, RefreshCw, ArrowRight, Shield, Clock, Share2, QrCode as QrIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

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
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
          Your clip is ready. Anyone with the code below can retrieve it instantly.
        </p>

        {/* Sync code */}
        <div style={{ marginBottom: 12, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
          Retrieval Code
        </div>
        <div className="relative" style={{ marginBottom: 12 }}>
          <div className="sync-code" id="sync-code-display" style={{ fontSize: 32, letterSpacing: '0.25em', padding: '16px 24px' }}>
            {code}
          </div>
          {copiedCode && <div className="copy-feedback">Copied!</div>}
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className="btn btn-secondary btn-sm btn-full"
            onClick={handleCopyCode}
            id="copy-code-btn"
          >
            <Copy size={14} />
            Copy Code
          </button>
          {shareLink && (
            <button
              className="btn btn-secondary btn-sm btn-full"
              onClick={handleCopyLink}
              id="copy-link-btn"
            >
              <Share2 size={14} />
              Copy Link
            </button>
          )}
        </div>

        {/* QR Code Section */}
        <div style={{ 
          marginBottom: 24, 
          padding: 16, 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid var(--color-border)', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>
            Scan to retrieve on mobile
          </div>
          <div style={{ background: '#fff', padding: 8, borderRadius: 8 }}>
            <QRCodeSVG value={shareLink || window.location.origin + '/retrieve'} size={120} />
          </div>
        </div>

        {/* Timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'rgba(255,159,10,0.06)',
            border: '1px solid rgba(255,159,10,0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 20,
          }}
        >
          <Clock size={14} color="var(--color-warning)" />
          <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            Expires in <span className="text-mono" style={{ color: 'var(--color-warning)', fontWeight: 600, marginLeft: 4 }}>{countdown}</span>
          </span>
        </div>

        <div className="divider" style={{ marginBottom: 20 }} />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn btn-ghost btn-sm btn-full"
            onClick={() => navigate('/')}
            id="new-clip-btn"
          >
            <RefreshCw size={14} />
            New
          </button>
          <Link to="/retrieve" className="btn btn-primary btn-sm btn-full" id="retrieve-clip-btn">
            <Shield size={14} />
            Retrieve
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  );
}
