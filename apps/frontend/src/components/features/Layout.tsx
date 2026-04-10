import { Outlet } from "react-router-dom";

export function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-bold">Site des Planètes</h1>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        © Eleven Labs
      </footer>
    </div>
  );
}
