import { BadRequestException,Injectable } from '@nestjs/common';
import { DeleteObjectCommand,GetObjectCommand,PutObjectCommand,S3Client } from '@aws-sdk/client-s3';
import { mkdir,readFile,unlink,writeFile } from 'node:fs/promises';
import path from 'node:path';import { randomUUID } from 'node:crypto';
import { resolveMediaUrl } from './media-url';
@Injectable() export class ObjectStorageService {
  private readonly root=path.resolve(process.env.MEDIA_LOCAL_PATH??'./uploads');
  private client(){if(!process.env.S3_ENDPOINT||!process.env.S3_ACCESS_KEY_ID||!process.env.S3_SECRET_ACCESS_KEY||!process.env.S3_BUCKET)return null;return new S3Client({endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION||'auto',credentials:{accessKeyId:process.env.S3_ACCESS_KEY_ID,secretAccessKey:process.env.S3_SECRET_ACCESS_KEY}})}
  async put(productId:string,file:{buffer:Buffer;mimetype:string;size:number}){const ext:Record<string,string>={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};if(!ext[file.mimetype]||!file.size||file.size>5*1024*1024)throw new BadRequestException('Only non-empty JPEG, PNG, or WebP images up to 5 MB are allowed');const key=`products/${productId}/${randomUUID()}.${ext[file.mimetype]}`;const client=this.client();if(client)await client.send(new PutObjectCommand({Bucket:process.env.S3_BUCKET!,Key:key,Body:file.buffer,ContentType:file.mimetype,CacheControl:'public, max-age=31536000, immutable'}));else{const target=this.safe(key);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,file.buffer)}return key}
  async remove(key:string){const client=this.client();if(client)await client.send(new DeleteObjectCommand({Bucket:process.env.S3_BUCKET!,Key:key}));else await unlink(this.safe(key)).catch(()=>undefined)}
  async read(key:string){const client=this.client();if(!client)return readFile(this.safe(key));const result=await client.send(new GetObjectCommand({Bucket:process.env.S3_BUCKET!,Key:key}));return Buffer.from(await result.Body!.transformToByteArray())}
  url(key:string){return resolveMediaUrl(key)}
  private safe(key:string){const target=path.resolve(this.root,key);if(!target.startsWith(`${this.root}${path.sep}`))throw new BadRequestException('Invalid media key');return target}
}
