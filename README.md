# KM Finance App

Imagine a situation where a financial company is having a manager
-> to see the status of clients (whether they are interested in taking loan or not)
-> to assign work (clients) to employees and
-> keep track of work done by employees

Employees:

 Sales_persons : whose work is to call to clients and ask whether they are interested in taking loan and collect info about what type of loan needed,amount needed, etc. 

 Field_persons-> whose work is to go and visit the clients and collect documents and talk to clients.

Problem: 
  It becomes increasingly difficult to assign work and track progress using xl sheets as number of clients grow and company grow... having an application which keeps tracks of no. of calls done/ no. of clients visited,  to assign work to these employees and to check status of all clients solves this problem.That is what we are solving here.

## Tech Stack Used:

React Native for frontend
Node.js - typescript for backend
Express.js for APIs
JWT for authentication
MongoDB for database

# Screenshots

## Admin Pages

<img alt = "AdminAssign" src = "./assets/images/AdminAssign.png" />
<img alt = "AdminAssignModel" src = "./assets/images/AdminAssignModel.png"/>
<img alt = "AdminClientCreateModal" src = "./assets/images/AdminClientCreateModal.png" />
<img alt = "AdminStatus" src = "./assets/images/AdminStatus.png" />
<img alt = "AdminSeeStats" src = "./assets/images/AdminSeeStats.png" />
<img alt = "AdminSeeStats2" src = "./assets/images/AdminSeeStats2.png" />
<img alt = "AdminSeeStats3" src = "./assets/images/AdminSeeStats3.png" />

## Salesperson Pages

<img alt = "Work" src = "./assets/images/SalesWork.png" />
<img alt = "ViewDetails" src = "./assets/images/SalesViewDetails.png" />
<img alt = "ViewDetails2" src = "./assets/images/SalesViewDetails2.png" />
<img alt = "CallLogs" src = "./assets/images/CallLogs.png" />
<img alt = "CallStats" src = "./assets/images/CallStats.png" />
<img alt = "Callstatus" src = "./assets/images/CallStatus.png" />

## Fieldperson Pages

<img alt = "FieldWork" src = "./assets/images/FieldWork.png" />
<img alt = "MeetDetails1" src = "./assets/images/MeetDetails1.png" />
<img alt = "MeetDetails2" src = "./assets/images/MeetDetails2.png" />
<img alt = "MeetStatus" src = "./assets/images/MeetStatus.png" />
<img alt = "Meetlogs" src = "./assets/images/Meetlogs.png" />
<img alt = "MeetStats" src = "./assets/images/MeetStats.png" />

## Profile Page
<img alt = "Profile" src ="./assets/images/Profile.png" />

# Setup

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
