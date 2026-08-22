import type { Metadata } from "next";
import { AnimatedBackground } from "@/components/Animations";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayflow — Every Workday, Perfectly Aligned",
  description:
    "Dayflow is an intelligent HRMS that turns attendance, leave, and work activity into a living, narrated story of the employee's workday.",
  keywords: ["HRMS", "HR Management", "Attendance", "Leave Management", "Payroll"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-neutral-950 min-h-screen antialiased text-neutral-200">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AnimatedBackground />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
