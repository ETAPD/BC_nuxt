// Ziskanie portfolia pouzivatela
export async function getPortfolio(userId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error && error.code === "PGRST116") {
    return ensurePortfolioExists(userId);
  }
  if (error) throw error;
  return data;
}

// Vytvorenie portfolia ak neexistuje
export async function ensurePortfolioExists(userId: number) {
  const supabase = useSupabase();
  const { data: existing } = await supabase
    .from("portfolios")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();
  if (existing) return existing;

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("portfolios")
    .insert({
      user_id: userId,
      name: "Main Portfolio",
      invested: 0,
      total_value: 1000,
      day_change: 0,
      day_change_percent: 0,
      risk_profile: "moderate",
      created_at: now,
      updated_at: now,
    })
    .select()
    .single();
  if (error) {
    console.error("ensurePortfolioExists insert failed:", error);
    return null;
  }

  await supabase.from("watchlists").insert({
    user_id: userId,
    name: "My Watchlist",
    created_at: now,
  });

  return data;
}

// Ziskanie drzanych aktiv
export async function getHoldings(portfolioId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("holdings")
    .select("*, assets(name, asset_type, image_url)")
    .eq("portfolio_id", portfolioId)
    .order("value", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((h: any) => ({
    ...h,
    asset_name: h.assets?.name ?? h.symbol,
    asset_type: h.assets?.asset_type ?? "crypto",
    image_url: h.assets?.image_url ?? null,
  }));
}

// Ziskanie watchlist poloziek
export async function getWatchlistItems(userId: number) {
  const supabase = useSupabase();
  const { data: wl, error: wErr } = await supabase
    .from("watchlists")
    .select("watchlist_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (wErr) return [];

  const { data, error } = await supabase
    .from("watchlist_items")
    .select("*")
    .eq("watchlist_id", wl.watchlist_id)
    .order("added_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Pridanie do watchlistu
export async function addWatchlistItem(
  userId: number,
  symbol: string,
  currentPrice: number,
) {
  const supabase = useSupabase();
  const { data: wl, error: wErr } = await supabase
    .from("watchlists")
    .select("watchlist_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (wErr) throw wErr;

  const { error } = await supabase.from("watchlist_items").insert({
    watchlist_id: wl.watchlist_id,
    symbol,
    current_price: currentPrice,
    change_percent: 0,
    up: true,
    added_at: new Date().toISOString(),
  });

  if (error) throw error;
}

// Odstranenie z watchlistu
export async function removeWatchlistItem(itemId: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("watchlist_item_id", itemId);

  if (error) throw error;
}
