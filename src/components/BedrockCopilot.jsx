import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Copy, 
  Zap
} from 'lucide-react';
import { COPILOT_PRESETS } from '../data/mockData';

export function BedrockCopilot() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### 👋 Bedrock Cloud SRE Copilot

I am your infrastructure intelligence assistant powered by **AWS Bedrock (Claude 3.5 Sonnet)**.

I have live context of your AWS account (\`736467843800\`), CloudWatch alarms, and cost optimization opportunities.

**Suggested Queries:**
- ⚡ Diagnose root cause of active RDS connection spikes
- 💰 Audit unattached EBS volumes and show potential savings
- 🛡️ Inspect IAM execution roles for least-privilege security
- 🚀 Generate AWS CLI or CloudFormation mitigation commands`
    }
  ]);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleSend = (textToSend = input) => {
    if (!textToSend.trim() || isGenerating) return;

    const userText = textToSend;
    setInput('');

    const newMessages = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: userText }
    ];
    setMessages(newMessages);
    setIsGenerating(true);

    const matchedPreset = COPILOT_PRESETS.find(p => 
      p.prompt.toLowerCase() === userText.toLowerCase() ||
      userText.toLowerCase().includes(p.label.toLowerCase())
    );

    setTimeout(() => {
      let responseContent = '';
      if (matchedPreset) {
        responseContent = matchedPreset.response;
      } else {
        responseContent = `### 🤖 AWS Bedrock Analysis

Query: *"${userText}"*

**Analysis Summary:**
OpsPulse evaluated your target infrastructure configuration against AWS Well-Architected Framework best practices.

**Recommended AWS CLI Command:**
\`\`\`bash
# Account: 736467843800 (us-east-1)
aws cloudwatch describe-alarm-history \\
  --alarm-name "HighCPUUtilization" \\
  --start-date $(date -u -v-1d +%Y-%m-%dT%H:%M:%SZ) \\
  --max-items 5

aws sts get-caller-identity
\`\`\`
*Telemetry healthy. No critical security exposure detected.*`;
      }

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'assistant', content: responseContent }
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  const handlePresetClick = (preset) => {
    handleSend(preset.prompt);
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  return (
    <div className="copilot-box">
      {/* Top Bar */}
      <div className="copilot-top-bar">
        <div className="flex items-center gap-2.5">
          <div className="sparkle-soft-circle">
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="section-title-sm">Bedrock SRE Copilot</h3>
            <span className="text-tertiary text-xs">Model: <code className="text-purple-300">Claude 3.5 Sonnet</code></span>
          </div>
        </div>

        {/* Quick prompt pills */}
        <div className="quick-prompt-chips">
          {COPILOT_PRESETS.map((preset, i) => (
            <button 
              key={i} 
              className="chip-prompt"
              onClick={() => handlePresetClick(preset)}
              disabled={isGenerating}
            >
              <Zap className="w-3 h-3 text-amber-400 inline mr-1" />
              <span>{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="copilot-msg-stream">
        {messages.map((msg, idx) => (
          <div key={msg.id} className={`chat-row ${msg.role}`}>
            <div className={`chat-avatar-mini ${msg.role}`}>
              {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-purple-400" /> : <User className="w-4 h-4 text-sky-300" />}
            </div>

            <div className={`chat-card-bubble ${msg.role}`}>
              <div className="chat-parsed-text">
                {msg.content.split('\n').map((line, lIdx) => {
                  if (line.startsWith('### ')) {
                    return <h4 key={lIdx} className="chat-heading-4">{line.replace('### ', '')}</h4>;
                  }
                  if (line.startsWith('```')) {
                    return null;
                  }
                  if (line.startsWith('- ')) {
                    return <li key={lIdx} className="chat-bullet">{line.replace('- ', '')}</li>;
                  }
                  if (line.trim().length === 0) {
                    return <div key={lIdx} className="h-1.5" />;
                  }
                  return <p key={lIdx} className="chat-line">{line}</p>;
                })}

                {msg.content.includes('```') && (
                  <div className="clean-code-box font-mono">
                    <div className="code-box-header">
                      <span>AWS CLI</span>
                      <button 
                        className="btn-copy-icon"
                        onClick={() => handleCopy(msg.content, idx)}
                      >
                        {copiedIndex === idx ? (
                          <span className="text-emerald-400 text-xs">Copied</span>
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <pre className="code-box-body">
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
          <div className="chat-row assistant">
            <div className="chat-avatar-mini assistant">
              <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div className="chat-card-bubble assistant flex items-center gap-2">
              <span className="typing-dot" />
              <span className="text-xs text-slate-400 font-mono">Bedrock reasoning in progress...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Field */}
      <form 
        className="copilot-input-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
      >
        <input 
          type="text"
          className="copilot-text-input"
          placeholder="Ask Bedrock to diagnose an alarm or generate an AWS remediation script..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isGenerating}
        />
        <button 
          type="submit"
          className="btn-send-clean"
          disabled={!input.trim() || isGenerating}
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </form>
    </div>
  );
}
