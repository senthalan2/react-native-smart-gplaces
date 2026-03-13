import type {
  StyleProp,
  ViewStyle,
  TextStyle,
  FlatListProps,
  TextInputProps,
} from 'react-native';

/** Bulletproof extraction of the Focus event type that works across all React Native versions */
export type TextInputFocusEvent = Parameters<
  NonNullable<TextInputProps['onFocus']>
>[0];

/** Custom setter function to update query and optionally skip the debounced network request */
export type SetQueryFunctionProp = (text: string, skipSearch?: boolean) => void;

export interface PlacePrediction {
  /** The unique identifier of the place returned by Google. */
  placeId: string;
  /** The full text description of the place. */
  description: string;
  /** The main text description (e.g., "Starbucks"). */
  primaryText: string;
  /** The secondary text description (e.g., "123 Main St, New York, NY"). */
  secondaryText: string;
  /** The distance in meters from the provided location bias (New API only). */
  distanceMeters?: number;
  /** Array of types representing the place (e.g., ["restaurant", "cafe"]). */
  types?: string[];
  /** 100% of the raw, unadulterated JSON response from Google Autocomplete API. */
  originalData: Record<string, unknown>;
}

export interface PlaceDetails {
  /** The unique identifier of the place. */
  placeId: string;
  /** The display name of the place. */
  name?: string;
  /** The fully formatted address of the place. */
  address?: string;
  /** The latitude coordinate of the place. */
  latitude?: number;
  /** The longitude coordinate of the place. */
  longitude?: number;
  /** The local formatted phone number. */
  phoneNumber?: string;
  /** The international formatted phone number. */
  internationalPhoneNumber?: string;
  /** Array of strings detailing the opening hours for the week. */
  openingHours?: string[];
  /** Array of Google photo reference objects. */
  photos?: Record<string, unknown>[];
  /** The official website URI of the place. */
  website?: string;
  /** The place's star rating (1.0 - 5.0). */
  rating?: number;
  /** The total number of user ratings the place has received. */
  userRatingsTotal?: number;
  /** The broken-down address components (city, state, country, etc.). */
  addressComponents?: Record<string, unknown>[];
  /** Array of types representing the place. */
  types?: string[];
  /** 100% of the raw, unadulterated JSON response from Google Details API. */
  originalData: Record<string, unknown>;
}

export interface LocationCoordinate {
  latitude: number;
  longitude: number;
}

export interface PlacesHookOptions {
  /** Your Google Maps API Key. Required to make network requests. */
  apiKey: string;
  /** If true, uses the newer, modern Google Places API v1 instead of the Legacy API. Default is true. */
  isNewPlaces?: boolean;
  /** Milliseconds to wait after the user stops typing before making a network request. Default is 400. */
  debounce?: number;
  /** Minimum characters needed to trigger a search request. Default is 2. */
  minLength?: number;
  // --- GOOGLE API: UNIFIED PARAMETERS ---

  /** (Legacy & New) The language code to return results in (e.g., 'en', 'fr'). */
  language?: string;
  /** (Legacy & New) The region code to bias results towards (e.g., 'us', 'gb'). */
  region?: string;
  /** (Legacy & New) Maps to `types` (Legacy) or `includedPrimaryTypes` (New API). Restricts the types of places returned. */
  types?: string | string[];
  /** (Legacy & New) Restricts results to specific countries. Array of 2-character ISO 3166-1 Alpha-2 country codes (e.g., ['us', 'ca']). */
  countries?: string | string[];
  /** (Legacy & New) The origin point from which to calculate straight-line distance to the destination (`distanceMeters`). */
  origin?: LocationCoordinate;
  /** (Legacy & New) The position, in the input term, of the last character that the service uses to match predictions. */
  offset?: number;
  /** (Legacy & New) Define exactly which fields to fetch during Place Details to reduce API cost. e.g., ['id', 'location'] */
  detailsFields?: string | string[];

  // --- GOOGLE API: LOCATION BIASING & RESTRICTION ---

