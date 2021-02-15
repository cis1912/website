---
title: "Docker Containers"
date: 2021-02-08
publishDate: 2020-12-01
assignments: ["hw0"]
slides: https://docs.google.com/presentation/d/1V3djORAOZdd7ZpGCxqDIBf2LtfG8DC2q8nzuhPKyt_Y/edit#slide=id.p
draft: false
---

## Demos

### Docker

As a short introduction to Docker, we're going to pull down a Docker image running Ubuntu and run that image in a container on our machine. To get started, first ensure that Docker Desktop is up and running on your machine. Then, we can pull the latest version of Ubuntu, a Linux distribution which will run on our container (you can read more [here](https://hub.docker.com/_/ubuntu?tab=description&page=1&ordering=last_updated)):

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

It's important to note here that when we tell Docker to pull the latest version of Ubuntu, it actually does three separate pulls from three separate images. This is because Docker images are build inherently from layers. Each pull is for a different layer of the image, and they are built on top of each other to produce the final product.

When you think about it, this is a really smart way to create Docker images. Let's imagine a Docker container that runs Redis, the caching server that acts as a data store. To run Redis, we first need to have a Linux distribution installed, so we can add that as a lower layer of the Docker image which Redis then builds on top of by installing the specific Redis software.

So, now that we have this Ubuntu Docker image installed, what can we do with it? Let's spin up the container and play around with it:

```
$ docker run -it --rm --name ubuntu-demo ubuntu
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

We can see that the Docker container is running a fresh install of Ubuntu. Now, we could do all manner of things with this Ubuntu container: install new software, expose ports, connect to a network, run a web server, etc. However, actually doing these things manually within the Ubuntu terminal is _not_ reproducible; we would have to perform those same operations every time we wanted to spin up a new container. Hence, a Dockerfile. When we write a Dockerfile it is essentially an instruction manual for how the Docker image should be run, so that all of the installation and configuration of whatever toolchain we need on our container can be written out concisely once and only once.

However, feel free to try out different commands or installing different software on the Ubuntu container. It works the same as any other Linux command line interface and there is a lot you can do with it.

### Building an App on Docker

We're going to provide you with some of the starter code for a Node application. We're going to put this application within a Docker container and see how the development process (updating the app) is influenced by the application being containerized. To get the starter code, you can clone the course website repository and enter the `node_demo` directory:

```
# Clone the website from Git to your local machine
$ git clone https://github.com/cis188/website.git
# Enter the node_demo directory
$ cd website/static/demos/node_demo
```

First, take a look at the different files in `node_demo` to get a sense of how package dependencies are being managed and how the Docker Container is configured. Within the Dockerfile there are descriptions of every command explaining their purpose, definitely read through this and as it will be helpful when you write your own Dockerfile for the homework!

Before we carry on to modifying the application, there is a little nuance in the Dockerfile that we should underscore. Taking a look inside the Dockerfile, note that we copy over the `package.json` and `package-lock.json` files before installing our dependencies:

```
# Copy over package.json and package-lock.json (these files
# contain the necessary dependencies for our project)
COPY package*.json ./

# Install dependencies for our project
RUN npm install
```

Why don't we just install the dependencies and then copy everything over at once? The answer is that Docker is smart and if the files `package.json` and `package-lock.json` have not changed, it can skip the following build steps where it installs the dependencies and copies them over. This works because the two files `package.json` and `package-lock.json` contain all of the Node dependencies, so if they have not changed we know that the dependencies have not changed.

Now, let's build the Docker image and start up the Docker container (make sure you've entered the `node_demo` directory):

```
# Build the Docker image from our Dockerfile
$ docker build --tag node-demo-image .
# Run the Docker container with port 8080 exposed
$ docker run -p 8080:8080 --name node-demo-container node-demo-image
Server running at http://0.0.0.0:8080/
```

Navigate to (http://localhost:8080/)[http://localhost:8080/] and you can see the `Hello world!` message. So, let's make some changes to this web application and see what we need to do in our Dockerfile to support those changes (spoiler alert: not very much, Docker makes the development process pretty seamless).

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
Server running at http://0.0.0.0:8080/
```

Navigate back to `localhost:8080` and you will see that the page now displays something like "Hello World: 0b431e86-49f0-4678-9b34-ff8939c1201b". So, the installation and setup of our `uuid` package worked!

This is pretty concise. When we make a change to our development environment (here we installed a new dependency), Docker makes it pretty seamless to also apply change to the Docker container's environment. However, we still have some parts of the process which can be streamlined further. This is something we'll address later in the course when we talk about Docker-compose!
