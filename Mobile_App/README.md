# CheckMyHTTPS Mobile App installation

## Linux (Ubuntu)

### Requirements
1. Install Node.JS and NPM: `sudo apt install -y nodejs` and `sudo apt install npm`
2. Install Ionic: `npm install -g @ionic/cli`
3. Install Git: `sudo apt-get install git`

#### For Android
4. Install JDK 8 and Gradle and set the `$JAVA_HOME` variable: `sudo apt install openjdk-8-jdk gradle` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`)
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `$ANDROID_HOME` variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)


## Windows (10)

### Requirements
1. Install Node.JS and NPM:
2. Install Ionic:
3. Install Git: 

#### For Android
4. Install JDK 8 and Gradle and set the `$JAVA_HOME` variable: `sudo apt install openjdk-8-jdk gradle` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`)
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `$ANDROID_HOME` variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)


## Installation (Same Linux & Windows)
go to `\Mobile_App\` folder

### Ajout plugin java CheckMyHTTPS:
go to `\Ionic\` folder
`npm install`
`npm install ..\CMHPlugin\`

### Build Ionic wrapper du plugin:
go to `\ionic-native\` folder
1. `npm install`
2. `npm run build`
3. puis copier
`\ionic-native\dist\@awesome-cordova-plugins\plugins\cmh-plugin` 
to -> `..\Ionic\node_modules\@ionic-native`

### Build CheckMyHTTPS Ionic project:
in `\Ionic\` folder
1. `npm run build`
2. `npx cap update android`
3. `npx cap sync`

### Build l'application Ionic:
in `\Ionic\` folder
1. Build android: `ionic capacitor build android`

### Start web
`ionic start`




JavaScript bridge :
CMHPlugin\www\CMHPlugin.js