# Restaurant Kits microsite: what is still missing

Source: `restaurant-kits-portfolio/` (built into `public/restaurant-kits/`, served at `/restaurant-kits/`).
Every placeholder in the markup carries a `data-todo="..."` attribute; grep `data-todo` in `restaurant-kits-portfolio/index.html`.

Research note: the company's real domain was **restaurantkitsuk.com** (restaurantkits.com was never theirs). The archived site is an Angular shell whose API (`api.restaurantkitsuk.com`) was never captured, so partner evidence comes from press coverage and Trustpilot reviews, not from the site itself.

## 1. Restaurant logo strip (`.brand-strip`)

28 tiles across two opposite-direction marquee rows: 26 real logos + 2 placeholder tiles.

### Placeholder tiles (`data-todo="url logo"`, monogram shown)
| Restaurant | Why a placeholder | Evidence it was a partner |
|---|---|---|
| 12:51 by James Cochran | Restaurant closed, no logo asset found (1251.co.uk dead) | restaurantonline.co.uk 2020-07-23 "Chef-restaurateurs ... Restaurant Kits online"; corecruitment.com/news/restaurant-kits |
| Fanny's Kebabs | Site dead; Wayback og:image exists at `static1.squarespace.com/.../FANNYS_KEBAB_BLK+%282%29.png` but was not downloaded | hardens.com 2021-02-12 ("available exclusively on Restaurant Kits") |

### Confirmed partners with no logo and NOT shown (add if logos are supplied)
Around the Cluck (James Cochran), Neat Burger, Supa Ya Ramen, Vegan Dough Co, The Cheese Bar ("set to feature" only), Little Viet Kitchen (Trustpilot only), The Bok Shop, Goodbirds, Andy Low n Slow, Dab Dab Wings (all Trustpilot mentions only).

### Website URLs not found (`href="#" data-todo="url"`)
Mac & Wild (closed; macandwild.com now redirects elsewhere), Pitt Cue Co. (closed), Corazón (closed), Flank (closed; flanklondon.com redirects), 12:51, Fanny's Kebabs.

### Logos in the strip and their sources
Existing from the deck (assets/partners/, 208px circle badges): gordon-ramsay, adam-handling, chef-calums-pie-kit, mac-and-wild, pitt-cue, berber-and-q, carters-of-moseley, corazon, cornerstone. Existing in repo: pizza-pilgrims (moved from assets/pizza-pilgrims-logo.png; partnership confirmed via codehospitality.co.uk "operators unite to launch Restaurant Kits platform").

Fetched (file in assets/partners/ -> source):
- holborn-dining-room.png -> https://holborndiningroom.com/wp-content/themes/hdr/img/logos/hdr-logo.png
- flank.png -> Wayback http://web.archive.org/web/20220324184349id_/https://www.flanklondon.com/wp-content/uploads/2019/11/flank-logo-new.png
- kricket.svg -> https://kricketrestaurants.com/wp-content/uploads/2026/03/KRICKET_LOGO_2024_RED-1.svg
- yum-bun.svg -> https://cdn.prod.website-files.com/63b404282ac12c31a7cfd47a/63b58729f6d3904c9735005d_221205_Yumbun_Logo_Jade_Black%202.svg
- flesh-and-buns.png -> https://www.fleshandbuns.com/wp-content/uploads/2023/11/logo-footer.png
- anglothai.png -> https://anglothai.co.uk/uploads/2024/06/AT_Seashell_Logotype_Brand-Assets_2024.svg (rendered to PNG; pale logo, shown on a dark tile)
- biffs.svg -> https://biffs.co/wp-content/uploads/2023/02/Biffs_PlantShack_Logo-POP-YELLOW.svg
- juma-kitchen.png -> https://jumakitchen.com/wp-content/themes/jumakitchenholding/img/juma-kitchen-logo.png (dark tile)
- sarap.png -> https://static.wixstatic.com/media/97691e_64a4da1d7a634d128fda94a294589828~mv2.png (white logo, dark tile)
- rola-wala.png -> https://rolawala.com/wp-content/themes/rolawala2014v2/ims/logo-2022.png
- island-poke.png -> https://www.islandpoke.com/propeller/themes/propeller/assets/img/island-poke.png
- nanny-bills.webp -> https://images.squarespace-cdn.com/content/v1/62cd524dfa36970430ec5084/4824a767-fdfd-4752-86d0-3e7c301f114b/WhiteLogo.png (white logo, dark tile)
- dirty-bones.svg -> https://dirty-bones.com/frontend/img/dirty-bones-logo.svg (off-white, dark tile)
- patty-and-bun.svg -> https://cdn.prod.website-files.com/5c501ae6db60122ed1395b19/62bb23161c6b84b668710502_PATTY%20WEB%20LOGO-01.svg
- baozi-inn.png -> https://static.wixstatic.com/media/567e44_c25fa1ef855d4c05975331e1a9465ac4~mv2.png
- som-saa.png -> https://d69uypo851qep.cloudfront.net/uploads/images/user9133/77bc04ac6404b_siteLogo.png

