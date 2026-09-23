'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export const ADMIN_UNSAVED_CHANGES_MESSAGE =
  'Bạn có thay đổi chưa lưu. Nếu rời trang bây giờ, nội dung vừa chỉnh sửa có thể bị mất.';

type AdminDraftProtectionContextValue = {
  hasUnsavedChanges: boolean;
  setDraftDirty: (draftId: string, dirty: boolean) => void;
  confirmDiscardChanges: () => boolean;
};

const AdminDraftProtectionContext = createContext<AdminDraftProtectionContextValue>({
  hasUnsavedChanges: false,
  setDraftDirty: () => undefined,
  confirmDiscardChanges: () => true
});

export function useAdminDraftProtection() {
  return useContext(AdminDraftProtectionContext);
}

export function AdminDraftProtectionProvider({children}: {children: ReactNode}) {
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(() => new Set());
  const hasUnsavedChanges = dirtyIds.size > 0;

  const setDraftDirty = useCallback((draftId: string, dirty: boolean) => {
    setDirtyIds((current) => {
      const alreadyDirty = current.has(draftId);
      if (alreadyDirty === dirty) return current;

      const next = new Set(current);
      if (dirty) next.add(draftId);
      else next.delete(draftId);
      return next;
    });
  }, []);

  const discardAllDraftFlags = useCallback(() => {
    setDirtyIds(new Set());
  }, []);

  const confirmDiscardChanges = useCallback(() => {
    if (!hasUnsavedChanges) return true;
    if (!window.confirm(ADMIN_UNSAVED_CHANGES_MESSAGE)) return false;
    discardAllDraftFlags();
    return true;
  }, [discardAllDraftFlags, hasUnsavedChanges]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = '';
    }

    function protectLinkNavigation(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:')) return;

      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      const sameDocument =
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search;

      if (sameDocument) return;

      if (window.confirm(ADMIN_UNSAVED_CHANGES_MESSAGE)) {
        discardAllDraftFlags();
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    window.addEventListener('beforeunload', beforeUnload);
    document.addEventListener('click', protectLinkNavigation, true);

    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      document.removeEventListener('click', protectLinkNavigation, true);
    };
  }, [discardAllDraftFlags, hasUnsavedChanges]);

  const value = useMemo(
    () => ({hasUnsavedChanges, setDraftDirty, confirmDiscardChanges}),
    [confirmDiscardChanges, hasUnsavedChanges, setDraftDirty]
  );

  return (
    <AdminDraftProtectionContext.Provider value={value}>
      {children}
      {hasUnsavedChanges ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-lg"
        >
          <p className="font-black">Có thay đổi chưa lưu</p>
          <p className="mt-1 text-xs leading-5">
            Hãy lưu nội dung trước khi rời trang. Hệ thống sẽ cảnh báo nếu bạn chuyển sang màn hình khác.
          </p>
        </div>
      ) : null}
    </AdminDraftProtectionContext.Provider>
  );
}
