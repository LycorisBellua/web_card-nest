import { useState } from 'react';
import type { User } from 'context/Types';
import { useUser } from 'context/useUser';
import { ExtractProfileData } from 'functions/Requests';
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
  const [profileSelected, setProfileSelected] = useState<boolean>(false);
  const [lobbySelected, setLobbySelected] = useState<boolean>(false);
  const [dmSelected, setDmSelected] = useState<boolean[]>(() =>
    Array.from({ length: friends.length }, () => false),
  );
  const [displaySpinner, setDisplaySpinner] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const allDmsSelected = dmSelected.length > 0 && dmSelected.every(Boolean);

  if (!user) {
    return (
      <ScrollablePage>
        <h1>Personal Data Extraction</h1>
        <p>You must be logged in to request data extraction.</p>
      </ScrollablePage>
    );
  }

  const handleDownload = (data: object, filename = 'data.json') => {
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
      if (profileSelected) {
        const profileJson = await ExtractProfileData(accessToken);
        accessToken = profileJson.accessToken;
        if (!accessToken.length) {
          setMessage('Error with: User profile extraction');
          setDisplaySpinner(false);
          return;
        }
        handleDownload(profileJson.data, 'profile.json');
      }
      setUser((prev) => ({ ...prev, accessToken: accessToken }) as User);
      setMessage('');
      setDisplaySpinner(false);
    } catch {
      setMessage('');
      setDisplaySpinner(false);
    }
  }

  /*
    TODO
    - For the lobby, only make it selectable if the user has posted at least 
    one message (even if this message is marked as moderated, or even if the 
    user is currently in time out).
    - Add the requests to extract the lobby and individual DM threads as well. 
    Do extract a DM thread even if empty, or specify in the Privacy Policy that 
    it's not extracted if empty.
    - Explain in the Privacy Policy that the avatar is omitted from user 
    extractions (you and friends for example), because it'd be too heavy.
  */

  return (
    <ScrollablePage>
      <h1>Personal Data Extraction</h1>
      <h2>Select data</h2>
      <Checkbox
        label="User profile"
        checked={profileSelected}
        onChange={setProfileSelected}
      />
      <Checkbox
        label="Chat: Lobby"
        checked={lobbySelected}
        onChange={setLobbySelected}
      />
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
