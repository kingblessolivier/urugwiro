import React from 'react';
import { UnifiedListingWizard } from '../../components/listing-wizard/UnifiedListingWizard';

interface ListingWizardProps {
  onSuccess?: () => void;
}

const ListingWizard: React.FC<ListingWizardProps> = ({ onSuccess }) => {
  return (
    <UnifiedListingWizard
      listedByRole="seller"
      onSuccess={onSuccess}
    />
  );
};

export default ListingWizard;
