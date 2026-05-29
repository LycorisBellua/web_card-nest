import { Prisma, Ranks } from 'src/generated/prisma/client';

// GET PROFILE
export const userProfileSelect = {
  id: true,
  username: true,
  avatar: true,
  rank: true,
  desc: true,
} satisfies Prisma.UserSelect;

export type UserProfileRaw = Prisma.UserGetPayload<{
  select: typeof userProfileSelect;
}>;

export const ownProfileSelect = {
  ...userProfileSelect,
  email: true,
  email_unverified: true,
} satisfies Prisma.UserSelect;

export type OwnProfileRaw = Prisma.UserGetPayload<{
  select: typeof ownProfileSelect;
}>;

export type ConvertedAvatar<T extends { avatar: Uint8Array | null }> = Omit<
  T,
  'avatar'
> & { avatar: string | null };

export type UserProfile = ConvertedAvatar<UserProfileRaw>;
export type OwnProfile = ConvertedAvatar<OwnProfileRaw>;

// GET ALL PROFILES
export const noPendingUsers = {
  rank: { not: Ranks.PENDING },
} satisfies Prisma.UserWhereInput;

// REFRESH TOKENS
export const refreshDataSelect = {
  refreshToken: true,
  refreshTimeout: true,
} satisfies Prisma.UserSelect;

export type RefreshData = Prisma.UserGetPayload<{
  select: typeof refreshDataSelect;
}>;

// USER VERIFICATION
export const userVerificationSelect = {
  id: true,
  email: true,
  email_unverified: true,
  rank: true,
  password: true,
  username: true,
  verifyToken: true,
  verifyTimeout: true,
  refreshToken: true,
  refreshTimeout: true,
} satisfies Prisma.UserSelect;

export type VerificationData = Prisma.UserGetPayload<{
  select: typeof userVerificationSelect;
}>;

// UPDATE USER PROFILE DATA
export type UpdateProfileData = Pick<
  Prisma.UserUpdateInput,
  | 'username'
  | 'avatar'
  | 'desc'
  | 'email_unverified'
  | 'verifyToken'
  | 'verifyTimeout'
>;

// EMAIL VERIFICATION DATA
export type EmailVerData = Pick<
  Prisma.UserUpdateInput,
  'verifyToken' | 'verifyTimeout' | 'email_unverified'
>;

// EXPIRED EMAIL VERIFICATION
export const expiredToDeleteSelect = {
  email_unverified: true,
} satisfies Prisma.UserSelect;

export type ExpiredToDelete = Prisma.UserGetPayload<{
  select: typeof expiredToDeleteSelect;
}>[];

export const expiredToModifySelect = {
  ...expiredToDeleteSelect,
  email: true,
} satisfies Prisma.UserSelect;

export type ExpiredToModify = Prisma.UserGetPayload<{
  select: typeof expiredToModifySelect;
}>[];
