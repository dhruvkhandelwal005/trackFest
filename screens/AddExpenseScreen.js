// screens/AddExpenseScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const AddExpenseScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]); // includes base64
    }
  };

  const submitExpense = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please enter title and amount');
      return;
    }

    setLoading(true);

    try {
      const role = await AsyncStorage.getItem('userRole');
      const base64Image = image?.base64
        ? `data:image/jpeg;base64,${image.base64}`
        : null;

      await addDoc(collection(db, 'expenses'), {
        title,
        amount: parseFloat(amount),
        description: desc,
        role,
        status: 'Pending',
        createdAt: serverTimestamp(),
        receipt: base64Image,
      });

      Alert.alert('Success', 'Expense submitted!');
      navigation.goBack();
    } catch (err) {
      console.log('ERROR:', err);
      Alert.alert('Error', 'Something went wrong');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Expense</Text>

      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Amount (₹)"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Description"
        value={desc}
        onChangeText={setDesc}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <TouchableOpacity onPress={pickImage}>
        <View style={styles.imagePicker}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Tap to upload receipt</Text>
          )}
        </View>
      </TouchableOpacity>

      <Button
        mode="contained"
        onPress={submitExpense}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Submit Expense
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  imagePicker: {
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#aaa',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    color: '#999',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  button: {
    paddingVertical: 6,
  },
});

export default AddExpenseScreen;
