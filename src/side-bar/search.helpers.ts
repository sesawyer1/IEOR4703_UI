import type { Chapter, ContentFolder, ContentFile } from "../data.type";

const norm = (s: string) =>
  s.toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

const fileMatches = (f: ContentFile, q: string) =>
  norm(f.name).includes(q) || (f.ext ? norm(f.ext).includes(q) : false);

const folderMatches = (folder: ContentFolder, q: string) =>
  norm(folder.name).includes(q);

const chapterMatches = (chapter: Chapter, q: string) =>
  norm(chapter.title).includes(q) || norm(String(chapter.id)).includes(q);

/**
 * Returns:
 * - filteredChapters: same shape but pruned to matches
 * - openKeys: keys for chapters/folders that should be opened to reveal matches
 */
export function filterChapters(
  chapters: Chapter[],
  rawQuery: string
): { filteredChapters: Chapter[]; openKeys: string[] } {
  const q = norm(rawQuery);
  if (!q) return { filteredChapters: chapters, openKeys: [] };

  const openKeys: string[] = [];

  const filterFolder = (
    folder: ContentFolder,
    nodeKey: string
  ): ContentFolder | null => {
    const files = (folder.files ?? []).filter((f) => fileMatches(f, q));

    const folders = (folder.folders ?? [])
      .map((sub) => filterFolder(sub, `${nodeKey}/folder:${sub.name}`))
      .filter(Boolean) as ContentFolder[];

    const keep =
      folderMatches(folder, q) || files.length > 0 || folders.length > 0;
    if (!keep) return null;

    // open this folder if it contains results
    if (files.length > 0 || folders.length > 0) openKeys.push(nodeKey);

    return { ...folder, files, folders };
  };

  const filteredChapters = chapters
    .map((chapter) => {
      const chapterKey = `chapter:${chapter.id}`;

      const rootFiles = (chapter.root.files ?? []).filter((f) =>
        fileMatches(f, q)
      );
      const rootFolders = (chapter.root.folders ?? [])
        .map((folder) =>
          filterFolder(folder, `${chapterKey}/folder:${folder.name}`)
        )
        .filter(Boolean) as ContentFolder[];

      const keep =
        chapterMatches(chapter, q) ||
        rootFiles.length > 0 ||
        rootFolders.length > 0;

      if (!keep) return null;

      // open chapter if any nested matches
      if (rootFiles.length > 0 || rootFolders.length > 0)
        openKeys.push(chapterKey);

      return {
        ...chapter,
        root: {
          ...chapter.root,
          files: rootFiles,
          folders: rootFolders,
        },
      };
    })
    .filter(Boolean) as Chapter[];

  return { filteredChapters, openKeys };
}
