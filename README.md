# W22_CIS3760_Team8 Sprint 9

In this sprint, we were tasked with visually highlighting the impacts of dropping a course. When we click on that dropped course, related courses will change to the color red that people can not take it. We also add two new features, which are suggestive text when doing a search, and changing the theme to dark mode.

To retrieve all updated developed code from git using the VM
```console
git checkout Sprint7
git pull
```

To install the necessary dependencies for the NextJS project
```console
npm install
```

To run the NextJS project locally
```console
npm run dev
```

To update the server on the VM
```console
pm2 delete website (this will delete the current instance of pm2)
pm2 list (should show no instances of pm2 running)
pm2 start --name website npm -- start (will create a new instance of pm2 with the name of "website")
sudo systemctl reload nginx.service (will reload the NGINX service with the new pm2 instance)
```
After completing the above, the server at the link http://131.104.49.107 will have the updated code


Before you run the install script:
```console
sudo wget http://nginx.org/keys/nginx_signing.key
sudo apt-key add nginx_signing.key
cd /etc/apt
```

Add this text to the end of the sources.list file:
```console
deb http://nginx.org/packages/ubuntu focal nginx
deb-src http://nginx.org/packages/ubuntu focal nginx
```

"Note: The focal keyword in each of these lines corresponds to Ubuntu 20.04. If you are using a different version of Ubuntu, substitute the first word of its release code name (for example, bionic for Ubuntu 18.04)."

Source: https://www.nginx.com/blog/setting-up-nginx/

To run the install script:
```console
sudo chmod +x install.sh
sh install.sh
```
To start the web server use:
```console
sudo systemctl start nginx.service

Open http://131.104.49.107 to view the frontend it in the browser.
```

To see the status of the web server:
```console
sudo systemctl status nginx.service
```

To stop and then start the service again:
```console
sudo systemctl restart nginx.service
```

To stop the web server:
```console
sudo systemctl stop nginx.service
```

If you are only making configuration changes, Nginx can often reload without dropping connections:
```console
sudo systemctl reload nginx.service
```

## ESLint
To run ESLint on the project:
```console
npm run lint
```
## Automated Test
To run the unit test
```console
npm run test
```
To run the unit test for specifc page
```console
npm run test GraphDegreeTest.spec.js
npm run test GraphSubjectTest.spec.js
npm run test NavBarTest.spec.js
npm run test OnlineTest.spec.js
npm run test SearchTest.spec.js
npm run test WelcomeTest.spec.js

```
