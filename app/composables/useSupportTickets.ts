export async function createTicket(
  userId: number,
  subject: string,
  firstMessage: string,
  senderName: string,
) {
  const supabase = useSupabase();
  const now = new Date().toISOString();
  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({ user_id: userId, subject, created_at: now, updated_at: now })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("ticket_messages").insert({
    ticket_id: ticket.ticket_id,
    sender_role: "user",
    sender_name: senderName,
    body: firstMessage,
  });
  return ticket;
}

export async function getUserTickets(userId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getTicketMessages(ticketId: number) {
  const supabase = useSupabase();
  const { data, error } = await supabase
    .from("ticket_messages")
    .select("*")
    .eq("ticket_id", ticketId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendTicketMessage(
  ticketId: number,
  senderRole: "user" | "admin",
  senderName: string,
  body: string,
) {
  const supabase = useSupabase();
  const { error } = await supabase.from("ticket_messages").insert({
    ticket_id: ticketId,
    sender_role: senderRole,
    sender_name: senderName,
    body,
  });
  if (error) throw error;
  await supabase
    .from("support_tickets")
    .update({ updated_at: new Date().toISOString() })
    .eq("ticket_id", ticketId);
}

export async function closeTicket(ticketId: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("support_tickets")
    .update({ status: "closed", updated_at: new Date().toISOString() })
    .eq("ticket_id", ticketId);
  if (error) throw error;
}

export async function reopenTicket(ticketId: number) {
  const supabase = useSupabase();
  const { error } = await supabase
    .from("support_tickets")
    .update({ status: "open", updated_at: new Date().toISOString() })
    .eq("ticket_id", ticketId);
  if (error) throw error;
}
