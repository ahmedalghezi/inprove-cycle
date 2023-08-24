import React, { useState, useEffect } from 'react'
import Share from 'react-native-share'
import axios from 'axios';
import { getCycleDaysSortedByDate, mapRealmObjToJsObj } from '../../../db'
import alertError from '../common/alert-error'
import settings from '../../../i18n/en/settings'
import { EXPORT_FILE_NAME } from './constants'
import RNFS from 'react-native-fs'
import { DeviceEventEmitter } from 'react-native';

export default async function configureDataExport() {

  const labels = settings.exportAutomatic


      try {
        const cycleDaysByDate = mapRealmObjToJsObj(getCycleDaysSortedByDate());


        if (!cycleDaysByDate.length) {
          return alertError(labels.errors.noData);
        }

        const jsonData = JSON.stringify(cycleDaysByDate);
        console.log(jsonData)
        const response = await axios.post('https://inprove-sport.info/csv/cycle/post_data', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          const responseData = response.data;
          if (responseData.res === 'ok') {
            console.log('Data exported successfully', responseData.res);
          } else if (responseData.res === 'no') {
            console.log('Not signed in');
          } else {
            console.log('Unexpected response:', responseData);
            return alertError(labels.errors.problemSendingData);
          }
        } else {
          console.log('Export failed with status:', response.status);
          return alertError(labels.errors.problemSendingData);
        }
      } catch (error) {
        console.error('An error occurred during export:', error);
        return alertError(labels.errors.problemSendingData);
      }


    // periodic data export using setInterval
      let  dataExportInterval = setInterval(() => {
        configureDataExport();
      }, 3600000); // Interval in milliseconds

      //  DeviceEventEmitter to listen for app background state changes
      DeviceEventEmitter.addListener('appStateDidChange', async (appState) => {
        if (appState === 'background') {
          // Perform a final data export before the app enters the background
          await configureDataExport();
          clearInterval(dataExportInterval); // Stop the interval when in background
        } else if (appState === 'active') {
          // Resume the data export interval when the app becomes active
          dataExportInterval = setInterval(() => {
            configureDataExport();
          }, 3600000); // Interval in milliseconds
        }
      });

  }
