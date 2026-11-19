import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icons';

export default function ShareModal({ post, onClose, onShareSuccess }) {
  const [copied, setCopied] = useState(false);
  const modalRef = useRef(null);
  const copyTimerRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [onClose]);

  if (!post) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const postUrl = `${origin}/#post-${post.id}`;
  const shareTitle = post.title || 'Problematic Post';
  const shareText = `"${post.title || post.text}" — by ${post.author} on Problematic`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${postUrl}`);
      setCopied(true);
      onShareSuccess?.('Link & text copied to clipboard!');
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: postUrl,
        });
        onShareSuccess?.('Post shared successfully!');
        onClose?.();
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const platforms = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: <Icon.WhatsApp />,
      color: '#25D366',
      action: () => {
        const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${postUrl}`)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        onShareSuccess?.('Shared to WhatsApp!');
        onClose?.();
      },
    },
    {
      id: 'twitter',
      name: 'X (Twitter)',
      icon: <Icon.XTwitter />,
      color: '#FFFFFF',
      action: () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        onShareSuccess?.('Shared to X!');
        onClose?.();
      },
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: <Icon.Telegram />,
      color: '#2AABEE',
      action: () => {
        const url = `https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        onShareSuccess?.('Shared to Telegram!');
        onClose?.();
      },
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: <Icon.Reddit />,
      color: '#FF4500',
      action: () => {
        const url = `https://reddit.com/submit?url=${encodeURIComponent(postUrl)}&title=${encodeURIComponent(shareTitle)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        onShareSuccess?.('Shared to Reddit!');
        onClose?.();
      },
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: <Icon.LinkedIn />,
      color: '#0A66C2',
      action: () => {
        const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`;
        window.open(url, '_blank', 'noopener,noreferrer');
        onShareSuccess?.('Shared to LinkedIn!');
        onClose?.();
      },
    },
    {
      id: 'copy',
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? <Icon.Check /> : <Icon.Copy />,
      color: copied ? '#10B981' : '#FFFFFF',
      action: copyToClipboard,
    },
  ];

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={modalRef}
        className="bottom-sheet share-modal-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-sheet-heading"
        tabIndex={-1}
      >
        <div className="sheet-handle" />

        <div className="share-modal-header">
          <div className="share-modal-title-wrap">
            <h2 id="share-sheet-heading" className="share-modal-title">Share Post</h2>
            <span className="share-modal-subtitle">Spread the word across any platform</span>
          </div>
          <button
            type="button"
            className="sheet-close-btn"
            onClick={onClose}
            aria-label="Close share sheet"
          >
            <Icon.Close />
          </button>
        </div>

        {/* Post Preview Snippet */}
        <div className="share-post-preview">
          <div className="share-preview-meta">
            <span className="share-preview-author">{post.author}</span>
            {post.category && <span className="share-preview-tag">{post.category}</span>}
          </div>
          <p className="share-preview-text">
            {post.title ? `"${post.title}" — ` : ''}{post.text?.length > 120 ? `${post.text.slice(0, 120)}…` : post.text}
          </p>
        </div>

        {/* Platforms Grid */}
        <div className="share-platforms-grid">
          {platforms.map((p) => (
            <button
              key={p.id}
              type="button"
              className="share-platform-btn"
              onClick={p.action}
              aria-label={`Share via ${p.name}`}
            >
              <div className="share-platform-icon" style={{ color: p.color }}>
                {p.icon}
              </div>
              <span className="share-platform-label">{p.name}</span>
            </button>
          ))}
        </div>

        {/* Native OS Share Button */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            type="button"
            className="share-native-btn"
            onClick={handleNativeShare}
          >
            <Icon.Share />
            <span>More Sharing Options (System Dialog)</span>
          </button>
        )}
      </div>
    </>
  );
}
