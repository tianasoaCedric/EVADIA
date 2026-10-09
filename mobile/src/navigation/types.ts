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
  Home: undefined;
  Destination: undefined;
  Favorites: undefined;
  Offers: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  HotelDetail: { slug: string };
  DestinationDetail: { slug: string };
  OfferDetail: { slug: string };
  Discover: undefined;
  DiscoverArticle: { slug: string };
  AllHotels: undefined;
  AllOffers: undefined;
  AllDestinations: undefined;
};

export type OffersStackParamList = {
  OffersList: undefined;
  OfferDetail: { id: string; badge: string; name: string; description: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Reservations: undefined;
  ReservationChat: { reservationId: number };
};

export type DestinationStackParamList = {
  DestinationList: undefined;
  DestinationHotels: { id: number; name: string };
  HotelDetail: { id: number; name: string };
  RoomDetail: { proprieteId: number; hotelId: number; hotelName: string };
  Booking: { proprieteId: number };
};
