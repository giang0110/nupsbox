import Link from 'next/link';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {AdminPageHeader} from '@/components/admin/admin-page-header';
import {
  AdminEmptyState,
  AdminPanel,
  AdminStatCard,
  AdminStatusBadge
} from '@/components/admin/admin-primitives';

describe('admin UI primitives', () => {
  it('renders a semantic page header with actions', () => {
    render(
      <AdminPageHeader
        eyebrow="CRM"
        title="Khách hàng tiềm năng"
        description="Theo dõi và xử lý lead."
        actions={<Link href="/admin/leads?view=pipeline">Pipeline</Link>}
      />
    );

    expect(
      screen.getByRole('heading', {level: 1, name: 'Khách hàng tiềm năng'})
    ).toBeInTheDocument();
    expect(screen.getByRole('link', {name: 'Pipeline'})).toBeInTheDocument();
  });

  it('renders status text and reusable operational surfaces', () => {
    render(
      <>
        <AdminStatCard label="Lead mới" value={8} />
        <AdminStatusBadge label="Mới" tone="info" />
        <AdminPanel title="Việc cần chú ý">Nội dung</AdminPanel>
        <AdminEmptyState title="Chưa có lead" description="Không có bản ghi phù hợp." />
      </>
    );

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Mới')).toBeInTheDocument();
    expect(screen.getByText('Mới')).toHaveTextContent('Mới');
    expect(screen.getByRole('heading', {name: 'Việc cần chú ý'})).toBeInTheDocument();
    expect(screen.getByText('Không có bản ghi phù hợp.')).toBeInTheDocument();
  });
});
