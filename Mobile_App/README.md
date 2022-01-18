# CheckMyHTTPS Mobile App installation

## Linux (Ubuntu)

### Requirements
1. Install Git: `sudo apt-get install git`
2. Install Node.JS and NPM: `sudo apt install -y nodejs` and `sudo apt install npm`
3. Install Ionic: `npm install -g @ionic/cli`

#### For Android
4. Install JDK 8 and Gradle and set the `$JAVA_HOME` variable: `sudo apt install openjdk-8-jdk gradle` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`)
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `$ANDROID_HOME` variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)


## Windows (10)

### Requirements
1. Install Git: [Git](https://git-scm.com/download/win)
2. Install Node.JS and NPM: [Node.JS](https://nodejs.org/en/download/) and `npm install -g npm`
3. Install Ionic: `npm install -g @ionic/cli`

#### For Android
4. Install JDK 8 and Gradle and set the `$JAVA_HOME` variable: `sudo apt install openjdk-8-jdk gradle` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`)
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `$ANDROID_HOME` variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)


## Installation (Same Linux & Windows)
go to `\Mobile_App\` folder

### Add CheckMyHTTPS java plugin:
go to `\Ionic\` folder
`npm install`
`npm install ..\CMHPlugin\`

### Build Ionic wrapper du plugin:
go to `\ionic-native\` folder
1. `npm install`
2. `npm run build`
3. copy
`\ionic-native\dist\@awesome-cordova-plugins\plugins\cmh-plugin` 
in -> `..\Ionic\node_modules\@ionic-native`

### Build CheckMyHTTPS Ionic project:
in `\Ionic\` folder
1. `ionic capacitor add android`
2. `npm run build`
3. `npx cap update android`
4. `npx cap sync`

### Build Ionic Android App:
in `\Ionic\` folder
1. Build android: `ionic capacitor build android`

### Start web
`ionic start`


## Add logo and splash screen :
1. `npm install capacitor-resources -g`
2. change in `\Ionic\resources\` 
3. in `\Ionic\` make: `capacitor-resources -p android`


## JavaScript bridge :
`CMHPlugin\www\CMHPlugin.js`