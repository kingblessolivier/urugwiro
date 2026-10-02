import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn, logError } from '../../../lib/utils';
import { Button } from '../../../components/ui/Button';

interface AdminEditableSectionProps<T> {
  title: string;
  icon: any;
  data: T;
  children: (isEditing: boolean, currentData: T, setData: (newData: T) => void) => React.ReactNode;
  onSave: (updatedData: T) => Promise<void>;
}

export function AdminEditableSection<T>({
  title,
  icon: Icon,
  data,
  children,
  onSave
}: AdminEditableSectionProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<T>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Automatically keep localData in sync with incoming refreshed data when not actively editing
  useEffect(() => {
    if (!isEditing) {
      setLocalData(data);
    }
  }, [data, isEditing]);

  const handleEdit = () => {
    setLocalData(data);
    setSaveError(null);
    setSaveSuccess(false);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setLocalData(data);
    setSaveError(null);
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave(localData);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (error: any) {
      logError('Failed to save section:', error);
      let errorMsg = 'Failed to save changes. Please try again.';
      if (error?.response?.data) {
        const resp = error.response.data;
        if (typeof resp === 'string') {
          errorMsg = resp;
        } else if (typeof resp === 'object') {
          const lines = Object.entries(resp).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`);
          errorMsg = lines.join(' | ');
        }
      } else if (error?.message) {
        errorMsg = error.message;
      }
      setSaveError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] overflow-hidden transition-all duration-300 group/section shadow-[var(--shadow-depth-1)]">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-[var(--color-brand-emerald)]">
            <Icon size={16} />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)]">{title}</h3>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1 mr-1">
                  <CheckCircle2 size={13} /> Saved
                </span>
              )}
              <Button
                onClick={handleEdit}
                variant="ghost"
                className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-lg cursor-pointer"
              >
                Edit Section
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-red-600 dark:hover:text-red-400 border border-[var(--color-border)] rounded-lg cursor-pointer disabled:opacity-50"
              >
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 dark:bg-emerald-500 text-[#fff] rounded-lg shadow-[var(--shadow-emerald-soft)] cursor-pointer disabled:opacity-75 inline-flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving…
                  </>
                ) : (
                  <>
                    <Check size={14} /> Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {saveError && (
        <div className="px-5 py-2.5 bg-red-500/10 border-b border-red-500/20 text-red-600 dark:text-red-400 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle size={14} className="shrink-0" />
            <span className="truncate">{saveError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-red-500 hover:text-red-700 dark:hover:text-red-300 cursor-pointer shrink-0"
          >
            <X size={13} />
          </button>
        </div>
      )}

      <div className="p-5">
        {children(isEditing, localData, setLocalData)}
      </div>
    </div>
  );
}
