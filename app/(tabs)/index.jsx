import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { FAB, Provider } from "react-native-paper";
import { StoreForDay } from "../../Store/Store";

import * as Notifications from "expo-notifications";

const screenHeight = Dimensions.get("window").height;

// Configure notification handler (optional, to show notifications while app is foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Days() {
  const NavigationBar = useNavigation();

  const Days = StoreForDay((state) => state.days);
  const StoreAddedDay = StoreForDay((state) => state.AddNewDay);
  const SetDays = StoreForDay((state) => state.SetDays);
  const AttendanceCheck = StoreForDay((state) => state.toggleAttendance);
  const [DayAddMenuOnScreen, SetDayAddMenuOnScreen] = useState(false);
  const [InformationModalOnScreen, SetInformationModalOnScreen] = useState(false);
  const [SelectedDayInfromation, SetSelectedDayInformation] = useState(null);
  const [DrawerMenuInNavBar, SetDrawerMenuInNavbar] = useState(false);
  const [drawerAnim] = useState(new Animated.Value(-250));

  const [newDayName, setNewDayName] = useState("");
  const [newCourseName, setNewCourseName] = useState("");
  const [newHour, setNewHour] = useState("");
  const [newTasks, setNewTasks] = useState([""]);

  useEffect(() => {
    // Request notification permissions on component mount
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Permission for notifications not granted. Notifications won't work.");
      }
    })();
  }, []);

  const scheduleNotification = async (day) => {
    if (!day.hour) return;

    // Parse the hour string to a Date object for today with the given hour
    const [hourStr, minuteStr] = day.hour.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr || "0", 10);

    if (isNaN(hour) || isNaN(minute)) return;

    const now = new Date();
    const notificationDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hour,
      minute,
      0
    );

    // Subtract 2 hours for notification time
    notificationDate.setHours(notificationDate.getHours() - 2);

    // If notification time is in the past, do not schedule
    if (notificationDate <= now) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `Upcoming course: ${day.CourseName || day.name}`,
        body: `Course starts at ${day.hour}. Don't forget to attend!`,
        sound: true,
      },
      trigger: notificationDate,
    });
  };

  const addDay = () => {
    if (!newDayName.trim()) return;

    const newDay = {
      id: Date.now().toString(),
      name: newDayName,
      CourseName: newCourseName,
      hour: newHour,
      completed: false,
      attended: false,
      tasks: newTasks.filter((t) => t.trim()),
    };
    StoreAddedDay(newDay);
    scheduleNotification(newDay); // Schedule notification for new day

    setNewDayName("");
    setNewCourseName("");
    setNewHour("");
    setNewTasks([""]);
    SetDayAddMenuOnScreen(false);
  };

  const deleteDay = () => {
    if (Days.length === 1) {
      alert("Can't delete the last day");
      return;
    }
    if (!SelectedDayInfromation) return;

    const filtered = Days.filter((d) => d.id !== SelectedDayInfromation.id);
    SetDays(filtered);
    SetSelectedDayInformation(null);
    SetInformationModalOnScreen(false);
  };

  const openInfo = (day) => {
    SetSelectedDayInformation(day);
    SetInformationModalOnScreen(true);
  };

  const toggleCompleted = (value) => {
    if (!SelectedDayInfromation) return;

    AttendanceCheck(SelectedDayInfromation.id, value);
    const updatedDay = { ...SelectedDayInfromation, completed: value, attended: value };
    SetSelectedDayInformation(updatedDay);
    SetDays(Days.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
  };

  const updateTask = (index, value) => {
    if (!SelectedDayInfromation) return;

    const updatedTasks = [...SelectedDayInfromation.tasks];
    updatedTasks[index] = value;

    const updatedDay = { ...SelectedDayInfromation, tasks: updatedTasks };
    SetSelectedDayInformation(updatedDay);
    SetDays(Days.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
  };

  const addNewTask = () => {
    if (!SelectedDayInfromation) return;

    const updatedDay = {
      ...SelectedDayInfromation,
      tasks: [...SelectedDayInfromation.tasks, ""],
    };
    SetSelectedDayInformation(updatedDay);
    SetDays(Days.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
  };

  const deleteTask = (index) => {
    if (!SelectedDayInfromation) return;

    const updatedTasks = SelectedDayInfromation.tasks.filter((_, i) => i !== index);
    const updatedDay = { ...SelectedDayInfromation, tasks: updatedTasks };
    SetSelectedDayInformation(updatedDay);
    SetDays(Days.map((d) => (d.id === updatedDay.id ? updatedDay : d)));
  };

  // Save changes to hour and schedule notification if hour changes
  const updateHourAndSchedule = (newHourValue) => {
    if (!SelectedDayInfromation) return;

    const updatedDay = { ...SelectedDayInfromation, hour: newHourValue };
    SetSelectedDayInformation(updatedDay);
    SetDays(Days.map((d) => (d.id === updatedDay.id ? updatedDay : d)));

    scheduleNotification(updatedDay);
  };

  return (
    <Provider>
      <View style={{ flex: 1 }}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={ToggleDrawer}>
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Course Timetable</Text>
        </View>

        <Animated.View style={[styles.drawer, { left: drawerAnim }]}>
          <Text style={styles.drawerTitle}>Navigation</Text>

          {/* Close button to close drawer */}
          <TouchableOpacity
            onPress={ToggleDrawer}
            style={{ alignSelf: "flex-end", padding: 10 }}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              NavigationBar.navigate("Calendar");
              ToggleDrawer();
            }}
          >
            <Ionicons name="today-outline" size={22} color="#333" />
            <Text style={styles.drawerText}>Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              NavigationBar.navigate("Statistics");
              ToggleDrawer();
            }}
          >
            <Ionicons name="bar-chart-outline" size={22} color="#333" />
            <Text style={styles.drawerText}>Statistics</Text>
          </TouchableOpacity>
        </Animated.View>

        <LinearGradient
          colors={["#70c0ba", "#fff"]}
          style={styles.daysMenuContainer}
        >
          <FlatList
            data={Days}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.dayItem}
                onPress={() => openInfo(item)}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={styles.dayText}>{item.name}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ marginRight: 8 }}>Attended</Text>
                    <Switch
                      value={item.attended}
                      onValueChange={(value) => {
                        AttendanceCheck(item.id, value);
                        const updated = {
                          ...item,
                          completed: value,
                          attended: value,
                        };
                        SetDays(
                          Days.map((d) => (d.id === item.id ? updated : d))
                        );
                        if (SelectedDayInfromation?.id === item.id) {
                          SetSelectedDayInformation(updated);
                        }
                      }}
                    />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </LinearGradient>

        {DayAddMenuOnScreen && (
          <View style={styles.addMenu}>
            <Text style={styles.label}>Day Name:</Text>
            <TextInput
              value={newDayName}
              onChangeText={setNewDayName}
              style={styles.input}
              placeholder="Enter day name"
            />
            <Text style={styles.label}>Course Name:</Text>
            <TextInput
              value={newCourseName}
              onChangeText={setNewCourseName}
              style={styles.input}
              placeholder="Enter Course Name"
            />
            <Text style={styles.label}>Hour:</Text>
            <TextInput
              value={newHour}
              onChangeText={setNewHour}
              style={styles.input}
              placeholder="Enter hour (HH:mm)"
            />
            <Text style={styles.label}>Tasks:</Text>
            {newTasks.map((task, idx) => (
              <TextInput
                key={idx}
                style={styles.input}
                value={task}
                placeholder={`Task ${idx + 1}`}
                onChangeText={(text) => {
                  const updated = [...newTasks];
                  updated[idx] = text;
                  setNewTasks(updated);
                }}
              />
            ))}
            <TouchableOpacity
              onPress={() => setNewTasks([...newTasks, ""])}
              style={styles.addTaskButton}
            >
              <Text>Add Task</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={addDay} style={styles.button}>
              <Text style={styles.buttonText}>Add Day</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => SetDayAddMenuOnScreen(false)}
              style={[styles.button, { backgroundColor: "#aaa" }]}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {InformationModalOnScreen && SelectedDayInfromation && (
          <View style={styles.infoModal}>
            <ScrollView>
              <Text style={styles.infoTitle}>{SelectedDayInfromation.name}</Text>

              <Text style={styles.label}>Course Name:</Text>
              <TextInput
                style={styles.input}
                value={SelectedDayInfromation.CourseName || ""}
                onChangeText={(text) => {
                  const updated = { ...SelectedDayInfromation, CourseName: text };
                  SetSelectedDayInformation(updated);
                  SetDays(Days.map((d) => (d.id === updated.id ? updated : d)));
                }}
              />

              <Text style={styles.label}>Hour:</Text>
              <TextInput
                style={styles.input}
                value={SelectedDayInfromation.hour || ""}
                onChangeText={updateHourAndSchedule}
                placeholder="HH:mm"
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginVertical: 10,
                }}
              >
                <Text>Attended: </Text>
                <Switch
                  value={SelectedDayInfromation.attended}
                  onValueChange={toggleCompleted}
                />
              </View>

              <Text style={styles.label}>Tasks:</Text>
              {SelectedDayInfromation.tasks?.map((task, idx) => (
                <View
                  key={idx}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 5,
                  }}
                >
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={task}
                    onChangeText={(text) => updateTask(idx, text)}
                    placeholder={`Task ${idx + 1}`}
                  />
                  <TouchableOpacity
                    onPress={() => deleteTask(idx)}
                    style={{ marginLeft: 5 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addNewTask} style={styles.addTaskButton}>
                <Text>Add Task</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={deleteDay} style={[styles.button, {backgroundColor:'red'}]}>
                <Text style={styles.buttonText}>Delete Day</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => SetInformationModalOnScreen(false)}
                style={[styles.button, { backgroundColor: "#aaa" }]}
              >
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}

        {!DayAddMenuOnScreen && !InformationModalOnScreen && (
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => SetDayAddMenuOnScreen(true)}
          />
        )}
      </View>
    </Provider>
  );

  function ToggleDrawer() {
    if (!DrawerMenuInNavBar) {
      Animated.timing(drawerAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(drawerAnim, {
        toValue: -250,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
    SetDrawerMenuInNavbar(!DrawerMenuInNavBar);
  }
}

const styles = StyleSheet.create({
  // Define your styles here

  /* your styles unchanged */
  navbar: {
    backgroundColor: "#66aca7",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  navTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 16,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    padding: 20,
    zIndex: 10,
    elevation: 10,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  drawerText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#333",
  },
  daysMenuContainer: {
    flex: 1,
    padding: 16,
  },
  dayItem: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 12,
    padding: 15,
    borderRadius: 10,
  },
  dayText: {
    fontSize: 18,
    color: "#fff",
  },
  addMenu: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontWeight: "600",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#777",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#6200ee",
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  infoModal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: screenHeight * 0.75,
    backgroundColor: "#fff",
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  infoTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 8,
  },
  rowAlign: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteButton: {
    marginTop: 16,
    backgroundColor: "#b00020",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: {
    marginTop: 16,
    marginBottom: 160,
    backgroundColor: "#6200ee",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 80,
    backgroundColor: "#fff",
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  deleteIcon: {
    marginLeft: 8,
    padding: 4,
  },
});
