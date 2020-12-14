---
title: "HTTP and Python"
date: 2020-11-26T22:45:26-05:00
draft: false
---

# HTTP and Python

----
<!-- .slide: data-auto-animate -->
# HTTP
---
<!-- .slide: data-auto-animate -->
# HTTP

- Protocol behind the Web
- Client/Server model
- Foundation of this course

----
## HTTP Request Components

- Method
- Headers
- URL
- Body

----
<!-- .slide: data-auto-animate -->
## URL

https:// <!-- .element: style="margin:0;float:left;display:inline" -->

httpstat.us <!-- .element: style="margin:0;float:left;display:inline" -->

/200 <!-- .element: style="margin:0;float:left;display:inline" -->

---
<!-- .slide: data-auto-animate -->
## URL

- https://
- httpstat.us
- /200

----
## Method

- What should this request do?
- Defines classes of requests with different behaviors

---
## GET

- Passes parameters via url
- Guaranteed to be idempotent

```bash
$ curl -vv 'httpstat.us/200?true_param=true&false_param=false'
*   Trying 104.27.189.114...
* TCP_NODELAY set
* Connected to httpstat.us (104.27.189.114) port 80 (#0)
> GET /200?true_param=true&false_param=false HTTP/1.1
> Host: httpstat.us
> User-Agent: curl/7.58.0
> Accept: */*
```
