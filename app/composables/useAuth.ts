// Registracia pouzivatela
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

// Prihlasenie pouzivatela
export async function signIn(email: string, password: string) {
  const supabase = useSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

// Odhlasenie pouzivatela
export async function signOut() {
  const supabase = useSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Ziskanie aktualne prihlaseneho pouzivatela
export async function getUser() {
  const supabase = useSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// Ziskanie aktualne session
export async function getSession() {
  const supabase = useSupabase();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Zmena hesla
export async function changePassword(currentPassword: string, newPassword: string) {
  const supabase = useSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) throw new Error('Nie je možné overiť používateľa.');
  const { error: verifyErr } = await supabase.auth.signInWithPassword({
    email: data.user.email,
    password: currentPassword,
  });
  if (verifyErr) throw new Error('Aktuálne heslo je nesprávne.');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

// Odoslanie resetu hesla
export async function sendPasswordReset(email: string) {
  const supabase = useSupabase();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}
