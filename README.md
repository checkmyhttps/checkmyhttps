#CheckMyHTTPS for Firefox
This addon has been developped by two students at ESIEA in Laval (graduate school of engineering )
This project has been launched by M. Rey, a researcher who is working for an IT Security Laboratory.

This user-friendly addon allows you to detect if your SSL connection is being listened to !
For more information, please take a look on our website https://www.checkmyhttps.net.

#How does it works?
First of all, we get the server certificate thumbprint (SHA1/SHA256) of checkmyhttps.net seen by the client.
Then we send these informations via a GET HTTP request to checkmyhttps.net
checkmyhttps.net execute an openssl command to get his own server certificate thumbprint (SHA1/SHA256)
At the end, checkmyhttps.net send you a positive response if they match! (a green lock will appear, otherwise there will be a red one.)
During this process, the lock is yellow. You just have to wait the result.

#Author
Raphaël PION and Hugo MEZIANI
#LICENSE
GPL v3
