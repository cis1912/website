---
title: "Docker Containers"
date: 2021-02-08
publishDate: 2020-12-01
assignments: ["hw0"]
draft: false
---

# Lecture Two: Docker

## Portability

Recall all of the issues that we've run into trying transfer code that we developed on our local machine to a remote host in the cloud. We want to be able to take our application code, and seamlessly run it on another machine. How can we avoid all of the dependency and versioning issues we ran into when we manually deployed to EC2?

The intuition here is that we essentially want to _send a copy of our local computer_ to whoever is going to be running our code.

## Containers

Containers allow us to package minimal operating systems as "images" which includes everything our program needs to run. Once we've created the image, we can send it to anyone, and they will be able to build it on their machine to run our code.

Beyond just being able to send the image to another person, we want them to be able to build and run the image with the same commands that we use to build and run the images. This way we can send someone an image and say "here is the image, here are the commands to start it, we know for certain it will work."

Finally, we can also build the image locally and send the image after it has already been built. This way the receiver can run the container without having to worry about any of the build process.

As we can see, containers give us a lot of guarantees that make deployment much easier.

## Docker

Docker is the industry-standard implementation for containers. Dockers key features include:
- **Lightweight**: Docker bootstraps off of your host OS. Instead of emulating a kernel or other parts of your hardware, Docker uses the host machines kernel and hardware. This is much more efficient than completely emulating these parts of the machine.
- **Secure**: Docker containers are completely isolated from the host and from other containers, so an application running in a Docker container cannot corrupt your host machine or access any data which is not its own   .

## Containers vs. Virtual Machines

For each virtual machine, we fully emulate every piece of hardware that exists on the machine. Every virtual machine does this emulation individually, so if we have many virtual machines they don't share the majority of their resources.

![Virtual Machine Diagram](/img/lec02/vm_vis.png)

Instead, containers share as many resources between multiple containers and with the host OS as possible (while still maintaining privacy and separation). This gives us a huge performance increase because emulation is always slower than actual computation.

![Container Diagram](/img/lec02/container_vis.png)

## Docker Images

Docker images ideally contain the minimal OS needed to run your application. We only want the files that are needed to run our application and nothing more.

Docker images (somewhat like objects in Java) are built in layers. When we create a Docker image, it is always extending another image. This layering allows us to utilize a "copy-on-write" filesystem for each image. This means that the filesystem within the image is completely immutable. Instead, when we make a change to the filesystem, Docker creates an additional image layer with your changes and layers that on top of the most recent image.

![Docker Layering Diagram](/img/lec02/container_vis.png)

Copy-on-write saves us a lot of space because we only ever need one instance of an image installed on our machine, regardless of how many other images build on top of that image. Perhaps we have ten images all running on Ubuntu, we still only need to store one installation of the base Ubuntu image and we will layer the other images on top of that single installation.

Note that the successive images which we are layering on top only contain the differences. This saves us space initially (we only save the differences, so we don't store anything twice), but it also means that Docker images strictly increase in size as we continue to layer on top. Be aware of this as you build your images: if you add something and then delete it in a later image, this still increases the size of the image because the differences are still stored.

## Docker Runtime

Docker runtime uses a "blueprint" to run a container. The blueprint just contains the commands needed to start the application.

A Docker container is a running instance of a Docker image. However, changes that are made during Docker runtime (think logs) are not stored because Docker images are immutable. So if we want to save any changes made during Docker runtime we have to do something other than saving it to the filesystem.

Docker runtime runs with a single host-wide Docker daemon (depicted in the earlier Docker visualization) which just sits in the background, manages your containers, and processes any requests which you might make with the Docker CLI to interact with the container. Not everyone agrees that this is a good thing, though, because it is a single point of failure.

## Publishing

If we are sharing an image with someone, we don't want them to have to build the image from scratch. So, we need some way to publish a Docker image for someone else to use.

The solution here is a registry where we can publish our images so that others can download them. Common examples include:
- Docker Hub
- Google Container Registry (GCR)
- Elastic Container Registry (ECR)
- GitHub Container Registry (unfortunately also abbreviated GCR)

These are essentially the same thing as NPM or PIP, but for Docker images instead of code packages.

## Tags

We need some way to identify images so that they are easily available to others. Images name take the form `IMAGE_NAME[:tag]` where `IMAGE_NAME` is the name of your project or repository, and `tag` specifies the version. Examples are `node:latest` and `node:15-buster-slim`. If you don't specify the tag it defaults to `latest`.

The idea is that we want the tag names to be distinct and predictable. Some common strategies are auto-incrementing so that the tag increases by one every time you create a new version of the image, using conventional versioning nomenclature (think `node 3.1.4` or `python 3.6.2`), or using the SHA of a Git commit so that you can associate a image with a version your code.

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