// Ziskanie otvorenych objednavok
export async function getOpenOrders(portfolioId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Posledne obchody
export async function getRecentTrades(portfolioId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("executed_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data ?? [];
}

// Vsetky obchody
export async function getAllTrades(portfolioId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .order("executed_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Obchody pre konkretny aktiv
export async function getTradesForAsset(portfolioId: number, assetId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("trades")
    .select("*")
    .eq("portfolio_id", portfolioId)
    .eq("asset_id", assetId)
    .order("executed_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data ?? [];
}

// Zadanie objednavky
export async function placeOrder(order: {
  portfolio_id: number;
  asset_id: number;
  symbol: string;
  order_side: string;
  order_type: string;
  limit_price: number | null;
  stop_price: number | null;
  amount: number;
  amount_unit: string;
  time_in_force: string;
}) {
  const supabase = useSupabase();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("orders")
    .insert({
      ...order,
      status: "pending",
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Zrusenie objednavky
export async function cancelOrder(orderId: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  if (error) throw error;
}

// Uprava objednavky
export async function updateOrder(
  orderId: number,
  updates: {
    limit_price?: number | null;
    stop_price?: number | null;
    amount?: number;
  },
) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("order_id", orderId);

  if (error) throw error;
}
