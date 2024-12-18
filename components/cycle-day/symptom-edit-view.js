import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { ScrollView, StyleSheet, View } from 'react-native'

import AppModal from '../common/app-modal'
import AppSwitch from '../common/app-switch'
import AppText from '../common/app-text'
import AppTextInput from '../common/app-text-input'
import Button from '../common/button'
import Segment from '../common/segment'
import SelectBoxGroup from './select-box-group'
import SelectTabGroup from './select-tab-group'
import Temperature from './temperature'

import { blank, save, shouldShow, symtomPage } from '../helpers/cycle-day'
import { showToast } from '../helpers/general'

import { shared as sharedLabels } from '../../i18n/en/labels'
import info from '../../i18n/en/symptom-info'
import { Colors, Containers, Sizes, Spacing } from '../../styles'

const SymptomEditView = ({ date, onClose, symptom, symptomData }) => {
//    console.log("symptom", symptom)
//    console.log("symptomData", symptomData)
//    console.log("blank[symptom]", blank[symptom])
  const symptomConfig = symtomPage[symptom]
  const [data, setData] = useState(symptomData ? symptomData : blank[symptom])
//  console.log("data", data)
  const [shouldShowInfo, setShouldShowInfo] = useState(false)
  const getParsedData = () => JSON.parse(JSON.stringify(data))
  const onPressLearnMore = () => setShouldShowInfo(!shouldShowInfo)

  const onEditNote = (note) => {
    const parsedData = getParsedData()

    if (symptom === 'note') {
      Object.assign(parsedData, { value: note })
    } else {
      parsedData['note'] = note
    }

    setData(parsedData)
  }

 /* const onExcludeToggle = () => {
    const parsedData = getParsedData()

    Object.assign(parsedData, { exclude: !parsedData.exclude })

    setData(parsedData)
  }*/

  const onRemove = () => {
    save[symptom](data, date, true)
    showToast(sharedLabels.dataDeleted)
    onClose()
  }

  const onSave = () => {

    const hasDataChanged = () => {
      const initialData = symptomData ? symptomData : blank[symptom]

      return JSON.stringify(data) !== JSON.stringify(initialData)
    }

    if (hasDataChanged()) {
      save[symptom](data, date, false)
//      console.log(" ================================================= ");
//      console.log("Saving Data: ", data);
//      setData(data)
//      console.log("Updating data", data);
//      console.log(" ================================================= ");
      showToast(sharedLabels.dataSaved)
    }

    onClose()
  }

  const onSaveTemperature = (value, field) => {
    const parsedData = getParsedData()
    const dataToSave =
      field === 'value' ? { [field]: Number(value) } : { [field]: value }

    Object.assign(parsedData, { ...dataToSave })

    setData(parsedData)
  }

  const onSelectBox = (key) => {
//    const parsedData = getParsedData()
//    Object.assign(parsedData, { [group.key]: value })
      const parsedData = { ...getParsedData() };
    if (key === 'other') {
//      console.log("onSelectBox Key :", key)
//      console.log("!data[key] :", !data[key])
      parsedData.note = null; // Reset note
      parsedData[key] = !data[key];
//      Object.assign(parsedData, {
//        note: null,
//        [key]: !data[key],
//      })
    }
    else
    {
//        console.log("onSelectBox Key :", key)
//        console.log("!data[key] :", !data[key])
//        console.log("data[key] :", data[key])
        parsedData[key] = !data[key];

//            Object.assign(parsedData, { [key]: !data[key] })

    }


    setData(parsedData)
  }

  const onSelectBoxNote = (value) => {
    const parsedData = getParsedData()

    Object.assign(parsedData, { note: value !== '' ? value : null })

    setData(parsedData)
  }

  const onSelectTab = (group, value) => {
    const parsedData = getParsedData()
//    console.log("onSelectTab")
    Object.assign(parsedData, { [group.key]: value })

    setData(parsedData)
  }
  const iconName = shouldShowInfo ? 'chevron-up' : 'chevron-down'
  const noteText = symptom === 'note' ? data.value : data.note
  const inputProps = {
    multiline: true,
    numberOfLines: 3,
    scrollEnabled: false,
    style: styles.input,
    textAlignVertical: 'top',
  }

  return (
    <AppModal onClose={onSave}>
      <ScrollView
        contentContainerStyle={styles.modalContainer}
        keyboardDismissMode="on-drag"
      >
        {symptom === 'temperature' && (
          <Temperature
            date={date}
            data={data}
            save={(value, field) => onSaveTemperature(value, field)}
          />
        )}
        {shouldShow(symptomConfig.selectTabGroups) &&
          symtomPage[symptom].selectTabGroups.map((group) => {
            return (
              <Segment key={group.key} style={styles.segmentBorder}>
                <AppText style={styles.title}>{group.title}</AppText>
                <SelectTabGroup
                  activeButton={data[group.key]}
                  buttons={group.options}
                  onSelect={(value) => onSelectTab(group, value)}
                />
              </Segment>
            )
          })}
        {shouldShow(symptomConfig.selectBoxGroups) &&
          symtomPage[symptom].selectBoxGroups.map((group) => {
            const isOtherSelected =
              data['other'] !== null &&
              data['other'] !== false &&
              Object.keys(group.options).includes('other')

            return (
              <Segment key={group.key} style={styles.segmentBorder}>
                <AppText style={styles.title}>{group.title}</AppText>
                <SelectBoxGroup
                  labels={group.options}
                  onSelect={(value) => onSelectBox(value)}
                  optionsState={data}
                />
                {isOtherSelected && (
                  <AppTextInput
                    {...inputProps}
                    placeholder={sharedLabels.enter}
                    value={data.note}
                    onChangeText={(value) => onSelectBoxNote(value)}
                  />
                )}
              </Segment>
            )
          })}
        {shouldShow(symptomConfig.note) && (
          <Segment style={styles.segmentBorder}>
            <AppText>{symtomPage[symptom].note}</AppText>
            <AppTextInput
              {...inputProps}
              onChangeText={onEditNote}
              placeholder={sharedLabels.enter}
              testID="noteInput"
              value={noteText !== null ? noteText : ''}
            />
          </Segment>
        )}
        <View style={styles.buttonsContainer}>
          <Button iconName={iconName} isSmall onPress={onPressLearnMore}>
            {sharedLabels.learnMore}
          </Button>
          <Button isSmall onPress={onRemove}>
            {sharedLabels.remove}
          </Button>
          <Button isCTA isSmall onPress={onSave}>
            {sharedLabels.save}
          </Button>
        </View>
        {shouldShowInfo && (
          <Segment last style={styles.segmentBorder}>
            <AppText>{info[symptom].text}</AppText>
          </Segment>
        )}
      </ScrollView>
    </AppModal>
  )
}

SymptomEditView.propTypes = {
  date: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  symptom: PropTypes.string.isRequired,
  symptomData: PropTypes.object,
}

const styles = StyleSheet.create({
  buttonsContainer: {
    ...Containers.rowContainer,
    paddingBottom: Spacing.base,
    width: '100%'
  },
  input: {
    height: Sizes.base * 5,
  },
  modalContainer: {
    paddingHorizontal: Spacing.base,
  },
  segmentBorder: {
    borderBottomColor: Colors.greyLight,
  },
  title: {
    fontSize: Sizes.subtitle,
  },
})

export default SymptomEditView