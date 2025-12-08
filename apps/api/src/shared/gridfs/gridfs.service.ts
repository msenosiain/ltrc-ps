import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { Readable } from 'stream';

@Injectable()
export class GridFsService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private getBucket(bucketName: string): GridFSBucket {
    return new GridFSBucket(this.connection.db, { bucketName });
  }

  async uploadFile(bucket: string, filename: string, buffer: Buffer, mime: string): Promise<string> {
    const bucketRef = this.getBucket(bucket);

    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const uploadStream = bucketRef.openUploadStream(filename, {
      metadata: { contentType: mime },
    });

    return new Promise((resolve, reject) => {
      stream.pipe(uploadStream)
        .on('error', reject)
        .on('finish', () => resolve(uploadStream.id.toHexString()));
    });
  }

  getFileStream(bucket: string, id: string) {
    return this.getBucket(bucket).openDownloadStream(new ObjectId(id));
  }

  deleteFile(bucket: string, id: string) {
    return this.getBucket(bucket).delete(new ObjectId(id));
  }
}
