import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiShoppingCart,
  HiArrowRight,
  HiTrash,
  HiSparkles,
} from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';

const Cart = () => {
  const { isDark } = useTheme();

  // Cart will be managed via Redux in a later phase — for now show empty state
  const cartItems = [];

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className={`font-display text-3xl sm:text-4xl font-bold mb-10 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
            Your Cart
          </h1>
        </motion.div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`text-center py-24 rounded-2xl border border-dashed ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}
          >
            <HiShoppingCart className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gallery-textMuted/30' : 'text-gallery-textDarkMuted/30'}`} />
            <h2 className={`font-display text-xl font-semibold mb-2 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
              Your cart is empty
            </h2>
            <p className={`text-sm mb-8 max-w-md mx-auto ${isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}`}>
              Discover unique digital artworks from talented artists around the world
            </p>
            <Link to="/marketplace" className="btn-primary inline-flex items-center gap-2">
              Browse the Gallery
              <HiArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Cart items will be rendered here */}
            </div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`p-6 rounded-xl border h-fit sticky top-24 ${isDark ? 'bg-gallery-darkCard border-gallery-darkBorder' : 'bg-gallery-lightCard border-gallery-lightBorder'}`}
            >
              <h3 className={`font-display text-lg font-semibold mb-4 ${isDark ? 'text-gallery-text' : 'text-gallery-textDark'}`}>
                Order Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>Subtotal</span>
                  <span className={isDark ? 'text-gallery-text' : 'text-gallery-textDark'}>₹0</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gallery-textMuted' : 'text-gallery-textDarkMuted'}>Platform Fee (10%)</span>
                  <span className={isDark ? 'text-gallery-text' : 'text-gallery-textDark'}>₹0</span>
                </div>
                <div className={`pt-3 border-t ${isDark ? 'border-gallery-darkBorder' : 'border-gallery-lightBorder'}`}>
                  <div className="flex justify-between font-semibold">
                    <span className={isDark ? 'text-gallery-text' : 'text-gallery-textDark'}>Total</span>
                    <span className="text-gallery-accent text-lg">₹0</span>
                  </div>
                </div>
              </div>
              <button disabled className="btn-primary w-full mt-6 opacity-50 cursor-not-allowed">
                Proceed to Checkout
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
