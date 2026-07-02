import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

const NotFound = () => {
  const { isDark } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-[80vh] flex items-center justify-center px-6"
    >
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-8xl sm:text-9xl font-bold text-gradient mb-4"
        >
          404
        </motion.h1>

        <h2 className={`font-display text-2xl sm:text-3xl font-bold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
          Page Not Found
        </h2>

        <p className={`text-base mb-10 leading-relaxed ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
          The artwork you&apos;re looking for has been moved to another gallery.
          Let&apos;s get you back on track.
        </p>

        <Link to="/" className="btn-primary inline-block px-8 py-3.5 rounded-xl text-base">
          Return Home
        </Link>
      </div>
    </motion.div>
  );
};

export default NotFound;
