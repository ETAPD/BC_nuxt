export async function createAdminNotification(
  userId: number,
  title: string,
  message: string,
) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("admin_notifications")
    .insert({ user_id: userId, title, message });
  if (error) throw error;
}

export async function getUserNotifications(userId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationRead(id: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("admin_notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
}
