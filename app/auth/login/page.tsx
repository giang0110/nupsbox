import {LoginForm} from './login-form';

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--nupsbox-surface)] px-5 py-12">
      <section className="w-full max-w-md rounded-3xl border border-[var(--nupsbox-border)] bg-white p-7 shadow-[var(--nupsbox-shadow)] sm:p-10">
        <p className="text-sm font-black tracking-[0.16em] text-[var(--nupsbox-blue)]">NUPSBOX ADMIN</p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--nupsbox-navy)]">Đăng nhập quản trị</h1>
        <LoginForm />
      </section>
    </main>
  );
}
