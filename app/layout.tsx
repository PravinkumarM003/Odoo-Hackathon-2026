import type { Metadata } from "next";
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
    <html lang="en" className="dark">
      <body className="bg-animated min-h-screen antialiased">{children}</body>
    </html>
  );
}
