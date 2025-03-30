export type CategoryType =
  | 'Food'
  | 'Shopping'
  | 'Transportation'
  | 'Entertainment'
  | 'Bills'
  | 'Housing'
  | 'Income'
  | 'Healthcare'
  | 'Other';

export interface CategoryBadgeProps {
  category: string;
  class?: string;
}

export function getCategoryColor(category: string): string {
  switch (category.toLowerCase()) {
    case 'food':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'shopping':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'transportation':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'entertainment':
      return 'bg-pink-100 text-pink-800 border-pink-200';
    case 'bills':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'housing':
      return 'bg-teal-100 text-teal-800 border-teal-200';
    case 'income':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'healthcare':
      return 'bg-cyan-100 text-cyan-800 border-cyan-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default function CategoryBadge({ category, class: className = '' }: CategoryBadgeProps) {
  const colorClass = getCategoryColor(category);

  return (
    <span
      class={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {category}
    </span>
  );
}
