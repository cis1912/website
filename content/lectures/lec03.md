---
title: "Reproducibility: docker-compose"
date: 2021-02-15
publishDate: 2020-12-01
assignments: []
slides: ""
draft: false
---

# Lecture Three: Docker Compose

## What's Wrong With This?

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

Maybe this is easy for the computer to read, but for humans there are numerous drawbacks to writing long console commands like this. For one, they're inaccessible and confusing to people who have less experience with the Docker CLI. Second, how are we going to keep track of this? Perhaps we could throw it in a shell script and commit it to the repository, but shell scripts can be cumbersome to edit and do not always interface well with other programming languages.

## Run System Wishlist

So, if we're unhappy with the Docker CLI as our interface for running containers, let's think about what we want out of a run system:

- Reproducible (should be easy to share)
- Easy to understand what's going on (human readable)
- Confidence in making changes to config
- Resource lifecycle management (we can set parameters that manage our containers)

If we look at the example from the previous section, we can see that apart from resource lifecycle management, we have nothing else from our wishlist.

## Docker Compose

The improvement here is Docker Compose. This is a tool that allows us to "compose" multiple Docker containers together, and manage their lifecycles. DOcker has:

- Tool for managing lifecycle of multiple containers simultaneously
- Handles all runtime settings - environment variables, port mapping, volume binding, etc.
- Simple user commands

Now, if we look back at our wishlist, we meet all of the criteria.

## YAML (YAML Ain't Markup Language)

What does Docker compose actually look like? The configuration is written in a language called YAML. This is great for a lot of reasons: YAML is a simple and human-readable config language, it is standard across many infrastructure tools, and it has types which will prevent us from making some major mistakes. There are a few different types available in YAML:

- Scalar
  - String
  - Number
  - Boolean
- Dictionary 
- List

While there are only a few types, by composing these data types we can be quite expressive.

### Scalars

#### Strings

For strings we don't need quotes, however it is generally considered best practice to quote your strings. If you include numbers in your strings and don't quote them, the compiler interprets it as a number. Moral of the story: quote your strings in YAML.
```
armaan: "Tobaccowalla"
peyton: Walters
```

#### Multi-line Strings 

There are two operators, `|` (pronounced pipe) and `>` (pronounced chomp). The pipe preserves newlines in the YAML, whereas the chomp puts everything on the same line.
```
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
```
armaan: 21
campbell: 20
```

#### Booleans

YAML let's you get away with a lot for boolean values. You should always use `true` or `false`. However, YAML does accept `False` and `NO` but this can make your config confusing and hard to read. Also, these are subject to change in the future so using anything other than `true` or `false` is not particularly maintainable.
```
this_is_true: true
this_is_false: false
do_not_do_this: False
nor_this: NO
```

### Lists

We can create a list with newlines and hyphens (you don't have to indent but we prefer if you do), or by comma separating the values within brackets as in `list2`. We recommend that you install a editor extension (something like [this](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)) that helps format your YAML as you write it.
```
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
```
# 2 spaces per indent or bust
staff_ages:
  instructors:
    armaan: 21
    peyton: 20
  tas:
    davis: 22
    campbell: 20
```
The example above has a small problem. What is the value that we are associating with the names? We see that Peyton is 21 and Davis is 22, but what does that mean? Are they 21 and 22 feet tall? The example below shows how we can use lists of dictionaries to remove that ambiguity:
```
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

## YAML Link

Checkout [http://www.yamllint.com/](http://www.yamllint.com/) to double check your YAML, it will help remove ambiguity from the config. We automatically run this in the autograder so definitely put your Docker compose YAML in here before you submit!

## What Are We Missing?

So far, with all of these Docker tools (Docker images, Docker containers, DDocker runtime, Docker compose, and Docker Hub) we have all of the following:

- Image building
- image distribution
- Running multiple containers together

If we're designing a production system that we want to serve actual web traffic, is this enough? Are we missing anything?

- Testing: How can we ensure that our code is actually working putting it into production?
- Observability: How can we monitor all of our containers and their health? Are we notified if something fails? Are we getting more traffic than we can handle?
- Scalability: We can duplicate Docker containers, but still we are limited by the hardware capacity of the single machine that is running Docker. Also, we cannot scale automatically based on the amount of traffic we are receiving.
- High Availability: If a machine fails, will I still be able to serve traffic?
- Networking: Docker compose allows us to network between containers on a single machine, but we cannot communicate across multiple machines. If we want scalability and availability, we're going to need to communicate between multiple machines.

Note that all of these metrics exist on a spectrum. We can have super high availability, but it might make networking or observability more difficult. There are going to be tradeoffs and it won't always be the case that one technology is the solution to every existing use case.

### Vertical Scalability vs. Horizontal Scalability

Let's quickly differentiate between vertical scaling and horizontal scalability. Vertical scalability is when we duplicate a service many times on the same machine, Docker compose allows us to do this by duplicating containers. Horizontal scalability is when we duplicate our service many times across different machines. We want horizontal scalability so that we are not limited by the hardware of a single machine. Horizontal scalability also affords us availability, if only one of the many machines running our code fails, we can still serve traffic from the other machines.

## Production System Wishlist

Are there those specific features we would want out of a production system?

### Declarative

What does it mean to be declarative? We want to be able to tell our system our desired state or end goal, and then have the system automatically get to that state (this is called automatic reconciliation between desired state and actual state). We want this because it abstracts a lot of the complexity away from us. We don't always care how the system gets to the desired state, we just need it to be able to get to the desired state, the process of getting there is confusing and not something we need to worry about.

We also get error recovery for free out of a declarative system. If some error occurs that deviates us from our desired state, we don't have to troubleshoot the issue. Instead, the system automatically knows that it needs to bring us back to the desired state.

Declarative tools are something that we will see in common among many infrastructure tools.

### API-Driven

All interactions with the system should be done through an API interface. We should never have to SSH into a server and manually make changes. This way, everything on the cluster can be easily described as API objects and interacted with through the API. This also makes permissions describable using API-style: principal-verb-resource style. This is where we can setup our permissions as "Principal `x` can perform verb `y` on resource `z`".

What's wrong with shell scripts? Why is an API better? Because APIs are language agonistic, we can automate the API in a number of different languages with little overhead. This is good for a system that we want to widely applicable.

### Open Source

This means that all of the source code should be available for auditing and improvement. So, if we encounter issues with our use case, we can contribute back and submit a fix. Additionally, the diverse set of contributors and users means that someone else will likely have a related use case.

It is a myth that open source is a security vulnerability because adversaries can see the codebase and look for exploits. In actuality, open source tends to be more secure because there a lot of users and contributors all ensuring that there are no vulnerabilities. Additionally, many open source groups will have 3rd party audits on occasion to double check that there are no vulnerabilities.

### Community

We want a large, welcoming community. The more user and contributors, the stronger the codebase becomes. Having users that are excited about the product and working to improve it will send the project on a positive trajectory.

## Kubernetes

The system that we're talking about is Kubernetes. It fulfils all of the requirements we've listed above and we'll go into more depth next week.