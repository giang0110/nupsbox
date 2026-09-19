import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />
}));

import {WarehouseGallery} from '@/components/marketing/warehouse-gallery';

afterEach(() => cleanup());

const items = [
  {id: '1', url: 'https://example.com/1.jpg', alt: 'Ảnh kho 1', category: 'location', sortOrder: 10},
  {id: '2', url: 'https://example.com/2.jpg', alt: 'Ảnh kho 2', category: 'security', sortOrder: 20}
];

describe('warehouse gallery', () => {
  it('renders nothing when no public media exists', () => {
    const {container} = render(<WarehouseGallery locale="vi" items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('switches the primary image from thumbnails and controls', () => {
    render(<WarehouseGallery locale="vi" items={items} />);

    expect(screen.getByRole('img', {name: 'Ảnh kho 1'})).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Ảnh tiếp theo'}));
    expect(screen.getByRole('img', {name: 'Ảnh kho 2'})).toBeInTheDocument();
    expect(screen.getByText('2 ảnh đã được công bố')).toBeInTheDocument();
  });
});
