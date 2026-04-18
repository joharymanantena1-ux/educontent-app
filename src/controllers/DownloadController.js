import * as Sharing from 'expo-sharing';
import { DownloadModel } from '../models/DownloadModel';
import { ContentModel } from '../models/ContentModel';

export const DownloadController = {
  async list() {
    return DownloadModel.list();
  },

  async isDownloaded(contentId) {
    const entry = await DownloadModel.findByContentId(contentId);
    return !!entry;
  },

  async getLocalEntry(contentId) {
    return DownloadModel.findByContentId(contentId);
  },

  async download(content, onProgress) {
    const signedUrl = await ContentModel.getSignedUrl(content.file_path);
    return DownloadModel.save(signedUrl, content, onProgress);
  },

  async remove(contentId) {
    return DownloadModel.remove(contentId);
  },

  async clearAll() {
    return DownloadModel.clearAll();
  },

  async share(contentId) {
    const entry = await DownloadModel.findByContentId(contentId);
    if (!entry) throw new Error('Contenu non téléchargé');
    const available = await Sharing.isAvailableAsync();
    if (!available) throw new Error('Partage indisponible sur ce device');
    await Sharing.shareAsync(entry.localUri);
  },
};
