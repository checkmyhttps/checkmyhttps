package fr.esiea.checkmyhttps.cmhplugin;

// Cordova-required packages
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.json.JSONArray;
import org.json.JSONObject;
import org.json.JSONException;

import javax.net.ssl.HttpsURLConnection;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URL;
import java.security.MessageDigest;
import java.security.cert.Certificate;

public class CMHPlugin extends CordovaPlugin {

    private static char[] HEX_CHARS = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        if (action.equals("getFingerprints")) {
            this.getFingerprints(args, callbackContext);
            return true;
        }
        else if (action.equals("getFingerprintsFromCheckServer")) {
            this.getFingerprintsFromCheckServer(args, callbackContext);
            return true;
        } else {
            callbackContext.error("\"" + action + "\" is not a recognized action.");
            return false;
        }
    }

    public boolean getFingerprints(JSONArray args, CallbackContext callbackContext){
        try {
            //https connection with the requested URL
            String httpsURL = args.getJSONObject(0).getString("param1");
            HttpsURLConnection httpsConnection = (HttpsURLConnection) new URL(httpsURL).openConnection();
            //Only need to recover the certificate, HEAD instead of GET
            httpsConnection.setRequestMethod("HEAD");
            httpsConnection.setConnectTimeout(5000);
            httpsConnection.connect();
            
            //Recover the fingerprints and the number of certificates of the website
            Certificate[] certificateChain = httpsConnection.getServerCertificates();
            int sizeCertificateChain = certificateChain.length;

            MessageDigest mdSHA256 = MessageDigest.getInstance("SHA256");

            //store fingerprints of certificate chain
            JSONObject fingerprintsCertificateChainJSON = new JSONObject();

            int i;
            for(i = 0; i<sizeCertificateChain; i++){
                mdSHA256.update(certificateChain[i].getEncoded());

                String sha256 = dumpHex(mdSHA256.digest());

                JSONObject fingerprintsJSON = new JSONObject();
                fingerprintsJSON.put("sha256", sha256);

                fingerprintsCertificateChainJSON.put("cert"+i, fingerprintsJSON);
            }

            PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, fingerprintsCertificateChainJSON);
            pluginResult.setKeepCallback(true);
            callbackContext.sendPluginResult(pluginResult);
            return true;

        } catch (Exception e) {
            callbackContext.error(e.toString());
            return false;
        }
    }

    public boolean getFingerprintsFromCheckServer(JSONArray args, CallbackContext callbackContext){
        try {
            String host = args.getJSONObject(1).getString("param2");
            String port = args.getJSONObject(2).getString("param3");

            String urlTested = args.getJSONObject(0).getString("param1") + "/api.php?host=" + host + "&port=" + port;

            //https connection to the check server with the requested URL
            HttpsURLConnection httpsConnection = (HttpsURLConnection) new URL(urlTested).openConnection();
            httpsConnection.setConnectTimeout(5000);
            httpsConnection.connect();

            Certificate[] certificateChain = httpsConnection.getServerCertificates();
            int sizeCertificateChain = certificateChain.length;

            MessageDigest mdSHA256 = MessageDigest.getInstance("SHA256");

            JSONObject fingerprintsCertificateChainJSON = new JSONObject();

            int i;
            for(i = 0; i<sizeCertificateChain; i++){
                mdSHA256.update(certificateChain[i].getEncoded());

                String sha256 = dumpHex(mdSHA256.digest());

                JSONObject serverFingerprintsJSON = new JSONObject();
                serverFingerprintsJSON.put("sha256", sha256);

                fingerprintsCertificateChainJSON.put("cert"+i, serverFingerprintsJSON);
            }

            // #################################### Get the output of the check server's API ####################################
            
            BufferedReader reader = new BufferedReader(new InputStreamReader(httpsConnection.getInputStream()));
            StringBuffer webPageServer = new StringBuffer();
            String inputLine;

            while ((inputLine = reader.readLine()) != null) {
                webPageServer.append(inputLine);
            }
            reader.close();

            JSONObject webPageServerJSON = new JSONObject(webPageServer.toString());

            // ############################ Sending certificates of check server and the API info ############################

            JSONObject responseJSON = new JSONObject();
            responseJSON.put("fingerprints", fingerprintsCertificateChainJSON);
            responseJSON.put("APIInfo", webPageServerJSON);

            PluginResult pluginResultServer = new PluginResult(PluginResult.Status.OK, responseJSON);
            callbackContext.sendPluginResult(pluginResultServer);
            return true;

        } catch (Exception e) {
            callbackContext.error(e.toString());
            return false;
        }
    }

    private static String dumpHex(byte[] data) {
        final int n = data.length;
        final StringBuilder sb = new StringBuilder(n * 2);
        for (int i = 0; i < n; i++) {
          sb.append(HEX_CHARS[(data[i] >> 4) & 0x0F]);
          sb.append(HEX_CHARS[data[i] & 0x0F]);
        }
        return sb.toString();
    }
}

