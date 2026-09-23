'use client';

import {
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition
} from 'react';
import {useRouter} from 'next/navigation';
import type {AdminMutationResult} from '@/features/admin/action-result';
import {useAdminDraftProtection} from '@/components/admin/admin-draft-protection';

type NativeAction = (formData: FormData) => void | Promise<void>;
type RecoverableAction = (formData: FormData) => Promise<AdminMutationResult>;

type Feedback =
  | Extract<AdminMutationResult, {ok: false}>
  | {kind: 'ready'; message: string};

const AdminMutationPendingContext = createContext(false);

export function useAdminMutationPending() {
  return useContext(AdminMutationPendingContext);
}

function adminFormSnapshot(form: HTMLFormElement) {
  const entries = Array.from(new FormData(form).entries())
    .filter(([name]) => name !== 'expectedUpdatedAt')
    .map(([name, value]) => [
      name,
      typeof value === 'string'
        ? 'text:' + value
        : ['file', value.name, value.size, value.type, value.lastModified].join(':')
    ]);

  return JSON.stringify(entries);
}

export function AdminMutationForm({
  action,
  recoverableAction,
  expectedUpdatedAt,
  className,
  children,
  validate,
  protectUnsavedChanges = true
}: {
  action?: NativeAction;
  recoverableAction?: RecoverableAction;
  expectedUpdatedAt?: string;
  className?: string;
  children: ReactNode;
  validate?: (form: HTMLFormElement) => boolean;
  protectUnsavedChanges?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [versionOverride, setVersionOverride] = useState<string | null>(null);
  const version = versionOverride ?? expectedUpdatedAt ?? '';
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pending, startTransition] = useTransition();
  const draftId = useId();
  const baselineRef = useRef<string | null>(null);
  const dirtyRef = useRef(false);
  const {setDraftDirty} = useAdminDraftProtection();

  useEffect(() => {
    const form = formRef.current;
    if (!protectUnsavedChanges || !form) return;

    baselineRef.current = adminFormSnapshot(form);
    dirtyRef.current = false;
    setDraftDirty(draftId, false);

    return () => setDraftDirty(draftId, false);
  }, [draftId, protectUnsavedChanges, setDraftDirty]);

  function applyDirtyState(nextDirty: boolean) {
    if (!protectUnsavedChanges || dirtyRef.current === nextDirty) return;
    dirtyRef.current = nextDirty;
    setDraftDirty(draftId, nextDirty);
  }

  function trackDraft(form: HTMLFormElement) {
    if (!protectUnsavedChanges) return;
    if (baselineRef.current === null) baselineRef.current = adminFormSnapshot(form);
    applyDirtyState(adminFormSnapshot(form) !== baselineRef.current);
  }

  function markSaved(form: HTMLFormElement) {
    if (!protectUnsavedChanges) return;
    baselineRef.current = adminFormSnapshot(form);
    applyDirtyState(false);
  }

  function nativeSubmit(event: FormEvent<HTMLFormElement>) {
    if (validate && !validate(event.currentTarget)) {
      event.preventDefault();
      return;
    }
    if (!event.currentTarget.reportValidity()) {
      event.preventDefault();
      return;
    }
    markSaved(event.currentTarget);
  }

  function recoverableSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (validate && !validate(form)) return;
    if (!form.reportValidity()) return;
    if (!recoverableAction) return;

    const formData = new FormData(form);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    if (submitter instanceof HTMLButtonElement && submitter.name) {
      formData.set(submitter.name, submitter.value);
    }

    setFeedback(null);
    startTransition(async () => {
      try {
        const result = await recoverableAction(formData);
        if (!result.ok) {
          setFeedback(result);
          return;
        }

        setFeedback(null);
        setVersionOverride(null);
        markSaved(form);
        if (result.redirectTo) {
          router.push(result.redirectTo);
          return;
        }
        router.refresh();
      } catch {
        setFeedback({
          ok: false,
          kind: 'error',
          message: 'Không thể lưu thay đổi lúc này. Dữ liệu bạn vừa nhập vẫn được giữ; vui lòng kiểm tra kết nối và thử lại.'
        });
      }
    });
  }

  const form = recoverableAction ? (
    <form
      ref={formRef}
      onSubmit={recoverableSubmit}
      onInput={(event) => trackDraft(event.currentTarget)}
      onChange={(event) => trackDraft(event.currentTarget)}
      className={className}
    >
      {version ? <input type="hidden" name="expectedUpdatedAt" value={version} /> : null}
      {children}
      {feedback ? (
        <div
          role={feedback.kind === 'error' ? 'alert' : 'status'}
          aria-live={feedback.kind === 'error' ? 'assertive' : 'polite'}
          className={
            feedback.kind === 'error'
              ? 'rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900'
              : feedback.kind === 'conflict'
                ? 'rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950'
                : 'rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950'
          }
        >
          <p className="font-black">
            {feedback.kind === 'conflict'
              ? 'Có thay đổi mới trên máy chủ'
              : feedback.kind === 'ready'
                ? 'Bản nhập của bạn đã được giữ'
                : 'Chưa thể lưu thay đổi'}
          </p>
          <p className="mt-1 leading-6">{feedback.message}</p>
          {feedback.kind === 'conflict' ? (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="min-h-10 rounded-xl border border-amber-300 bg-white px-3 text-xs font-black text-amber-950"
              >
                Tải bản mới
              </button>
              <button
                type="button"
                onClick={() => {
                  setVersionOverride(feedback.latestUpdatedAt);
                  setFeedback({
                    kind: 'ready',
                    message:
                      'Mốc phiên bản đã được cập nhật nhưng các trường bạn vừa nhập vẫn giữ nguyên. Hãy kiểm tra lại rồi bấm Lưu lần nữa; lần lưu tiếp theo có thể ghi đè các trường vừa được người khác thay đổi.'
                  });
                }}
                className="min-h-10 rounded-xl bg-amber-900 px-3 text-xs font-black text-white"
              >
                Giữ bản đang nhập
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </form>
  ) : (
    <form
      ref={formRef}
      action={action}
      onSubmit={nativeSubmit}
      onInput={(event) => trackDraft(event.currentTarget)}
      onChange={(event) => trackDraft(event.currentTarget)}
      className={className}
    >
      {children}
    </form>
  );

  return (
    <AdminMutationPendingContext.Provider value={pending}>
      {form}
    </AdminMutationPendingContext.Provider>
  );
}
