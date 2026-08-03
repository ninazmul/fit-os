import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import BottomNav from "@/components/navigation/BottomNav";
import TopNavbar from "@/components/navigation/TopNavbar";
import AddToHomeScreen from "@/components/shared/AddToHomeScreen";
import { Toaster } from "react-hot-toast";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { seedFoods } from "@/lib/actions/food.actions";

export const dynamic = "force-dynamic";

export default async function FitOSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  try {
    await seedFoods();
  } catch (err) {
    console.error("Auto seed error:", err);
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <DesktopSidebar />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen pb-20 md:pb-6">
        <TopNavbar />
        <Toaster position="top-center" />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <BottomNav />
      <AddToHomeScreen />
    </div>
  );
}
