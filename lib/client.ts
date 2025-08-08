export async function api<T = any>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers || {}) } })
  if (!res.ok) {
    const j = await res.json().catch(() => ({}))
    throw new Error(j.error || `HTTP ${res.status}`)
  }
  return (await res.json()) as T
}

export const AuthClient = {
  me: () => api<{ user: any }>("/api/auth/me"),
  register: (payload: { name: string; email: string; password: string; wantSell?: boolean }) =>
    api<{ user: any }>("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string }) =>
    api<{ user: any }>("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => api<{ ok: true }>("/api/auth/logout", { method: "POST" }),
}

export const MagazinesClient = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : ""
    return api<{ data: any[] }>(`/api/magazines${qs}`)
  },
  get: (id: string) => api<{ data: any }>(`/api/magazines/${id}`),
  create: (payload: any) => api<{ data: any }>("/api/magazines", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: string, patch: any) => api<{ ok: true }>(`/api/magazines/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  delete: (id: string) => api<{ ok: true }>(`/api/magazines/${id}`, { method: "DELETE" }),
}

export const OrdersClient = {
  listMine: () => api<{ data: any[] }>("/api/orders"),
  checkout: (items: Array<{ magazineId: string; qty: number }>) =>
    api<{ data: any }>("/api/orders", { method: "POST", body: JSON.stringify({ items }) }),
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
