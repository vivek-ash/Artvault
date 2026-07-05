import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  const { isDark } = useTheme();

  return (
    <div className={`flex gap-1 p-1 rounded-2xl overflow-x-auto scrollbar-hide ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-surface'} ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
            transition-colors duration-200 whitespace-nowrap
            ${activeTab === tab.id
              ? ''
              : isDark
                ? 'text-gallery-darkTextMuted hover:text-gallery-darkText'
                : 'text-gallery-textMuted hover:text-gallery-text'
            }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className={`absolute inset-0 rounded-xl ${isDark ? 'bg-gallery-darkCard shadow-dark-card' : 'bg-gallery-card shadow-card'}`}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
                ${activeTab === tab.id
                  ? 'bg-brand-terracotta/10 text-brand-terracotta'
                  : isDark ? 'bg-white/10 text-gallery-darkTextMuted' : 'bg-black/5 text-gallery-textMuted'
                }`}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
};

export default Tabs;
