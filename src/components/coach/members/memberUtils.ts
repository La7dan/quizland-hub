
import { handleDownload } from '@/components/evaluations/utils';

// Format date for display
export const formatDate = (dateStr?: string) => {
  if (!dateStr) return 'Not evaluated';
  return new Date(dateStr).toLocaleDateString();
};

// Re-export handleDownload to use in our components
export { handleDownload };
