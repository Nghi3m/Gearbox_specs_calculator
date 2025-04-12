import { ScreenSingleton } from "@/app/(tabs)";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

interface ChipRadioSelectorProps {
  options: string[];
  onSelect?: (option: string) => void;
  selected: string,
  getSetSelected?: React.Dispatch<React.SetStateAction<React.Dispatch<React.SetStateAction<string>> | null>>
}

const Chip: React.FC<ChipRadioSelectorProps> = ({ options, onSelect, selected, getSetSelected }) => {
  // const [selected, setSelected] = useState<string>(defaultSelected);
  const handleSelect = (option: string) => {
    // setSelected(option);
    if (onSelect) {
      onSelect(option);
    }
  };
  // if (getSetSelected) {
  //   getSetSelected(setSelected)
  // }
  return (
    <ScrollView 
        horizontal
        style={styles.container}>
      {options.map((option) => (
        <TouchableOpacity
          key={option}
          style={[styles.chip, selected === option && styles.selectedChip]}
          onPress={() => handleSelect(option)}
        >
          <Text style={[styles.chipText, selected === option && styles.selectedText]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
    backgroundColor: "#000000",
    maxHeight: 50,

  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#aaa",
    backgroundColor: "#f5f5f500",
    marginHorizontal: 4,
  },
  selectedChip: {
    backgroundColor: "#fff",
  },
  chipText: {
    color: "#eee",
    fontWeight: "600"
  },
  selectedText: {
    color: "#000",
  },
});

export default Chip;
