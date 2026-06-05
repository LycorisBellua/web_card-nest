import { useState, useEffect } from 'react';
import type { User, OtherUserOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { CanDisciplineThisUser } from 'functions/Ranks';
import {
  EnableLobbyTimeoutRequest,
  EnableGuestLobbyTimeoutRequest,
  DisableLobbyTimeoutRequest,
  DisableGuestLobbyTimeoutRequest,
  GetLobbyTimeoutStateRequest,
  GetGuestLobbyTimeoutStateRequest,
} from 'functions/Requests';
import { BtnDefault } from 'components/btn/Btn';

function ToggleChatTimeout({ otherUser }: { otherUser: OtherUserOrGuest }) {
  const { user, setUser } = useUser();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const can_discipline = CanDisciplineThisUser(
    user?.rank ?? '',
    otherUser?.rank ?? '',
  );

  async function handleEnable() {
    try {
      if (!can_discipline) return;
      if (otherUser) {
        let accessToken = user!.accessToken;
        const realState = await GetLobbyTimeoutStateRequest(
          accessToken,
          otherUser.id,
        );
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await EnableLobbyTimeoutRequest(
          accessToken,
          otherUser.id,
        );
        if (!accessToken.length) return;
        setIsEnabled(true);
        setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      } else {
        let accessToken = user!.accessToken;
        const realState = await GetGuestLobbyTimeoutStateRequest(accessToken);
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await EnableGuestLobbyTimeoutRequest(accessToken);
        if (!accessToken.length) return;
        setIsEnabled(true);
        setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      }
    } catch {
      return;
    }
  }

  async function handleDisable() {
    try {
      if (!can_discipline) return;
      if (otherUser) {
        let accessToken = user!.accessToken;
        const realState = await GetLobbyTimeoutStateRequest(
          accessToken,
          otherUser.id,
        );
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await DisableLobbyTimeoutRequest(
          accessToken,
          otherUser.id,
        );
        if (!accessToken.length) return;
        setIsEnabled(false);
        setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      } else {
        let accessToken = user!.accessToken;
        const realState = await GetGuestLobbyTimeoutStateRequest(accessToken);
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await DisableGuestLobbyTimeoutRequest(accessToken);
        if (!accessToken.length) return;
        setIsEnabled(false);
        setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      }
    } catch {
      return;
    }
  }

  useEffect(() => {
    async function fetchTimeoutState() {
      try {
        if (!can_discipline) return;
        if (otherUser) {
          let accessToken = user!.accessToken;
          const data = await GetLobbyTimeoutStateRequest(
            accessToken,
            otherUser.id,
          );
          if (!data.accessToken.length) return;
          accessToken = data.accessToken;
          setIsEnabled(data.enabled);
          setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
        } else {
          let accessToken = user!.accessToken;
          const data = await GetGuestLobbyTimeoutStateRequest(accessToken);
          if (!data.accessToken.length) return;
          accessToken = data.accessToken;
          setIsEnabled(data.enabled);
          setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
        }
      } catch {
        setIsEnabled(false);
      }
    }
    void fetchTimeoutState();
  }, [can_discipline, otherUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!can_discipline) {
    return <></>;
  }

  return (
    <>
      {isEnabled ? (
        <BtnDefault onClick={() => void handleDisable()}>
          Disable Chat Timeout
        </BtnDefault>
      ) : (
        <BtnDefault onClick={() => void handleEnable()}>
          Enable Chat Timeout
        </BtnDefault>
      )}
    </>
  );
}

export default ToggleChatTimeout;
