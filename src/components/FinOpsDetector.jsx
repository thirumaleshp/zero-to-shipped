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
        particleCount: 60,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#10B981', '#38BDF8', '#F59E0B']
      });
    }, 1200);
  };

  const handleCleanAll = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setCleanedIds(new Set(leaks.map(l => l.id)));
      setIsCleaning(false);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#10B981', '#38BDF8', '#F59E0B']
      });
    }, 1800);
  };

  const handleCopy = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getLeakIcon = (service) => {
    if (service.includes('EBS') || service.includes('EC2')) return <HardDrive className="w-4 h-4 text-amber-400" />;
    if (service.includes('NAT') || service.includes('VPC')) return <Network className="w-4 h-4 text-sky-400" />;
    if (service.includes('RDS')) return <Database className="w-4 h-4 text-blue-400" />;
    return <Cloud className="w-4 h-4 text-purple-400" />;
  };

  return (
    <div className="finops-wrap">
      {/* Top Clean Stat Cards */}
      <div className="finops-stat-grid">
        <div className="stat-box">
          <div className="stat-icon-circle rose">
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="stat-title">Monthly Cloud Waste</div>
            <div className="stat-amount font-mono text-rose-400">
              ${totalMonthlyWaste.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
            </div>
            <div className="stat-note">{activeLeaks.length} orphaned resources</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-circle emerald">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="stat-title">Annualized Savings</div>
            <div className="stat-amount font-mono text-emerald-400">
              ${annualizedSavings.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ yr</span>
            </div>
            <div className="stat-note">Immediate startup runway savings</div>
          </div>
        </div>

        <div className="stat-box">
          <div className="stat-icon-circle sky">
            <CheckCircle2 className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="stat-title">Spend Reclaimed</div>
            <div className="stat-amount font-mono text-sky-400">
              ${totalCleanedSavings.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ mo</span>
            </div>
            <div className="stat-note">{cleanedIds.size} remediations executed</div>
          </div>
        </div>

        <div className="stat-box stat-box-cta">
          <button 
            className="btn-reclaim-full"
            onClick={handleCleanAll}
            disabled={isCleaning || activeLeaks.length === 0}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isCleaning ? 'Cleaning...' : `Reclaim All ($${totalMonthlyWaste}/mo)`}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="finops-layout">
        {/* Left List */}
        <div className="detail-card">
          <div className="flex-between mb-3">
            <h3 className="section-title-sm">Orphaned &amp; Leaking Resources</h3>
            <span className="badge-count-soft">{activeLeaks.length} pending</span>
          </div>

          <div className="finops-item-list">
            {leaks.map(leak => {
              const isCleaned = cleanedIds.has(leak.id);
              const isSelected = selectedLeak?.id === leak.id;

              return (
                <div 
                  key={leak.id}
                  className={`finops-card-row ${isSelected ? 'selected' : ''} ${isCleaned ? 'cleaned' : ''}`}
                  onClick={() => setSelectedLeak(leak)}
                >
                  <div className="flex items-center gap-3">
                    <div className="service-mini-icon">
                      {getLeakIcon(leak.service)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="leak-main-name">{leak.name}</span>
                        {isCleaned && <span className="pill-reclaimed-soft">Reclaimed</span>}
                      </div>
                      <div className="text-tertiary text-xs font-mono">{leak.resourceId}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="cost-tag font-mono text-rose-400">
                      +${leak.monthlyCost}/mo
                    </div>
                    {!isCleaned ? (
                      <button 
                        className="btn-clean-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCleanLeak(leak.id);
                        }}
                        disabled={isCleaning}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Fix</span>
                      </button>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail */}
        {selectedLeak && (
          <div className="detail-card">
            <div className="flex-between mb-4">
              <div>
                <span className="badge-mono mb-1">{selectedLeak.id}</span>
                <h3 className="detail-main-title text-lg">{selectedLeak.name}</h3>
                <span className="text-tertiary text-xs font-mono">{selectedLeak.resourceId}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold font-mono text-rose-400">${selectedLeak.monthlyCost}</span>
                <span className="text-tertiary text-xs block">/ month wasted</span>
              </div>
            </div>

            <div className="strategy-box mb-4">
              <div className="text-secondary text-xs font-medium mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Bedrock Recommendation</span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedLeak.recommendation}</p>
            </div>

            <div className="cli-block mb-4">
              <div className="flex-between mb-1.5">
                <span className="text-xs text-secondary font-medium">AWS CLI Teardown Command</span>
                <button 
                  className="btn-copy-icon"
                  onClick={() => handleCopy(selectedLeak.agentCommand, selectedLeak.id)}
                >
                  {copiedId === selectedLeak.id ? (
                    <span className="text-emerald-400 text-xs font-mono">Copied</span>
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>
              <pre className="step-code font-mono text-xs">
                <code>{selectedLeak.agentCommand}</code>
              </pre>
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-secondary mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Snapshots are created automatically before deletion.</span>
              </div>

              {!cleanedIds.has(selectedLeak.id) ? (
                <button 
                  className="btn-primary-action w-full"
                  onClick={() => handleCleanLeak(selectedLeak.id)}
                  disabled={isCleaning}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Execute Safe Reclaim (+${selectedLeak.monthlyCost}/mo)</span>
                </button>
              ) : (
                <div className="badge-resolved-clean justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Waste Successfully Terminated</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
