# Contributing guidelines

Thank you for contributing to Yeep development - you're awesome!

## Setup project for local development

Let's get you started for development.

1. Download the source code by cloning this repo;
2. Install software dependencies;

   ```bash
   npm ci
   ```

3. Install `mongodb` v.4+ and run with _replica set_;

   Why do we need a _replica set_? Yeep platform heavily uses mongodb transactions, which are available for replica sets only.

   #### MacOS Users

   The easiest way to install mongodb on MacOS is via [Homebrew](https://brew.sh/).

   ```bash
   brew update
   brew install mongodb
   ```

   Verify the mongodb has been installed correctly by running:

   ```bash
   mongod --version
   ```

   [OPTIONAL] You might want to enlist mongodb as a background service. If that is the case, run the following:

   ```bash
   brew services start mongodb
   ```

   Otherwise, you need to start mongodb yourself. Make sure mongo has access to the _data_ dir:

   ```bash
   sudo mkdir -p /data/db
   sudo chown ${YOUR_USER} /data/db
   ```

   Run the following command everytime you want to start mongo:

   ```bash
   mongod --replSet "rs0"
   ```

   Note the `--replSet` flag which tells mongo to start as a standalone replica set instance. The **first-time** you start mongo, you need to open the mongo command line:

   ```bash
   mongo
   ```

   And initiate the replica-set:

   ```
   rs.initiate()
   ```

4. Create `.env` file with the following settings (update the values to match your system configuration):

   ```
   NODE_ENV="development"
   PORT="5000"
   BASE_URL="http://localhost:5000/"
   MONGODB_URI="mongodb://localhost:27017/yeep"
   BEARER_SECRET="keep it safe, keep it hidden!"
   COOKIE_SECRET="keep it safe, keep it hidden!"
   ```

5. Initialize the db schema;

   ```bash
   NODE_ENV="development" cli/index.js --config=./yeep.config.js migrate up
   ```

6. Create the local upload dir;

   ```bash
   NODE_ENV="development" cli/index.js --config=./yeep.config.js mkdirupload
   ```

7. Run the yeep platform in development mode;

   ```bash
   npm run dev
   ```

   or in case you want to reload the server on every source code update:

   ```bash
   npm run watch
   ```
