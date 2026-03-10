import { type StyleProp, type ViewStyle, type TextStyle, type FlatListProps, type TextInputProps } from 'react-native';

 export type SetQueryProp = React.Dispatch<React.SetStateAction<string>>;
export interface PlacePrediction {
  placeId: string;
  description: string;
  primaryText: string;
  secondaryText: string;
  distanceMeters?: number;
  types?: string[];
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
  originalData: Record<string, any>; 
}

export interface PlacesHookOptions {
  apiKey: string;
  isNewPlaces?: boolean;
  debounce?: number;
  minLength?: number;
  language?: string;
  region?: string;
  types?: string | string[]; 
  detailsFields?: string | string[]; 
  locationBias?: string; 
  radius?: number;
  enableCache?: boolean;

  onLoaderStart?: () => void;
  onLoaderEnd?: () => void;
  onDataLoaded?: (data: PlacePrediction[]) => void;
  onListLengthChange?: (length: number) => void;
  onError?: (error: string) => void;
}

export interface DisableDefaultStyles {
  container?: boolean;
  inputWrapper?: boolean;
  input?: boolean;
  listContainer?: boolean;
  list?: boolean;
  listContent?: boolean;
  listItem?: boolean;
  primaryText?: boolean;
  secondaryText?: boolean;
  separator?: boolean;
  loader?: boolean;
  empty?: boolean;
}

export interface PlacesComponentProps extends PlacesHookOptions {
  placeholder?: string;
  autoFocus?: boolean;
  keepResultsAfterBlur?: boolean;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  fetchDetails?: boolean;
  
  // 🔥 NEW: Show empty list or cached results immediately on mount
  renderListInitially?: boolean; 
  
  /**
   * 🔥 NEW: Determines the architectural layout of the results list.
   * 'floating': Renders absolutely positioned over other content (Dropdown style).
   * 'flat': Renders inline, pushing content down or filling a fullscreen view.
   * Default: 'floating'
   */
  listMode?: 'flat' | 'floating';

  onPlaceSelected?: (details: PlaceDetails | null, prediction: PlacePrediction) => void;
  
  disableDefaultStyles?: DisableDefaultStyles;

  renderInput?: (props: any) => React.ReactElement;
  renderItem?: (item: { item: PlacePrediction }) => React.ReactElement;
  renderLoader?: () => React.ReactElement;
  renderEmptyComponent?: () => React.ReactElement;
  renderSeparator?: () => React.ReactElement;
  
  containerStyle?: StyleProp<ViewStyle>;
  inputWrapperStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  listContainerStyle?: StyleProp<ViewStyle>;
  listStyle?: StyleProp<ViewStyle>;
  listContentContainerStyle?: StyleProp<ViewStyle>;
  listItemStyle?: StyleProp<ViewStyle>;
  listItemTextStyle?: StyleProp<TextStyle>;
  
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
  flatListProps?: Omit<Partial<FlatListProps<PlacePrediction>>, 'data' | 'renderItem'>;
}

  export interface UsePlacesAutocompleteReturn {
    query: string;
    setQuery: SetQueryProp
    results: PlacePrediction[];
    loading: boolean;
    error: string | null;
    fetchPlaceDetails: (placeId: string) => Promise<PlaceDetails>;
    clearResults: () => void;
    resetSession: () => void;
    }