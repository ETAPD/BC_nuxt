export async function logAdminAction(
  action: string,
  targetType: string,
  targetId: string | number,
  details?: string,
) {
  const supabase = useSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("admin_audit_log").insert({
    admin_auth_id: user.id,
    action,
    target_type: targetType,
    target_id: String(targetId),
    details: details || null,
    created_at: new Date().toISOString(),
  }).then(({ error }) => {
    if (error) console.warn("Audit log insert failed:", error.message);
  });
}
