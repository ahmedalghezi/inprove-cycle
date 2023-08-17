import React, { useState } from 'react'
import PropTypes from 'prop-types'

import Button from '../../common/button'

import EnterNewPassword from './enter-new-password'
import showBackUpReminder from './show-backup-reminder'
import ConfirmWithPassword from '../common/confirm-with-password'

import settings from '../../../i18n/en/settings'

const ChangePassword = ({
  restartAndNavigateHome,
  onStartChange,
  onCancelChange,
}) => {
  const [currentEmail, setCurrentEmail] = useState(null)
  const [enteringCurrentPassword, setEnteringCurrentPassword] = useState(false)
  const [enteringNewPassword, setEnteringNewPassword] = useState(false)
  const [enteringEmail, setEnteringEmail] = useState(false)

  const startChangingPassword = () => {
    showBackUpReminder(
      startEnteringEmail,
      cancelConfirmationWithPassword
    )
  }

  const startEnteringEmail = () => {
    setEnteringEmail(true)
    onStartChange()
  }

  const startEnteringCurrentPassword = () => {
    setEnteringCurrentPassword(true)
    onStartChange()
  }

  const startEnteringNewPassword = () => {
    setCurrentPassword(null)
    setEnteringNewPassword(true)
    setEnteringCurrentPassword(false)
  }

  const cancelConfirmationWithPassword = () => {
    setCurrentEmail(null)
    setEnteringNewPassword(false)
    setEnteringEmail(false)
    onCancelChange()
  }

  const requestPasswordChange = () => {
    restartAndNavigateHome()
    console.log("Successfully requested password change.")
  }

  const labels = settings.passwordSettings
  const isEmailSet = currentEmail !== null

  if (enteringEmail) {
    return (
      <ConfirmWithPassword
        onSuccess={requestPasswordChange}
        onCancel={cancelConfirmationWithPassword}
      />
    )
  }

  if (enteringNewPassword) {
    return (
      <EnterNewPassword
        changeEncryptionAndRestart={changeEncryptionAndRestart}
      />
    )
  }

  return (
    <Button disabled={isEmailSet} isCTA onPress={startChangingPassword}>
      {labels.changePassword}
    </Button>
  )
}

export default ChangePassword

ChangePassword.propTypes = {
  onStartChange: PropTypes.func,
  onCancelChange: PropTypes.func,
  changeEncryptionAndRestart: PropTypes.func,
}
