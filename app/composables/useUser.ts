// Ziskanie pouzivatela z databazy
export async function getDbUser() {
  const supabase = useSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (data) return data;

  if (error && error.code === "PGRST116") {
    await new Promise((r) => setTimeout(r, 1500));
    const { data: retry } = await supabase
      .from("users")
      .select("*")
      .eq("auth_id", user.id)
      .single();
    if (retry) return retry;

    const fullName =
      user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    const initials = fullName.trim().substring(0, 2).toUpperCase();

    const { data: created, error: insertErr } = await supabase
      .from("users")
      .insert({
        email: user.email!,
        full_name: fullName,
        initials,
        preferred_currency: "USD",
        status: "active",
        created_at: new Date().toISOString(),
        auth_id: user.id,
      })
      .select()
      .single();

    if (insertErr)
      throw new Error(
        "User profile not found. Please try refreshing the page.",
      );

    await ensurePortfolioExists(created.user_id);

    return created;
  }

  if (error) throw error;
  return data;
}

// Aktualizacia profilu
export async function updateUserProfile(
  userId: number,
  updates: {
    full_name?: string;
    initials?: string;
    preferred_currency?: string;
    profile_picture?: string;
    country?: string;
    phone?: string;
  },
) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("user_id", userId);
  if (error) throw error;
}

// Upload profiloveho obrazku
export async function uploadProfilePicture(
  userId: number,
  file: File,
): Promise<string> {
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const MAX_SIZE = 5 * 1024 * 1024;
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Povolené sú len obrázky (JPEG, PNG, GIF, WebP).');
  }
  if (file.size > MAX_SIZE) {
    throw new Error('Súbor je príliš veľký. Maximum je 5 MB.');
  }
  const supabase = useSupabase();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `avatars/${userId}_${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });
  if (uploadErr) throw uploadErr;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function getUserPreferences(userId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .single();

  if (error && error.code === "PGRST116") return null;
  if (error) throw error;
  return data;
}

export async function upsertUserPreferences(
  userId: number,
  prefs: {
    notify_price_alerts?: boolean;
    notify_order_filled?: boolean;
    notify_order_cancelled?: boolean;
    notify_security?: boolean;
  },
) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("user_preferences")
    .upsert(
      { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );

  if (error) throw error;
}

export async function getUserLimits() {
  const supabase = useSupabase();
  const { data, error } = await supabase.rpc("get_user_limits");
  if (error) throw error;
  return data as {
    role: string;
    max_watchlist: number;
    max_open_orders: number;
    max_holdings: number;
    can_export: boolean;
    can_use_stop_orders: boolean;
  };
}

export async function setUserRole(targetUserId: number, newRole: string) {
  const supabase = useSupabase();
  const { error } = await supabase.rpc("set_user_role", {
    target_user_id: targetUserId,
    new_role: newRole,
  });
  if (error) throw error;
}

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = useSupabase();
  try {
    const { data, error } = await supabase.rpc("is_admin");
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export async function exportUserData() {
  const supabase = useSupabase();
  const { data, error } = await supabase.rpc("export_user_data");
  if (error) throw error;
  return data;
}

export async function deleteUserAccount() {
  const supabase = useSupabase();
  const { error } = await supabase.rpc("delete_user_account");
  if (error) throw error;
}
