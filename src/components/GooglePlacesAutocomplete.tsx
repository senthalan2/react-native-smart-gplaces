import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
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
  type GooglePlacesAutocompleteRef,
  type TextInputFocusEvent,
} from '../types';

export const GooglePlacesAutocomplete = forwardRef<
  GooglePlacesAutocompleteRef,
  PlacesComponentProps
>((props, ref) => {
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
    renderInputLoader,
    renderListLoader,
    renderEmptyComponent,
    renderSeparator,
    renderClearButton,

    fetchDetails = false,
    onPlaceSelected,
    keepResultsAfterBlur = false,
    keyboardShouldPersistTaps = 'handled',
    minLength = 2,
    renderListInitially = false,
    listMode = 'flat',
    loaderPlacement = 'input',

    showClearButton = true,
    setQueryOnSelect = true,
    blurOnSelect = true, // 🔥 Defaults to true for UX
    showLoaderDuringDetailsFetch = true,

    inputLoaderSize = 'small',
    inputLoaderColor = '#888',
    disableDefaultStyles = false,
    textInputProps,
    flatListProps,
  } = props;

  const {
    query,
    setQuery,
    results,
    loading,
    fetchingDetails,
    fetchPlaceDetails,
    clearResults,
    getSessionToken,
  } = usePlacesAutocomplete(props);
  const [listVisible, setListVisible] = useState(!!renderListInitially);

  const textInputRef = useRef<React.ElementRef<typeof TextInput>>(null);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (blurTimeout.current) clearTimeout(blurTimeout.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    getSessionToken: () => getSessionToken(),
    getListLength: () => results.length,
    focus: () => textInputRef.current?.focus(),
    blur: () => textInputRef.current?.blur(),
    clear: () => {
      setQuery('');
      clearResults();
      setListVisible(false);
      textInputRef.current?.clear();
    },
    getText: () => query,
    setText: (text: string) => {
      setQuery(text);
      setListVisible(true);
    },
    isFocused: () => textInputRef.current?.isFocused() ?? false,
    clearList: () => {
      clearResults();
      setListVisible(false);
    },
  }));

  const isStyleDisabled = (key: keyof DisableDefaultStyles) => {
    if (typeof disableDefaultStyles === 'boolean') return disableDefaultStyles;
    return !!disableDefaultStyles[key];
  };

  const handleTextChange = (text: string) => {
    setQuery(text);
    setListVisible(true);
  };

  const handleFocus = (e: TextInputFocusEvent) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setListVisible(true);
    if (textInputProps?.onFocus) textInputProps.onFocus(e);
  };

  const handleBlur = (e: TextInputFocusEvent) => {
    if (!keepResultsAfterBlur) {
      blurTimeout.current = setTimeout(() => {
        setListVisible(false);
        clearResults();
      }, 150);
    }
    if (textInputProps?.onBlur) textInputProps.onBlur(e);
  };

  const handleClear = () => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setQuery('');
    clearResults();
    if (!renderListInitially) {
      setListVisible(false);
    }
    textInputRef.current?.clear();
  };

  const handleSelect = async (item: PlacePrediction) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);

    if (setQueryOnSelect) {
      setQuery(item.description);
    }

    // 🔥 FIX: We now explicitly respect keepResultsAfterBlur upon Selection!
    if (!keepResultsAfterBlur && blurOnSelect) {
      setListVisible(false);
      clearResults();
    }

    // 🔥 FIX: We blur the input based on the new blurOnSelect prop
    if (blurOnSelect) {
      textInputRef.current?.blur();
    }

    if (fetchDetails && onPlaceSelected) {
      try {
        const details = await fetchPlaceDetails(item.placeId);
        onPlaceSelected(details, item);
      } catch (error) {
        onPlaceSelected(null, item);
      }
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

  const isSearchLoadingInput =
    loading && (loaderPlacement === 'input' || loaderPlacement === 'both');
  const isDetailsLoadingInput = fetchingDetails && showLoaderDuringDetailsFetch;

  const showInputLoaderUI = isSearchLoadingInput || isDetailsLoadingInput;
  const showListLoaderUI =
    loading && (loaderPlacement === 'list' || loaderPlacement === 'both');

  const shouldShowClearButton =
    showClearButton && !showInputLoaderUI && query.length > 0;

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
            onBlur: handleBlur,
            onClear: handleClear,
          })
        ) : (
          <TextInput
            ref={textInputRef}
            placeholder={placeholder}
            placeholderTextColor="#888"
            {...textInputProps}
            style={[!isStyleDisabled('input') && styles.input, inputStyle]}
            value={query}
            onChangeText={handleTextChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
        )}

        {showInputLoaderUI ? (
          renderInputLoader ? (
            renderInputLoader()
          ) : (
            <ActivityIndicator
              style={[!isStyleDisabled('loaderInput') && styles.loaderInput]}
              size={inputLoaderSize}
              color={inputLoaderColor}
            />
          )
        ) : shouldShowClearButton ? (
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
          {showListLoaderUI ? (
            <View
              style={[
                !isStyleDisabled('listLoaderContainer') &&
                  styles.listLoaderContainer,
                listLoaderContainerStyle,
              ]}
            >
              {renderListLoader ? (
                renderListLoader()
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
                renderItem ? (
                  renderItem({ item, onSelect: () => handleSelect(item) })
                ) : (
                  <DefaultItem item={item} />
                )
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
});

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
  listContainerBase: { marginTop: 4, backgroundColor: '#fff', borderRadius: 8 },
  listContainerFloating: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 250,
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  listContainerFlat: { position: 'relative', flex: 1 },
  listLoaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  list: { width: '100%' },
  listContent: { flexGrow: 1 },
  listItem: { padding: 12 },
  primaryText: { fontSize: 16, fontWeight: '500', color: '#222' },
  secondaryText: { fontSize: 14, color: '#666', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#eee' },
  empty: { padding: 16, textAlign: 'center', color: '#888' },
});
