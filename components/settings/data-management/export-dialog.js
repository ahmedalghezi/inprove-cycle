import Share from 'react-native-share'

import { getCycleDaysSortedByDate, mapRealmObjToJsObj } from '../../../db'
import getDataAsCsvDataUri from '../../../lib/import-export/export-to-csv'
import alertError from '../common/alert-error'
import settings from '../../../i18n/en/settings'
import { EXPORT_FILE_NAME } from './constants'
import RNFS from 'react-native-fs'
import axios from 'axios';
import { showToast } from '../../helpers/general'

export default async function exportData() {
  let data
  const labels = settings.export
  const cycleDaysByDate = mapRealmObjToJsObj(getCycleDaysSortedByDate())

  if (!cycleDaysByDate.length) return alertError(labels.errors.noData)

  const jsonData = JSON.stringify(cycleDaysByDate);

    console.log(jsonData)
    try {
    const { errors, success } = settings.export
      const response = await axios.post('https://inprove-sport.info/csv/cycle/post_data', jsonData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

        if (response.status === 200) {
          const responseData = response.data;
          if (responseData.res === "ok") {
            console.log("Data exported successfully",responseData.res);
             console.log(jsonData)
                showToast(success.message)
          } else if (responseData.res === "no") {
            console.log("Not signed in");
            showToast(errors.notSignedIn)
          } else {
            console.log("Unexpected response:", responseData);
            return alertError(labels.errors.problemSendingData);
          }
        } else {
          console.log('Export failed with status:', response.status);
          return alertError(labels.errors.problemSendingData)
        }
      } catch (error) {
        console.error('An error occurred during export:', error);
        return alertError(labels.errors.problemSendingData)

      }

}
