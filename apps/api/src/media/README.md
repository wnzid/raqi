# Media boundary

Media records store provider-neutral object keys. A future `ObjectStorage` interface will receive endpoint, region, bucket, credentials, and public URL from validated environment configuration. Application code must not persist provider-specific URLs or SDK response types.
