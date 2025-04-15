import { Image, StyleSheet, Platform, FlatList, View, Text, ScrollView } from 'react-native';
import CalculateRatio from '@/components/screen/CalculateRatio';
import CalculatePower from '@/components/screen/CalculatePower';
import CalculateBellSpecs, { Inputs, Selected } from '@/components/screen/CalculateBellSpecs';
import Chip from '@/components/ui/Chip';
import { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';


export default function CalculateScreen() {
  const screenSingleton = ScreenSingleton.getInstance()
  const [selectedScreen, setSelectedScreen] = useState("Bộ truyền đai")
  const [inputs, setInputs] = useState<Inputs | null>(null)
  const [selected, setSelected] = useState<Selected | null>(null)

  function handleSelectScreen(screen: string) {
    screenSingleton.inputs = null
    screenSingleton.selected = null
    screenSingleton.selectedScreen = screen
    console.log("screen selected!")
    setSelectedScreen(screen)
  }
  return (
    <ScrollView>
        <Chip 
            options={["Công suất động cơ", "Tỷ số truyền", "Bộ truyền đai"]}
            onSelect={handleSelectScreen}
            selected={selectedScreen}
        />
      {
        selectedScreen === "Công suất động cơ" && 
          <CalculatePower
            initialInputs={inputs}
          /> ||
        selectedScreen === "Tỷ số truyền" && 
          <CalculateRatio
            initialInputs={inputs}
          /> ||
        selectedScreen === "Bộ truyền đai" && 
          <CalculateBellSpecs 
            initialInputs = {inputs}
            initialSelected={selected}
          />
      }
    </ScrollView>
  );
}
export class ScreenSingleton {
  private static instance: ScreenSingleton;
  private constructor() {
    console.log('Singleton initialized');
  }

  public static getInstance(): ScreenSingleton {
    if (!ScreenSingleton.instance) {
      ScreenSingleton.instance = new ScreenSingleton();
    }
    return ScreenSingleton.instance;
  }


  public setSelectedScreen: React.Dispatch<React.SetStateAction<string>> | null = null
  public setInputs: React.Dispatch<React.SetStateAction<Inputs | null>> | null = null
  public setSelected: React.Dispatch<React.SetStateAction<Selected | null>> | null = null

  public inputs: Inputs | null = null
  public selected: Selected | null = null
  public selectedScreen: string = "Bộ truyền đai"
  private listeners: Set<()=>void> = new Set<()=>void>
  public subscribe(listener: ()=>void) {
    this.listeners.add(listener)
  }
  public unsubscribe(listener: ()=>void) {
    this.listeners.delete(listener)
  }
  public triggerUpdate() {
    this.listeners.forEach((listener)=> listener())
  }
}