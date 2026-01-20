import { API_BASE } from "./api";
import ImageFileViewer from "./image-file-viewer";
import type { ContentFile } from "./data.type";

export default function ImageApiViewer({ file }: { file: ContentFile }) {
  const src = `${API_BASE}/api/download?path=${encodeURIComponent(
    file.path
  )}`;

  return <ImageFileViewer src={src} />;
}
