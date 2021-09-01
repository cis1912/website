---
title: "Monitoring and Observability"
date: 2021-10-20
publishDate: 2020-12-01
assignment: ""
slides: "https://docs.google.com/presentation/d/1JyRdZxlyVwkJhcxZ2FylB-zDz4RHSGEgNS9KMG8h3Sc/edit?usp=sharing"
draft: false
---

# Lecture Seven: Monitoring and Observability

So far in this course, we have been able to deploy our applications to production in ways that are scalable and relatively resilient, but we've generally been focusing on the "happy path" when our application is working as expected. What happens when things go wrong in our cluster? 

There are two sides of monitoring we'll consider in this lecture. the first has to do with managing expectations. If we are hosting services for some client, then that client will have certain expectations around uptime, latency, durability and other metrics that we will need to meet as a service provider. Monitoring allows us to demonstrate to clients that our services are living up to certain metrics and standards. 

The other component of monitoring the ability to debug code in production. We need to be able to access information about our cluster to be able to determine what's gone wrong.

## Metrics 

There are a few metrics that are particularly common in industry, that build upon each other:

- **SLI (Service Level Indicator)**: Concrete metric about performance (example: 99.9% uptime, 5ms request latency)
- **SLO (Service Level Objective)**: Goals for SLIs over a target window (example: average 5ms request latency over 5 minutes for one day).
- **SLA (Service Level Agreement)**: This is the actual contractural agreement between client and provider defining what SLOs the provider will meet and what the penalties will be if they don't meet those SLOs.

Metrics are important for allowing us to quantify the quality of service. We can say more than "the service is good", but can say "we provided 99.9% uptime and have a 10ms average request latency over the past month."

## Debugging through Observability

Say you open your website and see a `500 Internal Server Error` message. What do you do now? Debugging these online systems is hard and we need as much information as possible to debug. Observability is our toolbox to accomplish this. Observability is the ability to get information about the internals of the system based on the outputs of that system.

<!--Having trouble wording this at the moment... will come back but also peyton and armaan can take a crack at this. "Infer" seems to be the wrong word when prometheus is publishing actual internal state-->

**Remember**: observability is our ability to ask questions about a system, whereas monitoring is the act of collecting aggregating observable data. 

## Goals

The most optimistic goal of monitoring is to predict application failures before they happen and work to fix the root cause. If that fails, however, we at least want to be alerted to when a failure has occurred, with enough information so that we can take actions to mitigate the problem and, if necessary, bring the service back online.

Beyond mitigation, we also want to be able to do a post-mortem and understand why our system has failed. If we cannot understand what went wrong, then we cannot easily prevent the issue from occurring again. Observability plays a big role here: the more questions we can ask about our system, the more likely we are to successfully discover the root cause of the failure.

Another big goal of monitoring, especially when it comes to DevOps, is allowing developers to gain insight about issues in production. Readable dashboards and actionable alerts can play a large role here.

## What to Observe?

Here are some basic metrics of our system that we would want to aggregate over time:

- Restart Count
- CPU Usage
- RAM Usage
- Disk Usage
- Latency (aggregation by percentiles)

In addition to aggregations, we also want to be able to read the logs for our applications, as well as retrieve the stack traces for any runtime errors when they occur.


## Predicting and Alerting

Not every failure is catastrophic. If a Kubernetes pod goes down, this might actually not be an issue as Kubernetes will self-correct the problem by spinning up a new pod from the template in the Deployment. This is more of a warning than anything -- there may be a more systemic error causing the restarts if they happen frequently, but that can't be determined from a single crash. It's useful to have at least two tiers for alerts One tier for warnings (pod failure, high CPU usage, etc.) which typically will resolve themselves, and a second tier for catastrophic events that are known to require a manual fix.

A recent trend is to use machine learning to help predict site failure (sometimes called **AIOps**). Essentially, you pipe all of your logs and monitoring information to an API that uses *AI*™ to predict failures. [AWS CloudWatch](https://aws.amazon.com/cloudwatch/) is an example of such a service. This comes with the cost of observability, however because the AI is a black-box that cannot provide any insight on why it believes there will be a failure. Therefore, the alerts that come from the AI are not actionable in the way that alerts would be if they were coming from alerts defined by engineers specifically for their application.

## Monitoring Architecture

[Prometheus](https://prometheus.io/) a time-series database and information scraper that collects data from pods and nodes in the Kubernetes cluster. Prometheus then communicates this data to [Grafana](https://grafana.com/) which is a tool for data visualization. So, how does Prometheus collect the data from Kubernetes? There are two tools, `Kube-state-metrics` and `Node-exporter`, that allow Prometheus to export data from the cluster. In addition, applications running in Kubernetes can also export specific data for Prometheus. Lots of individual applications that we are hosting in our cluster like Cert Manager or Traffek also come with built-in endpoints for Prometheus to scrape for information about those applications (typically these are exposed on `:9100/prometheus`).

Here we can see the difference between **white-box** and **black-box** monitoring. When the application specifically exports information for Prometheus, this is **white-box** monitoring because the data is curated to have useful metrics for observability. Conversely, using `Kube-state-metrics` and `Node-exporter` is **black-box** monitoring as we are trying to draw conclusions about the state of the application without all of the data available to us.

Finally, Prometheus offers a specific query language called [PromQL](https://prometheus.io/docs/prometheus/latest/querying/basics/) that is similar to SQL but designed to make querying over time-series more effective. Grafana uses PromQL to extract data from the Prometheus database and presents that data for the user. Moreover, Grafana has a number of helpful templates online for data visualization, so typically a lot of the views that will be helpful to our applications are already available for download.

![Prometheus Architecture](/img/lec07/prometheus.png)

## Logging Architecture

The architecture for logging is quite different from our architecture for monitoring. Monitoring is specifically numbers and statistics about our cluster, logging instead is just a stream of plaintext that we need to store and search effectively. These are related but fairly different tasks. One example of a logging architecture is [Datadog](https://www.datadoghq.com/):

![Data Dog Architecture](/img/lec07/datadog.png)

Essentially, each worker node has a Datadog agent which monitors the logs of the containers on that specific node. The Datadog agent then sends the logs to the Datadog service which ingests the data and makes it accessible to users through its web portal.

## Microservices
<!--might be good to link out here to blog posts we like about microservices-->

Microservices are what we get when we take a large monolithic application and split it down into many smaller services. Kubernetes is excellent for microservices as it allows you to orchestrate complex groups of interoperating pods. Typically, in Kubernetes we will have one deployment per microservice.

So, what are the benefits of microservices? Generally, people believe that you can have better scale microservices more effectively because you can independently scale specific bottlenecks in your services. Additionally, your application can have different components that are written in different languages and communicate between them over the network, which is not true in large monolithic applications.

### Advanced Observability: Distributed Tracing

We know that the microservice architecture is common in Kubernetes, so how do we debug interactions between microservices? The idea is to build up a **request path** and analyze through metadata. Essentially the request path allows us to see how an incoming request percolates throughout of system. This way we can see which service is blocking or slowing down the request. One implementation of request tracing is [Jaeger](https://www.jaegertracing.io/) which helps you attach IDs to requests so you can trace them through your distributed system.

![Tracing Example](/img/lec07/tracing.png)
