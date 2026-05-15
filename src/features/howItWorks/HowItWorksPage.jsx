import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { buyerSteps, sellerSteps, faqItems } from '../../data/howItWorksGuideData'

const TABS = [
  { key: 'buyer', label: 'Sebagai Buyer' },
  { key: 'seller', label: 'Sebagai Seller' },
  { key: 'faq', label: 'FAQ' },
]

const fadeIn = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Badge component ─────────────────────────────────────────────────────────
function StepBadge({ loginRequired, badgeLabel }) {
  if (badgeLabel === 'OTOMATIS') {
    return <span className="hiw-badge hiw-badge--auto">⚡ Otomatis</span>
  }
  if (loginRequired) {
    return <span className="hiw-badge hiw-badge--login">🔒 Login Required</span>
  }
  return <span className="hiw-badge hiw-badge--no-login">🌐 Tanpa Login</span>
}

// ─── Single Step ─────────────────────────────────────────────────────────────
function StepItem({ step }) {
  const modifier = step.badgeLabel === 'OTOMATIS'
    ? 'hiw-step--auto'
    : !step.loginRequired
      ? 'hiw-step--no-login'
      : ''

  return (
    <motion.div className={`hiw-step ${modifier}`} variants={fadeIn}>
      <div className="hiw-step-num">{step.num}</div>
      <div className="hiw-step-card">
        <div className="hiw-step-top">
          <h3 className="hiw-step-title">{step.title}</h3>
          <StepBadge loginRequired={step.loginRequired} badgeLabel={step.badgeLabel} />
        </div>
        <p className="hiw-step-desc">{step.desc}</p>

        {step.tips && step.tips.length > 0 && (
          <div className="hiw-tips">
            <span className="hiw-tips-label">💡 Tips</span>
            <ul>
              {step.tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {step.notes && (
          <div className="hiw-note">
            <span className="hiw-note-icon">📌</span>
            <span className="hiw-note-text">{step.notes}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Step Timeline ───────────────────────────────────────────────────────────
function StepTimeline({ steps }) {
  return (
    <motion.div
      className="hiw-timeline"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.1 } } }}
    >
      {steps.map((step) => (
        <StepItem key={step.num} step={step} />
      ))}
    </motion.div>
  )
}

// ─── FAQ Accordion ───────────────────────────────────────────────────────────
function FaqItem({ item, isOpen, onToggle }) {
  const contentRef = useRef(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }, [isOpen])

  return (
    <div className={`hiw-faq-item ${isOpen ? 'hiw-faq-item--open' : ''}`}>
      <button className="hiw-faq-btn" onClick={onToggle} aria-expanded={isOpen}>
        <span className="hiw-faq-q">{item.question}</span>
        <svg className="hiw-faq-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        ref={contentRef}
        className={`hiw-faq-answer ${isOpen ? 'hiw-faq-answer--open' : ''}`}
        style={{ maxHeight: isOpen ? height + 'px' : '0px' }}
      >
        <div className="hiw-faq-answer-inner">{item.answer}</div>
      </div>
    </div>
  )
}

function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = useCallback((idx) => {
    setOpenIndex((prev) => (prev === idx ? null : idx))
  }, [])

  return (
    <motion.div
      className="hiw-faq-list"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
    >
      {faqItems.map((item, idx) => (
        <motion.div key={idx} variants={fadeIn}>
          <FaqItem
            item={item}
            isOpen={openIndex === idx}
            onToggle={() => toggle(idx)}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('buyer')

  return (
    <main className="hiw-page" id="how-it-works-page">
      <div className="hiw-inner">
        {/* Header */}
        <motion.div
          className="hiw-page-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="hiw-page-eyebrow">Panduan Lengkap</span>
          <h1 className="hiw-page-title">How It Works</h1>
          <p className="hiw-page-subtitle">
            Panduan langkah demi langkah untuk membeli dan menjual material
            konstruksi sisa di RestMaterial.
          </p>
        </motion.div>

        {/* Tab Bar */}
        <div className="hiw-tabs" role="tablist">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`hiw-tab ${activeTab === tab.key ? 'hiw-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              id={`hiw-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="hiw-tab-content" role="tabpanel">
          {activeTab === 'buyer' && <StepTimeline steps={buyerSteps} key="buyer" />}
          {activeTab === 'seller' && <StepTimeline steps={sellerSteps} key="seller" />}
          {activeTab === 'faq' && <FaqAccordion key="faq" />}
        </div>
      </div>
    </main>
  )
}