  /** (Legacy & New) Passes the user's current coordinates to prioritize nearby places (Soft Limit). */
  currentLocation?: LocationCoordinate;
  /** (Legacy & New) Passes coordinates to STRICTLY RESTRICT results to this area (Hard Limit). Applies `strictbounds` in Legacy API. */
  locationRestriction?: LocationCoordinate;
  /** (Legacy & New) The radius (in meters) around `currentLocation` or `locationRestriction`. Default is 50000 (50km). */
  locationRadius?: number;
  /** (Legacy Only) Advanced: Raw location bias string if you don't want to use `currentLocation`. */
  locationBias?: string;
  /** (Legacy Only) Advanced: Raw radius parameter. */
  radius?: number;

  // --- GOOGLE API: LEGACY SPECIFIC FEATURES ---

  /** (Legacy Details Only) Specify whether to disable translation of reviews. */
  reviewsNoTranslations?: boolean;
  /** (Legacy Details Only) Sorting method for reviews: 'most_relevant' or 'newest'. */
  reviewsSort?: 'most_relevant' | 'newest';

  // --- PACKAGE ARCHITECTURE CONFIG --

  /** Caches results in-memory to prevent duplicate network calls. Default is true. */
  enableCache?: boolean;
  /** CORS bypass proxy URL for the Autocomplete API (Crucial for Expo Web). */
  autocompleteProxyUrl?: string;
  /** CORS bypass proxy URL for the Details API (Crucial for Expo Web). */
  detailsProxyUrl?: string;
  /** Triggered exactly when the search network request begins. */
  onLoaderStart?: () => void;
  /** Triggered when the search network request finishes, regardless of success or failure. */
  onLoaderEnd?: () => void;
  /** Triggered when the autocomplete data is successfully loaded from the network or cache. */
  onDataLoaded?: (data: PlacePrediction[]) => void;
  /** Triggered when the length of the visible results array changes. */
  onListLengthChange?: (length: number) => void;
  /** Triggered when an error occurs during the autocomplete search API call. */
  onError?: (error: string) => void;

  /** Triggered when starting to fetch full place details. Passes the placeId. */
  onStartFetchingDetails?: (placeId: string) => void;
  /** Triggered if an error occurs while fetching full place details. */
  onErrorFetchingDetails?: (error: string) => void;
}

export interface DisableDefaultStyles {
  /** Disables default styling for the outermost container view. */
  container?: boolean;
  /** Disables default styling for the wrapper containing the text input and loader/clear button. */
  inputWrapper?: boolean;
  /** Disables default styling for the native TextInput element. */
  input?: boolean;
  /** Disables default styling for the clear (✕) button wrapper. */
  clearButton?: boolean;
  /** Disables default styling for the text inside the clear (✕) button. */
  clearButtonText?: boolean;
  /** Disables default styling for the loading indicator placed inside the text input. */
  loaderInput?: boolean;
  /** Disables default styling for the container wrapping the list-level loading indicator. */
  listLoaderContainer?: boolean;
  /** Disables default styling for the view wrapping the FlatList. */
  listContainer?: boolean;
  /** Disables default styling passed to the `style` prop of the FlatList. */
  list?: boolean;
  /** Disables default styling passed to the `contentContainerStyle` prop of the FlatList. */
  listContent?: boolean;
  /** Disables default styling for the default prediction row item. */
  listItem?: boolean;
  /** Disables default styling for the primary text in the default prediction row item. */
  primaryText?: boolean;
  /** Disables default styling for the secondary text in the default prediction row item. */
  secondaryText?: boolean;
  /** Disables default styling for the divider line between list items. */
  separator?: boolean;
  /** Disables default styling for the text shown when no results are found. */
  empty?: boolean;
}

export interface RenderInputProps {
  /** The current text query value. */
  value: string;
  /** Function to update the text query value. */
  onChangeText: (text: string) => void;
  /** Function to trigger the list visibility on focus. */
  onFocus: (e: TextInputFocusEvent) => void;
  /** Function to handle input blur events and hide the list. */
  onBlur: (e: TextInputFocusEvent) => void;
  /** Function to completely clear the input and the results. */
  onClear: () => void;
}

export interface RenderItemProps {
  /** The current place prediction item object. */
  item: PlacePrediction;
  /** The function to call when the user selects this item. Call this in your custom Touchable component. */
  onSelect: () => void;
}

