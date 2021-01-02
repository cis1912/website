---
title: "Course Intro, Python Basics"
date: 2021-01-19
publishDate: 2020-12-01
assignments: []
draft: false
---

## Administrativa

Welcome everyone!

An overview of the topics covered and grading policy can be found on the [syllabus page](/syllabus/). A (tentative) schedule for the course can be found on the [schedule page](/schedule/).

We will use piazza for course-related discussion and office hours will be held on Zoom. Links for office hours will be posted on piazza.

If you have any questions, check [the course website](https://cis188.github.io/), ask a question on piazza or come to office hours!

This is our first time teaching the course, so bear with us as we figure out what we're doing.

## About Us

TODO:

## HTTP

Hypertext Transfer Protocol (HTTP) is the protocol the runs the web. Whenever you interact with a website, your browser (Google Chrome, Safari, Firefox, Netscape Navigator, etc) uses HTTP to communicate with that website.

HTTP follows the client–server model, which means that any number of clients (normally web browsers) can request resources from a server (the website you want to connect to).

HTTP will the the foundation of this course. We'll start by building an HTTP server in python, and then we'll learn how to package and deploy that server in a place where other people can interact with it.

### Components of an HTTP Request

The following make up the components of an HTTP request

1. Method - what type of action to perform

    Here's a table of a few of the most common method as well as some defining characteristics:

{{<table "table table-striped table-bordered">}}
| GET                                       | POST                      | PUT                                  | DELETE              |
| ----------------------------------------- | ------------------------- | ------------------------------------ | ------------------- |
| Has no body                               | Can use a body            | Uses a body                          | Deletes a resource  |
| Used for read-only operations             | Used to modify a resource | Used to create or replace a resource |                     |
| Uses Query parameters to hold information |                           | Is idempotent                        |                     |
| Is idempotent                             |                           |                                      |                     |
| Ex. Retrieving a webpage                  | Ex. Submitting a form     | Ex. Uploading a file                 | Ex. Deleting a file |
{{</table>}}

2. URL - specifices what resource to request

    For example: https://httpstat.us/200

    https:// - **Protocol** normally http or https (unencrypted or use TLS encryption).

    httpstat.us - **Hostname** the unique identifier of where to connect to.

    200 - **Path** What resource on the host to interact with.

3. Headers

    HTTP headers allow the client to attach additional information to their request. Some common headers are:
    * Authentication (`Authorization`)
    * Caching (`Ages`, `Expires`)
    * Cookies
    * Body information (`Content-Type`, `Content-Length`)

4. Body - data associated with the request

    Of the HTTP methods we've covered, a body is only used in POST and PUT.
    A body just consists of additional data that's sent as part of the request. This data is often a single file, form data, or a JSON object that the client sends to the server.

### HTTP Response components

TODO:

## Reminders

[Lab 0](/homeworks/hw0) has been released and is due 11:59 EST before next class.
