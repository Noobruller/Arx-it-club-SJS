import React, { useEffect } from 'react';
import { X } from 'lucide-react';









export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={onClose} />
        
        <div
          className={`relative transform overflow-hidden rounded-xl bg-[var(--surface)] dark:bg-[#102B22] text-left transition-all sm:my-8 w-full ${maxWidthClasses[maxWidth]} border border-[#282828]/15 dark:border-[#25473C] shadow-xl`}>
          
          {title &&
          <div className="flex items-center justify-between border-b border-[#282828]/10 dark:border-[#25473C] px-6 py-4 bg-[#FAF4EE] dark:bg-[#0A211A]">
              <h3 className="text-sm font-semibold tracking-tight text-[#282828] dark:text-[#F1F7F4] font-sans">{title}</h3>
              <button
              onClick={onClose}
              className="rounded-md p-1 text-[#282828]/50 hover:bg-[#EFE6DE] dark:text-[#B7C9C2] dark:hover:bg-[#15362B] hover:text-[#282828] dark:hover:text-[#F1F7F4] transition-colors cursor-pointer"
              aria-label="Close modal">
              
                <X className="w-4 h-4" />
              </button>
            </div>
          }
          <div className="p-6 text-[#282828] dark:text-[#F1F7F4]">{children}</div>
        </div>
      </div>
    </div>);

};