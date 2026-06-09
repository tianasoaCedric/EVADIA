import { View } from 'react-native';
import { useState } from 'react';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface LoginFormProps {
  onSubmit: (data: {
    email: string;
    password: string;
  }) => void;
  loading?: boolean;
  theme?: 'light' | 'dark';
}

export const LoginForm = ({ onSubmit, loading = false, theme = 'dark' }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onSubmit({ email, password });
  };

  return (
    <View style={{ width: 353 }}>
      <Input 
        placeholder="exemple@email.com"
        value={email}
        onChangeText={setEmail}
        iconName="mail-outline"
        keyboardType="email-address"
        theme={theme}
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder="votre mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        iconName="shield-outline"
        theme={theme}
      />

      <View style={{ height: 24 }} />

      <Button 
        title="Se connecter"
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
      />
    </View>
  );
};