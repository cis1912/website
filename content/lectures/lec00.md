---
title: "Course Intro, Python Basics"
date: 2021-01-19
publishDate: 2020-12-01
assignments: []
draft: false
---

Hello world! This is the first lecture.

## Demo (HTTP): Browser

The most common way to interact with an HTTP server is through the browser -- this is something we all do everyday. Let's open up a new browser window and see if we can get any more information about the actual HTTP requests underlying the page we view.

Navigate to our course site: [cis188.github.io](https://cis188.github.io/), when we load the page lots of HTTP requests are fired off to retrieve everything that your browser is going to need to compile and load this page on your computer. We can actually examine these HTTP requests by right clicking on the window and selecting `inspect element` (on certain browsers, you might have to search through the help bar or configure your browser settings to allow developer tools). In your developer tool, you will be able to see a series of requests (normally under the `network` tab).

![browser_screenshot](/demos/browser_screenshot.png)

These are all HTTP requests that sent out by your browser. You can see the the duration of each request, the status code in the response, as well as the size and type of the response data. If you select a particular request, you can see the request and response headers (metadata passed alongside the actual data being transferred). All of this information can be helpful with debugging a website that is not loading or working as expected.

## Demo (HTTP): cURL

cURL or Client URL is another way of viewing a response from a webserver as a client. Let's "cURL" the course website:
```
$ curl https://cis188.github.io/
```
this displays, as text, the actual HTML that your browser uses to render the website. Can we use cURL to see other browser resources?
```
$ curl https://cis188.github.io/img/logo.png > logo.png
```
here we are retrieving the course logo from the website. Because the logo is an image and the command cannot display images, we instead use the `>` symbol, called a redirect, to save the output to a file called `logo.png` in our working directly. If you use your computer's GUI to navigate to the terminal's current working directory, you will see this new file called `logo.png` and you can open it!

## Demo (HTTP): HTTPie

HTTPie is a command-line tool that actually allows us to send specific HTTP requests. This is something you might not already have installed so checkout the download guide [here](https://httpie.io/docs#installation). Next, let's give it a try:
```
$ http GET https://cis188.github.io/
```
this command uses HTTPie to send a GET request to the course website. The response you get back should look almost identical to what you get if you cURL the course website, but with the addition of the response headers. This allows us to examine the resposne that the HTTP server is sending and if there are any mistakes or inconsistencies we can correct them.

We can also use HTTPie to specify the request headesr when we actually send a request to a website. In a sense, we can build our own HTTP request and send it off, instead of having the browser write the request specifcally for our needs. More specifically, we can specify what kind of request we are making (GET, POST, PUT, DELETE, etc.) and we can add headers as decide the body of the request. You can see that if we try to send a POST request to the course page, we get an error:
```
$ http POST https://cis188.github.io/
```
this is because the HTTP server hosting our course website is only expect GET requests, it does not expect a user to be sending it data with a POST request.

Here's another example that queries a public weather API:
```
$ http GET api.openweathermap.org/data/2.5/weather appid=ee5663bb9450273b46632b11e97ad6ad q=Philadelphia
```
here we are including in the request two parameters `appid=ee5663bb9450273b46632b11e97ad6ad` and `q=Philadelphia`, because this is a GET request these are included as URL parmeters, if we instead send a POST request we can include the `--form` tag so that HTTPie includes these paremeters in the post body. The first paremeter is just an API key that the course instructors generated ahead of time, but the second parameter you can change to see current weather updates anywhere on Earth!

## Demo (HTTP): Postman

Postman is a tool much like HTTPie that allows us to send specific HTTP requests and closely examine the HTTP response, but it's implemented with a GUI that makes the process a little more intuitive. Let's create a new request in the Postman GUI that calls a GET to the course page:

![postman_body_screenshot](/demos/postman_body_screenshot.png)

Here we can see the request we created at the top of the page, as well as the body of the response from the HTTP server at the bottom of the page. If we tab over we can also see the headers that are included in the response:

![postman_headers_screenshot](/demos/postman_headers_screenshot.png)

Like HTTPie, Postman will let us specify URL parameters, headers, cookies (additonal data typically handled by your browser), as well as the time it took for the server to response and the size of the response. If we instead get the course logo, we can see that the size of the response is much larger because it contains the image data:

![postman_logo_screenshot](/demos/postman_logo_screenshot.png)

The other benefit of Postman is that it allows you to save reqeusts that you use typically, so if you often find yourself sending a certain request to check if a page is functioning correctly, you can avoid having to recreate that request every time you need to do that check. You can also create custom tests which you run from Postman to ensure that your are getting the responses you are expecting.

Let's use Postman to query the weather API that we examined in the HTTPie demo:

![postman_weather_screenshot](/demos/postman_weather_screenshot.png)

We've specified the two parameters in the `Params` tab, and you can see at the top of the page that Postman automatically modifies the request URL to include these as URL parameters. The response is automically prettified and displayed as JSON, but Postman can also show you the raw text response or can display it in HTML. You can also tab over and examine the response headers. Lastly, you can save the entire HTTP response to a file if you wanted to hold onto it.

For including parameters in POST requests with Postman, the process is a little more complicated. Instead of putting them in the `Params` tab, you'll click on `Body` and then on the `form-data` button. This allows you to include your parameters in the POST body which is the norm when sending POST reqeusts.