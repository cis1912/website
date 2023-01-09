---
title: "HTTP"
date: 2023-01-25
publishDate: 2022-09-16
slides: "https://docs.google.com/presentation/d/1FVklEogqEGn6zsp8YOpCuynUCCvhB6mXusB979pMCak/edit#slide=id.p"
draft: false
type: lec
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

IP is the lowest level of abstraction that we will uncover in this course. You can think of an IP address as a single atomic element that lives on a network. A computer is given a IP address that consists of four octets (32 bits of data) separated by dots. A subnet is a subset of all IP addresses available. The IP ranges given for Loopback and Private IPs below represent subnets, but a subnet can be any range of IPs.

There are a few special subnets that you might become familiar with:
- Loopback: IP addresses on the local machine.
  - 127.0.0.0 - 127.255.255.255 (127.0.0.0/8)
- Private: Only for devices on the inside of the local network, are never surfaced publicly
  - 10.0.0.0 - 10.255.255.255 (10.0.0.0/8)
  - 172.16.0.0 - 172.31.255.255 (172.16.0.0/12)
  - 192.168.0.0 - 192.168.255.255 (192.168.0.0/16)
  
If you'd like to see your IP address on your machine, you can run one of these commands depending on your OS:

- Linux: `ip addr show`
- Mac: `ifconfig`
- Windows: `ipconfig \all`


## Visualizing the Network

Say we have two machines on a subnet, this means that these machines know each other exist, and they can communicate, but they don't know _how_ to communicate. They need some shared language that will allow them to send information back and forth between them.

![Subnet Diagram](/img/lec01/vis1.png)

## A Note on IPv6

The four octets in IPv4 only gives us 32 bits of data to specify an IP address, this gives us 2^(32) = 4,294,967,296 possible IP addresses. When IPv4 was invented that seemed like more than we would ever need, but nowadays every smartphone, TV, PlayStation, or laptop might need an IP address. The solution was IPv6 which allowed for 128 bits of data in IP addresses, drastically expanding the number of available IP addresses.

However, IPv6 has really struggled with adoption because network engineers aren't too keen on migrating all of their technology to IPv6. 45% of network traffic in the US happens over IPv6, but that's because many big tech companies have adopted IPv6 on their internal networks. Outside of that, few people have switched over, so we'll use IPv4 throughout this class.


## Transport Layer: TCP

TCP is a protocol that is layered on top of IP to allow for a shared language between computers. TCP has robust error-checking to ensure that all of the information transmitted over the internet actually gets to the destination. This error-checking can also cause latency and congestion issues as it requires the person receiving the data to also send back a confirmation that they got everything.

TCP also introduces the concept of ports. This is a number ranging from 1-65535 that allows for differentiating between connection types. Typically ports are designated for a specific kind of connection: HTTP is port 80, SSH is port 22, MySQL is port 3306. You can actually configure your machine to listen for whatever kind of connection on whichever port, but you'll confused everyone else who is expecting specific connection types on specific ports.

TCP also allows for multiple concurrent connections. For example, you could have a number of users all connecting to port 80 on an HTTP server and TCP would still be able to manage these connections. This is an essential feature, if we could only establish a single connection the client-server model could never work in networking.

There are some alternatives to TCP:
- UDP: This protocol is quite similar to TCP but without the error checking. This is great when you want data to be sent fast, and don't care too much about correctness. If you're in a Zoom call, you won't notice if some pixels are flipped during a single frame or some audio is warbled as long as the call keeps up with real time, so better to be fast than correct.
- QUIC: This protocol is built on UDP and is driver for HTTP/3 and will hopefully resolve some of the latency issues that come from TCP error-checking.

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

## Application Layer: HTTP

Now we layer on top of TCP up to the application layer where we implement HTTP. We can see how HTTP uses TCP which uses IP so the layers of the internet are starting to come together.

HTTP is the protocol behind the web. It operates on the client/server model: the client requests something from the server, and the server responds to that request with the desired result. The server will serve many clients. HTTP underlies the orchestration that we will build up to throughout the course, and so it's important to start with foundational understanding. If we run into issues with our deployments, knowledge of how HTTP enables communication over the web is going to be vital in addressing the problem.

