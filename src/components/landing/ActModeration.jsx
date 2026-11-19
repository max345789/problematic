import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  Award, 
  Feather, 
  CheckCircle2, 
  AlertTriangle, 
  Zap,
  ArrowRight,
  Eye,
  Lock,
  Sparkles
} from 'lucide-react';
import { MODERATION_STEPS } from './landingData';

const STEP_ICONS = {
  Feather,
  ShieldAlert,
  UserCheck,
  Award
};

const SIMULATOR_PRESETS = [
  {
    id: 'p1',
    label: 'Mental Stress',
    text: "I haven't slept in 4 days from work anxiety and I feel like disappearing from everything.",
    category: 'Mental Health',
    flags: 'Distress keywords detected • Compassion protocol engaged',
    moderatorAction: 'Dispatched certified crisis helpline info + warm peer advocate notification',
    badge: '🛡️ Moderated with Care & Pinned Resources'
  },
  {
    id: 'p2',
    label: 'Tech Architecture',
    text: "Can someone verify my microservices migration plan? Our latency jumped 300ms.",
    category: 'Technology',
    flags: 'Zero safety issues • Code & architecture context detected',
    moderatorAction: 'Routed to verified Staff DevOps Engineers for accurate review',
    badge: '⚡ Verified Tech Dilemma'
  },
  {
    id: 'p3',
    label: 'Physical Injury',
    text: "Pain shooting down my shoulder blade whenever I type. Any safe stretches?",
    category: 'Physical Body',
    flags: 'Ergonomic query • Medical diagnosis guardrail verified',
    moderatorAction: 'Filtered out hazardous unvetted prescription claims; verified PT guides attached',
    badge: '🌿 Vetted Ergonomic Topic'
  }
];

export default function ActModeration() {
  const [selectedPreset, setSelectedPreset] = useState(SIMULATOR_PRESETS[0]);
  const [simStep, setSimStep] = useState(3); // All complete by default

  const runSimulation = (preset) => {
    setSelectedPreset(preset);
    setSimStep(1);
    setTimeout(() => setSimStep(2), 500);
    setTimeout(() => setSimStep(3), 1100);
  };

  return (
    <section id="story-moderation" className="story-act moderation-act">
      <div className="section-container">
        <div className="section-header">
          <div className="section-eyebrow">
            <ShieldCheck size={14} className="text-emerald" />
            <span>Act III • The Guardian & Verification Engine</span>
          </div>
          <h2 className="section-title">
            Zero toxic noise. No unverified quackery. <br />
            <span className="text-gradient-emerald">Human moderation at every step.</span>
          </h2>
          <p className="section-desc">
            The internet is full of places where asking for help invites cruelty or bad advice.
            Problematic is designed from the database up to guarantee psychological safety and verified answers.
          </p>
        </div>

        {/* 4-Step Pipeline Grid */}
        <div className="pipeline-grid">
          {MODERATION_STEPS.map((step, index) => {
            const StepIcon = STEP_ICONS[step.iconName] || ShieldCheck;
            return (
              <div key={step.stepNumber} className="pipeline-step-card">
                <div className="pipeline-step-top">
                  <span className="pipeline-step-number">{step.stepNumber}</span>
                  <div className="pipeline-icon-circle">
                    <StepIcon size={20} />
                  </div>
                </div>

                <h3 className="pipeline-step-title">{step.title}</h3>
                <h4 className="pipeline-step-subtitle">{step.subtitle}</h4>
                <p className="pipeline-step-detail">{step.detail}</p>

                <div className="pipeline-badge-box">
                  <span className="pipeline-badge-pill">{step.badge}</span>
                </div>

                <div className="pipeline-guardrail">
                  <ShieldCheck size={14} className="text-emerald" />
                  <span>{step.guardrail}</span>
                </div>

                {index < MODERATION_STEPS.length - 1 && (
                  <div className="pipeline-arrow-connector">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Interactive Verification Simulator */}
        <div className="moderation-simulator">
          <div className="simulator-header">
            <div className="simulator-title-group">
              <Sparkles size={18} className="text-emerald" />
              <div>
                <h3 className="simulator-title">Live Verification & Safety Simulator</h3>
                <p className="simulator-subtitle">See how raw submissions are protected and verified in real-time</p>
              </div>
            </div>

            <div className="simulator-presets">
              <span className="presets-label">Test Preset:</span>
              {SIMULATOR_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset-btn ${preset.id === selectedPreset.id ? 'active' : ''}`}
                  onClick={() => runSimulation(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="simulator-body">
            {/* Input preview */}
            <div className="simulator-pane simulator-input">
              <div className="pane-tag">
                <Lock size={13} />
                <span>Encrypted Post Submission</span>
              </div>
              <blockquote className="sim-quote">
                “{selectedPreset.text}”
              </blockquote>
              <div className="sim-meta">
                <span>Category: <strong>{selectedPreset.category}</strong></span>
                <span>Anonymity: <strong>Whisper Mode Active</strong></span>
              </div>
            </div>

            {/* Pipeline progress tracking */}
            <div className="simulator-pane simulator-engine">
              <div className="pane-tag">
                <Zap size={13} />
                <span>Verification Pipeline Status</span>
              </div>

              <div className="sim-stages">
                <div className={`sim-stage-item ${simStep >= 1 ? 'done' : 'pending'}`}>
                  <div className="sim-stage-indicator">
                    {simStep >= 1 ? <CheckCircle2 size={16} /> : <div className="sim-spinner" />}
                  </div>
                  <div>
                    <strong>1. Automated Safety Shield</strong>
                    <p>{selectedPreset.flags}</p>
                  </div>
                </div>

                <div className={`sim-stage-item ${simStep >= 2 ? 'done' : 'pending'}`}>
                  <div className="sim-stage-indicator">
                    {simStep >= 2 ? <CheckCircle2 size={16} /> : <div className="sim-spinner" />}
                  </div>
                  <div>
                    <strong>2. Human Moderator Review</strong>
                    <p>{selectedPreset.moderatorAction}</p>
                  </div>
                </div>

                <div className={`sim-stage-item ${simStep >= 3 ? 'done' : 'pending'}`}>
                  <div className="sim-stage-indicator">
                    {simStep >= 3 ? <CheckCircle2 size={16} /> : <div className="sim-spinner" />}
                  </div>
                  <div>
                    <strong>3. Published to Protected Feed</strong>
                    <div className="sim-verified-badge">
                      <ShieldCheck size={14} />
                      <span>{selectedPreset.badge}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
