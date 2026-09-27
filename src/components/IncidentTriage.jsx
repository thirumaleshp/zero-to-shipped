import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  Clock, 
  Database, 
  Server, 
  Check, 
  Copy, 
  FileText, 
  Sparkles,
  Zap,
  RefreshCw,
  Cpu
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
    setTimeout(() => setCopiedCommand(null), 1800);
  };

  const handleExecuteRemediation = () => {
    if (!selectedIncident || selectedIncident.status === 'resolved') return;

    setRemediating(true);
    setRemediationStep(1);

    setTimeout(() => {
      setRemediationStep(2);
    }, 1000);

    setTimeout(() => {
      setRemediationStep(3);
    }, 2000);

    setTimeout(() => {
      setRemediating(false);
      setRemediationStep(0);

      setIncidents(prev => prev.map(inc => {
        if (inc.id === selectedIncident.id) {
          return {
            ...inc,
            status: 'resolved',
            resolvedTimestamp: 'Just now by Agent',
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

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#38BDF8', '#10B981']
      });
    }, 3000);
  };

  const getServiceIcon = (service) => {
    if (service.includes('RDS')) return <Database className="w-4 h-4 text-sky-400" />;
    if (service.includes('ECS')) return <Server className="w-4 h-4 text-emerald-400" />;
    if (service.includes('Lambda')) return <Zap className="w-4 h-4 text-amber-400" />;
    return <Cpu className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="triage-layout">
      {/* Sidebar: Incident List */}
      <aside className="triage-sidebar">
        <div className="sidebar-top">
          <div className="flex-between">
            <h3 className="sidebar-heading">CloudWatch Alarms</h3>
            <span className="badge-count-soft">
              {incidents.filter(i => i.status === 'active').length} active
            </span>
          </div>

          {/* Clean Segmented Filters */}
          <div className="filter-pill-group">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({incidents.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
              onClick={() => setFilter('critical')}
            >
              Critical
            </button>
            <button 
              className={`filter-btn ${filter === 'warning' ? 'active' : ''}`}
              onClick={() => setFilter('warning')}
            >
              Warning
            </button>
            <button 
              className={`filter-btn ${filter === 'resolved' ? 'active' : ''}`}
              onClick={() => setFilter('resolved')}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* List of cards */}
        <div className="sidebar-card-list">
          {filteredIncidents.map(inc => {
            const isSelected = inc.id === selectedIncident?.id;
            return (
              <div 
                key={inc.id}
                className={`incident-card-item ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedIncidentId(inc.id)}
              >
                <div className="card-top-line">
                  <div className="service-info">
                    {getServiceIcon(inc.service)}
                    <span>{inc.service}</span>
                  </div>
                  <span className={`pill-status-soft ${inc.status === 'resolved' ? 'resolved' : inc.severity}`}>
                    {inc.status === 'resolved' ? 'Resolved' : inc.severity}
                  </span>
                </div>

                <h4 className="card-item-title">{inc.title}</h4>
                <div className="card-resource font-mono">{inc.resourceId}</div>

                <div className="card-item-footer">
                  <span className="card-time">
                    <Clock className="w-3 h-3 inline mr-1 opacity-70" />
                    {inc.timestamp}
                  </span>
                  <span className="card-region font-mono">{inc.region}</span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Investigation Panel */}
      {selectedIncident && (
        <main className="triage-main-panel">
          {/* Incident Header Card */}
          <div className="detail-card">
            <div className="flex-between items-start gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge-mono">{selectedIncident.id}</span>
                  <span className={`pill-status-soft ${selectedIncident.status === 'resolved' ? 'resolved' : selectedIncident.severity}`}>
                    {selectedIncident.status === 'resolved' ? 'Resolved' : `${selectedIncident.severity} Alarm`}
                  </span>
                  <span className="text-tertiary text-xs font-mono">{selectedIncident.region}</span>
                </div>
                <h2 className="detail-main-title">{selectedIncident.title}</h2>
                <p className="detail-target-res">
                  Target Resource: <code className="font-mono text-sky-400">{selectedIncident.resourceId}</code>
                </p>
              </div>

              {/* Action Button */}
              <div>
                {selectedIncident.status === 'active' ? (
                  <button 
                    className="btn-primary-action"
                    onClick={handleExecuteRemediation}
                    disabled={remediating}
                  >
                    {remediating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Remediating ({remediationStep}/3)...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span>1-Click Remediate</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="badge-resolved-clean">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Auto-Remediated by Agent</span>
                  </div>
                )}
              </div>
            </div>

            {/* Metrics Row */}
            <div className="metrics-clean-grid">
              {Object.entries(selectedIncident.metrics).map(([k, val]) => (
                <div key={k} className="metric-box">
                  <span className="metric-lbl">{k.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                  <span className={`metric-val font-mono ${selectedIncident.status === 'resolved' ? 'healthy' : 'spiking'}`}>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Root Cause Card */}
          <div className="detail-card soft-purple-border">
            <div className="flex-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <h3 className="section-title-sm">Bedrock Root Cause Diagnosis</h3>
              </div>
              <span className="badge-confidence">Confidence: {selectedIncident.rootCauseAnalysis.confidence}</span>
            </div>

            <div className="rca-text-body">
              <p><strong>Diagnosis:</strong> {selectedIncident.rootCauseAnalysis.summary}</p>
              <p><strong>Impact:</strong> {selectedIncident.rootCauseAnalysis.impact}</p>
              <p><strong>Mitigation:</strong> {selectedIncident.rootCauseAnalysis.recommendedAction}</p>
            </div>
          </div>

          {/* Remediation Plan Card */}
          <div className="detail-card">
            <div className="flex-between mb-3">
              <h3 className="section-title-sm">Autonomous Remediation Runbook</h3>
              <button 
                className="btn-link-sm"
                onClick={() => setShowPostMortem(!showPostMortem)}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{showPostMortem ? 'Hide Post-Mortem' : 'Generate Post-Mortem'}</span>
              </button>
            </div>

            <div className="plan-steps-list">
              {selectedIncident.remediationSteps.map((step, idx) => {
                const isCurrent = remediating && remediationStep === step.step;
                const isCompleted = selectedIncident.status === 'resolved' || (remediating && remediationStep > step.step);

                return (
                  <div key={step.step} className={`plan-step-card ${isCurrent ? 'active' : ''} ${isCompleted ? 'done' : ''}`}>
                    <div className="step-circle">
                      {isCompleted ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : step.step}
                    </div>
                    <div className="step-main-content">
                      <div className="flex-between mb-1">
                        <span className="step-name">{step.title}</span>
                        <button 
                          className="btn-copy-icon"
                          onClick={() => handleCopyCommand(step.command, idx)}
                          title="Copy command"
                        >
                          {copiedCommand === idx ? (
                            <span className="text-emerald-400 text-xs font-mono">Copied</span>
                          ) : (
                            <Copy className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      </div>
                      <pre className="step-code font-mono text-xs">
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Post-Mortem Drawer */}
          {showPostMortem && (
            <div className="detail-card bg-slate-900 border-amber-900/30 font-mono text-xs">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold">
                <FileText className="w-4 h-4" />
                <span>POST-MORTEM REPORT — {selectedIncident.id}</span>
              </div>
              <p className="text-slate-300"># Executive Summary</p>
              <p className="text-slate-400 mb-2">{selectedIncident.rootCauseAnalysis.summary}</p>
              <p className="text-slate-300"># Remediation Steps Taken</p>
              {selectedIncident.remediationSteps.map(s => (
                <p key={s.step} className="text-slate-400">- Step {s.step}: {s.title}</p>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  );
}
