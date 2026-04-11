import { useEffect, useState } from 'react';
import { Loader2, RefreshCcw, Users } from 'lucide-react';
import { adminApi } from '../../features/admin/api/admin';
import type { AdminUserSummary } from '../../features/admin/types';
import { cn } from '@/shared/utils/cn';

const formatRoleLabel = (role: string) => {
  if (role === 'ORGANISATION') {
    return 'Organization';
  }

  return role.charAt(0) + role.slice(1).toLowerCase();
};

const formatUserDate = (date: string) =>
  new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));

export const AdminUsersPage = () => {
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response);
      setError(null);
    } catch {
      setError('Unable to load users right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-headline font-bold text-3xl text-foreground leading-tight">
            Users
          </h1>
          <p className="text-muted-foreground font-body mt-1">
            Admin view of all active platform accounts and account status.
          </p>
        </div>
        <button
          onClick={() => void loadUsers()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground rounded-xl text-sm font-label font-semibold hover:bg-surface-container transition-all"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-border bg-background p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground" />
          <p className="mt-4 text-sm font-body text-muted-foreground">Loading users...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <h2 className="mt-4 text-lg font-headline font-bold text-foreground">No users found</h2>
          <p className="mt-2 text-sm font-body text-muted-foreground">
            User accounts will appear here once they are created.
          </p>
        </div>
      ) : (
        <div className="bg-background rounded-xl border border-border overflow-hidden">
          <div className="grid grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-6 py-4 border-b border-border text-[11px] font-label uppercase tracking-wider text-muted-foreground">
            <span>User</span>
            <span>Contact</span>
            <span>Role</span>
            <span>Status</span>
            <span>Email</span>
            <span>Joined</span>
          </div>
          <div className="divide-y divide-border">
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-[1.3fr_1.1fr_0.8fr_0.8fr_0.8fr_0.8fr] gap-4 px-6 py-5 items-center hover:bg-surface-container/60 transition-colors"
              >
                <div>
                  <h3 className="text-sm font-label font-semibold text-foreground">
                    {user.name ?? 'Unnamed user'}
                  </h3>
                  <p className="mt-1 text-xs font-body text-muted-foreground">
                    {user.organisationName ?? user.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-body text-foreground">{user.email}</p>
                  <p className="mt-1 text-xs font-body text-muted-foreground">
                    {user.phone ?? 'No phone added'}
                  </p>
                </div>
                <div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {formatRoleLabel(user.role)}
                  </span>
                </div>
                <div>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                      user.isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700',
                    )}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div>
                  <span
                    className={cn(
                      'inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider',
                      user.emailVerified
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700',
                    )}
                  >
                    {user.emailVerified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs font-body text-muted-foreground">
                  {formatUserDate(user.createdAt)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
