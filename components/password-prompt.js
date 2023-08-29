import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Alert, KeyboardAvoidingView, StyleSheet, View } from 'react-native'
import axios from 'axios';

import AppPage from './common/app-page'
import AppTextInput from './common/app-text-input'
import Segment from './common/segment'
import Button from './common/button'
import Header from './header'
import ConfirmWithPassword from './settings/common/confirm-with-password'


import { saveEncryptionFlag } from '../local-storage'
import { deleteDbAndOpenNew, openDb } from '../db'
import { passwordPrompt as labels, shared } from '../i18n/en/labels'
import { Containers, Spacing } from '../styles'

const cancelButton = { text: shared.cancel, style: 'cancel' }

const PasswordPrompt = ({ enableShowApp }) => {
  const [eMail, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isButtonDisabled, setIsButtonDisabled] = useState(true)
  const [enteringEmail, setEnteringEmail] = useState(false)

  useEffect(() => {
    setIsButtonDisabled(!(eMail && password));
  }, [eMail, password]);

  const onDeleteDataConfirmation = async () => {
    await deleteDbAndOpenNew()
    await saveEncryptionFlag(false)
    enableShowApp()
  }

  const onDeleteData = () => {
    Alert.alert(labels.areYouSureTitle, labels.areYouSure, [
      cancelButton,
      {
        text: labels.reallyDeleteData,
        onPress: onDeleteDataConfirmation,
      },
    ])
  }

  const onConfirmDeletion = async () => {
    Alert.alert(labels.deleteDatabaseTitle, labels.deleteDatabaseExplainer, [
      cancelButton,
      { text: labels.deleteData, onPress: onDeleteData },
    ])
  }

  const forgotPassword = () => {
    setEnteringEmail(true)
  }

  const handleError = () => {
    Alert.alert(shared.errorTitle, shared.errorMessage, [
      {
        text: shared.tryAgain,
        onPress: () => {
          setEmail(null)
        },
      },
    ])
  }

  const requestPasswordChange = () => {
    Alert.alert(shared.successTitle, shared.checkEmail, [
      {
        text: shared.ok,
        onPress: () => {
          setEnteringEmail(false)
        },
      },
    ])
  }

  const cancelConfirmationWithPassword = () => {
    setEmail(null)
    setEnteringEmail(false)
  }

  const authorizeLogin = async () => {
    const loginUrl = 'https://inprove-sport.info/reg/login_server_5';

    const data = {
      email: eMail,
      password: password,
    };

    try {
      const response = await axios.post(loginUrl, JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.status === 200) {
        if (response.data.res === 'yes') {
          enableShowApp()
        } else if (response.data.res === 'no') {
          Alert.alert(shared.incorrectLogin, shared.incorrectLoginMessage, [
            {
              text: shared.tryAgain,
              onPress: () => {
                setPassword('')
                setEmail('')
              },
            },
          ])
        } else {
          console.log(`Unexpected response: ${response.data}`)
        }

      } else {
        console.log(`Login request failed with status ${response.status}`)
      }

    } catch (error) {
      console.error(`Error occured: ${error}`);
    }
  };

  if (enteringEmail) {
    return (
      <>
        <Header isStatic />
        <AppPage contentContainerStyle={styles.contentContainer}>
          <Segment title='Request Changing Your Password' last>
            <ConfirmWithPassword
              onSuccess={requestPasswordChange}
              onCancel={cancelConfirmationWithPassword}
              onError={handleError}
            />
          </Segment>
        </AppPage>
      </>
    )
  }

  return (
    <>
      <Header isStatic />
      <AppPage contentContainerStyle={styles.contentContainer}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={150}>
          <AppTextInput
            onChangeText={setEmail}
            placeholder={labels.enterEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppTextInput
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder={labels.enterPassword}
          />
          <View style={styles.containerButtons}>
            <Button onPress={forgotPassword}>{labels.forgotPassword}</Button>
            <Button
              disabled={isButtonDisabled}
              isCTA={!isButtonDisabled}
              onPress={authorizeLogin}
            >
              {labels.title}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </AppPage>
    </>
  )
}

PasswordPrompt.propTypes = {
  enableShowApp: PropTypes.func.isRequired,
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: Spacing.base,
  },
  containerButtons: {
    ...Containers.rowContainer,
    justifyContent: 'space-around',
  },
})

export default PasswordPrompt
