
# React Native Smart Places 🌍

A highly optimized, dependency-free, and infinitely customizable React Native library for the **Google Places API**.

Built for enterprise applications, this package supports both the **Legacy** and **New** Google Places APIs. It is fully type-safe, guarantees absolutely **zero data loss** (by passing 100% of raw Google API responses), and features extreme UI customization including unrestricted `FlatList` overrides.

[![npm version](https://img.shields.io/npm/v/react-native-smart-gplaces.svg)](https://npmjs.com/package/react-native-smart-gplaces)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Features

- 🚀 **Dual API Support**: Seamlessly toggle between Google's Legacy API and the modern New Places API via a single boolean flag (`isNewPlaces`).
- 💰 **Cost Optimized**: Automatically handles Input Debouncing, UUID Session Tokens, API Field Masking, and Request Cancellation (`AbortController`) to drastically reduce your Google Cloud billing.
- 🗃️ **Zero Data Loss Guarantee**: Standardized fields (`latitude`, `longitude`, `address`) are mapped for convenience, but the `originalData` object contains the exact, unadulterated JSON payload from Google. You will never miss an undocumented or newly released field.
- 🎨 **Absolute UI Domination**: Don't like the default UI? Override `renderInput`, `renderItem`, or pass native React Native FlatList props directly using the `flatListProps` escape hatch.
- 🧠 **Headless Architecture**: Includes a powerful `usePlacesAutocomplete` hook if you prefer to build your own UI entirely from scratch.
- ⚡ **Zero Dependencies**: Built strictly with React and React Native primitives.

---

## 📦 Installation

```bash
npm install react-native-smart-gplaces
# or
yarn add react-native-smart-gplaces
```

---

## 💻 Quick Start & Examples

### 1. Basic Usage (Built-in UI)
The easiest way to get an optimized search bar up and running.

```tsx
import React from 'react';
import { View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-smart-gplaces';

export default function App() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <GooglePlacesAutocomplete
        apiKey="YOUR_GOOGLE_API_KEY"
        isNewPlaces={true} // Uses the modern Google Places API v1
        fetchDetails={true}
        placeholder="Search for a restaurant..."
        onPlaceSelected={(details, prediction) => {
          console.log('Selected Place Name:', details?.name);
          console.log('Coordinates:', details?.latitude, details?.longitude);
        }}
      />
    </View>
  );
}
```

### 2. Advanced Customization & Enterprise Setup
Use dynamic field masking to save money, listen to lifecycle events, and totally dominate the `FlatList` layout.

```tsx
import React from 'react';
import { View, Text } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-smart-gplaces';

export default function AdvancedApp() {
  return (
    <GooglePlacesAutocomplete
      apiKey="YOUR_GOOGLE_API_KEY"
      isNewPlaces={true}
      fetchDetails={true}
      debounce={400}
      
      // 💰 Save money: Request only the data you need!
      detailsFields={['id', 'displayName', 'location', 'servesVegetarianFood', 'priceLevel']}
      
      // Automatically maps to `includedPrimaryTypes` (New API) or `types` (Legacy API)
      types={['restaurant', 'cafe']} 

      // ⏱️ Lifecycle Hooks
      onLoaderStart={() => console.log('Fetching from Google...')}
      onDataLoaded={(data) => console.log(`Found ${data.length} results!`)}
      
      onPlaceSelected={(details, prediction) => {
        // Access mapped fields easily
        console.log('Lat/Lng:', details?.latitude, details?.longitude);
        
        // 🗃️ GUARANTEE: Never lose undocumented Google Data
        console.log('Raw Data:', details?.originalData.servesVegetarianFood); 
      }}

      // 🎨 Complete Layout & FlatList Control
      listStyle={{ backgroundColor: '#1E1E1E' }}
      listItemTextStyle={{ color: 'white' }}
      
      // 🔥 The Ultimate Escape Hatch: Pass ANY native FlatList prop!
      flatListProps={{
        showsVerticalScrollIndicator: false,
        initialNumToRender: 10,
        keyboardDismissMode: 'on-drag',
        ListHeaderComponent: <Text style={{ color: 'gray' }}>Results</Text>,
      }}
    />
  );
}
```

### 3. Headless Hook (Build Your Own UI)
For complete architectural freedom, bypass our UI components entirely and use the core engine.

```tsx
import React from 'react';
import { TextInput, FlatList, TouchableOpacity, Text, View } from 'react-native';
import { usePlacesAutocomplete } from 'react-native-smart-gplaces';

export default function HeadlessApp() {
  const { query, setQuery, results, loading, fetchPlaceDetails } = usePlacesAutocomplete({
    apiKey: 'YOUR_GOOGLE_API_KEY',
    isNewPlaces: true,
    debounce: 300,
    detailsFields:['id', 'location']
  });

  const handlePress = async (placeId: string) => {
    const details = await fetchPlaceDetails(placeId);
    console.log('Details fetched:', details.latitude, details.longitude);
  };

  return (
    <View style={{ flex: 1, paddingTop: 50 }}>
      <TextInput 
        value={query} 
        onChangeText={setQuery} 
        placeholder="Where to?" 
        style={{ borderWidth: 1, padding: 10 }}
      />
      {loading && <Text>Loading...</Text>}
      <FlatList
        data={results}
        keyExtractor={(item) => item.placeId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item.placeId)} style={{ padding: 15 }}>
            <Text>{item.primaryText}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

---

## 📚 API Reference

### Core Configuration (`PlacesHookOptions`)
These props apply to both the `<GooglePlacesAutocomplete />` component and the `usePlacesAutocomplete` hook.

| Prop | Type | Default | Description |
|---|---|---|---|
| `apiKey` | `string` | **Required** | Your Google Maps API Key. |
| `isNewPlaces` | `boolean` | `false` | If `true`, uses the New Places API (v1). If `false`, uses the Legacy API. |
| `debounce` | `number` | `400` | Milliseconds to wait after the user stops typing before making a network request. |
| `minLength` | `number` | `2` | Minimum number of characters required before triggering a search. |
| `enableCache` | `boolean` | `true` | Caches search queries in-memory to prevent duplicate network calls. |
| `types` | `string \| string[]` | `undefined` | Restricts results. Maps to `types` (Legacy) or `includedPrimaryTypes` (New API). |
| `detailsFields` | `string \| string[]` | *Auto-mapped* | Define exactly which fields to fetch to reduce API cost. (e.g. `['id', 'location']`). |
| `language` | `string` | `undefined` | Language code (e.g., `'en'`, `'fr'`). |
| `region` | `string` | `undefined` | Region code (e.g., `'us'`, `'gb'`). |
| `locationBias` | `string` | `undefined` | Bias results to a specific location area. |

### Lifecycle Events
| Prop | Type | Description |
|---|---|---|
| `onLoaderStart` | `() => void` | Triggered exactly when the network request to Google begins. |
| `onLoaderEnd` | `() => void` | Triggered when the network request finishes (success or fail). |
| `onDataLoaded` | `(data: PlacePrediction[]) => void` | Triggered with the raw array of predictions once fetched. |
| `onListLengthChange`| `(length: number) => void` | Triggered whenever the number of visible results changes. |
| `onError` | `(error: string) => void` | Triggered if the API throws an error (e.g., invalid API key, quota exceeded). |

### UI Component Props (`<GooglePlacesAutocomplete />`)
| Prop | Type | Description |
|---|---|---|
| `placeholder` | `string` | Placeholder text for the default input. |
| `fetchDetails` | `boolean` | If `true`, automatically calls `fetchPlaceDetails` when an item is tapped. |
| `onPlaceSelected`| `(details: PlaceDetails \| null, prediction: PlacePrediction) => void` | Callback fired when a user selects an item from the list. |
| `keepResultsAfterBlur`| `boolean` | If `true`, the result list will not clear automatically after a selection. |
| `flatListProps` | `FlatListProps` | **Absolute Escape Hatch**: Pass *any* native React Native FlatList prop (`onEndReached`, `showsVerticalScrollIndicator`, etc.). |
| **Style Overrides** | | |
| `containerStyle` | `ViewStyle` | Style for the outermost wrapping View. |
| `inputStyle` | `TextStyle` | Style for the default `TextInput`. |
| `listContainerStyle`| `ViewStyle` | Style for the wrapper around the FlatList. |
| `listStyle` | `ViewStyle` | Style directly applied to the `style` prop of the `FlatList`. |
| `listContentContainerStyle`| `ViewStyle`| Style directly applied to the `contentContainerStyle` prop of the `FlatList`. |
| `listItemStyle` | `ViewStyle` | Style for the default row items. |
| `listItemTextStyle`| `TextStyle` | Style for the primary text inside default row items. |
| **Render Overrides**| | |
| `renderInput` | `(props) => ReactNode` | Completely replace the standard `TextInput`. |
| `renderItem` | `({item}) => ReactNode` | Completely replace the look of the list rows. |
| `renderLoader` | `() => ReactNode` | Completely replace the default `ActivityIndicator`. |
| `renderEmptyComponent`| `() => ReactNode`| Rendered when a search yields 0 results. |
| `renderSeparator` | `() => ReactNode` | Item separator line between rows. |

---

## 🪝 Hook Reference (`usePlacesAutocomplete`)

If you are using the headless approach, the hook returns the following:

| Return Value | Type | Description |
|---|---|---|
| `query` | `string` | The current text in the search input. |
| `setQuery` | `(text: string) => void` | Call this to update the input text. Triggers debounced search. |
| `results` | `PlacePrediction[]` | The array of autocomplete predictions. |
| `loading` | `boolean` | `true` while fetching predictions or place details. |
| `error` | `string \| null` | Contains error messages if a request fails. |
| `fetchPlaceDetails`| `(placeId: string) => Promise<PlaceDetails>` | Call this passing a `placeId` to get full coordinates and data. **Note:** Calling this automatically resets the billing session token! |
| `clearResults` | `() => void` | Clears the `results` array immediately. |
| `resetSession` | `() => void` | Manually generate a new UUID for Google billing sessions. |

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
  originalData: Record<string, any>; // 100% of the raw JSON from Google
}
```

### `PlaceDetails` (Returned by `fetchPlaceDetails`)
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
  photos?: any[];
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  addressComponents?: any[];
  types?: string[];
  originalData: Record<string, any>; // 100% of the raw JSON from Google
}
```

---

## 💰 How this package saves you money (Google API Billing)

Google Places API pricing can skyrocket if not managed correctly. This library handles enterprise-grade optimizations internally:

1. **Session Tokens**: As you type, requests are grouped under a single UUID. You are billed for *one* Autocomplete session rather than per-keystroke. Once `fetchPlaceDetails` is called, the session is completed and the UUID is automatically reset.
2. **Debouncing**: Pauses network calls until the user stops typing for `400ms` (customizable).
3. **Caching**: If a user types "New York", deletes the "k", and re-types the "k", the package serves the results from local memory instead of pinging Google again.
4. **Abort Controllers**: If network latency is high and a user types fast, older outgoing requests are cancelled (`AbortController`), ensuring no overlapping data races or wasted bandwidth.
5. **Field Masking (`detailsFields`)**: Passing specific fields tells Google to *only* return and bill you for that specific data (e.g. requesting coordinates is cheaper than requesting photos and reviews).

---

## License

MIT License
