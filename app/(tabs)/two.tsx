import { Image, StyleSheet, Platform, FlatList, View, Text, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import { Inputs, Selected } from '@/components/screen/CalculateBellSpecs';
import { ScreenSingleton } from '.';
import { router } from 'expo-router';
export default function BookmarkScreen() {
  const screenSingleton = ScreenSingleton.getInstance()
  const [bookmarks, setBookmarks] = useState<Record<string, any>[]>([])
  function handleEditParameters(type: string, inputs: Inputs, selected: Selected) {
    return () => {
      // if (screenSingleton.setInputs ) {
        //   console.log('input set!')
        //   screenSingleton.setInputs(inputs)
        // }
        // if (screenSingleton.setSelected)
        //   screenSingleton.setSelected(selected)
        // if (screenSingleton.setSelectedScreen)
        //   screenSingleton.setSelectedScreen(type)
        screenSingleton.selectedScreen = type
        screenSingleton.inputs = inputs
        screenSingleton.selected = selected
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
    }, 500); // polling every second (adjust as needed)

    return () => clearInterval(interval); // cleanup
  }, []);
  function handleDelete(time: string) {
    return async () => {
      let updatedBookmarks =
        bookmarks.filter((bookmark) => bookmark.time != time)
      setBookmarks(updatedBookmarks)
      await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks))
    }
  }
  return (
    <ScrollView style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // Vercel black
    paddingHorizontal: 16
  },
  title: {
    fontSize: 30,
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
    backgroundColor: "#3b82f633",
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6", // Vercel blue
    rowGap: 10,
    marginHorizontal: 8,
    marginVertical: 20,
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
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  outlineButtonText: {
    color: "#fff"
  },
  bottomSpacing: {
    height: 100,
  }

});