export interface RenderComponentState {
  /** The current text typed in the input. */
  query: string;
  /** The current number of predictions in the list. */
  listLength: number;
  /** True if the Autocomplete API is currently fetching data. */
  isLoading: boolean;
  /** True strictly during the debounce period (user is actively typing). */
  isTyping: boolean;
  /** Contains the error message if the API call failed, otherwise null. */
  error: string | null;
}

export interface PlacesComponentProps extends PlacesHookOptions {
  /** The placeholder text shown inside the TextInput. */
  placeholder?: string;
  /** If true, automatically fetches Place Details (coordinates, etc.) when a user taps a prediction. */
  fetchDetails?: boolean;
  /** If true, shows the empty list or cached results immediately on component mount without requiring input. */
  renderListInitially?: boolean;
  /**
   * 'floating': Renders as an absolute dropdown over other content (Ideal for forms).
   * 'flat': Renders inline, taking up remaining flex space (Ideal for full-screen search pages).
   */
  listMode?: 'flat' | 'floating';
  /** Dictates where to show the search loading ActivityIndicator. 'input' (inline), 'list' (centered below), or 'both'. */
  loaderPlacement?: 'input' | 'list' | 'both';

  /** If true, displays the clear (✕) button when text is present. Default is true. */
  showClearButton?: boolean;
  /** If true, automatically updates the text input with the selected place's description upon selection. Default is true. */
  setQueryOnSelect?: boolean;
  /** If true, automatically removes focus and dismisses the keyboard after a place is selected. Default is true. */
  blurOnSelect?: boolean;
  /** If true, automatically shows the input loader while `fetchDetails` is running.
   * Default is true.
   * */
  showLoaderDuringDetailsFetch?: boolean;
  /** Set to false to hide the "No results found" component.
   * Default is true.
   * */
  showEmptyComponent?: boolean;
  /** Set to false to hide the divider lines between list items.
   * Default is true.
   * */
  showSeparator?: boolean;
  /** Set to false to hide the ActivityIndicator inside the list area.
   * Default is true.
   * */
  showListLoader?: boolean;

  /** Triggered when a place is tapped. Includes full details if `fetchDetails` is true, otherwise null. */
  onPlaceSelected?: (
    details: PlaceDetails | null,
    prediction: PlacePrediction
  ) => void;

  /** If true, the prediction results list will remain visible on screen even after an item is selected or input is blurred. */
  keepResultsAfterBlur?: boolean;
  /** Determines when the keyboard should close when tapping on the prediction list. Default is 'handled'. */
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';

  /** Pass `true` to instantly disable ALL default library styles, or pass an object to pick and choose. */
  disableDefaultStyles?: boolean | DisableDefaultStyles;
  /**
   *  Determines where the custom header component is rendered.
   * 'insideList': Renders inside the dropdown/list container (only visible when list is shown).
   * 'outsideList': Renders below the input but outside the list container (always visible).
   */
  headerComponentPlacement?: 'insideList' | 'outsideList';

  /** Render a custom component immediately below the input, above the list and list loader.
   *  Receives current search state.
   */
  renderHeaderComponent?: (
    state: RenderComponentState
  ) => React.ReactElement | undefined;
  /** Completely overrides the default TextInput component. */
  renderInput?: (props: RenderInputProps) => React.ReactElement | undefined;
  /** Completely overrides the design of the individual prediction list items. */
  renderItem?: (props: RenderItemProps) => React.ReactElement;
  /** Completely overrides the default ActivityIndicator loading component shown inside the TextInput. */
  renderInputLoader?: () => React.ReactElement | undefined;
  /** Completely overrides the default ActivityIndicator loading component shown in the List dropdown. */
  renderListLoader?: () => React.ReactElement | undefined;
  /** Completely overrides the UI shown when a search yields 0 results. */
  renderEmptyComponent?: (
    state: RenderComponentState
  ) => React.ReactElement | undefined;
  /** Completely overrides the line separator rendered between list items. */
  renderSeparator?: () => React.ReactElement | undefined;
  /** Completely overrides the design of the Clear (✕) button inside the input. */
  renderClearButton?: (props: {
    onPress: () => void;
  }) => React.ReactElement | undefined;

