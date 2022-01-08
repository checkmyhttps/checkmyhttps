/**
 * CheckMyHTTPS iOS native plugin.
 * @author CheckMyHTTPS's team
 * @license GPL-3.0
 */

#import "cmhPlugin.h"
#import <Cordova/CDV.h>
#import <Cordova/CDVPluginResult.h>
#import <CommonCrypto/CommonDigest.h>

@interface CustomURLSessionDataDelegate : NSObject<NSURLSessionDataDelegate>

@property (strong, nonatomic) CDVPlugin*           _plugin;
@property (strong, nonatomic) NSString*            _callbackId;
@property (nonatomic, assign) NSMutableDictionary* _responseObj;

- (id)initWithPlugin:(CDVPlugin*)plugin callbackId:(NSString*)callbackId responseObj:(NSMutableDictionary*)responseObj;

@end

@implementation CustomURLSessionDataDelegate

- (id)initWithPlugin:(CDVPlugin*)plugin callbackId:(NSString*)callbackId responseObj:(NSMutableDictionary*)responseObj
{
	self._plugin      = plugin;
	self._callbackId  = callbackId;
	self._responseObj = responseObj;
	return self;
}

- (void)URLSession:(NSURLSession*)session didReceiveChallenge:(NSURLAuthenticationChallenge*)challenge completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition, NSURLCredential* _Nullable))completionHandler
{
	SecTrustRef serverCert = challenge.protectionSpace.serverTrust;
	long certCount = SecTrustGetCertificateCount(serverCert);
	NSMutableArray* fingerprints = [NSMutableArray arrayWithCapacity: certCount];
	// NSLog(@"Fingerprints count: %ld", certCount);
	for (long i = 0; i < certCount; i++) {
		// NSLog(@" [%ld] %@", i, [self formatFingerprintSha256: SecTrustGetCertificateAtIndex(serverCert, i)]);
		[fingerprints addObject: [NSDictionary dictionaryWithObject: [self formatFingerprintSha256: SecTrustGetCertificateAtIndex(serverCert, i)] forKey: @"sha256"]];
	}

	[self._responseObj setValue: fingerprints forKey: @"fingerprints"];

	NSURLCredential* credential = [NSURLCredential credentialForTrust: serverCert];
	completionHandler(NSURLSessionAuthChallengeUseCredential, credential);
}

- (NSString*)formatFingerprintSha256:(SecCertificateRef)cert
{
	NSData* certData = (__bridge NSData*) SecCertificateCopyData(cert);
	unsigned char sha256_bytes[CC_SHA256_DIGEST_LENGTH];
	CC_SHA256(certData.bytes, (unsigned int) certData.length, sha256_bytes);
	NSMutableString* connFingerprint = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
	for (int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++) {
		[connFingerprint appendFormat: @"%02X", sha256_bytes[i]];
	}
	return connFingerprint;
}

@end

@interface cmhPlugin ()

@property (strong, nonatomic) NSString*            _callbackId;
@property (retain)            NSMutableDictionary* _responseObj;

@end

@implementation cmhPlugin

- (void)openHTTPSRequest:(CDVInvokedUrlCommand*)command
{
	NSString* reqUrl        = [command.arguments objectAtIndex: 0];
	BOOL      isCheckServer = [[command.arguments objectAtIndex: 1] boolValue];
	// NSLog(@"openHTTPSRequest (%@, %d)", reqUrl, isCheckServer);

	NSMutableURLRequest* req = [NSMutableURLRequest requestWithURL: [NSURL URLWithString: reqUrl] cachePolicy: NSURLRequestReloadIgnoringCacheData timeoutInterval: 10.0];
	if (!isCheckServer) {
		[req setHTTPMethod: @"HEAD"];
	}
	[req setValue: @"utf-8"            forHTTPHeaderField: @"Accept-Charset"];
	[req setValue: @"close"            forHTTPHeaderField: @"Connection"];
	[req setValue: @"CheckMyHTTPS-iOS" forHTTPHeaderField: @"User-Agent"];

	self._responseObj = [NSMutableDictionary dictionary];
	CustomURLSessionDataDelegate* delegate = [[CustomURLSessionDataDelegate alloc] initWithPlugin: self callbackId: command.callbackId responseObj: self._responseObj];

	NSURLSessionConfiguration* sessionConfig = [NSURLSessionConfiguration defaultSessionConfiguration];
	NSURLSession* urlSession = [NSURLSession sessionWithConfiguration: sessionConfig delegate: delegate delegateQueue: nil];
	[[urlSession dataTaskWithRequest: req completionHandler: ^(NSData* _Nullable data, NSURLResponse* _Nullable response, NSError* _Nullable error) {
		if (error) {
			NSString* errStr;

			if ([error.domain caseInsensitiveCompare: @"NSURLErrorDomain"] == NSOrderedSame){
				if (error.code == NSURLErrorTimedOut){
					errStr = @"TIMEOUT";
				} else if (error.code == NSURLErrorBadURL || error.code == NSURLErrorUnsupportedURL){
					errStr = @"INVALID_URL";
				} else {
					errStr = @"CANT_CONNECT";
				}
			} else {
				errStr = [NSString stringWithFormat: @"Connection error. Details: %@", [error localizedDescription]];
			}

			CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: errStr];
			[self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
			return;
		}
		
		if ((!data) || ([data respondsToSelector: @selector(length)] && [data length] == 0)) {
			[self._responseObj setValue: [NSNull null] forKey: @"data"];
		} else {
			NSString* responseBodyStr = [[NSString alloc] initWithData: data encoding: NSUTF8StringEncoding];
			[self._responseObj setValue: responseBodyStr forKey: @"data"];
		}

		CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus: CDVCommandStatus_OK messageAsDictionary: self._responseObj];
		[self.commandDelegate sendPluginResult: pluginResult callbackId: command.callbackId];
	}] resume];
	if (!urlSession){
		// NSLog(@"Error with connection");
		CDVPluginResult* rslt = [CDVPluginResult resultWithStatus: CDVCommandStatus_ERROR messageAsString: @"CANT_CONNECT"];
		[self.commandDelegate sendPluginResult: rslt callbackId: command.callbackId];
	}
}

@end
