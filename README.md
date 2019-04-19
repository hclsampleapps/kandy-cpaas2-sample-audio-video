# kandy-cpaas2-audio-video

### Audio Video chat app

This app is used to create communication channel between two users via Voice/Video APIs.

 - Try the [demo](https://hclsampleapps.github.io/kandy-cpaas2-sample-audio-video/app/)
 - Get the [source code](https://github.com/hclsampleapps/kandy-cpaas2-sample-audio-video)

#### User manual 

1. Create an account on **AT&T** portal via [Register now for a free account](https://apimarket.att.com/signup).
2. Open 2 instances of `index.html` in the browser for *User1* and *User2*.
3. Enter the *server URL*, for e.g.,
	- For AT&T API Marketplace [apimarket.att.com](https://apimarket.att.com), enter `https://oauth-cpaas.att.com`
4. Choose to get accessToken by *Password Grant* flow or *Client Credentials* flow.
5. Login using two different users' credentials in both the browser windows.
6. For **Password Grant** flow, enter 
	- *clientId* 
	- *emailId* 
	- *password*  
7. For **Client Credentials Grant** flow, enter
	- *privateKey*
	- *privateSecret*   
8. Click ***Login***
9. After successful login you will get an *accessToken* for Project/User on both tabs.
10. Click ***Subscribe*** button in both the browser windows to create the webrtc channel.
11. Enter the *User2*'s User ID into the *User1*'s browser window in the input field under ***Make Call*** section; e.g., sip:janedoe@somedomain.com (sip:[userId]@[domain]) or you may also call the TN in the E164 format sip:+12223334444@domain
12. Select the *with video* check box to make video call or uncheck for voice call.
13. On *User2*'s window you will find an incoming call, now click on ***Answer Call*** button to answer the call or ***Reject Call*** button to reject the call.
14. After selecting ***Answer Call***, the call is started and the remote view and local view can be checked.
15. To end the conversation, you can click ***End Call*** button.

##### Notes

 - Existing user can confirm their account via [Log in to AT&T API Marketplace](https://apimarket.att.com/login)
 - You can download *kandy.js* from [Developer documentation - SDKs](https://apimarket.att.com/developer/sdks/javascript)

### Development

To setup the project repository, run these commands

```
git clone https://github.com/hclsampleapps/kandy-cpaas2-audio-video.git
cd kandy-cpaas2-audio-video
```

Then, open ```index.html``` in the browser to view the app.

#### Branching strategy

To learn about the branching strategy, contribution & coding conventions followed in the project, please refer [GitFlow based branching strategy for your project repository](https://gist.github.com/ribbon-abku/10d3fc1cff5c35a2df401196678e258a)
