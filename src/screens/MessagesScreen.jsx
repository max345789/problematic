import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Icon from '../components/Icons';
import ChatScreen from './ChatScreen';
import { timeAgo } from '../services/utils';
import { getRespectadeoTier } from '../services/storage';

export default function MessagesScreen({
  initialRecipientId = null,
  onClearInitialRecipient,
  showToast,
}) {
  const {
    currentUser,
    users,
    conversations,
    pendingRequestsCount,
  } = useApp();

  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox' | 'requests'
  const [selectedRecipientId, setSelectedRecipientId] = useState(initialRecipientId);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  // When initialRecipientId changes from outside (e.g. tapping "Message" on a post or comment)
  useEffect(() => {
    if (initialRecipientId) {
      setSelectedRecipientId(initialRecipientId);
    }
  }, [initialRecipientId]);

  // Separate conversations into Inbox (active) and Requests (pending for current user)
  const { inboxList, requestsList } = useMemo(() => {
    const inbox = [];
    const requests = [];

    conversations.forEach((conv) => {
      // Find the other participant
      const otherId = conv.participantIds?.find((id) => id !== currentUser?.id);
      const otherUser = users.find((u) => u.id === otherId);

      const convItem = {
        ...conv,
        otherUser: otherUser || {
          id: otherId,
          name: 'Unknown User',
          handle: '@user',
          avatar: '?',
          avatarBg: '#536471',
          respectadeo: 0,
        },
      };

      if (conv.status === 'pending' && conv.recipientId === currentUser?.id) {
        requests.push(convItem);
      } else if (conv.status === 'active' || (conv.status === 'pending' && conv.initiatorId === currentUser?.id)) {
        inbox.push(convItem);
      }
    });

    // Sort by updatedAt descending
    inbox.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    requests.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

    return { inboxList: inbox, requestsList: requests };
  }, [conversations, currentUser?.id, users]);

  // Active list based on selected tab and search
  const currentList = useMemo(() => {
    const base = activeTab === 'inbox' ? inboxList : requestsList;
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter(
      (c) =>
        c.otherUser?.name?.toLowerCase().includes(q) ||
        c.otherUser?.handle?.toLowerCase().includes(q) ||
        c.lastMessage?.text?.toLowerCase().includes(q)
    );
  }, [activeTab, inboxList, requestsList, searchQuery]);

  // If a conversation/recipient is selected, render ChatScreen
  if (selectedRecipientId) {
    const targetUser = users.find((u) => u.id === selectedRecipientId);
    const existingConv = conversations.find(
      (c) =>
        Array.isArray(c.participantIds) &&
        c.participantIds.includes(currentUser?.id) &&
        c.participantIds.includes(selectedRecipientId)
    );

    return (
      <ChatScreen
        conversation={existingConv}
        recipientUser={targetUser}
        onBack={() => {
          setSelectedRecipientId(null);
          onClearInitialRecipient?.();
        }}
        showToast={showToast}
      />
    );
  }

  return (
    <div className="messages-screen">
      {/* Header */}
      <header className="h messages-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'max(14px, calc(env(safe-area-inset-top, 0px) + 10px)) 14px 12px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeTab === 'requests' && (
            <button
              type="button"
              className="settings-back-btn"
              onClick={() => setActiveTab('inbox')}
              aria-label="Back to Inbox"
              style={{ width: 32, height: 32, padding: 0 }}
            >
              <Icon.Back size={20} />
            </button>
          )}
          <div className="logo" style={{ margin: 0, textAlign: 'left' }}>
            <span>{activeTab === 'requests' ? 'Requests' : 'Inbox'}</span>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="messages-more-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="More options"
            aria-expanded={menuOpen}
          >
            <Icon.More />
            {pendingRequestsCount > 0 && activeTab !== 'requests' && (
              <span className="messages-dot-badge" />
            )}
          </button>

          {menuOpen && (
            <>
              <div
                onClick={() => setMenuOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: 40 }}
              />
              <div className="glass-dropdown-menu" style={{ right: 0, top: '100%', minWidth: 190 }}>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setActiveTab(activeTab === 'requests' ? 'inbox' : 'requests');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon.Mail size={15} />
                    <span>{activeTab === 'requests' ? 'View Inbox' : 'Message requests'}</span>
                  </span>
                  {pendingRequestsCount > 0 && (
                    <span className="messages-tab-badge-amber">{pendingRequestsCount}</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowNewChatModal(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icon.Plus size={15} />
                  <span>New conversation</span>
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="screen-scroll messages-content" tabIndex={-1}>
        {/* Search input */}
        <div className="messages-search-wrap">
          <input
            type="text"
            className="messages-search-input"
            placeholder={activeTab === 'requests' ? 'Search requests…' : 'Search direct messages…'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Requests Explanatory Banner */}
        {activeTab === 'requests' && (
          <div className="messages-requests-info">
            <Icon.Lock size={15} />
            <span>Messages from new profiles appear here until accepted.</span>
          </div>
        )}

        {/* Conversation List */}
        <div className="messages-list">
          {currentList.length === 0 ? (
            <div className="messages-empty-card">
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'center', opacity: 0.45 }}>
                {activeTab === 'inbox' ? <Icon.Message size={30} /> : <Icon.Mail size={30} />}
              </div>
              <div className="messages-empty-title">
                {activeTab === 'inbox' ? 'No messages yet' : 'No message requests'}
              </div>
              <div className="messages-empty-desc">
                {activeTab === 'inbox'
                  ? 'Connect with problem solvers directly from any post, comment, or solution.'
                  : 'You have no pending requests at the moment.'}
              </div>
              {activeTab === 'inbox' && (
                <button
                  type="button"
                  className="pri"
                  style={{ marginTop: 14, height: 38, padding: '0 20px', borderRadius: 999 }}
                  onClick={() => setShowNewChatModal(true)}
                >
                  Start a conversation
                </button>
              )}
            </div>
          ) : (
            currentList.map((conv) => {
              const other = conv.otherUser;
              const tier = getRespectadeoTier(other?.respectadeo || 0);
              const unread = conv.unreadCount?.[currentUser?.id] > 0;
              const isSentByMe = conv.lastMessage?.senderId === currentUser?.id;

              return (
                <button
                  type="button"
                  key={conv.id}
                  className={`message-card-item ${unread ? 'unread' : ''}`}
                  onClick={() => setSelectedRecipientId(other?.id)}
                >
                  <div
                    className="av message-card-av"
                    style={{ background: other?.avatarBg || '#1F6F6B' }}
                  >
                    {other?.avatar || '?'}
                  </div>

                  <div className="message-card-main">
                    <div className="message-card-top-row">
                      <div className="message-card-name-group">
                        <span className="message-card-name">{other?.name}</span>
                        {other?.isModerator && (
                          <span className="chat-mod-tag">
                            <Icon.Shield size={11} /> Moderator
                          </span>
                        )}
                        <span className="message-card-handle">{other?.handle}</span>
                      </div>
                      <span className="message-card-time">
                        {timeAgo(conv.lastMessage?.createdAt || conv.updatedAt)}
                      </span>
                    </div>

                    <div className="message-card-preview-row">
                      <span className="message-card-snippet">
                        {isSentByMe && <span className="message-sent-prefix">You: </span>}
                        {conv.lastMessage?.text || 'Started a conversation'}
                      </span>
                      {unread && <span className="message-unread-indicator" />}
                    </div>

                    <div className="message-card-tier" style={{ color: tier.color }}>
                      {tier.title}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </main>

      {/* New Message / Community User Picker Modal */}
      {showNewChatModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowNewChatModal(false)} />
          <div className="bottom-sheet" style={{ maxHeight: '80%' }}>
            <div className="sheet-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF' }}>New Message</div>
              <button
                type="button"
                className="sheet-close-btn"
                onClick={() => setShowNewChatModal(false)}
                aria-label="Close"
              >
                <Icon.Close />
              </button>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-sub)', marginBottom: 14 }}>
              Select a community member or problem solver to message:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {users
                .filter((u) => u.id !== currentUser?.id)
                .map((u) => {
                  const tier = getRespectadeoTier(u.respectadeo || 0);
                  const isClosed = u.messagingPermission === 'nobody';

                  return (
                    <button
                      type="button"
                      key={u.id}
                      className="user-picker-row"
                      onClick={() => {
                        if (isClosed) {
                          showToast?.(`${u.name} does not accept direct messages.`);
                          return;
                        }
                        setShowNewChatModal(false);
                        setSelectedRecipientId(u.id);
                      }}
                    >
                      <div
                        className="av"
                        style={{ background: u.avatarBg || '#1F6F6B', width: 40, height: 40, fontSize: 16 }}
                      >
                        {u.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: '#FFFFFF' }}>{u.name}</span>
                          {u.isModerator && (
                            <span className="chat-mod-tag">
                              <Icon.Shield size={11} /> Moderator
                            </span>
                          )}
                          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{u.handle}</span>
                        </div>
                        <div style={{ fontSize: 12, color: tier.color, marginTop: 2 }}>
                          {tier.title} • {u.problemsSolved || 0} solved
                        </div>
                      </div>
                      {isClosed ? (
                        <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 600 }}>DMs Closed</span>
                      ) : (
                        <Icon.ChevronRight size={18} style={{ color: 'var(--text-sub)' }} />
                      )}
                    </button>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
