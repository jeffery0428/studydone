declare module "ali-oss" {
  interface PutOptions {
    headers?: Record<string, string>;
  }

  class OSS {
    constructor(options: {
      region: string;
      accessKeyId: string;
      accessKeySecret: string;
      bucket: string;
    });

    put(name: string, file: Buffer, options?: PutOptions): Promise<{ name: string }>;
  }

  export = OSS;
}

