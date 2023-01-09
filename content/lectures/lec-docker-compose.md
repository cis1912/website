---
title: "Reproducibility: Docker Compose"
date: 2023-02-08
publishDate: 2020-12-01
slides: "https://docs.google.com/presentation/d/1ZunsyTTG3qcqvdzr6lGlrYbH5YQL8zv45IEefrErfa4/edit"
draft: false
type: lec
---

# Lecture Three: Docker Compose

## Limitations of Docker as a production run system

We've seen how useful Docker is as a tool and the reasons that we'd want to use it in production. But it doesn't solve all of our problems. Take this `docker run` invocation, for example:

```
$ docker run -it \
  --name=letsencrypt \
  --cap-add=NET_ADMIN \
  -e PUID=1000 \
  -e PGID=1000 -e TZ=Europe/London \
  -e URL=walthome.duckdns.org \
  -e SUBDOMAINS=wildcard \
  -e VALIDATION=duckdns \
  -e DUCKDNSTOKEN=youwillnevergetthis \
  -e EMAIL=pwpon500@gmail.com \
  -v ./test:/config \
  --restart unless-stopped \
  linuxserver/letsencrypt
```

Maybe this is easy for the computer to read, but for humans there are numerous drawbacks to writing long console commands like this. For one, they're inaccessible and confusing to people who have less experience with the Docker CLI. Second, how are we going to keep track of this? Perhaps we could throw it in a shell script and commit it to our repository, but shell scripts can be cumbersome to edit and do not always interface well with other programming languages.

## Run System Wishlist

So, if we're unhappy with the Docker CLI as our interface for running containers, let's think about what we want out of a run system:

- Reproducible (should be easy to share)
- Easy to understand what's going on (human readable)
- Confidence in making changes to config
- Resource lifecycle management (spinning up, tearing down and cleaning up containers)

If we look at the example from the previous section, we can see that apart from resource lifecycle management, we have nothing else from our wishlist.

## Docker Compose

The improvement here is Docker Compose. This is a tool that allows us to "compose" multiple Docker containers together. Docker Compose manages the lifecycle of multiple containers at the same time, handles all runtime settings for us (environment variables, port maps, volumes, etc), and can be started, stopped and inspected with simple shell commands. Now, if we look back at our wishlist, we meet all of the criteria.

## YAML (YAML Ain't Markup Language)

What does Docker Compose actually look like? The configuration is written in a language called YAML. This is great for a lot of reasons: YAML is a simple and human-readable config language, it is standard across many infrastructure tools like Kubernetes and Continuous Integration, and it has types which will prevent us from making some major mistakes. The grammar of YAML is made up of these base types:

- Scalar
  - String
  - Number
  - Boolean
- Dictionary 
- List

The top-level structure in configuration files is normally a dictionary, a list of key/value pairs. If you're familiar with JSON, then this should seem familiar. While there are only a few types, by composing these data types we can be quite expressive.

### Scalars

#### Strings

For strings we don't need quotes, however it is generally considered best practice to quote your strings. If you include numbers in your strings and don't quote them, the compiler interprets it as a number, so it's always safer to add quotes.
```yaml
armaan: "Tobaccowalla"
peyton: Walters
```

#### Multi-line Strings 

