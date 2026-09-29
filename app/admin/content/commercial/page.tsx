import {redirect} from 'next/navigation';
import {CommercialContentForm} from '@/components/admin/commercial-content-form';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {Container} from '@/components/ui/container';
import {listAdminCommercialBlocks} from '@/features/admin/commercial-content';
import {can} from '@/features/auth/permissions';
import {requireAdminUser} from '@/features/auth/require-admin-user';

export default async function AdminCommercialContentPage() {
  const session = await requireAdminUser();
  if (!can(session.role, 'content:read')) redirect('/admin');

  const blocks = await listAdminCommercialBlocks();
  const canEdit = can(session.role, 'content:update');

  return (
    <main className="py-8 sm:py-10">
      <Container className="grid gap-6">
        <AdminPageHeader
          eyebrow="COMMERCIAL CMS"
          title="Thông tin thương mại"
          description="Quản lý hồ sơ doanh nghiệp, dịch vụ, năng lực, CTA và SEO song ngữ. Các block/key được allowlist cố định để tránh biến CMS thành trình chỉnh sửa cấu hình tùy ý."
        />

        <div className="grid gap-5">
          {blocks.map((block) => (
            <CommercialContentForm key={block.blockKey} block={block} canEdit={canEdit} />
          ))}
        </div>
      </Container>
    </main>
  );
}
