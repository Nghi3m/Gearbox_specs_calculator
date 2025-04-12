import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { motorCatalogue, Motor } from "./MotorCatalogue";
import Button from "../ui/Button";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
type Ranges = Record<string, { min: number; max: number }>;
type Inputs = Record<string, string>

const ranges: Ranges = {
  "ηkn": { min: 0.99, max: 0.995 },
  "ηđt": { min: 0.95, max: 0.97 },
  "ηrc": { min: 0.96, max: 0.98 },
  "ηrt": { min: 0.95, max: 0.97 },
  "ηol": { min: 0.99, max: 0.995 },
  "Pt": { min: 0, max: Infinity },
  "n": { min: 0, max: Infinity },
  uh: { min: 10, max: 25 },
  ud: { min: 3, max: 5 },
};

const CalculatePower: React.FC<{initialInputs?: Inputs | null}> = ({initialInputs}) => {
  const [inputs, setInputs] = useState<Inputs>({
    "Pt": "5.5",
    "n": "70",
    "ηkn": "1",
    "ηđt": "0.955",
    "ηrc": "0.96",
    "ηrt": "0.97",
    "ηol": "0.99",
    uh: "12.5",
    ud: "3",
  });
  useEffect(()=>{
    if (initialInputs) {
      setInputs(initialInputs) 
    }
  })
  const [errors, setErrors] = useState<Inputs>({});
  async function handleSave() {
    const rawString = await AsyncStorage.getItem('bookmarks')
    let bookmarks: Record<string, any>[] = []
    if (rawString) {
      bookmarks = JSON.parse(rawString)
    }
    bookmarks.push({
      type: "Công suất động cơ",
      time: Date.now(),
      inputs: inputs,
      selected: null
    })
    AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks))
      .then(()=>console.log("Bookmark saved!"))
      .catch((reason)=>console.log(reason))
  }
  const handleInputChange = (field: string, value: string): void => {
    setInputs((prev) => ({ ...prev, [field]: value }));

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

  let totalEfficiency = 1;
  let motorRPM = 1;
  let transmissionRatio = 1;
  let motorPower = 0;
  if (allValid) {
    const outputPower = parseFloat(inputs["Pt"]);
    totalEfficiency =
      parseFloat(inputs["ηkn"]) *
      parseFloat(inputs["ηđt"]) *
      parseFloat(inputs["ηrc"]) *
      parseFloat(inputs["ηrt"]) *
      parseFloat(inputs["ηol"]) ** 3;
    motorPower = outputPower / totalEfficiency;

    transmissionRatio = parseFloat(inputs.uh) * parseFloat(inputs.ud);
    motorRPM = transmissionRatio * parseFloat(inputs["n"]);
  }
    const [isFocused, setIsFocused] = useState(
        Object.fromEntries(
            Object.keys(inputs).map(key => [key, false])
        )
    )
  return (
    <ScrollView style={styles.container}>
        <View style={styles.titleRow}>
        <Text style={styles.title}>Tham số</Text>
        <Button
          onPress={handleSave}
        >
          <Ionicons
            name="bookmark"
            size={18}
          />
          <Text>Lưu</Text>
        </Button>
      </View>
      <View style={styles.inputContainer}>
        {Object.keys(inputs).map((field, index) => {
          return index % 2 === 0 ? (
            <View key={field} style={styles.row}>
              {[field, Object.keys(inputs)[index + 1]].map(
                (key) =>
                  key && (
                    <View key={key} style={styles.inputWrapper}>
                      <Text style={styles.label}>{key}</Text>
                      <TextInput
                        onFocus={() => setIsFocused(prev => {
                            return {...prev, [key] : true}
                        })}
                        onBlur={() => setIsFocused(prev => {
                            return {...prev, [key] : false}
                        })}
                        style={[
                          styles.input,
                          errors[key] ? styles.inputError : 
                          isFocused[key] ? styles.inputFocused : styles.inputUnfocused,
                        ]}
                        keyboardType="numeric"
                        value={inputs[key]}
                        onChangeText={(value: string) => handleInputChange(key, value)}
                        placeholder={
                          ranges[key].max === Infinity
                            ? `> ${ranges[key].min}`
                            : `${ranges[key].min} - ${ranges[key].max}`
                        }
                        placeholderTextColor="#9CA3AF"
                      />
                      {errors[key] ? (
                        <Text style={styles.errorText}>{errors[key]}</Text>
                      ) : null}
                    </View>
                  )
              )}
            </View>
          ) : null;
        })}
      </View>
      {allValid ? (
        <View>
            <View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Kết quả</Text>
                  <View/>
                </View>
                <View style={styles.resultContainer}>
                <View style={styles.resultRow}>
                    <Text style={styles.resultText}>η tổng hiệu suất</Text>
                    <Text style={styles.resultNum}>{totalEfficiency.toFixed(4)}</Text>
                </View>
                <View style={styles.resultRow}>
                    <Text style={styles.resultText}>Pct công suất motor (kW)</Text>
                    <Text style={styles.resultNum}>{motorPower.toFixed(4)}</Text>
                </View>
                <View style={styles.resultRow}>
                    <Text style={styles.resultText}>uch tỉ số truyền của hệ</Text>
                    <Text style={styles.resultNum}>{transmissionRatio.toFixed(4)}</Text>
                </View>
                <View style={styles.resultRow}>
                    <Text style={styles.resultText}>nsb số vòng quay sơ bộ (rpm)</Text>
                    <Text style={styles.resultNum}>{motorRPM.toFixed(4)}</Text>
                </View>
                </View>
            </View>
            <View>
                <View style={styles.titleRow}>
                  <Text style={styles.title}>Đề xuất</Text>
                  <View/>
                </View>
                {pickMotor(motorCatalogue, motorPower, motorRPM).map((motor: Motor, index: number) => 
                <View key={index} style={styles.resultContainer}>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>Model</Text>
                        <Text style={styles.resultNum}>{motor.model}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>Công suất (kW)</Text>
                        <Text style={styles.resultNum}>{motor.power_kW}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>Vận tốc quay (rpm)</Text>
                        <Text style={styles.resultNum}>{motor.speed}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>cos p</Text>
                        <Text style={styles.resultNum}>{motor.cos_phi}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>n%</Text>
                        <Text style={styles.resultNum}>{motor.efficiency_percent}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>Tmax/Tdn</Text>
                        <Text style={styles.resultNum}>{motor.Tms_Tn}</Text>
                    </View>
                    <View style={styles.resultRow}>
                        <Text style={styles.resultText}>Tk/Tdn</Text>
                        <Text style={styles.resultNum}>{motor.Tk_Tn}</Text>
                    </View>
                </View>
                )}
            </View>
        </View>
      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Hãy điền đầy đủ và đảm bảo các tham số nằm trong khoảng hợp lệ.
          </Text>
        </View>
      )}
    <View style={styles.bottomPadding}/>
    </ScrollView>
  );
}
export default CalculatePower
function pickMotor (motors: Motor[], powerMinimum: number, RPMTarget: number) {
    const aboveMinimumPower = motors.filter((motor: Motor) => motor.power_kW >= powerMinimum)
    const sortedBySpeedDiff = aboveMinimumPower.sort((a: Motor, b: Motor) => {
      return Math.abs(RPMTarget - a.speed) - Math.abs(RPMTarget - b.speed)
    })
    return sortedBySpeedDiff.slice(0, 1)
}
const styles = StyleSheet.create({
  bottomPadding: {
    minHeight: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "#000", // Vercel black
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff",
    marginVertical: 16,
  },
  inputContainer: {
    marginBottom: 0,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputWrapper: {
    flex: 1,
    marginHorizontal: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ccc",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#fff",
  },
  inputUnfocused: {
    borderColor: "#333",
    borderWidth: 1,
  },
  inputFocused: {
    borderColor: "#fff",
    borderWidth: 2,
    backgroundColor: "#333"
  },
  inputError: {
    borderColor: "#ff5555", // Vercel red
    borderWidth: 2,
  },
  errorText: {
    color: "#ff5555",
    fontSize: 12,
    marginTop: 4,
  },
  resultContainer: {
    flexDirection: "column",
    backgroundColor: "#3b82f633",
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6", // Vercel blue
    rowGap: 10,
    marginHorizontal: 8,
  },
  resultRow: {
    justifyContent: "space-between",
    flexDirection: "row",
  },
  resultText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#aaa",
  },
  resultNum: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  warningContainer: {
    backgroundColor: "#ff555533",
    padding: 12,
    borderRadius: 8,
    borderColor: "#ff5555", // Vercel red
    borderWidth: 1,
    marginHorizontal: 8,
  },
  warningText: {
    fontSize: 14,
    color: "#ff5555",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6
  }
});
