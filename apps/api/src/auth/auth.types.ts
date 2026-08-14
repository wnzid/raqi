import type { UserRole } from '@footwear/shared';

export interface AuthenticatedUser { id: string; email: string; name: string; role: UserRole; }
