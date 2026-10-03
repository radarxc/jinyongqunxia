// Optional macOS screenshot/check helper; not loaded by the HTML sample.
// Build: clang -Wno-deprecated-declarations -fobjc-arc -framework Cocoa -framework WebKit capture.m -o /tmp/tianshu-capture
// Run: /tmp/tianshu-capture /absolute/scene.html WIDTH HEIGHT /absolute/output.png [map|town|battle|bag|martial|character|codex|journal|system]
// Uses system WebKit, local assets in memory and system font fallback, without network or persistent web storage.
#import <Cocoa/Cocoa.h>
#import <WebKit/WebKit.h>
@interface Snapshotter : NSObject<WebFrameLoadDelegate,WebResourceLoadDelegate>
@property WebView *view;
@property NSString *output;
@property NSString *screen;
@end
@implementation Snapshotter
- (NSURLRequest *)webView:(WebView *)sender resource:(id)identifier willSendRequest:(NSURLRequest *)request redirectResponse:(NSURLResponse *)redirectResponse fromDataSource:(WebDataSource *)dataSource {
 return [@[@"data",@"about"] containsObject:request.URL.scheme] ? request : nil;
}
- (void)webView:(WebView *)sender didFailLoadWithError:(NSError *)error forFrame:(WebFrame *)frame { NSLog(@"load failed %@",error); }
- (void)webView:(WebView *)sender didFinishLoadForFrame:(WebFrame *)frame {
 if (frame != sender.mainFrame) return;
 NSString *checks = @"JSON.stringify((()=>{const failures=[],screens=[]; for(const input of document.querySelectorAll('input[name=screen]')){input.checked=true;const visible=[...document.querySelectorAll('.screen')].filter(x=>getComputedStyle(x).display!=='none');if(visible.length!==1)failures.push(input.id+':screen count');if(document.documentElement.scrollWidth>innerWidth)failures.push(input.id+':horizontal overflow');for(const x of document.querySelectorAll('.folio-body')){if(x.clientWidth&&x.scrollWidth>x.clientWidth+1)failures.push(input.id+':folio overflow')}for(const x of document.querySelectorAll('label,summary')){const r=x.getBoundingClientRect();if(r.width&&r.height&&(r.width<44||r.height<44))failures.push(input.id+':small target '+(x.htmlFor||x.tagName))}const folio=visible[0]?.querySelector('.folio');if(folio&&folio.getBoundingClientRect().bottom>document.querySelector('.toolbar').getBoundingClientRect().top)failures.push(input.id+':toolbar overlap');screens.push(input.id)}const broken=[...document.images].filter(x=>!x.complete||!x.naturalWidth).length;if(broken)failures.push('broken images:'+broken);return{viewport:[innerWidth,innerHeight],screens,failures,hasSelector:CSS.supports('selector(:has(*))'),fonts:'system fallback',images:document.images.length}})())";
 NSString *result=[self.view stringByEvaluatingJavaScriptFromString:checks];
 printf("%s\n",result.UTF8String);
 NSData *json=[result dataUsingEncoding:NSUTF8StringEncoding];
 NSDictionary *report=[NSJSONSerialization JSONObjectWithData:json options:0 error:nil];
 if(!report || [report[@"failures"] count] || ![report[@"hasSelector"] boolValue]) exit(1);
 NSArray *screenJSON=@[self.screen];
 NSData *screenData=[NSJSONSerialization dataWithJSONObject:screenJSON options:0 error:nil];
 NSString *screenText=[[NSString alloc]initWithData:screenData encoding:NSUTF8StringEncoding];
 [self.view stringByEvaluatingJavaScriptFromString:[NSString stringWithFormat:@"document.getElementById(%@[0]).checked=true",screenText]];
 dispatch_after(dispatch_time(DISPATCH_TIME_NOW,200*NSEC_PER_MSEC),dispatch_get_main_queue(),^{
  NSView *document=self.view.mainFrame.frameView.documentView;
  [document display];
  NSBitmapImageRep *bitmap=[document bitmapImageRepForCachingDisplayInRect:self.view.bounds];
  [document cacheDisplayInRect:self.view.bounds toBitmapImageRep:bitmap];
  NSData *data=[bitmap representationUsingType:NSBitmapImageFileTypePNG properties:@{}];
  if(![data writeToFile:self.output atomically:YES]){NSLog(@"write failed");exit(1);}
  printf("captured %ld x %ld: %s\n",(long)bitmap.pixelsWide,(long)bitmap.pixelsHigh,self.screen.UTF8String);exit(0);
 });
}
@end
int main(int argc,const char *argv[]) {
 @autoreleasepool {
  if(argc<5)return 2;
  NSApplication *app=[NSApplication sharedApplication];
  [app setActivationPolicy:NSApplicationActivationPolicyProhibited];
  NSRect frame=NSMakeRect(0,0,atof(argv[2]),atof(argv[3]));
  NSWindow *window=[[NSWindow alloc]initWithContentRect:frame styleMask:NSWindowStyleMaskBorderless backing:NSBackingStoreBuffered defer:NO];
  Snapshotter *capture=[Snapshotter new];
  capture.view=[[WebView alloc]initWithFrame:frame];
  capture.view.preferences.privateBrowsingEnabled=YES;
  capture.view.preferences.cacheModel=WebCacheModelDocumentViewer;
  capture.output=[NSString stringWithUTF8String:argv[4]];
  capture.screen=argc>5?[NSString stringWithUTF8String:argv[5]]:@"map";
  capture.view.frameLoadDelegate=capture;
  capture.view.resourceLoadDelegate=capture;
  window.contentView=capture.view;
  NSURL *input=[NSURL fileURLWithPath:[NSString stringWithUTF8String:argv[1]]];
  NSString *html=[NSString stringWithContentsOfURL:input encoding:NSUTF8StringEncoding error:nil];
  NSString *css=[NSString stringWithContentsOfURL:[input.URLByDeletingLastPathComponent URLByAppendingPathComponent:@"style.css"] encoding:NSUTF8StringEncoding error:nil];
  html=[html stringByReplacingOccurrencesOfString:@"<link rel=\"stylesheet\" href=\"style.css\">" withString:[NSString stringWithFormat:@"<style>%@</style>",css]];
  NSRegularExpression *fonts=[NSRegularExpression regularExpressionWithPattern:@"<link[^>]+https:[^>]+>" options:0 error:nil];
  html=[fonts stringByReplacingMatchesInString:html options:0 range:NSMakeRange(0,html.length) withTemplate:@""];
  NSURL *imgdir=[input.URLByDeletingLastPathComponent URLByAppendingPathComponent:@"img"];
  for(NSURL *file in [[NSFileManager defaultManager]contentsOfDirectoryAtURL:imgdir includingPropertiesForKeys:nil options:0 error:nil]) {
   NSString *ref=[@"img/" stringByAppendingString:file.lastPathComponent];
   if(![file.pathExtension isEqualToString:@"webp"]||![html containsString:ref])continue;
   NSString *encoded=[[NSData dataWithContentsOfURL:file]base64EncodedStringWithOptions:0];
   html=[html stringByReplacingOccurrencesOfString:ref withString:[@"data:image/webp;base64," stringByAppendingString:encoded]];
  }
  [capture.view.mainFrame loadHTMLString:html baseURL:nil];
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW,15*NSEC_PER_SEC),dispatch_get_main_queue(),^{NSLog(@"timed out");exit(1);});
  [app run];
 }
 return 0;
}
