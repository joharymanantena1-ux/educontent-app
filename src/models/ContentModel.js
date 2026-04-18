import { supabase, STORAGE_BUCKET } from '../config/supabase';

export const CONTENT_TYPES = {
  DOCUMENT: 'document',
  VIDEO: 'video',
};

export const ContentModel = {
  async list({ subject, level, type } = {}) {
    let query = supabase
      .from('contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (subject) query = query.eq('subject', subject);
    if (level) query = query.eq('level', level);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('contents')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getSignedUrl(filePath, expiresIn = 60 * 60) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);
    if (error) throw error;
    return data.signedUrl;
  },

  async listSubjects() {
    const { data, error } = await supabase
      .from('contents')
      .select('subject')
      .order('subject');
    if (error) throw error;
    const unique = [...new Set((data ?? []).map((r) => r.subject).filter(Boolean))];
    return unique;
  },
};
