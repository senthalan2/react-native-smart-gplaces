import { useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GooglePlacesAutocomplete } from 'react-native-smart-gplaces';

export default function App() {
  const [isLoading, setisLoading] = useState(false);
  const [dataLength, setdataLength] = useState(0);
  const [error, seterror] = useState<string | null>(null);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          flex: 1,
          paddingVertical: 25,
          paddingHorizontal: 15,
          backgroundColor: 'white',
        }}
      >
        <GooglePlacesAutocomplete
          apiKey={'GOOGLE_PLACES_API_KEY'}
          isNewPlaces={true}
          fetchDetails={true}
          debounce={400}
          keepResultsAfterBlur={true}
          blurOnSelect={false}
          listMode="flat"
          setQueryOnSelect={false}
          detailsFields={[
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'internationalPhoneNumber',
            'nationalPhoneNumber',
          ]}
          loaderPlacement="both"
          // minLength={4000}
          types={['restaurant', 'fast_food_restaurant', 'food', 'bar']}
          onLoaderStart={() => {
            setisLoading(true);
          }}
          onLoaderEnd={() => {
            setisLoading(false);
          }}
          onListLengthChange={(length) => setdataLength(length)}
          onDataLoaded={(data) => console.log(`Found ${data.length} results!`)}
          onPlaceSelected={(details, prediction) => {
            console.log('Details', details);
            console.log('Predictions', prediction);
          }}
          listContentContainerStyle={
            (isLoading || dataLength <= 0) && { flex: 1 }
          }
          onError={(error) => {
            seterror(error);
          }}
          renderItem={({ item, onSelect }) => {
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                style={{ padding: 10 }}
                onPress={onSelect}
              >
                <Text
                  style={{
                    color: 'black',
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}
                >
                  {item.primaryText}
                </Text>

                <Text
                  style={{ color: 'grey', fontSize: 13, fontWeight: '300' }}
                >
                  {item.secondaryText}
                </Text>
              </TouchableOpacity>
            );
          }}
          disableDefaultStyles={{
            listContent: true,
            list: true,
          }}
          listLoaderContainerStyle={{ flex: 1 }}
          listContainerStyle={{ backgroundColor: '#ffffff', marginTop: 20 }}
          renderListLoader={() => {
            return (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color={'red'} size={'large'} />
                <Text style={{ margin: 10, color: 'black', fontSize: 25 }}>
                  Loading
                </Text>
              </View>
            );
          }}
          renderEmptyComponent={() => {
            return !isLoading ? (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#ffffff30',
                }}
              >
                <Text
                  style={{
                    color: '#000000',
                    fontSize: 20,
                    textAlign: 'center',
                  }}
                >
                  {error ? error : 'No Data Found'}
                </Text>
              </View>
            ) : (
              <></>
            );
          }}
          renderListInitially={true}
          flatListProps={{
            showsVerticalScrollIndicator: false,
            initialNumToRender: 10,
            keyboardDismissMode: 'on-drag',
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
