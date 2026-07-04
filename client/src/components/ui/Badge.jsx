import { useTheme } from '../../context/ThemeContext';

const Badge = ({ variant = 'default', children, className = '', size = 'sm', dot = false }) => {
  const variantClasses = {
    terra:    'badge-terra',
    teal:     'badge-teal',
    coral:    'badge-coral',
    lavender: 'badge-lavender',
    gold:     'badge-gold',
    success:  'badge bg-emerald-500/12 text-emerald-600 dark-theme:bg-emerald-500/20 dark-theme:text-emerald-400',
    danger:   'badge bg-red-500/12 text-red-600',
    default:  'badge bg-gallery-surface text-gallery-textSecondary',
  };

  const sizeClasses = {
    xs: 'text-[10px] px-2 py-0.5',
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-4 py-1.5',
  };

  // Map common role/status names to variants
  const autoVariant = {
    artist: 'terra',
    buyer: 'teal',
    admin: 'lavender',
    published: 'teal',
    draft: 'default',
    sold_out: 'coral',
    flagged: 'danger',
    archived: 'default',
    pending: 'gold',
    completed: 'teal',
    accepted: 'teal',
    rejected: 'danger',
    fixed: 'teal',
    auction: 'lavender',
  };

  const resolvedVariant = variant === 'auto'
    ? (autoVariant[children?.toString().toLowerCase()] || 'default')
    : variant;

  return (
    <span className={`${variantClasses[resolvedVariant] || variantClasses.default} ${sizeClasses[size]} ${className}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
};

export default Badge;
