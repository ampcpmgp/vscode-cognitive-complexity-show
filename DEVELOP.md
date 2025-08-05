# How to develop

* Open extension.js
* Input F5
* Debug

# How to publish

* package.json version update.
* READEME.md add Release Note.
* (If no AccessToken)
* Access https://dev.azure.com/ampcpmgp/_usersSettings/tokens - ampcpmgp is USER_NAME
* `vsce publish -p <ACCESS_TOKEN>`

See more details publish AccesesToken - https://code.visualstudio.com/api/working-with-extensions/publishing-extension#get-a-personal-access-token

# Links

- https://marketplace.visualstudio.com/items?itemName=ampcpmgp.cognitive-complexity-show