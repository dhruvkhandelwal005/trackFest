import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  useEffect(() => {
    // Auto-login if role is already saved
    const checkLogin = async () => {
      const role = await AsyncStorage.getItem('userRole');
      if (role) {
        navigation.replace('Dashboard');
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async (role) => {
    await AsyncStorage.setItem('userRole', role);
    navigation.replace('Dashboard');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to TrackFest 🎉</Text>
      <Text style={styles.subtitle}>Select your role to continue</Text>

      <Image
        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
        style={styles.image}
      />

      <Button
        mode="contained"
        onPress={() => handleLogin('student')}
        style={styles.button}
        labelStyle={styles.buttonText}
      >
        I am a Student
      </Button>

      <Button
        mode="outlined"
        onPress={() => handleLogin('treasurer')}
        style={[styles.button, styles.outlined]}
        labelStyle={[styles.buttonText, { color: '#6200ee' }]}
      >
        I am a Treasurer
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#444',
    marginBottom: 20,
  },
  image: {
    width: 160,
    height: 160,
    marginBottom: 40,
  },
  button: {
    width: '100%',
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  outlined: {
    borderWidth: 1,
    borderColor: '#6200ee',
  },
  buttonText: {
    fontSize: 16,
  },
});

export default LoginScreen;