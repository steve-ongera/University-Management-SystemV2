import { createContext, useContext, useState, useCallback } from 'react';

const FlashContext = createContext(null);

export function FlashProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const flash = useCallback((text, type = 'info') => {
    const id = Date.now() + Math.random();
    setMessages(prev => [...prev, { id, text, type }]);
    setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 4000);
  }, []);

  const dismiss = (id) => setMessages(prev => prev.filter(m => m.id !== id));

  return (
    <FlashContext.Provider value={{ flash }}>
      {children}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380 }}>
        {messages.map(m => (
          <div key={m.id} className={`alert alert-${m.type}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 14px', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow-md)', animation: 'fadeIn 0.2s ease' }}>
            <span>{m.text}</span>
            <button onClick={() => dismiss(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, opacity: 0.6 }}>×</button>
          </div>
        ))}
      </div>
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const ctx = useContext(FlashContext);
  if (!ctx) throw new Error('useFlash must be used within FlashProvider');
  return ctx;
}

export default FlashProvider;