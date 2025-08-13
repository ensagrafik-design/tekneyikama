import { CrewNavigation } from "@/components/layout/crew-navigation";

export default function CrewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CrewNavigation />
      <main>
        {children}
      </main>
    </div>
  );
}