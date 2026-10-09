import { View } from 'react-native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '../atoms/Input';
import { Button } from '../atoms/Button';

interface RegisterFormProps {
  onSubmit: (data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
  }) => void;
  loading?: boolean;
}

export const RegisterForm = ({ onSubmit, loading = false }: RegisterFormProps) => {
  const { t } = useTranslation();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onSubmit({ nom, prenom, email, password });
  };

  return (
    <View style={{ width: 353 }}>
      <Input 
        placeholder={t('Register.last_name_placeholder')}
        value={nom}
        onChangeText={setNom}
        iconName="person-outline"
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder={t('Register.first_name_placeholder')}
        value={prenom}
        onChangeText={setPrenom}
        iconName="person-outline"
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder={t('Register.email_placeholder')}
        value={email}
        onChangeText={setEmail}
        iconName="mail-outline"
        keyboardType="email-address"
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder={t('Register.password_placeholder')}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        iconName="shield-outline"
      />

      <View style={{ height: 24 }} />

      <Button 
        title={t('Register.register_button')}
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
      />
    </View>
  );
};