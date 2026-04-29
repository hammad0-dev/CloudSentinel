import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-[#e2e8f0]">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
}
