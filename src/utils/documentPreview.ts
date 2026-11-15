export type PreviewKind = 'iframe' | 'image' | 'none';
export type FileKind = 'pdf' | 'doc' | 'slides' | 'sheet' | 'image' | 'video' | 'link';

export interface DocumentPreview {
  kind: PreviewKind;
  src: string;
  downloadUrl: string | null;
  openUrl: string;
  fileKind: FileKind;
  source: 'drive' | 'web';
}

const OFFICE_OR_PDF = /\.(pdf|docx?|pptx?|xlsx?)(\?.*)?$/i;
const IMAGE = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

const kindFromExtension = (url: string): FileKind => {
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.pdf')) return 'pdf';
  if (/\.docx?$/.test(lower)) return 'doc';
  if (/\.pptx?$/.test(lower)) return 'slides';
  if (/\.xlsx?$/.test(lower)) return 'sheet';
  if (IMAGE.test(lower)) return 'image';
  return 'link';
};

export function buildDocumentPreview(fileUrl: string, title = ''): DocumentPreview {
  const url = fileUrl.trim();

  const driveFile = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:.*&)?id=)([\w-]+)/);
  if (driveFile) {
    const id = driveFile[1];
    return {
      kind: 'iframe',
      src: `https://drive.google.com/file/d/${id}/preview`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${id}`,
      openUrl: `https://drive.google.com/file/d/${id}/view`,
      fileKind: kindFromExtension(title) === 'link' ? 'pdf' : kindFromExtension(title),
      source: 'drive',
    };
  }

  const googleDoc = url.match(/docs\.google\.com\/(document|presentation|spreadsheets)\/d\/([\w-]+)/);
  if (googleDoc) {
    const [, type, id] = googleDoc;
    const exportUrl =
      type === 'document'
        ? `https://docs.google.com/document/d/${id}/export?format=pdf`
        : type === 'presentation'
          ? `https://docs.google.com/presentation/d/${id}/export/pdf`
          : `https://docs.google.com/spreadsheets/d/${id}/export?format=xlsx`;
    return {
      kind: 'iframe',
      src: `https://docs.google.com/${type}/d/${id}/preview`,
      downloadUrl: exportUrl,
      openUrl: url,
      fileKind: type === 'document' ? 'doc' : type === 'presentation' ? 'slides' : 'sheet',
      source: 'drive',
    };
  }

  const youtube = url.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([\w-]{11})/);
  if (youtube) {
    return {
      kind: 'iframe',
      src: `https://www.youtube-nocookie.com/embed/${youtube[1]}`,
      downloadUrl: null,
      openUrl: url,
      fileKind: 'video',
      source: 'web',
    };
  }

  if (IMAGE.test(url)) {
    return { kind: 'image', src: url, downloadUrl: url, openUrl: url, fileKind: 'image', source: 'web' };
  }

  if (OFFICE_OR_PDF.test(url)) {
    return {
      kind: 'iframe',
      src: `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(url)}`,
      downloadUrl: url,
      openUrl: url,
      fileKind: kindFromExtension(url),
      source: 'web',
    };
  }

  return { kind: 'none', src: url, downloadUrl: null, openUrl: url, fileKind: 'link', source: 'web' };
}
