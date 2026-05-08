import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Trash2, Copy, Share2, Flame } from 'lucide-react';
import { useHistory } from '../hooks/useClip';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function expiresIn(isoString) {
  const ms = new Date(isoString).getTime() - Date.now();
  if (ms <= 0) return 'Expired';
  const totalMins = Math.round(ms / 60000);
  if (totalMins < 60) return `${totalMins}m left`;
  const hours = Math.floor(totalMins / 60);
  if (hours < 24) return `${hours}h left`;
  return `${Math.floor(hours / 24)}d left`;
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { history, remove, clear } = useHistory();
  const [copied, setCopied] = useState(null);

  const handleCopyCode = async (code) => {
    try { await navigator.clipboard.writeText(code); } catch {}
    setCopied(`code-${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleCopyLink = async (shareLink, code) => {
    try { await navigator.clipboard.writeText(shareLink); } catch {}
    setCopied(`link-${code}`);
    setTimeout(() => setCopied(null), 2000);
  };

  const isExpired = (isoString) => new Date(isoString).getTime() < Date.now();

  return (
    <main className="section" style={{ gap: 32, alignItems: 'flex-start', maxWidth: 760, margin: '0 auto', width: '100%' }}>
      <div className="animate-fadeUp" style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.4px', marginBottom: 4 }}>Clip History</h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>
              Your sent clips — stored locally on this device only. Last 50 entries.
            </p>
          </div>
          {history.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clear}>
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="card text-center" style={{ padding: '60px 24px' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>No clips yet</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 20 }}>
              Clips you send will appear here automatically.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/')} style={{ margin: '0 auto' }}>
              Send your first clip
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item, i) => {
              const expired = isExpired(item.expiresAt);
              return (
                <div
                  key={item.code}
                  className="card animate-fadeUp"
                  style={{
                    padding: '20px 24px',
                    animationDelay: `${i * 0.06}s`,
                    opacity: expired ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className="text-mono" style={{ fontSize: 18, fontWeight: 700, color: expired ? 'var(--color-text-muted)' : 'var(--color-accent)', letterSpacing: '0.15em' }}>
                          {item.code}
                        </span>
                        <span className={`badge ${expired ? '' : 'badge-orange'}`} style={expired ? { background: 'rgba(255,255,255,0.05)', color: 'var(--color-text-muted)' } : {}}>
                          <Clock size={10} />
                          {expired ? 'Expired' : expiresIn(item.expiresAt)}
                        </span>
                        {item.burnOnRead && (
                          <span className="badge" style={{ background: 'rgba(255,69,58,0.12)', color: '#ff453a' }}>
                            <Flame size={10} />
                            Burn on read
                          </span>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          {item.retentionMinutes}m retention
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 4 }}>
                        Sent {timeAgo(item.createdAt)}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {!expired && (
                        <>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleCopyCode(item.code)}
                            title="Copy Code"
                          >
                            <Copy size={13} />
                            {copied === `code-${item.code}` ? 'Copied!' : 'Code'}
                          </button>
                          {item.shareLink && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleCopyLink(item.shareLink, item.code)}
                              title="Copy Full Share Link"
                            >
                              <Share2 size={13} />
                              {copied === `link-${item.code}` ? 'Copied!' : 'Link'}
                            </button>
                          )}
                        </>
                      )}
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => remove(item.code)}
                        style={{ color: '#ff453a' }}
                        title="Remove from history"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
