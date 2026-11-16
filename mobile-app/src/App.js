import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const { state } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <AppNavigator isSignout={state.isSignout} />
    </NavigationContainer>
  );
}
