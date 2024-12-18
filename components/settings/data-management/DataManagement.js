import React, { useState, useEffect } from 'react'
//import { Checkbox } from "@progress/kendo-react-inputs";
import CheckBox from '@react-native-community/checkbox';
import { View } from 'react-native';
import AppLoadingView from '../../common/app-loading'
import AppPage from '../../common/app-page'
import AppText from '../../common/app-text'
import Button from '../../common/button'
import Segment from '../../common/segment'


import openShareDialogAndExport from './export-dialog'
import configureDataExport from './exportAutomatic-dialog'
import DeleteData from './delete-data'

import labels from '../../../i18n/en/settings'
import ImportData from './ImportData'

const DataManagement = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeletingData, setIsDeletingData] = useState(false)
  const [AutomaticExportCheckBox, setAutomaticExportCheckBox] = useState(false)




  const startExport = () => {
    setIsDeletingData(false)
    openShareDialogAndExport()
  }

  // Simulate automatic data sending to a database
    const sendAutomaticExport = () => {
           console.log('inside sendAutomaticExport')
           setIsDeletingData(false)
           configureDataExport()
          }

  return (
    <AppPage>
      <Segment title={labels.export.button}>
        <AppText>{labels.export.segmentExplainer}</AppText>
        <Button isCTA onPress={startExport} >
          {labels.export.button}
        </Button>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <CheckBox
                    disabled={false}
                    value={AutomaticExportCheckBox}
                    onValueChange={(newValue) => setAutomaticExportCheckBox(newValue)}
                     style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
                              marginBottom: -20}}
                    />
        <Button  onPress={sendAutomaticExport} disabled={!AutomaticExportCheckBox}>
           {labels.exportAutomatic.button}
        </Button>
         </View>
      </Segment>
      <Segment title={labels.deleteSegment.title} last>
        <AppText>{labels.deleteSegment.explainer}</AppText>
        <DeleteData
          isDeletingData={isDeletingData}
          onStartDeletion={() => setIsDeletingData(true)}
        />
      </Segment>
    </AppPage>
  )
}

const styles = {
  fadeButton: {
    opacity: 0.6,
  },
};
export default DataManagement