import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import PublicLoading from '@/app/[locale]/loading';
import PublicError from '@/app/[locale]/error';
import AdminLoading from '@/app/admin/loading';
import AdminError from '@/app/admin/error';

afterEach(() => {
  cleanup();
  document.documentElement.lang = '';
});

describe('route resilience UI', () => {
  it('renders intentional public and admin loading states', () => {
    const publicView = render(<PublicLoading />);
    expect(publicView.container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
    publicView.unmount();

    const adminView = render(<AdminLoading />);
    expect(adminView.container.querySelector('[aria-busy="true"]')).toBeInTheDocument();
  });

  it('keeps public errors safe and retryable without exposing exception details', () => {
    document.documentElement.lang = 'vi';
    const reset = vi.fn();

    render(<PublicError error={new Error('database-password-leak')} reset={reset} />);

    expect(screen.getByRole('heading', {name: 'Trang này chưa tải được.'})).toBeInTheDocument();
    expect(screen.queryByText(/database-password-leak/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Thử lại'}));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('keeps admin errors safe and retryable without exposing exception details', () => {
    const reset = vi.fn();

    render(<AdminError error={new Error('service-role-secret')} reset={reset} />);

    expect(screen.getByRole('heading', {name: 'Không tải được nội dung quản trị.'})).toBeInTheDocument();
    expect(screen.queryByText(/service-role-secret/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', {name: 'Thử lại'}));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
