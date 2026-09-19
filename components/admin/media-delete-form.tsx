'use client';

import {useActionState} from 'react';
import {Trash2} from 'lucide-react';
import {deleteMediaAsset, type DeleteMediaState} from '@/app/admin/content/media/actions';

const initialState: DeleteMediaState = {status: 'idle'};

export function MediaDeleteForm({
  mediaId,
  label
}: {
  mediaId: string;
  label: string;
}) {
  const [state, action, pending] = useActionState(deleteMediaAsset, initialState);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(`Xoá vĩnh viễn ảnh “${label}”? File trong Storage và metadata sẽ bị xoá. Hành động này không thể hoàn tác.`)) {
          event.preventDefault();
        }
      }}
      className="grid gap-2"
    >
      <input type="hidden" name="id" value={mediaId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 size={16} aria-hidden="true" />
        {pending ? 'Đang xoá…' : 'Xoá ảnh'}
      </button>
      {state.status === 'error' ? (
        <p role="alert" className="max-w-xl text-sm leading-6 text-red-700">{state.message}</p>
      ) : null}
    </form>
  );
}
