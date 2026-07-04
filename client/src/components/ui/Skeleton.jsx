import { useTheme } from '../../context/ThemeContext';

const Skeleton = ({ className = '', variant = 'rect' }) => {
  const shapes = {
    rect: 'w-full h-4',
    circle: 'w-12 h-12 rounded-full',
    card: 'w-full h-64 rounded-2xl',
    title: 'w-3/4 h-6',
    text: 'w-full h-4',
    avatar: 'w-10 h-10 rounded-full',
    thumbnail: 'w-full aspect-square rounded-2xl',
    button: 'w-32 h-10 rounded-xl',
  };

  return (
    <div className={`skeleton ${shapes[variant] || shapes.rect} ${className}`} />
  );
};

// Pre-built skeleton patterns
export const ArtworkCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton variant="thumbnail" />
    <div className="space-y-2 px-1">
      <Skeleton variant="title" className="!w-2/3 !h-5" />
      <div className="flex items-center gap-2">
        <Skeleton variant="avatar" className="!w-6 !h-6" />
        <Skeleton className="!w-24 !h-3" />
      </div>
      <Skeleton className="!w-20 !h-5" />
    </div>
  </div>
);

export const TableRowSkeleton = () => (
  <div className="flex items-center gap-4 py-4">
    <Skeleton variant="avatar" />
    <div className="flex-1 space-y-2">
      <Skeleton className="!w-1/3 !h-4" />
      <Skeleton className="!w-1/4 !h-3" />
    </div>
    <Skeleton variant="button" className="!w-20" />
  </div>
);

export const StatCardSkeleton = () => (
  <div className="card p-6 space-y-3">
    <Skeleton className="!w-8 !h-8 !rounded-lg" />
    <Skeleton className="!w-16 !h-8" />
    <Skeleton className="!w-24 !h-3" />
  </div>
);

export default Skeleton;
