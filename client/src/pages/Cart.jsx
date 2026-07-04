import { Link } from 'react-router-dom';
import { HiShoppingCart } from 'react-icons/hi2';
import { useTheme } from '../context/ThemeContext';
import { PageTransition, EmptyState } from '../components/ui';

const Cart = () => {
  const { isDark } = useTheme();

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-title mb-8">Your Cart</h1>
        <EmptyState
          icon={HiShoppingCart}
          title="Your cart is empty"
          description="Browse the marketplace to discover extraordinary digital art"
          action={<Link to="/marketplace" className="btn-primary">Browse Gallery</Link>}
        />
      </div>
    </PageTransition>
  );
};

export default Cart;
