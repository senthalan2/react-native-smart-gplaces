import { type StyleProp, type ViewStyle, type TextStyle, type FlatListProps } from 'react-native';

export interface PlacePrediction {
  placeId: string;
  description: string;
  primaryText: string;
  secondaryText: string;
  distanceMeters?: number; // New API specific
  types?: string[];
  // GUARANTEE: The raw, unadulterated payload from Google
  originalData: Record<string, any>; 
}

export interface PlaceDetails {
  placeId: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  internationalPhoneNumber?: string;
  openingHours?: string[];
  photos?: any[];
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  addressComponents?: any[];
  types?: string[];
  // GUARANTEE: All Google data goes here without fail.
  originalData: Record<string, any>; 
}

export interface PlacesHookOptions {
  apiKey: string;
  isNewPlaces?: boolean;
  debounce?: number;
  minLength?: number;
  language?: string;
  region?: string;
  
  /**
   * Legacy: maps to `types` parameter (e.g., ['establishment', 'geocode'])
   * New: maps to `includedPrimaryTypes` (e.g., ['restaurant', 'cafe'])
   */
  types?: string | string[]; 
  
  /**
   * Define exactly which fields to fetch during Place Details.
   * Legacy Example:['name', 'rating', 'formatted_phone_number', 'geometry']
   * New Example:['id', 'displayName', 'location', 'rating', 'websiteUri']
   */
  detailsFields?: string | string[]; 
  
  locationBias?: string; 
  radius?: number;
  enableCache?: boolean;

  // Lifecycle Event Triggers
  onLoaderStart?: () => void;
  onLoaderEnd?: () => void;
  onDataLoaded?: (data: PlacePrediction[]) => void;
  onListLengthChange?: (length: number) => void;
  onError?: (error: string) => void;
}

export interface PlacesComponentProps extends PlacesHookOptions {
  placeholder?: string;
  autoFocus?: boolean;
  keepResultsAfterBlur?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  fetchDetails?: boolean;
  onPlaceSelected?: (details: PlaceDetails | null, prediction: PlacePrediction) => void;
  
  // Component Customization Overrides
  renderInput?: (props: any) => React.ReactElement;
  renderItem?: (item: { item: PlacePrediction }) => React.ReactElement;
  renderLoader?: () => React.ReactElement;
  renderEmptyComponent?: () => React.ReactElement;
  renderSeparator?: () => React.ReactElement;
  
  // Style Overrides
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  listContainerStyle?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>; // Direct style to FlatList
  listContentContainerStyle?: StyleProp<ViewStyle>; // Inner content style
  listItemStyle?: StyleProp<ViewStyle>;
  listItemTextStyle?: StyleProp<TextStyle>;
  
  // Absolute Escape Hatch: Pass ANY FlatList prop natively
  flatListProps?: Omit<Partial<FlatListProps<PlacePrediction>>, 'data' | 'renderItem'>;
}