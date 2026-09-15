import type {AdminBlog} from '@/features/admin/blog';
import {
  createBlogPost,
  setBlogStatus,
  updateBlogPost
} from '@/app/admin/content/blog/actions';

type MediaOption = {id: string; label: string};
type Props = {
  blog?: AdminBlog;
  canCreate: boolean;
  canUpdate: boolean;
  canPublish: boolean;
  mediaOptions: MediaOption[];
};

const inputClass =
  'mt-1 w-full rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm disabled:bg-slate-50';

function bodyText(value: Record<string, unknown> | undefined) {
  return JSON.stringify(value ?? {}, null, 2);
}

export function BlogForm({blog, canCreate, canUpdate, canPublish, mediaOptions}: Props) {
  const editing = Boolean(blog);
  const canEdit = editing ? canUpdate : canCreate;
  const slugLocked = Boolean(blog?.publishedAt);

  return (
    <article className="rounded-3xl border border-[var(--nupsbox-border)] bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black tracking-[0.14em] text-[var(--nupsbox-blue)]">
            {blog?.status?.toUpperCase() ?? 'NEW DRAFT'}
          </p>
          <h2 className="mt-1 text-xl font-black text-[var(--nupsbox-navy)]">
            {blog?.vi.title || blog?.en.title || 'Tạo bài blog'}
          </h2>
          {blog?.publishedAt ? (
            <p className="mt-1 text-xs text-[var(--nupsbox-slate)]">Đã từng xuất bản — slug được khóa vĩnh viễn trong Phase 2.</p>
          ) : null}
        </div>

        {blog && canPublish && blog.status !== 'archived' ? (
          <form action={setBlogStatus}>
            <input type="hidden" name="id" value={blog.id} />
            <input type="hidden" name="target" value={blog.status === 'draft' ? 'published' : 'archived'} />
            <button className="rounded-full border border-[var(--nupsbox-blue)] px-4 py-2 text-sm font-bold text-[var(--nupsbox-blue)]">
              {blog.status === 'draft' ? 'Xuất bản' : 'Lưu trữ'}
            </button>
          </form>
        ) : null}
      </div>

      <form action={editing ? updateBlogPost : createBlogPost} className="space-y-5">
        {blog ? <input type="hidden" name="id" value={blog.id} /> : null}
        {slugLocked && blog ? <input type="hidden" name="slug" value={blog.slug} /> : null}
        <fieldset disabled={!canEdit} className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold md:col-span-2">
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
            Tiêu đề VI
            <input className={inputClass} name="titleVi" required defaultValue={blog?.vi.title ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Title EN
            <input className={inputClass} name="titleEn" required defaultValue={blog?.en.title ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Tóm tắt VI
            <textarea className={inputClass} name="excerptVi" rows={3} defaultValue={blog?.vi.excerpt ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Excerpt EN
            <textarea className={inputClass} name="excerptEn" rows={3} defaultValue={blog?.en.excerpt ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            Body VI (JSON)
            <textarea className={`${inputClass} font-mono`} name="bodyVi" rows={10} defaultValue={bodyText(blog?.vi.body)} />
          </label>
          <label className="text-sm font-semibold">
            Body EN (JSON)
            <textarea className={`${inputClass} font-mono`} name="bodyEn" rows={10} defaultValue={bodyText(blog?.en.body)} />
          </label>
          <label className="text-sm font-semibold">
            SEO title VI
            <input className={inputClass} name="seoTitleVi" defaultValue={blog?.vi.seoTitle ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            SEO title EN
            <input className={inputClass} name="seoTitleEn" defaultValue={blog?.en.seoTitle ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            SEO description VI
            <textarea className={inputClass} name="seoDescriptionVi" rows={3} defaultValue={blog?.vi.seoDescription ?? ''} />
          </label>
          <label className="text-sm font-semibold">
            SEO description EN
            <textarea className={inputClass} name="seoDescriptionEn" rows={3} defaultValue={blog?.en.seoDescription ?? ''} />
          </label>
          <label className="text-sm font-semibold md:col-span-2">
            Cover media
            <select className={inputClass} name="coverMediaId" defaultValue={blog?.coverMediaId ?? ''}>
              <option value="">Không chọn</option>
              {mediaOptions.map((option) => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </fieldset>

        {canEdit ? (
          <button className="rounded-full bg-[var(--nupsbox-blue)] px-5 py-2.5 text-sm font-black text-white">
            {editing ? 'Lưu nội dung' : 'Tạo bản nháp'}
          </button>
        ) : (
          <p className="text-sm text-[var(--nupsbox-slate)]">Tài khoản hiện tại chỉ có quyền xem.</p>
        )}
      </form>
    </article>
  );
}
