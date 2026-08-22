import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DAYFLOW database...");

  // Clear existing data in order
  await prisma.notification.deleteMany();
  await prisma.workBlock.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.payroll.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo@123", 12);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ─── Users & Employees ────────────────────────────────────────────────────

  const hrUser = await prisma.user.create({
    data: {
      employeeId: "EMP001",
      email: "hr@dayflow.demo",
      passwordHash,
      role: "HR",
      name: "Sarah Mitchell",
      employee: {
        create: {
          department: "Human Resources",
          designation: "HR Manager",
          phone: "+1-555-0101",
          address: "123 Corporate Ave, Suite 400",
          photoUrl: null,
        },
      },
    },
  });

  const emp1 = await prisma.user.create({
    data: {
      employeeId: "EMP002",
      email: "employee@dayflow.demo",
      passwordHash,
      role: "EMPLOYEE",
      name: "Alex Chen",
      employee: {
        create: {
          department: "Engineering",
          designation: "Senior Software Engineer",
          phone: "+1-555-0102",
          address: "456 Tech Street, Apt 7B",
          photoUrl: null,
        },
      },
    },
  });

  const emp2 = await prisma.user.create({
    data: {
      employeeId: "EMP003",
      email: "priya.sharma@dayflow.demo",
      passwordHash,
      role: "EMPLOYEE",
      name: "Priya Sharma",
      employee: {
        create: {
          department: "Design",
          designation: "UI/UX Lead",
          phone: "+1-555-0103",
          address: "789 Creative Blvd",
          photoUrl: null,
        },
      },
    },
  });

  const emp3 = await prisma.user.create({
    data: {
      employeeId: "EMP004",
      email: "james.wilson@dayflow.demo",
      passwordHash,
      role: "EMPLOYEE",
      name: "James Wilson",
      employee: {
        create: {
          department: "Product",
          designation: "Product Manager",
          phone: "+1-555-0104",
          address: "321 Agile Lane",
          photoUrl: null,
        },
      },
    },
  });

  const emp4 = await prisma.user.create({
    data: {
      employeeId: "EMP005",
      email: "maya.patel@dayflow.demo",
      passwordHash,
      role: "EMPLOYEE",
      name: "Maya Patel",
      employee: {
        create: {
          department: "Engineering",
          designation: "DevOps Engineer",
          phone: "+1-555-0105",
          address: "654 Infrastructure Dr",
          photoUrl: null,
        },
      },
    },
  });

  const emp5 = await prisma.user.create({
    data: {
      employeeId: "EMP006",
      email: "david.lee@dayflow.demo",
      passwordHash,
      role: "EMPLOYEE",
      name: "David Lee",
      employee: {
        create: {
          department: "Sales",
          designation: "Sales Executive",
          phone: "+1-555-0106",
          address: "987 Commerce St",
          photoUrl: null,
        },
      },
    },
  });

  const emp6 = await prisma.user.create({
    data: {
      employeeId: "EMP007",
      email: "nina.kowalski@dayflow.demo",
      passwordHash,
      role: "EMPLOYEE",
      name: "Nina Kowalski",
      employee: {
        create: {
          department: "Finance",
          designation: "Financial Analyst",
          phone: "+1-555-0107",
          address: "246 Balance Sheet Rd",
          photoUrl: null,
        },
      },
    },
  });

  const allUsers = [hrUser, emp1, emp2, emp3, emp4, emp5, emp6];

  console.log(`✅ Created ${allUsers.length} users`);

  // ─── Payroll ──────────────────────────────────────────────────────────────

  const payrollData = [
    { userId: hrUser.id, basic: 95000, allowances: 18000, deductions: 12000 },
    { userId: emp1.id, basic: 120000, allowances: 24000, deductions: 18000 },
    { userId: emp2.id, basic: 105000, allowances: 20000, deductions: 15500 },
    { userId: emp3.id, basic: 110000, allowances: 22000, deductions: 16500 },
    { userId: emp4.id, basic: 115000, allowances: 23000, deductions: 17500 },
    { userId: emp5.id, basic: 85000, allowances: 15000, deductions: 11000 },
    { userId: emp6.id, basic: 90000, allowances: 16000, deductions: 12500 },
  ];

  for (const p of payrollData) {
    await prisma.payroll.create({
      data: {
        employeeId: p.userId,
        basic: p.basic,
        allowances: p.allowances,
        deductions: p.deductions,
        netSalary: p.basic + p.allowances - p.deductions,
      },
    });
  }

  console.log("✅ Created payroll records");

  // ─── Attendance — last 14 days ────────────────────────────────────────────

  const attendanceUsers = [hrUser, emp1, emp2, emp3, emp4, emp5, emp6];

  for (const user of attendanceUsers) {
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      if (isWeekend) continue;

      // Today: leave today without checkout to simulate live scenario for some
      const isToday = i === 0;

      const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
      const checkInMin = Math.floor(Math.random() * 45);
      const checkIn = new Date(date);
      checkIn.setHours(checkInHour, checkInMin, 0, 0);

      let checkOut: Date | null = null;
      let status = "PRESENT";

      if (!isToday || user.id !== emp4.id) {
        const checkOutHour = 17 + Math.floor(Math.random() * 2);
        const checkOutMin = Math.floor(Math.random() * 45);
        checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMin, 0, 0);
      }

      // Occasionally absent
      if (Math.random() < 0.05 && !isToday) {
        status = "ABSENT";
        await prisma.attendance.create({
          data: {
            employeeId: user.id,
            date,
            status,
          },
        });
        continue;
      }

      await prisma.attendance.create({
        data: {
          employeeId: user.id,
          date,
          checkIn,
          checkOut,
          status,
        },
      });
    }
  }

  console.log("✅ Created attendance records");

  // ─── Leave Requests ───────────────────────────────────────────────────────

  const leaveTypes = ["Annual", "Sick", "Personal", "Maternity", "Emergency"];

  // Approved leaves
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp1.id,
      type: "Annual",
      startDate: new Date(today.getFullYear(), today.getMonth() - 1, 10),
      endDate: new Date(today.getFullYear(), today.getMonth() - 1, 12),
      remarks: "Family vacation",
      status: "APPROVED",
      reviewerComment: "Approved. Enjoy your vacation!",
      reviewedBy: hrUser.id,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: emp2.id,
      type: "Sick",
      startDate: new Date(today.getFullYear(), today.getMonth(), 3),
      endDate: new Date(today.getFullYear(), today.getMonth(), 3),
      remarks: "Doctor appointment",
      status: "APPROVED",
      reviewerComment: "Get well soon!",
      reviewedBy: hrUser.id,
    },
  });

  // Pending leaves for demo
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp3.id,
      type: "Annual",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      remarks: "Conference attendance — TechConf 2024",
      status: "PENDING",
    },
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: emp5.id,
      type: "Personal",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      remarks: "Personal appointment",
      status: "PENDING",
    },
  });

  // Rejected
  await prisma.leaveRequest.create({
    data: {
      employeeId: emp6.id,
      type: "Annual",
      startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
      endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
      remarks: "Extended weekend",
      status: "REJECTED",
      reviewerComment: "Quarter-end crunch period. Please reschedule.",
      reviewedBy: hrUser.id,
    },
  });

  console.log("✅ Created leave requests");

  // ─── WorkBlocks — Today ──────────────────────────────────────────────────

  const workBlockTemplates: Record<
    string,
    Array<{ start: string; end: string; cat: string; desc: string }>
  > = {
    [hrUser.id]: [
      { start: "09:00", end: "10:00", cat: "DEEP_WORK", desc: "Reviewing Q4 HR policy updates and compliance documentation" },
      { start: "10:00", end: "11:00", cat: "MEETING", desc: "Team standup and weekly HR sync with department heads" },
      { start: "11:00", end: "12:30", cat: "ADMIN", desc: "Processing leave requests and updating employee records" },
      { start: "12:30", end: "13:30", cat: "REST", desc: "Lunch break" },
      { start: "13:30", end: "15:30", cat: "DEEP_WORK", desc: "Drafting new onboarding checklist and performance review templates" },
      { start: "15:30", end: "16:30", cat: "MEETING", desc: "1:1 performance review sessions with team leads" },
      { start: "16:30", end: "17:00", cat: "ADMIN", desc: "End-of-day wrap-up, emails and notifications" },
    ],
    [emp1.id]: [
      { start: "09:00", end: "11:30", cat: "DEEP_WORK", desc: "Building authentication module — JWT token refresh flow and session management" },
      { start: "11:30", end: "12:00", cat: "MEETING", desc: "Sprint planning sync with product team" },
      { start: "12:00", end: "13:00", cat: "REST", desc: "Lunch break" },
      { start: "13:00", end: "15:00", cat: "DEEP_WORK", desc: "API rate limiting implementation and database query optimization" },
      { start: "15:00", end: "16:00", cat: "MEETING", desc: "Code review session — reviewing PRs from junior devs" },
      { start: "16:00", end: "17:00", cat: "ADMIN", desc: "Documentation updates and ticket triage" },
    ],
    [emp2.id]: [
      { start: "09:00", end: "10:30", cat: "MEETING", desc: "Design critique — reviewing new dashboard mockups with stakeholders" },
      { start: "10:30", end: "12:30", cat: "DEEP_WORK", desc: "Creating high-fidelity prototypes for mobile onboarding flow in Figma" },
      { start: "12:30", end: "13:30", cat: "REST", desc: "Lunch break" },
      { start: "13:30", end: "15:30", cat: "DEEP_WORK", desc: "Building design system components — typography, color tokens, spacing" },
      { start: "15:30", end: "16:30", cat: "MEETING", desc: "User testing session — observing 3 user interviews" },
      { start: "16:30", end: "17:00", cat: "ADMIN", desc: "Updating design handoff documentation in Notion" },
    ],
    [emp3.id]: [
      { start: "09:00", end: "10:00", cat: "MEETING", desc: "Daily standup and roadmap planning with engineering leads" },
      { start: "10:00", end: "12:00", cat: "DEEP_WORK", desc: "Writing Q1 product requirements document for analytics feature" },
      { start: "12:00", end: "13:00", cat: "REST", desc: "Lunch break" },
      { start: "13:00", end: "14:30", cat: "MEETING", desc: "Stakeholder demo of new reporting dashboard" },
      { start: "14:30", end: "16:30", cat: "DEEP_WORK", desc: "Competitive analysis and market research for upcoming feature set" },
      { start: "16:30", end: "17:00", cat: "ADMIN", desc: "Backlog grooming and sprint prep" },
    ],
    [emp4.id]: [
      { start: "09:00", end: "11:00", cat: "DEEP_WORK", desc: "CI/CD pipeline optimization — reducing build times by 40%" },
      { start: "11:00", end: "12:00", cat: "ADMIN", desc: "Infrastructure cost review and cloud resource optimization" },
      { start: "12:00", end: "13:00", cat: "REST", desc: "Lunch break" },
      { start: "13:00", end: "14:00", cat: "MEETING", desc: "Security audit review with compliance team" },
      { start: "14:00", end: "17:00", cat: "DEEP_WORK", desc: "Kubernetes cluster upgrade and rollout monitoring" },
    ],
    [emp5.id]: [
      { start: "09:00", end: "10:30", cat: "ADMIN", desc: "CRM updates, lead assignment and pipeline management" },
      { start: "10:30", end: "12:00", cat: "MEETING", desc: "Client discovery calls — 3 new enterprise prospects" },
      { start: "12:00", end: "13:00", cat: "REST", desc: "Lunch break" },
      { start: "13:00", end: "15:30", cat: "DEEP_WORK", desc: "Preparing Q4 sales proposal and custom pricing model" },
      { start: "15:30", end: "17:00", cat: "MEETING", desc: "Follow-up calls and demo presentations" },
    ],
    [emp6.id]: [
      { start: "09:00", end: "10:30", cat: "DEEP_WORK", desc: "Monthly financial reconciliation and variance analysis" },
      { start: "10:30", end: "11:30", cat: "MEETING", desc: "Budget review meeting with CFO" },
      { start: "11:30", end: "12:30", cat: "ADMIN", desc: "Processing invoices and expense reports" },
      { start: "12:30", end: "13:30", cat: "REST", desc: "Lunch break" },
      { start: "13:30", end: "16:00", cat: "DEEP_WORK", desc: "Q3 financial report preparation and forecasting model updates" },
      { start: "16:00", end: "17:00", cat: "ADMIN", desc: "Compliance documentation and audit trail maintenance" },
    ],
  };

  for (const [userId, blocks] of Object.entries(workBlockTemplates)) {
    for (const block of blocks) {
      await prisma.workBlock.create({
        data: {
          employeeId: userId,
          date: today,
          startTime: block.start,
          endTime: block.end,
          category: block.cat,
          description: block.desc,
        },
      });
    }
  }

  console.log("✅ Created work blocks");

  // ─── Notifications ────────────────────────────────────────────────────────

  await prisma.notification.createMany({
    data: [
      {
        userId: emp1.id,
        type: "LEAVE_APPROVED",
        message: "Your Annual leave request (Oct 10–12) has been approved. Have a great vacation!",
        read: true,
      },
      {
        userId: emp1.id,
        type: "PAYROLL",
        message: "Your October salary slip is ready. Net salary: $126,000.",
        read: false,
      },
      {
        userId: emp2.id,
        type: "LEAVE_APPROVED",
        message: "Your Sick leave for Nov 3 has been approved.",
        read: false,
      },
      {
        userId: hrUser.id,
        type: "LEAVE_REQUEST",
        message: "Maya Patel has applied for Annual leave (conference attendance). Action required.",
        read: false,
      },
      {
        userId: hrUser.id,
        type: "LEAVE_REQUEST",
        message: "David Lee has applied for Personal leave. Action required.",
        read: false,
      },
    ],
  });

  console.log("✅ Created notifications");
  console.log("\n🎉 DAYFLOW seed complete!");
  console.log("───────────────────────────────");
  console.log("HR Account:       hr@dayflow.demo / Demo@123");
  console.log("Employee Account: employee@dayflow.demo / Demo@123");
  console.log("───────────────────────────────");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

