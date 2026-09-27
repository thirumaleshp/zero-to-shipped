import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  DollarSign, 
  TrendingDown, 
  CheckCircle2, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  Terminal,
  AlertOctagon,
  ArrowRight,
  HardDrive,
  Network,
  Database,
  Cloud
} from 'lucide-react';

export function FinOpsDetector({ leaks, setLeaks }) {
  const [selectedLeak, setSelectedLeak] = useState(leaks[0] || null);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanedIds, setCleanedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);

  const activeLeaks = leaks.filter(l => !cleanedIds.has(l.id));
  const totalMonthlyWaste = activeLeaks.reduce((acc, curr) => acc + curr.monthlyCost, 0);
  const annualizedSavings = totalMonthlyWaste * 12;
  const totalCleanedSavings = Array.from(cleanedIds).reduce((acc, id) => {
    const leak = leaks.find(l => l.id === id);
    return acc + (leak ? leak.monthlyCost : 0);
  }, 0);

  const handleCleanLeak = (leakId) => {
    setIsCleaning(true);
    setTimeout(() => {
      setCleanedIds(prev => new Set([...prev, leakId]));
      setIsCleaning(false);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#FF9900', '#00F0FF']
      });
    }, 1500);
  };

  const handleCleanAll = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setCleanedIds(new Set(leaks.map(l => l.id)));
      setIsCleaning(false);
      confetti({
        particleCount: 160,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#10B981', '#FF9900', '#00F0FF', '#F59E0B']
      });
    }, 2200);
  };

  const handleCopy = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getLeakIcon = (service) => {
    if (service.includes('EBS') || service.includes('EC2')) return <HardDrive className="w-4 h-4 text-orange-400" />;
    if (service.includes('NAT') || service.includes('VPC')) return <Network className="w-4 h-4 text-cyan-400" />;
    if (service.includes('RDS')) return <Database className="w-4 h-4 text-blue-400" />;
    return <Cloud className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="finops-container">
      {/* Top Value Realization Banner */}
      <section className="finops-banner-grid">
        <div className="stat-card waste-detected">
          <div className="stat-icon-wrap rose">
            <TrendingDown className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <div className="stat-label">Active Cloud Waste Detected</div>
            <div className="stat-value text-rose-400 font-mono">
              ${totalMonthlyWaste.toLocaleString()} <span className="text-sm font-normal text-zinc-400">/ month</span>
            </div>
            <div className="stat-sub">
              {activeLeaks.length} orphaned/oversized AWS assets identified
            </div>
          </div>
        </div>

        <div className="stat-card savings-potential">
          <div className="stat-icon-wrap emerald">
            <DollarSign className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="stat-label">Projected Annual FinOps Savings</div>
            <div className="stat-value text-emerald-400 font-mono">
              ${annualizedSavings.toLocaleString()} <span className="text-sm font-normal text-zinc-400">/ year</span>
            </div>
            <div className="stat-sub">
              ROI: Instant positive margin impact for startups
            </div>
          </div>
        </div>

        <div className="stat-card reclaimed-card">
          <div className="stat-icon-wrap cyan">
            <CheckCircle2 className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="stat-label">Total Monthly Spend Reclaimed</div>
            <div className="stat-value text-cyan-300 font-mono">
              ${totalCleanedSavings.toLocaleString()} <span className="text-sm font-normal text-zinc-400">/ mo</span>
            </div>
            <div className="stat-sub">
              {cleanedIds.size} remediations executed by agent
            </div>
          </div>
        </div>

        <div className="stat-card bulk-action-card">
          <button 
            className="btn-reclaim-all"
            onClick={handleCleanAll}
            disabled={isCleaning || activeLeaks.length === 0}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isCleaning ? 'Executing Batch Teardown...' : `Reclaim All Waste ($${totalMonthlyWaste}/mo)`}</span>
          </button>
        </div>
      </section>

      {/* Main Grid: List on Left, Deep Inspection & CLI script on Right */}
      <div className="finops-body-layout">
        {/* Left Table / List */}
        <div className="leak-list-card">
          <div className="leak-card-header">
            <h3>Detected Cloud Cost Leaks</h3>
            <span className="badge-count">{activeLeaks.length} Active</span>
          </div>

          <div className="leak-rows">
            {leaks.map(leak => {
              const isCleaned = cleanedIds.has(leak.id);
              const isSelected = selectedLeak?.id === leak.id;

              return (
                <div 
                  key={leak.id}
                  className={`leak-row-item ${isSelected ? 'selected' : ''} ${isCleaned ? 'cleaned' : ''}`}
                  onClick={() => setSelectedLeak(leak)}
                >
                  <div className="leak-row-left">
                    <div className="leak-service-badge">
                      {getLeakIcon(leak.service)}
                    </div>
                    <div>
                      <div className="leak-name-row">
                        <span className="leak-title">{leak.name}</span>
                        {isCleaned && (
                          <span className="pill-reclaimed">Reclaimed</span>
                        )}
                      </div>
                      <div className="leak-resource-meta font-mono">
                        {leak.resourceId} • {leak.region}
                      </div>
                    </div>
                  </div>

                  <div className="leak-row-right">
                    <div className="leak-cost font-mono">
                      +${leak.monthlyCost}<span className="text-xs text-zinc-400">/mo</span>
                    </div>
                    {!isCleaned ? (
                      <button 
                        className="btn-inline-clean"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCleanLeak(leak.id);
                        }}
                        disabled={isCleaning}
                        title="Reclaim with Agent"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                        <span>Fix</span>
                      </button>
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Inspection & CLI Command Preview */}
        {selectedLeak && (
          <div className="leak-inspect-card">
            <div className="inspect-header">
              <div className="flex-between">
                <div>
                  <span className="inspect-tag font-mono">{selectedLeak.id}</span>
                  <h3 className="inspect-title">{selectedLeak.name}</h3>
                  <p className="font-mono text-xs text-zinc-400">Resource: {selectedLeak.resourceId}</p>
                </div>
                <div className="cost-highlight font-mono">
                  ${selectedLeak.monthlyCost}
                  <span className="text-xs text-zinc-400 block">per month waste</span>
                </div>
              </div>
            </div>

            <div className="inspect-section">
              <div className="section-label">
                <Sparkles className="w-4 h-4 text-purple-400 inline mr-1.5" />
                Bedrock FinOps Optimization Strategy
              </div>
              <p className="strategy-text">{selectedLeak.recommendation}</p>
            </div>

            <div className="inspect-section">
              <div className="flex-between mb-2">
                <div className="section-label">
                  <Terminal className="w-4 h-4 text-cyan-400 inline mr-1.5" />
                  Agentic AWS CLI Teardown Script (Pre-snapshot verified)
                </div>
                <button 
                  className="btn-copy-code"
                  onClick={() => handleCopy(selectedLeak.agentCommand, selectedLeak.id)}
                >
                  {copiedId === selectedLeak.id ? (
                    <span className="text-emerald-400 text-xs">Copied!</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="cli-box">
                <pre className="cli-pre font-mono">
                  <code>{selectedLeak.agentCommand}</code>
                </pre>
              </div>
            </div>

            <div className="inspect-footer">
              <div className="safety-note">
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline mr-1" />
                Zero-Downtime Guarantee: Backup snapshots are created before asset deletion.
              </div>

              {!cleanedIds.has(selectedLeak.id) ? (
                <button 
                  className="btn-primary-reclaim"
                  onClick={() => handleCleanLeak(selectedLeak.id)}
                  disabled={isCleaning}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Execute Safe Reclaim via Agent (+${selectedLeak.monthlyCost}/mo)</span>
                </button>
              ) : (
                <div className="already-reclaimed-badge">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Waste Successfully Terminated &amp; Budget Reclaimed</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
