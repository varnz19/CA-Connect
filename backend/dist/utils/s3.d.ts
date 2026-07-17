export declare const uploadFile: (file: Express.Multer.File, folder?: string) => Promise<{
    fileUrl: string;
    key: string;
}>;
export declare const getDownloadUrl: (key: string) => Promise<string>;
export declare const deleteFile: (key: string) => Promise<void>;
//# sourceMappingURL=s3.d.ts.map