// Typed API client — thin wrappers around fetch, all calls include credentials

const API_BASE = "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error ?? `HTTP ${response.status}`);
  }

  return response.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  signIn: (email: string, password: string) =>
    request("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signUp: (name: string, email: string, password: string, department: string, designation: string) =>
    request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, department, designation }),
    }),

  signOut: () => request("/api/auth/signout", { method: "POST" }),

  me: () => request("/api/auth/me"),
};

// ─── Attendance ────────────────────────────────────────────────────────────

export const attendanceApi = {
  checkIn: () => request("/api/attendance/checkin", { method: "POST" }),
  checkOut: () => request("/api/attendance/checkout", { method: "POST" }),
  getMy: (days = 14) => request(`/api/attendance?days=${days}`),
  getToday: () => request("/api/attendance/today"),
};

// ─── Leave ────────────────────────────────────────────────────────────────

export const leaveApi = {
  apply: (data: {
    type: string;
    startDate: string;
    endDate: string;
    remarks: string;
  }) =>
    request("/api/leave", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMy: () => request("/api/leave"),
  getBalance: () => request("/api/leave/balance"),
};

// ─── Payroll ─────────────────────────────────────────────────────────────

export const payrollApi = {
  getMy: () => request("/api/payroll"),
};

// ─── Notifications ────────────────────────────────────────────────────────

export const notificationsApi = {
  getMy: () => request("/api/notifications"),
  markRead: (id: string) =>
    request(`/api/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request("/api/notifications/read-all", { method: "PATCH" }),
};

// ─── WorkBlocks ───────────────────────────────────────────────────────────

export const workBlocksApi = {
  getMy: (date?: string) =>
    request(`/api/workblocks${date ? `?date=${date}` : ""}`),
  getForEmployee: (employeeId: string, date?: string) =>
    request(`/api/workblocks/${employeeId}${date ? `?date=${date}` : ""}`),
  addWorkBlock: (data: { date?: string; startTime: string; endTime: string; category: string; description: string; employeeId?: string }) =>
    request("/api/workblocks", { method: "POST", body: JSON.stringify(data) }),
};

// ─── HR ─────────────────────────────────────────────────────────────────

export const hrApi = {
  getEmployees: () => request("/api/hr/employees"),
  getEmployee: (id: string) => request(`/api/hr/employees/${id}`),
  getAttendance: (date?: string) =>
    request(`/api/hr/attendance${date ? `?date=${date}` : ""}`),
  getLeaves: (status?: string) =>
    request(`/api/hr/leaves${status ? `?status=${status}` : ""}`),
  approveLeave: (id: string, comment?: string) =>
    request(`/api/hr/leaves/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ comment }),
    }),
  rejectLeave: (id: string, comment: string) =>
    request(`/api/hr/leaves/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ comment }),
    }),
  getPayroll: (employeeId?: string) =>
    request(`/api/hr/payroll${employeeId ? `/${employeeId}` : ""}`),
  updatePayroll: (
    employeeId: string,
    data: { basic: number; allowances: number; deductions: number }
  ) =>
    request(`/api/hr/payroll/${employeeId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  getActionCenter: () => request("/api/hr/action-center"),
};

export const profileApi = {
  get: () => request("/api/profile"),
  update: (data: { name?: string; phone?: string; address?: string }) =>
    request("/api/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};
