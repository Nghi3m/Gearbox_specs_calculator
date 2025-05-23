import { Inputs, Selected, Result, Ranges } from "@/misc/types";
import React from "react";
import { View, Text, TextInput, StyleSheet, ScrollView } from "react-native";
import Chip from "../components/ui/Chip";
import Button from "../components/ui/Button";
import { Ionicons } from "@expo/vector-icons";

export default function CalculationView(
    handleSave: () => Promise<void>, 
    inputs: Inputs, 
    setIsFocused: React.Dispatch<React.SetStateAction<{ [k: string]: boolean; }>>, 
    errors: Inputs, 
    isFocused: { [k: string]: boolean; }, 
    handleInputChange: (field: string, value: string) => void, 
    selected: Selected | null, 
    options: Record<string, string[]> | null, 
    setSelected: (selected: Selected | null) => void, 
    allValid: boolean, 
    result: Result,
    ranges: Ranges,
    calculationOptions: string[],
    handleSelectCalculation: (option: string) => void,
    selectedCalculation: string,
    handlePDFExport: ()=>void
): React.ReactNode {
    return <>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Tính toán</Text>
      <Chip
          options={calculationOptions}
          onSelect={handleSelectCalculation}
          selected={selectedCalculation}
      />
    </View>
    <ScrollView style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Tham số</Text>
        <Button
          onPress={handleSave}
        >
          <Ionicons
            name="bookmark"
            size={18} />
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
                (key) => key && (
                  <View key={key} style={styles.inputWrapper}>
                    <Text style={styles.label}>{key}</Text>
                    <TextInput
                      onFocus={() => setIsFocused(prev => {
                        return { ...prev, [key]: true };
                      })}
                      onBlur={() => setIsFocused(prev => {
                        return { ...prev, [key]: false };
                      })}
                      style={[
                        styles.input,
                        errors[key] ? styles.inputError :
                          isFocused[key] ? styles.inputFocused : styles.inputUnfocused,
                      ]}
                      keyboardType="numeric"
                      value={inputs[key]}
                      onChangeText={(value: string) => handleInputChange(key, value)}
                      placeholder={ranges[key].max === Infinity
                        ? `> ${ranges[key].min}`
                        : `${ranges[key].min} - ${ranges[key].max}`}
                      placeholderTextColor="#9CA3AF" />
                    {errors[key] ? (
                      <Text style={styles.errorText}>{errors[key]}</Text>
                    ) : null}
                  </View>
                )
              )}
            </View>
          ) : null;
        })}
        { selected && options ?
            Object.keys(selected).map((label) => {
            const typedLabel = label as keyof Selected;
            return (
                <View style={styles.chipContainer}>
                <Text style={styles.label}>{label}</Text>
                <Chip
                    options={options[label]}
                    selected={selected[typedLabel]}
                    onSelect={value => setSelected({ ...selected, [typedLabel]: value })} />
                </View>);
            }) : null
        }
      </View>
      {allValid ? (
        <>   
            <View style={styles.titleRow}>
              <Text style={styles.title}>Kết quả</Text>
              <Button
                onPress={handlePDFExport}
                  >
                    <Ionicons
                      name="document"
                      size={18}
                    />
                  <Text>Xuất PDF</Text>
                </Button>
            </View>
            <View style={styles.resultContainer}>
              {Object.keys(result).map((label, index) => index % 4 === 0 ? (
                <View key={index} style={styles.resultRow}>
                  {[
                    label,
                    Object.keys(result)[index + 1],
                    Object.keys(result)[index + 2],
                    Object.keys(result)[index + 3],
                  ].map((label) => label ?
                    <View key={label} style={styles.resultCol}>
                      <Text style={styles.resultText}>{label}</Text>
                      <Text style={styles.resultNum}>{typeof result[label] === "number" ?
                        (
                          result[label] > 100 ?
                            result[label].toFixed(0) :
                            result[label].toFixed(3)
                        ) :
                        result[label]}
                      </Text>
                    </View> : <View style={styles.resultRow} />)}
  
                </View>
              ) : null
              )}
            </View>
        </>

      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            Hãy điền đầy đủ và đảm bảo các tham số nằm trong khoảng hợp lệ.
          </Text>
        </View>
      )}
      <View style={styles.bottomSpacing} />
    </ScrollView>;
    </>
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0c0d0e", 
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
      color: "#777b84",
      marginBottom: 6,
    },
    input: {
      backgroundColor: "#111113",
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
      borderColor: "#ff5555", 
      borderWidth: 2,
    },
    errorText: {
      color: "#ff5555",
      fontSize: 12,
      marginTop: 4,
    },
    resultContainer: {
      flexDirection: "column",
      backgroundColor: "#14152e",
      padding: 24,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "#3133b0", 
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
    chipContainer: {
      flexDirection: "column",
      paddingVertical: 10
    },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 6,
      width: "100%",
      alignContent: "space-around"
    },
    bottomSpacing: {
      height: 200,
    },
    header: {
      width: "100%",
      backgroundColor: '#0c0d0e',
      display: 'flex',
      flexDirection: 'column',
      alignContent: 'center',
      justifyContent: 'space-between',
      paddingTop: 16,
      paddingBottom: 8,
      gap: 10,
      borderColor: "#666",
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 25,
      fontWeight: "bold",
      color: "#fff",
      marginLeft: 24,
    }
  });