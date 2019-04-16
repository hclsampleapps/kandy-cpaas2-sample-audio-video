# kandy-cpaas2-audio-video

### Audio Video chat app

This app is used to create communication channel between two users via Voice/Video APIs.

#### Steps 

1. Create an account on **AT&T** portal.
2. If you are an existing user, please [Log in to AT&T API Marketplace](https://apimarket.att.com/login)
3. Open two instances of ```index.html``` in the browser for user1 and user2.
4. Choose to get accessToken by Password Grant flow or Client Credentials flow.
5. For Password Grant flow, enter 
   - *clientId* 
   - *emailId* 
   - *password*  
6. For Client Credentials Grant flow, enter	
   - *privateKey*
   - *privateSecret*   
6. Do steps #4,#5,#6 on both browser tabs.
7. After successful login you will get an *accessToken* for Project/User on both tabs.
8. Click "Subscribe" button in both the browser windows to create the webrtc channel.
9. Enter the user2's User ID into the user1's browser window "Make Call" box; e.g., sip:janedoe@somedomain.com (sip:[userId]@[domain]) or you may also call the TN in the E164 format sip:+12223334444@domain
10. Select the "with video" check box to make video call or uncheck for voice call.
11. On second user's window you will find an incoming call, now click on "Answer Call" to answer the call or "Reject Call" to reject the call.
12. After selecting "Answer Call", the call is started and the remote view and local view can be checked.
13. To end the conversation, you can click the "End Call" button.

### Development

To setup the project repository, run these commands

```
git clone https://github.com/hclsampleapps/kandy-cpaas2-audio-video.git
cd kandy-cpaas2-audio-video
```

Then, open ```index.html``` in the browser to view the app.

#### Branching strategy

To learn about the branching strategy, contribution & coding conventions followed in the project, please refer [GitFlow based branching strategy for your project repository](https://gist.github.com/ribbon-abku/10d3fc1cff5c35a2df401196678e258a)
