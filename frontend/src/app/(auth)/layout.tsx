// auth layout - minimal centered layout for auth pages

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  );
}
