LOVEHUDDLE — BLOG/JOURNAL TEMPLATE
=====================================
Prepared for: LoveHuddle Ltd
File: lovehuddle-journal.html

HOW TO OPEN & VIEW
-------------------
1. Open Chrome (or any modern browser)
2. Drag and drop lovehuddle-journal.html into the browser
3. The full design loads — no internet required
4. To view the code: right-click anywhere > View Page Source
5. Resize the browser window to see mobile layout kick in

WHAT'S INCLUDED
----------------
- Full blog/journal page layout
- Mobile responsive (works on all screen sizes)
- Featured post section
- Article card list with video/quiz badges
- Sidebar widgets (launch status, founder, safety, topics, newsletter)
- Full single post example (hero image, body text, inline photo, video embed, quiz, safety panel, share row)
- Quiz interaction (JavaScript included)
- Category pill filter (JavaScript included)
- Footer

RECOMMENDED STACK (from notes in the HTML)
--------------------------------------------
CMS:      Ghost (ghost.org)
Frontend: Next.js connected to Ghost via Content API
Host:     Ghost(Pro) or self-host (DigitalOcean / Render)
Domain:   blog.lovehuddle.com

WHERE TO SWAP IN REAL CONTENT
-------------------------------
Search the HTML for "PROGRAMMER NOTE" — each one tells you exactly
what to replace (images, video URLs, etc.)

IMAGES
-------
Replace emoji placeholders with:
  <img src="your-image.jpg" style="width:100%;height:100%;object-fit:cover">

VIDEO
------
Ghost CMS: paste YouTube/Vimeo URL into Embed card in editor
Next.js:   use react-player or standard iframe with YouTube embed URL

QUIZ
-----
Option A: Typeform embed — paste code into Ghost HTML card
Option B: Custom React component in Next.js
Option C: Outgrow.co or involve.me embed

NEWSLETTER
-----------
Ghost has built-in newsletter + memberships
Or connect Mailchimp / ConvertKit via Zapier

SECURITY NOTES
---------------
- Use Cloudflare in front of everything (SSL, WAF, DDoS protection)
- Never expose Ghost Admin publicly — use VPN or IP whitelist
- Enable 2FA on Ghost admin
- Keep Ghost + Node.js updated
- Rate-limit newsletter signup endpoints

CSS DESIGN TOKENS (colours, fonts)
------------------------------------
All variables are at the top of the <style> block:
  --amber, --coral, --ember, --safe-green etc.
Copy these into your global stylesheet.

FONTS USED
-----------
Playfair Display (headings) — loaded from Google Fonts
DM Sans (body) — loaded from Google Fonts

© 2026 LoveHuddle Ltd. All rights reserved.
