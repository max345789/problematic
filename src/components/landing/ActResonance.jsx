import React from 'react';
import { Sparkles, Heart, CheckCircle2, MessageCircle, MapPin, Award } from 'lucide-react';
import { COMMUNITY_STORIES, STATS_HIGHLIGHTS } from './landingData';

export default function ActResonance() {
  return (
    <section id="story-resonance" className="story-act resonance-act">
      <div className="section-container">
        <div className="section-header">
          <div className="section-eyebrow">
            <Sparkles size={14} className="text-violet" />
            <span>Act IV • The Collective Resonance</span>
          </div>
          <h2 className="section-title">
            From Silent Burden <br />
            <span className="text-gradient-violet">to Verified Resolution.</span>
          </h2>
          <p className="section-desc">
            See how real members found relief, technical breakthroughs, and physical healing
            when they reached out in a space that truly listens.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="stories-grid">
          {COMMUNITY_STORIES.map(story => (
            <div key={story.id} className="story-resolution-card">
              <div className="story-card-top">
                <span className="story-category-tag">{story.category}</span>
                <div className="story-user-meta">
                  <span className="story-author">{story.author}</span>
                  <span className="story-dot">•</span>
                  <span className="story-loc">
                    <MapPin size={12} />
                    {story.location}
                  </span>
                </div>
              </div>

              <div className="story-body">
                <div className="story-problem-block">
                  <span className="story-label">The Struggle:</span>
                  <p className="story-problem-text">“{story.problem}”</p>
                </div>

                <div className="story-solution-block">
                  <span className="story-label verified-label">
                    <CheckCircle2 size={13} className="text-emerald" />
                    <span>The Verified Resolution:</span>
                  </span>
                  <p className="story-solution-text">“{story.solution}”</p>
                </div>
              </div>

              <div className="story-card-bottom">
                <div className="story-verifier-role">
                  <Award size={14} className="text-emerald" />
                  <span>{story.verifierRole}</span>
                </div>

                <div className="story-impact-badge">
                  <span>{story.impactMetric}</span>
                </div>

                <div className="story-empathy-stat">
                  <Heart size={14} className="text-violet" fill="currentColor" />
                  <span>{story.empathyVotes} empathy votes</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Platform Stat Banner */}
        <div className="stats-banner">
          {STATS_HIGHLIGHTS.map((item, idx) => (
            <div key={idx} className="stat-item">
              <div className="stat-number">{item.stat}</div>
              <div className="stat-label">{item.label}</div>
              <p className="stat-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
