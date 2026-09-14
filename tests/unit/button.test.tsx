import {render, screen} from '@testing-library/react';
import {expect, it} from 'vitest';
import {Button} from '@/components/ui/button';

it('renders a primary action with accessible text', () => {
  render(<Button>Nhận báo giá</Button>);
  expect(screen.getByRole('button', {name: 'Nhận báo giá'})).toBeVisible();
});
