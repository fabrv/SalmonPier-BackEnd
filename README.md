# SalmonPier-BackEnd [![Build Status](https://travis-ci.org/fabrv/SalmonPier-BackEnd.svg?branch=master)](https://travis-ci.org/fabrv/SalmonPier-BackEnd)
Node and Socket.io backend for [SalomPier](https://github.com/fabrv/SalmonPier)

SalmonPier (temp. name) is an app for data collection in field. We hope to help researchers with a pretty, light-weight, and easy to use app that will make data collection easier, faster and more reliable. Every step of the project is made with extensive usability testing with the aim to make it as intuitive as possible.

## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development.

### Prerequisites
[Install Node.js](https://nodejs.org/en/download/), make sure you install the LTS version.
To verify you have succesfully installed node run this on the terminal (or console).
```
node -v
```

### Installing
The first step for setting the dev enviorment is installing all the npm dependecies of the application, this can be done simply by navigating to the app directory in the terminal (or console) and running this command
```
npm install
```
Great! Once that's finish you are all set to start. This software is under **GNU GENERAL PUBLIC LICENSE** so any change you make must be distributed under this same license.
Alright!, now give the app a run with the command
```
node app.js
```

### Usage
URL | GET | POST
--- | --- | ----
http://*address*/forms/ | **Lists** all question with the form code passed as parameter, route `forms/:number`. | **Adds** elements to collection forms. Must pass JSON object through paramter as string, route `forms/:object`.

The app works with its frontend companion ["SalmonPier"](https://github.com/fabrv/SalmonPier) and a working database.
This is the database structure I use on my local enviroment:
![Database Structure](https://github.com/fabrv/SalmonPier-BackEnd/blob/master/dbStructureDiagram.png)

## Built With
* [NodeJS](https://nodejs.org/en/download/)
* [Express](https://expressjs.com/)

## Contributing

Please read [CONTRIBUTING.md](#) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors
* **Fabrizzio Rivera** - [fabrv](https://github.com/fabrv)

## License
This project is under the **GNU GENERAL PUBLIC LICENSE** - see [LICENSE](https://github.com/fabrv/SalmonPier/blob/master/LICENSE) for details.
