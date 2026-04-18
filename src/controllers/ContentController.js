import { ContentModel, CONTENT_TYPES } from '../models/ContentModel';

export { CONTENT_TYPES };

export const LEVELS = ['Collège', 'Lycée', 'Licence', 'Master'];

export const ContentController = {
  async fetchAll(filters) {
    return ContentModel.list(filters);
  },

  async fetchById(id) {
    return ContentModel.getById(id);
  },

  async getStreamUrl(content) {
    if (!content?.file_path) throw new Error('Chemin fichier manquant');
    return ContentModel.getSignedUrl(content.file_path);
  },

  async fetchSubjects() {
    return ContentModel.listSubjects();
  },
};
