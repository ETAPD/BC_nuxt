export async function adminGetAllUsers() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminGetAllPortfolios() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*, users(full_name, email, preferred_currency)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

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

export async function adminGetAllHoldings() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("holdings")
    .select("*, assets(name)")
    .order("value", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminUpdateOrderStatus(orderId: number, status: string) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);
  if (error) throw error;
}

export async function adminUpdateUserStatus(userId: number, status: string) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("users")
    .update({ status })
    .eq("user_id", userId);
  if (error) throw error;
}

export async function adminGetContactMessages() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function adminDeleteContactMessage(id: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

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
