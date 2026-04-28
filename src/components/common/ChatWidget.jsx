import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./styles/chat.css";
import { getCachedSession } from "../../features/auth/auth";
import * as convApi from "../../services/conversationApi";

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
  // ─── Ref buat baca conversations di dalam event handler tanpa jadi dep ───
  const conversationsRef = useRef([]);
  const session = getCachedSession();

  // Sync ref tiap kali state berubah
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // ─── Auto scroll ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ─── Load inbox waktu widget dibuka (dan belum ada active chat) ───
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

  // ─── Load messages dari 1 conversation ───
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

  // ─── Handler event 'open-chat' — TIDAK ada conversations di dependency ───
  useEffect(() => {
    const handleOpenChat = async (e) => {
      const { listingId, sellerName, firstMessage } = e.detail || {};

      setIsOpen(true);
      setError(null);

      // Kalo gak ada listingId, cukup buka widget ke inbox
      if (!listingId) return;

      // Baca conversations lewat ref — TIDAK trigger re-render / re-register
      let freshConvs = conversationsRef.current;

      // Fetch fresh kalo inbox masih kosong
      if (freshConvs.length === 0) {
        try {
          const data = await convApi.getMyConversations();
          freshConvs = data.conversations || [];
          setConversations(freshConvs);
        } catch {
          // Lanjut dengan data yang ada
        }
      }

      // Cek apakah sudah ada conversation untuk listing ini
      const existing = freshConvs.find((c) => c.listing?.id === listingId);

      if (existing) {
        // Flow B: sudah pernah chat → load history
        await openConversation(existing.id, {
          sellerName: existing.other_user?.full_name || sellerName || "Seller",
          listingTitle: existing.listing?.title || "",
        });
      } else {
        // Flow A: belum pernah chat → buat baru
        if (!firstMessage) return;
        setLoadingStart(true);
        try {
          const data = await convApi.startConversation(listingId, firstMessage);
          const conv = data.conversation;
          await openConversation(conv.id, {
            sellerName: sellerName || conv.listing_title,
            listingTitle: conv.listing_title,
          });
          // Refresh inbox biar conversation baru muncul
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
  }, []); // ← kosong, tidak ada dependency → listener hanya didaftarkan sekali

  // ─── Kirim message ───
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
            ) : /* ══ Loading: contact seller ══ */
            loadingStart ? (
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
            ) : /* ══ Error global (bukan di dalam chat) ══ */
            error && !activeChatId ? (
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
            ) : /* ══ Active chat view ══ */
            activeChatId ? (
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
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`chat-message ${msg.sender_id === session?.id ? "sent" : "received"}`}
                        style={{ opacity: msg._pending ? 0.6 : 1 }}
                      >
                        {msg.content}
                        {msg._error && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#ef4444",
                              marginLeft: "0.4rem",
                            }}
                          >
                            ✕ Gagal
                          </span>
                        )}
                        {msg._pending && (
                          <span
                            style={{
                              fontSize: "0.7rem",
                              color: "#94a3b8",
                              marginLeft: "0.4rem",
                            }}
                          >
                            •••
                          </span>
                        )}
                      </div>
                    ))
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
