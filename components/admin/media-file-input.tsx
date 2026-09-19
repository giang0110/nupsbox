'use client';

const MAX_BYTES = 8 * 1024 * 1024;

export function MediaFileInput({className}: {className: string}) {
  return (
    <input
      className={className}
      name="file"
      type="file"
      accept="image/jpeg,image/png,image/webp,image/avif"
      required
      onChange={(event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        if (!file) {
          input.setCustomValidity('');
          return;
        }

        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type);
        if (!allowed) {
          input.setCustomValidity('Chỉ hỗ trợ JPG, PNG, WebP hoặc AVIF.');
        } else if (file.size > MAX_BYTES) {
          input.setCustomValidity('Ảnh vượt quá giới hạn 8 MB.');
        } else {
          input.setCustomValidity('');
        }
      }}
    />
  );
}
