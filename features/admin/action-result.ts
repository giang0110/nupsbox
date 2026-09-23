export type AdminActionResult =
  | {ok: true}
  | {ok: false; message: string};

export function adminActionFailure(message: string): AdminActionResult {
  return {ok: false, message};
}


export type AdminMutationResult =
  | {ok: true; redirectTo?: string}
  | {
      ok: false;
      kind: 'conflict';
      message: string;
      latestUpdatedAt: string;
    }
  | {
      ok: false;
      kind: 'error';
      message: string;
    };

export function adminMutationSuccess(redirectTo?: string): AdminMutationResult {
  return redirectTo ? {ok: true, redirectTo} : {ok: true};
}

export function adminMutationConflict(latestUpdatedAt: string): AdminMutationResult {
  return {
    ok: false,
    kind: 'conflict',
    latestUpdatedAt,
    message:
      'Bản ghi đã được thay đổi ở nơi khác. Nội dung bạn vừa nhập vẫn được giữ trên màn hình.'
  };
}

export function adminMutationFailure(message: string): AdminMutationResult {
  return {ok: false, kind: 'error', message};
}
