import { Image, StyleSheet, Platform, FlatList, View, Text, ScrollView } from 'react-native';
import CalculateRatio from '@/components/screen/CalculateRatio';
import CalculatePower from '@/components/screen/CalculatePower';
import CalculationViewModel from '@/viewModels/CalculationViewmodel';
import Chip from '@/components/ui/Chip';
import { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import PowerCalculationModel from '@/models/PowerCalculationModel';
import RatioCalculationModel from '@/models/RatioCalculationModel';
import BeltCalculationModel from '@/models/BeltCalculationModel';
import useCalculationNameStore from '@/stores/useCalculationNameStore';
import useInputStore from '@/stores/useInputStore';
import useSelectedStore from '@/stores/useSelectedStore';


export default function CalculateScreen() {

  return (
    <CalculationViewModel/>
    
  );
}
