import React from 'react';
import { View, FlatList, TextInput, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';
import { type PlacesComponentProps, type PlacePrediction } from '../types';

export const GooglePlacesAutocomplete: React.FC<PlacesComponentProps> = (props) => {
  const {
    placeholder = 'Search places...',
    containerStyle, inputStyle, listContainerStyle, 
    listStyle, listContentContainerStyle, flatListProps,
    listItemStyle, listItemTextStyle,
    renderInput, renderItem, renderLoader, renderEmptyComponent, renderSeparator,
    fetchDetails = false, onPlaceSelected, keepResultsAfterBlur = false,
    keyboardShouldPersistTaps = 'handled'
  } = props;

  const { query, setQuery, results, loading, fetchPlaceDetails, clearResults } = usePlacesAutocomplete(props);

  const handleSelect = async (item: PlacePrediction) => {
    setQuery(item.description);
    if (!keepResultsAfterBlur) clearResults();
    
    if (fetchDetails && onPlaceSelected) {
      const details = await fetchPlaceDetails(item.placeId);
      onPlaceSelected(details, item);
    } else if (onPlaceSelected) {
      onPlaceSelected(null, item);
    }
  };

  const DefaultItem = ({ item }: { item: PlacePrediction }) => (
    <TouchableOpacity style={[styles.listItem, listItemStyle]} onPress={() => handleSelect(item)}>
      <Text style={[styles.primaryText, listItemTextStyle]}>{item.primaryText}</Text>
      {item.secondaryText ? <Text style={styles.secondaryText}>{item.secondaryText}</Text> : null}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {renderInput ? renderInput({ value: query, onChangeText: setQuery }) : (
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          clearButtonMode="while-editing"
          placeholderTextColor="#888"
        />
      )}

      {(results.length > 0 || loading) && (
        <View style={[styles.listContainer, listContainerStyle]}>
          {loading && (renderLoader ? renderLoader() : <ActivityIndicator style={styles.loader} />)}
          
          <FlatList
            style={[styles.list, listStyle]}
            contentContainerStyle={[styles.listContent, listContentContainerStyle]}
            data={results}
            keyExtractor={(item) => item.placeId}
            keyboardShouldPersistTaps={keyboardShouldPersistTaps}
            renderItem={({ item }) => renderItem ? renderItem({ item }) : <DefaultItem item={item} />}
            ItemSeparatorComponent={renderSeparator || (() => <View style={styles.separator} />)}
            ListEmptyComponent={!loading ? (renderEmptyComponent ? renderEmptyComponent() : <Text style={styles.empty}>No results found.</Text>) : undefined}
            {...flatListProps}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { zIndex: 1, width: '100%' },
  input: { height: 48, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 16, backgroundColor: '#fff', color: '#333' },
  listContainer: { marginTop: 4, backgroundColor: '#fff', borderRadius: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, maxHeight: 250 },
  list: { width: '100%' },
  listContent: { flexGrow: 1 },
  listItem: { padding: 12 },
  primaryText: { fontSize: 16, fontWeight: '500', color: '#222' },
  secondaryText: { fontSize: 14, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  loader: { padding: 16 },
  empty: { padding: 16, textAlign: 'center', color: '#888' }
});