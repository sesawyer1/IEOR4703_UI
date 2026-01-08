export type ContentFile = {
  name: string; // "hist_example.ipynb"
  ext: string; // "ipynb"
  path: string; // virtual path key (unique id)
  url?: string; // for images/pdf/etc (from glob as url)
  raw?: string; // for text/code files (from glob as raw)
};

export type ContentFolder = {
  name: string; // "Week 1"
  files: ContentFile[]; // files directly under this folder
  folders: ContentFolder[]; // nested folders
};

export type Chapter = {
  id: string; // 1, 2, 3, ...
  title: string; // "Chapter 1: Introduction"
  root: ContentFolder; // top-level folders
};
