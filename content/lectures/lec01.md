---
title: "HTTP"
date: 2021-02-01
publishDate: 2020-12-01
assignments: []
slides: https://docs.google.com/presentation/d/1FVklEogqEGn6zsp8YOpCuynUCCvhB6mXusB979pMCak/edit#slide=id.p
draft: false
---

# Lecture One: Networking

## 7 Layers of the OSI Model

The internet is built in layers that allow us to abstract away a lot of the complexity that is inherent to networks. One common model for layers is the OSI Model (from top to bottom):

- Application: End user later (HTTP, FTP, SSH, DNS)
- Presentation: Syntax layer (SSL, SSH, IMAP, FTP, JPEG)
- Session: Synch and send to port (APIs, sockets)
- Transport: End-to-end connections (TCP, UDP, QUIC)
- Network: Packets (IP, ICMP, IPSec, IGMP)
- Data Link: Frames (Ethernet, PPP, Switch, Bridge)
- Physical: Physical structure (Coax, Fiber, Wireless, Hubs, Repeaters)

## Internet Protocol (IP)

IP is the lowest level of abstraction that we will uncover in this course. You can think of an IP address as a single atomic element that lives on a network. A computer is given a IP address that consists of four octets (32 bits of data) separated by dots.

There are a few special IP addresses that you might become familiar with:
- Loopback
  - 127.0.0.0 - 127.255.255.255 (127.0.0.0/8)
- Private
  - 10.0.0.0 - 10.255.255.255 (10.0.0.0/8)
  - 172.16.0.0 - 172.31.255.255 (172.16.0.0/12)
  - 192.168.0.0 - 192.168.255.255 (192.168.0.0/16)

## Visualizing the Network

Say we have two machines on a subnet, this means that these machines know each other exist, and they can communicate, but they don't know _how_ to communicate. They need some shared language that will allow them to send information back and forth between them.

## A Note: IPv6

The four octets in IPv4 only gives us 32 bits of data to specify an IP address, this gives us 2^(32) = 4,294,967,296 possible IP addresses. When IPv4 was invented that seemed like more than we would ever need, but nowadays every smartphone, TV, PlayStation, or laptop might need an IP address. The solution was IPv6 which allowed for 128 bits of data in IP addresses, drastically expanding the number of available IP addresses.

However, IPv6 has really struggled with adoption because network engineers aren't too keen on migrating all of their technology to IPv6. Many big tech companies have adopted IPv6 internally, but outside of that few people have switched over. In this class we will use IPv4.

Lastly, between IPv4 and IPv6 there was an IPv5, but it was brittle and proprietary and everyone decided it was no good.

## Transport: TCP

TCP is this shared language that is layered on top of IP to allow for a shared language between computers. TCP has robust error-checking to ensure that all of the information transmitted over the internet actually gets to the destination. This error-checking can also cause a delay though as it requires the person receiving the data to also send back a confirmation that they got everything.

TCP also introduces the concept of ports. This is a number ranging from 1-65535 that allows for differentiating between connection types. Typically ports are designated for a specific kind of connection: HTTP is port 80, SSH is port 22, MySQL is port 3306. You can actually configure your machine to listen for whatever kind of connection on whichever port, but you'll confused everyone else who is expecting specific connection types on specific ports.

TCP also allows for multiple concurrent connections. For example, you could have a number of users all connecting to port 80 on an HTTP server and TCP would still be able to manage these connections. This is an essential feature, if we could only establish a single connection the client-server model could never work in networking.

There are some alternatives to TCP:
- UDP: This protocol is quite similar to TCP but without the error checking. This is great when you want data to be sent fast, and don't care too much about correctness. If you're streaming a show on Netflix, you won't notice if some pixels are flipped during a single frame of the show, so better to be fast than correct.
- QUIC: This protocol is built on UDP and is driver for HTTP/3 and will hopefully resolve some of the slowdown that comes from TCP error-checking.

## Socket Status

```
$ ss -4lt
State    Recv-Q   Send-Q     Local Address:Port       Peer Address:Port   Process
LISTEN   0        128              0.0.0.0:47497           0.0.0.0:*
LISTEN   0        4096             0.0.0.0:mysql           0.0.0.0:*
LISTEN   0        10               0.0.0.0:57621           0.0.0.0:*
LISTEN   0        1              127.0.0.1:12315           0.0.0.0:*
```

This `ss` command that allows us to examine the TCP ports on our machine. Here we can see that each process is "listening" which means that they are awaiting connections. In the client-server model these would be the servers that are awaiting connections from clients.

One key point is that in the `Local Address:Port` column we see both `0.0.0.0` and `127.0.0.1`. When we see `0.0.0.0` this means that the port can be connected to by an machine with any IP address. Conversely, when we se `127.0.0.1` this means that the process on this port can only be connected to from the host machine itself. Some examples might be if you are running a local database for a webserver, you only want your host machine to write to that database and not outside users.

## Application: HTTP

Now we layer on top of TCP up to the application layer where we implement HTTP. We can see how HTTP uses TCP which uses IP so the layers of the internet are starting to come together.

As we discussed previously, HTTP runs on a client-server model and this protocol is what powers most of the communication on the internet.

## Example Request

```
$ curl -vv 'httpstat.us/200'
*   Trying 172.67.148.117...
* TCP_NODELAY set
* Connected to httpstat.us (172.67.148.117) port 80 (#0)
> GET /200 HTTP/1.1
> Host: httpstat.us
> User-Agent: curl/7.58.0
> Accept: */*
```

Here we can see that when we send an HTTP request, we first establish a TCP connection with the host on a given port (typically port 80 for HTTP) and then we transmit the HTTP request (method, headers, and body) through the TCP connection.

Note that for each HTTP request, a new TCP connection is established to transport the information. There is some overhead to creating an TCP connection, so this is something that newer transport protocols like QUIC have attempted to improve upon.

Another solution is websockets which are built on top of HTTP to establish a persistent and bidirectional connection between two computers. This is great for use cases where small amount of information have to be sent often, like a chat server.

## HTTP Response Comments

When you make a request to an HTTP server, it sends you back a response. The HTTP response looks similar to the HTTP request:
- Status Code: A number indicating the status of the response.
- Headers: Metadata about the response, similar to those in the request.
- Body: The actual data within the response (when you request a webpage, this would be the HTML that your browser will compile and display on your screen).

## Status Codes

The status codes are organized by the first digit in the 3-digit code:
- 2xx: Success
  - 200: OK
  - 201: Created (new user registered correctly)
  - 202: Accepted
- 3xx: Redirection
  - 301: Moved Permanently
  - 302: Found
  - 304: Not Modified (for caching, more detail later)
- 4xx: Client error (people making the request messed up)
  - 400: Bad Request (server doesn't know how to response to the request)
  - 401: Unauthorized (you'll never have access)
  - 403: Forbidden (you may have access but your credentials are wrong)
  - 404: Not found (the URL path your specified does not exist)
- 5xx: Server error (people processing the request messed up)
  - 500: Internal Server Error (maybe you made a syntax error in your Python code)
  - 503: Service Unavailable

No need to remember these status codes because they're uniform across all of the internet, so it's super easy just to look them up if you encounter them. Normally the status code will be able to point you in the right direction if you're having trouble with HTTP communication.