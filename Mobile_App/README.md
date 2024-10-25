# Flutter CheckMyHttps

## Description

This application is a client of the CheckMyHttps project designed for smartphones. It has been built for Android and published on the Google Play Store. It may work on iOS, but we haven't tested it.

## Installation 

Download Android studio following their [tutorial](https://developer.android.com/studio/install)

### Download the dependencies of the project.

> flutter pub get

## Dependencies management

We have adding a json file directly in the project in order to list all the dependencies of the flutter project, the goal is to be able to check quickly if there are dependencies out of date in
the project.

If you want to reproduce this json file, you should follow this steps : 

### First Step : 
  In order to get all the dependencies of the flutter project, you will have to use this command :  “dart pub deps --json >> output.json”  in the shell of android studio project.

  Reference : https://dart.dev/tools/pub/cmd/pub-deps

### Second Step : 
  After that, you should send the “output.json” file into an json viewer online like this one : https://jsonformatter.org/json-viewer

### Third Step :

If you are looking for a specific dependency, you can use the research bar in the top right corner.
 

## FAQ

### Why choose Flutter?

This project is mainly maintained by students from ESIEA, and Flutter is part of their training curriculum. Moreover, we still benefit from the cross-platform advantage that the Ionic version offered.

### Can I use it with my own CMH server?

Due to a specificity of the Dart language, the current version of the app only works with servers that have a certificate signed by a CA Root recognized by Mozilla. You may need to modify parts of the code to use it if your organization issues its own certificates.

### What's new in this version?

We have changed the framework and also added signature verification to the app to enhance the security of the checks.

## Authors

Developed by Ghassen LAHDHIRI, Ahmed BOUSRIH, and Mehdi BELAJOUZA.

Review, updated and published by Cyril LEBLAY and Adrien SCHNEIDER.
