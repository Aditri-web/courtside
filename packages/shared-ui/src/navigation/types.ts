export type RootStackParamList = {
  DrawerNavigator: undefined;
  Details: {
    title: string;
    description: string;
    headerImage: string;
    movie: string;
    category?: string;
    genres?: string[];
    releaseYear?: number;
    rating?: number;
    ratingCount?: number;
    contentRating?: string;
    duration?: number;
  };
  Player: {
    movie?: string;
    headerImage?: string;
  };
};

export type DrawerParamList = {
  Home: undefined;
  Live: undefined;
  Highlights: undefined;
  Family: undefined;
  Settings: undefined;
};
