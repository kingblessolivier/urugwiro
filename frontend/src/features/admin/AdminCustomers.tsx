import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { Mail, MapPin, MessageSquare, Phone, Plus, UserRound, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api/endpoints';
import { DataTable } from '../../components/ui/DataTable';

interface CustomerRecord {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  location: string;
  source: string;
  notes: string;
  conversations_count: number;
  created_at: string;
  last_activity_at: string;
}

type CustomerForm = Pick<CustomerRecord, 'full_name' | 'phone' | 'email' | 'location' | 'source' | 'notes'>;

const EMPTY_FORM: CustomerForm = {
  full_name: '',
  phone: '',
  email: '',
  location: '',
  source: 'website',
  notes: '',
};

const SOURCE_OPTIONS = [
  ['website', 'Website'],
  ['whatsapp', 'WhatsApp'],
  ['phone', 'Phone'],
  ['email', 'Email'],
  ['walk_in', 'Walk-in'],
  ['referral', 'Referral'],
  ['social_media', 'Social media'],
] as const;

const formatDate = (value: string) => {
  if (!value) return 'No activity';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No activity' : date.toLocaleDateString();
};

const AdminCustomers: React.FC = () => {
  const navigate = useNavigate();
  const { id: customerId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const customersQuery = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const response = await api.admin.customers({ page_size: '100' });
      const rows = response.data?.results || response.data || [];
      return (Array.isArray(rows) ? rows : []) as CustomerRecord[];
    },
  });

  const detailQuery = useQuery({
    queryKey: ['admin-customer', customerId],
    queryFn: async () => (await api.admin.customerDetail(customerId!)).data as CustomerRecord,
    enabled: Boolean(customerId),
  });

  useEffect(() => {
    if (detailQuery.data) {
      const { full_name, phone, email, location, source, notes } = detailQuery.data;
      setForm({ full_name, phone, email, location, source, notes });
      setFormError('');
    }
  }, [detailQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (data: CustomerForm) => customerId
      ? api.admin.updateCustomer(customerId, data)
      : api.admin.createCustomer(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      if (customerId) {
        await queryClient.invalidateQueries({ queryKey: ['admin-customer', customerId] });
        navigate('/admin/customers');
      } else {
        setCreateOpen(false);
      }
      setForm(EMPTY_FORM);
      setFormError('');
    },
    onError: (error: any) => {
      const detail = error.response?.data;
      setFormError(typeof detail === 'string' ? detail : detail?.error || JSON.stringify(detail || {}) || 'Could not save customer.');
    },
  });

  const customers = customersQuery.data || [];
  const columns = useMemo<ColumnDef<CustomerRecord>[]>(() => [
    {
      accessorKey: 'full_name',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-[var(--color-text-main)]">{row.original.full_name}</p>
          <p className="mt-0.5 truncate text-xs text-[var(--color-text-dim)]">{row.original.email || 'No email'}</p>
        </div>
      ),
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ getValue }) => <span className="text-sm text-[var(--color-text-muted)]">{String(getValue() || 'Not provided')}</span>,
    },
    {
      accessorKey: 'source',
      header: 'Source',
      cell: ({ getValue }) => <span className="capitalize text-sm text-[var(--color-text-muted)]">{String(getValue() || '').replace('_', ' ')}</span>,
    },
    {
      accessorKey: 'conversations_count',
      header: 'Conversations',
      cell: ({ getValue }) => <span className="font-mono text-sm">{Number(getValue() || 0)}</span>,
    },
    {
      accessorKey: 'last_activity_at',
      header: 'Last activity',
      cell: ({ getValue }) => <span className="text-sm text-[var(--color-text-muted)]">{formatDate(String(getValue() || ''))}</span>,
    },
  ], []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError('');
    setCreateOpen(true);
  };
  const closeDialog = () => {
    setFormError('');
    setCreateOpen(false);
    if (customerId) navigate('/admin/customers');
  };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');
    saveMutation.mutate(form);
  };
  const dialogOpen = createOpen || Boolean(customerId);

  return (
    <div className="mx-auto max-w-7xl space-y-7 p-6 lg:p-10">
      <header className="flex flex-col justify-between gap-4 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-brand-emerald)]">Customer CRM</p>
          <h1 className="mt-1 text-3xl font-bold text-[var(--color-text-main)]">Customers</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">Manage people who inquire, save listings, book visits, or make offers.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
          <Plus size={16} /> Add Customer
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <UserRound size={17} className="text-[var(--color-brand-emerald)]" />
          <p className="mt-3 text-2xl font-bold">{customers.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Loaded customer records</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <MessageSquare size={17} className="text-sky-500" />
          <p className="mt-3 text-2xl font-bold">{customers.reduce((total, customer) => total + customer.conversations_count, 0)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Conversations</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <MapPin size={17} className="text-amber-500" />
          <p className="mt-3 text-2xl font-bold">{customers.filter((customer) => customer.location).length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Records with location</p>
        </div>
      </div>

      <DataTable
        data={customers}
        columns={columns}
        searchKeys={['full_name', 'email', 'phone', 'location', 'source']}
        searchPlaceholder="Search customers by name, contact, location, or source"
        onRowClick={(customer) => navigate(`/admin/customers/${customer.id}`)}
        getRowId={(customer) => customer.id}
        isLoading={customersQuery.isLoading}
        isError={customersQuery.isError}
        onRetry={() => customersQuery.refetch()}
        showBulkActions={false}
        emptyTitle="No customers yet"
        emptyDescription="Customer records appear here when interest is captured or staff add one."
      />

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4" onMouseDown={closeDialog}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-border)] pb-4">
              <div>
                <h2 className="text-xl font-bold">{customerId ? 'Customer Details' : 'Add Customer'}</h2>
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">Contact and CRM context for this customer.</p>
              </div>
              <button type="button" onClick={closeDialog} aria-label="Close customer form" title="Close" className="rounded-lg p-2 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-main)]">
                <X size={18} />
              </button>
            </div>

            {detailQuery.isLoading && customerId ? (
              <p className="py-10 text-center text-sm text-[var(--color-text-muted)]">Loading customer...</p>
            ) : (
              <form onSubmit={submit} className="mt-5 space-y-5">
                {formError && <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-500">{formError}</div>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">Full name
                    <input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-xs font-bold text-[var(--color-text-muted)]">Source
                    <select value={form.source} onChange={(event) => setForm({ ...form, source: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500">
                      {SOURCE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="text-xs font-bold text-[var(--color-text-muted)]"><span className="flex items-center gap-1"><Phone size={12} /> Phone</span>
                    <input required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                  </label>
                  <label className="text-xs font-bold text-[var(--color-text-muted)]"><span className="flex items-center gap-1"><Mail size={12} /> Email</span>
                    <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                  </label>
                </div>
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">Location
                  <input value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} className="mt-1.5 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                </label>
                <label className="block text-xs font-bold text-[var(--color-text-muted)]">Internal notes
                  <textarea rows={4} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-input-bg)] px-3 py-2.5 text-sm text-[var(--color-text-main)] outline-none focus:border-emerald-500" />
                </label>
                <div className="flex justify-end gap-3 border-t border-[var(--color-border)] pt-4">
                  <button type="button" onClick={closeDialog} className="rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-bold text-[var(--color-text-muted)] hover:text-[var(--color-text-main)]">Cancel</button>
                  <button type="submit" disabled={saveMutation.isPending} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
                    {saveMutation.isPending ? 'Saving...' : customerId ? 'Save Changes' : 'Create Customer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
