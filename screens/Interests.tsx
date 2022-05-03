import React, { Component } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, IconProps } from 'react-native-elements';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#5554be',
    textAlign: 'center',
    flex: 1,
    padding: 10,
  },
  button: {
    position: 'absolute',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 150,
    paddingBottom: 50,
  },
  space: {
    width: 20,
    marginVertical: 30,
  },
  messageButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 75,
    backgroundColor: '#5554be',
  },
  dateTime: {
    position: 'absolute',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 580,
  },
  dateTime2: {
    position: 'absolute',
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 550,
  },
  dateTimeRenderElement: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
});

class Interests extends Component {
  state = {
    userInterests: [],
    date: new Date(),
    arrivalDate: null,
    departureDate: null,
    renderDateTimeSwitch: true,
    isDatePickerVisible: false,
  };

  // Displays the DateTime picker
  showDatePicker = () => {
    this.setState({
      isDatePickerVisible: true,
    });
  };

  // Hides the DateTime picker
  hideDatePicker = () => {
    this.setState({
      isDatePickerVisible: false,
    });
  };

  // Sets the state variable arrivalDate equal to users selected
  // arrival date
  handleArrivalDateConfirm = (date: Date) => {
    this.setState({
      arrivalDate: date,
    });
    this.hideDatePicker();
  };

  // Sets the state variable departureDate equal to users selected
  // departure date
  handleDateConfirm = (date: Date) => {
    if (this.state.arrivalDate == null) {
      this.setState({
        arrivalDate: date,
      });
    } else {
      this.setState({
        departureDate: date,
      });
    }

    this.hideDatePicker();
  };

// Conditional rendering of the DateTime picker text and buttons
renderDateTimeElement() {
  if (this.state.arrivalDate == null) {
    return (
      <>
        <SafeAreaView style={{ paddingTop: 300 }}>
          <Text 
            style={{
              fontSize: 25,
              color: 'white',
              textAlign: 'center',
            }}>
              Select Arrivial Date and Time
            </Text>
        </SafeAreaView>
        <SafeAreaView 
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            paddingTop: 25,
          }}>
          <Button 
            onPress={this.showDatePicker}
            title="Select Arrival Date and Time"
          />
          </SafeAreaView>
      </>
    );
  } else if (
    this.state.arrivalDate != null &&
    this.state.departureDate == null
  ) {
    return (
      <>
        <SafeAreaView style={{ paddingTop: 300 }}>
          <Text
            style={{
              fontSize: 25,
              color: 'white',
              textAlign: 'center',
            }}>
            Select Departure Date and Time
          </Text>
        </SafeAreaView>
        <SafeAreaView
          style={{ flexDirection: 'row', flexWrap: 'wrap', paddingTop: 25 }}>
            <Button
              onPress={this.showDatePicker}
              title="Select Departure Date and Time"
            />
          </SafeAreaView>
      </>
    );
  } else {
      return (
        <>
          <SafeAreaView style={{ paddingTop: 300 }}>
            <Text
              style={{
                fontSize: 25,
                color: 'white',
                textAlign: 'center',
              }}>
                Arrival Date:
            </Text>
          </SafeAreaView>
          <SafeAreaView>
            <Text
              style={{
                fontSize: 25,
                color: 'white',
                textAlign: 'center',
              }}>
                {this.state.arrivalDate.toLocaleDateString() +
                ' ' +
                this.state.arrivalDate.toLocaleTimeString()}
              </Text>
          </SafeAreaView>
          <SafeAreaView style={{ paddingTop: 20 }}>
            <Text
              style={{
                fontSize: 25,
                color: 'white',
                textAlign: 'center',
              }}>
                Departure Date:
              </Text>
          </SafeAreaView>
          <SafeAreaView>
            <Text
              style={{
                fontSize: 25,
                color: 'white',
                textAlign: 'center',
              }}>
                {this.state.departureDate.toLocaleDateString() +
                ' ' +
                this.state.departureDate.toLocaleTimeString()}
              </Text>
          </SafeAreaView>
        </>
      );
  }
  return null;
}

render() {
  const { navigation } = this.props;
  const { date, mode, isDatePickerVisible } = this.state;

  return (
    <>
      <SafeAreaProvider style={styles.container}>
        {/* Date & Time Picker */}
        <DateTimePickerModal
          minimumDate={date}
          isVisible={isDatePickerVisible}
          value={date}
          mode="datetime"
          is24Hour={false}
          display="default"
          onConfirm={this.handleDateConfirm}
          onCancel={this.hideDatePicker}
        />

        <SafeAreaView style={styles.dateTimeRenderElement}>
          {this.renderDateTimeElement()}
        </SafeAreaView>

        {/* Interest Buttons */}
        <SafeAreaView style={styles.button}>
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Restaurant')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Restaurant'],
              })
            }
            title="Dining Out"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Aquarium')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Aquarium'],
              })
            }
            title="Aquarium"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Museum')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Museum'],
              })
            }
            title="Museum"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Tourist Attraction')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Tourist Attraction'],
              })
            }
            title="Tourist Attraction"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Art Gallery')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Art Gallery'],
              })
            }
            title="Art Gallery"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Gym')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Gym'],
              })
            }
            title="Fitness"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Shopping')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Shopping'],
              })
            }
            title="Shopping"
          />
          <SafeAreaView style={styles.space}></SafeAreaView>
          <Button
            disabled={this.state.userInterests.includes('Bar')}
            onPress={() =>
              this.setState({
                userInterests: [...this.state.userInterests, 'Bar'],
              })
            }
            title="Bar"
          />
        </SafeAreaView>
        <SafeAreaView>
          <Text style={{ fontSize: 25, color: 'white', paddingTop: 80 }}>
            Select Interests
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
      
      {/* Confirm Button */}
      <SafeAreaView style={{ backgroundColor: '#5554be', padding: 10 }}>
        <Button
          disabled={this.state.departureDate == null}
          onPress={() =>
            this.props.navigation.navigate('Itinerary', {
              userInterests: this.state.userInterests,
              arrivalDate: this.state.arrivalDate.toISOString(),
              departureDate: this.state.departureDate.toISOString(),
            })
          }
          title="Confirm"
        />
      </SafeAreaView>
    </>
  );
}
}

export default function (props) {
  const navigation = useNavigation();

  return <Interests {...props} navigation={navigation} />;
}