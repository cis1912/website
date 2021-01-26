---
title: "HTTP"
date: 2021-02-01
publishDate: 2020-12-01
assignments: []
slides: https://docs.google.com/presentation/d/1FVklEogqEGn6zsp8YOpCuynUCCvhB6mXusB979pMCak/edit#slide=id.p
draft: false
---

# Lecture Two: HTTP

## Motivation
DevOps is a philsophy, but infrastructure engineering is an important knowledge base for DevOps work. At least a cursory understanding of networking, specifically the HTTP protocol, is important for understanding the infrastructure behind the web, which is what we'll be covering for the rest of the lecture.

## HTTP

HTTP is the protocol behind the web. It operates on the client/server model: the client requests something from the server, and the server responds to that request with the desired result. The server will serve many clients. HTTP underlies the orchestration that we will build up to throughout the course, and so it's important to start with foundational understanding. If we run into issues with our deployments, knowledge of how HTTP enables communication over the web is going to be vital in addressing the problem.


## HTTP Request Components

We have four main components in any HTTP request:
 - Method: What do we want to do? 
  - Verbs like GET, POST, PUT
 - URL : Where are we sending the request?
 - Headers: Metadata about the request and how to handle it
  - Computer's client ID
  - Caching settings
 - Body: The data associated with the request
  - Final submission step of a form is a POST request with a body as the form data.

## HTTP Methods

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

Idempotency is an important concept with HTTP, but also in DevOps more broadly. Many times when dealing with infrastructure you want to be able to retry an action, but don't want to actually perform that action multiple times if two requests happen to both succeed.

## HTTP URLs

A URL like `https://httpstat.us/200` has three components to it:
  - `https`: This is the protocol (how we communicate with the host)
  - `httpstat.us`: This is the host (the place we are communicating with)
    - The port defaults for 80 for HTTP and 443 for HTTPS, but you can also specify with `:port` after the host.
  - `/200`: This is the path (what resource we want to access on the host)

## HTTP Headers

Headers pass metadata about the request. Here are some examples:
  - Authentication (include some header that verifies your identity)
  - Caching (we can have a header that saves the age of the request for caching purposes)
  - Conditionals (an example may be are you on mobile or browser?)
  - Cookies (Browser information that is passed to the HTTP server as a header)
  - Body info (is it in XML, JSON, or something else?)
    - `Content-Type`
    - `Content-Length`

## Body

The body is used to pass chunks of data along with the requests. Pretty straighforward, is generally text that's given in a format specified by the `Content-Type` header.

## Example HTTP Request
```
$ curl -vv 'httpstat.us/200'
*   Trying 172.67.148.117...
* TCP_NODELAY set
* Connected to httpstat.us (172.67.148.117) port 80 (#0)
> GET /200 HTTP/1.1 <Method, route and HTTP version>
> Host: httpstat.us <Header>
> User-Agent: curl/7.58.0 <Header>
> Accept: */* <Header>

<Body would go here in a POST or PUT request.>
```

The `User-Agent` header is used to determine what kind of client is connecting. Often used to determine mobile/desktop versions of websites.
