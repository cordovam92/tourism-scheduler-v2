import React from 'react';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Button, Icon, IconProps } from 'react-native-elements';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    TouchableOpacity,
    StatusBar,
    Alert,
    ScrollView,
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/native-stack';
import { route } from 'react-navigation';
import Timeline from 'react-native-timeline-flatlist';

navigator.geolocation = require('@react-native-community/geolocation');

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#3d5a80',
        textAlign: 'center',
        flex: 1,
        padding: 10,
    },
    headerText: {
        color: 'white',
        alignSelf: 'center',
        fontSize: 30,
    },
});

class Itinerary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            latitude: 0,
            longitude: 0,
            data: [],
            places: [],
            placesDetails: [],
            placeId: null,
            next_page_token: null,
            userActivities: [],
            itinerary: null,
            userInterests: this.props.route.params.userInterests,
            arrivalDate: this.props.route.params.arrivalDate,
            departureDate: this.props.route.params.departureDate,
            numOfRestaurants: 0,
            numOfAquarium: 0,
            numOfMuseums: 0,
            numOfTouristAttractions: 0,
            numOfArtGalleries: 0,
            numOfGyms: 0,
            numOfShopping: 0,
            numOfBars: 0,
            numOfSpas: 0,
            numOfMovies: 0,
        };
    }

    async componentDidMount() {
        // Returns the users current latitude and longitude and sets those values
        // to the lat and long state variables
        Geolocation.getCurrentPosition(
            position => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                });
            },
            error => this.setState({ error: error.message }),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 2000 },
        );

        // Calls the Places API for each instance of a user interest and then
        // calls the Places Details API to return more information about all the Places
        // returned from the Places call, all calls of the Details API are appended to the
        // placesDetails state array
        for (let i = 0; i < this.state.userInterests.length; i++) {
            await this.placesLocation(this.state.userInterests[i]);
            await this.setPlaceId();
            for (let j = 0; j < this.state.places.results.length; j++) {
                await this.placesDetails(this.state.placeID[j]);
            }
            // await this.placesNextLocation();
            // await this.setPlaceId();
            // for (let j = 0; j < this.state.places.results.length; j++) {
            //   await this.placesDetails(this.state.placeID[j]);
            // }
        }

        console.log(this.state.placesDetails);

        await this.itineraryLogic();
        await this.renderTimeLine();
    }

    // Calls Places API to and returns array (places) of nearby places
    async placesLocation(passValueType) {
        const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?';
        const location = `location=32.7765,-79.9311`;
        const radius = '&radius=2000';
        const type = '&keyword=' + passValueType;
        const key = '&key=AIzaSyDaTtaGKAtagAGQOGDpwampwWDhFzpQ3Vg';
        const placesSearchUrl = url + location + radius + type + key;
        await fetch(placesSearchUrl)
            .then(response => response.json())
            .then(result =>
                this.setState({
                    places: result,
                    next_page_token: result.next_page_token,
                }),
            )
            .catch(e => console.log(e));
    }

    async placesNextLocation(next_page_token) {
        const placesSearchUrl = next_page_token;
        await fetch(placesSearchUrl)
            .then(response => response.json())
            .then(result => this.setState({ places: result }))
            .catch(e => console.log(e));
    }

    // Changes state of placeID to an array containing the place
    // ID of locations within the places array
    async setPlaceId() {
        const resultsArr = [];

        for (let i = 0; i < this.state.places.results.length; i++) {
            resultsArr.push(this.state.places.results[i].place_id);
        }

        this.setState({
            placeID: resultsArr,
        });
    }

    // Calls places API to return more details about the specified place
    async placesDetails(placeID) {
        const url = 'https://maps.googleapis.com/maps/api/place/details/json?';
        const place_id = 'place_id=' + placeID;
        const key = '&key=AIzaSyDaTtaGKAtagAGQOGDpwampwWDhFzpQ3Vg';
        const placesDetailsUrl = url + place_id + key;

        await fetch(placesDetailsUrl)
            .then(response => response.json())
            .then(result =>
                this.setState({ placesDetails: [...this.state.placesDetails, result] }),
            )
            .catch(e => console.log(e));
    }

    // Returns an array with all dates between and including
    // the arrival and departure date
    getAllDays() {
        for (
            var arr = [], dt = new Date(this.state.arrivalDate);
            dt <= this.state.departureDate;
            dt.setDate(dt.getDate() + 1)
        ) {
            arr.push(new Date(dt));
        }
        arr.push(this.state.departureDate);

        return arr;
    }

    // Given an array of places and a type, returns the highest rated place
    // relating to it's type
    returnHighestRated(array, type) {
        var max = Math.max();
        var highestRatedPlace = null;
        let daysInTown = this.getAllDays();
        let placesPeriodsToDays = {
            0: 'Sunday',
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday',
        };
        let daysInTownAsInt = daysInTown.map(date => date.getDay());

        for (let i = 0; i < array.length; i++) {
            if (type == 'store') {
                for (let x = 0; x < array[i].result.types.length; x++) {
                    if (array[i].result.types[x] == 'store') {
                        if (
                            array[i].result.user_ratings_total / array[i].result.rating >
                            max
                        ) {
                            max = array[i].result.user_ratings_total / array[i].result.rating;
                            highestRatedPlace = array[i];
                        }
                    }
                }
            } else if (
                (array[i].result.types[0] || array[i].result.types[1]) == type
            ) {
                for (let q = 0; q < array[i].result.opening_hours.periods.length; q++) {
                    if (array[i].result.opening_hours.periods.length == 7) {
                        if (
                            array[i].result.user_ratings_total / array[i].result.rating >
                            max
                        ) {
                            max = array[i].result.user_ratings_total / array[i].result.rating;
                            highestRatedPlace = array[i];
                        }
                    } else if (type == 'store') {
                        for (let x = 0; x < array[i].result.types.length; x++) {
                            if (array[i].result.types[x] == 'store') {
                                if (
                                    array[i].result.user_ratings_total / array[i].result.rating >
                                    max
                                ) {
                                    max =
                                        array[i].result.user_ratings_total / array[i].result.rating;
                                    highestRatedPlace = array[i];
                                }
                            }
                        }
                    } else {
                        for (
                            let r = 0;
                            r < array[i].result.opening_hours.periods.length;
                            r++
                        ) {
                            if (
                                daysInTownAsInt.includes(
                                    array[i].result.opening_hours.periods[r].open.day,
                                )
                            ) {
                                if (
                                    array[i].result.user_ratings_total / array[i].result.rating >
                                    max
                                ) {
                                    max =
                                        array[i].result.user_ratings_total / array[i].result.rating;
                                    highestRatedPlace = array[i];
                                }
                            }
                        }
                    }
                }
            }
        }

        return highestRatedPlace;
    }

    starRender(rating) {
        if (rating >= 5) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 4.5) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-half" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 4) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 3.5) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-half" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 3) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 2.5) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-half" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 2) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 1.5) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-half" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 1) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else if (rating >= 0.5) {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star-half" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        } else {
            return (
                <SafeAreaView style={{ flexDirection: 'row' }}>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                    <Icon name="star-outline" size={18}></Icon>
                </SafeAreaView>
            );
        }
        return null;
    }

    // A function that returns the itinerary based off of the activity list
    // passed through some logic
    async itineraryLogic() {
        let numOfRestaurants = 0;
        let numOfAquarium = 0;
        let numOfMuseums = 0;
        let numOfTouristAttractions = 0;
        let numOfArtGalleries = 0;
        let numOfGyms = 0;
        let numOfShopping = 0;
        let numOfBars = 0;
        let numOfSpas = 0;
        let numOfMovies = 0;

        let activities = [];

        let userInterests = [...this.state.userInterests];

        let itinerary = [];

        let timeAvailable =
            this.state.departureDate.getTime() - this.state.arrivalDate.getTime();

        let daysInTown = timeAvailable / (1000 * 3600 * 24);

        let hoursInTown = daysInTown * 24;

        let sleepTime = null;

        if (daysInTown >= 2) {
            sleepTime = (daysInTown - 1) * 8;
        } else {
            sleepTime = 8;
        }

        let hoursForActivities = hoursInTown - sleepTime;

        let hoursForEachActivity = Math.ceil(
            hoursForActivities / userInterests.length,
        );

        let eatAmount = daysInTown * 2;

        let comparison = 0;

        let index = null;

        let currentActivityTime = 0;

        // Pushes all places from placesDetails array with a rating into
        // the activities array. I.E activities array is placesDetails array
        // but without the places with no ratings
        for (let i = 0; i < this.state.placesDetails.length; i++) {
            if (
                this.state.placesDetails[i].result.rating > 0 &&
                this.state.placesDetails[i].result.opening_hours
            ) {
                activities.push(this.state.placesDetails[i]);
            }
        }

        // Appends to itinerary restaurant choices
        for (let i = 0; i < eatAmount; i++) {
            if (userInterests.includes('Restaurant')) {
                let highestRatedRestaurant = this.returnHighestRated(
                    activities,
                    'restaurant',
                );
                itinerary.push(highestRatedRestaurant);
                index = activities.indexOf(highestRatedRestaurant);
                activities.splice(index, 1);
                currentActivityTime += 1.5;
                numOfRestaurants += 1;
            }
        }

        // Appends to itinerary Aquarium and then removes aquarium
        // from userIntest to set hoursForEachActvity
        if (userInterests.includes('Aquarium')) {
            let highestRatedAquarium = this.returnHighestRated(
                activities,
                'aquarium',
            );
            itinerary.push(highestRatedAquarium);
            index = activities.indexOf(highestRatedAquarium);
            activities.splice(index, 1);
            index = userInterests.indexOf('Restaurant');
            userInterests.splice(index, 1);
            currentActivityTime += 2;
            numOfAquarium += 1;
        }

        // Removes restaurant from userInterest array to set
        // hoursForEachActivity
        if (userInterests.includes('Restaurant')) {
            index = userInterests.indexOf('Restaurant');
            userInterests.splice(index, 1);
        }

        hoursForActivities = hoursForActivities - currentActivityTime;

        hoursForEachActivity = Math.ceil(hoursForActivities / userInterests.length);

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('Museum')) {
                let highestRatedMuseum = this.returnHighestRated(activities, 'museum');
                itinerary.push(highestRatedMuseum);
                index = activities.indexOf(highestRatedMuseum);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfMuseums += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('tourist_attraction')) {
                let highestRatedTouristAttraction = this.returnHighestRated(
                    activities,
                    'tourist_attraction',
                );
                itinerary.push(highestRatedTouristAttraction);
                index = activities.indexOf(highestRatedTouristAttraction);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfTouristAttractions += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('art_gallery')) {
                let highestRatedArt = this.returnHighestRated(
                    activities,
                    'art_gallery',
                );
                itinerary.push(highestRatedArt);
                index = activities.indexOf(highestRatedArt);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfTouristAttractions += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('Gym')) {
                let highestRatedGym = this.returnHighestRated(activities, 'gym');
                itinerary.push(highestRatedGym);
                index = activities.indexOf(highestRatedGym);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numofGyms += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('shopping_mall')) {
                let highestRatedShopping = this.returnHighestRated(activities, 'store');
                itinerary.push(highestRatedShopping);
                index = activities.indexOf(highestRatedShopping);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfShopping += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('Bar')) {
                let highestRatedBar = this.returnHighestRated(activities, 'bar');
                itinerary.push(highestRatedBar);
                index = activities.indexOf(highestRatedBar);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfBars += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('Spa')) {
                let highestRatedSpa = this.returnHighestRated(activities, 'spa');
                itinerary.push(highestRatedSpa);
                index = activities.indexOf(highestRatedSpa);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfSpas += 1;
            }
        }

        for (let i = 0; i <= hoursForEachActivity; i++) {
            if (userInterests.includes('movie_theater')) {
                let highestRatedMovie = this.returnHighestRated(
                    activities,
                    'movie_theater',
                );
                itinerary.push(highestRatedMovie);
                index = activities.indexOf(highestRatedMovie);
                activities.splice(index, 1);
                currentActivityTime += 1;
                numOfMovies += 1;
            }
        }

        console.log(activities);

        await this.setState({
            itinerary: itinerary,
            numOfRestaurants: numOfRestaurants,
            numOfAquarium: numOfAquarium,
            numOfMuseums: numOfMuseums,
            numOfTouristAttractions: numOfTouristAttractions,
            numOfArtGalleries: numOfArtGalleries,
            numOfGyms: numOfGyms,
            numOfShopping: numOfShopping,
            numOfBars: numOfBars,
            numOfSpas: numOfSpas,
            numOfMovies: numOfMovies,
        });
    }

    // This function returns an itinerary for a given day
    renderTimeLine() {
        let datesInTown = this.getAllDays();

        let numOfRestaurants = this.state.numOfRestaurants;
        let numOfAquarium = this.state.numOfAquarium;
        let numOfMuseums = this.state.numOfMuseums;
        let numOfTouristAttractions = this.state.numOfTouristAttractions;
        let numOfArtGalleries = this.state.numOfArtGalleries;
        let numOfGyms = this.state.numOfGyms;
        let numOfShopping = this.state.numOfShopping;
        let numOfBars = this.state.numOfBars;
        let numOfSpas = this.state.numOfSpas;
        let numOfMovies = this.state.numOfMovies;

        let numOfRestaurantsPerDay = numOfRestaurants / datesInTown.length;
        let numOfAquariumPerDay = Math.floor(numOfAquarium / datesInTown.length);
        let numOfMuseumsPerDay = Math.floor(numOfMuseums / datesInTown.length);
        let numOfTouristAttractionsPerDay = Math.floor(
            numOfTouristAttractions / datesInTown.length,
        );
        let numOfArtGalleriesPerDay = Math.floor(
            numOfArtGalleries / datesInTown.length,
        );
        let numOfGymsPerDay = Math.floor(numOfGyms / datesInTown.length);
        let numOfShoppingPerDay = Math.floor(numOfShopping / datesInTown.length);
        let numOfBarsPerDay = Math.floor(numOfBars / datesInTown.length);
        let numOfSpasPerDay = Math.floor(numOfSpas / datesInTown.length);
        let numOfMoviesPerDay = Math.floor(numOfMovies / datesInTown.length);

        console.log(
            numOfRestaurantsPerDay,
            numOfShoppingPerDay,
            numOfMuseumsPerDay,
            numOfSpasPerDay,
        );

        let itinerary = [...this.state.itinerary];

        let itineraryForDay = [];

        let userInterests = [...this.state.userInterests];

        let data = [];

        let timeAvailable =
            this.state.departureDate.getTime() - this.state.arrivalDate.getTime();

        let daysInTown = timeAvailable / (1000 * 3600 * 24);

        let hoursInTown = daysInTown * 24;

        let eatAmount = daysInTown * 2;

        let sleepTime = null;

        if (this.getAllDays().length >= 2) {
            sleepTime = (daysInTown - 1) * 8;
        } else {
            sleepTime = 8;
        }

        let hoursForActivities = hoursInTown - sleepTime;

        let hoursForDailyActivities = hoursForActivities / datesInTown.length;

        let hoursForEachActivity = Math.floor(
            hoursForDailyActivities / userInterests.length,
        );

        console.log(hoursForEachActivity);

        let currentActivityTime = 0;

        let index = null;

        let dataRow = {
            time: '09:00',
            title: 'Event 1',
            description: 'Event 1 Description',
        };

        for (let i = 0; i < datesInTown.length; i++) {
            for (let j = 0; j < itinerary.length; j++) {
                if (
                    itinerary[j].result.types[0] == 'restaurant' ||
                    itinerary[j].result.types[1] == 'restaurant'
                ) {
                    for (let a = 0; a < numOfRestaurantsPerDay; a++) {
                        let nextPlace = itinerary[j];
                        dataRow = {
                            time: datesInTown[i].toDateString() + ':',
                            date: datesInTown[i],
                            title: nextPlace.result.name,
                            description: this.starRender(nextPlace.result.rating),
                        };
                        data.push(dataRow);
                        index = itinerary.indexOf(nextPlace);
                        itinerary.splice(index, 1);
                    }
                } else if (
                    itinerary[j].result.types[0] == 'aquarium' ||
                    itinerary[j].result.types[1] == 'aquarium'
                ) {
                    let nextPlace = itinerary[j];
                    dataRow = {
                        time: datesInTown[i].toDateString() + ':',
                        date: datesInTown[i],
                        title: nextPlace.result.name,
                        description: this.starRender(nextPlace.result.rating),
                    };
                    data.push(dataRow);
                    index = itinerary.indexOf(nextPlace);
                    itinerary.splice(index, 1);
                } else if (
                    itinerary[j].result.types[0] == 'museum' ||
                    itinerary[j].result.types[1] == 'museum'
                ) {
                    for (let c = 0; c <= numOfMuseumsPerDay; c++) {
                        let nextPlace = itinerary[j];
                        dataRow = {
                            time: datesInTown[i].toDateString() + ':',
                            date: datesInTown[i],
                            title: nextPlace.result.name,
                            description: this.starRender(nextPlace.result.rating),
                        };
                        data.push(dataRow);
                        index = itinerary.indexOf(nextPlace);
                        itinerary.splice(index, 1);
                    }
                }

                // for (let d = 0; d <= hoursForEachActivity; d++) {
                //   if (
                //     itinerary[j].result.types[0] == 'art_gallery' ||
                //     itinerary[j].result.types[1] == 'art_gallery'
                //   ) {
                //     let nextPlace = itinerary[j];
                //     dataRow = {
                //       time: datesInTown[i].toDateString() + ':',
                //       date: datesInTown[i],
                //       title: nextPlace.result.name,
                //       description: this.starRender(nextPlace.result.rating),
                //     };
                //     data.push(dataRow);
                //     index = itinerary.indexOf(nextPlace);
                //     itinerary.splice(index, 1);
                //   }
                // }

                // for (let e = 0; e <= hoursForEachActivity; e++) {
                //   if (
                //     itinerary[j].result.types[0] == 'gym' ||
                //     itinerary[j].result.types[1] == 'gym'
                //   ) {
                //     let nextPlace = itinerary[j];
                //     dataRow = {
                //       time: datesInTown[i].toDateString() + ':',
                //       date: datesInTown[i],
                //       title: nextPlace.result.name,
                //       description: this.starRender(nextPlace.result.rating),
                //     };
                //     data.push(dataRow);
                //     index = itinerary.indexOf(nextPlace);
                //     itinerary.splice(index, 1);
                //   }
                // }

                // // for (let z = 0; z < itinerary[j].result.types.length; z++) {
                // //   for (let g = 0; g <= hoursForEachActivity; g++) {
                // //     if (itinerary[j].result.types[z] == 'store') {
                // //       let nextPlace = itinerary[j];
                // //       dataRow = {
                // //         time: datesInTown[i].toDateString() + ':',
                // //         date: datesInTown[i],
                // //         title: nextPlace.result.name,
                // //         description: this.starRender(nextPlace.result.rating),
                // //       };
                // //       data.push(dataRow);
                // //       index = itinerary.indexOf(nextPlace);
                // //       itinerary.splice(index, 1);
                // //     }
                // //   }
                // // }

                // for (let h = 0; h <= hoursForEachActivity; h++) {
                //   if (
                //     itinerary[j].result.types[0] == 'bar' ||
                //     itinerary[j].result.types[1] == 'bar'
                //   ) {
                //     let nextPlace = itinerary[j];
                //     dataRow = {
                //       time: datesInTown[i].toDateString() + ':',
                //       date: datesInTown[i],
                //       title: nextPlace.result.name,
                //       description: this.starRender(nextPlace.result.rating),
                //     };
                //     data.push(dataRow);
                //     index = itinerary.indexOf(nextPlace);
                //     itinerary.splice(index, 1);
                //   }
                // }

                // for (let k = 0; k <= hoursForEachActivity; k++) {
                //   if (
                //     itinerary[j].result.types[0] == 'spa' ||
                //     itinerary[j].result.types[1] == 'spa'
                //   ) {
                //     let nextPlace = itinerary[j];
                //     dataRow = {
                //       time: datesInTown[i].toDateString() + ':',
                //       date: datesInTown[i],
                //       title: nextPlace.result.name,
                //       description: this.starRender(nextPlace.result.rating),
                //     };
                //     data.push(dataRow);
                //     index = itinerary.indexOf(nextPlace);
                //     itinerary.splice(index, 1);
                //   }
                // }

                // for (let l = 0; l <= hoursForEachActivity; l++) {
                //   if (
                //     itinerary[j].result.types[0] == 'movie_theater' ||
                //     itinerary[j].result.types[1] == 'movie_theater'
                //   ) {
                //     let nextPlace = itinerary[j];
                //     dataRow = {
                //       time: datesInTown[i].toDateString() + ':',
                //       date: datesInTown[i],
                //       title: nextPlace.result.name,
                //       description: this.starRender(nextPlace.result.rating),
                //     };
                //     data.push(dataRow);
                //     index = itinerary.indexOf(nextPlace);
                //     itinerary.splice(index, 1);
                //   }
                // }
            }
        }

        this.setState({
            data: data,
        });
    }

    render() {
        var datesInTown = this.getAllDays();
        return (
            <SafeAreaView style={styles.container}>
                {/* <Text
          style={{
            color: 'white',
            alignSelf: 'center',
            fontSize: 25,
            textDecorationLine: 'underline',
          }}>
          Day {this.state.pageCount + 1}:{' '}
          {datesInTown[this.state.pageCount].getUTCMonth() +
            1 +
            '/' +
            datesInTown[this.state.pageCount].getUTCDate() +
            '/' +
            datesInTown[this.state.pageCount].getUTCFullYear()}
        </Text> */}

                <Timeline
                    data={this.state.data}
                    style={{
                        flex: 1,
                        marginTop: 20,
                        textAlign: 'center',
                    }}
                    circleSize={20}
                    circleColor="rgba(0,0,0,0)"
                    lineColor="white"
                    timeContainerStyle={{ minWidth: 52 }}
                    timeStyle={{
                        textAlign: 'center',
                        backgroundColor: '#ee6c4d',
                        color: 'white',
                        padding: 5,
                        borderRadius: 13,
                    }}
                    descriptionStyle={{ color: 'gray' }}
                    options={{
                        style: { paddingTop: 5 },
                    }}
                    innerCircle={'dot'}
                    onEventPress={this.onEventPress}
                    separator={false}
                    detailContainerStyle={{
                        marginBottom: 20,
                        paddingLeft: 5,
                        paddingRight: 5,
                        backgroundColor: '#BBDAFF',
                        borderRadius: 10,
                    }}
                    columnFormat="two-column"
                />

                <SafeAreaView
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <SafeAreaView style={{ padding: 2 }}></SafeAreaView>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                        <Button
                            title="Debug"
                            onPress={() =>
                                console.log(
                                    this.state.itinerary,
                                    this.state.data,
                                    this.getAllDays(),
                                )
                            }></Button>
                    </View>
                </SafeAreaView>
            </SafeAreaView>
        );
    }
}

export default function (props) {
    const navigation = useNavigation();

    return <Itinerary {...props} navigation={navigation} />;
}
