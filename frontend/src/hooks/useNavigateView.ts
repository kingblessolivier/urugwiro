import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AppView } from '../types/navigation';
import { pathForView, type NavigateView, type NavigateViewOptions } from '../lib/routes';

export function useNavigateView(): NavigateView {
  const navigate = useNavigate();

  return useCallback(
    (view: AppView, options?: NavigateViewOptions) => {
      navigate(pathForView(view, options));
    },
    [navigate]
  );
}
