import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StoreForDay } from '../../Store/Store';

function DayDetails({ day }) {
  return (
    <View style={styles.dayItem}>
      <View style={styles.tableContent}>
        <Text style={styles.dayText}>{day.name}</Text>
        <Text style={styles.courseName}>{day.CourseName || 'No Course Name'}</Text>
        <Text style={styles.attendanceText}>
          Attendance: {day.attended ? 'Present' : 'Absent'}
        </Text>
      </View>

      <View style={styles.tableDetails}>
        <Text style={styles.tableHeader}>Tasks</Text>
      </View>

      {day.tasks && day.tasks.length > 0 ? (
        day.tasks.map((task, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.task}>{task}</Text>
          </View>
        ))
      ) : (
        <Text style={styles.noTasks}>No tasks added.</Text>
      )}
    </View>
  );
}

export default function Statistics() {
  const navigation = useNavigation();
  const days = StoreForDay((state) => state.days);

  const total = days.length;
  const attended = days.filter((d) => d.attended).length;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.navbar}>
        <Ionicons
          name="arrow-back"
          size={28}
          color="#fff"
          onPress={() => navigation.goBack()}
          style={{ paddingRight: 10 }}
        />
        <Text style={styles.navTitle}>Statistics</Text>
      </View>

      <LinearGradient colors={['#70c0ba', '#fff']} style={styles.container}>
        <View style={styles.summary}>
          <Text style={styles.summaryText}>Total Classes: {total}</Text>
          <Text style={styles.summaryText}>Attended Classes: {attended}</Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
          {days.map((day) => (
            <DayDetails key={day.id} day={day} />
          ))}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
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
  },
  container: {
    flex: 1,
    padding: 16,
  },
  summary: {
    marginBottom: 20,
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 16,
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  dayItem: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  tableContent: {
    marginBottom: 12,
  },
  dayText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  courseName: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
  },
  attendanceText: {
    fontSize: 16,
    marginTop: 6,
  },
  tableDetails: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    paddingTop: 8,
  },
  tableHeader: {
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 8,
  },
  tableRow: {
    paddingVertical: 4,
  },
  task: {
    fontSize: 14,
    color: "#333",
  },
  noTasks: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#999",
  },
});
