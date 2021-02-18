---
title: "Reproducibility: docker compose"
date: 2021-02-15
publishDate: 2020-12-01
assignments: []
slides: "https://docs.google.com/presentation/d/1ZunsyTTG3qcqvdzr6lGlrYbH5YQL8zv45IEefrErfa4/edit"
draft: false
---

Coming soon!

## Demos

Docker's implementation of images and containers is wonderful because it allows us to easily package up and send application code to another machine with strong guarantees that the code will work on the target machine. However, we are still missing a crucial component.

Taking our Docker images and spinning up the containers is, as far as we have seen, a fairly manual process. We have used the Docker CLI to download, build, and run containers. What happens when we have multiple containers we want to run in collaboration (maybe a frontend, backend framework)? What if there are specific parameters we want to set for certain containers (mounting a volume, joining a network, etc.)? This is where Docker compose comes into play.

Docker compose allows us to automate the process of installing, building, configuring, and running our Docker containers. You could argue that this is something we could do with a shell script of the commands we would run in the CLI, but you'll quickly see that this is brittle and hard for developers to understand or update. Instead, Docker compose allows us to write YAML files which are readable and clearly outline the configuration of each container.

So, let's jump right into the example. In lecture, we noted that because Docker uses a copy-on-write filesystem, when changes are made to the filesystem during Docker runtime, those changes are discarded after the container is closed. Let's see if we can write a Docker compose file to create a container that will mount a volume so we can save logs made during the runtime of our program.

If you've already cloned the website repository, you can find the code for this demo in `/static/demos/docker_compose_demo` (if you need instructions for cloning the repository, take a look at the Docker demo from last week). Let's quickly look over the biggest new addition to the demo, `docker_compose.yml`. This is a relatively short file with the contents:
```
version: '3'
services:
  docker_compose_demo_container:
    build: .
    ports:
      - "8080:8080"
    volumes:
      - type: bind
        source: ./log
        target: /log
```
The `version` number specifies what version of Docker compose we are using. The `services` is a list of containers that we want to create, and we can also specify how to build the images that run. We build the current working directory to start the container, and expose port `8080` (normally something we added as a command line argument). The reason `build .` works in this context is because Docker compose will look for the Dockerfile in the current working directory, and use that Dockerfile to build the image. Lastly, the new thing we do here is bind a volume. We tell Docker that we want it to share the `./log` directory (which we see in our current working directory) with `/log` on the container. So, in our `index.js` when we write to `/log`, Docker will also write the same data to `./log`.

Let's give it a try:
```
# Build image and run container according to specifications in docker-compose.yml
$ docker-compose up
```

After building our image specified in the Dockerfile and creating the container to run it, if we navigate to `localhost:8080` we should see the text `Logged request to /log.txt!`. Let's check out the `index.js` file, we can see what's really happening here:
```
const server = http.createServer((req, res) => {
  fs.appendFile('/log/log.txt', JSON.stringify(req.headers) + "\n\n", (error, data) => {
    if (error) {
      return console.log(error);
    }
    console.log(data);
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Logged request to /log.txt!');
});
```
Essentially, Node gets the request, logs the headers of the request to `/log/log.txt`, and then displays `Logged request to /log.txt!`. So, if Node is writing to `/log/log.txt` and we bound that directory to `./log` that means that the logs are also stored in `./log/log.txt`! Open up `./log/log.txt` and check out the contents, you will see that the logs the headers of the requests that you make to `localhost:8080`. More than that, it updates live. So, if you close the file, make a request, and reopen the file, you will see that new log in the file.

Note that Docker has a much easier time with this than a virtual machine would. When you share a volume between the host and a virtual machine, you have two separate kernels which both have to recognize it as a shared volume. Docker has an easier time because it's the same kernel on both processes, it just needs to expose the correct volume to the kernel.

Feel free to play around with logging and other ways to interact with a shared volume. You can also change the configurations to share different volumes. You can also experiment with running two separate containers with a single Docker compose file, this is really when Docker compose starts to be a huge improvement over managing each container individually. This is something you'll get a lot of good experience with during homework two.
