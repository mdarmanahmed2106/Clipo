export default function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} Clipo • Anonymous &amp; Encrypted</span>
      {/* Fix #11: Cleaned up dead links */}
      <a href="#" onClick={e => e.preventDefault()} style={{ opacity: 0.6, cursor: 'default' }}>Privacy (Zero-Knowledge)</a>
      <a href="#" onClick={e => e.preventDefault()} style={{ opacity: 0.6, cursor: 'default' }}>Status: Operational</a>
    </footer>
  );
}
