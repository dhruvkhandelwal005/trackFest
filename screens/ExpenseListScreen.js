// screens/ExpenseListScreen.js

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  orderBy,
} from 'firebase/firestore';
import { Card, Button, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const ExpenseListScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      const r = await AsyncStorage.getItem('userRole');
      setRole(r);
      fetchExpenses();
    };
    load();
  }, []);

  const fetchExpenses = async () => {
    try {
      const q = query(collection(db, 'expenses'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setExpenses(data);
      applyFilter(data, statusFilter);
      setLoading(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load expenses');
      setLoading(false);
    }
  };

  const applyFilter = (data, status) => {
    if (status === 'All') {
      setFilteredExpenses(data);
    } else {
      const filtered = data.filter((item) => item.status === status);
      setFilteredExpenses(filtered);
    }
  };

  const handleFilterChange = (status) => {
    setStatusFilter(status);
    applyFilter(expenses, status);
  };

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      await updateDoc(doc(db, 'expenses', id), {
        status,
        ...extraData,
      });
      fetchExpenses(); // refresh
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const uploadPaymentProof = async (id) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        handleStatusUpdate(id, 'Payment Cleared', { paymentProof: base64Image });
      }
    } catch (err) {
      Alert.alert('Error', 'Image selection failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Payment Cleared':
        return '#006400';
      case 'Approved':
        return 'green';
      case 'Rejected':
        return 'red';
      default:
        return 'orange';
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.title}</Text>
          <Chip style={{ backgroundColor: getStatusColor(item.status) }} textStyle={{ color: 'white' }}>
            {item.status}
          </Chip>
        </View>

        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.meta}>By: {item.role || 'Unknown'}</Text>

        {item.receipt && (
          <Image source={{ uri: item.receipt }} style={styles.receipt} />
        )}

        {item.paymentProof && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.meta}>Payment Proof:</Text>
            <Image source={{ uri: item.paymentProof }} style={styles.receipt} />
          </View>
        )}

        {role === 'treasurer' && item.status === 'Pending' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(item.id, 'Approved')}
              style={[styles.actionBtn, { backgroundColor: 'green' }]}
            >
              Approve
            </Button>
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(item.id, 'Rejected')}
              style={[styles.actionBtn, { backgroundColor: 'red' }]}
            >
              Reject
            </Button>
          </View>
        )}

        {role === 'treasurer' && item.status === 'Approved' && (
          <Button
            mode="contained"
            onPress={() => uploadPaymentProof(item.id)}
            style={{ marginTop: 12, backgroundColor: '#006400' }}
          >
            Mark as Paid & Upload Proof
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.filterBar}>
        {['All', 'Pending', 'Approved', 'Rejected', 'Payment Cleared'].map((status) => (
          <Chip
            key={status}
            selected={statusFilter === status}
            onPress={() => handleFilterChange(status)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  statusFilter === status ? '#6200ee' : '#f4f4f4',
              },
            ]}
            textStyle={{
              color: statusFilter === status ? '#fff' : '#6200ee',
              fontWeight: '600',
            }}
          >
            {status}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  list: { padding: 16, paddingBottom: 60 },
  card: { marginBottom: 16, borderRadius: 12, elevation: 3 },
  title: { fontSize: 18, fontWeight: 'bold' },
  amount: { fontSize: 16, marginTop: 4, color: '#444' },
  desc: { marginTop: 4, color: '#666' },
  meta: { marginTop: 4, fontStyle: 'italic', color: '#888' },
  receipt: { height: 160, width: '100%', marginTop: 12, borderRadius: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 },
  actionBtn: { flex: 1, marginHorizontal: 6 },
  center: { flex: 1, justifyContent: 'center' },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: '#fff',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
    borderColor: '#6200ee',
  },
});

export default ExpenseListScreen;
