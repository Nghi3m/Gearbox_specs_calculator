import React, {ReactNode} from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
const Button: React.FC<{
    children?: ReactNode,
    onPress?: () => void,
    outline?: boolean
}> = ({
    children,
    onPress,
    outline
}) => {

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, outline ? styles.outline : null]} onPress={onPress}>
        {children}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "#fff",
    fontSize: 16,
    maxHeight: 90,
    flexDirection: 'row',
    gap: 5
    
  },
  outline: {
    backgroundColor: '#00000000',
    color: '#aaa',
    borderColor: "#aaa",
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});

export default Button;
