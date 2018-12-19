# Contributing guidelines

Thank you for contributing to Yeep development - you're awesome!

## Setup project for local development

Let's get you started for development.

1. Download the source code by cloning this repo;
2. Install software dependencies;
    ```bash
    $ npm ci
    ```
3. Install `mongodb` v.4+ and run with _replica set_;

    Why running a _replica set_? Yeep uses mongodb transactions, which are available for replica sets only.

4. Create `.env` file with the following settings (update the values to match your system configuration):

    ```
    NODE_ENV="development"
    MONGODB_URI="mongodb://localhost:27017/yeep"
    JWT_SECRET="Thy shall not pass"
    BASE_URL="http://localhost:3000"
    PORT="3000"
    ```
5. Initialize the db schema;

    ```bash
    $ NODE_ENV="development" cli/index.js --config=./yeep.config.js migrate up
    ```

6. Create the local upload dir;

    ```bash
    $ NODE_ENV="development" cli/index.js --config=./yeep.config.js mkdirupload
    ```

7. Run the yeep platform in development mode;

    ```bash
    npm run dev
    ```
    or in case you want to reload the server on every source code update:
    ```bash
    npm run watch
    ```
