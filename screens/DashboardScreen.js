// screens/DashboardScreen.js

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Card, ProgressBar, TextInput } from 'react-native-paper';
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
  const remaining = totalBudget - totalSpent;
  const progress = totalBudget > 0 ? totalSpent / totalBudget : 0;

  return (
    <View style={styles.container}>
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
                style={{ marginBottom: 12 }}
              />
              <Button mode="contained" onPress={saveBudget}>
                Save Budget
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.cardText}>Total Budget: ₹{totalBudget}</Text>
              <Text style={styles.cardText}>Spent: ₹{totalSpent}</Text>
              <Text style={styles.cardText}>Remaining: ₹{remaining}</Text>
              <ProgressBar progress={progress} color="#6200ee" style={{ marginTop: 12 }} />
              {role === 'treasurer' && (
                <Button onPress={() => setEditMode(true)} style={{ marginTop: 12 }}>
                  Set Budget
                </Button>
              )}
            </>
          )}
        </Card.Content>
      </Card>

      {role === 'student' && (
        <Button
          mode="contained"
          onPress={() => navigation.navigate('AddExpense')}
          style={styles.button}
        >
          Add Expense
        </Button>
      )}

      <Button
        mode="outlined"
        onPress={() => navigation.navigate('Expenses')}
        style={[styles.button, styles.outlined]}
      >
        View All Expenses
      </Button>

      <Button
        onPress={async () => {
          await AsyncStorage.clear();
          navigation.replace('Login');
        }}
        style={{ marginTop: 30 }}
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 70,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200ee',
    textAlign: 'center',
  },
  card: {
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 30,
    elevation: 4,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 4,
  },
  button: {
    marginBottom: 16,
    paddingVertical: 6,
  },
  outlined: {
    borderColor: '#6200ee',
  },
});

export default DashboardScreen;