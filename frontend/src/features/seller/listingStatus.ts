const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted for review',
  under_review: 'Under review',
  published: 'Published',
  under_offer: 'Under offer',
  sold: 'Sold',
  rented: 'Rented',
  completed: 'Completed',
  archived: 'Archived',
};

export const listingStatusLabel = (status?: string): string =>
  STATUS_LABELS[status || ''] || 'Unknown';

export const isPublicListing = (status?: string): boolean => status === 'published';

export const sellerStatusAction = (status?: string): { nextStatus: 'submitted' | 'archived'; label: string } | null => {
  if (status === 'draft') return { nextStatus: 'submitted', label: 'Submit for review' };
  if (status === 'archived') return { nextStatus: 'submitted', label: 'Resubmit for review' };
  if (['submitted', 'under_review', 'published', 'under_offer'].includes(status || '')) {
    return { nextStatus: 'archived', label: 'Archive listing' };
  }
  return null;
};
