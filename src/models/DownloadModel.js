import * as FileSystem from 'expo-file-system';
import { STORAGE_KEYS, getItem, setItem } from '../utils/storage';

const DOWNLOADS_DIR = FileSystem.documentDirectory + 'educontent/';

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
  }
}

function buildLocalUri(content) {
  const ext = content.file_path?.split('.').pop() ?? 'bin';
  return `${DOWNLOADS_DIR}${content.id}.${ext}`;
}

export const DownloadModel = {
  async list() {
    return getItem(STORAGE_KEYS.DOWNLOADS, []);
  },

  async findByContentId(contentId) {
    const downloads = await this.list();
    return downloads.find((d) => d.contentId === contentId) ?? null;
  },

  async save(remoteUrl, content, onProgress) {
    await ensureDir();
    const localUri = buildLocalUri(content);

    const downloadResumable = FileSystem.createDownloadResumable(
      remoteUrl,
      localUri,
      {},
      (p) => {
        if (onProgress && p.totalBytesExpectedToWrite) {
          onProgress(p.totalBytesWritten / p.totalBytesExpectedToWrite);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) throw new Error('Téléchargement échoué');

    const downloads = await this.list();
    const entry = {
      contentId: content.id,
      title: content.title,
      type: content.type,
      subject: content.subject,
      level: content.level,
      size: content.size,
      localUri: result.uri,
      downloadedAt: new Date().toISOString(),
    };
    const next = downloads.filter((d) => d.contentId !== content.id).concat(entry);
    await setItem(STORAGE_KEYS.DOWNLOADS, next);
    return entry;
  },

  async remove(contentId) {
    const downloads = await this.list();
    const entry = downloads.find((d) => d.contentId === contentId);
    if (entry) {
      try {
        await FileSystem.deleteAsync(entry.localUri, { idempotent: true });
      } catch {}
    }
    await setItem(
      STORAGE_KEYS.DOWNLOADS,
      downloads.filter((d) => d.contentId !== contentId)
    );
  },

  async clearAll() {
    const info = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
    if (info.exists) {
      await FileSystem.deleteAsync(DOWNLOADS_DIR, { idempotent: true });
    }
    await setItem(STORAGE_KEYS.DOWNLOADS, []);
  },
};
