'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Language } from '@/lib/translations';

interface LanguageSwitcherProps {
  currentLang: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LanguageSwitcher({ currentLang, onLanguageChange }: LanguageSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' }
  ];

  const active = languages.find(l => l.code === currentLang) || languages[0];

  return (
    <div className="lang-switcher-container" ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className="lang-switch-btn"
        onClick={() => setOpen(!open)}
        aria-label="Changer de langue / Change language"
        title="Changer de langue"
      >
        <span style={{ fontSize: '13px' }}>{active.flag}</span>
        <span style={{ fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>{active.code}</span>
        <ChevronDown size={12} style={{ opacity: 0.7, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {open && (
        <div className="lang-dropdown animate-fade-in" style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #dcece5',
          boxShadow: '0 12px 30px rgba(27, 61, 54, 0.12)',
          padding: '6px',
          minWidth: '130px',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          {languages.map(l => (
            <button
              key={l.code}
              type="button"
              onClick={() => {
                onLanguageChange(l.code);
                setOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '8px',
                border: 0,
                background: currentLang === l.code ? 'var(--mint-pale)' : 'transparent',
                color: currentLang === l.code ? 'var(--mint-dark)' : 'var(--pine)',
                fontWeight: currentLang === l.code ? 700 : 500,
                fontSize: '11.5px',
                textAlign: 'left',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.18s ease'
              }}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
