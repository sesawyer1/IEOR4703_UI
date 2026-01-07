type ChapterFile = {
    name: string;
    size: number;
    type: string;
}

type Folder = {
    name: string;
    files?: ChapterFile[];
    subfolders?: Folder[];
}

type Chapter = {
    id: number;
    title: string;
    files?: ChapterFile[];
    folders?: Folder[];
}

export type { Chapter, ChapterFile, Folder }