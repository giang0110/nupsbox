export function shouldUseI18nRouting(pathname: string) {
  return !(
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/auth' ||
    pathname.startsWith('/auth/')
  );
}
