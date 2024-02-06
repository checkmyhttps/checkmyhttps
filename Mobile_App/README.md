# Flutter CheckMyHttps

## Description

This application is a client of the CheckMyHttps project designed for smartphones. It has been built for Android and published on the Google Play Store. It may work on iOS, but we haven't tested it.

## Installation 

Download Android studio following their [tutorial](https://developer.android.com/studio/install)

### Download the dependencies of the project.

> flutter pub get

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
