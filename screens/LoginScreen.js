import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';

const LoginScreen = ({ navigation }) => {
  useEffect(() => {
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
      <Text style={styles.title}>🎉 Welcome to TrackFest</Text>
      <Text style={styles.subtitle}>Choose your role to continue</Text>

      <View style={styles.card}>
        <Image
          source={{
            uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
          }}
          style={styles.image}
        />

        <Button
          mode="contained"
          onPress={() => handleLogin('student')}
          style={styles.buttonPrimary}
          labelStyle={styles.buttonLabel}
          contentStyle={{ paddingVertical: 6 }}
        >
          I am a Student
        </Button>

        <Button
          mode="outlined"
          onPress={() => handleLogin('treasurer')}
          style={styles.buttonOutlined}
          labelStyle={[styles.buttonLabel, { color: '#6200ee' }]}
          contentStyle={{ paddingVertical: 6 }}
        >
          I am a Treasurer
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  image: {
    width: 140,
    height: 140,
    marginBottom: 30,
  },
  buttonPrimary: {
    width: '100%',
    borderRadius: 10,
    backgroundColor: '#6200ee',
    marginBottom: 16,
  },
  buttonOutlined: {
    width: '100%',
    borderRadius: 10,
    borderColor: '#6200ee',
    borderWidth: 1.5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LoginScreen;
