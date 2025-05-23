import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BeltCalculationModel from "@/models/BeltCalculationModel";
import { Inputs, Ranges, Result, Selected } from "@/misc/types";
import CalculationView from "@/views/CalculationView";
import ICalculationStrategy from "@/misc/ICalculationStrategy";
import PowerCalculationModel from "@/models/PowerCalculationModel";
import useSelectedStore from "@/stores/useSelectedStore";
import useInputStore from "@/stores/useInputStore";
import RatioCalculationModel from "@/models/RatioCalculationModel";
import useCalculationNameStore from "@/stores/useCalculationNameStore";
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import GearCalculationModel from "@/models/GearCalculationModel";

const modelTable: Record<string, ICalculationStrategy> = {
  "Công suất động cơ": new PowerCalculationModel(),
  "Tỷ số truyền": new RatioCalculationModel(),
  "Bộ truyền đai": new BeltCalculationModel(),
  "Bánh răng": new GearCalculationModel(),
}
const CalculationViewModel = () => {
  const {calculationName, setCalculationName} = useCalculationNameStore()
  const {inputs, setInputs} = useInputStore()
  const {selected, setSelected} = useSelectedStore()
  const [errors, setErrors] = useState<Inputs>({});
  const selectedModel = modelTable[calculationName]
  const options: Record<string, string[]> | null = selectedModel.getOptions()
  const ranges = selectedModel.getRanges()
  console.log(selectedModel, ranges)
  function stringifyParams() {
    let output: string = ''
    Object.keys(inputs).forEach((fieldName)=> {
      output += `\n<tr>\n\t<td>${fieldName}</td>
      \n\t<td>${selected? inputs[fieldName] : ''}</td></tr>`
    })
    if (selected)
      Object.keys(selected).forEach((fieldName)=> {
        output += `\n<tr>\n\t<td>${fieldName}</td>
        \n\t<td>${selected? selected[fieldName] : ''}</td></tr>`
      })
    return output
  }
  function stringifyResult() {
    let output: string = ''
    Object.keys(result).forEach((fieldName)=> {
      output += `\n<tr>\n\t<td>${fieldName}</td>
      \n\t<td>${result[fieldName]}</td></tr>`
    })
    return output
  }
  async function  handlePDFExport() {
      const html = 
        `<h1>${calculationName}</h1>
        <h2>Tham số</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <tr>
          <th>Tên tham số</th>
          <th>Giá trị</th>
        </tr>
        ${stringifyParams()}
      </table>
        <h2>Kết quả</h2>
        <table border="1" cellpadding="5" cellspacing="0" style="width:100%; border-collapse: collapse;">
        <tr>
          <th>Tên trường</th>
          <th>Giá trị</th>
        </tr>
        ${stringifyResult()}
      </table>
        <p>This is a test PDF created in React Native.</p>`

      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF saved to:', uri);
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        alert('Sharing is not available on this device');
      }
  }
  function handleChangeCalculation(name: string) {
    setCalculationName(name)
    setInputs(modelTable[name].getDefaultInput())
    setSelected(modelTable[name].getDefaultSelected())
  }
  async function handleSave() {
    const rawString = await AsyncStorage.getItem('bookmarks')
    let bookmarks: Record<string, any>[] = []
    if (rawString) {
      bookmarks = JSON.parse(rawString)
    }
    bookmarks.push({
      type: selectedModel.getName(),
      time: Date.now(),
      inputs: inputs,
      selected: selected
    })
    AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks))
      .then(()=>console.log("Bookmark saved!"))
      .catch((reason)=>console.log(reason))
  }
  const handleInputChange = (field: string, value: string): void => {
    setInputs({ ...inputs, [field]: value });

    if (value.trim() === "") {
      setErrors((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      setErrors((prev) => ({ ...prev, [field]: "Giá trị phải là số" }));
      return;
    }

    const { min, max } = ranges[field];
    if (numericValue < min || numericValue > max) {
      setErrors((prev) => ({
        ...prev,
        [field]: `Giá trị phải ${
          max === Infinity ? `lớn hơn ${min}` : `từ ${min} đến ${max}`
        }`,
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };
  const allValid =
    Object.values(errors).every((err) => err === "") &&
    Object.values(inputs).every((val) => val !== "");

  let result: Result = {}
  if (allValid) {
    result = selectedModel.calculate(inputs, selected)
  }
    const [isFocused, setIsFocused] = useState(
        Object.fromEntries(
            Object.keys(inputs).map(key => [key, false])
        )
    )

  return (
    CalculationView(handleSave, 
      inputs, 
      setIsFocused, 
      errors, 
      isFocused, 
      handleInputChange, 
      selected, 
      options, 
      setSelected, 
      allValid, 
      result,
      ranges,
      Object.keys(modelTable),
      handleChangeCalculation,
      calculationName,
      handlePDFExport
    )
  );
}
export default CalculationViewModel



