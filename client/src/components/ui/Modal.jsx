import { motion, AnimatePresence } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';
import { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children, size = 'md', className = '' }) => {
  const { isDark } = useTheme();

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto
              rounded-2xl border shadow-elevated
              ${isDark
                ? 'bg-gallery-darkCard border-gallery-darkBorder shadow-dark-elevated'
                : 'bg-gallery-card border-gallery-border'
              } ${className}`}
          >
            {/* Header */}
            {title && (
              <div className={`sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b
                ${isDark ? 'border-gallery-darkBorder bg-gallery-darkCard' : 'border-gallery-border bg-gallery-card'}`}>
                <h2 className="font-display text-lg font-semibold">{title}</h2>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-xl transition-colors
                    ${isDark ? 'hover:bg-white/10 text-gallery-darkTextMuted' : 'hover:bg-black/5 text-gallery-textMuted'}`}
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
