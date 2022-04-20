# General Information
Utilizing NextJS allows us to create a full-stack web-application with a React front-end and backend with NextJS's built in REST API.

# Directories:
./.next contains the production build which is an optimized version of the developed code created using "npm run build"

./components contains various react functional components that is used in the front-end

./context contains the width context component that stores and sends the screens current width to the different react components in the front-end

./data contains various scraped data from the University of Guelph and University of British Columbia that is used in the web-application

./node_modules contain various npm packages required to run the web-application. Requires "npm install" to be ran to download all node_modules prior to running the application aas they are not pushed onto git

./pages contains the different pages on our web-application (ex: search.js corresponds to link/search on our web-application). The _app.js and _document.js files are created to 
change hidden components in NextJS
./pages/api holds the different backend API routes that can be called

./public contains various front-end components that is needed by NextJS

./src contains various functions that is called in the backend and come from previous sprint deliverables

# Locally Hosting
Running "npm install" will install all dependencies necessary to run the web-application
Running "npm run dev" from the root directory will run the web-application on localhost:3000 unless that port is currently in use which NextJS will prompt the user to use a different port