import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import { motorCatalogue, Motor } from "./MotorCatalogue";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Button from "../ui/Button";
import { Ionicons } from "@expo/vector-icons";
type Ranges = Record<string, { min: number; max: number }>;
type Inputs = Record<string, string>
type Result = Record<string, number>
const ranges: Ranges = {
  "ndc": {min: 0, max: Infinity},
  "n": {min: 0, max: Infinity},
  "ud": {min: 3, max: 5},
  "Kbe": {min: 0, max: Infinity},
  "Ψbd2": {min: 0, max: Infinity},
  "ck": {min: 0, max: Infinity},
  "[K01]": {min: 0, max: Infinity},
  "[K02]": {min: 0, max: Infinity},
  "Pdc": {min: 0, max: Infinity},
  "ηkn": { min: 0.99, max: 0.995 },
  "ηđt": { min: 0.95, max: 0.97 },
  "ηrc": { min: 0.96, max: 0.98 },
  "ηrt": { min: 0.95, max: 0.97 },
  "ηol": { min: 0.99, max: 0.995 },
};

const CalculateRatio: React.FC<{initialInputs?: Inputs | null}> = ({initialInputs}) => {
  const [inputs, setInputs] = useState<Inputs>({
    "ndc": "2925",
    "n": "70",
    "ud": "4",
    "Kbe": "0.26",
    "Ψbd2": "1.2",
    "ck": "1.1",
    "[K01]": "1",
    "[K02]": "1",
    "Pdc": "7.5",
    "ηkn": "1",
    "ηđt": "0.955",
    "ηrc": "0.96",
    "ηrt": "0.97",
    "ηol": "0.99",
  });
  useEffect(() => {
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
      type: "Tỷ số truyền",
      time: Date.now(),
      inputs: inputs,
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

  let result: Result = {
    uch: 0,
    uh: 0,
    "λk": 0,
    ubrc: 0,
    ubrt: 0,
    Pdc: parseFloat(inputs.Pdc),
    P1: 0,
    P2: 0,
    P3: 0,
    ndc: parseFloat(inputs.ndc),
    n1: 0,
    n2: 0,
    n3: 0,
    n: 0,
    Tdc: 0,
    T1: 0,
    T2: 0,
    T3: 0,
    Ttt: 0,
  }
  if (allValid) {
    result.uch = 
      parseFloat(inputs.ndc) /
      parseFloat(inputs.n)
    result.uh =
      result.uch / parseFloat(inputs.ud)
    result["λk"] = 
      2.25 * 
      parseFloat(inputs["Ψbd2"]) *
      parseFloat(inputs["[K02]"]) / (
        (1 - parseFloat(inputs["Kbe"])) *
        parseFloat(inputs["Kbe"]) *
        parseFloat(inputs["[K01]"])
      )
    result.ubrc = solveForU1(result["λk"], parseFloat(inputs.ck), result.uh)
    result.ubrt = result.uh / result.ubrc
    result.P1 =
      parseFloat(inputs.Pdc) *
      parseFloat(inputs["ηol"]) *
      parseFloat(inputs["ηđt"])
    result.P2 =
      result.P1 *
      parseFloat(inputs["ηol"]) *
      parseFloat(inputs["ηrc"])
    result.P3 =
      result.P2 *
      parseFloat(inputs["ηol"]) *
      parseFloat(inputs["ηđt"])
    result.n1 =
      result.ndc /
      parseFloat(inputs.ud)
    result.n2 =
      result.n1 /
      result.ubrc
    result.n3 =
      result.n2 /
      result.ubrt
    result.n =
      result.n3 /
      parseFloat(inputs["ηkn"])

    const coefficence = 9.55 * 10e6
    result.Tdc =
        coefficence *
        result.Pdc /
        result.ndc
    result.T1 =
        coefficence *
        result.P1 /
        result.n1
    result.T2 =
        coefficence *
        result.P2 /
        result.n2
    result.T3 =
        coefficence *
        result.P3 /
        result.n3
    result.Ttt = result.T3


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
          return index % 3 === 0 ? (
            <View key={field} style={styles.row}>
              {[
                    field, 
                    Object.keys(inputs)[index + 1],
                    Object.keys(inputs)[index + 2],
                ].map(
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
                    {
                        Object.keys(result).map((label, index) => 
                            index % 4 === 0? (
                                <View key={index} style={styles.resultRow}> 
                                    {
                                        [
                                            label, 
                                            Object.keys(result)[index + 1],
                                            Object.keys(result)[index + 2],
                                            Object.keys(result)[index + 3],
                                        ].map( (label) =>
                                            label? 
                                            <View key={label} style={styles.resultCol}>
                                                <Text style={styles.resultText}>{label}</Text>
                                                <Text style={styles.resultNum}>{result[label] > 99 ? 
                                                    result[label].toFixed(0) :
                                                    result[label].toFixed(3)}
                                                </Text>
                                            </View>: <View style={styles.resultRow}/>)
                                    }
                            
                                </View>
                            ): null
                        )
                    }
                </View>
            </View>
        </View>
      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Hãy điền đầy đủ và đảm bảo các tham số nằm trong khoảng hợp lệ.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
export default CalculateRatio

function solveForU1(lambda_k: number, c_k: number, u_h: number) {
  const a = lambda_k * Math.pow(c_k, 3);
  
  function equation(u1: number) {
      return (a * Math.pow(u1, 4)) / (Math.pow(u_h, 2) * (u_h + u1)) - 1;
  }
  
  function derivative(u1: number) {
      const numerator = 4 * a * Math.pow(u1, 3) * (u_h + u1) - a * Math.pow(u1, 4);
      const denominator = Math.pow(u_h, 2) * Math.pow(u_h + u1, 2);
      return numerator / denominator;
  }
  
  function newtonRaphson(initialGuess: number, tolerance = 1e-6, maxIterations = 100) {
      let u1 = initialGuess;
      for (let i = 0; i < maxIterations; i++) {
          const fValue = equation(u1);
          const fDerivative = derivative(u1);
          if (Math.abs(fDerivative) < 1e-10) break; 
          
          const nextU1 = u1 - fValue / fDerivative;
          if (Math.abs(nextU1 - u1) < tolerance) return nextU1;
          
          u1 = nextU1;
      }
      return Infinity; 
  }
  
  return newtonRaphson(2); 
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Vercel black
    paddingHorizontal: 16
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
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6", // Vercel blue
    rowGap: 10,
    marginHorizontal: 8,
    marginBottom: 100,
  },
  resultRow: {
    justifyContent: "space-between",
    flexDirection: "row",
    minWidth: 60
  },
  resultCol: {
    justifyContent: "space-between",
    flexDirection: "column",
  },
  resultText: {
    minWidth: 60,
    fontSize: 24,
    fontWeight: "600",
    color: "#fff",
  },
  resultNum: {
    fontSize: 16,
    fontWeight: "300",
    color: "#aaa",
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
