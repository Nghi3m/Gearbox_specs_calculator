import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ChipRadioGroup = ({ options: [] }) => {
  const [selected, setSelected] = useState(null);

  return (
    <View style={styles.container}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.chip, selected === option ? styles.selectedChip : null]}
          onPress={() => setSelected(option)}
        >
          <Text style={[styles.chipText, selected === option ? styles.selectedText : null]}>
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8, // Spacing between chips
  },
  chip: {
    backgroundColor: "#E0E0E0",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
    margin: 4,
    elevation: 2,
  },
  selectedChip: {
    backgroundColor: "#6200EE", // Change color when selected
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  selectedText: {
    color: "#FFF", // White text when selected
  },
});

export default ChipRadioGroup;
