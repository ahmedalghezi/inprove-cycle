import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Alert, KeyboardAvoidingView, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import axios from 'axios';

import AppPage from './common/app-page';
import AppTextInput from './common/app-text-input';
import Segment from './common/segment';
import Button from './common/button';
import Header from './header';
import ConfirmWithPassword from './settings/common/confirm-with-password';
import Logo from '../assets/inprove_logo_transparent1.png';
import { Image } from 'react-native';

import { saveEncryptionFlag } from '../local-storage';
import { deleteDbAndOpenNew, openDb } from '../db';
import { passwordPrompt as labels, shared } from '../i18n/en/labels';
import { Containers, Spacing } from '../styles';

const cancelButton = { text: shared.cancel, style: 'cancel' };

const PasswordPrompt = ({ enableShowApp }) => {
  const [eMail, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [enteringEmail, setEnteringEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = useCallback(() => {
    setIsButtonDisabled(!(eMail && password) || isLoading);
  }, [eMail, password, isLoading]);

  useEffect(() => {
    validateInputs();
  }, [eMail, password, isLoading, validateInputs]);

  useEffect(() => {
    let isMounted = true;

    const authorizeLogin = async () => {
      const loginUrl = 'https://inprove-sport.info/reg/login';

      const data = {
        email: eMail,
        password: password,
      };

      setIsLoading(true);

      try {
        const response = await axios.post(loginUrl, JSON.stringify(data), {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (isMounted) {
          console.log(`Response received: ${response.data.res}`);
          if (response.status === 200) {
            if (response.data.res === 'ok') {
              enableShowApp();
            } else if (response.data.res === 'wrong') {
              Alert.alert(shared.incorrectLogin, shared.incorrectLoginMessage, [
                {
                  text: shared.tryAgain,
                  onPress: () => {
                    setPassword('');
                    setEmail('');
                  },
                },
              ]);
            } else if (response.data.res === 'error') {
              Alert.alert(shared.serverErrorTitle, shared.serverErrorMessage, [
                {
                  text: shared.tryAgain,
                  onPress: () => {
                    setPassword('');
                    setEmail('');
                  },
                },
              ]);
            } else {
              console.log(`Unexpected response: ${response.data.res}`);
            }
          } else {
            console.log(`Login request failed with status ${response.status}`);
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error(`Error occurred: ${error}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (isLoading) {
      authorizeLogin();
    }

    return () => {
      isMounted = false;
    };
  }, [isLoading, eMail, password, enableShowApp]);

  const onDeleteDataConfirmation = async () => {
    await deleteDbAndOpenNew();
    await saveEncryptionFlag(false);
    enableShowApp();
  };

  const onDeleteData = () => {
    Alert.alert(labels.areYouSureTitle, labels.areYouSure, [
      cancelButton,
      {
        text: labels.reallyDeleteData,
        onPress: onDeleteDataConfirmation,
      },
    ]);
  };

  const onConfirmDeletion = async () => {
    Alert.alert(labels.deleteDatabaseTitle, labels.deleteDatabaseExplainer, [
      cancelButton,
      { text: labels.deleteData, onPress: onDeleteData },
    ]);
  };

  const handleError = () => {
    Alert.alert(shared.errorTitle, shared.errorMessage, [
      {
        text: shared.tryAgain,
        onPress: () => {
          setEmail(null);
        },
      },
    ]);
  };

  const requestPasswordChange = () => {
    Alert.alert(shared.successTitle, shared.checkEmail, [
      {
        text: shared.ok,
        onPress: () => {
          setEnteringEmail(false);
        },
      },
    ]);
  };

  const cancelConfirmationWithPassword = () => {
    setEmail(null);
    setEnteringEmail(false);
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
    );
  }

  return (
    <>
      <Header isStatic />
      <AppPage contentContainerStyle={styles.contentContainer}>
        <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={150}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.signInText}>Wenn Sie ein Konto beim in:prov-Server haben, können Sie sich anmelden</Text>
          <AppTextInput
            value={eMail} // Added value prop
            onChangeText={setEmail}
            placeholder={labels.enterEmailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppTextInput
            value={password} // Added value prop
            onChangeText={setPassword}
            secureTextEntry={true}
            placeholder={labels.enterPassword}
          />
          <View style={styles.containerButtons}>
            <Button
              disabled={isButtonDisabled}
              isCTA={!isButtonDisabled}
              onPress={() => setIsLoading(true)}
            >
              {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : labels.title}
            </Button>
          </View>
        </KeyboardAvoidingView>
      </AppPage>
    </>
  );
};

PasswordPrompt.propTypes = {
  enableShowApp: PropTypes.func.isRequired,
};

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
  signInText: {
    textAlign: 'center',
    marginBottom: Spacing.small,
    fontSize: 16,
  },
  logo: {
    width: 200,
    height: 50,
    marginBottom: Spacing.medium,
    alignSelf: 'center',
  },
});

export default PasswordPrompt;