Evidence strength: Gordon Ramsay, Adam Handling, Holborn Dining Room/Calum Franklin, Mac & Wild, Pitt Cue, Berber & Q, Corazón, Flank, Pizza Pilgrims, Kricket, Yum Bun, Flesh & Buns, AngloThai, Biff's, JUMA, Sarap, Rola Wala are press-confirmed. Carters of Moseley and Cornerstone: deck + press "set to launch". Island Poké and Nanny Bill's: press "set to feature" only. Patty & Bun, Baozi Inn, Som Saa: Trustpilot reviews only. Logos are trademarks of their owners; confirm the restaurants are happy to be listed.

Rejected: Wagamama (its kits were a supermarket range, no RK link) and "Chef Collective" (no evidence; the file was actually a Restaurant Kits wordmark). Both files deleted. Guinness excluded (drinks brand).

## 2. Form URLs (`data-todo="form-url"`)
Two CTAs in `#contact` ("The people behind the build") are mailto placeholders:
- "Work with partnerships": `mailto:ed@restaurantkits.com?subject=Partnerships%20enquiry`
- "Work with tech team": `mailto:ed@restaurantkits.com?subject=Tech%20team%20enquiry`
Replace both hrefs with the real form URLs when they exist.

## 3. Users chart estimates (`#results`, `USERS_SERIES` in main.js)
ILLUSTRATIVE values, not from the deck. They were shaped to end at the deck's "30k+ boxes" figure and are labelled "Illustrative" on the chart. Replace with real quarterly users:

| Quarter | Users (est.) |
|---|---|
| 2021 Q1 | 1,200 |
| 2021 Q2 | 4,500 |
| 2021 Q3 | 9,800 |
| 2021 Q4 | 16,000 |
| 2022 Q1 | 23,500 |
| 2022 Q2 | 30,400 |

Update the array in `main.js` AND the `<table>` inside `.chart-table` in `index.html` (the accessible twin).

## 4. Funder logos (`.backer-chips li[data-todo="logo"]`)
Text chips only. Logos needed for: 1818 (1818 Venture Capital), Start-up Funding Club (SFC Capital), and an "EIS investors" treatment. The copy "£1.6M EIS-approved round" comes from the deck's "raising £1.6M, EIS approved": confirm whether it closed.

