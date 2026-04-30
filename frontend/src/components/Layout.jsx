import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen app-shell">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
