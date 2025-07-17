import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
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
import { Card, Button, Chip, FAB } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const ExpenseListScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showFilterModal, setShowFilterModal] = useState(false);

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
      setRefreshing(false);
    } catch (err) {
      Alert.alert('Error', 'Failed to load expenses');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
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
    setShowFilterModal(false);
  };

  const handleStatusUpdate = async (id, status, extraData = {}) => {
    try {
      await updateDoc(doc(db, 'expenses', id), {
        status,
        ...extraData,
      });
      fetchExpenses();
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
        return '#388e3c';
      case 'Approved':
        return '#43a047';
      case 'Rejected':
        return '#e53935';
      default:
        return '#f57c00';
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.rowBetween}>
          <Text style={styles.title}>{item.title}</Text>
          <Chip
            style={{
              backgroundColor: getStatusColor(item.status),
              borderWidth: 0,
            }}
            textStyle={{ color: '#fff', fontWeight: '600' }}
          >
            {item.status}
          </Chip>
        </View>

        <Text style={styles.amount}>₹{item.amount}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.meta}>
          Submitted by: {item.studentName || 'Unknown'} ({item.role})
        </Text>

        {item.receipt && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Receipt:</Text>
            <Image source={{ uri: item.receipt }} style={styles.receipt} />
          </View>
        )}

        {item.paymentProof && (
          <View style={styles.imageContainer}>
            <Text style={styles.imageLabel}>Payment Proof:</Text>
            <Image source={{ uri: item.paymentProof }} style={styles.receipt} />
          </View>
        )}

        {role === 'treasurer' && item.status === 'Pending' && (
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(item.id, 'Approved')}
              style={[styles.actionBtn, { backgroundColor: '#43a047' }]}
              labelStyle={styles.buttonLabel}
            >
              Approve
            </Button>
            <Button
              mode="contained"
              onPress={() => handleStatusUpdate(item.id, 'Rejected')}
              style={[styles.actionBtn, { backgroundColor: '#e53935' }]}
              labelStyle={styles.buttonLabel}
            >
              Reject
            </Button>
          </View>
        )}

        {role === 'treasurer' && item.status === 'Approved' && (
          <Button
            mode="contained"
            onPress={() => uploadPaymentProof(item.id)}
            style={styles.paymentButton}
            labelStyle={styles.buttonLabel}
          >
            Mark as Paid & Upload Proof
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderFilterModal = () => (
    <Modal
      visible={showFilterModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowFilterModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowFilterModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Expenses</Text>
          {['All', 'Pending', 'Approved', 'Rejected', 'Payment Cleared'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterOption,
                statusFilter === status && styles.selectedFilterOption,
              ]}
              onPress={() => handleFilterChange(status)}
            >
              <Text
                style={[
                  styles.filterOptionText,
                  statusFilter === status && styles.selectedFilterOptionText,
                ]}
              >
                {status}
              </Text>
              {statusFilter === status && (
                <View style={styles.selectedIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6200ee" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6200ee']}
            tintColor="#6200ee"
          />
        }
        ListHeaderComponent={<View style={styles.headerSpacer} />}
      />

      <FAB
        style={styles.fab}
        icon="filter"
        color="#fff"
        onPress={() => setShowFilterModal(true)}
      />

      {renderFilterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  paddingTop: 8,
  },
  headerSpacer: {
    height: 8,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    flexShrink: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 16,
    marginTop: 8,
    color: '#333',
    fontWeight: '600',
  },
  desc: {
    marginTop: 6,
    color: '#555',
    lineHeight: 20,
  },
  meta: {
    marginTop: 8,
    color: '#666',
    fontSize: 13,
  },
  imageContainer: {
    marginTop: 12,
  },
  imageLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  receipt: {
    height: 180,
    width: '100%',
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#ddd',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 8,
    elevation: 0,
  },
  paymentButton: {
    marginTop: 16,
    backgroundColor: '#006400',
    borderRadius: 8,
    elevation: 0,
  },
  buttonLabel: {
    color: '#fff',
    fontWeight: '500',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6200ee',
    textAlign: 'center',
  },
  filterOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedFilterOption: {
    backgroundColor: '#f5f5ff',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedFilterOptionText: {
    color: '#6200ee',
    fontWeight: '600',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6200ee',
  },
});

export default ExpenseListScreen;