import {redirect} from 'next/navigation';
import {Container} from '@/components/ui/container';
import {getAdminContent, mediaAltCompleteness} from '@/features/admin/content';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminContentPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const includeSettings = can(session.role, 'settings:read');
  const content = await getAdminContent({includeSettings});
  const incompleteMedia = content.media.filter((row) => !mediaAltCompleteness({alt_vi: row.altVi, alt_en: row.altEn}).complete);

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">CONTENT QA</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">Nội dung & media</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">Rà soát nhanh FAQ song ngữ, alt text media và settings mà role hiện tại được phép xem.</p>
        </div>

        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <article className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-sm"><p className="text-sm font-bold text-[var(--nupsbox-slate)]">FAQ</p><p className="mt-3 text-4xl font-black text-[var(--nupsbox-navy)]">{content.faqs.length}</p></article>
          <article className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-sm"><p className="text-sm font-bold text-[var(--nupsbox-slate)]">Media</p><p className="mt-3 text-4xl font-black text-[var(--nupsbox-navy)]">{content.media.length}</p></article>
          <article className="rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-sm"><p className="text-sm font-bold text-[var(--nupsbox-slate)]">Media thiếu alt VI/EN</p><p className="mt-3 text-4xl font-black text-[var(--nupsbox-navy)]">{incompleteMedia.length}</p></article>
        </section>

        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--nupsbox-border)] px-6 py-5"><h2 className="text-xl font-black text-[var(--nupsbox-navy)]">FAQ song ngữ</h2></div>
          <div className="divide-y divide-[var(--nupsbox-border)]">
            {content.faqs.map((faq) => (
              <article key={faq.id} className="grid gap-4 p-6 lg:grid-cols-2">
                <div><p className="text-xs font-black tracking-[0.12em] text-[var(--nupsbox-blue)]">VI</p><h3 className="mt-2 font-black text-[var(--nupsbox-navy)]">{faq.questionVi || 'Thiếu câu hỏi VI'}</h3><p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{faq.answerVi || 'Thiếu câu trả lời VI'}</p></div>
                <div><p className="text-xs font-black tracking-[0.12em] text-[var(--nupsbox-blue)]">EN</p><h3 className="mt-2 font-black text-[var(--nupsbox-navy)]">{faq.questionEn || 'Missing EN question'}</h3><p className="mt-2 text-sm leading-6 text-[var(--nupsbox-slate)]">{faq.answerEn || 'Missing EN answer'}</p><p className="mt-3 text-xs font-bold text-[var(--nupsbox-slate)]">{faq.active ? 'Đang hiển thị' : 'Đang tắt'}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white shadow-sm">
          <div className="border-b border-[var(--nupsbox-border)] px-6 py-5"><h2 className="text-xl font-black text-[var(--nupsbox-navy)]">Media metadata</h2><p className="mt-2 text-sm text-[var(--nupsbox-slate)]">Ưu tiên xử lý các dòng báo “Thiếu alt” trước khi production.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[var(--nupsbox-surface)] text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]"><tr><th className="px-5 py-4">Path</th><th className="px-5 py-4">Category</th><th className="px-5 py-4">Alt VI</th><th className="px-5 py-4">Alt EN</th><th className="px-5 py-4">QA</th></tr></thead>
              <tbody>{content.media.map((media) => { const qa = mediaAltCompleteness({alt_vi: media.altVi, alt_en: media.altEn}); return <tr key={media.id} className="border-t border-[var(--nupsbox-border)]"><td className="max-w-xs break-all px-5 py-4 font-mono text-xs text-[var(--nupsbox-slate)]">{media.storagePath}</td><td className="px-5 py-4 text-[var(--nupsbox-slate)]">{media.category}</td><td className="px-5 py-4 text-[var(--nupsbox-slate)]">{media.altVi || '—'}</td><td className="px-5 py-4 text-[var(--nupsbox-slate)]">{media.altEn || '—'}</td><td className="px-5 py-4 font-bold text-[var(--nupsbox-navy)]">{qa.complete ? 'Đủ alt' : 'Thiếu alt'}</td></tr>; })}</tbody>
            </table>
          </div>
        </section>

        {includeSettings ? <section className="mt-8 rounded-[1.5rem] border border-[var(--nupsbox-border)] bg-white p-6 shadow-sm"><h2 className="text-xl font-black text-[var(--nupsbox-navy)]">Site settings</h2><div className="mt-4 flex flex-wrap gap-2">{content.settings.map((setting) => <span key={setting.key} className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-2 text-sm font-bold text-[var(--nupsbox-navy)]">{setting.key}{setting.isPublic ? ' · public' : ' · private'}</span>)}</div></section> : null}
      </Container>
    </main>
  );
}
