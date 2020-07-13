# Shipping Service Facade API Layer
> This shipping service is a facade API layer meant to consolidate shipping quotes from a variety of sources and allow users to confirm a shipment, view their shipment details, and cancel.

## Table of contents
* [General info](#general-info)
* [Screenshots](#screenshots)
* [Technologies](#technologies)
* [Setup](#setup)
* [Documentation](#documentation)
* [Features](#features)
* [Contact](#contact)

## General info
This is a dummy project developed to show off backend development with a suite of technologies. One goal for this project is to ensure the ease of use with respect to set up. All of these technologies can be found below.

## Screenshots
![Example screenshot](./img/screenshot.png)

## Technologies
* Node.js
* Express.js
* Sequelize ORM
* OpenAPI 3.0
* MySQL
* Docker

## Setup
This project is built using Docker containers and a docker-compose file is placed in the root of the repository. Follow the steps below to get started:

Check out the repository:

```
git clone https://github.com/maraja/shipment-facade-api
```

Change into the repository directory:

```
cd shipment-facade-api
```

Run the following Docker command within the root directory:

```
docker-compose up
```

#### To run tests

```
docker-compose run --rm backend yarn test
```

#### To re-initialize db

You can reinitialize the db in case anything goes wrong. Simply connect to the docker container as shown above and run the following command: `yarn init`

## Documentation
API Documentation can be found here: https://documenter.getpostman.com/view/395098/T17KeSmG?version=latest

## Code Examples
Show examples of usage:
`put-your-code-here`

## Features
List of features ready and TODOs for future development
* Create, get, and delete shipments
* Get shipment quotes
* MySQL database with migrations
* Unit Testing and Code Coverage

To-do list:
* Implement JWT as a form of authentication for authorized requests.
* When cancelling a shipment, should just set a flag in the table to "cancelled" instead of removing entirely. Application will gracefully handle these cancellations.
* More unit tests should be done to ensure origin and destination addresses are provided successfully.
* Input validation and sanization needse to be done.

## Extra Notes

Great resource for learning and setting up the db with sequelize. Although I used MySQL and this article uses PostGreSQL, all the concepts remain the same:
https://www.oriechinedu.com/posts/getting-started-with-sequelize-and-postgres

## Contact
Created by [@maraja](mailto:amit.maraj@gmail.com) - feel free to contact me!