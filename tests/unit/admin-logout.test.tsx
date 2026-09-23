import {cleanup, fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const signOut = vi.fn();
const replace = vi.fn();
const refresh = vi.fn();

vi.mock('@/lib/supabase/browser', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {signOut}
  })
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({replace, refresh})
}));

import {AdminLogoutButton} from '@/components/admin/admin-logout-button';

describe('admin logout', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    signOut.mockReset();
    replace.mockReset();
    refresh.mockReset();
  });

  it('signs out and returns the user to login', async () => {
    signOut.mockResolvedValue({error: null});
    render(<AdminLogoutButton />);

    fireEvent.click(screen.getByRole('button', {name: 'Đăng xuất'}));

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(replace).toHaveBeenCalledWith('/auth/login');
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('keeps the user in place and shows a safe error when sign out fails', async () => {
    signOut.mockResolvedValue({error: new Error('network')});
    render(<AdminLogoutButton />);

    fireEvent.click(screen.getByRole('button', {name: 'Đăng xuất'}));

    expect(await screen.findByRole('alert')).toHaveTextContent('Không thể đăng xuất');
    expect(replace).not.toHaveBeenCalled();
  });

  it('keeps an accessible name when the sidebar is collapsed', () => {
    render(<AdminLogoutButton collapsed />);
    expect(screen.getByRole('button', {name: 'Đăng xuất'})).toBeInTheDocument();
  });
});
