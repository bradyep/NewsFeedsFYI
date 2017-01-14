# REST Calls

Let's just try to stick with generic REST services and make use of those getKeys calls (Users only get keys they are authorized for on these calls)

* All REST calls should **consider a user as either: guest, user, admin**
  * Most REST calls will start off by determining this and then using a switch statement
  * admin should NOT be able to view the single-page app since their GETs will be so big
    * I think we can hold off an any admin functionality for now

There's nothing 'un-RESTful' about containing either lots or very little data with each request. GET a page? Return EVERYTHING that that page needs to function

Also don't be afraid to add qualifiers in the routes that differentiate the REST calls

allow = get generic for guest, authorize for user
auth = Do not allow for guest, authorize for user, just do it for admin

## 1. View Page
#### Get Links 
* /links -> GET -> allow
* If we don't have them yet (front end can handle this)

#### Get All Pages 
* /pages -> GET -> allow
* If we don't have them yet 
* Just the Pages objects for current User so we can show picker

#### Get Entire Page 
* /pages/:id -> GET -> allow
* this grabs all UserFeeds+FeedSources+CachedNewsItems for the specified page
  * I wonder if it might be better to do this asynchonously so the User sees their page populate with feeds one-by-one
  * If we went this route, we could just display the out-dated data until the request came back 
  * Also, this REST request would just return a list of UserFeeds
  * So this basically grabs all the cached data and then once it arrives, the client looks for out-dated feeds and calls
  * /userfeeds:id to update them 
  * There should probably be some visual indication that a feed is being updated

## 2. Page Lifecycle
* For a NewsFeed that gets old on the User's screen we need GET UpdatedNewsFeed
* /userfeeds/:id -> GET -> allow
* This will return an object built from FeedSources and CachedNewsItems

## 3. User-Driven Events

### User Account

#### User Creates Account
* /users -> POST -> allow
* creates new User (verify all the info passed and create new User in DB)
  * Deny a logged-in user attempting to make a new account, they must log off to do this
* On front-end, if this was successful, then sign them in with their new account

#### User Logs In
* /authenticate -> POST -> allow
* Use the backend CheckCredentials method
* guest and user should do this normally, we need a separate process for admin

#### User Signs Out
* /logout -> GET
* Maybe reload the page on the front-end? 

### Pages

#### Delete Page
* /pages:id -> DELETE -> auth
* Delete all child UserFeeds (use ON DELETE CASCADE?)

#### Create Page
* /pages -> POST -> auth
* Handle DisplayOrder

#### Reorder Page
* /pages/:id -> UPDATE -> auth 
* Handle both affected pages

#### Rename Page
* /pages/:id -> UPDATE -> auth

### User Feeds

#### Add Feed
* /userfeeds -> POST -> auth
  * then /userfeeds:id -> GET -> allow
* After we create the page we will have to check and work with the FeedSources and probably return the UserFeed to the client

#### Change Feed (Move to Page, Reordering, Update data)
* /userfeeds:id -> UPDATE -> auth
* For reordering, handle both affected UserFeeds

#### Remove Feed
* /userfeeds:id -> DELETE -> auth
* Do not touch FeedSources)