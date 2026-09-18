import {redirect} from 'next/navigation';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {AdminEmptyState} from '@/components/admin/admin-primitives';
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
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="FAQ CMS"
          title="FAQ song ngữ"
          description="FAQ mới luôn ở trạng thái nháp. Xuất bản là thao tác riêng và chỉ thành công khi đủ câu hỏi/câu trả lời VI và EN."
        />

        <div className="grid gap-5">
          {canCreate ? <FaqForm canEdit canPublish={false} /> : null}
          {faqs.length ? (
            faqs.map((faq) => (
              <FaqForm
                key={faq.id}
                faq={faq}
                canEdit={canUpdate}
                canPublish={canPublish}
              />
            ))
          ) : (
            <AdminEmptyState
              title="Chưa có FAQ"
              description="Chưa có FAQ nào trong cơ sở dữ liệu."
            />
          )}
        </div>
      </Container>
    </main>
  );
}