There are two operators, `|` (pronounced pipe) and `>` (pronounced fold). The pipe preserves newlines and whitespace in the YAML, whereas the fold operator folds all newlines, tabs and other whitespace into a single space, putting everything on the same line. You can check out [this page](https://yaml-multiline.info) for more information on the nuances of multiline strings in YAML.
```yaml
campbell: |
  This is Campbell's first sentence.
  This second sentence is on a new line.
davis: >
  This is Davis's first sentence.
  This second sentence will end up
  being on the same line as the first.
```

#### Numbers

Fairly straightforward, no quotes and you get a number.
```yaml
armaan: 21
campbell: 20.5
```

#### Booleans

YAML let's you get away with a lot for boolean values. You should always use `true` or `false`. However, YAML does accept `False` and `NO` but this can make your config confusing and hard to read. Also, these are subject to change in the future so using anything other than `true` or `false` is not particularly maintainable.
```yaml
this_is_true: true
this_is_false: false
do_not_do_this: False
nor_this: NO
```

### Lists

We can create a list with newlines and hyphens (you don't have to indent but we prefer if you do), or by comma separating the values within brackets as in `list2`. We recommend that you install a editor extension (something like [this](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)) that helps format your YAML as you write it.
```yaml
instructors:
  - armaan
  - peyton
# don't have to indent for lists
# (but we prefer you do)
tas:
- davis
- campbell

list2: ["this", "is", "an", "alternative"]
```

### Dictionaries

Use two spaces in the indent and YAML will associate the values as a dictionary.
```yaml
# 2 spaces per indent or bust
staff_ages:
  instructors:
    armaan: 21
    peyton: 20
  tas:
    davis: 22
    campbell: 20
```
The example above has a readability problem. What is the value that we are associating with the names? We see that Peyton is 21 and Davis is 22, but what does that mean? Are they 21 and 22 feet tall? The example below shows how we can use lists of dictionaries to remove that ambiguity:
```yaml
staff:
  instructors:
    - name: armaan
      age: 21
    - name: peyton
      age: 20
  tas:
    - name: davis
      age: 22
    - name: campbell
      age: 20
```

## YAML Lint

Check out [yamllint.com/](http://www.yamllint.com/) to double check your YAML, it will help remove ambiguity from the config. We automatically run this in the autograder so definitely put your Docker compose YAML in here before you submit!

## Docker Compose to Production?

So far, with all of these Docker tools (Docker images, Docker containers, Docker runtime, Docker compose, and Docker Hub) we can build and distribute images, and coordinate multiple containers together. If we're designing a production system that we want to serve actual web traffic, is this enough? Are we missing anything? The answer is yes! Here are four main pillars that are not handled at all by Docker Compose: 

- High Availability: If a node fails, will we still be able to serve traffic? High Availability can be achieved with a [failover](https://www.jscape.com/blog/active-active-vs-active-passive-high-availability-cluster) mechanism.
- Horizontal Scalability: There are two ways to scale a service. Vertical scalability is when we increase the resources of our production server to handle more traffic, generally by adding more RAM or upgrading to a faster processor. Horizontal scalability is when we increase our computational resources by having multiple machines run our server code and balance load between them. Docker Compose only lets us scale vertically, because it runs on a single host. We're therefore limited by the capacity of a single node running Docker Compose. While vertical scaling can get us far, there's an upper limit to the traffic that can be handled on a single machine. 
- Networking: Docker compose allows us to network between containers on a single machine, but we cannot communicate across multiple machines. If we want scalability and availability, we're going to need to communicate between multiple machines.
- Observability: How can we monitor all of our containers and their health? Are we notified if something fails? Are we getting more traffic than we can handle?

### What even is a "production system?"
All four of these pillars mentioned above are extremely important for a company at the scale of Facebook, where tens of millions of people are using the product every second of every day. Smaller companies might have different requirements: high availability or observability might not be as much of an issue when operating only in one datacenter. There are certainly many companies which run Docker Compose in production. Whether that's a "best practice" or not is up to interpretation. A good takeaway from this class is that there's no silver bullet for every problem and every possible scale. There's always a cost/benefit tradeoff between a given feature and the operational complexity that comes with it. Docker Compose won't always be the right choice, but clustering systems might not be the right tradeoff either for a given problem.

## Production System Wishlist

Now that we've looked at the hard technical requirements, let's look at the features we'd like to see.

### Declarative

> "I want 10 instances of my webserver at the domain example.cis1880.com"

Rather than have to micro-manage the state of our cluster at all times, we want a declarative system that will automatically reconcile the current state of our system with our desired state. This abstracts a lot of the complexity away from us. We don't always care how the system gets to the desired state, we just need it to be able to get there.

We also get error recovery for free out of a declarative system. If some error occurs that deviates us from our desired state, we don't have to troubleshoot the issue. Instead, the system automatically knows that it needs to bring us back to the desired state.

Declarative tools like [terraform](https://www.terraform.io) extend beyond deployment into other parts of infrastructure.

### API-Driven

All interactions with the system should be done through an API interface. We should never have to SSH into a server and manually make changes. This way, everything on the cluster can be easily described as API objects and interacted with through the API. This allows us to work with our cluster resources through a REST API similarly to how an application would allow clients to work with database rows. This also makes permissions describable using API-style: principal-verb-resource style. This is where we can setup our permissions as "Principal `x` can perform verb `y` on resource `z`".

What's wrong with shell scripts? Why is an API better? Because APIs are language agonistic, we can automate the API in a number of different languages with little overhead. This is good for a system that we want to widely applicable.

### Open Source

This means that all of the source code should be available for auditing and improvement. So, if we encounter issues with our use case, we can contribute back and submit a fix. Additionally, the diverse set of contributors and users means that someone else will likely have a related use case.

It is a myth that open source is a security vulnerability because adversaries can see the codebase and look for exploits. In actuality, open source tends to be more secure because there a lot of users and contributors all ensuring that there are no vulnerabilities. Additionally, many open source groups will have 3rd party audits on occasion to double check that there are no vulnerabilities.

### Community

We want a large, welcoming community. The more user and contributors, the stronger the codebase becomes. Having users that are excited about the product and working to improve it will send the project on a positive trajectory.

## Kubernetes!

The system that we're talking about is Kubernetes. It fulfils all of the requirements we've listed above and we'll go into more depth next week.

## Demos

Docker's implementation of images and containers is wonderful because it allows us to easily package up and send application code to another machine with strong guarantees that the code will work on the target machine. However, we are still missing a crucial component.

Taking our Docker images and spinning up the containers is, as far as we have seen, a fairly manual process. We have used the Docker CLI to download, build, and run containers. What happens when we have multiple containers we want to run in collaboration (maybe a frontend, backend framework)? What if there are specific parameters we want to set for certain containers (mounting a volume, joining a network, etc.)? This is where Docker compose comes into play.

Docker compose allows us to automate the process of installing, building, configuring, and running our Docker containers. You could argue that this is something we could do with a shell script of the commands we would run in the CLI, but you'll quickly see that this is brittle and hard for developers to understand or update. Instead, Docker compose allows us to write YAML files which are readable and clearly outline the configuration of each container.

So, let's jump right into the example. In lecture, we noted that because Docker uses a copy-on-write filesystem, when changes are made to the filesystem during Docker runtime, those changes are discarded after the container is closed. Let's see if we can write a Docker compose file to create a container that will mount a volume so we can save logs made during the runtime of our program.

If you've already cloned the website repository, you can find the code for this demo in `demos/docker_compose_demo` (if you need instructions for cloning the repository, take a look at the Docker demo from last week). Let's quickly look over the biggest new addition to the demo, `docker_compose.yml`. This is a relatively short file with the contents:
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

