export async function getAssets() {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("assets")
    .select(
      "asset_id, symbol, name, asset_type, base_price, change_24h, image_url",
    )
    .order("symbol");

  if (error) throw error;
  return data ?? [];
}

export async function getPriceHistory(
  assetId: number,
  range: "1h" | "24h" | "7d" | "30d" = "24h",
) {
  const supabase = useSupabase();
  const now = new Date();
  const from = new Date(now);
  if (range === "1h") from.setHours(from.getHours() - 1);
  else if (range === "24h") from.setDate(from.getDate() - 1);
  else if (range === "7d") from.setDate(from.getDate() - 7);
  else from.setDate(from.getDate() - 30);

  const { data, error } = await supabase
    .from("price_history")
    .select("price, recorded_at")
    .eq("asset_id", assetId)
    .gte("recorded_at", from.toISOString())
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
