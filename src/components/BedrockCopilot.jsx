import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Cpu, 
  Terminal, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Zap, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { COPILOT_PRESETS } from '../data/mockData';

export function BedrockCopilot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Welcome to OpsPulse Bedrock Copilot

I am your autonomous SRE & FinOps intelligence engine powered by **AWS Bedrock (Claude 3.5 Sonnet)**.

I have direct, continuous context of your AWS infrastructure, CloudWatch telemetry, and Cost Explorer anomalies. 

**What would you like me to analyze?**
- ⚡ Run root cause diagnosis on active CloudWatch alarms
- 💰 Audit unattached EBS volumes or idle NAT gateways
- 🛡️ Inspect IAM execution roles for least-privilege security
- 🚀 Generate AWS CLI or CloudFormation remediation templates`
    }
  ]);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim() || isGenerating) return;

    const userText = textToSend;
    setInput('');

    // Append user message
    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: userText }
    ];
    setMessages(newMessages);
    setIsGenerating(true);

    // Look for preset match or generate dynamic intelligent response
    const matchedPreset = COPILOT_PRESETS.find(p => 
      p.prompt.toLowerCase() === userText.toLowerCase() ||
      userText.toLowerCase().includes(p.label.toLowerCase())
    );

    setTimeout(() => {
      let responseContent = '';
      if (matchedPreset) {
        responseContent = matchedPreset.response;
      } else {
        responseContent = `### 🤖 AWS Bedrock Autonomous Analysis

Query: *"${userText}"*

**Analysis Summary:**
Based on the live telemetry from region \`us-east-1\`, OpsPulse Agent evaluated the infrastructure configuration against AWS Well-Architected Framework best practices.

**Actionable AWS CLI Command:**
\`\`\`bash
# Generated for AWS Account: 1829-3049-1028
aws cloudwatch describe-alarm-history \\
  --alarm-name "HighCPUUtilization" \\
  --start-date $(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ) \\
  --max-items 10

aws sts get-caller-identity
\`\`\`
*Telemetry verified healthy. No critical security exposure detected in active security groups.*`;
      }

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: responseContent }
      ]);
      setIsGenerating(false);
    }, 1200);
  };

  const handlePresetClick = (preset) => {
    handleSend(preset.prompt);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="copilot-container">
      {/* Top Banner with Model Info */}
      <div className="copilot-header">
        <div className="flex-between">
          <div className="model-brand">
            <div className="sparkle-circle">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="copilot-title">AWS Bedrock DevOps Copilot</h3>
              <p className="copilot-subtitle">Model: <code className="font-mono text-purple-300">anthropic.claude-3-5-sonnet-20241022-v2:0</code></p>
            </div>
          </div>

          <div className="telemetry-chip font-mono text-xs">
            Latency: 284ms • Tokens/sec: 84 • Region: us-east-1
          </div>
        </div>

        {/* Preset quick prompt chips */}
        <div className="copilot-presets">
          <span className="presets-label">Quick Prompts:</span>
          {COPILOT_PRESETS.map((preset, i) => (
            <button 
              key={i} 
              className="preset-chip"
              onClick={() => handlePresetClick(preset)}
              disabled={isGenerating}
            >
              <Zap className="w-3 h-3 text-orange-400 inline mr-1" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="copilot-chat-window">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`chat-bubble-row ${msg.role}`}>
            <div className={`chat-avatar ${msg.role}`}>
              {msg.role === 'assistant' ? (
                <Bot className="w-4 h-4 text-purple-400" />
              ) : (
                <User className="w-4 h-4 text-cyan-300" />
              )}
            </div>

            <div className={`chat-bubble ${msg.role}`}>
              <div className="chat-markdown">
                {msg.content.split('\n').map((line, lIdx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={lIdx} className="chat-h4">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('```')) {
                    return null; // Handle code blocks below
                  }
                  if (line.startsWith('- ')) {
                    return <li key={lIdx} className="chat-li">{line.replace('- ', '')}</li>;
                  }
                  if (line.trim().length === 0) {
                    return <div key={lIdx} className="h-2" />;
                  }
                  return <p key={lIdx} className="chat-p">{line}</p>;
                })}

                {/* Detect bash code block */}
                {msg.content.includes('```') && (
                  <div className="chat-code-block font-mono">
                    <div className="code-header">
                      <span>AWS CLI / BASH</span>
                      <button 
                        className="btn-copy-code"
                        onClick={() => handleCopy(msg.content, idx)}
                      >
                        {copiedIndex === idx ? (
                          <span className="text-emerald-400 text-xs">Copied</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <pre>
                      <code>
                        {msg.content.split('```')[1]?.replace(/^(bash|json)\n/, '') || ''}
                      </code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="chat-bubble-row assistant">
            <div className="chat-avatar assistant">
              <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="chat-bubble assistant typing">
              <div className="typing-dots">
                <span /><span /><span />
              </div>
              <span className="typing-text font-mono text-xs text-zinc-400">
                Querying AWS Bedrock &amp; CloudWatch metrics...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Query Input Bar */}
      <form 
        className="copilot-input-bar"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input 
          type="text"
          className="copilot-input"
          placeholder="Ask Bedrock to diagnose an alarm, generate an AWS CLI script, or optimize costs..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating}
        />
        <button 
          type="submit"
          className="btn-send"
          disabled={!input.trim() || isGenerating}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
