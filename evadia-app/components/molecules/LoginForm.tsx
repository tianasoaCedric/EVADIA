import { View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onSubmit({ email, password });
  };

  return (
    <View style={{ width: 353 }}>
      <Input 
        placeholder={t('Login.email_placeholder')}
        value={email}
        onChangeText={setEmail}
        iconName="mail-outline"
        keyboardType="email-address"
        theme={theme}
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder={t('Login.password_placeholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        iconName="shield-outline"
        theme={theme}
      />

      <View style={{ height: 24 }} />

      <Button 
        title={t('Login.login_button')}
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
      />
    </View>
  );
};