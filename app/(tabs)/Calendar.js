import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;
const dayNamesEnglish = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const STATUSBAR_HEIGHT =
  Platform.OS === "ios" ? 20 : StatusBar.currentHeight || 24;

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infos, setInfos] = useState({});
  const [summaryTitle, setSummaryTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigation = useNavigation();

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const dayName = dayNamesEnglish[date.getDay()];
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}/${month}/${year} ${dayName}`;
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    const currentInfo = infos[day.dateString] || {
      summaryTitle: "",
      description: "",
    };
    setSummaryTitle(currentInfo.summaryTitle);
    setDescription(currentInfo.description);
    setInfoModalVisible(true);
  };

  const saveInfo = () => {
    setInfos({
      ...infos,
      [selectedDate]: { summaryTitle, description },
    });
    setInfoModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navbarTitle}>Calendar</Text>
        <View style={{ width: 24 }} />
      </View>

      <Calendar
        onDayPress={onDayPress}
        markedDates={
          selectedDate
            ? {
                [selectedDate]: {
                  selected: true,
                  selectedColor: "#70c0ba",
                  marked: infos[selectedDate]?.summaryTitle?.trim() !== "",
                  dotColor: "#ff6347",
                },
              }
            : {}
        }
      />

      {selectedDate && (
        <View style={styles.summaryContainer}>
          <Text style={styles.selectedDateTitle}>
            {formatDate(selectedDate)}
          </Text>
          <Text style={styles.summaryTitle}>
            {infos[selectedDate]?.summaryTitle?.trim() || "No description"}
          </Text>
          <Text style={styles.summaryDescription}>
            {truncateText(infos[selectedDate]?.description, 100) ||
              "No description"}
          </Text>
        </View>
      )}

      {infoModalVisible && (
        <View style={styles.infoModal}>
          <Text style={styles.infoTitle}>{formatDate(selectedDate)}</Text>

          <View style={styles.modalContent}>
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <Text style={styles.label}>Summary Title:</Text>
              <TextInput
                style={styles.input}
                value={summaryTitle}
                onChangeText={setSummaryTitle}
                placeholder="Enter summary title"
              />

              <Text style={styles.label}>Description:</Text>
              <TextInput
                style={[styles.input, { height: 100 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter description"
                multiline
              />
            </ScrollView>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.button} onPress={saveInfo}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#999" }]}
                onPress={() => setInfoModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  navbar: {
    paddingTop: STATUSBAR_HEIGHT,
    backgroundColor: "#66aca7",
    height: 56 + STATUSBAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  navbarTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  summaryContainer: {
    backgroundColor: "#e0f2f1",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 12,
    marginHorizontal: 20,
    alignItems: "center",
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
  },

  infoModalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: screenHeight * 0.6,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  infoModal: {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: screenHeight * 0.45,
  backgroundColor: '#fff',
  padding: 20,
  borderTopLeftRadius: 20,
  borderTopRightRadius: 20,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 10,
}, 

  infoTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
  },
  label: {
    fontWeight: "600",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  button: {
    backgroundColor: "#70c0ba",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  summaryDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    fontStyle: "normal",
  },
  modalContent: {
  flex: 1,
  justifyContent: 'space-between',
  },
});
