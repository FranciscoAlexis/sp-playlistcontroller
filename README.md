sp-playlistcontroller
=====================

Spotify app and web client to control/enqueue playlists and control the player.

Instructions:
-------------

* For running the spotify app you need to set up your account for spotify apps here: https://developer.spotify.com/technologies/apps/#developer-account
* Then install the app like in this tutorial: https://github.com/spotify/apps-tutorial#installation but instead of cloning the project just copy the playlistcontrol directory located inside the sp-app directory.
* Edit the manifest.json file and add your host to the RequiredPermissions field (change the "http://playlistcontrol.dev/" to your own domain) don't use localhost or 127.0.0.1 beacuse spotify has issues with it (see this article: http://stackoverflow.com/questions/8428864/why-are-json-requests-to-my-external-api-being-cancelled-in-my-spotify-app).
* Run the app writing spotify:app:playlistcontrol on the search field. Set the client location and a playlist if you like.
* Run the web client and make sure that the json directory has write permissions and files inside php directory must have execution permission.
* Use it!