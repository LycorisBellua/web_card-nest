import type { User } from 'context/Types';

export async function RefreshTokenRequest(
  accessToken: string,
): Promise<string> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const data = (await res.json()) as {
      message: string;
      statusCode: number;
    };
    if (data.statusCode == 401) {
      await LogoutRequest(accessToken);
      return '';
    }
  }
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

export async function LogoutRequest(accessToken: string): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function FetchSelfRequest(
  accessToken: string,
): Promise<User | null> {
  const res = await fetch('/api/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const data = (await res.json()) as {
      message: string;
      statusCode: number;
    };
    if (data.statusCode != 401) return null;
    const newAccessToken = await RefreshTokenRequest(accessToken);
    if (!newAccessToken.length) return null;
    accessToken = newAccessToken;
  }
  const data = (await res.json()) as {
    id: string;
    username: string;
    avatar: string;
    rank: string;
	date: Date;
	desc: string;
    email: string;
    email_unverified: string;
  };
  return {
    id: data.id,
    username: data.username,
    avatar: data.avatar,
    rank: data.rank,
    registered: data.date,
    description: data.desc,
    isOnline: true,
    email: data.email,
    unverifiedEmail: data.email_unverified,
    accessToken: accessToken,
  } as User;
}
