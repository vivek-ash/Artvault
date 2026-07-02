import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { createOrder, verifyPayment } from '../features/order/orderSlice';

/**
 * Custom hook for Razorpay checkout flow
 */
const useRazorpay = () => {
  const dispatch = useDispatch();

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = useCallback(
    async (artworkId, artworkTitle, onSuccess) => {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway. Check your internet connection.');
        return;
      }

      // Create order on backend
      const result = await dispatch(createOrder(artworkId));
      if (result.meta.requestStatus !== 'fulfilled') {
        toast.error(result.payload || 'Failed to create order');
        return;
      }

      const { order, razorpayOrder, key } = result.payload;

      // Open Razorpay checkout
      const options = {
        key,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'ArtVault',
        description: `Purchase: ${artworkTitle}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          // Verify payment on backend
          const verifyResult = await dispatch(
            verifyPayment({
              orderId: order._id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            })
          );

          if (verifyResult.meta.requestStatus === 'fulfilled') {
            toast.success('Payment successful! 🎉');
            if (onSuccess) onSuccess(verifyResult.payload);
          } else {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled', { icon: '🚫' });
          },
        },
        prefill: {},
        theme: {
          color: '#c9a84c',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    },
    [dispatch]
  );

  return { initiatePayment };
};

export default useRazorpay;
