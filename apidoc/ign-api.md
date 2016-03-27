FORMAT: 1A
HOST: https://oramind.net/api/

# iGreekNews

The backend system that drives iGreekNews

# Preliminary API

NOTE: This document is a **work in progress**.

#Group Getting Articles from the database

## Leads [/leads]

Get the landing page for the mobile app

### List Leads [GET]

+ Response 200 (application/json)

        {
          "result": [
            {
              "alreadySearchedForFullText": false,
              "fullText": null,
              "subcategory": null,
              "category": {
                "displayName": "Αθλητικά",
                "name": "Αθλητικά",
                "id": "5591c4bbb8fdece921935610",
                "created": "2015-06-29T22:20:43.000Z"
              },
              "newsSource": {
                "category": "55b4b55bb8fdece9219442dc",
                "gravity": 8,
                "subcategories": [
                  "55d05cb06450266212f12588"
                ],
                "tags": [],
                "rootUrl": "http://www.gazzetta.gr/",
                "feed": "",
                "name": "Gazzetta",
                "created": "2015-08-16T09:49:13.000Z",
                "id": "55d05c99cc42a2f054838008"
              },
              "keywords": [],
              "publicationTimeStamp": 1442776260000,
              "tags": "5591c4bbb8fdece921935610",
              "description": "",
              "imageTitle": "",
              "imageUrl": "http://wcdn.gazzetta.gr/sites/default/files/styles/article_thumb_nocrop/public/article/2015-09/imagehandler_5_20.jpg?itok=5Z4MWxFz",
              "publicationDate": "2015-09-20T22:11:00.000Z",
              "feedUrl": "http://www.gazzetta.gr/rssfeeds/allnewsfeed",
              "hostName": "www.gazzetta.gr",
              "url": "http://www.gazzetta.gr/plus/article/804288/valavani-einai-mia-sovari-politiki-itta",
              "summary": "\t\t\t\r\n\tΤην παραδοχή της ήττας διατύπωσε σε δηλώσεις της η υποψήφια βουλευτής της ΛΑΕ\r\n\r\n \r\n",
              "content": "\t\t\t\r\n\tΤην παραδοχή της ήττας διατύπωσε σε δηλώσεις της η υποψήφια βουλευτής της ΛΑΕ\r\n\r\n \r\n",
              "title": "Βαλαβάνη: Είναι μια σοβαρή πολιτική ήττα",
              "id": "55ff2205cc42a2f054854125",
              "created": "2015-09-20T21:15:49.000Z"
            }
          ],
          "error": null,
          "success": true
        }    


## Articles List [/articles{?keyword}{?limit}{?from}{?before}]

### List Articles [GET]

There is no pagination

+ parameters
    + keyword (string, optional) - A keyword to search for
    + limit (number, optional) - Limit the number of results. Max: 100
    + from: `1443479996` (number, optional)  - A timestamp as number (in seconds). Posts after this timestamp will be returned
    + before: `1443479996`(number, optional) - A timestamp as number (in seconds). Posts before this timestamp will be returned

+ Response 200 (application/json)

        {
          "result": [
            {
              "alreadySearchedForFullText": false,
              "fullText": null,
              "subcategory": null,
              "category": {
                "displayName": "Πολιτική",
                "name": "Πολιτική",
                "id": "5592e608b8fdece921936b28",
                "created": "2015-06-30T18:55:04.000Z"
              },
              "newsSource": {
                "category": "5591c517b8fdece921935617",
                "gravity": 1,
                "subcategories": [
                  "55db8a301361df3b47b3e3bb",
                  "55db8a8a1361df3b47b3e3bc"
                ],
                "tags": [],
                "rootUrl": "http://www.enikos.gr/",
                "feed": "",
                "name": "Enikos.gr",
                "created": "2015-08-24T21:17:55.000Z",
                "id": "55db8a03cc42a2f05483d361"
              },
              "keywords": [
                "ΜΕΙΜΑΡΑΚΗΣ"
              ],
              "publicationTimeStamp": 1442785740000,
              "tags": "5592e608b8fdece921936b28",
              "description": "",
              "imageTitle": "",
              "imageUrl": null,
              "publicationDate": "2015-09-20T21:49:00.000Z",
              "feedUrl": "http://www.enikos.gr/feeds/menu/politics.xml",
              "hostName": "www.enikos.gr",
              "url": "http://www.enikos.gr/ekloges-2015/341098,Boylgarakhs-An-den-htan-o-Meimarakhs.html",
              "summary": "#politics",
              "content": "#politics",
              "title": "Βουλγαράκης: Αν δεν ήταν ο Μεϊμαράκης…",
              "id": "55ff2a76cc42a2f05485419a",
              "created": "2015-09-20T21:51:50.000Z"
            }
          ],
          "error": null,
          "success": true
        }  


