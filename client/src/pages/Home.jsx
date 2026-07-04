import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiArrowRight,
  HiSparkles,
  HiEye,
  HiShieldCheck,
  HiPaintBrush,
  HiCamera,
  HiCube,
  HiSwatch,
  HiPencil,
  HiHeart,
  HiShoppingCart,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { fetchArtworks } from '../features/artwork/artworkSlice';
import {
  PageTransition,
  RevealOnScroll,
  StaggerContainer,
  StaggerItem,
  ArtworkCardSkeleton,
  Avatar,
} from '../components/ui';

/* ═══════════════════════════════════════════════════════════════════════════
   Categories data
   ═══════════════════════════════════════════════════════════════════════════ */
const categories = [
  { name: 'Digital Painting', icon: HiPaintBrush, color: 'brand-terracotta', slug: 'Digital Painting' },
  { name: 'Illustration', icon: HiPencil, color: 'brand-teal', slug: 'Illustration' },
  { name: '3D Art', icon: HiCube, color: 'brand-lavender', slug: '3D Art' },
  { name: 'Photography', icon: HiCamera, color: 'brand-coral', slug: 'Photography' },
  { name: 'Abstract', icon: HiSwatch, color: 'brand-gold', slug: 'Abstract' },
  { name: 'Concept Art', icon: HiSparkles, color: 'brand-terracotta', slug: 'Concept Art' },
];

/* Color map for inline styles on category icon backgrounds */
const colorMap = {
  'brand-terracotta': { bg: 'rgba(196, 93, 62, 0.12)', text: '#c45d3e' },
  'brand-teal': { bg: 'rgba(42, 125, 110, 0.12)', text: '#2a7d6e' },
  'brand-lavender': { bg: 'rgba(139, 126, 200, 0.12)', text: '#8b7ec8' },
  'brand-coral': { bg: 'rgba(232, 133, 108, 0.12)', text: '#e8856c' },
  'brand-gold': { bg: 'rgba(201, 168, 76, 0.12)', text: '#c9a84c' },
};

/* How-it-works steps */
const steps = [
  {
    num: 1,
    icon: HiEye,
    title: 'Discover',
    description:
      'Browse thousands of curated digital artworks from talented creators around the world. Filter by style, medium, or price range.',
  },
  {
    num: 2,
    icon: HiShoppingCart,
    title: 'Collect',
    description:
      'Purchase securely with Razorpay. Every transaction is protected, and your artwork comes with a unique Certificate of Authenticity.',
  },
  {
    num: 3,
    icon: HiShieldCheck,
    title: 'Own',
    description:
      'Download your full-resolution artwork via a secure, expiring link. Your ownership is verified and permanent — it\u2019s truly yours.',
  },
];

