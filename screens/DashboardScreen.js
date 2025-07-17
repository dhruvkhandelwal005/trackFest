import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Card, ProgressBar, TextInput, Menu } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../services/firebase';

const DashboardScreen = ({ navigation }) => {
  const [role, setRole] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [studentNames, setStudentNames] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    getRole();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchExpenses();
      fetchBudget();
    }
  }, [isFocused]);

  const getRole = async () => {
    const savedRole = await AsyncStorage.getItem('userRole');
    setRole(savedRole);
  };

  const fetchExpenses = async () => {
    const snapshot = await getDocs(collection(db, 'expenses'));
    const data = snapshot.docs.map((doc) => doc.data());
    setExpenses(data);

    const uniqueNames = [...new Set(data.map((item) => item.studentName).filter(Boolean))];
    setStudentNames(uniqueNames);
  };

  const fetchBudget = async () => {
    const ref = doc(db, 'settings', 'budget');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setTotalBudget(snap.data().total || 0);
    } else {
      setTotalBudget(0);
    }
  };

  const saveBudget = async () => {
    if (!newBudget) {
      Alert.alert('Enter a valid amount');
      return;
    }
    const ref = doc(db, 'settings', 'budget');
    await setDoc(ref, { total: parseFloat(newBudget) });
    setTotalBudget(parseFloat(newBudget));
    setEditMode(false);
    Alert.alert('Success', 'Budget updated');
  };

  const totalSpent = expenses
    .filter((item) => item.status === 'Payment Cleared')
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const pendingBills = expenses.filter((item) => item.status === 'Pending').length;

  const remaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? totalSpent / totalBudget : 0;

  const studentExpenses = expenses.filter((e) => e.studentName === selectedStudent);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Dashboard ({role})</Text>

      <Card style={styles.card}>
        <Card.Content>
          {editMode ? (
            <>
              <TextInput
                label="Set Total Budget (₹)"
                value={newBudget}
                onChangeText={setNewBudget}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
              />
              <Button mode="contained" onPress={saveBudget} style={styles.primaryButton}>
                Save Budget
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.cardText}> Total Budget: ₹{totalBudget}</Text>
              <Text style={styles.cardText}> Spent: ₹{totalSpent}</Text>
              <Text style={styles.cardText}> Remaining: ₹{remaining}</Text>
              <Text style={styles.cardText}> Pending Bills: {pendingBills}</Text>
              <ProgressBar
                progress={progress}
                color="#6200ee"
                style={styles.progressBar}
              />
              {role === 'treasurer' && (
                <Button
                  onPress={() => setEditMode(true)}
                  style={styles.secondaryButton}
                  mode="outlined"
                >
                   Set Budget
                </Button>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {role === 'student' && (
        <>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardText}> View Your Expenses</Text>
              <Menu
                visible={menuVisible}
                onDismiss={() => setMenuVisible(false)}
                anchor={
                  <Button
                    mode="outlined"
                    onPress={() => setMenuVisible(true)}
                    style={styles.secondaryButton}
                  >
                    {selectedStudent ? `👤 ${selectedStudent}` : 'Select Your Name'}
                  </Button>
                }
              >
                {studentNames.map((name, index) => (
                  <Menu.Item
                    key={index}
                    title={name}
                    onPress={() => {
                      setSelectedStudent(name);
                      setMenuVisible(false);
                    }}
                  />
                ))}
              </Menu>

              {selectedStudent && studentExpenses.length === 0 && (
                <Text style={{ marginTop: 10, color: '#888' }}>No expenses found.</Text>
              )}

              {selectedStudent &&
                studentExpenses.map((exp, idx) => (
                  <View key={idx} style={styles.expenseBox}>
                    <Text style={{ fontWeight: 'bold' }}>{exp.title}</Text>
                    <Text>₹{exp.amount} - {exp.status}</Text>
                  </View>
                ))}
            </Card.Content>
          </Card>

          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddExpense')}
            style={styles.primaryButton}
            labelStyle={styles.buttonLabel}
          >
             Add Expense
          </Button>
        </>
      )}

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Expenses')}
        style={styles.secondaryButton}
        labelStyle={[styles.buttonLabel, { color: '#6200ee' }]}
      >
         View All Expenses
      </Button>

      <Button
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        }}
        style={styles.logoutButton}
        labelStyle={{ color: '#d32f2f', fontWeight: 'bold' }}
      >
         Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 70,
    backgroundColor: '#f4f6fc',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6200ee',
    textAlign: 'center',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 4,
    padding: 16,
    marginBottom: 30,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  progressBar: {
    marginTop: 12,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  input: {
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6200ee',
    borderRadius: 10,
    marginBottom: 16,
  },
  secondaryButton: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#6200ee',
    marginTop: 16,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 40,
    alignSelf: 'center',
  },
  expenseBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f2f2f2',
  },
});

export default DashboardScreen;
