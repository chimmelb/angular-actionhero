#Example

Create a new actionhero project:

```
npm init
npm install actionhero --save
./node_modules/.bin/actionhero generate
npm install
mv /public/index.html /public/ah.html
```


Copy the files from `/example` (except this `readme.md`) to the actionhero project's `/public` directory.

Run the actionhero server:

```
npm start
```

Navigate a browser to [localhost:8080](localhost:8080) and another to [localhost:8080/chat.html](localhost:8080/chat.html)

This example should be running, and messages you type into the default chat page will appear on this page. When you stop the actionhero server, `Connected? true` will change to `Connected? false`.