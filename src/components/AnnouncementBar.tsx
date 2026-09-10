export default function AnnouncementBar() {
  return (
    <div
      className="text-xs"
      style={{ background: 'var(--color-brand-dark)', color: '#FFFFFF' }}
    >
      <div className="mx-auto max-w-6xl px-6 py-2 text-center">
        <span>100% Natural Products</span>
        <span className="mx-2 opacity-60">|</span>
        <span>Islandwide Delivery</span>
        <span className="mx-2 opacity-60">|</span>
        <span>Trusted Quality</span>
      </div>
    </div>
  );
}
