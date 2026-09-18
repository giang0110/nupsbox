export type AdminActionResult =
  | {ok: true}
  | {ok: false; message: string};

export function adminActionFailure(message: string): AdminActionResult {
  return {ok: false, message};
}
