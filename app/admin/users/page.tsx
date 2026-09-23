import {redirect} from 'next/navigation';
import {updateAdminUserAccess} from '@/app/admin/users/actions';
import {AdminMutationForm} from '@/components/admin/admin-mutation-form';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {
  AdminEmptyState,
  AdminPanel,
  AdminStatCard,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {AdminSubmitButton} from '@/components/admin/admin-submit-button';
import {Container} from '@/components/ui/container';
import {listAdminUsers} from '@/features/admin/users';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

const dateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'short',
  timeStyle: 'short'
});

function formatDate(value: string | null) {
  if (!value) return 'Chưa có';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : dateTime.format(parsed);
}

const roleTone = {
  admin: 'danger',
  staff: 'info',
  viewer: 'neutral'
} as const;

export default async function AdminUsersPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'roles:update')) redirect('/admin');

  const directory = await listAdminUsers();
  const activeAdmins = directory.users.filter(user => user.active && user.role === 'admin').length;
  const activeStaff = directory.users.filter(user => user.active && user.role === 'staff').length;
  const activeViewers = directory.users.filter(user => user.active && user.role === 'viewer').length;
  const inactive = directory.users.filter(user => !user.active).length;

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="ACCESS CONTROL"
          title="Người dùng & phân quyền"
          description="Quản lý profile ứng dụng, role và trạng thái truy cập Admin. User mới từ Supabase Auth mặc định là Viewer và bị vô hiệu hóa cho đến khi Admin kích hoạt."
        />

        <section aria-label="Tổng quan quyền truy cập" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Admin active" value={activeAdmins} detail="Có toàn quyền quản trị và phân quyền." />
          <AdminStatCard label="Staff active" value={activeStaff} detail="Vận hành CRM, catalog và content theo policy." />
          <AdminStatCard label="Viewer active" value={activeViewers} detail="Chỉ đọc các khu vực được cấp." />
          <AdminStatCard label="Đang vô hiệu hóa" value={inactive} detail="Không thể vào khu vực quản trị." />
        </section>

        {!directory.authDirectoryAvailable ? (
          <div
            role="status"
            className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950"
          >
            <strong>Chưa có Auth directory enrichment.</strong>{' '}
            Trang vẫn quản lý role/active từ <code>profiles</code>, nhưng email và trạng thái xác nhận email sẽ không hiển thị cho đến khi server có <code>SUPABASE_SERVICE_ROLE_KEY</code>.
          </div>
        ) : null}

        <AdminPanel
          title="Danh sách tài khoản"
          description="Thay đổi chỉ được lưu khi bấm Lưu quyền. Hệ thống bảo vệ draft, xung đột cập nhật và Admin active cuối cùng."
        >
          {directory.users.length ? (
            <div className="grid gap-4">
              {directory.users.map(user => {
                const isCurrentUser = user.id === session.user.id;
                return (
                  <article
                    key={user.id}
                    className="rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 sm:p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="break-all text-base font-black text-[var(--nupsbox-navy)]">
                            {user.email ?? user.fullName ?? 'User ' + user.id.slice(0, 8)}
                          </h2>
                          <AdminStatusBadge label={user.role} tone={roleTone[user.role]} />
                          <AdminStatusBadge
                            label={user.active ? 'Active' : 'Inactive'}
                            tone={user.active ? 'success' : 'warning'}
                          />
                          {directory.authDirectoryAvailable ? (
                            <AdminStatusBadge
                              label={user.emailConfirmedAt ? 'Email đã xác nhận' : 'Email chưa xác nhận'}
                              tone={user.emailConfirmedAt ? 'success' : 'warning'}
                            />
                          ) : null}
                          {isCurrentUser ? <AdminStatusBadge label="Bạn đang dùng" tone="info" /> : null}
                        </div>
                        <p className="mt-2 text-xs leading-5 text-[var(--nupsbox-slate)]">
                          Tạo profile: {formatDate(user.profileCreatedAt)}
                          {' · '}Đăng nhập cuối: {formatDate(user.lastSignInAt)}
                        </p>
                      </div>
                    </div>

                    <AdminMutationForm
                      recoverableAction={updateAdminUserAccess}
                      expectedUpdatedAt={user.updatedAt}
                      className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(10rem,.7fr)_minmax(10rem,.7fr)_auto] lg:items-end"
                    >
                      <input type="hidden" name="targetUserId" value={user.id} />

                      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
                        Tên hiển thị
                        <input
                          name="fullName"
                          defaultValue={user.fullName ?? ''}
                          maxLength={120}
                          disabled={isCurrentUser}
                          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm font-normal text-[var(--nupsbox-navy)] disabled:bg-slate-100"
                        />
                      </label>

                      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
                        Role
                        <select
                          name="role"
                          defaultValue={user.role}
                          disabled={isCurrentUser}
                          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm font-normal text-[var(--nupsbox-navy)] disabled:bg-slate-100"
                        >
                          <option value="admin">Admin</option>
                          <option value="staff">Staff</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </label>

                      <label className="grid gap-1.5 text-xs font-bold text-[var(--nupsbox-slate)]">
                        Trạng thái
                        <select
                          name="active"
                          defaultValue={user.active ? 'true' : 'false'}
                          disabled={isCurrentUser}
                          className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm font-normal text-[var(--nupsbox-navy)] disabled:bg-slate-100"
                        >
                          <option value="true">Active</option>
                          <option value="false">Inactive</option>
                        </select>
                      </label>

                      {isCurrentUser ? (
                        <p className="max-w-xs text-xs font-semibold leading-5 text-[var(--nupsbox-slate)]">
                          Không thể tự đổi role hoặc tự khóa phiên đang dùng.
                        </p>
                      ) : (
                        <AdminSubmitButton
                          idleLabel="Lưu quyền"
                          pendingLabel="Đang lưu…"
                          className="min-h-11 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-black text-white disabled:cursor-wait disabled:opacity-60"
                        />
                      )}
                    </AdminMutationForm>
                  </article>
                );
              })}
            </div>
          ) : (
            <AdminEmptyState
              title="Chưa có profile"
              description="Chưa tìm thấy profile ứng dụng nào để phân quyền."
            />
          )}
        </AdminPanel>
      </Container>
    </main>
  );
}
