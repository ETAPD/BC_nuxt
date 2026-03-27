export async function getFundingMethods(userId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("funding_methods")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addFundingMethod(
  userId: number,
  method: {
    method_type: string;
    label: string;
    last_four: string;
    is_default: boolean;
  },
) {
  const supabase = useSupabase();
  const { error } = await supabase.from("funding_methods").insert({
    user_id: userId,
    ...method,
    created_at: new Date().toISOString(),
  });

  if (error) throw error;
}

export async function removeFundingMethod(fundingId: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("funding_methods")
    .delete()
    .eq("funding_id", fundingId);
  if (error) throw error;
}
