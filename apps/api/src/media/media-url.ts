export function resolveMediaUrl(objectKey:string):string {
  const base=(process.env.S3_PUBLIC_URL||process.env.MEDIA_PUBLIC_BASE_URL||'http://localhost:4000/api/media').replace(/\/$/,'');
  return `${base}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
}
