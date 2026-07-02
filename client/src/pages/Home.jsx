import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiSparkles, HiShieldCheck, HiHeart } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';

const features = [
  {
    icon: HiSparkles,
    title: 'Curated Collection',
    description: 'Every artwork is handpicked for quality and originality. Only the finest digital creations make it to our gallery.',
  },
  {
    icon: HiShieldCheck,
    title: 'Secure Ownership',
    description: 'Verified certificates of authenticity and secure, expiring download links protect every purchase.',
  },
  {
    icon: HiHeart,
    title: 'Artist First',
    description: 'Fair revenue splits, resale royalties, and powerful analytics tools put creators at the center of everything.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const Home = () => {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gallery-accent/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-36">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-gallery-accent/20 bg-gallery-accent/5"
            >
              <HiSparkles className="w-4 h-4 text-gallery-accent" />
              <span className={`text-sm font-medium ${isDark ? 'text-gallery-accent' : 'text-amber-700'}`}>
                The Premier Digital Art Marketplace
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 className={`font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Discover{' '}
              <span className="text-gradient">Extraordinary</span>
              <br />
              Digital Art
            </h1>

            {/* Subtitle */}
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              A curated marketplace where artists showcase and sell their finest digital creations. 
              Discover, collect, and own extraordinary works from talented creators worldwide.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/marketplace" className="btn-primary text-base px-8 py-4 rounded-xl inline-flex items-center gap-2">
                Explore Gallery
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link to="/register" className="btn-secondary text-base px-8 py-4 rounded-xl">
                Join as Artist
              </Link>
            </motion.div>
          </motion.div>

          {/* Decorative gradient line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-20 h-px bg-gradient-to-r from-transparent via-gallery-accent/40 to-transparent max-w-2xl mx-auto"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className={`font-display text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Why Choose <span className="text-gallery-accent">ArtVault</span>
            </h2>
            <p className={`text-base max-w-xl mx-auto ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Built for artists, designed for collectors. A platform that respects the craft.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`group relative p-8 rounded-2xl transition-all duration-500 hover:-translate-y-1 ${
                  isDark
                    ? 'bg-gallery-darkCard border border-gallery-darkBorder hover:border-gallery-accent/30 hover:shadow-2xl hover:shadow-gallery-accent/5'
                    : 'bg-gallery-lightCard border border-gallery-lightBorder hover:border-gallery-accent/30 hover:shadow-2xl hover:shadow-gallery-accent/10'
                }`}
              >
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gallery-accent/10 flex items-center justify-center mb-6 group-hover:bg-gallery-accent/20 transition-colors duration-300">
                  <feature.icon className="w-7 h-7 text-gallery-accent" />
                </div>

                {/* Content */}
                <h3 className={`font-display text-xl font-semibold mb-3 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                  {feature.description}
                </p>

                {/* Hover accent line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gallery-accent rounded-full group-hover:w-16 transition-all duration-500" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`rounded-2xl p-10 lg:p-16 border ${
              isDark
                ? 'bg-gradient-to-br from-gallery-darkCard to-gallery-dark border-gallery-darkBorder'
                : 'bg-gradient-to-br from-gallery-lightCard to-gallery-light border-gallery-lightBorder'
            }`}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {[
                { value: '10K+', label: 'Artworks' },
                { value: '2.5K+', label: 'Artists' },
                { value: '50K+', label: 'Collectors' },
                { value: '$2M+', label: 'Artist Earnings' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl lg:text-4xl font-bold text-gallery-accent mb-2">
                    {stat.value}
                  </div>
                  <div className={`text-sm font-medium ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className={`font-display text-3xl sm:text-4xl font-bold mb-6 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Ready to Start Your Collection?
            </h2>
            <p className={`text-base max-w-xl mx-auto mb-10 ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Join thousands of collectors and artists already part of the ArtVault community.
            </p>
            <Link to="/register" className="btn-primary text-base px-10 py-4 rounded-xl inline-block">
              Get Started — It&apos;s Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
