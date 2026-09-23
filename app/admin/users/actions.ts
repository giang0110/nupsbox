'use server';

import {revalidatePath} from 'next/cache';
import {
  adminMutationConflict,
  adminMutationFailure,
  adminMutationSuccess,
  type AdminMutationResult
} from '@/features/admin/action-result';
import {
  assertFreshAdminWrite,
  isStaleAdminWrite,
  requireExpectedUpdatedAt,
  STALE_ADMIN_WRITE
} from '@/features/admin/optimistic-concurrency';
import {prepareAdminUserAccessUpdate} from '@/features/admin/user-access';
import {requireAdminUser} from '@/features/auth/require-admin-user';
import {createSupabaseServerClient} from '@/lib/supabase/server';

async function recoverUserConflict(id: string): Promise<AdminMutationResult> {
  const supabase = await createSupabaseServerClient();
  const {data, error} = await supabase
    .from('profiles')
    .select('updated_at')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.updated_at) {
    return adminMutationFailure('Tài khoản này không còn profile quản trị. Hãy tải lại trang để đồng bộ dữ liệu.');
  }

  return adminMutationConflict(data.updated_at);
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as {message?: unknown}).message ?? '');
  }
  return '';
}

function isLastAdminError(error: unknown) {
  return errorMessage(error).includes('last_active_admin_required');
}

export async function updateAdminUserAccess(formData: FormData): Promise<AdminMutationResult> {
  const targetId = String(formData.get('targetUserId') ?? '');

  try {
    const session = await requireAdminUser();

    if (targetId === session.user.id) {
      return adminMutationFailure(
        'Không thể thay đổi role hoặc trạng thái của chính tài khoản đang đăng nhập. Hãy dùng một Admin khác để thực hiện thao tác này.'
      );
    }

    const {id, changes} = prepareAdminUserAccessUpdate(session.role, {
      id: targetId,
      fullName: String(formData.get('fullName') ?? ''),
      role: String(formData.get('role') ?? ''),
      active: String(formData.get('active') ?? '') === 'true'
    });
    const expectedUpdatedAt = requireExpectedUpdatedAt(formData.get('expectedUpdatedAt'));
    const supabase = await createSupabaseServerClient();

    const {data: current, error: currentError} = await supabase
      .from('profiles')
      .select('role, active, updated_at')
      .eq('id', id)
      .single();

    if (currentError) throw currentError;
    if (current.updated_at !== expectedUpdatedAt) {
      throw new Error(STALE_ADMIN_WRITE);
    }

    const removesActiveAdmin =
      current.role === 'admin' &&
      current.active &&
      (changes.role !== 'admin' || !changes.active);

    if (removesActiveAdmin) {
      const {count, error: countError} = await supabase
        .from('profiles')
        .select('id', {count: 'exact', head: true})
        .eq('role', 'admin')
        .eq('active', true)
        .neq('id', id);

      if (countError) throw countError;
      if ((count ?? 0) < 1) {
        return adminMutationFailure(
          'Không thể hạ quyền hoặc vô hiệu hóa Admin active cuối cùng. Hãy kích hoạt một Admin khác trước.'
        );
      }
    }

    const {data, error} = await supabase
      .from('profiles')
      .update(changes)
      .eq('id', id)
      .eq('updated_at', expectedUpdatedAt)
      .select('id')
      .maybeSingle();

    if (error) {
      if (isLastAdminError(error)) {
        return adminMutationFailure(
          'Không thể hạ quyền hoặc vô hiệu hóa Admin active cuối cùng. Hãy kích hoạt một Admin khác trước.'
        );
      }
      throw error;
    }

    assertFreshAdminWrite(data);
    revalidatePath('/admin');
    revalidatePath('/admin/users');
    revalidatePath('/admin/leads');
    return adminMutationSuccess();
  } catch (error) {
    if (isLastAdminError(error)) {
      return adminMutationFailure(
        'Không thể hạ quyền hoặc vô hiệu hóa Admin active cuối cùng. Hãy kích hoạt một Admin khác trước.'
      );
    }
    if (!isStaleAdminWrite(error)) throw error;
    return recoverUserConflict(targetId);
  }
}
