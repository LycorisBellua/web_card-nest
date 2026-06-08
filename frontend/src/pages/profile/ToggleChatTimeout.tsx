import { useState, useEffect } from 'react';
import type { User, OtherUserOrGuest } from 'context/Types';
import { useUser } from 'context/useUser';
import { canDisciplineThisUser } from 'functions/Ranks';
import {
  enableLobbyTimeoutRequest,
  enableGuestLobbyTimeoutRequest,
  DisableLobbyTimeoutRequest,
  disableGuestLobbyTimeoutRequest,
  getLobbyTimeoutStateRequest,
  getGuestLobbyTimeoutStateRequest,
} from 'functions/Requests';
import { BtnDefault } from 'components/btn/Btn';

function ToggleChatTimeout({ otherUser }: { otherUser: OtherUserOrGuest }) {
  const { user, setUser } = useUser();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const can_discipline = canDisciplineThisUser(
    user?.rank ?? '',
    otherUser?.rank ?? '',
  );

  async function handleEnable() {
    try {
      if (!can_discipline) return;
      if (otherUser) {
        let accessToken = user!.accessToken;
        const realState = await getLobbyTimeoutStateRequest(
          accessToken,
          otherUser.id,
        );
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await enableLobbyTimeoutRequest(
          accessToken,
          otherUser.id,
        );
        if (!accessToken.length) return;
        setIsEnabled(true);
        setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      } else {
        let accessToken = user!.accessToken;
        const realState = await getGuestLobbyTimeoutStateRequest(accessToken);
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await enableGuestLobbyTimeoutRequest(accessToken);
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
        const realState = await getLobbyTimeoutStateRequest(
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
        const realState = await getGuestLobbyTimeoutStateRequest(accessToken);
        if (!realState.accessToken.length) return;
        accessToken = realState.accessToken;
        if (realState.enabled !== isEnabled) {
          setIsEnabled(realState.enabled);
          return;
        }
        accessToken = await disableGuestLobbyTimeoutRequest(accessToken);
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
          const realState = await getLobbyTimeoutStateRequest(
            accessToken,
            otherUser.id,
          );
          if (!realState.accessToken.length) return;
          accessToken = realState.accessToken;
          setIsEnabled(realState.enabled);
          setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
        } else {
          let accessToken = user!.accessToken;
          const realState = await getGuestLobbyTimeoutStateRequest(accessToken);
          if (!realState.accessToken.length) return;
          accessToken = realState.accessToken;
          setIsEnabled(realState.enabled);
          setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
        }
      } catch {
        setIsEnabled(false);
      }
    }
    void fetchTimeoutState();
  }, [otherUser]); // eslint-disable-line react-hooks/exhaustive-deps

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
