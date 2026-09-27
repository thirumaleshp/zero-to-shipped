import React from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Terminal, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  Award,
  AlertTriangle,
  RefreshCw
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
    <header className="header-container">
      <div className="header-top">
        {/* Brand identity */}
        <div className="brand-group">
          <div className="brand-logo">
            <Zap className="brand-icon" />
            <div className="logo-glow" />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">OpsPulse<span className="brand-highlight">.ai</span></h1>
              <span className="version-tag">v2.4 Live</span>
            </div>
            <p className="brand-subtitle">Autonomous Cloud Incident Triage & FinOps Copilot</p>
          </div>
        </div>

        {/* Hackathon metadata badges */}
        <div className="hackathon-badges">
          <div className="badge-pill category">
            <span className="badge-dot category-dot" />
            <span className="badge-label">Category:</span>
            <strong>#workplace-efficiency</strong>
          </div>
          <div className="badge-pill lane">
            <span className="badge-dot lane-dot" />
            <span className="badge-label">Lane:</span>
            <strong>#startups</strong>
          </div>
          <div className={`badge-pill aws-status ${awsConnected ? 'connected' : 'waiting'}`}>
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{awsConnected ? 'AWS Connected (STS Validated)' : 'AWS Agent Ready'}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="header-actions">
          <button 
            className="btn-simulate"
            onClick={onSimulateSpike}
            title="Inject synthetic CloudWatch telemetry spike"
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Simulate Alarm</span>
          </button>

          <button 
            className="btn-hackathon-dossier"
            onClick={onOpenSubmissionModal}
          >
            <Award className="w-4 h-4 text-orange-400" />
            <span>Judge Dossier & Ship Proof</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <nav className="header-nav">
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'incidents' ? 'active' : ''}`}
            onClick={() => setActiveTab('incidents')}
          >
            <Zap className="w-4 h-4" />
            <span>Incident Triage Hub</span>
            {activeIncidentsCount > 0 && (
              <span className="tab-counter">{activeIncidentsCount}</span>
            )}
          </button>

          <button 
            className={`nav-tab ${activeTab === 'finops' ? 'active' : ''}`}
            onClick={() => setActiveTab('finops')}
          >
            <Layers className="w-4 h-4" />
            <span>FinOps Waste Detector</span>
            <span className="tab-pill-savings">$1,213/mo</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'copilot' ? 'active' : ''}`}
            onClick={() => setActiveTab('copilot')}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Bedrock SRE Copilot</span>
          </button>

          <button 
            className={`nav-tab ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Agent-to-AWS Live Terminal</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
