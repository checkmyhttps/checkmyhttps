aller dans le dossier Mobile App\New\

Ajout plugin java CheckMyHTTPS:
dans le dossier \CheckMyHTTPS\
npm install ..\CMHPlugin\
puis
npx cap update android
npx cap sync

Build Ionic wrapper du plugin et l'intégrer:
dans le dossier \ionic-native\
npm run build
puis copier
\ionic-native\dist\@awesome-cordova-plugins\plugins\cmh-plugin 
vers -> ..\CheckMyHTTPS\node_modules\@ionic-native

Build l'application Ionic:
dans le dossier \CheckMyHTTPS\
Build android: ionic capacitor build android
Run android: ionic capacitor run android

JavaScript bridge :
CMHPlugin\www\CMHPlugin.js