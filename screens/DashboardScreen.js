import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, Card, ProgressBar } from 'react-native-paper';
import { useIsFocused } from '@react-navigation/native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

const DashboardScreen = ({ navigation }) => {
  const [role, setRole] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [totalBudget, setTotalBudget] = useState(10000); // Fixed for now
  const isFocused = useIsFocused();

  useEffect(() => {
    getRole();
  }, []);

  useEffect(() => {
    if (isFocused) {
      fetchExpenses();
    }
  }, [isFocused]);

  const getRole = async () => {
    const savedRole = await AsyncStorage.getItem('userRole');
    setRole(savedRole);
  };

  const fetchExpenses = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'expenses'));
      const data = snapshot.docs.map(doc => doc.data());
      setExpenses(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch expenses');
    }
  };

  const totalSpent = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const remaining = totalBudget - totalSpent;
  const progress = totalSpent / totalBudget;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard ({role})</Text>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.cardText}>Total Budget: ₹{totalBudget}</Text>
          <Text style={styles.cardText}>Spent: ₹{totalSpent}</Text>
          <Text style={styles.cardText}>Remaining: ₹{remaining}</Text>
          <ProgressBar progress={progress} color="#6200ee" style={{ marginTop: 12 }} />
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
