import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { AnimatedBackground } from "@/components/Animations";
import { ThemeProvider } from "@/components/ThemeProvider";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-neutral-950 min-h-screen antialiased text-neutral-200 font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AnimatedBackground />
          <ClientLayout>{children}</ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
