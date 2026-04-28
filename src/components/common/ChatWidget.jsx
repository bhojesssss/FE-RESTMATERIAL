import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./styles/chat.css";
import { getCachedSession } from "../../features/auth/auth";
import * as convApi from "../../services/conversationApi";

// ─── Read Receipt ─────────────────────────────────────────────────────────────
// Muncul di sudut kanan bawah bubble pesan yang kita kirim (sent).
// 4 state: pending (jam) → sent (✓ abu) → read (✓✓ hijau) → error (✕ merah)
function ReadReceipt({ readAt, pending, error }) {
  if (error) {
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <line
            x1="2"
            y1="2"
            x2="10"
            y2="10"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <line
            x1="10"
            y1="2"
            x2="2"
            y2="10"
            stroke="#ef4444"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (pending) {
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="#94a3b8" strokeWidth="1.4" />
          <line
            x1="6"
            y1="3"
            x2="6"
            y2="6.2"
            stroke="#94a3b8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <line
            x1="6"
            y1="6.2"
            x2="7.8"
            y2="7.8"
            stroke="#94a3b8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
    );
  }
  if (readAt) {
    // ✓✓ hijau — sudah dibaca
    return (
      <span
        style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}
      >
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <polyline
            points="1,5 3.5,8 7.5,2"
            stroke="#388E3C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="5,5 7.5,8 13.5,2"
            stroke="#388E3C"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    );
  }
  // ✓ abu — terkirim, belum dibaca
  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", marginLeft: 4 }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <polyline
          points="1,5 3.5,8 9,2"
          stroke="#94a3b8"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [activeConvMeta, setActiveConvMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const conversationsRef = useRef([]);
  const session = getCachedSession();

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || !session || activeChatId) return;
    fetchConversations();
  }, [isOpen, activeChatId]); // eslint-disable-line

  const fetchConversations = async () => {
    setLoadingList(true);
    try {
      const data = await convApi.getMyConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("gagal fetch conversations:", err);
    } finally {
      setLoadingList(false);
    }
  };

  const openConversation = async (convId, meta) => {
    setActiveChatId(convId);
    setActiveConvMeta(meta);
    setMessages([]);
    setError(null);
    setLoadingChat(true);

    try {
      const data = await convApi.getMessages(convId);
      setMessages((data.messages || []).reverse());
      convApi.markAsRead(convId).catch(console.error);
    } catch (err) {
      setError(err.message || "Gagal memuat pesan");
    } finally {
      setLoadingChat(false);
    }
  };

  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { listingId, sellerName, firstMessage } = e.detail || {};

      setIsOpen(true);
      setError(null);

      if (!listingId) return;

      let freshConvs = conversationsRef.current;

      if (freshConvs.length === 0) {
        try {
          const data = await convApi.getMyConversations();
          freshConvs = data.conversations || [];
          setConversations(freshConvs);
        } catch {
          /* lanjut */
        }
      }

      const existing = freshConvs.find((c) => c.listing?.id === listingId);

      if (existing) {
        await openConversation(existing.id, {
          sellerName: existing.other_user?.full_name || sellerName || "Seller",
          listingTitle: existing.listing?.title || "",
        });
      } else {
        if (!firstMessage) return;
        setLoadingStart(true);
        try {
          const data = await convApi.startConversation(listingId, firstMessage);
          const conv = data.conversation;
          await openConversation(conv.id, {
            sellerName: sellerName || conv.listing_title,
            listingTitle: conv.listing_title,
          });
          fetchConversations();
        } catch (err) {
          setError(err.message || "Gagal memulai chat");
        } finally {
          setLoadingStart(false);
        }
      }
    };

    window.addEventListener("open-chat", handleOpenChat);
    return () => window.removeEventListener("open-chat", handleOpenChat);
  }, []); // eslint-disable-line

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChatId) return;

    const content = inputValue;
    setInputValue("");

    const tempMsg = {
      id: `temp-${Date.now()}`,
      content,
      sender_id: session?.id,
      created_at: new Date().toISOString(),
      read_at: null,
      _pending: true,
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const data = await convApi.sendMessage(activeChatId, content);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempMsg.id ? data.data : m)),
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempMsg.id ? { ...m, _error: true, _pending: false } : m,
        ),
      );
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setActiveChatId(null);
    setActiveConvMeta(null);
    setMessages([]);
    setError(null);
  };

  const handleBack = () => {
    setActiveChatId(null);
    setActiveConvMeta(null);
    setMessages([]);
    setError(null);
    fetchConversations();
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  return (
    <div className="chat-widget-container">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-widget-popup"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* ── Header ── */}
            <div className="chat-widget-header">
              <div className="chat-widget-header-title">
                {activeChatId ? (
                  <button
                    className="chat-back-btn"
                    onClick={handleBack}
                    aria-label="Back"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                  </button>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                )}
                <span>
                  {activeConvMeta ? activeConvMeta.sellerName : "Messages"}
                </span>
              </div>
              <button
                className="chat-widget-close"
                onClick={handleClose}
                aria-label="Close"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* ══ Belum login ══ */}
            {!session ? (
              <div
                className="chat-widget-body"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginBottom: "1rem" }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                  }}
                >
                  Login Required
                </h3>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "0.9rem",
                    marginBottom: "1.5rem",
                    lineHeight: 1.5,
                  }}
                >
                  Login dulu untuk chat sama seller.
                </p>
                <Link
                  to="/login"
                  className="btn-nav btn-nav-solid"
                  onClick={handleClose}
                >
                  Login Now
                </Link>
              </div>
            ) : loadingStart ? (
              <div
                className="chat-widget-body"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "0.75rem",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#388E3C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Membuka chat...
                </p>
              </div>
            ) : error && !activeChatId ? (
              <div
                className="chat-widget-body"
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "2rem",
                }}
              >
                <p style={{ color: "#ef4444", marginBottom: "1rem" }}>
                  {error}
                </p>
                <button
                  onClick={() => setError(null)}
                  className="btn-nav btn-nav-solid"
                >
                  Coba Lagi
                </button>
              </div>
            ) : activeChatId ? (
              <>
                {activeConvMeta?.listingTitle && (
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "0.8rem",
                      color: "#64748b",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    📦 {activeConvMeta.listingTitle}
                  </div>
                )}

                <div className="chat-widget-body">
                  {loadingChat ? (
                    <div
                      style={{
                        margin: "auto",
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
                    >
                      Memuat pesan...
                    </div>
                  ) : error ? (
                    <div
                      style={{
                        margin: "auto",
                        color: "#ef4444",
                        fontSize: "0.85rem",
                      }}
                    >
                      {error}
                    </div>
                  ) : messages.length === 0 ? (
                    <div
                      style={{
                        margin: "auto",
                        color: "#94a3b8",
                        fontSize: "0.85rem",
                      }}
                    >
                      Belum ada pesan.
                    </div>
                  ) : (
                    // ─── MESSAGES — ditambahin ReadReceipt di sini ───
                    messages.map((msg) => {
                      const isSent = msg.sender_id === session?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`chat-message ${isSent ? "sent" : "received"}`}
                          style={{ opacity: msg._pending ? 0.7 : 1 }}
                        >
                          {/* Teks pesan */}
                          <span>{msg.content}</span>

                          {/* Timestamp + read receipt — hanya di pesan yang kita kirim */}
                          {isSent && (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "2px",
                                marginLeft: "6px",
                                fontSize: "0.68rem",
                                color: "#94a3b8",
                                verticalAlign: "middle",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              {!msg._pending && !msg._error && (
                                <span>{formatTime(msg.created_at)}</span>
                              )}
                              <ReadReceipt
                                readAt={msg.read_at}
                                pending={msg._pending}
                                error={msg._error}
                              />
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                <form
                  className="chat-widget-input-area"
                  onSubmit={handleSendMessage}
                >
                  <input
                    type="text"
                    className="chat-widget-input"
                    placeholder="Tulis pesan..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    maxLength={500}
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="chat-widget-send"
                    disabled={!inputValue.trim()}
                    aria-label="Send"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              /* ══ Inbox list ══ */
              <div
                className="chat-widget-body"
                style={{ padding: 0, display: "block", overflowY: "auto" }}
              >
                {loadingList ? (
                  [1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderBottom: "1px solid #f1f5f9",
                      }}
                    >
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "50%",
                          background: "#e2e8f0",
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                        }}
                      >
                        <div
                          style={{
                            height: 12,
                            width: "55%",
                            background: "#e2e8f0",
                            borderRadius: 4,
                          }}
                        />
                        <div
                          style={{
                            height: 10,
                            width: "80%",
                            background: "#f1f5f9",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  ))
                ) : conversations.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      padding: "2rem",
                      textAlign: "center",
                    }}
                  >
                    <svg
                      width="40"
                      height="40"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ marginBottom: "0.75rem" }}
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                        lineHeight: 1.6,
                      }}
                    >
                      Belum ada percakapan.
                      <br />
                      Klik "Contact Seller" di listing untuk mulai.
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const name = conv.other_user?.full_name || "Seller";
                    const initial = name.slice(0, 1).toUpperCase();
                    const preview =
                      conv.last_message?.content || "Belum ada pesan";
                    const time = formatTime(conv.last_message_at);
                    const unread = conv.unread_count || 0;

                    return (
                      <button
                        key={conv.id}
                        onClick={() =>
                          openConversation(conv.id, {
                            sellerName: name,
                            listingTitle: conv.listing?.title || "",
                          })
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                          width: "100%",
                          padding: "0.75rem 1rem",
                          background: "none",
                          border: "none",
                          borderBottom: "1px solid #f1f5f9",
                          cursor: "pointer",
                          textAlign: "left",
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: "50%",
                            background: "#DDEEDF",
                            color: "#388E3C",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            flexShrink: 0,
                          }}
                        >
                          {initial}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                fontWeight: unread > 0 ? 700 : 600,
                                fontSize: "0.85rem",
                                color: "#1e293b",
                              }}
                            >
                              {name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.72rem",
                                color: "#94a3b8",
                                flexShrink: 0,
                                marginLeft: "0.5rem",
                              }}
                            >
                              {time}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: "0.75rem",
                              color: "#64748b",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              marginBottom: 2,
                            }}
                          >
                            📦 {conv.listing?.title || "—"}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: unread > 0 ? "#1e293b" : "#94a3b8",
                                fontWeight: unread > 0 ? 600 : 400,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: "80%",
                              }}
                            >
                              {preview}
                            </span>
                            {unread > 0 && (
                              <span
                                style={{
                                  background: "#388E3C",
                                  color: "white",
                                  borderRadius: "999px",
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  minWidth: 18,
                                  height: 18,
                                  padding: "0 5px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {unread > 99 ? "99+" : unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <button
        className="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
