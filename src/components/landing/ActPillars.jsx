import React, { useState } from 'react';
import { 
  Brain, 
  Code, 
  Activity, 
  Compass, 
  Heart, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Lock
} from 'lucide-react';
import { PROBLEM_CATEGORIES } from './landingData';

const ICONS = {
  Brain,
  Code,
  Activity,
  Compass,
};

export default function ActPillars({ onEnterApp }) {
  const [selectedCatId, setSelectedCatId] = useState('mental');
  const [empathyMap, setEmpathyMap] = useState({});

  const currentCategory = PROBLEM_CATEGORIES.find(c => c.id === selectedCatId) || PROBLEM_CATEGORIES[0];
  const IconComponent = ICONS[currentCategory.iconName] || Brain;

  const handleEmpathyClick = (problemId, currentCount) => {
    setEmpathyMap(prev => {
      const alreadyLiked = !!prev[problemId];
      return {
        ...prev,
        [problemId]: alreadyLiked ? prev[problemId] - 1 : (currentCount + 1)
      };
    });
  };

  return (
    <section id="story-pillars" className="story-act pillars-act">
      <div className="section-container">
        <div className="section-header">
          <div className="section-eyebrow">
            <Sparkles size={14} />
            <span>Act II • The Realms of Struggle</span>
          </div>
          <h2 className="section-title">
            Any problem. No judgment. <br />
            <span className="text-gradient">Three dedicated sanctuary spaces.</span>
          </h2>
          <p className="section-desc">
            Whether your nervous system is in fight-or-flight, your production servers are crashing,
            or your neck and joints are screaming—there is a moderated corner waiting for you.
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="pillars-nav">
          {PROBLEM_CATEGORIES.map(cat => {
            const CatIcon = ICONS[cat.iconName] || Brain;
            const isSelected = cat.id === selectedCatId;
            return (
              <button
                key={cat.id}
                type="button"
                className={`pillar-tab ${isSelected ? 'active' : ''} pillar-${cat.id}`}
                onClick={() => setSelectedCatId(cat.id)}
              >
                <CatIcon size={18} />
                <span>{cat.title.split(' ')[0]} {cat.title.split(' ')[1]}</span>
                {isSelected && <span className="pillar-active-pip" />}
              </button>
            );
          })}
        </div>

        {/* Category Showcase Card */}
        <div className={`pillar-showcase pillar-${currentCategory.id}`}>
          <div className="pillar-showcase-header">
            <div className="pillar-meta">
              <div className="pillar-icon-box">
                <IconComponent size={24} />
              </div>
              <div>
                <h3 className="pillar-showcase-title">{currentCategory.title}</h3>
                <p className="pillar-showcase-subtitle">{currentCategory.subtitle}</p>
              </div>
            </div>
            <div className="pillar-badge-box">
              <ShieldCheck size={16} />
              <span>{currentCategory.badge}</span>
            </div>
          </div>

          <p className="pillar-description">{currentCategory.description}</p>

          {/* Example Community Threads */}
          <div className="problems-grid">
            {currentCategory.exampleProblems.map(prob => {
              const currentLikes = empathyMap[prob.id] ?? prob.empathyCount;
              const hasLiked = !!empathyMap[prob.id];

              return (
                <div key={prob.id} className="problem-card">
                  <div className="problem-card-top">
                    <div className="problem-author-group">
                      <div className="problem-avatar">
                        <Lock size={12} />
                      </div>
                      <span className="problem-author">{prob.author}</span>
                      <span className="problem-dot">•</span>
                      <span className="problem-time">{prob.timeAgo}</span>
                    </div>
                    <span className="problem-verified-badge">
                      <CheckCircle2 size={13} />
                      <span>{prob.verifiedHelp}</span>
                    </span>
                  </div>

                  <h4 className="problem-title">{prob.title}</h4>
                  <p className="problem-text">{prob.text}</p>

                  <div className="problem-tags">
                    {prob.tags.map(t => (
                      <span key={t} className="problem-tag">#{t}</span>
                    ))}
                  </div>

                  <div className="problem-footer">
                    <button
                      type="button"
                      className={`btn-empathy ${hasLiked ? 'liked' : ''}`}
                      onClick={() => handleEmpathyClick(prob.id, prob.empathyCount)}
                      title="Send empathy to this member"
                    >
                      <Heart size={16} fill={hasLiked ? 'currentColor' : 'none'} />
                      <span>{currentLikes} Hear You</span>
                    </button>

                    <div className="problem-replies">
                      <MessageSquare size={16} />
                      <span>{prob.responsesCount} verified responses</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pillar-action-row">
            <button
              type="button"
              className="btn-story-primary"
              onClick={onEnterApp}
            >
              <span>Share a problem in this category</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
