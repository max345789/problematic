import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import { formatTime, timeAgo } from '../services/utils';
import { getRespectadeoTier } from '../services/storage';

export default function ChatScreen({
  conversation,
  recipientUser,
  onBack,
  showToast,
}) {
  const {
    currentUser,
    sendDirectMessage,
    acceptRequest,
    declineRequest,
    markChatRead,
    loadMessages,
  } = useApp();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const messagesEndRef = useRef(null);

  const recipient = recipientUser;
  const isPendingRequest = conversation?.status === 'pending' && conversation?.recipientId === currentUser?.id;
  const isDeclined = conversation?.status === 'declined';
  const isNobody = recipient?.messagingPermission === 'nobody';

  const [loadError, setLoadError] = useState(null);

  // Load message history
  const fetchHistory = useCallback(async () => {
    if (!conversation?.id) {
      setMessages([]);
      setLoadingHistory(false);
      setLoadError(null);
      return;
    }
    try {
      setLoadingHistory(true);
      setLoadError(null);
      const msgs = await loadMessages(conversation.id);
      setMessages(msgs || []);
      // Mark conversation as read
      if (currentUser?.id) {
        await markChatRead(conversation.id);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      setLoadError(err?.message || 'Failed to load message history.');
    } finally {
      setLoadingHistory(false);
    }
  }, [conversation?.id, currentUser?.id, loadMessages, markChatRead]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const clean = text.trim();
    if (!clean || sending || !recipient?.id) return;

    if (isNobody) {
      showToast?.(`${recipient.name || recipient.handle} does not accept direct messages.`);
      return;
    }

    try {
      setSending(true);
      const res = await sendDirectMessage({
        recipientId: recipient.id,
        text: clean,
      });

      if (res?.message) {
        setMessages((prev) => [...prev, res.message]);
      }
      setText('');
    } catch (err) {
      showToast?.(err?.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  };

  const handleAccept = async () => {
    if (!conversation?.id) return;
    try {
      await acceptRequest(conversation.id);
      showToast?.('Message request accepted! You can now chat freely.');
    } catch (err) {
      showToast?.('Could not accept request.');
    }
  };

  const handleDecline = async () => {
    if (!conversation?.id) return;
    try {
      await declineRequest(conversation.id);
      showToast?.('Message request declined.');
      onBack?.();
    } catch (err) {
      showToast?.('Could not decline request.');
    }
  };

  const recipientTier = getRespectadeoTier(recipient?.respectadeo || 0);

  return (
    <div className="chat-screen">
      {/* Header */}
      <header className="chat-header">
        <button
          type="button"
          className="chat-back-btn"
          onClick={onBack}
          aria-label="Back to messages"
        >
          <Icon.Back />
        </button>

        <div className="chat-header-user">
          <div
            className="av chat-header-av"
            style={{ background: recipient?.avatarBg || '#1F6F6B' }}
          >
            {recipient?.avatar || '?'}
          </div>
          <div className="chat-header-info">
            <div className="chat-header-name-row">
              <span className="chat-header-name">{recipient?.name || 'User'}</span>
              {recipient?.isModerator && (
                <span className="chat-mod-tag">🛡️ MOD</span>
              )}
            </div>
            <div className="chat-header-meta">
              <span className="chat-header-handle">{recipient?.handle || '@user'}</span>
              <span className="chat-dot">·</span>
              <span className="chat-tier-badge" style={{ color: recipientTier.color }}>
                {recipientTier.title}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Thread Body */}
      <div className="chat-body">
        {/* Pending Request Banner for Recipient */}
        {isPendingRequest && (
          <div className="chat-request-banner">
            <div className="chat-request-title">
              <span>📩 Message Request</span>
            </div>
            <div className="chat-request-desc">
              <strong>{recipient?.name}</strong> wants to send you a message. They won't know you have seen it until you accept.
            </div>
            <div className="chat-request-actions">
              <button
                type="button"
                className="chat-accept-btn"
                onClick={handleAccept}
              >
                <Icon.Check size={16} /> Accept Request
              </button>
              <button
                type="button"
                className="chat-decline-btn"
                onClick={handleDecline}
              >
                <Icon.Close size={16} /> Decline
              </button>
            </div>
          </div>
        )}

        {/* Disabled Direct Messages Notice */}
        {isNobody && (
          <div className="chat-notice-card warning">
            <Icon.Lock size={18} />
            <span>This user has closed direct messages. You cannot reply.</span>
          </div>
        )}

        {isDeclined && (
          <div className="chat-notice-card">
            <span>This message request was declined.</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loadingHistory && (
          <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-sub)' }}>
            <div className="app-loading-spinner" />
          </div>
        )}

        {/* Error State with Retry */}
        {!loadingHistory && loadError && (
          <div className="chat-error-state" style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-sub)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
            <div style={{ color: '#F87171', fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
              {loadError}
            </div>
            <button
              type="button"
              className="chat-accept-btn"
              style={{ display: 'inline-flex', width: 'auto', padding: '8px 16px', margin: '0 auto', gap: 6 }}
              onClick={fetchHistory}
            >
              <Icon.Refresh size={16} /> Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loadingHistory && !loadError && messages.length === 0 && !isPendingRequest && (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">💬</div>
            <div className="chat-empty-title">Start a conversation</div>
            <div className="chat-empty-desc">
              Connect with <strong>{recipient?.name}</strong> to exchange solutions, insights, or advice.
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((m) => {
          const isMe = m.senderId === currentUser?.id;
          return (
            <div
              key={m.id}
              className={`chat-bubble-row ${isMe ? 'sent' : 'received'}`}
            >
              {!isMe && (
                <div
                  className="av chat-bubble-av"
                  style={{ background: recipient?.avatarBg || '#1F6F6B' }}
                >
                  {recipient?.avatar || '?'}
                </div>
              )}
              <div className="chat-bubble-container">
                <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-them'}`}>
                  <div className="chat-bubble-text">{m.text}</div>
                </div>
                <div className="chat-bubble-time">
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="chat-input-bar">
        <input
          type="text"
          className="chat-text-input"
          placeholder={
            isNobody
              ? 'Direct messages disabled by user'
              : isPendingRequest
              ? 'Accept request to reply…'
              : `Message ${recipient?.name || 'user'}…`
          }
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isNobody || isPendingRequest || sending}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!text.trim() || sending || isNobody || isPendingRequest}
          aria-label="Send message"
        >
          <Icon.Send size={18} />
        </button>
      </form>
    </div>
  );
}
