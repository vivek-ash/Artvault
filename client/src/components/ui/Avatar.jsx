import { useTheme } from '../../context/ThemeContext';

const Avatar = ({ name, image, size = 'md', className = '' }) => {
  const { isDark } = useTheme();

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
    '2xl': 'w-28 h-28 text-3xl',
  };

  // Generate initials from name
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  // Deterministic color from name
  const colors = [
    'bg-brand-terracotta',
    'bg-brand-teal',
    'bg-brand-coral',
    'bg-brand-lavender',
    'bg-brand-gold',
  ];
  const colorIndex = name
    ? name.charCodeAt(0) % colors.length
    : 0;

  if (image) {
    return (
      <img
        src={image}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2
          ${isDark ? 'ring-gallery-darkBorder' : 'ring-gallery-border'} ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colors[colorIndex]} rounded-full
        flex items-center justify-center text-white font-semibold
        ring-2 ${isDark ? 'ring-gallery-darkBorder' : 'ring-gallery-border'} ${className}`}
    >
      {initials}
    </div>
  );
};

export default Avatar;
