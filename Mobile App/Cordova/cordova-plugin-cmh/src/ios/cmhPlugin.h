#import <Foundation/Foundation.h>
#import <Cordova/CDVPlugin.h>

@interface cmhPlugin : CDVPlugin

- (void)openHTTPSRequest:(CDVInvokedUrlCommand*)command;

@end