## Articles By Category [/articles{?id}{?limit}{?populateNewsSource}{?before}]

### Articles By Category [GET]

Get articles belonging in a certain article category

+ parameters
    + id: `5591c517b8fdece921935617` (string, optional) - The category ID to return results for
    + limit: `50` (number, optional) - Limit the number of results. Max: 100
    + before: `1443479996` (number, optional)  - A timestamp as number (in seconds). Posts after this timestamp will be returned
    + populateNewsSource: `1`(boolean, optional) - If '1' then the `newsSource` element inside each object will be populated. This is expected to be somewhat slower. Use with care

+ Response 200 (application/json)

        {
          "result": [
            {
              "alreadySearchedForFullText": false,
              "fullText": null,
              "subcategory": null,
              "category": {
                "displayName": "Πολιτική",
                "name": "Πολιτική",
                "id": "5592e608b8fdece921936b28",
                "created": "2015-06-30T18:55:04.000Z"
              },
              "newsSource": {
                "category": "5591c517b8fdece921935617",
                "gravity": 1,
                "subcategories": [
                  "55db8a301361df3b47b3e3bb",
                  "55db8a8a1361df3b47b3e3bc"
                ],
                "tags": [],
                "rootUrl": "http://www.enikos.gr/",
                "feed": "",
                "name": "Enikos.gr",
                "created": "2015-08-24T21:17:55.000Z",
                "id": "55db8a03cc42a2f05483d361"
              },
              "keywords": [
                "ΜΕΙΜΑΡΑΚΗΣ"
              ],
              "publicationTimeStamp": 1442785740000,
              "tags": "5592e608b8fdece921936b28",
              "description": "",
              "imageTitle": "",
              "imageUrl": null,
              "publicationDate": "2015-09-20T21:49:00.000Z",
              "feedUrl": "http://www.enikos.gr/feeds/menu/politics.xml",
              "hostName": "www.enikos.gr",
              "url": "http://www.enikos.gr/ekloges-2015/341098,Boylgarakhs-An-den-htan-o-Meimarakhs.html",
              "summary": "#politics",
              "content": "#politics",
              "title": "Βουλγαράκης: Αν δεν ήταν ο Μεϊμαράκης…",
              "id": "55ff2a76cc42a2f05485419a",
              "created": "2015-09-20T21:51:50.000Z"
            }
          ],
          "error": null,
          "success": true
        }  


## Article Categories [/articles/rootCategories]

Get a list of categories, for displaying the menu inside a mobile application.

### Root Article Categories [GET]


+ Request Root Article Categories (application/json)


+ Response 200 (application/json)

        {
          "result": [
            {
              "displayName": "Γενικά",
              "name": "Γενικά",
              "id": "5591bddab8fdece921935501",
              "created": "2015-06-29T21:51:22.000Z"
            },
            {
              "displayName": "Οικονομία",
              "name": "Οικονομία",
              "id": "5591c4aeb8fdece92193560e",
              "created": "2015-06-29T22:20:30.000Z"
            },
            {
              "displayName": "Αθλητικά",
              "name": "Αθλητικά",
              "id": "5591c4bbb8fdece921935610",
              "created": "2015-06-29T22:20:43.000Z"
            },
            {
              "displayName": "Πολιτική",
              "name": "Πολιτική",
              "id": "5592e608b8fdece921936b28",
              "created": "2015-06-30T18:55:04.000Z"
            },
            {
              "displayName": "Κοινωνία",
              "name": "Κοινωνία",
              "id": "5592e669b8fdece921936b31",
              "created": "2015-06-30T18:56:41.000Z"
            },
            {
              "displayName": "Τεχνολογία",
              "name": "Τεχνολογία",
              "id": "55d05ba5cc42a2f054837ffb",
              "created": "2015-08-16T09:45:09.000Z"
            }
          ],
          "error": null,
          "success": true
        }    