# React Native Smart Places 🌍

An enterprise-grade, dependency-free, perfectly typed, and fully customizable React Native component for the **Google Places API**.

[![npm version](https://img.shields.io/npm/v/react-native-smart-gplaces.svg)](https://npmjs.com/package/react-native-smart-gplaces)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## ✨ Why this library?

- **Dual API Support**: Works natively with both Google's Legacy API and the New Places API (v1).
- **Cost Optimized**: Automatically handles UUID Session Tokens, Input Debouncing, Memory Caching, and Request Cancellations (`AbortController`) to drastically reduce your Google Cloud billing.
- **Crash-Proof & Zero Data Loss**: Built with meticulous try-catch blocks. Guaranteed access to `originalData` containing the unadulterated Google API JSON. You will never miss an undocumented field.
- **Expo Web Ready**: Includes `autocompleteProxyUrl` and `detailsProxyUrl` props to easily bypass strict CORS browser restrictions on Web.
- **Bulletproof UI Layout**: Flexbox layouts guarantee the loading spinner and text *never* overlap. Safely delegate touch events inside custom `renderItem` methods.
- **Absolute Customization**: Turn off default styles with `disableDefaultStyles={true}`, provide your own `renderItem`, or gain unrestricted access to `<TextInput />` and `<FlatList />` props natively.

---

## 📦 Installation

```bash
npm install react-native-smart-gplaces
# or
yarn add react-native-smart-gplaces
```

---

## 💻 Quick Start

The easiest way to get an optimized search bar up and running:

```tsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from 'react-native-smart-gplaces';

export default function App() {
  const searchRef = useRef<GooglePlacesAutocompleteRef>(null);

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 50 }}>
      <GooglePlacesAutocomplete
        ref={searchRef}
        apiKey="YOUR_GOOGLE_API_KEY"
        isNewPlaces={true} // Use New API v1
        fetchDetails={true} // Automatically get latitude/longitude on tap
        listMode="floating" // Renders as an absolute dropdown
        loaderPlacement="both" // Show loader in the input AND list
        onPlaceSelected={(details, prediction) => {
          console.log('Coordinates:', details?.latitude, details?.longitude);
          console.log('Raw Google Payload:', details?.originalData);
        }}
      />
      
      <Button title="Clear Search" onPress={() => searchRef.current?.clear()} />
    </View>
  );
}
```

---

## 🎨 Advanced Customization Examples

### 1. Custom Item Render (Safe Touch Delegation)
When using `renderItem`, we pass an `onSelect` callback. Bind this to your own `Pressable` or `TouchableOpacity` to seamlessly trigger the internal detail-fetching loop!

```tsx
<GooglePlacesAutocomplete
  apiKey="YOUR_API_KEY"
  renderItem={({ item, onSelect }) => (
    <TouchableOpacity onPress={onSelect} style={{ padding: 15, flexDirection: 'row' }}>
      <Text>📍 {item.primaryText}</Text>
      <Text style={{ color: 'gray' }}>{item.secondaryText}</Text>
    </TouchableOpacity>
  )}
/>
```

### 2. Expo Web & CORS Setup
Google APIs block web clients (CORS). If you are using Expo Web, create a simple proxy backend and pass the endpoints here:

```tsx
<GooglePlacesAutocomplete
  apiKey="YOUR_API_KEY"
  autocompleteProxyUrl="https://your-proxy.com/places/autocomplete"
  detailsProxyUrl="https://your-proxy.com/places/details"
/>
```

### 3. Complete Style Override (Blank Slate)
Don't want to fight default paddings or border radii? Pass `disableDefaultStyles={true}` to wipe all internal styling and build your component from scratch.

```tsx
<GooglePlacesAutocomplete
  apiKey="YOUR_API_KEY"
  disableDefaultStyles={true} // Instantly strips all default React Native stylesheets
  inputStyle={{ borderBottomWidth: 2, borderColor: 'blue', fontSize: 20 }}
  listContainerStyle={{ backgroundColor: 'black' }}
  listItemTextStyle={{ color: 'white' }}
/>
```

---

## 📚 Ref Methods (`GooglePlacesAutocompleteRef`)

Gain total imperative control over the search bar by attaching a `ref` to the component.

| Method | Return Type | Description |
|---|---|---|
| `getSessionToken()` | `string` | Gets the UUID currently tracking the active billing session. |
| `getListLength()` | `number` | Returns the number of items currently in the prediction list. |
| `focus()` | `void` | Focuses the TextInput programmatically. |
| `blur()` | `void` | Removes focus from the TextInput. |
| `clear()` | `void` | Clears both the input text and the prediction list simultaneously. |
| `getText()` | `string` | Gets the current string value of the input. |
| `setText(text)` | `void` | Sets the text programmatically, shows the list, and triggers a debounced API search. |
| `isFocused()` | `boolean` | Checks if the input is currently focused. |
| `clearList()` | `void` | Clears the prediction list immediately but leaves the text input intact. |

---

## ⚙️ Props API Reference

### 🌐 Google API Configuration
| Prop | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | **Required** | Your Google Maps API Key. |
| `isNewPlaces` | `boolean` | `false` | Use New Places API v1 (`true`) or Legacy API (`false`). |
| `fetchDetails` | `boolean` | `false` | Automatically fetches coordinates and full details when an item is tapped. |
| `detailsFields`| `string \| string[]`| *Auto* | Exact fields to fetch during Place Details to reduce API costs (e.g. `['id', 'location']`). |
| `types` | `string \| string[]`| `undefined`| Restricts results. Maps to `types` (Legacy) or `includedPrimaryTypes` (New API). |
| `debounce` | `number` | `400` | Milliseconds to wait after the user stops typing before calling the API. |
| `minLength` | `number` | `2` | Minimum characters needed to trigger a search request. |
| `enableCache` | `boolean` | `true` | Caches results in-memory to prevent duplicate network calls. |
| `language` | `string` | `undefined`| Language code to return results in (e.g., `'en'`, `'fr'`). |
| `region` | `string` | `undefined`| Region code to bias results towards (e.g., `'us'`, `'gb'`). |
| `locationBias` | `string` | `undefined`| A location bias parameter to prefer results near a certain area. |
| `autocompleteProxyUrl` | `string` | `undefined`| CORS bypass proxy URL for the Autocomplete API. |
| `detailsProxyUrl` | `string` | `undefined`| CORS bypass proxy URL for the Details API. |

### 🛠️ Behavior & Layout
| Prop | Type | Default | Description |
|---|---|---|---|
| `listMode` | `'flat' \| 'floating'` | `'flat'` | `'floating'` renders an absolute dropdown. `'flat'` renders inline taking flex space. |
| `loaderPlacement`| `'input' \| 'list' \| 'both'`| `'input'` | Where to show the loading ActivityIndicator. |
| `showClearButton`| `boolean` | `true` | Displays the clear (✕) button inside the input when text is present. |
| `setQueryOnSelect`| `boolean` | `true` | Auto-updates the text input with the selected place's description. |
| `showLoaderDuringDetailsFetch`| `boolean`| `true` | Shows the input loader visually while `fetchDetails` is running. |
| `renderListInitially`| `boolean` | `false` | Shows the empty list or cached results immediately on component mount. |
| `keepResultsAfterBlur`| `boolean` | `false` | Prediction list remains visible on screen even after the TextInput loses focus. |
| `blurOnSelect`| `boolean` | `true` | TextInput loses focus when a prediction item is selected. |
| `keyboardShouldPersistTaps`| `string` | `'handled'`| Determines when the keyboard should close when tapping on the prediction list. |

### 🎨 Render Overrides
Replace any piece of the UI with your own components.
| Prop | Signature | Description |
|---|---|---|
| `renderItem` | `({ item, onSelect }) => ReactElement`| Overrides the prediction list item. *Call `onSelect` when tapped!* |
| `renderInput` | `({ value, onChangeText, onFocus, onClear }) => ReactElement`| Completely overrides the TextInput. |
| `renderInputLoader` | `() => ReactElement`| Overrides the ActivityIndicator shown *inside* the TextInput. |
| `renderListLoader` | `() => ReactElement`| Overrides the ActivityIndicator shown in the dropdown list area. |
| `renderEmptyComponent`| `() => ReactElement`| Rendered when a search yields 0 results. |
| `renderSeparator` | `() => ReactElement`| The divider line between list items. |
| `renderClearButton` | `({ onPress }) => ReactElement`| Overrides the Clear (✕) button. |

### ⚡ Lifecycle Events
| Prop | Signature | Description |
|---|---|---|
| `onPlaceSelected` | `(details: PlaceDetails \| null, prediction: PlacePrediction) => void` | Triggered when a place is tapped. Includes full details if `fetchDetails={true}`. |
| `onLoaderStart` | `() => void` | Triggered exactly when the search network request begins. |
| `onLoaderEnd` | `() => void` | Triggered when the search network request finishes. |
| `onDataLoaded` | `(data: PlacePrediction[]) => void` | Triggered when autocomplete data is successfully loaded. |
| `onListLengthChange`| `(length: number) => void` | Triggered when the visible results array changes size. |
| `onError` | `(error: string) => void` | Triggered when an error occurs during autocomplete search. |
| `onStartFetchingDetails`| `(placeId: string) => void`| Triggered when starting to fetch full place details. |
| `onErrorFetchingDetails`| `(error: string) => void`| Triggered if an error occurs while fetching full place details. |

### 💅 Styling & Escape Hatches
| Prop | Type | Description |
|---|---|---|
| `disableDefaultStyles`| `boolean \| DisableDefaultStyles` | Pass `true` to wipe ALL default styling, or an object (e.g. `{ input: true }`) to pick and choose. |
| `containerStyle` | `StyleProp<ViewStyle>` | Style for the outermost wrapper View. |
| `inputWrapperStyle`| `StyleProp<ViewStyle>` | Style for the View wrapping the TextInput & right-side elements. |
| `inputStyle` | `StyleProp<TextStyle>` | Style for the native TextInput. |
| `listContainerStyle`| `StyleProp<ViewStyle>` | Style for the View container wrapping the FlatList. |
| `listStyle` | `StyleProp<ViewStyle>` | Style applied to the `style` prop of the FlatList. |
| `listContentContainerStyle`| `StyleProp<ViewStyle>` | Style applied to the `contentContainerStyle` prop of the FlatList. |
| `listLoaderContainerStyle`| `StyleProp<ViewStyle>` | Style applied to the wrapper around the list ActivityIndicator. |
| `listItemStyle` | `StyleProp<ViewStyle>` | Style for the default prediction row item. |
| `listItemTextStyle`| `StyleProp<TextStyle>` | Style for the primary text in the default list item. |
| `clearButtonStyle` | `StyleProp<ViewStyle>` | Style for the wrapper around the clear (✕) button. |
| `clearButtonTextStyle`| `StyleProp<TextStyle>` | Style for the text inside the clear (✕) button. |
| `inputLoaderSize` | `number \| 'small' \| 'large'` | Size of the ActivityIndicator inside the input. Default: `'small'`. |
| `inputLoaderColor` | `string` | Color of the input ActivityIndicator. Default: `'#888'`. |
| `textInputProps` | `TextInputProps` | **Absolute Escape Hatch:** Pass ANY native TextInput prop (`autoFocus`, `maxLength`). |
| `flatListProps` | `FlatListProps` | **Absolute Escape Hatch:** Pass ANY native FlatList prop (`onEndReached`, `showsVerticalScrollIndicator`). |

---

## 🧩 Data Models

### `PlacePrediction` (Returned in `results` array)
```typescript
interface PlacePrediction {
  placeId: string;
  description: string;
  primaryText: string;
  secondaryText: string;
  distanceMeters?: number; // New API specific
  types?: string[];
  originalData: Record<string, unknown>; // 100% of the raw JSON from Google Autocomplete
}
```

### `PlaceDetails` (Returned in `onPlaceSelected` or `fetchPlaceDetails`)
```typescript
interface PlaceDetails {
  placeId: string;
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
  internationalPhoneNumber?: string;
  openingHours?: string[];
  photos?: Record<string, unknown>[];
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  addressComponents?: Record<string, unknown>[];
  types?: string[];
  originalData: Record<string, unknown>; // 100% of the raw JSON from Google Details
}
```

---

## 🪝 Headless Hook (`usePlacesAutocomplete`)

If you are building your own UI entirely from scratch, you can bypass our component and use the core engine:

```tsx
import { usePlacesAutocomplete } from 'react-native-smart-gplaces';

const { 
  query, 
  setQuery, 
  results, 
  loading, 
  fetchingDetails,
  error, 
  fetchPlaceDetails, 
  clearResults,
  resetSession 
} = usePlacesAutocomplete({ apiKey: 'YOUR_API_KEY', isNewPlaces: true });
```

---

## License

MIT

---

## Support

If you find this project helpful, please consider supporting it:  

- ⭐ **Give it a star on GitHub** – Your stars help me keep improving this project!  
[![GitHub stars](https://img.shields.io/github/stars/senthalan2/react-native-smart-gplaces?style=social)](https://github.com/senthalan2/react-native-smart-gplaces/stargazers)  

- ☕ **Buy me a coffee** – Your support keeps me motivated to maintain and enhance this package!  

<a href="https://www.buymeacoffee.com/senthalan2" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-red.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" >
</a>  

Thank you for your support! 🙏
