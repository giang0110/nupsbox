import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {
  AdminPanel,
  AdminStatCard,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';
import {Container} from '@/components/ui/container';
import {getAdminContent, mediaAltCompleteness} from '@/features/admin/content';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminContentPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const includeSettings = can(session.role, 'settings:read');
  const content = await getAdminContent({includeSettings});
  const incompleteMedia = content.media.filter(
    (row) => !mediaAltCompleteness({alt_vi: row.altVi, alt_en: row.altEn}).complete
  );

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="CONTENT QA"
          title="Nội dung & media"
          description="Rà soát nhanh FAQ song ngữ, alt text media và settings mà role hiện tại được phép xem."
        />

        <section aria-label="Chỉ số nội dung" className="grid gap-4 sm:grid-cols-3">
          <AdminStatCard label="FAQ" value={content.faqs.length} href="/admin/content/faq" />
          <AdminStatCard label="Media" value={content.media.length} href="/admin/content/media" />
          <AdminStatCard label="Media thiếu alt VI/EN" value={incompleteMedia.length} href="/admin/content/media" />
        </section>

        <AdminPanel title="FAQ song ngữ">
          <div className="divide-y divide-[var(--nupsbox-border)]">
            {content.faqs.map((faq) => (
              <article key={faq.id} className="grid gap-4 py-5 first:pt-0 last:pb-0 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-black tracking-[0.12em] text-[var(--nupsbox-blue)]">VI</p>
                  <h3 className="mt-2 font-black text-[var(--nupsbox-navy)]">
                    {faq.questionVi || 'Thiếu câu hỏi VI'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                    {faq.answerVi || 'Thiếu câu trả lời VI'}
                  </p>
                </div>
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-xs font-black tracking-[0.12em] text-[var(--nupsbox-blue)]">EN</p>
                    <AdminStatusBadge
                      label={faq.active ? 'Đang hiển thị' : 'Bản nháp'}
                      tone={faq.active ? 'success' : 'neutral'}
                    />
                  </div>
                  <h3 className="mt-2 font-black text-[var(--nupsbox-navy)]">
                    {faq.questionEn || 'Missing EN question'}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">
                    {faq.answerEn || 'Missing EN answer'}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel
          title="Media metadata"
          description="Ưu tiên xử lý các dòng báo “Thiếu alt” trước khi production."
        >
          <div data-admin-desktop-table className="hidden lg:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
                <tr>
                  <th className="px-4 py-3">Path</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Alt VI</th>
                  <th className="px-4 py-3">Alt EN</th>
                  <th className="px-4 py-3">QA</th>
                </tr>
              </thead>
              <tbody>
                {content.media.map((media) => {
                  const qa = mediaAltCompleteness({alt_vi: media.altVi, alt_en: media.altEn});
                  return (
                    <tr key={media.id} className="border-t border-[var(--nupsbox-border)]">
                      <td className="max-w-xs break-all px-4 py-4 font-mono text-xs text-[var(--nupsbox-slate)]">{media.storagePath}</td>
                      <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{media.category}</td>
                      <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{media.altVi || '—'}</td>
                      <td className="px-4 py-4 text-[var(--nupsbox-slate)]">{media.altEn || '—'}</td>
                      <td className="px-4 py-4">
                        <AdminStatusBadge
                          label={qa.complete ? 'Đủ alt' : 'Thiếu alt'}
                          tone={qa.complete ? 'success' : 'warning'}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div data-admin-mobile-list className="grid gap-3 lg:hidden">
            {content.media.map((media) => {
              const qa = mediaAltCompleteness({alt_vi: media.altVi, alt_en: media.altEn});
              return (
                <article key={media.id} className="rounded-xl border border-[var(--nupsbox-border)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="max-w-[75%] break-all font-mono text-xs text-[var(--nupsbox-navy)]">
                      {media.storagePath}
                    </p>
                    <AdminStatusBadge
                      label={qa.complete ? 'Đủ alt' : 'Thiếu alt'}
                      tone={qa.complete ? 'success' : 'warning'}
                    />
                  </div>
                  <p className="mt-2 text-sm text-[var(--nupsbox-slate)]">Category: {media.category}</p>
                  <p className="mt-3 text-sm text-[var(--nupsbox-navy)]">VI: {media.altVi || '—'}</p>
                  <p className="mt-1 text-sm text-[var(--nupsbox-navy)]">EN: {media.altEn || '—'}</p>
                </article>
              );
            })}
          </div>
        </AdminPanel>

        {includeSettings ? (
          <AdminPanel title="Site settings">
            <div className="flex flex-wrap gap-2">
              {content.settings.map((setting) => (
                <span
                  key={setting.key}
                  className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-2 text-sm font-bold text-[var(--nupsbox-navy)]"
                >
                  {setting.key} · {setting.isPublic ? 'public' : 'private'}
                </span>
              ))}
            </div>
          </AdminPanel>
        ) : null}
      </Container>
    </main>
  );
}
