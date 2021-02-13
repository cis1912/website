---
title: "Reproducibility: docker compose"
date: 2021-02-15
publishDate: 2020-12-01
assignments: []
slides: ""
draft: false
---

Coming soon!

## Demos

Docker's implementation of images and containers is wonderful because it allows us to easily package up and send application code to another machine with strong guarantees that the code will work on the other machine. However, we are still missing a crucial component.

Taking our Docker images and spinning up the containers is, as far as we have seen, a relatively manual process. We have used the Docker CLI to download, build, and run containers. What happens when we have multiple containers we want to run in collaboration (maybe a frontend, backend framework)? If there are specific parameters we want to set for certain containers (mounting a volume, joining a network, etc.)? This is where Docker compose comes into play.

Docker compose allows us to automate the process of installing, building, configuring, and running our Docker containers. You could argue that this is something we could do with a shell script of the commands we would run in the CLI, but you'll quickly see that this is brittle and hard for developers to understand or update. Instead, Docker compose allows us to write YAML files which are readable and clearly outline the configuration of each container.

So, let's jump right into some examples. In lecture, we noted that because Docker uses copy-on-write file systems, when changes are made to the filesystem during Docker runtime, those changes are discarded after the container is closed. Let's see if we can write a Docker compose file to create a container that will mount of a volume so we can save logs made during the runtime of our program.

If you've already the website repository, you can find the code for this demo in `/static/demos/docker_compose_demo` (if you need instructions for cloning the repository, take a look at the Docker demo from last week). Let's quickly look over the biggest new addition: `docker compose.yml`. This is a relatively short file with the contents:
```
version: '3'
services:
  docker_compose_demo_container:
    image: docker_compose_demo_image:latest
    command: node index.js
    ports:
      - "8080:8080"
    volumes:
      - type: bind
        source: ./log
        target: /etc/log
```
The `version` number tells Docker compose what version of Docker compose we are using. The `services` is a list of containers that we want to create, and the images from which to build them. You can see we pull from `docker_compose_demo_image:latest`, run the command `node index.js` to start the container, and expose port `8080` (normally something we added as a command line argument). Lastly, the new thing we do here is bind a volume. We tell Docker that we want it to share the `./log` directory (which we see in our current working directory) with `/etc/log` on the container. So, in our `index.js` when we write to `/etc/log`, Docker will also write the same data to `.log`.

Let's give it a try:
```
# Build the image
$ docker build --tag docker_compose_demo_image .
# Run the containers according to specifications in docker-compose.yml
$ docker-compose up
Recreating docker_compose_demo_docker_compose_demo_container_1 ... done
Attaching to docker_compose_demo_docker_compose_demo_container_1
docker_compose_demo_container_1  | Server running at http://0.0.0.0:8080/
```

Now, if we navigate to `localhost:8080` we should see the text `Logged request to /etc/log.txt!`. If we look inside the `index.js` file, we can see what's really happening here:
```
const server = http.createServer((req, res) => {
  fs.appendFile('/etc/log/log.txt', JSON.stringify(req.headers) + "\n\n", (error, data) => {
    if (error) {
      return console.log(error);
    }
    console.log(data);
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Logged request to /etc/log.txt!');
});
```
Essentially, Node gets the request, logs the headers of the request to `/etc/log/log.txt`, and then displays `Logged request to /etc/log.txt!`. So, if Node is writing to `/etc/log/log.txt` and we bound that directory to `./log` that means that the logs are also stored in `./log/log.txt`! Open up `./log/log.txt` and check out the contents, you will see that the logs the headers of the requests that you make to `localhost:8080`. More than that, it updates live. So, if you close the file, make a request, and reopen the file, you will see that new log in the file.

Note that Docker has a much easier time with this than a virtual machine would. When you share a volume between the host and a virtual machine, you have two separate kernels which both have to recognize it as a shared volume. Docker has an easier time because it's the same kernel on both processes, it just needs to expose the correct volume to the kernel.

Feel free to play around with logging and other ways to interact with a shared volume. You can also change the configurations to share different volumes. You can also experiment with running two separate containers with a single Docker compose file, this is really when Docker compose starts to be a huge improvement over managing each container individually. This is something you'll get a lot of good experience with during homework two.