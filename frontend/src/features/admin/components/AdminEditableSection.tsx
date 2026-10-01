import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
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

  const handleEdit = () => {
    setLocalData(data);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setLocalData(data);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      await onSave(localData);
      setIsEditing(false);
    } catch (error) {
      logError('Failed to save section:', error);
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
            <Button
              onClick={handleEdit}
              variant="ghost"
              className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-brand-emerald)] border border-[var(--color-border)] rounded-lg cursor-pointer"
            >
              Edit Section
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleCancel}
                variant="ghost"
                className="px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] hover:text-red-600 dark:hover:text-red-400 border border-[var(--color-border)] rounded-lg cursor-pointer"
              >
                <X size={14} className="mr-1" /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-600 dark:bg-emerald-500 text-[#fff] rounded-lg shadow-[var(--shadow-emerald-soft)] cursor-pointer"
              >
                <Check size={14} className="mr-1" /> Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {children(isEditing, localData, setLocalData)}
      </div>
    </div>
  );
}
