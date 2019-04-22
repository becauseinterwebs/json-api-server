# Base JSONApi Microservice Server v1.0

This project contains a base setup to build a resource-based microservice using Express and the Sequelize ORM.  After defining a few basic settings (database connectivity, table models) you will be able to start the service and have JSON-Api endpoints available.

It will automatically create controllers and routes for basic CRUD and search operations using the JSON-Api specification based on the database models (tables) defined, but you can create additional controllers or extend the base controller for specialized functionality.

You can also add external service endpoints and extend classes to meet the needs of the application being developed.

## Initial Setup

The process of preparing the application to run for the first time includes the following:

1. Clone the repo
2. Run npm install to install 3rd-party libraries
3. Edit configuration files (including db connection settings)
4. Define your database models
5. Start the application to create database tables

### Installing 3rd-Party Libraries

After cloning the repo, run

    npm install

to install the necessary 3rd-party libraries.

### Configuration Files

This application uses a system of using two configuration files, one that holds settings common to all environments as well as production settings, and another that is used by the local environment (and is not part of the repo) to overwrite settings needed for the local environment to operate correctly.

The main configuration file is app/config/settings.js.  This holds the settings common to all environments as well as production settings (except for db settings of course.)

The env.js file holds settings that will override the corresponding entry in settings.js for the local environment.

### Env.js
Rename env.js.dist to env.js and edit the file to provide the appropriate paths, database settings, server names and keys for the environment. Basically, by the time you get to your production environment, all that should be in the env.js is database settings.

### Database Setup
Once the database settings have been provided in env.js, you can start the application and it will create the necessary tables for you.

By default, options for connecting to a mySql database are provided, but you can also provide options for sqlite or postGREs.  Please see [http://docs.sequelizejs.com/](http://docs.sequelizejs.com/) for more information on configuration options for the Sequelize ORM.

### Define Table Models
The [Sequelize ORM](https://docs.sequelizejs.com) uses JSON objects to define database tables.  These objects are then used to auto-create endpoints, CRUD operations and serializers. 

Define your models in the ```/models``` folder and see the [Sequelize Docs](https://docs.sequelizejs.com) for information on how to define your models.

### Running the Application

In development, the application can be started locally by typing:

    npm run debug

This sets the NODE_ENV variable to 'development' and uses Nodemon to monitor the codebase and will automatically restart the server whenever changes are made.

The application can also be started using NPM (not monitored for changes and NODE_ENV set to 'production'):

    npm start

In production, a process monitor such as PM2 should be used.

### How It Works
Since this is a resource (i.e. database table) based system, it will take the model files defined in the /models folder (please see example file for more information) and create controllers, routes and serializers for each object.  You do not need to define specific controllers to have basic CRUD and full search operations for each resource, but if needed you can extend the ResourceController class and place the file in the /controllers folder if you need specialized functionality.

#### Endpoints
By default, the project provides the following standardized endpoints:

/system/heartbeat - used by monitors to determine if the service is running
/schema - used by clients to retrieve a list of resources and their attributes
/schema/:model - attributes of a specific resource

In addition, all defined resources have the default endpoints for CRUD (and search) operations:

`GET /resource` - Provides a list of all resources objects (table rows.) Filters, includes, and fields can be used to limit search results.

`GET /resource/:id` - Retrieve a specific resource.  Include and field keywords can be used.

`POST /resource` - Create a new resource record

`PATCH /resource/:id` - Update an existing resource

`PUT /resource/:id` - Replace an existing resource

`DELETE /resource/:id` - Delete an existing resource

### Json-Api Searches
Since the associations to other tables are defined in the model files, you can use the 'include' keyword in your searches to include related objects.  You can also use the 'filter' and 'fields' keywords as specified in the JSON-Api specification (jsonapi.org.)

For example if you define Table1 and it has related data in Table2, you could search like this:

www.your-service-url/Table1?include=Table2

This would give you all records in Table1 that have corresponding Table2 records.  If you wanted ALL records in Table1 regardless of if they have Table2 data, you can make Table2 optional (i.e. left-join):

www.your-service.url/Table1?include=*Table2

You can also use filters and fields keywords, including dot-notation nesting:

?filter[Table1.field1][like]=some-text&fields[Table1]=id,field1

Please see the [sequelize-jsonapi-query](https://bitbucket.jwtreporting.com/projects/MT/repos/sequelize-jsonapi-query/browse) library for more information.

#### Available Filter Keywords

Please see the documentation for the [jsonapi-sequelize-query](https://github.com/becauseinterwebs/jsonapi-sequelize-query) library that is installed when you run ```npm install```.

### Jobs
You can define jobs (located in the /jobs folder) that can be called by a CRON.  For example, if you have a job file name 'Test', you could execute it by running:

    npm run job Test

The job name must match the name of the job file (minus the .js extension.)  There is a sample job located in the /jobs folder to help get you started.