  /** Custom style applied to the outermost wrapper View of the component. */
  containerStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the View wrapping the TextInput and right-side elements (loaders/clear button). */
  inputWrapperStyle?: StyleProp<ViewStyle>;
  /** Custom style applied directly to the native TextInput component. */
  inputStyle?: StyleProp<TextStyle>;
  /** Custom style applied to the wrapper around the clear (✕) button. */
  clearButtonStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the text inside the clear (✕) button. */
  clearButtonTextStyle?: StyleProp<TextStyle>;
  /** Custom style applied to the View container wrapping the FlatList. */
  listContainerStyle?: StyleProp<ViewStyle>;
  /** Custom style applied directly to the `style` prop of the FlatList. */
  listStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the View wrapping the ActivityIndicator when list is loading. */
  listLoaderContainerStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the `contentContainerStyle` prop of the FlatList. */
  listContentContainerStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the TouchableOpacity of the default prediction list item. */
  listItemStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the primary text of the default prediction list item. */
  listItemTextStyle?: StyleProp<TextStyle>;
  /** Custom style applied to the ActivityIndicator displayed inside the TextInput */
  inputLoaderStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the ItemSeparatorComponent of the FlatList. */
  itemSeperatorStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the ActivityIndicator in the list loader. */
  listLoaderStyle?: StyleProp<ViewStyle>;
  /** Custom style applied to the text of the ListEmptyComponent. */
  listEmptyTextStyle?: StyleProp<TextStyle>;
  /** Size of the ActivityIndicator inside the input. Default is 'small'. */
  inputLoaderSize?: number | 'small' | 'large' | undefined;
  /** Color of the ActivityIndicator inside the input. Default is '#888'. */
  inputLoaderColor?: string;
  /** Size of the ActivityIndicator in the list. Default is 'large'. */
  listLoaderSize?: number | 'small' | 'large' | undefined;
  /** Color of the ActivityIndicator in the list. Default is '#888'. */
  listLoaderColor?: string;

  /** Absolute unrestricted access to pass any native TextInput props (e.g. autoFocus, secureTextEntry). */
  textInputProps?: Omit<TextInputProps, 'value' | 'onChangeText'>;
  /** Absolute unrestricted access to pass any native FlatList props (e.g. onEndReached, initialNumToRender). */
  flatListProps?: Omit<
    Partial<FlatListProps<PlacePrediction>>,
    'data' | 'renderItem'
  >;
}

export interface UsePlacesAutocompleteReturn {
  /** The current text value typed into the search. */
  query: string;
  /** State setter function to update the search query text. */
  setQuery: SetQueryFunctionProp;
  /** The array of place predictions returned from Google. */
  results: PlacePrediction[];
  /** Boolean indicating if the autocomplete search API is currently fetching. */
  loading: boolean;
  /** Boolean indicating if the Place Details API is currently fetching. */
  fetchingDetails: boolean;
  /** True instantly when a user types, false when debounce ends. */
  isTyping: boolean;
  /** A string containing the error message if a network request fails, or null. */
  error: string | null;
  /** Function to imperatively trigger a Place Details fetch for a specific placeId. */
  fetchPlaceDetails: (placeId: string) => Promise<PlaceDetails>;
  /** Instantly clears the results array. */
  clearResults: () => void;
  /** Forces the generation of a new Google UUID Session Token for billing. */
  resetSession: () => void;
  /** Returns the current active Google UUID Session Token string. */
  getSessionToken: () => string;
}

export interface GooglePlacesAutocompleteRef {
  /** Get the UUID currently being used to link searches for Google billing. */
  getSessionToken: () => string;
  /** Returns the amount of items currently rendered in the results list. */
  getListLength: () => number;
  /** Focuses the TextInput programmatically. */
  focus: () => void;
  /** Removes focus from the TextInput programmatically. */
  blur: () => void;
  /** Clears the input text and the results list simultaneously. */
  clear: () => void;
  /** Gets the current string value of the TextInput. */
  getText: () => string;
  /** Sets the text string programmatically and triggers a debounced API search. */
  setText: (text: string) => void;
  /** Returns true if the TextInput is currently focused. */
  isFocused: () => boolean;
  /** Clears the prediction results list immediately while keeping the text input intact. */
  clearList: () => void;
}
