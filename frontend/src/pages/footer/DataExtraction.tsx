import { useState, useEffect } from 'react';
import type { User, PublicMsg } from 'context/Types';
import { useUser } from 'context/useUser';
import { useSocket } from 'context/useSocket';
import { ExtractAllDataRequest } from 'functions/Requests';
import { ScrollablePage } from 'components/general/Scrollable';
import Checkbox from 'components/misc/Checkbox';
import Spinner from 'components/misc/Spinner';
import { BtnAccent } from 'components/btn/Btn';
import styled from 'styled-components';

const ShiftBox = styled.div`
  margin-left: 32px;
`;

function DataExtraction() {
  const { user, setUser, friends } = useUser();
  const { socket } = useSocket();
  const [hasPostedInLobby, setHasPostedInLobby] = useState<boolean>(false);
  const [profileSelected, setProfileSelected] = useState<boolean>(false);
  const [lobbySelected, setLobbySelected] = useState<boolean>(false);
  const [dmSelected, setDmSelected] = useState<boolean[]>(() =>
    Array.from({ length: friends.length }, () => false),
  );
  const [displaySpinner, setDisplaySpinner] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const allDmsSelected = dmSelected.length > 0 && dmSelected.every(Boolean);

  /*
  // For individual JSON file:
  const handleDownload = (data: object, filename = 'card_nest_data.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  */

  // For the ZIP file:
  const handleDownload = (blob: Blob, filename = 'card_nest_data.zip') => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function handleExtract() {
    try {
      const anyDataSelected =
        profileSelected || lobbySelected || dmSelected.some(Boolean);
      if (!anyDataSelected) {
        setMessage('No data has been selected.');
        return;
      }
      setMessage('');
      setDisplaySpinner(true);
      let accessToken = user!.accessToken;
      const result = await ExtractAllDataRequest(accessToken, {
        profile: profileSelected,
        lobby: lobbySelected,
        friendIds: friends.filter((_, i) => dmSelected[i]).map((f) => f.id),
      });
      accessToken = result.accessToken;
      if (!accessToken.length || !result.blob) {
        setMessage('Error with data extraction');
        setDisplaySpinner(false);
        return;
      }
      handleDownload(result.blob, 'card_nest_data.zip');
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      setMessage('');
      setDisplaySpinner(false);
    } catch {
      setMessage('');
      setDisplaySpinner(false);
    }
  }

  useEffect(() => {
    socket.emit('FetchLobbyHistory', (data: PublicMsg[]) => {
      const posted = data.some(
        (msg) => msg.senderId !== null && msg.senderId === user?.id,
      );
      setHasPostedInLobby(posted);
    });
  }, [socket, user?.id]);

  useEffect(() => {
    function InitDmSelector() {
      setDmSelected(Array.from({ length: friends.length }, () => false));
    }
    InitDmSelector();
  }, [friends.length]);

  if (!user) {
    return (
      <ScrollablePage>
        <h1>Personal Data Extraction</h1>
        <p>You must be logged in to request data extraction.</p>
      </ScrollablePage>
    );
  }

  return (
    <ScrollablePage>
      <h1>Personal Data Extraction</h1>
      <h2>Select data</h2>
      <Checkbox
        label="User profile"
        checked={profileSelected}
        onChange={setProfileSelected}
      />
      {hasPostedInLobby && (
        <Checkbox
          label="Chat: Lobby"
          checked={lobbySelected}
          onChange={setLobbySelected}
        />
      )}
      {!friends.length ? (
        <></>
      ) : (
        <>
          <Checkbox
            label="Chat: All DMs"
            checked={allDmsSelected}
            onChange={(checked) =>
              setDmSelected(
                Array.from({ length: friends.length }, () => checked),
              )
            }
          />
          <ShiftBox>
            {friends.map((friend, i) => (
              <Checkbox
                key={friend.id}
                label={`Chat: DM with "${friend.username}"`}
                checked={dmSelected[i]}
                onChange={(checked) =>
                  setDmSelected((prev) =>
                    prev.map((val, j) => (j === i ? checked : val)),
                  )
                }
              />
            ))}
          </ShiftBox>
        </>
      )}
      <BtnAccent onClick={() => void handleExtract()}>Extract</BtnAccent>
      {displaySpinner && <Spinner label="Extracting..." />}
      {message && <p>{message}</p>}
    </ScrollablePage>
  );
}

export default DataExtraction;
