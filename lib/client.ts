export async function api<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export const AuthClient = {
  me: () => api<{ user: any }>("/api/auth/me"),
  register: (payload: { name: string; email: string; password: string }) =>
    api<{ user: any }>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    api<{ user: any }>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => api<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  forgot: (email: string) =>
    api<{ ok: true; link?: string | null }>("/api/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  validateReset: (token: string) => api<{ ok: true }>("/api/auth/reset?token=" + encodeURIComponent(token)),
  reset: (payload: { token: string; password: string }) =>
    api<{ ok: true; user: any }>("/api/auth/reset", { method: "POST", body: JSON.stringify(payload) }),
  becomeSeller: () =>
    api<{ ok: true; role: string; sellerStatus: string }>(
      "/api/auth/become-seller",
      { method: "POST" }
    ),
}

export const MagazinesClient = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : ""
    return api<{ data: any[] }>(`/api/magazines${qs}`)
  },
  get: (id: string) => api<{ data: any }>(`/api/magazines/${id}`),
  create: (payload: any) => api<{ data: any }>("/api/magazines", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, patch: any) =>
    api<{ ok: true }>(`/api/magazines/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  delete: (id: string) => api<{ ok: true }>(`/api/magazines/${id}`, { method: "DELETE" }),
}

export const OrdersClient = {
  listMine: () => api<{ data: any[] }>("/api/orders"),
  checkout: (items: Array<{ magazineId: string; qty: number }>) =>
    api<{ data: any }>("/api/orders", { method: "POST", body: JSON.stringify({ items }) }),
  // Admin only
  updateStatus: (id: string, status: string) =>
    api<{ ok: true }>(`/api/orders/${id}/status`, { method: "POST", body: JSON.stringify({ status }) }),
}

export const DownloadsClient = {
  listMine: () => api<{ data: any[] }>("/api/downloads"),
}

export const AdminClient = {
  users: () => api<{ data: any[] }>("/api/admin/users"),
  approveAll: () => api<{ ok: true }>("/api/admin/moderate", { method: "POST" }),
  counts: () => api<{ data: { users: number; magazines: number; orders: number } }>("/api/admin/counts"),
  pendingSellers: () => api<{ data: any[] }>("/api/admin/sellers"),
  approveSeller: (id: string) => api<{ ok: true }>(`/api/admin/sellers/${id}/approve`, { method: "POST" }),
  rejectSeller: (id: string) => api<{ ok: true }>(`/api/admin/sellers/${id}/reject`, { method: "POST" }),
  pendingMagazines: () => api<{ data: any[] }>(`/api/admin/magazines`),
  approveMagazine: (id: string) => api<{ ok: true }>(`/api/admin/magazines/${id}/approve`, { method: "POST" }),
}

export const SellerClient = {
  analytics: () => api<{ data: Array<{ month: string; sales: number }> }>("/api/seller/analytics"),
  listings: () => api<{ data: any[] }>("/api/seller/listings"),
}

export const NotificationsClient = {
  list: () => api<{ data: any[]; unread: number }>("/api/notifications"),
  markRead: (id: string) => api<{ ok: true }>(`/api/notifications/${id}`, { method: "PATCH" }),
}

export const ChatClient = {
  conversations: () => api<{ data: any[] }>("/api/chat/conversations"),
  start: (payload: { buyerId: string; sellerId: string; orderId?: string }) =>
    api<{ id: string }>("/api/chat/conversations", { method: "POST", body: JSON.stringify(payload) }),
  messages: (id: string) => api<{ data: any[] }>(`/api/chat/conversations/${id}/messages`),
  send: (id: string, body: string) =>
    api<{ id: string }>(`/api/chat/conversations/${id}/messages`, { method: "POST", body: JSON.stringify({ body }) }),
}
