# CheckMyHTTPS Mobile App installation

## Linux (Ubuntu)

### Requirements
1. Install Git: `sudo apt-get install git`
2. Install Node.JS and NPM: `sudo apt install -y nodejs` and `sudo apt install npm`
3. Install Ionic: `sudo npm install -g @ionic/cli`

#### For Android
4. Install OpenJDK and Gradle and set the `$JAVA_HOME` variable: `sudo apt install default-jdk gradle` and `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/`
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `$ANDROID_HOME` variable: `export ANDROID_HOME=~/Android/Sdk` and `export PATH=${PATH}:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools`)


## Windows (10)

### Requirements
1. Install Git: [Git](https://git-scm.com/download/win)
2. Install Node.JS and NPM: [Node.JS](https://nodejs.org/en/download/) and `npm install -g npm`
3. Install Ionic: `npm install -g @ionic/cli`

#### For Android
4. Install JDK and Gradle: [Java JDK](https://www.oracle.com/java/technologies/downloads/#jdk17-windows) [Gradle](https://gradle.org/releases/) and set the `JAVA_HOME` environment variable.
5. Install the Android SDK (with Android Studio or SDK Tools) and set the `ANDROID_HOME` environment variable and in `PATH` environment variable: `ANDROID_HOME`+`\tools` `ANDROID_HOME`+`\cmdline-tools\latest\bin` `ANDROID_HOME`+`\platform-tools` `ANDROID_HOME`+`\emulator`


## Installation (Same Linux & Windows)
go to `\Mobile_App\` folder

### Build Ionic wrapper du plugin:
go to `\ionic-native\` folder
1. `npm install`
2. `npm run build`

### Build CheckMyHTTPS Ionic project:
in `\Ionic\` folder
1. `npm install`
3. `npm run build`
2. `ionic capacitor add android`
4. `npx cap update android`
5. `npx cap sync`

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