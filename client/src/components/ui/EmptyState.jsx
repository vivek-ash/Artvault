import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {Icon && (
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5
          ${isDark ? 'bg-gallery-darkSurface' : 'bg-gallery-surface'}`}>
          <Icon className={`w-8 h-8 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`} />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className={`text-sm max-w-sm mb-6 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
};

export default EmptyState;
