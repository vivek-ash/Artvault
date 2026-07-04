import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { PageTransition } from '../components/ui';

const NotFound = () => {
  const { isDark } = useTheme();

  return (
    <PageTransition>
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-[8rem] sm:text-[12rem] font-display font-bold leading-none text-gradient select-none">
            404
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="font-display text-2xl font-semibold mt-4 mb-2">Page Not Found</h2>
          <p className={`text-sm max-w-sm mb-8 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link to="/" className="btn-primary">Return Home</Link>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default NotFound;
