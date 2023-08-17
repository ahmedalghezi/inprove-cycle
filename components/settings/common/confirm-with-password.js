import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Alert, KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import { SHA512 } from 'jshashes'

import AppTextInput from '../../common/app-text-input'
import Button from '../../common/button'

import { openDb } from '../../../db'
import { Containers } from '../../../styles'
import settings from '../../../i18n/en/settings'
import { shared } from '../../../i18n/en/labels'
import { json } from 'stream/consumers'

const ConfirmWithPassword = ({ onSuccess, onCancel, onError }) => {
  const [email, setEmail] = useState(null)

  const handleChangePassword = async () => {
    const forgotPasswordUrl = 'https://inprove-sport.info/reg/forgetPassword';

    const data = {
      email: email,
    };

    try {
      const response = await fetch(forgotPasswordUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (response.ok) {
          onSuccess()
        } else {
          onError()
        }
      })

    } catch (error) {
      console.error('Error:', error);
    }
  };

  const labels = settings.passwordSettings
  const isEmail = email !== null

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={150}>
      <AppTextInput
        onChangeText={setEmail}
        placeholder={labels.enterEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <View style={styles.container}>
        <Button onPress={onCancel}>{shared.cancel}</Button>
        <Button
          disabled={!isEmail}
          isCTA={isEmail}
          onPress={handleChangePassword}
        >
          {shared.confirmToProceed}
        </Button>
      </View>
    </KeyboardAvoidingView>
  )
}

ConfirmWithPassword.propTypes = {
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func,
}

const styles = StyleSheet.create({
  container: {
    ...Containers.rowContainer,
  },
})

export default ConfirmWithPassword
