'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  key?: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger';
  disabled?: boolean;
  dividerBefore?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  label?: string;
  align?: 'left' | 'right';
}

export function ActionMenu({
  items,
  label = 'Actions',
  align = 'right',
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left?: number; right?: number }>({});
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = items.filter(Boolean);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const estimatedHeight = Math.min(visibleItems.length * 38 + 16, 360);
      const openUp = rect.bottom + estimatedHeight > window.innerHeight - 14 && rect.top > estimatedHeight;
      const pos: { top?: number; bottom?: number; left?: number; right?: number } = {};

      if (openUp) {
        pos.bottom = Math.max(8, window.innerHeight - rect.top + 6);
      } else {
        pos.top = Math.min(window.innerHeight - 16, rect.bottom + 6);
      }

      if (align === 'left') {
        pos.left = Math.max(8, Math.min(rect.left, window.innerWidth - 230));
      } else {
        pos.right = Math.max(8, window.innerWidth - rect.right);
      }

      setCoords(pos);
    };

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = () => {
      setOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [open, align, visibleItems.length]);

  if (visibleItems.length === 0) {
    return <span className="muted" aria-hidden="true">—</span>;
  }

  return (
    <div className="pc-action-menu-wrap">
      <button
        ref={triggerRef}
        type="button"
        className={`pc-action-menu-trigger ${open ? 'open' : ''}`}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        onClick={event => {
          event.stopPropagation();
          setOpen(prev => !prev);
        }}
      >
        <MoreVertical size={16} />
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          role="menu"
          className="pc-action-menu-dropdown"
          style={coords}
          onClick={event => event.stopPropagation()}
        >
          {visibleItems.map((item, idx) => (
            <React.Fragment key={item.key || `${item.label}-${idx}`}>
              {item.dividerBefore && idx > 0 && <div className="pc-action-menu-divider" role="separator" />}
              <button
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={`pc-action-menu-item ${item.variant && item.variant !== 'default' ? `is-${item.variant}` : ''}`}
                onClick={() => {
                  if (item.disabled) return;
                  setOpen(false);
                  item.onClick();
                }}
              >
                {item.icon && <span className="pc-action-menu-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}
