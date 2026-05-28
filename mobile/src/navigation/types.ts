import type { NavigatorScreenParams } from "@react-navigation/native";

export type HomeStackParamList = {
  HomeScreen: undefined;
  Search: undefined;
  HotelDetail: { id: string; name: string };
  DestinationHotels: { id: string; name: string; type: "ville" | "destination" };
  RoomDetail: { id: string; name: string; price: string; beds: number; sdb: number; pers: number };
  Booking: { roomName: string; price: string; proprieteId?: number };
  Reservations: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Register: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList> | undefined;
  Destination: undefined;
  Favorites: undefined;
  Offers: undefined;
  Profile: undefined;
};

export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { id: string; badge: string; name: string; description: string; photo?: string };
};

export type DestinationStackParamList = {
  DestinationList: undefined;
  DestinationHotels: { id: string; name: string; type?: "ville" | "destination" };
  HotelDetail: { id: string; name: string };
  RoomDetail: { id: string; name: string; price: string; beds: number; sdb: number; pers: number };
  Booking: { roomName: string; price: string; proprieteId?: number };
  Reservations: undefined;
};
