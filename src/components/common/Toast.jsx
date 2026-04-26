import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handleFallback = (e) => {
      const id = Date.now();
      setMessages((prev) => [...prev, { id, text: e.detail.message }]);
      
      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      }, 5000);
    };

    window.addEventListener('api-fallback', handleFallback);
    return () => window.removeEventListener('api-fallback', handleFallback);
  }, []);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }}>
      <AnimatePresence>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              background: 'var(--oxford)',
              color: 'var(--white)',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              borderLeft: '4px solid var(--bus-yellow)',
              fontSize: '0.9rem',
              fontWeight: 500,
              maxWidth: '320px'
            }}
          >
            {msg.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
