import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  Layers, 
  Award,
  AlertTriangle
} from 'lucide-react';

export function Header({ 
  activeTab, 
  setActiveTab, 
  activeIncidentsCount, 
  onSimulateSpike, 
  onOpenSubmissionModal,
  awsConnected
}) {
  return (
    <header className="header-root">
      <div className="header-inner">
        {/* Left: Brand Identity */}
        <div className="brand-wrap">
          <div className="brand-mark">
            <Zap className="brand-svg" />
          </div>
          <div>
            <div className="brand-headline">
              <span className="brand-name">OpsPulse</span>
              <span className="brand-dot-ai">.ai</span>
            </div>
            <p className="brand-desc">Cloud Incident Triage &amp; FinOps</p>
          </div>
        </div>

        {/* Center: Soft Minimal Category Chips */}
        <div className="header-chips">
          <span className="chip-pill chip-orange">#workplace-efficiency</span>
          <span className="chip-pill chip-purple">#startups</span>
          <div className="chip-pill chip-emerald">
            <span className="live-dot" />
            <span>AWS Connected</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="header-right">
          <button 
            className="btn-soft-amber"
            onClick={onSimulateSpike}
            title="Inject simulated CloudWatch alarm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Alarm</span>
          </button>

          <button 
            className="btn-soft-primary"
            onClick={onOpenSubmissionModal}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Hackathon Dossier</span>
          </button>
        </div>
      </div>

      {/* Navigation Bar - Soft Pill Segmented Control */}
      <div className="header-nav-wrap">
        <nav className="nav-segmented">
          <button 
            className={`nav-seg-item ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <Zap className="w-4 h-4" />
            <span>Incident Triage</span>
            {activeIncidentsCount > 0 && (
              <span className="badge-count-soft">{activeIncidentsCount}</span>
            )}
          </button>

          <button 
            className={`nav-seg-item ${activeTab === 'finops' ? 'active' : ''}`}
            onClick={() => setActiveTab('finops')}
          >
            <Layers className="w-4 h-4" />
            <span>FinOps Waste</span>
            <span className="badge-savings-soft">$1,213/mo</span>
          </button>

          <button 
            className={`nav-seg-item ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Bedrock Copilot</span>
          </button>

          <button 
            className={`nav-seg-item ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>AWS Agent Proof</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
