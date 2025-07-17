import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import ExpenseListScreen from './screens/ExpenseListScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
          <Stack.Screen name="Expenses" component={ExpenseListScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
