import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {expect, it, vi} from 'vitest';

const {replaceMock} = vi.hoisted(() => ({replaceMock: vi.fn()}));

vi.mock('next-intl', () => ({
  useLocale: () => 'vi'
}));

vi.mock('@/i18n/navigation', () => ({
  usePathname: () => '/kho-mini/[slug]',
  useRouter: () => ({replace: replaceMock})
}));

vi.mock('next/navigation', () => ({
  useParams: () => ({slug: 'kho-mini-s'})
}));

import {LocaleSwitcher} from '@/components/marketing/locale-switcher';

it('preserves dynamic route params when switching locale', async () => {
  const user = userEvent.setup();
  render(<LocaleSwitcher />);

  await user.click(screen.getByRole('button', {name: 'Switch to English'}));

  expect(replaceMock).toHaveBeenCalledWith(
    {
      pathname: '/kho-mini/[slug]',
      params: {slug: 'kho-mini-s'}
    },
    {locale: 'en'}
  );
});
