import type { User, LimitedUser } from 'context/Types';
import { addAvatarPrefix } from 'functions/UserValidation';

export async function refreshTokenRequest(
  accessToken: string,
): Promise<string> {
  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
  });
  if (!res.ok) {
    if (res.status != 401) await logoutRequest(accessToken);
    return '';
  }
  const data = (await res.json()) as { accessToken: string };
  return data.accessToken;
}

export async function logoutRequest(accessToken: string): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function fetchSelfRequest(accessToken: string): Promise<{
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
    const newaccessToken = await refreshTokenRequest(accessToken);
    if (!newaccessToken.length)
      return {
        user: null,
        blocked: [],
        friends: [],
        sentFriends: [],
        receivedFriends: [],
      };
    accessToken = newaccessToken;
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
    avatar: addAvatarPrefix(data.avatar),
    rank: data.rank,
    registered: new Date(data.date),
    desc: data.desc,
    email: data.email,
    email_unverified: data.email_unverified,
    accessToken: accessToken,
  } as User;
  if (user!.rank.toLowerCase() == 'pending')
    return {
      user: user,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  const bl = await fetchSelfBlockedListRequest(accessToken);
  if (!bl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = bl.accessToken;
  const fl = await fetchSelfFriendListRequest(accessToken);
  if (!fl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = fl.accessToken;
  const sl = await fetchSelfSentListRequest(accessToken);
  if (!sl.accessToken.length)
    return {
      user: null,
      blocked: [],
      friends: [],
      sentFriends: [],
      receivedFriends: [],
    };
  accessToken = sl.accessToken;
  const rl = await fetchSelfReceivedListRequest(accessToken);
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

export async function resendVerificationEmailRequest(
  accessToken: string,
): Promise<string> {
  let res = await fetch('/api/auth/verify/resend', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/auth/verify/resend', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function cancelEmailVerificationRequest(
  accessToken: string,
): Promise<string> {
  let res = await fetch('/api/auth/verify/cancel', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/auth/verify/cancel', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  const data = (await res.json()) as boolean;
  if (!data) return '';
  return accessToken;
}

export async function changeRankRequest(
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
    accessToken = await refreshTokenRequest(accessToken);
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

export async function deleteSelfRequest(accessToken: string): Promise<string> {
  let res = await fetch('/api/user', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
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

export async function deleteUserRequest(
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
    accessToken = await refreshTokenRequest(accessToken);
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

export async function fetchSelfBlockedListRequest(
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
    accessToken = await refreshTokenRequest(accessToken);
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
  const prefixed = users.map((u) => ({
    ...u,
    avatar: addAvatarPrefix(u.avatar),
  }));
  return { accessToken: accessToken, users: prefixed };
}

export async function fetchSelfFriendListRequest(
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
    accessToken = await refreshTokenRequest(accessToken);
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
  const prefixed = users.map((u) => ({
    ...u,
    avatar: addAvatarPrefix(u.avatar),
  }));
  return { accessToken: accessToken, users: prefixed };
}

export async function fetchSelfSentListRequest(
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
    accessToken = await refreshTokenRequest(accessToken);
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
  const prefixed = users.map((u) => ({
    ...u,
    avatar: addAvatarPrefix(u.avatar),
  }));
  return { accessToken: accessToken, users: prefixed };
}

export async function fetchSelfReceivedListRequest(
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
    accessToken = await refreshTokenRequest(accessToken);
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
  const prefixed = users.map((u) => ({
    ...u,
    avatar: addAvatarPrefix(u.avatar),
  }));
  return { accessToken: accessToken, users: prefixed };
}

export async function removeFriendshipRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch(`/api/rel/friend/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch(`/api/rel/friend/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function askFriendshipRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch('/api/rel/friend', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetId: userId,
    }),
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/rel/friend', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetId: userId,
      }),
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function cancelFriendshipRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch(`/api/rel/friend/cancel/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch(`/api/rel/friend/cancel/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function acceptFriendshipRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch('/api/rel/friend/accept', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetId: userId,
    }),
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/rel/friend/accept', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetId: userId,
      }),
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function rejectFriendshipRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch(`/api/rel/friend/reject/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch(`/api/rel/friend/reject/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function unblockingRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch(`/api/rel/block/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch(`/api/rel/block/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function blockingRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch('/api/rel/block', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetId: userId,
    }),
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/rel/block', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetId: userId,
      }),
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function fetchOtherFriendListRequest(
  accessToken: string,
  userId: string,
): Promise<{ accessToken: string; users: LimitedUser[] }> {
  let res = await fetch(`/api/rel/friend/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', users: [] };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', users: [] };
    res = await fetch(`/api/rel/friend/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', users: [] };
  }
  const users = (await res.json()) as LimitedUser[];
  const prefixed = users.map((u) => ({
    ...u,
    avatar: addAvatarPrefix(u.avatar),
  }));
  return { accessToken: accessToken, users: prefixed };
}

export async function extractProfileDataRequest(
  accessToken: string,
): Promise<{ accessToken: string; data: object }> {
  let res = await fetch('/api/gdpr/export/profile', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', data: {} };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', data: {} };
    res = await fetch('/api/gdpr/export/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', data: {} };
  }
  const data = (await res.json()) as object;
  return { accessToken: accessToken, data: data };
}

export async function extractLobbyDataRequest(
  accessToken: string,
): Promise<{ accessToken: string; data: object }> {
  let res = await fetch('/api/gdpr/export/lobby', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', data: {} };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', data: {} };
    res = await fetch('/api/gdpr/export/lobby', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', data: {} };
  }
  const data = (await res.json()) as object;
  return { accessToken: accessToken, data: data };
}

export async function extractDMDataRequest(
  accessToken: string,
  friendId: string,
): Promise<{ accessToken: string; data: object }> {
  let res = await fetch(`/api/gdpr/export/dm/${friendId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', data: {} };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', data: {} };
    res = await fetch(`/api/gdpr/export/dm/${friendId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', data: {} };
  }
  const data = (await res.json()) as object;
  return { accessToken: accessToken, data: data };
}

export async function extractAllDataRequest(
  accessToken: string,
  dto: { profile?: boolean; lobby?: boolean; friendIds?: string[] },
): Promise<{ accessToken: string; blob: Blob | null }> {
  const body = JSON.stringify(dto);
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  let res = await fetch('/api/gdpr/export/all', {
    method: 'POST',
    headers,
    body,
  });
  if (!res.ok) {
    if (res.status !== 401) return { accessToken, blob: null };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', blob: null };
    res = await fetch('/api/gdpr/export/all', {
      method: 'POST',
      headers: { ...headers, Authorization: `Bearer ${accessToken}` },
      body,
    });
    if (!res.ok) return { accessToken, blob: null };
  }
  const blob = await res.blob();
  return { accessToken, blob };
}

export async function enableLobbyTimeoutRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch('/api/admin/ban/user', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetId: userId,
    }),
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/admin/ban/user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetId: userId,
      }),
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function enableGuestLobbyTimeoutRequest(
  accessToken: string,
): Promise<string> {
  let res = await fetch('/api/admin/ban/guest', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/admin/ban/guest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function DisableLobbyTimeoutRequest(
  accessToken: string,
  userId: string,
): Promise<string> {
  let res = await fetch(`/api/admin/ban/user/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch(`/api/admin/ban/user/${userId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function disableGuestLobbyTimeoutRequest(
  accessToken: string,
): Promise<string> {
  let res = await fetch('/api/admin/ban/guest', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return '';
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return '';
    res = await fetch('/api/admin/ban/guest', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return '';
  }
  return accessToken;
}

export async function getLobbyTimeoutStateRequest(
  accessToken: string,
  userId: string,
): Promise<{ accessToken: string; enabled: boolean }> {
  let res = await fetch(`/api/admin/ban/user/${userId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', enabled: false };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', enabled: false };
    res = await fetch(`/api/admin/ban/user/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', enabled: false };
  }
  // Note: For some reason, the frontend kept crashing with `res.json()`
  const text = await res.text();
  const enabled = !!text;
  return { accessToken: accessToken, enabled: enabled };
}

export async function getGuestLobbyTimeoutStateRequest(
  accessToken: string,
): Promise<{ accessToken: string; enabled: boolean }> {
  let res = await fetch('/api/admin/ban/guest', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    if (res.status != 401) return { accessToken: '', enabled: false };
    accessToken = await refreshTokenRequest(accessToken);
    if (!accessToken.length) return { accessToken: '', enabled: false };
    res = await fetch('/api/admin/ban/guest', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) return { accessToken: '', enabled: false };
  }
  // Note: For some reason, the frontend kept crashing with `res.json()`
  const text = await res.text();
  const enabled = !!text;
  return { accessToken: accessToken, enabled: enabled };
}
