import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDayStory(data: {
  name: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workBlocks: Array<{ category: string; startTime: string; endTime: string; description: string }>;
  department?: string;
}): string {
  const { name, checkIn, checkOut, workBlocks, department } = data;
  const firstName = name.split(" ")[0];

  if (!checkIn) {
    return `${firstName} hasn't checked in yet today — the day is still full of potential.`;
  }

  const checkInTime = formatTime(checkIn);
  const deepWork = workBlocks.filter((b) => b.category === "DEEP_WORK");
  const meetings = workBlocks.filter((b) => b.category === "MEETING");
  const totalBlocks = workBlocks.length;

  if (totalBlocks === 0) {
    return `${firstName} checked in at ${checkInTime} and is shaping their day in ${department ?? "the office"}.`;
  }

  if (checkOut) {
    const checkOutTime = formatTime(checkOut);
    if (deepWork.length > meetings.length) {
      return `${firstName} arrived at ${checkInTime} and spent the day deep in focused work — ${deepWork[0].description.toLowerCase()}. A productive, head-down day, wrapped up at ${checkOutTime}.`;
    } else if (meetings.length >= deepWork.length && meetings.length > 0) {
      return `${firstName} logged in at ${checkInTime} and navigated ${meetings.length} meeting${meetings.length > 1 ? "s" : ""} today, keeping the team aligned. Signed off at ${checkOutTime}.`;
    }
    return `${firstName} had a balanced day starting at ${checkInTime} across ${totalBlocks} work blocks, and signed off at ${checkOutTime}.`;
  }

  // Still working
  const currentBlock = workBlocks.find((b) => {
    const now = new Date();
    const [startH, startM] = b.startTime.split(":").map(Number);
    const [endH, endM] = b.endTime.split(":").map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= startH * 60 + startM && currentMinutes < endH * 60 + endM;
  });

  if (currentBlock) {
    const categoryLabel = {
      DEEP_WORK: "deeply focused on",
      MEETING: "in a meeting about",
      ADMIN: "handling",
      REST: "taking a break from",
    }[currentBlock.category] ?? "working on";

    return `${firstName} started the day at ${checkInTime} and is currently ${categoryLabel} ${currentBlock.description.toLowerCase()}.`;
  }

  return `${firstName} has been in since ${checkInTime}, powering through ${totalBlocks} blocks of work today.`;
}

export function getWorkdayProgress(): number {
  const now = new Date();
  const start = 9 * 60; // 9:00 AM in minutes
  const end = 17 * 60; // 5:00 PM in minutes
  const current = now.getHours() * 60 + now.getMinutes();
  const progress = ((current - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, progress));
}

export function timeToPercent(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;
  const dayStart = 9 * 60;
  const dayEnd = 17 * 60;
  return ((totalMinutes - dayStart) / (dayEnd - dayStart)) * 100;
}

export function getCurrentTimePercent(): number {
  const now = new Date();
  return timeToPercent(`${now.getHours()}:${now.getMinutes()}`);
}
