import Image from 'next/image';
import {ImageIcon, Link2, Trash2} from 'lucide-react';
import {
  createMediaEditorialLink,
  deleteMediaEditorialLink
} from '@/app/admin/content/media/editorial-actions';
import {AdminPanel, AdminStatusBadge} from '@/components/admin/admin-primitives';
import type {AdminBlog} from '@/features/admin/blog';
import type {AdminMedia} from '@/features/admin/media';
import type {AdminMediaEditorialLink} from '@/features/admin/media-editorial';

const solutionOptions = [
  {key: 'shop-online', label: 'Giải pháp · Shop online'},
  {key: 'small-business', label: 'Giải pháp · Doanh nghiệp nhỏ'},
  {key: 'inventory', label: 'Giải pháp · Hàng tồn'},
  {key: 'personal', label: 'Giải pháp · Cá nhân'}
] as const;

const topicOptions = [
  {key: 'space-planning', label: 'Chủ đề · Chọn diện tích'},
  {key: 'ecommerce', label: 'Chủ đề · Shop online'},
  {key: 'inventory', label: 'Chủ đề · Tồn kho'},
  {key: 'business', label: 'Chủ đề · Doanh nghiệp'},
  {key: 'personal', label: 'Chủ đề · Cá nhân'}
] as const;

function weakAlt(item: AdminMedia | undefined) {
  if (!item) return true;
  const vi = item.altVi.trim().toLowerCase();
  const en = item.altEn.trim().toLowerCase();
  const generic = new Set(['nupsbox', 'nupsbox storage']);
  return vi.length < 10 || en.length < 10 || generic.has(vi) || generic.has(en);
}

function contextLabel(link: AdminMediaEditorialLink, blogs: AdminBlog[]) {
  if (link.contextType === 'solution') {
    return solutionOptions.find(option => option.key === link.contextKey)?.label ?? link.contextKey;
  }
  if (link.contextType === 'topic') {
    return topicOptions.find(option => option.key === link.contextKey)?.label ?? link.contextKey;
  }
  const blog = blogs.find(item => item.slug === link.contextKey);
  return blog ? 'Blog · ' + blog.vi.title : 'Blog · ' + link.contextKey;
}

export function MediaEditorialManager({
  media,
  links,
  blogs,
  canEdit
}: {
  media: AdminMedia[];
  links: AdminMediaEditorialLink[];
  blogs: AdminBlog[];
  canEdit: boolean;
}) {
  const mediaById = new Map(media.map(item => [item.id, item]));
  const usableMedia = media.filter(item => item.publicUrl);

  return (
    <AdminPanel
      title="Editorial Media Mapping"
      description="Gán ảnh thật vào Blog, Solution hoặc chủ đề. Public site chỉ hiển thị mapping khi asset vẫn đang ở trạng thái Công khai."
      actions={<AdminStatusBadge label={links.length + ' mapping'} tone={links.length ? 'success' : 'neutral'} />}
    >
      {canEdit ? (
        <form action={createMediaEditorialLink} className="grid gap-3 rounded-2xl border border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] p-4 lg:grid-cols-[1.35fr_1.35fr_.7fr_.55fr_auto] lg:items-end">
          <label className="text-xs font-bold text-[var(--nupsbox-slate)]">
            Ảnh
            <select name="mediaId" required className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]">
              <option value="">Chọn ảnh…</option>
              {usableMedia.map(item => (
                <option key={item.id} value={item.id}>
                  {(item.altVi || item.storagePath) + ' · ' + item.category + (item.isPublic ? ' · public' : ' · private')}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs font-bold text-[var(--nupsbox-slate)]">
            Đích sử dụng
            <select name="context" required className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]">
              <option value="">Chọn ngữ cảnh…</option>
              <optgroup label="Solution">
                {solutionOptions.map(option => (
                  <option key={option.key} value={'solution:' + option.key}>{option.label}</option>
                ))}
              </optgroup>
              <optgroup label="Blog">
                {blogs.map(blog => (
                  <option key={blog.id} value={'blog:' + blog.slug}>Blog · {blog.vi.title}</option>
                ))}
              </optgroup>
              <optgroup label="Topic">
                {topicOptions.map(option => (
                  <option key={option.key} value={'topic:' + option.key}>{option.label}</option>
                ))}
              </optgroup>
            </select>
          </label>

          <label className="text-xs font-bold text-[var(--nupsbox-slate)]">
            Vai trò
            <select name="role" defaultValue="gallery" className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]">
              <option value="feature">Feature</option>
              <option value="inline">Inline</option>
              <option value="gallery">Gallery</option>
            </select>
          </label>

          <label className="text-xs font-bold text-[var(--nupsbox-slate)]">
            Thứ tự
            <input name="sortOrder" type="number" defaultValue={0} className="mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 text-sm text-[var(--nupsbox-navy)]" />
          </label>

          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--nupsbox-blue)] px-4 text-sm font-black text-white">
            <Link2 size={16} aria-hidden="true" />
            Gán ảnh
          </button>
        </form>
      ) : (
        <p className="rounded-xl bg-[var(--nupsbox-surface)] px-4 py-3 text-sm text-[var(--nupsbox-slate)]">
          Tài khoản hiện tại chỉ có quyền xem mapping.
        </p>
      )}

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {links.length ? links.map(link => {
          const item = mediaById.get(link.mediaId);
          return (
            <article key={link.id} className="grid grid-cols-[88px_1fr] overflow-hidden rounded-2xl border border-[var(--nupsbox-border)] bg-white">
              <div className="relative min-h-24 bg-[var(--nupsbox-surface)]">
                {item?.publicUrl ? (
                  <Image src={item.publicUrl} alt="" fill sizes="88px" className="object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-[var(--nupsbox-muted)]">
                    <ImageIcon size={20} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <AdminStatusBadge label={link.role} tone="neutral" />
                  <AdminStatusBadge
                    label={item?.isPublic ? 'Public' : 'Private'}
                    tone={item?.isPublic ? 'success' : 'warning'}
                  />
                  {weakAlt(item) ? <AdminStatusBadge label="Alt yếu" tone="warning" /> : null}
                </div>
                <p className="mt-2 truncate text-sm font-black text-[var(--nupsbox-navy)]">
                  {contextLabel(link, blogs)}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-[var(--nupsbox-slate)]">
                  {item?.altVi || item?.storagePath || link.mediaId}
                </p>
                {weakAlt(item) ? (
                  <p className="mt-1 text-xs font-bold text-amber-700">
                    Nên sửa alt VI/EN theo đúng nội dung ảnh trước khi dùng rộng rãi.
                  </p>
                ) : null}
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-[var(--nupsbox-muted)]">sort {link.sortOrder}</span>
                  {canEdit ? (
                    <form action={deleteMediaEditorialLink}>
                      <input type="hidden" name="id" value={link.id} />
                      <button className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-red-200 px-2.5 text-xs font-black text-red-700">
                        <Trash2 size={14} aria-hidden="true" />
                        Gỡ
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          );
        }) : (
          <p className="lg:col-span-2 rounded-xl border border-dashed border-[var(--nupsbox-border)] p-5 text-sm text-[var(--nupsbox-slate)]">
            Chưa có editorial mapping. Public site sẽ tiếp tục dùng visual cover dự phòng.
          </p>
        )}
      </div>
    </AdminPanel>
  );
}
