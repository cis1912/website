---
title: "Docker Containers"
date: 2021-02-08
publishDate: 2020-12-01
assignments: ["hw0"]
draft: false
---

Coming soon!

## Demos

### Docker

As a short introduction to Docker, we're going to pull down a Docker image running Ubuntu and run that image in a container on our machine. To get started, first ensure that Docker Desktop is up and running on your machine. Then, we can pull the latest verision of Ubuntu, a Linux distribution which will run on our container (you can read more [here](https://hub.docker.com/_/ubuntu?tab=description&page=1&ordering=last_updated)):

```
$ docker pull ubuntu:latest
latest: Pulling from library/ubuntu
da7391352a9b: Pull complete 
14428a6d4bcd: Pull complete 
2c2d948710f2: Pull complete 
Digest: sha256:c95a8e48bf88e9849f3e0f723d9f49fa12c5a00cfc6e60d2bc99d87555295e4c
Status: Downloaded newer image for ubuntu:latest
docker.io/library/ubuntu:latest
```

It's important to note here that when we tell Docker to pull the latest verison of Ubuntu, it actually does three seperate pulls from three seperate images. This is becauase Docker images are build inheriently from layers. Each pull is for a seperate layer of the image, and they are built on top of each other to produce the final product.

When you think about it, this is a really smart way to create Docker images. Let's imagine a Docker container that runs Redis, the caching server that acts as a data store. To run Redis, we first need to have a Linux distribution installed, so we can add that as a lower layer of the Docker image which Redis then builds on top of by installing the specific Redis software.

So, now that we have this Ubuntu Docker image installed, what can we do with it? Let's spin up the container and play around with it:

```
$ docker run -it --name ubuntu-demo ubuntu
# This will open a terminal within the container running Ubuntu thanks to the "-it" flag
# Now let's check to make sure we are actually running the latest version of Ubuntu
root@260a8119abd6:/# cat /etc/os-release
NAME="Ubuntu"
VERSION="20.04.1 LTS (Focal Fossa)"
ID=ubuntu
ID_LIKE=debian
PRETTY_NAME="Ubuntu 20.04.1 LTS"
VERSION_ID="20.04"
HOME_URL="https://www.ubuntu.com/"
SUPPORT_URL="https://help.ubuntu.com/"
BUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"
PRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"
VERSION_CODENAME=focal
UBUNTU_CODENAME=focal
```

We can see that the Docker container is running a fresh install of Ubuntu. Now, we could do all manner of things with this Ubuntu container: install new software, expose ports, connect to a network, run a web server, etc. However, actually doing these things manually within the Ubuntu terminal is _not_ reproducible; we would have to perform those same operations every time we wanted to spin up a new container. Hence, a Dockerfile. When we write a Dockerfile it is essentially a roadmap for how the Docker image should be run, so that all of the installation and configuration of whatever toolchain we need on our container can be written out concisely once and only once.

However, feel free to try out different commands or installing different software on the Ubuntu container. It works the same as any other Linxu command line interface and there is a lot you can do with it. You can type the `exit` comand to leave the Ubuntu terminal at any time.

### Building an App on Docker

Let's build a simple Node web application on Docker to outline the development process. First, create a new directory anywhere on your machine called `node_demo`. Now within this directory will write all of our application code. First we'll start with a Dockerfile that has all of the requisite steps for setting up our Docker application:

```
# Pull from latest verision of Node
FROM node:latest

# Set the working directory to this directory (common place to 
# store application in the Linux file structure)
WORKDIR /usr/src/app

# Copy over package.json and packaage-lock.json (these files
# contain the necessary dependencies for our project)
COPY package*.json ./

# Install dependencies for our project
RUN npm install

# Copy over all of the app source code
COPY . .

# Expose the port on which we will run our application
EXPOSE 8080

# Start the server
CMD ["node", "index.js"]
```

Before we carry on to the next step, there is a little nuance here that we should underscore. Note that we copy over the `packagae.json` and `package-lock.json` files before installing our dependencies. Why don't we just install the dependencies and then copy everything over at once? The answer is that Docker is smart and if the files `packagae.json` and `package-lock.json` have not changed, it can skip the following build steps where it installs the dependencies and copies them over. This works because the two files `packagae.json` and `package-lock.json` contain all of the Node dependencies, so if they have not changed we know that the dependencies have not changed.

Now that we've written our Dockerfile, we actually should initialize a Node application (if you don't have Node installed, you can find an download guide on their [website](https://nodejs.org/en/download/)). Once you have Node installed, we can initialize the project within our `node_demo` (that also containers our Dockerfile):

```
$ npm init 
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help init` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (node_demo) node_demo
version: (1.0.0) 
description: A demo application built to outline development with Docker for cis188
entry point: (index.js) 
test command: 
git repository: 
keywords: 
author: 
license: (ISC) 
About to write to /Users/campbellphalen/Desktop/node_demo/package.json:

{
  "name": "node_demo",
  "version": "1.0.0",
  "description": "A demo application built to outline development with Docker for cis188",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC"
}


Is this OK? (yes) yes
```

This will create a `package.json` file containing the information we've just provided. Finally, we need our `index.js` file:

```
const http = require('http');

const hostname = '0.0.0.0';
const port = 8080;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World!');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
```

Finally, let's build the Docker image and start up the Docker container:

```
# Build the Docker image from our Dockerfile
$ docker build --tag node-demo-image .
# Run the Docker container with port 8080 exposed
$ docker run -p 8080:8080 --name node-demo-container node-demo-image
Server running at http://0.0.0.0:8080/
```

Now, when we navigate to (http://localhost:8080/)[http://localhost:8080/] we can see the `Hello world!` message. So, let's make some changes to this web application and see what we need to do in our Dockerfile to support those changes (spoiler alert: no very much, Docker makes the development process pretty seemless).

Let's say we needed to generate unique user IDs if we were saving users into a database. There's an Node package called `uuid`, let's install that and see how Docker handles adding a new package. We can type:

```
$ npm install uuid
```

then, let's modify line 10 in our `index.js` file form

```
res.end('Hello World!');
```

to be

```
res.end('Hello World: ' + uuidv4());
```

and also put this import statement at the top of the file

```
const { v4: uuidv4 } = require('uuid');
```

then, when we re-build our Docker container we will see this new Node package
installed, and our index page will be modified:

```
# Delete the previous node-demo container (cannot have duplicate container names)
$ docker container rm node-demo-container
# Rebuild the node-demo-image
$ docker build --tag node-demo-image .
# Recreate the node-demo container
$ docker run -p 8080:8080 --name node-demo-container node-demo-image
```

Now, this is pretty concise. When we make a change to our development environment (here we installed a new dependency), Docker makes it pretty seemless to also have that be installed the Docker container's environment. However, we still have to rebuild the Docker image and the Docker container, which can feel a little tedious. This is something we'll address later in the course when we talk about Docker-compose!