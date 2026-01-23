import type { Chapter, ContentFile, ContentFolder } from "./data.type";

/**
 * 1) Text-like files we want as raw strings (includes .ipynb)
 *    Add/remove extensions as needed.
 */
const RAW_GLOB = import.meta.glob(
  "./content/**/*.{ipynb,py,m,txt,md,json,csv}",
  {
    as: "raw",
    eager: true,
  }
) as Record<string, string>;

const DAT_GLOB = import.meta.glob(
  "./content/**/*.dat", 
  {
  as: "raw",
  eager: true,
}) as Record<string, string>;

/**
 * 2) Asset-like files we want as URLs (images, pdfs, etc.)
 */
const URL_GLOB = import.meta.glob(
  "./content/**/*.{png,jpg,jpeg,svg,gif,webp,pdf}",
  {
    as: "url",
    eager: true,
  }
) as Record<string, string>;

function getExt(filename: string): string {
  const i = filename.lastIndexOf(".");
  return i >= 0 ? filename.slice(i + 1).toLowerCase() : "";
}

function shouldHidePath(fsPath: string): boolean {
  // hide notebook checkpoints + mac metadata files
  return (
    fsPath.includes("/.ipynb_checkpoints/") || fsPath.endsWith(".DS_Store")
  );
}

function getOrCreateFolder(parent: ContentFolder, name: string): ContentFolder {
  let next = parent.folders.find((f) => f.name === name);
  if (!next) {
    next = { name, folders: [], files: [] };
    parent.folders.push(next);
  }
  return next;
}

/**
 * Build a folder tree from all discovered files.
 * Returns chapters = immediate subfolders of "Data/"
 * e.g. Data/1.LCG, Data/2.Something, ...
 */
export function buildChapters(): Chapter[] {
  const root: ContentFolder = { name: "root", folders: [], files: [] };

  // Collect all records in one list
  const records: Array<{ fsPath: string; kind: "raw" | "url"; value: string }> =
    [];

  for (const [fsPath, raw] of Object.entries(RAW_GLOB)) {
    if (shouldHidePath(fsPath)) continue;
    records.push({ fsPath, kind: "raw", value: raw });
  }

  for (const [fsPath, url] of Object.entries(URL_GLOB)) {
    if (shouldHidePath(fsPath)) continue;
    records.push({ fsPath, kind: "url", value: url });
  }

  for (const [fsPath, data] of Object.entries(DAT_GLOB)) {
    if (shouldHidePath(fsPath)) continue;
    records.push({ fsPath, kind: "raw", value: data });
  }

  // Insert records into the tree
  for (const rec of records) {
    // fsPath like "./content/Data/1.LCG/hist_example.ipynb"
    const cleaned = rec.fsPath.replace("./content/", ""); // "Data/1.LCG/..."
    const parts = cleaned.split("/");
    const filename = parts[parts.length - 1];

    // walk folders (everything except last part)
    let curr = root;
    for (let i = 0; i < parts.length - 1; i++) {
      curr = getOrCreateFolder(curr, parts[i]);
    }

    const file: ContentFile = {
      name: filename,
      ext: getExt(filename),
      path: cleaned, // unique id like "Data/1.LCG/hist_example.ipynb"
    };

    if (rec.kind === "raw") file.raw = rec.value;
    else file.url = rec.value;

    curr.files.push(file);
  }

  // Find root/Data
  const dataFolder = root.folders.find((f) => f.name === "Data");
  if (!dataFolder) return [];

  // Each direct subfolder of Data becomes a chapter
  const chapters: Chapter[] = dataFolder.folders.map((top) => ({
    id: `Data/${top.name}`,
    title: top.name,
    root: top,
  }));

  // Sort chapters and folder contents for nicer UI
  chapters.sort((a, b) => a.title.localeCompare(b.title));
  sortFolderRecursively(dataFolder);

  return chapters;
}

function sortFolderRecursively(folder: ContentFolder) {
  folder.folders.sort((a, b) => a.name.localeCompare(b.name));
  folder.files.sort((a, b) => a.name.localeCompare(b.name));
  folder.folders.forEach(sortFolderRecursively);
}
