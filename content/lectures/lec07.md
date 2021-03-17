---
title: "Monitoring and Observability"
date: 2021-03-15
publishDate: 2020-12-01
assignments: []
slides: ""
draft: false
---

# Lecture Seven: Monitoring & Observability

## Monitoring

So far in this course, we have been able to deploy our applications to production in ways that are scalable, available, and reproducible, but what are we missing? What happens when something goes wrong?

One side of monitoring is that we want to be able to debug our code in production, and we need tools that give us the information we need about our cluster in order for us to understand what is going wrong. The other half of monitoring is that if we are hosting services for a client, the client will have expectations about availability and reliability of the service. Monitoring also allows us to demonstrate to our clients that our services are functioning to their standards.

## Metrics 

There are a few metrics that are particularly common in monitoring:
- **SLA (Service Level Indicator)**: Concrete metric about performance (example: 99.9% uptime, 5ms request latency)
- **SLO (Service Level Objective)**: Goals for SLIs over a target window (example: average 5ms request latency over 5 minutes for one day).
- **SLA (Service Level Agreement)**: This is the actual agreement between client and provider defining what SLOs the provider will meet and what the penalties will be if they don't meet those SLOs.

## Debugging

Say you open your website and see a `500 Internal Server Error` message. What do you do now? Debugging these online systems is hard and we need as much information as possible to debug. This is where observability comes into play. Observability is the ability to infer things about the internals of the system based on the outputs of that system.

This is the key difference between monitoring and observability: observability is our ability to ask questions about a system, whereas monitoring is the process of actually collecting that observable data.

## What to Observe?

There are basic metrics of our system that we want to aggregate over time:

- Restart Count
- CPU Usage
- RAM Usage
- Disk Usage
- Latency

We also want to have logs for our application so that we can pinpoint where in the execution of our application things might be going wrong. All of this data can help us answer questions about our system.

## Goals

Using monitoring and analytics, we would like to predict application failures if possible. If we cannot predict and preempt failures, then we at least want to be alerted when a failure has happened. More than just being a notification, alerts need to be actionable so that the moment we learn about an issue we can begin working on mitigating the problem.

Beyond mitigation, we also want to be able to do a post-mortem and understand why our system has failed. If we cannot understand what went wrong, then we cannot easily prevent the issue from occurring again. This plays into observability, because the more questions we can ask about our system, the more likely we are to successfully discover the source of the failure.

## Predicting and Alerting

Not every failure is catastrophic. If a Kubernetes pod goes down, this might actually not be an issue as Kubernetes will self-correct the problem. This is something perhaps more on a warning level of alerts, however you can also have systematic issues that prevent the application from working correctly. Typically, we separate alerts into separate tiers. One tier for warnings (pod failure, high CPU usage, etc.) which typically will resolve themselves, and a second tier for catastrophic events that requires a manual fix.

A recent trend is to use AI to help predict site failure (sometimes called **AIOps**). Essentially, you pipe all of your logs and monitoring information to an API that uses AI to predict failures. This comes with the cost of observability however because the AI is a black-box that cannot provide any insight on why it believes there will be a failure. Therefore, the alerts that come from the AI are not actionable in the way that alerts would be if they were coming from a system designed by the SRE team specifically for their application.

## Understanding

We have our metrics and our alerts, but how do we fix the failure? The alert is the first stepping stone, it tells us what is wrong. From there we can do analysis on our metrics or inspect the logs to see if there is a specific section of the application code that is causing issues.

## Monitoring Architecture

[Prometheus](https://prometheus.io/) is an information scraper that collects data from the Kubernetes cluster. Prometheus then communicates this data to [Grafana](https://grafana.com/) which is a tool for data visualization. So, how does Prometheus collect the data from Kubernetes? There are two tools, `Kube-state-metrics` and `Node-exporter`, that allow Prometheus to export data from the cluster. In addition, applications running in Kubernetes can also export specific data for Prometheus. Lots of individual applications that we are hosting in our cluster like Cert Manager or Traffek also come with built-in endpoints for Prometheus to scrape for information about those applications (typically these are exposed on `:9100/prometheus`).

Here we can see the difference between **white-box** and **black-box** monitoring. When the application specifically exports information for Prometheus, this is **white-box** monitoring because the data is curated to have useful metrics for observability. Conversely, using `Kube-state-metrics` and `Node-exporter` is **black-box** monitoring as we are trying to draw conclusions about the state of the application without all of the data available to us.

Finally, Prometheus offers a specific query language called [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) that is similar to SQL but specifically designed to make querying over time-series more effective. Grafana uses PromQL to extract data from the Prometheus database and presents that data for the user. Moreover, Grafana has a number of helpful templates online for data visualization, so typically a lot of the views that will be helpful to our applications are already available for download.

![Prometheus Architecture](/img/lec07/prometheus.png)

## Logging Architecture

The architecture for logging is quite different from our architecture for monitoring. Monitoring is specifically numbers and statistics about our cluster, logging instead is just a stream of texting that we need to store and search effectively. These are related but fairly different tasks. One example of a logging architecture is [Datadog](https://www.datadoghq.com/):

![Data Dog Architecture](/img/lec07/datadog.png)

Essentially, each worker node has a Datadog agent which monitors the logs of the containers on that specific node. The Datadog agent then sends the logs to the Datadog service which ingests the data and makes it accessible to users through its web portal.

## Microservices

Microservices is what we get when we take our large monolithic applications and split it down into many smaller services. Kubernetes is excellent for microservices as it allows you to orchestrate complex groups of interoperating pods. Typically, in Kubernetes we will have one deployment per microservice.

So, what are the draws of microservices? Generally, people believe that you can have better scalability with microservices because you can scale specific bottlenecks in your services. Additionally, your application can have different components that are written in different languages, which is not true in large monolithic applications.

## Advanced Observability: Distributed Tracing

We know that the microservice architecture is common in Kubernetes, so how do we debug interactions between microservices? The idea is to build up a **request path** and analyze through metadata. Essentially the request path allows us to see how an incoming request percolates throughout of system. This way we can see which service is blocking or slowing down the request.

![Tracing Example](/img/lec07/tracing.png)