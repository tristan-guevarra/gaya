import Navbar from '@/components/shared/Navbar';

export default function EventLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-16">{children}</main>
    </>
  );
}
