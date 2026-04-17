// Ziskanie vsetkych pouzivatelov
export async function adminGetAllUsers(page = 1, perPage = 50) {
  const supabase = useSupabase();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, error, count } = await supabase
    .from("users")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);
  if (error) throw error;
  return { users: data ?? [], total: count ?? 0 };
}

// Vsetky portfolia
export async function adminGetAllPortfolios() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*, users(full_name, email, preferred_currency)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Uprava pouzivatela
export async function adminUpdateUser(
  userId: number,
  updates: Record<string, any>,
) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId);
  if (error) throw error;
}

// Vsetky objednavky
export async function adminGetAllOrders() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "*, assets(name, asset_type), portfolios(name, user_id, users(full_name))",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

// Vsetky obchody
export async function adminGetAllTrades() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("trades")
    .select("*, assets(name)")
    .order("executed_at", { ascending: false })
    .limit(100);
  if (error) throw error;
  return data ?? [];
}

// Vsetky drzania
export async function adminGetAllHoldings() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("holdings")
    .select("*, assets(name)")
    .order("value", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Zmena stavu objednavky
export async function adminUpdateOrderStatus(orderId: number, status: string) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);
  if (error) throw error;
}

// Zmena stavu pouzivatela
export async function adminUpdateUserStatus(userId: number, status: string) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("users")
    .update({ status })
    .eq("user_id", userId);
  if (error) throw error;
}

// Kontaktne spravy
export async function adminGetContactMessages() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// Zmazanie kontaktnej spravy
export async function adminDeleteContactMessage(id: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// Vsetky tikety
export async function adminGetAllTickets() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  const tickets = data ?? [];
  if (tickets.length === 0) return [];

  const userIds = [...new Set(tickets.map((t: any) => t.user_id))];
  const { data: users } = await supabase
    .from("users")
    .select("user_id, full_name, email, profile_picture")
    .in("user_id", userIds);
  const userMap = new Map((users ?? []).map((u: any) => [u.user_id, u]));

  return tickets.map((t: any) => {
    const u = userMap.get(t.user_id);
    return {
      ...t,
      user_name: u?.full_name ?? "—",
      user_email: u?.email ?? "—",
    };
  });
}
