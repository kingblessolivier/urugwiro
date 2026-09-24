import React from 'react';
import { UnifiedListingWizard } from '../../components/listing-wizard/UnifiedListingWizard';
import type { AppView } from '../../types/navigation';

interface AdminPropertyWizardProps {
  onNavigate?: (view: AppView) => void;
}

export const AdminPropertyWizard: React.FC<AdminPropertyWizardProps> = ({ onNavigate }) => {
  return (
    <UnifiedListingWizard
      listedByRole="admin"
      onNavigate={onNavigate}
      onSuccess={() => onNavigate?.('admin-listings')}
    />
  );
};

export default AdminPropertyWizard;
