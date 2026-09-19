'use client';

import {useMemo, useState} from 'react';
import {bulkUpdateMediaAssets} from '@/app/admin/content/media/actions';
import type {AdminMedia} from '@/features/admin/media';

type Option = {id: string; label: string};

const inputClass =
  'min-h-11 rounded-xl border border-[var(--nupsbox-border)] bg-white px-3 py-2 text-sm';

export function MediaBulkManager({
  media,
  locationOptions
}: {
  media: AdminMedia[];
  locationOptions: Option[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const allSelected = media.length > 0 && selected.size === media.length;
  const selectedLabel = useMemo(() => selected.size + ' ảnh đã chọn', [selected]);

  function toggle(id: string) {
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(media.map(item => item.id)));
  }

  return (
    <section className="rounded-2xl border border-[var(--nupsbox-border)] bg-white shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--nupsbox-border)] px-5 py-4">
        <div>
          <h2 className="text-lg font-black text-[var(--nupsbox-navy)]">Bulk media</h2>
          <p className="mt-1 text-sm leading-6 text-[var(--nupsbox-slate)]">
            Chọn nhiều ảnh để đổi visibility, category hoặc location trong một lần.
          </p>
        </div>
        <span className="rounded-full bg-[var(--nupsbox-surface)] px-3 py-2 text-xs font-black text-[var(--nupsbox-navy)]">
          {selectedLabel}
        </span>
      </div>

      <form action={bulkUpdateMediaAssets} className="grid gap-4 p-5">
        <div className="max-h-64 overflow-y-auto rounded-xl border border-[var(--nupsbox-border)]">
          <div className="sticky top-0 flex items-center gap-3 border-b border-[var(--nupsbox-border)] bg-[var(--nupsbox-surface)] px-3 py-2">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              aria-label="Chọn tất cả media"
            />
            <strong className="text-xs uppercase tracking-[0.08em] text-[var(--nupsbox-slate)]">
              Chọn tất cả
            </strong>
          </div>
          {media.map(item => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 border-b border-[var(--nupsbox-border)] px-3 py-3 last:border-b-0"
            >
              <input
                type="checkbox"
                name="mediaIds"
                value={item.id}
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold text-[var(--nupsbox-navy)]">
                  {item.altVi || item.storagePath}
                </span>
                <span className="mt-0.5 block truncate text-xs text-[var(--nupsbox-slate)]">
                  {item.category} · {item.isPublic ? 'public' : 'private'} · {item.locationId ? 'đã gắn location' : 'chưa gắn location'}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-semibold">
            Hiển thị
            <select className={inputClass} name="bulkVisibility" defaultValue="keep">
              <option value="keep">Giữ nguyên</option>
              <option value="public">Chuyển public</option>
              <option value="private">Chuyển private</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Category
            <select className={inputClass} name="bulkCategory" defaultValue="keep">
              <option value="keep">Giữ nguyên</option>
              {['hero', 'location', 'unit', 'security', 'exterior', 'lifestyle', 'blog'].map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Location
            <select className={inputClass} name="bulkLocationId" defaultValue="__keep__">
              <option value="__keep__">Giữ nguyên</option>
              <option value="__clear__">Bỏ liên kết location</option>
              {locationOptions.map(option => (
                <option key={option.id} value={option.id}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="submit"
          disabled={selected.size === 0}
          className="min-h-11 w-fit rounded-xl bg-[var(--nupsbox-navy)] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Áp dụng cho ảnh đã chọn
        </button>
      </form>
    </section>
  );
}
