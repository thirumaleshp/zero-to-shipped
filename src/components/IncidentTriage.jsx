import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  Database, 
  Server, 
  Play, 
  Check, 
  Copy, 
  FileText, 
  Sparkles,
  Zap,
  ArrowRight,
  RefreshCw,
  Terminal
} from 'lucide-react';

export function IncidentTriage({ 
  incidents, 
  setIncidents, 
  selectedIncidentId, 
  setSelectedIncidentId 
}) {
  const [filter, setFilter] = useState('all'); // 'all' | 'critical' | 'warning' | 'resolved'
  const [remediating, setRemediating] = useState(false);
  const [remediationStep, setRemediationStep] = useState(0);
  const [copiedCommand, setCopiedCommand] = useState(null);
  const [showPostMortem, setShowPostMortem] = useState(false);

  const selectedIncident = incidents.find(inc => inc.id === selectedIncidentId) || incidents[0];

  const filteredIncidents = incidents.filter(inc => {
    if (filter === 'all') return true;
    if (filter === 'resolved') return inc.status === 'resolved';
    return inc.severity === filter && inc.status === 'active';
  });

  const handleCopyCommand = (cmd, idx) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCommand(idx);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleExecuteRemediation = () => {
    if (!selectedIncident || selectedIncident.status === 'resolved') return;

    setRemediating(true);
    setRemediationStep(1);

    // Multi-step autonomous execution sequence
    setTimeout(() => {
      setRemediationStep(2);
    }, 1200);

    setTimeout(() => {
      setRemediationStep(3);
    }, 2400);

    setTimeout(() => {
      setRemediating(false);
      setRemediationStep(0);

      // Mark incident resolved
      setIncidents(prev => prev.map(inc => {
        if (inc.id === selectedIncident.id) {
          return {
            ...inc,
            status: 'resolved',
            resolvedTimestamp: 'Just now by Antigravity Agent',
            metrics: {
              ...inc.metrics,
              cpuUtilization: "18.4%",
              activeConnections: 120,
              http5xxRate: "0.0%",
              replicationLagSeconds: 0
            }
          };
        }
        return inc;
      }));

      // Fire celebratory confetti!
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF9900', '#00F0FF', '#10B981', '#A855F7']
      });
    }, 3600);
  };

  const getServiceIcon = (service) => {
    if (service.includes('RDS')) return <Database className="w-4 h-4 text-blue-400" />;
    if (service.includes('ECS')) return <Server className="w-4 h-4 text-emerald-400" />;
    if (service.includes('Lambda')) return <Zap className="w-4 h-4 text-amber-400" />;
    return <Cpu className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="triage-container">
      {/* Sidebar: Incident List */}
      <aside className="incident-sidebar">
        <div className="sidebar-header">
          <div className="flex-between">
            <h2 className="section-title">CloudWatch Alarms</h2>
            <span className="live-counter">
              {incidents.filter(i => i.status === 'active').length} Active
            </span>
          </div>

          {/* Filter Pills */}
          <div className="filter-chips">
            <button 
              className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({incidents.length})
            </button>
            <button 
              className={`filter-chip critical ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              Critical
            </button>
            <button 
              className={`filter-chip warning ${filter === 'warning' ? 'active' : ''}`}
              onClick={() => setFilter('warning')}
            >
              Warning
            </button>
            <button 
              className={`filter-chip resolved ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Incident List Items */}
        <div className="incident-list">
          {filteredIncidents.map(inc => {
            const isSelected = inc.id === selectedIncident?.id;
            return (
              <div 
                key={inc.id}
                className={`incident-item ${isSelected ? 'selected' : ''} ${inc.status === 'resolved' ? 'is-resolved' : inc.severity}`}
                onClick={() => setSelectedIncidentId(inc.id)}
              >
                <div className="item-header-row">
                  <div className="service-badge">
                    {getServiceIcon(inc.service)}
                    <span>{inc.service}</span>
                  </div>
                  <span className={`status-pill ${inc.status}`}>
                    {inc.status === 'resolved' ? 'Resolved' : inc.severity}
                  </span>
                </div>

                <h4 className="item-title">{inc.title}</h4>
                <p className="item-resource font-mono">{inc.resourceId}</p>

                <div className="item-footer">
                  <span className="item-time">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {inc.timestamp}
                  </span>
                  <span className="item-region font-mono">{inc.region}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Panel: Selected Incident Investigation & Agent Remediation */}
      {selectedIncident ? (
        <main className="incident-main">
          {/* Top Bar of Main view */}
          <div className="detail-header-card">
            <div className="flex-between">
              <div>
                <div className="detail-tags">
                  <span className="id-badge font-mono">{selectedIncident.id}</span>
                  <span className={`severity-badge ${selectedIncident.severity}`}>
                    {selectedIncident.status === 'resolved' ? 'REMEDIATED & HEALTHY' : `${selectedIncident.severity.toUpperCase()} ALARM`}
                  </span>
                  <span className="region-badge font-mono">{selectedIncident.region}</span>
                </div>
                <h2 className="detail-title">{selectedIncident.title}</h2>
                <p className="detail-resource">Target Resource: <code className="font-mono text-cyan-300">{selectedIncident.resourceId}</code></p>
              </div>

              {/* Status Action / CTA */}
              <div className="detail-cta">
                {selectedIncident.status === 'active' ? (
                  <button 
                    className="btn-remediate-glow"
                    onClick={handleExecuteRemediation}
                    disabled={remediating}
                  >
                    {remediating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Agent Executing Fix ({remediationStep}/3)...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <span>1-Click Agentic Remediate</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="remediated-badge">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Remediated by Agent</span>
                  </div>
                )}
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="metrics-strip">
              {Object.entries(selectedIncident.metrics).map(([key, value]) => (
                <div key={key} className="metric-cell">
                  <div className="metric-name">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</div>
                  <div className={`metric-num ${selectedIncident.status === 'resolved' ? 'healthy' : 'spiking'}`}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Root Cause Analysis Section */}
          <section className="rca-card">
            <div className="rca-header">
              <div className="rca-title-wrap">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3>AWS Bedrock Root Cause Analysis</h3>
              </div>
              <div className="rca-meta">
                <span className="model-chip font-mono">{selectedIncident.rootCauseAnalysis.aiModel}</span>
                <span className="confidence-chip">Confidence: {selectedIncident.rootCauseAnalysis.confidence}</span>
              </div>
            </div>

            <div className="rca-body">
              <div className="rca-summary">
                <strong>Diagnosis:</strong> {selectedIncident.rootCauseAnalysis.summary}
              </div>
              <div className="rca-impact">
                <strong>Blast Radius:</strong> {selectedIncident.rootCauseAnalysis.impact}
              </div>
              <div className="rca-action">
                <strong>Recommended Mitigation:</strong> {selectedIncident.rootCauseAnalysis.recommendedAction}
              </div>
            </div>
          </section>

          {/* Step-by-Step Remediation Plan */}
          <section className="remediation-steps-card">
            <div className="steps-header">
              <div className="steps-title-wrap">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <h3>Agent Autonomous Remediation Plan</h3>
              </div>
              <button 
                className="btn-text"
                onClick={() => setShowPostMortem(!showPostMortem)}
              >
                <FileText className="w-4 h-4" />
                <span>{showPostMortem ? 'Hide Post-Mortem' : 'Generate Post-Mortem Doc'}</span>
              </button>
            </div>

            <div className="steps-list">
              {selectedIncident.remediationSteps.map((step, idx) => {
                const isCurrent = remediating && remediationStep === step.step;
                const isCompleted = selectedIncident.status === 'resolved' || (remediating && remediationStep > step.step);

                return (
                  <div 
                    key={step.step}
                    className={`step-item ${isCurrent ? 'running' : ''} ${isCompleted ? 'completed' : ''}`}
                  >
                    <div className="step-num-bubble">
                      {isCompleted ? <Check className="w-4 h-4 text-emerald-400" /> : step.step}
                    </div>

                    <div className="step-content">
                      <div className="step-top-row">
                        <h4 className="step-title">{step.title}</h4>
                        <button 
                          className="btn-copy-code"
                          onClick={() => handleCopyCommand(step.command, idx)}
                          title="Copy AWS CLI command"
                        >
                          {copiedCommand === idx ? (
                            <span className="text-emerald-400 text-xs">Copied!</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="command-box">
                        <pre className="command-pre">
                          <code>{step.command}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Optional Post-Mortem Card */}
          {showPostMortem && (
            <section className="postmortem-drawer">
              <div className="drawer-header">
                <FileText className="w-4 h-4 text-orange-400" />
                <h4>Automated Incident Post-Mortem ({selectedIncident.id})</h4>
              </div>
              <div className="drawer-content font-mono text-xs">
                <p># INCIDENT POST-MORTEM — {selectedIncident.id}</p>
                <p>Date: {new Date().toLocaleDateString()} | Author: Antigravity SRE Agent</p>
                <p>Status: {selectedIncident.status.toUpperCase()} | Severity: {selectedIncident.severity.toUpperCase()}</p>
                <br/>
                <p>## 1. Executive Summary</p>
                <p>{selectedIncident.rootCauseAnalysis.summary}</p>
                <br/>
                <p>## 2. Impact</p>
                <p>{selectedIncident.rootCauseAnalysis.impact}</p>
                <br/>
                <p>## 3. Corrective Actions Executed</p>
                {selectedIncident.remediationSteps.map(s => (
                  <p key={s.step}>- Step {s.step}: {s.title}</p>
                ))}
              </div>
            </section>
          )}
        </main>
      ) : null}
    </div>
  );
}
