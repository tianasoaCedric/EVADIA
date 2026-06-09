import { View } from 'react-native';
import { useState } from 'react';
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
        placeholder="Entrez votre Nom"
        value={nom}
        onChangeText={setNom}
        iconName="person-outline"
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder="Entrez votre Prénom"
        value={prenom}
        onChangeText={setPrenom}
        iconName="person-outline"
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder="Entrez votre Adresse Email"
        value={email}
        onChangeText={setEmail}
        iconName="mail-outline"
        keyboardType="email-address"
      />

      <View style={{ height: 16 }} />

      <Input 
        placeholder="Entrez votre mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        iconName="shield-outline"
      />

      <View style={{ height: 24 }} />

      <Button 
        title="S'inscrire"
        onPress={handleSubmit}
        loading={loading}
        variant="primary"
      />
    </View>
  );
};