import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {
  AdminDraftProtectionProvider,
  ADMIN_UNSAVED_CHANGES_MESSAGE
} from '@/components/admin/admin-draft-protection';
import {AdminMutationForm} from '@/components/admin/admin-mutation-form';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn()
  })
}));

function source(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8');
}

function DraftHarness() {
  return (
    <AdminDraftProtectionProvider>
      <AdminMutationForm>
        <label>
          Tiêu đề
          <input aria-label="Tiêu đề" name="title" defaultValue="Ban đầu" />
        </label>
      </AdminMutationForm>
      <a href="https://example.com/leave-admin">Rời trang</a>
    </AdminDraftProtectionProvider>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('P3.48 admin draft protection and unsaved changes UX', () => {
  it('marks real edits dirty and clears the warning when values are reverted', () => {
    render(<DraftHarness />);
    const input = screen.getByLabelText('Tiêu đề');

    expect(screen.queryByText('Có thay đổi chưa lưu')).not.toBeInTheDocument();

    fireEvent.input(input, {target: {value: 'Đã sửa'}});
    expect(screen.getByText('Có thay đổi chưa lưu')).toBeInTheDocument();

    fireEvent.input(input, {target: {value: 'Ban đầu'}});
    expect(screen.queryByText('Có thay đổi chưa lưu')).not.toBeInTheDocument();
  });

  it('blocks same-window navigation when the admin keeps the current draft', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(<DraftHarness />);

    fireEvent.input(screen.getByLabelText('Tiêu đề'), {target: {value: 'Đã sửa'}});
    const link = screen.getByRole('link', {name: 'Rời trang'});
    const event = new MouseEvent('click', {bubbles: true, cancelable: true});

    link.dispatchEvent(event);

    expect(confirm).toHaveBeenCalledWith(ADMIN_UNSAVED_CHANGES_MESSAGE);
    expect(event.defaultPrevented).toBe(true);
  });

  it('protects refresh and tab close while a draft is dirty', () => {
    render(<DraftHarness />);
    fireEvent.input(screen.getByLabelText('Tiêu đề'), {target: {value: 'Đã sửa'}});

    const event = new Event('beforeunload', {cancelable: true});
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  it('covers the long-form editors that previously bypassed AdminMutationForm', () => {
    const blog = source('components/admin/blog-form.tsx');
    const media = source('components/admin/media-upload-form.tsx');
    const logout = source('components/admin/admin-logout-button.tsx');
    const mutation = source('components/admin/admin-mutation-form.tsx');

    expect(blog).toContain('AdminMutationForm');
    expect(blog).toContain('action={editing ? updateBlogPost : createBlogPost}');
    expect(media).toContain('AdminMutationForm');
    expect(media).toContain('action={uploadMediaAsset}');
    expect(logout).toContain('confirmDiscardChanges');
    expect(mutation).toContain("name !== 'expectedUpdatedAt'");
    expect(mutation).toContain('adminFormSnapshot(form) !== baselineRef.current');
  });
});
