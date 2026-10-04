import React, { useMemo, useState, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CheckSquare,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Columns3,
  Search,
  Square,
  Trash2,
  Download,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { SkeletonGrid, EmptyState } from './Dashboard';
import { StatusBadge } from './StatusBadge';
import { Button } from './Button';

export type Density = 'compact' | 'comfortable' | 'relaxed';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  searchKeys?: (keyof TData)[];
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  bulkActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: (selectedRows: TData[]) => void;
    variant?: 'danger' | 'default';
  }[];
  toolbarActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  showDensityToggle?: boolean;
  showColumnToggle?: boolean;
  showSearch?: boolean;
  showBulkActions?: boolean;
  density?: Density;
  onDensityChange?: (density: Density) => void;
  pageSize?: number;
  className?: string;
  getRowId?: (row: TData) => string;
}

export function DataTable<TData>({
  data,
  columns,
  searchKeys = [],
  searchPlaceholder = 'Search...',
  onRowClick,
  bulkActions = [],
  toolbarActions,
  emptyTitle = 'No records found',
  emptyDescription = 'No records match the current filters.',
  isLoading = false,
  isError = false,
  onRetry,
  showDensityToggle = true,
  showColumnToggle = true,
  showSearch = true,
  showBulkActions = true,
  density: controlledDensity,
  onDensityChange,
  pageSize = 10,
  className,
  getRowId,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });
  const [search, setSearch] = useState('');
  const [showColumns, setShowColumns] = useState(false);
  const [internalDensity, setInternalDensity] = useState<Density>('comfortable');

  const density = controlledDensity ?? internalDensity;
  const setDensity = onDensityChange ?? setInternalDensity;

  React.useEffect(() => {
    setPagination((current) => ({ ...current, pageSize, pageIndex: 0 }));
  }, [pageSize, search]);

  const filteredData = useMemo(() => {
    if (!search || searchKeys.length === 0) return data;
    const q = search.toLowerCase();
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = row[key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, searchKeys]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: getRowId ? (row) => getRowId(row as TData) : undefined,
  });

  const selectedRows = table.getSelectedRowModel().rows.map((r) => r.original);
  const pageRows = table.getRowModel().rows;
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => r.getIsSelected());

  const togglePageSelection = () => {
    pageRows.forEach((r) => r.toggleSelected(!allPageSelected));
  };

  const densityPadding = {
    compact: 'py-2',
    comfortable: 'py-3',
    relaxed: 'py-4',
  }[density];

  const sortButton = (id: string, label: string) => {
    const column = table.getColumn(id);
    const direction = column?.getIsSorted();
    return (
      <button
        type="button"
        onClick={() => column?.toggleSorting()}
        className="inline-flex items-center gap-1 hover:text-[var(--color-text-main)]"
        title={`Sort by ${label}`}
      >
        {label}
        {direction === 'asc' ? (
          <ArrowUp size={12} />
        ) : direction === 'desc' ? (
          <ArrowDown size={12} />
        ) : (
          <ArrowUpDown size={12} className="text-[var(--color-text-dim)]" />
        )}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6">
        <SkeletonGrid count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="Failed to load data"
        hint="An error occurred while loading this content."
        action={
          <Button variant="secondary" size="sm" onClick={onRetry || (() => {})}>
            Try Again
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-2.5 md:flex-row md:items-center shadow-[var(--shadow-depth-1)]">
        {showSearch && searchKeys.length > 0 && (
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] py-2 pl-9 pr-12 text-sm text-[var(--color-text-main)] placeholder:text-[var(--color-text-dim)] outline-none focus:border-emerald-500/50"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-dim)]">
              ⌘K
            </kbd>
          </div>
        )}

        <div className="flex items-center gap-2">
          {toolbarActions}

          {showDensityToggle && (
            <div className="flex items-center gap-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0.5">
              {(['compact', 'comfortable', 'relaxed'] as Density[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  className={cn(
                    'rounded-md px-2 py-1 text-[10px] font-semibold transition-colors',
                    density === d
                      ? 'bg-emerald-500 text-white'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]'
                  )}
                  title={`${d} density`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          )}

          {showColumnToggle && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumns(!showColumns)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] transition hover:text-[var(--color-text-main)]"
              >
                <Columns3 size={14} />
                <span className="hidden sm:inline">Columns</span>
              </button>
              {showColumns && (
                <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-1.5 shadow-[var(--shadow-depth-2]">
                  {table.getAllColumns().filter((col) => col.getCanHide()).map((col) => (
                    <label key={col.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)]">
                      <input
                        type="checkbox"
                        checked={col.getIsVisible()}
                        onChange={col.getToggleVisibilityHandler()}
                        className="accent-emerald-500"
                      />
                      {typeof col.columnDef.header === 'string' ? col.columnDef.header : col.id}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {showBulkActions && selectedRows.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-2.5">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {selectedRows.length} selected
          </span>
          <div className="flex items-center gap-2">
            {bulkActions.map((action, idx) => (
              <Button
                key={idx}
                variant={action.variant === 'danger' ? 'destructive' : 'secondary'}
                size="sm"
                onClick={() => action.onClick(selectedRows)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-depth-1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[var(--color-bg-elevated)] border-b border-[var(--color-border)] text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] sticky top-0 z-10">
              <tr>
                {showBulkActions && (
                  <th className="px-3 py-3">
                    <button
                      type="button"
                      onClick={togglePageSelection}
                      title="Select all"
                      aria-label="Select all"
                    >
                      {allPageSelected ? (
                        <CheckSquare size={16} className="text-[var(--color-brand-emerald)]" />
                      ) : (
                        <Square size={16} className="text-[var(--color-text-dim)]" />
                      )}
                    </button>
                  </th>
                )}
                {table.getHeaderGroups()[0]?.headers.map((header) => (
                  <th key={header.id} className={cn('px-4 py-3 font-bold text-left', densityPadding)}>
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1 hover:text-[var(--color-text-main)]"
                      >
                        {typeof header.column.columnDef.header === 'string'
                          ? header.column.columnDef.header
                          : header.id}
                        {header.column.getIsSorted() === 'asc' ? (
                          <ArrowUp size={12} />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <ArrowDown size={12} />
                        ) : (
                          <ArrowUpDown size={12} className="text-[var(--color-text-dim)]" />
                        )}
                      </button>
                    ) : (
                      typeof header.column.columnDef.header === 'string'
                        ? header.column.columnDef.header
                        : header.id
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (showBulkActions ? 1 : 0)} className="px-4 py-12">
                    <EmptyState title={emptyTitle} hint={emptyDescription} />
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'transition-colors even:bg-[var(--color-bg-surface)]',
                      onRowClick && 'cursor-pointer',
                      row.getIsSelected() && 'bg-emerald-500/5'
                    )}
                  >
                    {showBulkActions && (
                      <td className="px-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => row.toggleSelected()}
                          title="Select row"
                          aria-label="Select row"
                        >
                          {row.getIsSelected() ? (
                            <CheckSquare size={16} className="text-[var(--color-brand-emerald)]" />
                          ) : (
                            <Square size={16} className="text-[var(--color-text-dim)]" />
                          )}
                        </button>
                      </td>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className={cn('px-4 align-top text-sm', densityPadding)}>
                        {cell.column.columnDef.cell
                          ? (cell.column.columnDef.cell as (props: { row: { original: TData }; getValue: () => unknown }) => React.ReactNode)({
                              row,
                              getValue: cell.getValue,
                            })
                          : String(cell.getValue() ?? '')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[var(--color-border)] px-3 py-2">
          <p className="text-xs text-[var(--color-text-muted)] font-medium">
            Showing <span className="font-mono font-bold text-[var(--color-text-main)]">{filteredData.length === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1}</span> to{' '}
            <span className="font-mono font-bold text-[var(--color-text-main)]">{Math.min(filteredData.length, (pagination.pageIndex + 1) * pagination.pageSize)}</span> of{' '}
            <span className="font-mono font-bold text-[var(--color-brand-emerald)]">{filteredData.length}</span> records
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-30"
              aria-label="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-30"
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 text-xs font-mono text-[var(--color-text-muted)]">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-30"
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-30"
              aria-label="Last page"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