## Components of a HTTP Request

 There are four main components of any HTTP request:
- Method: What do we want to do? 
    - Verbs like GET, POST, PUT
- URL : Where are we sending the request?
- Headers: Metadata about the request and how to handle it
    - Computer's client ID
    - Caching settings
- Body: The data associated with the request
    - For example, final submission step of a form is a POST request with a body as the form data.
    
### HTTP Methods

 There are a number of HTTP methods, but we will use primarily these four:
- GET
    - No body
    - Idempotent (same request gets the same result)
    - No side effects
    - URL parameters (http://youtube.com/?search=avatar)
    - Common use case is to retrieve the content of a webpage
- POST
    - Has a body.
    - Will have side effects (posting a comment on a post)
    - Common use case is form submission (think user registration)
- PUT
    - Puts the body onto the server
    - Idempotent
    - Common use case is file upload (profile picture)
        - Putting the same file onto the server multiple times should only upload one file
- DELETE
    - Deletes the resource at the given URL (assuming you have permissions)
    - Common use case is deleting a file (deleting your profile picture)

Idempotency is an important concept with HTTP, but also in DevOps more broadly. An operation is idempotent when, no matter how many times it is performed on a system, the system only changes as if it was performed once. A simple example is multiplying a non-zero integer by zero. `4*0=0`, and `4*0*0=0` and so on. The "multiply by zero" operation has an effect on the resulting product the first time, but any more applications of the operation won't change the outcome.

Bringing this back to DevOps, there are many times when you want to be able to retry an action, but don't want to actually perform that action multiple times if two requests happen to both succeed. If you want to provision a virtual machine on a cloud provider, retrying the "provision" action shouldn't result with you having two virtual machines, paying twice what you expected to pay.


### HTTP URLs

A URL like `https://httpstat.us/200` has three components to it:
- `https`: This is the protocol (how we communicate with the host)
- `httpstat.us`: This is the host (the place we are communicating with)
  - The port defaults for 80 for HTTP and 443 for HTTPS, but you can also specify with `:port` after the host.
- `/200`: This is the path (what resource we want to access on the host)

### HTTP Headers

Headers pass metadata about the request. Here are some examples:
- Authentication (include some header that verifies your identity)
     - [`Authorization`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization)
    - [`WWW-Authenticate`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate)
- Caching (we can have a header that saves the age of the request for caching purposes)
    - [`Cache-Control`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
    - [`ETag`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag)
- Cookies (Browser information that is passed to the HTTP server as a header)
    - [`Cookie`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cookie)
- Body info (is it in XML, JSON, or something else?)
    - [`Content-Type`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
    - [`Content-Length`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Length)

### Body

The body is used to pass chunks of data along with the requests. Pretty straighforward, is generally text that's given in a format specified by the `Content-Type` header.
 
 
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

Note that for each HTTP request up to version 1.1, a new TCP connection is established to transport the information. There is some overhead to creating an TCP connection, so this is something that newer transport protocols like [HTTP/2](https://en.wikipedia.org/wiki/HTTP/2) and [QUIC](https://en.wikipedia.org/wiki/QUIC) have attempted to improve upon.

Another solution is websockets which are built on top of HTTP to establish a persistent and bidirectional connection between two computers. This is great for use cases where small amounts of information have to be sent often, like a chat server.

## Components of HTTP Responses

When you make a request to an HTTP server, it sends you back a response. The HTTP response looks similar to the HTTP request:
- Status Code: A number indicating the status of the response.
- Headers: Metadata about the response, similar to those in the request.
- Body: The actual data within the response (when you request a webpage, this would be the HTML that your browser will compile and display on your screen).

### Status Codes

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

No need to remember these status codes because they're uniform across all of the internet, so it's super easy just to look them up if you encounter them. Normally, googling the status code will be able to point you in the right direction if you're having trouble with HTTP communication.

