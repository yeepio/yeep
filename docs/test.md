## How to configure the test environment on MacOS

1. Download and install Node.js and npm;

    Either via _brew_ or by manually downloading from the official [Node.js website](https://nodejs.org/en/download/current).

2. Download and install MongoDB v.4+;

    ```
    brew update
    brew install mongodb
    ```

3. Configure mongodb to run as a standalone read replica;

    Please note: Yeep requires mongodb v.4+ read replica to enable transactions and change streams. Standalone read replicas is an oxymoron by definition, and should only be used for testing purposes.

    Open the mongod.conf file for editing:

    ```
    nano /usr/local/etc/mongod.conf
    ```

    Append replication-related options:

    ```
    replication:
      replSetName: cosmos
    ```

    Overall, your _mongodb.conf_ file should look something like this:

    ```
    systemLog:
      destination: file
      path: /usr/local/var/log/mongodb/mongo.log
      logAppend: true
    storage:
      engine: mmapv1
      dbPath: /usr/local/var/repl-emagine-data
    net:
      bindIp: 127.0.0.1
    replication:
      replSetName: reploca
    ```

    Restart mongod:

    ```
    brew services restart mongodb
    ```

    Run `rs.initiate()` to initiate the new replica set:

    ```
    mongo --eval 'rs.initiate()'
    ```

    For further info please visit https://docs.mongodb.com/manual/tutorial/convert-standalone-to-replica-set/
