/**
 * AdSense Placeholder Component
 * For Phase 3 Monetization — replace with real AdSense when approved
 *
 * Usage: <AdSense slot="right-panel-bottom" />
 * Only shown to free-tier users
 */
import { useUserStore } from '@/store';

interface Props {
  slot?: string;
  className?: string;
}

export default function AdSense({ slot = 'default', className = '' }: Props) {
  const { tier } = useUserStore();
  if (tier !== 'free') return null;

  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  if (!clientId) {
    // Development placeholder
    return (
      <div
        className={`flex items-center justify-center text-xs rounded-lg ${className}`}
        style={{
          background: 'var(--bg-tertiary)',
          color:      'var(--text-muted)',
          border:     '1px dashed var(--border)',
          minHeight:  '90px',
        }}
      >
        📢 Ad Placeholder ({slot})
        <br />
        <span style={{ fontSize: '10px' }}>Set NEXT_PUBLIC_ADSENSE_CLIENT to enable</span>
      </div>
    );
  }

  // Production AdSense snippet (when approved by Google)
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
