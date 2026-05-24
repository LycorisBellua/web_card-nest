import type { User, LimitedUser } from 'context/Types';

export async function RefreshTokenRequest(
  accessToken: string,
): Promise<string> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
  });
  if (!res.ok) {
    if (res.status != 401) await LogoutRequest(accessToken);
    return '';
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

export async function FetchSelfRequest(accessToken: string): Promise<{
  user: User | null;
  blocked: LimitedUser[];
  friends: LimitedUser[];
  sentFriends: LimitedUser[];
  receivedFriends: LimitedUser[];
}> {
  const res = await fetch('/api/user/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401)
      return {
        user: null,
        blocked: [],
        friends: [],
        sentFriends: [],
        receivedFriends: [],
      };
    const newAccessToken = await RefreshTokenRequest(accessToken);
    if (!newAccessToken.length)
      return {
        user: null,
        blocked: [],
        friends: [],
        sentFriends: [],
        receivedFriends: [],
      };
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
  const user = {
    id: data.id,
    username: data.username,
    avatar: data.avatar,
    rank: data.rank,
    registered: new Date(data.date),
    desc: data.desc,
    isOnline: false,
    email: data.email,
    unverifiedEmail: data.email_unverified,
    accessToken: accessToken,
  } as User;
  const bl = await FetchSelfBlockedListRequest(accessToken);
  if (!bl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = bl.accessToken;
  const fl = await FetchSelfFriendListRequest(accessToken);
  if (!fl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = fl.accessToken;
  const sl = await FetchSelfSentListRequest(accessToken);
  if (!sl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = sl.accessToken;
  const rl = await FetchSelfReceivedListRequest(accessToken);
  if (!rl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = rl.accessToken;
  user!.accessToken = accessToken;
  return {
    user: user,
    blocked: bl.users,
    friends: fl.users,
    sentFriends: sl.users,
    receivedFriends: rl.users,
  };
}

export async function ResendVerificationEmailRequest(
  accessToken: string,
): Promise<string> {
  let res = await fetch('/api/auth/resend', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/auth/resend', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function ChangeRankRequest(
  accessToken: string,
  userId: string,
  newRank: string,
): Promise<string> {
  let res = await fetch('/api/admin/rank', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetId: userId,
      rank: newRank.toUpperCase(),
    }),
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/admin/rank', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetId: userId,
        rank: newRank.toUpperCase(),
      }),
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function DeleteSelfRequest(accessToken: string): Promise<string> {
  let res = await fetch('/api/user', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/user', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function DeleteUserRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch(`/api/admin/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch(`/api/admin/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function FetchSelfBlockedListRequest(
  accessToken: string,
): Promise<{ accessToken: string; users: LimitedUser[] }> {
  let res = await fetch('/api/rel/block', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', users: [] };
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', users: [] };
    res = await fetch('/api/rel/block', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', users: [] };
  }
  const users = (await res.json()) as LimitedUser[];
  return { accessToken, users };
}

export async function FetchSelfFriendListRequest(
  accessToken: string,
): Promise<{ accessToken: string; users: LimitedUser[] }> {
  let res = await fetch('/api/rel/friend', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', users: [] };
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', users: [] };
    res = await fetch('/api/rel/friend', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', users: [] };
  }
  const users = (await res.json()) as LimitedUser[];
  return { accessToken, users };
}

export async function FetchSelfSentListRequest(
  accessToken: string,
): Promise<{ accessToken: string; users: LimitedUser[] }> {
  let res = await fetch('/api/rel/friend/sent', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', users: [] };
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', users: [] };
    res = await fetch('/api/rel/friend/sent', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', users: [] };
  }
  const users = (await res.json()) as LimitedUser[];
  return { accessToken, users };
}

export async function FetchSelfReceivedListRequest(
  accessToken: string,
): Promise<{ accessToken: string; users: LimitedUser[] }> {
  let res = await fetch('/api/rel/friend/received', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', users: [] };
    accessToken = await RefreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', users: [] };
    res = await fetch('/api/rel/friend/received', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', users: [] };
  }
  const users = (await res.json()) as LimitedUser[];
  return { accessToken, users };
}
