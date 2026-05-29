import { useState } from 'react';
import type { User } from 'context/Types';
import { useUser } from 'context/useUser';
import {
  ExtractProfileDataJSON,
  ExtractProfileDataCSV,
} from 'functions/Requests';
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
  const [jsonSelected, setJsonSelected] = useState<boolean>(false);
  const [csvSelected, setCsvSelected] = useState<boolean>(false);
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

  const handleDownloadJSON = (data: object, filename = 'data.json') => {
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

  const handleDownloadCSV = (data: string, filename = 'data.csv') => {
    const blob = new Blob([data], { type: 'text/csv' });
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
      const anyFormatSelected = jsonSelected || csvSelected;
      if (!anyDataSelected) {
        setMessage('No data has been selected.');
        return;
      } else if (!anyFormatSelected) {
        setMessage('No format has been selected.');
        return;
      }
      setMessage('');
      setDisplaySpinner(true);
      let accessToken = user!.accessToken;
      if (jsonSelected) {
        if (profileSelected) {
          const profileJson = await ExtractProfileDataJSON(accessToken);
          accessToken = profileJson.accessToken;
          if (!accessToken.length) {
            setMessage('Error with: JSON - User profile');
            setDisplaySpinner(false);
            return;
          }
          handleDownloadJSON(profileJson.data, 'profile.json');
        }
      }
      if (csvSelected) {
        if (profileSelected) {
          const profileCsv = await ExtractProfileDataCSV(accessToken);
          accessToken = profileCsv.accessToken;
          if (!accessToken.length) {
            setMessage('Error with: CSV - User profile');
            setDisplaySpinner(false);
            return;
          }
          handleDownloadCSV(profileCsv.data, 'profile.csv');
        }
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
    one message.
    - Add the requests to extract the lobby and individual DM threads as well.
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
      <h2>Select format</h2>
      <Checkbox
        label="JSON"
        checked={jsonSelected}
        onChange={setJsonSelected}
      />
      <Checkbox label="CSV" checked={csvSelected} onChange={setCsvSelected} />
      <BtnAccent onClick={() => void handleExtract()}>Extract</BtnAccent>
      {displaySpinner && <Spinner label="Extracting..." />}
      {message && <p>{message}</p>}
    </ScrollablePage>
  );
}

export default DataExtraction;
