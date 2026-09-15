import {redirect} from 'next/navigation';
import {FaqForm} from '@/components/admin/faq-form';
import {Container} from '@/components/ui/container';
import {listAdminFaqs} from '@/features/admin/faqs';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminFaqPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const faqs = await listAdminFaqs();
  const canCreate = can(session.role, 'content:create');
  const canUpdate = can(session.role, 'content:update');
  const canPublish = can(session.role, 'content:publish');

  return (
    <main className="py-10 sm:py-14">
      <Container>
        <div className="max-w-3xl">
          <p className="text-xs font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">FAQ CMS</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.045em] text-[var(--nupsbox-navy)] sm:text-5xl">FAQ song ngữ</h1>
          <p className="mt-4 leading-7 text-[var(--nupsbox-slate)]">
            FAQ mới luôn ở trạng thái nháp. Xuất bản là thao tác riêng và chỉ thành công khi đủ câu hỏi/câu trả lời VI và EN.
          </p>
        </div>

        <div className="mt-10 grid gap-5">
          {canCreate ? <FaqForm canEdit canPublish={false} /> : null}
          {faqs.map((faq) => (
            <FaqForm
              key={faq.id}
              faq={faq}
              canEdit={canUpdate}
              canPublish={canPublish}
            />
          ))}
        </div>
      </Container>
    </main>
  );
}
