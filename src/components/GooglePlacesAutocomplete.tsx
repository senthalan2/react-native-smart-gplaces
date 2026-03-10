import React, { useState } from 'react';
import { View, FlatList, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';
import { type PlacesComponentProps, type PlacePrediction } from '../types';

export const GooglePlacesAutocomplete: React.FC<PlacesComponentProps> = (props) => {
  const {
    placeholder = 'Search places...',
    containerStyle, inputWrapperStyle, inputStyle, 
    listContainerStyle, listStyle, listContentContainerStyle, 
    listItemStyle, listItemTextStyle,
    renderInput, renderItem, renderLoader, renderEmptyComponent, renderSeparator,
    fetchDetails = false, onPlaceSelected, keepResultsAfterBlur = false,
    keyboardShouldPersistTaps = 'handled',
    minLength = 2,
    
    renderListInitially = false,
    listMode = 'floating', // 🔥 Defaults to floating dropdown for backwards compatibility
    disableDefaultStyles = {},
    textInputProps,
    flatListProps
  } = props;

  const { query, setQuery, results, loading, fetchPlaceDetails, clearResults } = usePlacesAutocomplete(props);
  const[listVisible, setListVisible] = useState(!!renderListInitially);

  const handleTextChange = (text: string) => {
    setQuery(text);
    setListVisible(true);
  };

  const handleFocus = (e: any) => {
    setListVisible(true);
    if (textInputProps?.onFocus) textInputProps.onFocus(e);
  };

  const handleSelect = async (item: PlacePrediction) => {
    setQuery(item.description);
    setListVisible(false);

    if (!keepResultsAfterBlur) clearResults();
    
    if (fetchDetails && onPlaceSelected) {
      const details = await fetchPlaceDetails(item.placeId);
      onPlaceSelected(details, item);
    } else if (onPlaceSelected) {
      onPlaceSelected(null, item);
    }
  };

  const DefaultItem = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity 
      style={[!disableDefaultStyles.listItem && styles.listItem, listItemStyle]} 
      onPress={() => handleSelect(item)}
    >
      <Text style={[!disableDefaultStyles.primaryText && styles.primaryText, listItemTextStyle]}>
        {item.primaryText}
      </Text>
      {item.secondaryText ? (
        <Text style={[!disableDefaultStyles.secondaryText && styles.secondaryText]}>
          {item.secondaryText}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const showList = listVisible && (query.length >= minLength || renderListInitially);

  return (
    <View style={[
      !disableDefaultStyles.container && styles.container, 
      !disableDefaultStyles.container && listMode === 'flat' && styles.containerFlat, // 🔥 Flex wrapper for fullscreen
      containerStyle
    ]}>
      
      <View style={[!disableDefaultStyles.inputWrapper && styles.inputWrapper, inputWrapperStyle]}>
        {renderInput ? renderInput({ value: query, onChangeText: handleTextChange, onFocus: handleFocus }) : (
          <TextInput
            placeholder={placeholder}
            clearButtonMode="while-editing"
            placeholderTextColor="#888"
            {...textInputProps} 
            style={[!disableDefaultStyles.input && styles.input, inputStyle]} // Right padding included to prevent overlap
            value={query}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
          />
        )}

        {/* The inline loader never overlaps due to right: 12 and input paddingRight: 40 */}
        {loading && !renderLoader && (
          <ActivityIndicator 
            style={[!disableDefaultStyles.loader && styles.loader]} 
            size="small" 
            color="#888" 
          />
        )}
      </View>

      {showList && (
        <View style={[
          !disableDefaultStyles.listContainer && styles.listContainerBase,
          !disableDefaultStyles.listContainer && listMode === 'floating' && styles.listContainerFloating, // 🔥 Dropdown mode
          !disableDefaultStyles.listContainer && listMode === 'flat' && styles.listContainerFlat,         // 🔥 Fullscreen flow mode
          listContainerStyle
        ]}>
          
          {loading && renderLoader && renderLoader()}
          
          {!loading &&<FlatList
            style={[!disableDefaultStyles.list && styles.list, listStyle]}
            contentContainerStyle={[!disableDefaultStyles.listContent && styles.listContent, listContentContainerStyle]}
            data={results}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            renderItem={({ item }) => renderItem ? renderItem({ item }) : <DefaultItem item={item} />}
            ItemSeparatorComponent={renderSeparator || (() => (
              <View style={[!disableDefaultStyles.separator && styles.separator]} />
            ))}
            ListEmptyComponent={
              !loading ? (
                renderEmptyComponent ? renderEmptyComponent() : 
                <Text style={[!disableDefaultStyles.empty && styles.empty]}>No results found.</Text>
              ) : undefined
            }
            {...flatListProps}
          />}
        </View>
      )}
    </View>
  );
};

// 💅 Master Layout Styles
const styles = StyleSheet.create({
  // Base wrapper
  container: { zIndex: 1, width: '100%' }, 
  containerFlat: { flex: 1 }, // If flat, it allows the component to stretch taking available space
  
  inputWrapper: { width: '100%', position: 'relative', justifyContent: 'center' },
  
  // paddingRight: 40 guarantees text never overlaps the ActivityIndicator
  input: { height: 48, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 16, paddingRight: 40, backgroundColor: '#fff', color: '#333' },
  
  // Placed neatly inside the input container
  loader: { position: 'absolute', right: 12 },
  
  // Base visual styles for the list container
  listContainerBase: { marginTop: 4, backgroundColor: '#fff', borderRadius: 8, elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  
  // 🔥 Mode 1: Floating Dropdown (Form screens)
  listContainerFloating: { position: 'absolute', top: '100%', left: 0, right: 0, maxHeight: 250, zIndex: 10 },
  
  // 🔥 Mode 2: Flat Flow (Fullscreen search screens)
  listContainerFlat: { position: 'relative', flex: 1, maxHeight: 'none' },
  
  list: { width: '100%' },
  listContent: { flexGrow: 1 },
  listItem: { padding: 12 },
  primaryText: { fontSize: 16, fontWeight: '500', color: '#222' },
  secondaryText: { fontSize: 14, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { padding: 16, textAlign: 'center', color: '#888' }
});