import React, { useState, useEffect } from 'react'

import { getLicenseFlag, saveEncryptionFlag } from '../local-storage'
import { openDb } from '../db'

import App from './app'
import AppLoadingView from './common/app-loading'
import AppStatusBar from './common/app-status-bar'
import AcceptLicense from './AcceptLicense'
import PasswordPrompt from './password-prompt'

export default function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLicenseAccepted, setIsLicenseAccepted] = useState(false)
  const [isDbEncrypted, setIsDbEncrypted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginCheckLoading, setIsLoginCheckLoading] = useState(false);

  const checkIsLicenseAccepted = async () => {
    const isLicenseFlagSet = await getLicenseFlag()
    setIsLicenseAccepted(isLicenseFlagSet)
    setIsLoading(false)
  }

  const checkIsDbEncrypted = async () => {
    const isEncrypted = !(await openDb())
    if (isEncrypted) setIsDbEncrypted(true)
    await saveEncryptionFlag(isEncrypted)
  }

const checkLoginStatus = async () => {
  try {
    const response = await fetch('https://inprove-sport.info/reg/isLoggedIn');
    const data = await response.json();

  // const data = { res: 'no' }; // This line simulates the server response for testing

    if (data.res === 'no') {
      setIsLoggedIn(false);
      setIsDbEncrypted(true);
    } else if (data.res === 'ok') {
      setIsLoggedIn(true);
      setIsDbEncrypted(false);
    } else {
      // Handle unexpected response
      console.error('Unexpected response:', data);
      setIsLoggedIn(false);
      setIsDbEncrypted(false);
    }
  } catch (error) {
    console.error('Error checking login status:', error);
    setIsLoggedIn(false);
    setIsDbEncrypted(false);
  } finally {
    setIsLoginCheckLoading(true);
  }
};

  useEffect(() => {
    checkIsLicenseAccepted()
    checkIsDbEncrypted()
    checkLoginStatus();
  }, [])

if (isLoading || !isLoginCheckLoading) {
    return <AppLoadingView />;
  }

  if (!isLicenseAccepted) {
    return <AcceptLicense setLicense={() => setIsLicenseAccepted(true)} />
  }

     if (!isLoggedIn && isDbEncrypted) {
       return (
         <>
           <AppStatusBar />
           <PasswordPrompt enableShowApp={() => setIsLoggedIn(true)} />
         </>
       );
     }

  return (
    <>
      <AppStatusBar />
      {isDbEncrypted ? (
        <PasswordPrompt enableShowApp={() => setIsDbEncrypted(false)} />
      ) : (
        <App restartApp={() => checkIsDbEncrypted()} />
      )}
    </>
  )
}