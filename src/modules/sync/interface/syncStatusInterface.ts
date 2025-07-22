export interface SyncStatus {
    directories?: Directories;
    fileCounts?:  FileCounts;
    files?:       Files;
    timestamp?:   Date;
}

export interface Directories {
    base?:        string;
    created?:     string;
    transferred?: string;
    error?:       string;
}

export interface FileCounts {
    created?:     number;
    transferred?: number;
    error?:       number;
}

export interface Files {
    created?:     any[];
    transferred?: string[];
    error?:       any[];
}
