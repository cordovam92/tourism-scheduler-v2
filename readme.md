# CSIS 698 Tourism Scheduler v2

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

## Environment Setup

1. Install Node.js LTS. LTS located [here](https://nodejs.org/en/download/)

2. Install Android SDK. SDK located [here](https://developer.android.com/studio)

3. In your repository directory install the Expo CLI command line utility

```bash 
npm install -g expo-cli 
```

4. Build your new React Native Project called "tourism-scheduler" and move into the new project's directory

```bash
expo init tourism-scheduler
cd tourism-scheduler
```

5. Install the necesarry dependencies

```bash
npm install react-native
npm install react-native-safe-area-context
npm install react-native-elements
npm install @react-navigation/native
npm install @react-navigation/stack
npm install react-native-modal-datetime-picker
npm install react-native-maps
npm install react-native-geolocation-service
npm install react-navigation
npm install react-native-timeline-flatlist
```
6. Before attempting to run the application, open up Android SDK and click More Actions

7. Within that menu select Virtual Device Manager

8. Create a device if one isn't already available, the higher the Pixel version the better

9. Run the application
```bash
npm start
```

10. Press a to run the application on the emulated android device

11. Success!

## Resources

### React Native

For further references with React Native

- [React Native](https://reactnative.dev/)
- [Getting Started](https://reactnative.dev/docs/getting-started)