## 5. Trustpilot (`.trust-badge`, `data-todo="trustpilot-score"`)
- The badge is deliberately NOT a link (user decision): no href, no outbound link anywhere for it.
- Figures shown: 4.8 (investor-deck score for the trading period), 375 reviews and 87% five-star (from the live page https://uk.trustpilot.com/review/restaurantkitsuk.com, checked 2026-10-07; claimed profile October 2020).
- The LIVE page now shows a time-decayed TrustScore of 2.7 "Poor" because one 1-star review from March 2026 outweighs the old reviews; no Wayback snapshot of the 2021 page was found to prove the historical 4.8. Keep this in mind if the badge is ever linked.
- The star mark is a local inline SVG; Trustpilot's widget script is not used.

## 6. Stock images and photo licences
| Use | File | Source | Author | Licence |
|---|---|---|---|---|
| About section (chef) | assets/stock/chef-cooking.jpg | https://www.pexels.com/photo/chef-flambes-the-dish-21077136/ | Lukas Faust | Pexels License (commercial use, no attribution required) https://www.pexels.com/license/ |
| "What your box will turn into" | assets/stock/plated-dish.jpg | https://www.pexels.com/photo/cooked-meat-with-vegetable-garnish-on-white-plate-1327393/ | Rene Terp | Pexels License |
| The final course | assets/stock/table-dinner.jpg | https://www.pexels.com/photo/close-up-of-people-by-table-with-meal-6954051/ | cottonbro studio | Pexels License |

Unsplash was not used (its search endpoint now needs auth). "Stock photography via Pexels" is credited in the footer as a courtesy.

## 7. Gordon Ramsay photo attribution
- File: assets/chefs/gordon-ramsay-cc.jpg (600x600, cropped from the 853x1280 original: offset y=150, 700x700 square, resized).
- Source: https://commons.wikimedia.org/wiki/File:Gordon_Ramsay.jpg (original https://upload.wikimedia.org/wikipedia/commons/6/6f/Gordon_Ramsay.jpg), Flickr original https://www.flickr.com/photos/41061319@N00/262930800/
- Author: Dave Pullig. Licence: CC BY 2.0, https://creativecommons.org/licenses/by/2.0
- Attribution (required by CC BY 2.0) lives on the chef card itself, not in the footer (the footer is now a single line by user request): a small visible caption under the name (`.photo-credit`: "Photo: Dave Pullig, Wikimedia Commons, CC BY 2.0" with the licence linked) plus the full credit in the image `title` attribute (title, author, source, licence, "cropped and resized").
- It is a 2006 photo. A more recent free alternative is the 2018 US Air Force public-domain photo (https://commons.wikimedia.org/wiki/File:MasterChef_comes_to_March_Air_Reserve_Base_180831-F-RA446-004.jpg) but he wears sunglasses and a flight suit.
- The previous unlicensed chef photo (assets/chefs/gordon-ramsay.png) was deleted.

## 8. Hero stat changed
"£1M revenue in year one" was removed (revenue figure). Replaced with "80k+ meals shipped" (deck figure). The Trustpilot stat became the Trustpilot badge. The results heading "Nearly £1M in sales..." became "30,000 boxes into UK homes in our first 12 months." The KPI tile "17.85% margin per box" became "9 IPs secured for RKX".

## 9. Featured video (Gordon Ramsay Beef Wellington, YouTube wiHeOR0hFRk)
- Played through the YouTube IFrame API (script loaded only when the slide is reached), muted autoplay, controls/branding hidden (controls=0, modestbranding=1, rel=0, playsinline=1, iv_load_policy=3, disablekb=1), looping 1:03 to 3:00 by reloading the clip with endSeconds (loop=1 would restart from 0). Site-styled mute/unmute button over the video. Pauses when the slide is not active or the section is off screen. Reduced motion: poster + play button.
- Poster frame assets/gr-video-poster.jpg is YouTube's maxresdefault thumbnail of the video (i.ytimg.com/vi/wiHeOR0hFRk/maxresdefault.jpg); replace with an owned still if preferred.
- The iframe is scaled 1.32x inside an overflow-hidden wrapper to crop letterbox bars; adjust `.video-shell iframe { transform: ... scale(1.32) }` if too tight.

## 10. Favicon
`public/favicon.svg` (vector "R.K." in Poppins Black, outlines extracted from the Google Fonts TTF, no font dependency), `favicon-32.png`, `apple-touch-icon.png` (180px, cream background). Linked with relative paths in index.html.

## 11. Open questions for the user
1. Is 4.8 the Trustpilot score you want shown given the live page now reads 2.7? (See section 5.)
2. The users chart now covers 2021 Q1 to 2022 Q2; confirm the start quarter (the first kits shipped mid-2020).
3. Confirm the weaker partners (Island Poké, Nanny Bill's, Patty & Bun, Baozi Inn, Som Saa) should stay in the strip.
4. Which restaurants (if any) should be removed from the strip for brand-permission reasons.
5. The deck reference images (assets/partners-reference.png, rkx-got-reference.png, rkx-ip-reference.png) are unused by the site but kept as documentation. Delete if not wanted.
6. The hero image (assets/bannermai.jpg, 1.7 MB) is still the original; it could be swapped for a lighter, clearer image.
