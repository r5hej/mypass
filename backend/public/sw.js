"use strict";var precacheConfig=[["/assets/favicon.ico","3ac5c19387a60f45c022d1194e1141df"],["/assets/icons/android-chrome-192x192.png","403b90afaaea4d02404a45a675eaa8d4"],["/assets/icons/android-chrome-512x512.png","958e122534938d48f031b308f48fbb38"],["/assets/icons/apple-touch-icon.png","4103380d9163888f288b8db868598071"],["/assets/icons/browserconfig.xml","d2c3ec839559c9b7c7638c378d45bca5"],["/assets/icons/favicon-16x16.png","6c28f4faffff90f5e2d3f66963f3e1a4"],["/assets/icons/favicon-32x32.png","7dcfa7cc079863cb1a8599ee5ec6f3cd"],["/assets/icons/favicon.ico","3ac5c19387a60f45c022d1194e1141df"],["/assets/icons/mstile-150x150.png","445b52f74d991e59e86c9a1224b0075e"],["/assets/icons/safari-pinned-tab.svg","f8501cd76197aebfc3fee6a98bd30eaf"],["/assets/icons/site.webmanifest","2151d773a568f15076ace9e8a56f771c"],["/assets/wordlist/danish.txt","214a11e9380f0255b220c0bb8246a67f"],["/assets/wordlist/english.txt","ec2678f3a53afadfd099688828c0ed83"],["/bundle.4f4b2.js","5c01ea4a170f96b56bccff7eaf8dfae3"],["/favicon.ico","3ac5c19387a60f45c022d1194e1141df"],["/index.html","4bcfb6eee52c7476aaa6e459e8638654"],["/manifest.json","5d12291c33369d51f17c04e35290f176"],["/route-home.chunk.0c8bb.js","29ca1cb66e71cf8bc7916f5bc824b089"],["/route-login.chunk.8ba99.js","ed54e5f73bb94f7c0acd58cd0ce6887e"],["/route-register.chunk.a15eb.js","956c523811d7d294e3b8697a411fbf76"],["/style.8c454.css","91d96e5e2266d9d52b663be4f6b16b23"]],cacheName="sw-precache-v3-sw-precache-webpack-plugin-"+(self.registration?self.registration.scope:""),ignoreUrlParametersMatching=[/^utm_/],addDirectoryIndex=function(e,n){var t=new URL(e);return"/"===t.pathname.slice(-1)&&(t.pathname+=n),t.toString()},cleanResponse=function(e){return e.redirected?("body"in e?Promise.resolve(e.body):e.blob()).then(function(n){return new Response(n,{headers:e.headers,status:e.status,statusText:e.statusText})}):Promise.resolve(e)},createCacheKey=function(e,n,t,a){var s=new URL(e);return a&&s.pathname.match(a)||(s.search+=(s.search?"&":"")+encodeURIComponent(n)+"="+encodeURIComponent(t)),s.toString()},isPathWhitelisted=function(e,n){if(0===e.length)return!0;var t=new URL(n).pathname;return e.some(function(e){return t.match(e)})},stripIgnoredUrlParameters=function(e,n){var t=new URL(e);return t.hash="",t.search=t.search.slice(1).split("&").map(function(e){return e.split("=")}).filter(function(e){return n.every(function(n){return!n.test(e[0])})}).map(function(e){return e.join("=")}).join("&"),t.toString()},hashParamName="_sw-precache",urlsToCacheKeys=new Map(precacheConfig.map(function(e){var n=e[0],t=e[1],a=new URL(n,self.location),s=createCacheKey(a,hashParamName,t,!1);return[a.toString(),s]}));function setOfCachedUrls(e){return e.keys().then(function(e){return e.map(function(e){return e.url})}).then(function(e){return new Set(e)})}self.addEventListener("install",function(e){e.waitUntil(caches.open(cacheName).then(function(e){return setOfCachedUrls(e).then(function(n){return Promise.all(Array.from(urlsToCacheKeys.values()).map(function(t){if(!n.has(t)){var a=new Request(t,{credentials:"same-origin"});return fetch(a).then(function(n){if(!n.ok)throw new Error("Request for "+t+" returned a response with status "+n.status);return cleanResponse(n).then(function(n){return e.put(t,n)})})}}))})}).then(function(){return self.skipWaiting()}))}),self.addEventListener("activate",function(e){var n=new Set(urlsToCacheKeys.values());e.waitUntil(caches.open(cacheName).then(function(e){return e.keys().then(function(t){return Promise.all(t.map(function(t){if(!n.has(t.url))return e.delete(t)}))})}).then(function(){return self.clients.claim()}))}),self.addEventListener("fetch",function(e){if("GET"===e.request.method){var n,t=stripIgnoredUrlParameters(e.request.url,ignoreUrlParametersMatching),a="index.html";(n=urlsToCacheKeys.has(t))||(t=addDirectoryIndex(t,a),n=urlsToCacheKeys.has(t));var s="index.html";!n&&"navigate"===e.request.mode&&isPathWhitelisted(["^(?!\\/__).*"],e.request.url)&&(t=new URL(s,self.location).toString(),n=urlsToCacheKeys.has(t)),n&&e.respondWith(caches.open(cacheName).then(function(e){return e.match(urlsToCacheKeys.get(t)).then(function(e){if(e)return e;throw Error("The cached response that was expected is missing.")})}).catch(function(n){return console.warn('Couldn\'t serve response for "%s" from cache: %O',e.request.url,n),fetch(e.request)}))}});