# Index

  * [Introduction](#what-is-couch_adapter)
  * [Installation](#installation)
  * [Usage](#usage)
    * [Create](#create)
    * [Read](#read)
    * [ReadBulk](#read-bulk)        
    * [Update](#update)  
    * [Delete](#delete)      
    * [Version](#getversion)    
    * [Log Level](#loglevel)    
  * [Results](#results)
    * [Create, Update, Delete Result](#create/update/delete-result)
    * [Read Bulk Result](#read-bulk-result)
    * [Read Result](#read-result)
  * [Developers](#developers)

# What is couch_adapter

couch_adapter is a simple abstraction that removes dependencies from couch specific logic and mechanisms from your API and/or website.  It provides a simple CRUD interface
that can be extended, modified, or replaced with another module at a later time, if couchDB needs replaced.

# Installation

``` javascript
    npm install couch_adapter
```

# Usage
#### Construction Usage
Creating a new adapter instance is as easy as:
``` javascript
    let adapter = require("couch_adapter")(options);
```
Constructor Options is an object that can contain the following:
  * db:  The database you wish to attach to. (Required)
  * url: The couch url to connect to. -- Can be COUCH_URL environment Variable
  * user: Couch User details. -- Can be COUCH_USER environment Variable
  * pass: Couch Password details. -- Can be COUCH_PASS environment Variable
  * design: (Optional) Design document to use.
  * view: (Optional) view to be used
  * logLevel: Defaults to "info" ("fatal","error","warn","info","debug","trace")
  * read:  Method for reading individual document if you want to override default.
  * readBulk: Method for reading many documents, if you want to override default.
  * create: Method for creating a document, if you want to override default.
  * deleteId: Method for deleting a document, if you want to override default.
  * update: Method for updating a document, if youw want to override default.

Creating an adapter returns an object with 7 methods:  create, read, update, delete, readBulk, getVersion, and logLevel.
All methods return a promise.

#### Create
Creates a document in the configured database.
``` javascript
    adapter.create(doc).then((result) => {
        console.log(result);
    });
```
#### Read 
Retrieves a document that matches ID from database
``` javascript
    adapter.read(id).then((result) => {
        console.log(result);
    });
```
#### Read Bulk
Retrieves a set of documents from the database
``` javascript
    adapter.readBulk(skip, limit).then((result) => {
        console.log(result);
    });;
```
#### Update
Updates a document in the database. doc is document
``` javascript
    adapter.update(doc).then((result) => {
        console.log(result);
    });
```
#### Delete
Deletes a document in the database that matches the passed id.
``` javascript
    adapter.delete(id).then((result) => {
        console.log(result);
    });
```
#### getVersion
Retrieves the version of the module.
``` javascript
    adapter.getVersion().then((result) => {
        console.log(result);
    });
```
#### logLevel
Retrieves the logLevel of the object.
``` javascript
    adapter.logLevel().then((result) => {
        console.log(result);
    });
```
# Results

#### Create/Update/Delete Result
``` JSON
{ 
  "ok": true,
  "id": "awest2",
  "rev": "1-f371adad4ce4b07c5702f103ae9f0864" 
}
```

##### Read Bulk Result
``` JSON
{ 
  "total_rows": 3,
  "offset": 0,
  "rows": 
   [ 
     { "id": "awest", "key": "EDL", "value": "awest" },
     { "id": "ckent", "key": "ID", "value": "ckent" },
     { "id": "jtest", "key": "PDL", "value": "jtest" } 
   ] 
}
```
Note:  Read Bulk does not attach documents to the results.
#### Read Result
``` JSON
{ 
  "total_rows": 1,
  "offset": 0,
  "rows": 
   [ { "id": "awest", "key": "EDL", "value": "awest", "doc": { }} ] 
}
```
#### Version Result
``` JSON
{
    "version": "1.0.0"
}
```
#### logLevel Result
``` JSON
{
    "logLevel": "info"
}
```
# Developers
Tests require a couch instance to execute.  Configure settings in ./test/configData/config.json.

Scripts available:  

  * **npm test** :  Runs all tests in the /test/ directory

  * **npm run coverage** : generates an instanbul coverage report

  * **npm run lint** :  Performs linting of the files with my style using jshint and jscs


Logs are generaged at either process.env.LOG_DIR or at the root directory of the calling application.
Logs are generated using PINO, and follow the naming schema:  couch_adapter_MMDDYYYY.log

If you have any questions, suggestions, or issues please contact me at jashworth@validusa.com.

Contributors Welcome!

Thanks