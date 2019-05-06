# CheckMyHTTPS Mobile App installation

## Linux (Ubuntu)

### Requirements
1. Install Node.JS (v8.x) and NPM: `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`  and  `sudo apt install -y nodejs`
2. Install Ionic and Cordova: `sudo npm install -g ionic cordova@8.1.2`
3. Install Git: `sudo apt install git`

#### For Android
4. Install JDK 8 and Gradle and set the `$JAVA_HOME` variable: `sudo apt install openjdk-8-jdk gradle` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`)
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `$ANDROID_HOME` variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)

#### For iOS
4. Install Xcode (and Xcode command line tools : `sudo xcode-select --install`).
5. If Xcode is not detected by Ionic, run: `sudo xcode-select -switch /Applications/Xcode.app/Contents/Developer`

### Build and run the app
*The following command lines must be executed inside the Ionic project.*
1. Run `npm install` in order to install dependencies and create the folder `node_modules`.

#### For Android
2. Add the Android platform to the project: `ionic cordova platform add android`.
3. `ionic cordova build android` allows you to build the app.
4. `ionic cordova run android` allows to run the app on a mobile phone.

#### For iOS
2. Add the iOS platform to the project: `ionic cordova platform add ios`.
3. Prepare the iOS project: `ionic cordova prepare ios`.
4. Open the Xcode project: `open -a Xcode platforms/ios`, and then:
   - Change the application/bundle identifier.
   - Add/select your account to sign the app (free with Provisinning Profile).
   <!-- - If you encounter an error during signing with a Provisinning Profile : go to `File` > `Project Settings` then select `Legacy Build System` to `Build system` (see [apache/cordova-ios#412](https://github.com/apache/cordova-ios/issues/412)). -->
   - Build and run the application on your device.
