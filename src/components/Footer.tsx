import Link from 'next/link';
import { FlaskConical } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t py-10 px-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 justify-between mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.svg" alt="QuaChi" className="h-8 w-auto" />
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              A PhET-style interactive chemistry laboratory for global learners. Built with passion by QuaModels.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-sm mb-3">Platform</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li><Link href="/experiments" className="hover:text-[var(--accent)] transition-colors">Experiments</Link></li>
                <li><Link href="/calculator"  className="hover:text-[var(--accent)] transition-colors">Calculators</Link></li>
                <li><Link href="/molecules"   className="hover:text-[var(--accent)] transition-colors">3D Molecules</Link></li>
                <li><Link href="/ai-tutor"    className="hover:text-[var(--accent)] transition-colors">AI Tutor</Link></li>
                <li><Link href="/reports"     className="hover:text-[var(--accent)] transition-colors">Lab Reports</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <li>
                  <a href="mailto:quamodels.com@gmail.com" className="hover:text-[var(--accent)] transition-colors">
                    quamodels.com@gmail.com
                  </a>
                </li>
                <li style={{ color: 'var(--text-muted)' }}>For inquiries, support,</li>
                <li style={{ color: 'var(--text-muted)' }}>or suggestions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm text-center" style={{ color: 'var(--text-muted)' }}>
            © The QuaModels. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Built for learners everywhere. Made with ❤️ and chemistry.
          </p>
        </div>
      </div>
    </footer>
  );
}
