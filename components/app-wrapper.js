import React, { useState, useEffect } from 'react'

import { getLicenseFlag, saveEncryptionFlag } from '../local-storage'

import App from './app'
import AppLoadingView from './common/app-loading'
import AppStatusBar from './common/app-status-bar'
import AcceptLicense from './AcceptLicense'
import PasswordPrompt from './password-prompt'

export default function AppWrapper() {
  const [isLoading, setIsLoading] = useState(true)
  const [isLicenseAccepted, setIsLicenseAccepted] = useState(false)
  const [isDbEncrypted, setIsDbEncrypted] = useState(true)

  const checkIsLicenseAccepted = async () => {
    const isLicenseFlagSet = await getLicenseFlag()
    setIsLicenseAccepted(isLicenseFlagSet)
    setIsLoading(false)
  }

  useEffect(() => {
    checkIsLicenseAccepted()
    checkIsDbEncrypted()
  }, [])

  if (isLoading) {
    return <AppLoadingView />
  }

  if (!isLicenseAccepted) {
    return <AcceptLicense setLicense={() => setIsLicenseAccepted(true)} />
  }

  return (
    <>
      <AppStatusBar />
      {isDbEncrypted ? (
        <PasswordPrompt enableShowApp={() => setIsDbEncrypted(false)} />
      ) : (
        <App restartApp={() => {return isDbEncrypted}} />
      )}
    </>
  )
}
