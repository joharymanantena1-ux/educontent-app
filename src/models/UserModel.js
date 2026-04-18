import { supabase } from '../config/supabase';

export const UserModel = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsertProfile(profile) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updatePreferences(userId, preferences) {
    const { error } = await supabase
      .from('profiles')
      .update({ preferences })
      .eq('id', userId);
    if (error) throw error;
  },
};
