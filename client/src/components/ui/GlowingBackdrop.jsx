import { motion } from 'framer-motion';

const GlowingBackdrop = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Blob 1 */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.1, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[10%] left-[5%] w-[350px] h-[350px] rounded-full bg-brand-terracotta/10 dark:bg-brand-terracotta/6 blur-[120px]"
      />

      {/* Blob 2 */}
      <motion.div
        animate={{
          x: [0, -30, 50, 0],
          y: [0, 40, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-brand-teal/10 dark:bg-brand-teal/6 blur-[130px]"
      />

      {/* Blob 3 */}
      <motion.div
        animate={{
          x: [0, 20, -30, 0],
          y: [0, 30, 20, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-brand-gold/8 dark:bg-brand-gold/4 blur-[110px]"
      />
    </div>
  );
};

export default GlowingBackdrop;
