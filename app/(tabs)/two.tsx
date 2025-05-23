import { Image, StyleSheet, Platform, FlatList, View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import useCalculationNameStore from "@/stores/useCalculationNameStore";
import useSelectedStore from "@/stores/useSelectedStore";
import useInputStore from "@/stores/useInputStore";
import { router } from 'expo-router';
import { Inputs, Selected } from '@/misc/types';
export default function BookmarkScreen() {
  const {calculationName, setCalculationName} = useCalculationNameStore()
  const {inputs, setInputs} = useInputStore()
  const {selected, setSelected} = useSelectedStore()
  const [bookmarks, setBookmarks] = useState<Record<string, any>[]>([])
  function handleEditParameters(type: string, inputs: Inputs, selected: Selected) {
    return () => {
        setCalculationName(type)
        setInputs(inputs)
        setSelected(selected)
        router.push("/(tabs)")
      // screenSingleton.triggerUpdate()
      // console.log(screenSingleton.inputs, screenSingleton.seleted, screenSingleton.selectedScreen)
    }
  }
  async function loadBookmarks() {
    const raw = await AsyncStorage.getItem('bookmarks')
    let bookmarks = []
    if (raw) {
      bookmarks = JSON.parse(raw)
    }
    setBookmarks(bookmarks)
  }
  useEffect(() => {
    const interval = setInterval(() => {
      loadBookmarks();
    }, 300); 

    return () => clearInterval(interval); 
  }, []);
  function handleDelete(time: string) {
    return async () => {
      let updatedBookmarks =
        bookmarks.filter((bookmark) => bookmark.time != time)
      setBookmarks(updatedBookmarks)
      await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks))
    }
  }
  async function handleDeleteAll() {
    await AsyncStorage.setItem('bookmarks', JSON.stringify([]))
  }
  return (
    <>

      <View style={styles.header}>
        <Text style={styles.title}>Lịch sử</Text>
        <Button
          onPress={handleDeleteAll}
          outline
        >
          <Ionicons
            color={'#fff'}
            name="trash"
            size={18} />
          <Text style={styles.outlineButtonText}>Xóa tất cả</Text>
        </Button>
      </View>
    <ScrollView style={styles.container}>
      {bookmarks.length === 0&&<Text style={styles.emptyHistoryText}>Lịch sử trống.</Text>}
      {bookmarks.reverse().map((entry:Record<string, any>)=> 
      <View>

          <View style={styles.resultContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{entry.type}</Text>
            <View/>
            </View>
            {
              Object.keys(entry.inputs).map((label, index)=>
                index % 4 === 0 ?
                  <View style={styles.resultRow}>
                    {
                      [
                        label,
                        Object.keys(entry.inputs)[index + 1],
                        Object.keys(entry.inputs)[index + 2],
                        Object.keys(entry.inputs)[index + 3]
                      ].map((label, index)=>
                        <View style={styles.resultCol}>
                          <Text style={styles.resultText}>{label}</Text>
                          <Text style={styles.resultNum}>{entry.inputs[label]}</Text>
                        </View>
                      )
                    }
                  </View> : 
                  <View></View>    
            )
            }
            {
              entry.selected ?
              Object.keys(entry.selected).map((label, index)=>
                index % 1 === 0 ?
                  <View style={styles.resultRow}>
                    {
                      [
                        label,
                        // Object.keys(entry.selected)[index + 1],
                        // Object.keys(entry.selected)[index + 2],
                      ].map((label, index)=>
                        <View style={styles.resultCol}>
                          <Text style={styles.resultText}>{label}</Text>
                          <Text style={styles.resultNum}>{entry.selected[label]}</Text>
                        </View>
                      )
                    }
                  </View> : 
                  <View></View>    
            ): null
            }
          <View style={styles.buttonRow}>
            <Button
              outline
              onPress={handleDelete(entry.time)}
            >
              <Ionicons 
                color={"#fff"}
                name='trash'
                size={18}
                />
              <Text style={styles.outlineButtonText}>Xoá</Text>
            </Button>
            <Button
              onPress={handleEditParameters(entry.type, entry.inputs, entry.selected)}
            >
              <Ionicons 
                name='pencil'
                size={18}
                />
              <Text>Chỉnh sửa</Text>
            </Button>
          </View>
          </View>
      </View>
      )}
    <View style={styles.bottomSpacing}/>
    </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0d0e", // Vercel black
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#fff'
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
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
    marginVertical: 12,
  },
  resultRow: {
    justifyContent: "space-between",
    flexDirection: "row",
    minWidth: 60,
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 15
  },
  outlineButtonText: {
    color: "#fff"
  },
  bottomSpacing: {
    height: 100,
  },
  header: {
    width: "100%",
    backgroundColor: '#0c0d0e',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    borderColor: "#666",
    borderBottomWidth: 1,
    },
  emptyHistoryText: {
    fontSize: 30,
    color: "#666",
    margin: "auto",
    fontWeight: '600',
    height: 500,

    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }

});
