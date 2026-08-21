import { BadRequestException,Injectable } from '@nestjs/common';
import { DeleteObjectCommand,GetObjectCommand,PutObjectCommand,S3Client } from '@aws-sdk/client-s3';
import { mkdir,unlink,writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { Readable } from 'node:stream';
import sharp from 'sharp';
import path from 'node:path';import { randomUUID } from 'node:crypto';
import { resolveMediaUrl } from './media-url';
@Injectable() export class ObjectStorageService {
  private readonly root=path.resolve(process.env.MEDIA_LOCAL_PATH??'./uploads');
  private client(){if(!process.env.S3_ENDPOINT||!process.env.S3_ACCESS_KEY_ID||!process.env.S3_SECRET_ACCESS_KEY||!process.env.S3_BUCKET)return null;return new S3Client({endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION||'auto',credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}})}
  async put(productId:string,file:{buffer:Buffer;mimetype:string;size:number}|undefined){if(!file?.buffer||!file.size||file.size>5*1024*1024)throw new BadRequestException('A non-empty image up to 5 MB is required');let image:Buffer;try{const metadata=await sharp(file.buffer,{limitInputPixels:40_000_000}).metadata();if(!metadata.width||!metadata.height||metadata.width>8000||metadata.height>8000||metadata.format==='svg')throw new Error('unsupported');image=await sharp(file.buffer,{limitInputPixels:40_000_000}).rotate().webp({quality:85}).toBuffer()}catch{throw new BadRequestException('The uploaded file is not a valid supported image')}const key=`products/${productId}/${randomUUID()}.webp`;const client=this.client();if(client)await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET!,Key:key,Body:image,ContentType:'image/webp',CacheControl:'public, max-age=31536000, immutable'}));else{const target=this.safe(key);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,image)}return key}
  async remove(key:string){const client=this.client();if(client)await client.send(new DeleteObjectCommand({Bucket:process.env.S3_BUCKET!,Key:key}));else await unlink(this.safe(key)).catch(()=>undefined)}
  async read(key:string):Promise<Readable>{const client=this.client();if(!client)return createReadStream(this.safe(key));const result=await client.send(new GetObjectCommand({Bucket:process.env.S3_BUCKET!,Key:key}));if(!result.Body)throw new Error('Media body is missing');return result.Body as Readable}
  url(key:string){return resolveMediaUrl(key)}
  private safe(key:string){const target=path.resolve(this.root,key);if(!target.startsWith(`${this.root}${path.sep}`))throw new BadRequestException('Invalid media key');return target}
}
