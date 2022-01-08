#!/usr/bin/python

print "\nExecuting the cordova hook shareWith.py...\n"
androidManifest = r"./platforms/android/app/src/main/AndroidManifest.xml"

txt = """           <intent-filter>
                <action android:name="android.intent.action.SEND" />
                <category android:name="android.intent.category.DEFAULT" />
                <data android:mimeType="text/plain" />
            </intent-filter>\n """

with open(androidManifest, "r") as in_file:
    buf = in_file.readlines()

with open(androidManifest, "w") as out_file:
    for line in buf:
        if 'android:name="MainActivity"' in line:
            line = line + txt
        out_file.write(line)