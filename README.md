# booking-filter-out
Local list.
Browse results on booking.
Click add visible hotels.
Change filter.
Click Copy non-excluded hotels to copy the currently enabled visible hotels.
Click Exclude added hotels and the added hotels become grayed out.

This is a Chromium + Firefox extension.
To use it:
1. git clone this project.
2. open your extensions page (Chrome/Edge: `chrome://extensions`, Firefox: `about:debugging#/runtime/this-firefox`).
3. enable developer mode.
4. load unpacked (Chromium) or load temporary add-on and pick `manifest.json` (Firefox).
5. open booking.com.
6. search for a location and dates; control panel appears top-right.

Initially developed to filter out all hotels that accept animals so only the ones that forbid them are "enabled"...

## Mobile (phone/tablet)

No extension install needed — works on iOS Safari, Android Chrome, Firefox, and more.

1. Open the install page on your phone: [mobile.html](https://fabian20ro.github.io/booking-filter-out/mobile.html)
2. Tap **"Copy bookmarklet to clipboard"**
3. Create any bookmark in your browser, then **edit** it and **paste** the copied code as the URL
4. Go to booking.com, search for a location, then open your bookmarks and tap **"Hotel Filter"**
5. A toolbar appears at the bottom of the screen with the same 4 actions, including **Copy non-excluded hotels**

Detailed step-by-step instructions for each browser are on the install page.
