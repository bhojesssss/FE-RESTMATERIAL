import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import './styles/chat.css'
import { getCachedSession } from '../../features/auth/auth'
import * as convApi from '../../services/conversationApi'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const session = getCachedSession() 

  // ─── Load conversation list waktu widget dibuka ───
  useEffect(() => {
    if (isOpen && session) {
      loadConversations()
    }
  }, [isOpen])

  const loadConversations = async () => {
    try {
      const data = await convApi.getMyConversations()
      setConversations(data.conversations)
    } catch (err) {
      console.error('gagal load conversations:', err)
    }
  }

  // ─── Load messages + mark as read waktu buka 1 chat ───
  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId)
      convApi.markAsRead(activeChatId).catch(console.error)
    }
  }, [activeChatId])

  const loadMessages = async (convId) => {
    setLoading(true)
    try {
      const data = await convApi.getMessages(convId)
      // BE return newest-first, jadi reverse biar oldest di atas
      setMessages([...data.messages].reverse())
    } catch (err) {
      console.error('gagal load messages:', err)
    } finally {
      setLoading(false)
    }
  }

  // ─── Handler event open-chat dari listing card ───
  useEffect(() => {
    const handleOpenChat = async (e) => {
      setIsOpen(true)
      if (e.detail?.listingId && e.detail?.firstMessage) {
        try {
          // startConversation auto-resume kalo udah ada
          const data = await convApi.startConversation(
            e.detail.listingId,
            e.detail.firstMessage
          )
          setActiveChatId(data.conversation.id)
          await loadConversations()  // refresh list
        } catch (err) {
          console.error('gagal start conversation:', err)
        }
      }
    }
    window.addEventListener('open-chat', handleOpenChat)
    return () => window.removeEventListener('open-chat', handleOpenChat)
  }, [])

  // ─── Send message ───
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !activeChatId) return

    const content = inputValue
    setInputValue('')

    try {
      const data = await convApi.sendMessage(activeChatId, content)
      setMessages(prev => [...prev, data.data])  // append message baru
    } catch (err) {
      console.error('gagal kirim message:', err)
      setInputValue(content)  // kembaliin input kalo gagal
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const handleOpenChat = (e) => {
      setIsOpen(true)
      if (e.detail?.sellerName) {
        const partnerName = e.detail.sellerName
        const existing = conversationsRef.current.find(c => c.partnerName === partnerName)
        if (existing) {
          setActiveChatId(existing.id)
        } else {
          const newId = 'chat-' + Date.now()
          setActiveChatId(newId)
          setConversations(prev => [
            {
              id: newId,
              partnerName: partnerName,
              messages: [
                { id: Date.now(), text: `Hi! I'm interested in your material.`, sender: "sent" },
                { id: Date.now() + 1, text: `Hello! I am ${partnerName}. How can I help you?`, sender: "received" }
              ]
            },
            ...prev
          ])
        }
      }
    }
    window.addEventListener('open-chat', handleOpenChat)
    return () => window.removeEventListener('open-chat', handleOpenChat)
  }, [])

  const activeConversation = conversations.find(c => c.id === activeChatId)

  useEffect(() => {
    if (isOpen && activeChatId) {
      scrollToBottom()
    }
  }, [activeConversation?.messages, isOpen, activeChatId])

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
            <div className="chat-widget-header">
              <div className="chat-widget-header-title">
                {activeChatId && (
                  <button className="chat-back-btn" onClick={() => setActiveChatId(null)} aria-label="Back to chats">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12"></line>
                      <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                  </button>
                )}
                {!activeChatId && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '0.5rem'}}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                )}
                <span>{activeConversation ? activeConversation.partnerName : "Messages"}</span>
              </div>
              <button className="chat-widget-close" onClick={() => setIsOpen(false)} aria-label="Close chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            
            {!session ? (
              <div className="chat-widget-body" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--ink-black, #000814)', marginBottom: '0.5rem', fontWeight: 600 }}>Login Required</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                  Please log in to your account to start a live chat with our support team.
                </p>
                <Link 
                  to="/login" 
                  className="btn-nav btn-nav-solid"
                  onClick={() => setIsOpen(false)}
                >
                  Login Now
                </Link>
              </div>
            ) : activeChatId && activeConversation ? (
              <>
                <div className="chat-widget-body">
                  {activeConversation.messages.map((msg) => (
                    <div key={msg.id} className={`chat-message ${msg.sender}`}>
                      {msg.text}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form className="chat-widget-input-area" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="chat-widget-input"
                    placeholder="Type a message..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                  <button type="submit" className="chat-widget-send" aria-label="Send message">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </>
            ) : (
              <div className="chat-list">
                {conversations.map(conv => {
                  const lastMessage = conv.messages[conv.messages.length - 1]
                  return (
                    <div key={conv.id} className="chat-list-item" onClick={() => setActiveChatId(conv.id)}>
                      <div className="chat-list-avatar">
                        {conv.partnerName.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="chat-list-info">
                        <div className="chat-list-name">{conv.partnerName}</div>
                        <div className="chat-list-preview">{lastMessage?.text || "No messages yet"}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        className="chat-widget-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
             <line x1="18" y1="6" x2="6" y2="18"></line>
             <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
    </div>
  )
}
