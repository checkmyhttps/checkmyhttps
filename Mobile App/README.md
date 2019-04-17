# CheckMyHTTPS Mobile App installation

## Linux (Ubuntu)

### Requirements
1. Install nodejs (v8.x) and npm: `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`  and  `sudo apt-get install -y nodejs`
2. Install cordova and ionic: `sudo npm install -g cordova@8.1.2 ionic`
3. Install git and gradle: `sudo apt install git gradle`


#### For Android
1. Install JDK 8 and set the $JAVA_HOME variable: `sudo apt install openjdk-8-jdk` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`)
2. Install the Android SDK (with Android Studio or SDK Tools) and set the $ANDROID_HOME variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)


### Build and run the app
The following command lines must be executed inside the Ionic project.
1. Run `npm install` in order to create the folder node_modules.
2. Add the android platform to the project: `ionic cordova platform add android`.
3. `ionic cordova build android` allows you to build the app.
4. `ionic cordova run android` allows to run the app on a mobile phone.