/* Stats */
const stats = [
  { value: '10,000+', label: 'Artworks' },
  { value: '2,500+', label: 'Artists' },
  { value: '50,000+', label: 'Collectors' },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Home Component
   ═══════════════════════════════════════════════════════════════════════════ */
const Home = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { artworks, isLoading } = useSelector((state) => state.artwork);

  useEffect(() => {
    dispatch(fetchArtworks({ limit: 6, sort: '-viewCount' }));
  }, [dispatch]);

  return (
    <PageTransition>
      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
          ════════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
        {/* Floating decorative orbs */}
        <motion.div
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #c45d3e 0%, transparent 70%)' }}
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-32 right-[8%] w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b7ec8 0%, transparent 70%)' }}
          animate={{ y: [10, -10, 10] }}
          transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-[40%] right-[30%] w-56 h-56 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #2a7d6e 0%, transparent 70%)' }}
          animate={{ y: [-8, 12, -8] }}
          transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border ${
                isDark
                  ? 'border-brand-terracotta/20 bg-brand-terracotta/10'
                  : 'border-brand-terracotta/20 bg-brand-terracotta/5'
              }`}
            >
              <HiSparkles className="w-4 h-4 text-brand-terracotta" />
              <span
                className={`text-sm font-medium ${
                  isDark ? 'text-brand-terracottaLight' : 'text-brand-terracotta'
                }`}
              >
                The Premier Digital Art Marketplace
              </span>
            </motion.div>

            {/* Main heading */}
            <h1 className="font-display text-hero-sm md:text-hero mb-6">
              <span className="text-gradient">Discover Extraordinary</span>
              <br />
              <span className={isDark ? 'text-gallery-darkText' : 'text-gallery-text'}>
                Digital Art
              </span>
            </h1>

            {/* Subtitle */}
            <p
              className={`text-lg max-w-2xl mx-auto mb-10 leading-relaxed ${
                isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'
              }`}
            >
              A curated marketplace where artists showcase and sell their finest digital creations
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              <Link
                to="/marketplace"
                className="btn-primary text-base px-8 py-4 rounded-xl inline-flex items-center gap-2"
              >
                Explore Gallery
                <HiArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="btn-secondary text-base px-8 py-4 rounded-xl"
              >
                Join as Artist
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className={`flex items-center justify-center gap-6 sm:gap-10 flex-wrap ${
                isDark ? 'text-gallery-darkTextSecondary' : 'text-gallery-textSecondary'
              }`}
            >
              {stats.map((stat, index) => (
                <div key={stat.label} className="flex items-center gap-6 sm:gap-10">
                  <div className="text-center">
                    <div className="font-display text-2xl sm:text-3xl font-bold text-brand-terracotta mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-xs sm:text-sm font-medium uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                  {index < stats.length - 1 && (
                    <div
                      className={`hidden sm:block w-px h-10 ${
                        isDark ? 'bg-gallery-darkBorder' : 'bg-gallery-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — FEATURED ARTWORKS
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevealOnScroll>
            {/* Section header */}
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2
                  className={`font-display text-title mb-2 ${
                    isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                  }`}
                >
                  Featured Artworks
                </h2>
                <p
                  className={`text-sm ${
                    isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                  }`}
                >
                  Trending pieces handpicked by our curators
                </p>
              </div>
              <Link
                to="/marketplace"
                className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold transition-colors duration-200 ${
                  isDark
                    ? 'text-brand-terracottaLight hover:text-brand-terracotta'
                    : 'text-brand-terracotta hover:text-brand-terracottaDark'
                }`}
              >
                View All
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Artwork grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <ArtworkCardSkeleton key={i} />
                  ))
                : artworks.slice(0, 6).map((artwork, index) => (
                    <motion.div
                      key={artwork._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-40px' }}
                      transition={{
                        duration: 0.5,
                        delay: index * 0.08,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Link to={`/artwork/${artwork._id}`} className="group block">
                        {/* Image */}
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-3 hover-tilt">
                          <img
                            src={artwork.images?.thumbnail || artwork.images?.preview}
                            alt={artwork.title}
                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {/* Info */}
                        <div className="px-1 space-y-1.5">
                          <h3
                            className={`font-display text-base font-semibold truncate ${
                              isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                            }`}
                          >
                            {artwork.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={artwork.artist?.name}
                              image={artwork.artist?.avatar}
                              size="xs"
                            />
                            <span
                              className={`text-xs truncate ${
                                isDark
                                  ? 'text-gallery-darkTextMuted'
                                  : 'text-gallery-textMuted'
                              }`}
                            >
                              {artwork.artist?.name || 'Unknown Artist'}
                            </span>
                          </div>
                          <div className="text-brand-terracotta font-semibold text-sm">
                            ₹{artwork.price?.toLocaleString('en-IN')}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
            </div>

            {/* Mobile "View All" link */}
            <div className="mt-10 text-center sm:hidden">
              <Link
                to="/marketplace"
                className="btn-secondary inline-flex items-center gap-2"
              >
                View All Artworks
                <HiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — BROWSE BY CATEGORY
          ════════════════════════════════════════════════════════════════════ */}
      <section
        className={`py-20 lg:py-28 ${
          isDark ? 'bg-gallery-darkSurface/50' : 'bg-gallery-surface/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <h2
                className={`font-display text-title mb-3 ${
                  isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                }`}
              >
                Browse by Category
              </h2>
              <p
                className={`text-sm max-w-lg mx-auto ${
                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                }`}
              >
                Find art that speaks to you — from vivid digital paintings to immersive 3D worlds
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {categories.map((cat, index) => {
                const colors = colorMap[cat.color];
                const Icon = cat.icon;
                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.06,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Link
                      to={`/marketplace?category=${encodeURIComponent(cat.slug)}`}
                      className="card group block p-6 lg:p-8 text-center"
                    >
                      {/* Icon circle */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Icon className="w-7 h-7" style={{ color: colors.text }} />
                      </div>

                      <h3
                        className={`font-display text-base font-semibold mb-2 ${
                          isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                        }`}
                      >
                        {cat.name}
                      </h3>

                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium transition-colors duration-200 ${
                          isDark
                            ? 'text-gallery-darkTextMuted group-hover:text-brand-terracottaLight'
                            : 'text-gallery-textMuted group-hover:text-brand-terracotta'
                        }`}
                      >
                        Explore <HiArrowRight className="w-3 h-3" />
                      </span>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center mb-14">
              <h2
                className={`font-display text-title mb-3 ${
                  isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                }`}
              >
                How It Works
              </h2>
              <p
                className={`text-sm max-w-lg mx-auto ${
                  isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                }`}
              >
                Three simple steps to start your collection
              </p>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <StaggerItem key={step.num}>
                    <div className="card p-8 text-center relative overflow-hidden group">
                      {/* Step number watermark */}
                      <div
                        className={`absolute -top-4 -right-2 font-display text-[7rem] font-black leading-none select-none pointer-events-none ${
                          isDark ? 'text-white/[0.03]' : 'text-black/[0.03]'
                        }`}
                      >
                        {step.num}
                      </div>

                      {/* Number badge */}
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-terracotta text-white text-sm font-bold mb-5">
                        {step.num}
                      </div>

                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5 transition-transform duration-300 group-hover:scale-110 ${
                          isDark ? 'bg-white/[0.06]' : 'bg-black/[0.04]'
                        }`}
                      >
                        <Icon
                          className="w-7 h-7 text-brand-terracotta"
                        />
                      </div>

                      <h3
                        className={`font-display text-xl font-semibold mb-3 ${
                          isDark ? 'text-gallery-darkText' : 'text-gallery-text'
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={`text-sm leading-relaxed ${
                          isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </RevealOnScroll>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — ARTIST CTA
          ════════════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <RevealOnScroll>
            <div
              className="relative rounded-3xl overflow-hidden px-8 py-16 sm:px-14 sm:py-20 lg:px-20 lg:py-24 text-center"
              style={{
                background: 'linear-gradient(135deg, #c45d3e 0%, #e8856c 50%, #d97a5e 100%)',
              }}
            >
              {/* Subtle decorative elements */}
              <div
                className="absolute top-0 left-0 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
              />
              <div
                className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #c9a84c 0%, transparent 70%)' }}
              />

              <div className="relative z-10 max-w-2xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <HiHeart className="w-10 h-10 text-white/80 mx-auto mb-6" />
                  <h2 className="font-display text-title sm:text-[2.75rem] text-white mb-4">
                    Are You an Artist?
                  </h2>
                  <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-8 max-w-lg mx-auto">
                    Join a thriving community of creators. Upload your portfolio, set your prices,
                    and start earning from your digital art today.
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-terracotta font-semibold text-base transition-all duration-300 hover:bg-white/90 hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97]"
                  >
                    Start Selling
                    <HiArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;
