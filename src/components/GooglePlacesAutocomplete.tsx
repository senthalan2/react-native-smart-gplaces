import React, { useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';
import {
  type PlacesComponentProps,
  type PlacePrediction,
  type DisableDefaultStyles,
} from '../types';

export const GooglePlacesAutocomplete: React.FC<PlacesComponentProps> = (
  props
) => {
  const {
    placeholder = 'Search places...',
    containerStyle,
    inputWrapperStyle,
    inputStyle,
    clearButtonStyle,
    clearButtonTextStyle,
    listContainerStyle,
    listStyle,
    listContentContainerStyle,
    listLoaderContainerStyle,
    listItemStyle,
    listItemTextStyle,
    renderInput,
    renderItem,
    renderLoader,
    renderEmptyComponent,
    renderSeparator,
    renderClearButton,
    fetchDetails = false,
    onPlaceSelected,
    keepResultsAfterBlur = false,
    keyboardShouldPersistTaps = 'handled',
    minLength = 2,

    renderListInitially = false,
    listMode = 'floating',

    loaderPlacement = 'input',
    inputLoaderSize = 'small',
    inputLoaderColor = '#888',
    disableDefaultStyles = false, // Defaults to false
    textInputProps,
    flatListProps,
  } = props;

  const { query, setQuery, results, loading, fetchPlaceDetails, clearResults } =
    usePlacesAutocomplete(props);
  const [listVisible, setListVisible] = useState(!!renderListInitially);

  // 🔥 NEW HELPER: Instantly checks if a specific style (or all styles) should be disabled
  const isStyleDisabled = (key: keyof DisableDefaultStyles) => {
    if (typeof disableDefaultStyles === 'boolean') return disableDefaultStyles;
    return !!disableDefaultStyles[key];
  };

  const handleTextChange = (text: string) => {
    setQuery(text);
    setListVisible(true);
  };

  const handleFocus = (e: any) => {
    setListVisible(true);
    if (textInputProps?.onFocus) textInputProps.onFocus(e);
  };

  const handleClear = () => {
    setQuery('');
    clearResults();
    if (!renderListInitially) {
      setListVisible(false);
    }
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
      style={[!isStyleDisabled('listItem') && styles.listItem, listItemStyle]}
      onPress={() => handleSelect(item)}
    >
      <Text
        style={[
          !isStyleDisabled('primaryText') && styles.primaryText,
          listItemTextStyle,
        ]}
      >
        {item.primaryText}
      </Text>
      {item.secondaryText ? (
        <Text
          style={[!isStyleDisabled('secondaryText') && styles.secondaryText]}
        >
          {item.secondaryText}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const showList =
    listVisible && (query.length >= minLength || renderListInitially);

  // Layout Logic specific to the new `both` loader type
  const showInputLoader =
    loading && (loaderPlacement === 'input' || loaderPlacement === 'both');
  const showListLoader =
    loading && (loaderPlacement === 'list' || loaderPlacement === 'both');

  // Only show the clear button if we aren't currently taking up the space with the input loader
  const showClearButton = !showInputLoader && query.length > 0;

  return (
    <View
      style={[
        !isStyleDisabled('container') && styles.container,
        !isStyleDisabled('container') &&
          listMode === 'flat' &&
          styles.containerFlat,
        containerStyle,
      ]}
    >
      <View
        style={[
          !isStyleDisabled('inputWrapper') && styles.inputWrapper,
          inputWrapperStyle,
        ]}
      >
        {renderInput ? (
          renderInput({
            value: query,
            onChangeText: handleTextChange,
            onFocus: handleFocus,
            onClear: handleClear,
          })
        ) : (
          <TextInput
            placeholder={placeholder}
            placeholderTextColor="#888"
            {...textInputProps}
            style={[!isStyleDisabled('input') && styles.input, inputStyle]}
            value={query}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
          />
        )}

        {/* Right-Side Input Elements */}
        {showInputLoader ? (
          renderLoader ? (
            renderLoader()
          ) : (
            <ActivityIndicator
              style={[!isStyleDisabled('loaderInput') && styles.loaderInput]}
              size={inputLoaderSize ? inputLoaderSize : 'small'}
              color={inputLoaderColor ? inputLoaderColor : '#888'}
            />
          )
        ) : showClearButton ? (
          renderClearButton ? (
            renderClearButton({ onPress: handleClear })
          ) : (
            <TouchableOpacity
              onPress={handleClear}
              style={[
                !isStyleDisabled('clearButton') && styles.clearButton,
                clearButtonStyle,
              ]}
            >
              <Text
                style={[
                  !isStyleDisabled('clearButtonText') && styles.clearButtonText,
                  clearButtonTextStyle,
                ]}
              >
                ✕
              </Text>
            </TouchableOpacity>
          )
        ) : null}
      </View>

      {showList && (
        <View
          style={[
            !isStyleDisabled('listContainer') && styles.listContainerBase,
            !isStyleDisabled('listContainer') &&
              listMode === 'floating' &&
              styles.listContainerFloating,
            !isStyleDisabled('listContainer') &&
              listMode === 'flat' &&
              styles.listContainerFlat,
            listContainerStyle,
          ]}
        >
          {showListLoader ? (
            <View
              style={[
                !isStyleDisabled('listLoaderContainer') &&
                  styles.listLoaderContainer,
                listLoaderContainerStyle,
              ]}
            >
              {renderLoader ? (
                renderLoader()
              ) : (
                <ActivityIndicator size="large" color="#888" />
              )}
            </View>
          ) : (
            <FlatList
              style={[!isStyleDisabled('list') && styles.list, listStyle]}
              contentContainerStyle={[
                !isStyleDisabled('listContent') && styles.listContent,
                listContentContainerStyle,
              ]}
              data={results}
              keyExtractor={(item) => item.placeId}
              keyboardShouldPersistTaps={keyboardShouldPersistTaps}
              renderItem={({ item }) =>
                renderItem ? renderItem({ item }) : <DefaultItem item={item} />
              }
              ItemSeparatorComponent={
                renderSeparator ||
                (() => (
                  <View
                    style={[!isStyleDisabled('separator') && styles.separator]}
                  />
                ))
              }
              ListEmptyComponent={
                !loading ? (
                  renderEmptyComponent ? (
                    renderEmptyComponent()
                  ) : (
                    <Text style={[!isStyleDisabled('empty') && styles.empty]}>
                      No results found.
                    </Text>
                  )
                ) : undefined
              }
              {...flatListProps}
            />
          )}
        </View>
      )}
    </View>
  );
};

// 💅 Master Layout Styles
const styles = StyleSheet.create({
  container: { zIndex: 1, width: '100%' },
  containerFlat: { flex: 1 },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },

  input: {
    flex: 1,
    height: 48,
    padding: 0,
    backgroundColor: 'transparent',
    color: '#333',
    fontSize: 16,
  },

  loaderInput: { paddingLeft: 8 },
  clearButton: { paddingLeft: 8, paddingRight: 4, paddingVertical: 8 },
  clearButtonText: { color: '#888', fontSize: 18, fontWeight: '600' },

  listContainerBase: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  listContainerFloating: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 250,
    zIndex: 10,
  },
  listContainerFlat: { position: 'relative', flex: 1 },

  listLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  list: { width: '100%' },
  listContent: { flexGrow: 1 },
  listItem: { padding: 12 },
  primaryText: { fontSize: 16, fontWeight: '500', color: '#222' },
  secondaryText: { fontSize: 14, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { padding: 16, textAlign: 'center', color: '#888' },
});
