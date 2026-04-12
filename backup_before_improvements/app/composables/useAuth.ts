export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone?: string,
  country?: string,
) {
  const supabase = useSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        ...(phone ? { phone } : {}),
        ...(country ? { country } : {}),
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = useSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = useSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const supabase = useSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getSession() {
  const supabase = useSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function changePassword(newPassword: string) {
  const supabase = useSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function sendPasswordReset(email: string) {
  const supabase = useSupabase();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}
