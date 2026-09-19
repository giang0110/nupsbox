import {
  cancelScheduledBlogPublication,
  createBlogPost,
  scheduleBlogPublication,
  setBlogStatus,
  updateBlogPost
} from '@/app/admin/content/blog/actions';
import {
  AdminActionBar,
  AdminFieldGroup,
  AdminPanel,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {getBlogPublicationState, type AdminBlog} from '@/features/admin/blog';

type MediaOption = {id: string; label: string};
type Props = {
  blog?: AdminBlog;
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  mediaOptions: MediaOption[];
};

const inputClass =
  'mt-1 min-h-11 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

const publicationDateTime = new Intl.DateTimeFormat('vi-VN', {
  timeZone: 'Asia/Ho_Chi_Minh',
  dateStyle: 'short',
  timeStyle: 'short'
});

function bodyText(value: Record<string, unknown> | undefined) {
  return JSON.stringify(value ?? {}, null, 2);
}

export function BlogForm({
  blog,
  canCreate,
  canUpdate,
  canPublish,
  mediaOptions
}: Props) {
  const editing = Boolean(blog);
  const canEdit = editing ? canUpdate : canCreate;
  const slugLocked = Boolean(blog?.publishedAt);
  const publicationState = blog ? getBlogPublicationState(blog) : null;
  const statusLabel = !blog
    ? 'Mới'
    : publicationState === 'scheduled'
      ? 'Đã lên lịch'
      : publicationState === 'published'
        ? 'Đã xuất bản'
        : publicationState === 'archived'
          ? 'Đã lưu trữ'
          : 'Bản nháp';
  const publishedAtLabel = blog?.publishedAt
    ? publicationDateTime.format(new Date(blog.publishedAt))
    : null;

  return (
    <AdminPanel
      title={blog?.vi.title || blog?.en.title || 'Tạo bài blog'}
      description={
        publicationState === 'scheduled'
          ? `Đã lên lịch lúc ${publishedAtLabel} (giờ TP.HCM). Bài chưa public trước thời điểm này; slug được khóa sau khi lên lịch.`
          : blog?.publishedAt
            ? 'Đã từng xuất bản — slug được khóa theo publication contract.'
            : undefined
      }
      actions={
        <AdminActionBar>
          <AdminStatusBadge
            label={statusLabel}
            tone={publicationState === 'published' ? 'success' : publicationState === 'scheduled' ? 'warning' : 'neutral'}
          />
          {publicationState === 'published' ? (
            <>
              <a
                href={'/blog/' + blog.slug}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
              >
                Xem bài VI ↗
              </a>
              <a
                href={'/en/blog/' + blog.slug}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
              >
                View EN ↗
              </a>
            </>
          ) : null}
          {blog?.sourceUrl ? (
            <a
              href={blog.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]"
            >
              Mở link giới thiệu ↗
            </a>
          ) : null}
          {blog && canPublish && publicationState === 'draft' ? (
            <>
              <form action={setBlogStatus}>
                <input type="hidden" name="id" value={blog.id} />
                <input type="hidden" name="target" value="published" />
                <button className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]">
                  Xuất bản ngay
                </button>
              </form>
              <form action={scheduleBlogPublication} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="id" value={blog.id} />
                <label className="text-xs font-bold text-[var(--nupsbox-slate)]">
                  Hẹn giờ TP.HCM
                  <input
                    className="mt-1 min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm text-[var(--nupsbox-navy)]"
                    type="datetime-local"
                    name="scheduledAt"
                    required
                  />
                </label>
                <button className="min-h-11 rounded-xl bg-[var(--nupsbox-navy)] px-4 text-sm font-bold text-white">
                  Lên lịch
                </button>
              </form>
            </>
          ) : null}
          {blog && canPublish && publicationState === 'scheduled' ? (
            <form action={cancelScheduledBlogPublication}>
              <input type="hidden" name="id" value={blog.id} />
              <button className="min-h-11 rounded-xl border border-amber-300 bg-amber-50 px-4 text-sm font-bold text-amber-900">
                Hủy lịch
              </button>
            </form>
          ) : null}
          {blog && canPublish && publicationState === 'published' ? (
            <form action={setBlogStatus}>
              <input type="hidden" name="id" value={blog.id} />
              <input type="hidden" name="target" value="archived" />
              <button className="min-h-11 rounded-xl border border-[var(--nupsbox-border)] px-4 text-sm font-bold text-[var(--nupsbox-navy)]">
                Lưu trữ
              </button>
            </form>
          ) : null}
        </AdminActionBar>
      }
    >
      <form action={editing ? updateBlogPost : createBlogPost} className="grid gap-6">
        {blog ? <input type="hidden" name="id" value={blog.id} /> : null}
        {slugLocked && blog ? <input type="hidden" name="slug" value={blog.slug} /> : null}

        <AdminFieldGroup legend="Định danh" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Slug
              <input
                className={inputClass}
                name="slug"
                required
                disabled={!canEdit || slugLocked}
                defaultValue={blog?.slug ?? ''}
              />
            </label>
            <label className="text-sm font-semibold">
              Cover media
              <select className={inputClass} name="coverMediaId" defaultValue={blog?.coverMediaId ?? ''}>
                <option value="">Không chọn</option>
                {mediaOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Link bài viết / nguồn giới thiệu
              <input
                className={inputClass}
                name="sourceUrl"
                type="url"
                defaultValue={blog?.sourceUrl ?? ''}
                placeholder="https://www.facebook.com/... hoặc https://..."
              />
              <span className="mt-1 block text-xs font-normal leading-5 text-[var(--nupsbox-slate)]">
                Tùy chọn. Dùng khi bài giới thiệu nằm trên Facebook, báo chí hoặc landing page bên ngoài.
              </span>
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="Tiếng Việt" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Tiêu đề VI
              <input className={inputClass} name="titleVi" required defaultValue={blog?.vi.title ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Tóm tắt VI
              <textarea className={inputClass} name="excerptVi" rows={3} defaultValue={blog?.vi.excerpt ?? ''} />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Body VI (JSON)
              <textarea className={inputClass + ' font-mono'} name="bodyVi" rows={10} defaultValue={bodyText(blog?.vi.body)} />
            </label>
            <label className="text-sm font-semibold">
              SEO title VI
              <input className={inputClass} name="seoTitleVi" defaultValue={blog?.vi.seoTitle ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              SEO description VI
              <textarea className={inputClass} name="seoDescriptionVi" rows={3} defaultValue={blog?.vi.seoDescription ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        <AdminFieldGroup legend="English" disabled={!canEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-semibold">
              Title EN
              <input className={inputClass} name="titleEn" required defaultValue={blog?.en.title ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              Excerpt EN
              <textarea className={inputClass} name="excerptEn" rows={3} defaultValue={blog?.en.excerpt ?? ''} />
            </label>
            <label className="text-sm font-semibold md:col-span-2">
              Body EN (JSON)
              <textarea className={inputClass + ' font-mono'} name="bodyEn" rows={10} defaultValue={bodyText(blog?.en.body)} />
            </label>
            <label className="text-sm font-semibold">
              SEO title EN
              <input className={inputClass} name="seoTitleEn" defaultValue={blog?.en.seoTitle ?? ''} />
            </label>
            <label className="text-sm font-semibold">
              SEO description EN
              <textarea className={inputClass} name="seoDescriptionEn" rows={3} defaultValue={blog?.en.seoDescription ?? ''} />
            </label>
          </div>
        </AdminFieldGroup>

        {canEdit ? (
          <button className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-blue)] px-5 text-sm font-black text-white">
            {editing ? 'Lưu nội dung' : 'Tạo bản nháp'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </AdminPanel>
  );
}
