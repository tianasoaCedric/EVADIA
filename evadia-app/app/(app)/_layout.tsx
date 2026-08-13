import { Tabs, usePathname } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Text } from 'react-native';

export default function AppLayout() {
  const pathname = usePathname();
  const isDestinationActive =
    pathname === '/destination' ||
    pathname === '/destination-detail' ||
    pathname === '/hotel-detail' ||
    pathname === '/proprieter-detail';

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // On utilise notre propre composant Header personnalisé sur chaque écran
        tabBarActiveTintColor: '#01BDA5',
        tabBarInactiveTintColor: '#737373',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1.5,
          borderTopColor: '#f3f4f6',
          height: 78,           // Augmente la hauteur globale
          paddingBottom: 18,    // Remonte les icônes et textes
          paddingTop: 10,       // Espace suffisant sur le dessus
          paddingHorizontal: 12, // Écart intermédiaire parfait (pas trop serré, pas trop écarté)
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Outfit_300Light',
          marginTop: 2,
        }
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={26} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="destination" 
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={{ 
              color: focused || isDestinationActive ? '#01BDA5' : '#737373',
              fontSize: 11,
              fontFamily: 'Outfit_300Light',
              marginTop: 2
            }}>
              Destination
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="map-pin"
              size={26}
              color={focused || isDestinationActive ? '#01BDA5' : color}
            />
          ),
        }} 
      />

      <Tabs.Screen 
        name="favorites" 
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color }) => (
            <Feather name="heart" size={26} color={color} />
          ),
        }} 
      />

      <Tabs.Screen 
        name="offers" 
        options={{
          title: 'Offres',
          tabBarIcon: ({ color }) => (
            <Feather name="tag" size={26} color={color} />
          ),
        }} 
      />
      
      
      <Tabs.Screen
        name="destination-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="hotel-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="proprieter-detail"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Vous',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={26} color={color} />
          ),
        }} 
      />
    </Tabs>
  );
}