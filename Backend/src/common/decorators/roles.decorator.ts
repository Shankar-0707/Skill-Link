// roles decorator goes here 
import { SetMetadata } from "@nestjs/common"  // decorator ke through metadata attach krta h 
import { Role } from '@prisma/client'  // ye prisma schema se generated enum type hai

export const ROLES_KEY = 'roles'  // ye metadata ka identifier h mtlb key kya hogi => roles  ( Guard baad me isi key se metadat read krega )
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)

// Ye Code NestJs me role based access control ( RBAC ) implement krne ke liye ek customer decorator @Roles() bna rha h