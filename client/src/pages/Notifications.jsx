import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { HiBell, HiCheck, HiHeart, HiShoppingCart, HiUserPlus, HiChatBubbleLeft, HiExclamationTriangle, HiCog6Tooth } from 'react-icons/hi2';
import toast from 'react-hot-toast';
import { PageTransition, EmptyState } from '../components/ui';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../features/notification/notificationSlice';

const typeIcons = {
  sale: HiShoppingCart,
  purchase: HiShoppingCart,
  follow: HiUserPlus,
  bid: HiHeart,
  outbid: HiExclamationTriangle,
  commission: HiChatBubbleLeft,
  system: HiCog6Tooth,
  artwork_flagged: HiExclamationTriangle,
};

const typeColors = {
  sale: 'text-brand-teal bg-brand-teal/10',
  purchase: 'text-brand-terracotta bg-brand-terracotta/10',
  follow: 'text-brand-lavender bg-brand-lavender/10',
  bid: 'text-brand-gold bg-brand-gold/10',
  outbid: 'text-brand-coral bg-brand-coral/10',
  commission: 'text-brand-teal bg-brand-teal/10',
  system: 'text-gallery-textMuted bg-gallery-surface',
  artwork_flagged: 'text-red-500 bg-red-500/10',
};

const Notifications = () => {
  const { isDark } = useTheme();
  const dispatch = useDispatch();
  const { notifications, isLoading } = useSelector(state => state.notification);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const markAsRead = (id) => {
    dispatch(markNotificationRead(id))
      .unwrap()
      .catch(() => toast.error('Failed to mark as read'));
  };

  const markAllAsRead = () => {
    dispatch(markAllNotificationsRead())
      .unwrap()
      .then(() => toast.success('All notifications marked as read'))
      .catch(() => toast.error('Failed to mark all as read'));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-title">Notifications</h1>
            {unreadCount > 0 && (
              <p className={`text-sm mt-1 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllAsRead} className="btn-ghost text-sm flex items-center gap-2">
              <HiCheck className="w-4 h-4" /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={HiBell}
            title="No notifications yet"
            description="You'll see notifications for sales, follows, bids, and more here."
          />
        ) : (
          <div className="space-y-2">
            {notifications.map((notification, index) => {
              const Icon = typeIcons[notification.type] || HiBell;
              const colorClass = typeColors[notification.type] || typeColors.system;

              return (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => !notification.isRead && markAsRead(notification._id)}
                  className={`card p-4 flex items-start gap-4 cursor-pointer transition-all ${
                    !notification.isRead
                      ? isDark ? 'border-brand-terracotta/30' : 'border-brand-terracotta/20 bg-brand-terracotta/[0.02]'
                      : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{notification.title}</p>
                    <p className={`text-sm mt-0.5 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gallery-darkTextMuted' : 'text-gallery-textMuted'}`}>
                      {formatTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-terracotta flex-shrink-0 mt-2" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default Notifications;
