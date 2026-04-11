import { Star, StarHalf } from 'lucide-react';

interface Props {
  rating: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({ rating, count, size = 'md' }: Props) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[size];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className={`${iconSize} fill-yellow-400 text-yellow-400`} />
        ))}
        {hasHalfStar && <StarHalf className={`${iconSize} fill-yellow-400 text-yellow-400`} />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className={`${iconSize} text-gray-300 dark:text-gray-600`} />
        ))}
      </div>
      {count !== undefined && (
        <span className="text-xs font-medium text-[var(--text-secondary)] ml-1">
          ({count} reviews)
        </span>
      )}
    </div>
  );
}
