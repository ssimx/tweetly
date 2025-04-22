# tweetly
### Video Demo: https://youtu.be/qUnlPEq49bY
### Images: https://imgur.com/a/zHOiyAa
### Website: https://tweetly-ten.vercel.app/ (takes a minute to wake up from inactivity)
### System design: https://web.goodnotes.com/s/58RlIPiGS5jhpxYizHslP3#page-1

### Description:
Tweetly is a modern social media application that replicates X's (formerly known as Twitter) core functionality while showcasing advanced web development techniques. Built with a full stack tech, this application delivers a responsive, real-time social experience across all devices.


## Technical Stack

### Backend:
* Node.js with Express.js
* TypeScript for type safety
* PostgreSQL database
* Prisma ORM for database operations
* JWT authentication for secure and scalable solution using Passport.js
* Self implemented authorization
* Socket.io for real-time interactions
* Multer for file upload handling
* Cloudinary API for image storage
* Zod for form validation
* Custom NPM package (tweetly-shared) for cross-environment type sharing

**Architecture:**
The backend implements a structured, layered architecture with several key components:

*Response Handling*
* Custom response handler logic for uniform API responses across the application
* AppError class extending the standard Error class with structured error information
* Typed response interface with SuccessResponse<T> (success: true, data) and ErrorResponse (success: false, error)
* Unified ApiResponse<T> type that represents either response type
* Dedicated error handler middleware to process and format errors properly when passed via next(err)

*Authentication & Authorization*
* Passport JWT strategy for session validation with middleware
* Authorization checks within controllers for protected routes/actions

*Request Processing Pipeline*
* Controller layer for handling form validation using Zod, authorization and other logic
* Service layer for database interactions via Prisma ORM
* Proper error handling throughout the pipeline

*Media Management*
* Multer middleware for image upload validation
    - Controls maximum image count
    - Checks image size limits
    - Validates acceptable formats

*Code Sharing Strategy*
* Custom NPM package (tweetly-shared) to share:
    - TypeScript interfaces and types
    - Zod validation schemas
    - Helper functions
    - Response handler types
* This creates a single source of truth between frontend and backend

**This architecture demonstrates best practices including:**
* Separation of concerns
* Type safety across the full stack
* Consistent error handling
* Centralized validation
* Efficient resource management
* DRY (Don't Repeat Yourself) principles through shared code

**Database Design - models**
* TemporaryUser: *Stores information for users that haven't finished the multi-step registration process*
* User: *Clones temporary user information after registration process is completed, with few additional attributes*
* Profile: *Stores user's profile information such as profileName, bio, website, location and user/banner picture*
* Follow: *Manages follower/followee relationship to display who is following whom*
* Block: *Manages blocker/blocked relationship to display who blocked whom*
* PushNotification: *Manages reciever/notifier relationship to display who has notifications enabled for whom*
* NotificationType: *Stores different types of notifications such as FOLLOW, POST, REPLY, LIKE, REPOST*
* Notification: *Stores notification information that should be shown to the receiver*
* Post: *Stores user's content which supports text, images, and metadata like pinned status, isDeleted, author*
* Hashtag: *Extracts hashtags from posts and stores in this model to display trending analytics*
* Repost: *Manages post/user relationship to display who reposted which post*
* Like: *Manages post/user relationship to display who liked which post*
* Bookmark: *Manages post/user relationship to display who bookmarked which post*
* Conversation: *Manages private messaging between users*
* ConversationParticipant: *Connects conversation with user*
* Message: *Stores individual messages within conversations with read receipt tracking.*

The schema includes proper relationships between entities and appropriate indexes for query optimization.


### Frontend:
* Next.js React framework
* TypeScript for type safety
* Tailwind CSS for responsive styling
* Context API for managing various comprehensive states across the app
* Reducer API for deeper prop drilling where post author various states have to updated
* Callback API for optimized re-rendering
* Server actions & api route handler for fetching backend data
* Middleware for /login and /signup pages to redirect if already signed in
* 99 components
* Socket.io for real-time interactions
    - new feed post
    - new notification
    - new message
    - typing indicator inside conversation
    - new message inside conversation
    - seen status inside conversation
* React Hook Form for handling forms
* Zod for handling form validation
* Croppie for cropping profile user/banner image
* Pull to refresh for refreshing the feed with pull gesture on mobile devices
* Spinners for loading data
* Intersection observer for infinite scroll


## Key Features

### Authentication:
* Email/username and password signup/login with secure JWT implementation
* Account security with password hashing

### Post Management:
* Create posts with text and/or images
* Delete or pin posts to profile
* Reply to posts, creating threaded conversations
* Repost, like, and bookmark functionality
* Shareable post URLs via share button

*Seamless Post Interaction Synchronization (context provider)*
If post appears in many different places, actions such as repost/like/bookmark/block author, are dynamically applied across all interface elements in real time.

### User Interactions:
* Toggle follow/block
* Toggle push notifications
* Direct message user

*Seamless User Interaction Synchronization (context provider)*
When a logged-in user follows, unfollows, or blocks another user, these changes are instantly reflected everywhere that this user appears

### Feed System:
* Global feed for all posts
* Following feed for personalized content
* Display new posts in real time via WebSockets
* Pull-to-refresh functionality on mobile devices
* Trending hashtags sidebar based on post content

### Post Images:
* Interactive image modal displays post details alongside the image
* Parallel routes implementation prevents full page reloads

### Navigation & UI:
* Responsive design adaptable to all screen sizes
* Desktop sidebar navigation
* Mobile-optimized swipe gestures for sidebar access
* Smart bottom navbar on mobile that responds to scroll direction

### Search Functionality:
* Search for users, hashtags, and post content

### Notifications:
* Comprehensive notification system for follows, replies, likes, and reposts
* Push notification preferences for each followed user

### Messaging System:
* Real-time conversations with typing indicators
* Read receipts for messages
* Image sharing in conversations
* Conversation list with unread indicators

### Profile Management:
* Customizable profiles with editable banner and profile pictures
* Image cropping functionality for perfectly sized images
* Profile stats and tabbed post views (Posts, Replies, Media)
* Private likes tab for the logged-in user

### Settings & Personalization:
* Secure account settings behind password confirmation (settings JWT with expiration)
* Username, email, and password change options
* Theme customization with multiple color schemes and background options

### Advanced Technical Implementations:
* Infinite scroll pagination throughout the application
* Context providers for real-time state management
* Dynamic content filtering (blocked users' content immediately hidden)
* JWT with secure expiration handling