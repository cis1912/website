---
title: "The Cloud"
date: 2021-03-08
publishDate: 2020-12-01
assignments: ["hw2"]
slides: ""
draft: false
---

# Lecture Six: Cloud Kubernetes

## Traditional Infrastructure

This is what you see in movies or television:
- Numerous physical servers on racks in a data center
- One application per machine
- Lots of responsibilities (managing hardware, data center networking, etc.)

One big issue with this is that this setup is inefficient for small workloads. Say you want to have an application that serves a static website, the high-powered machine running this application will likely be under-utilized. This is bad for you as someone invested in the machine and the data center; you want to get as much return on the money your spending as possible so under-utilizing resources is no good.

## Virutalization

To avoid this issue of small workloads, we can "chop up" these robust physical machines into multiple virtual machines which are allocated only the resources needed to support a specific application. This is wonderful for efficiency and portability, but we still have to worry about all of the other responsibilities that a data center entails.

## Cloud: VMs

If we're allocating VMs for our applications to run on, why do we need the data center at all? VMs are portable and reproducible so we could just as easily have someone else managing our VMs, right?

In comes cloud providers. They manage the physical machines and provide and API through which users can access VMs. This is great for the users: there is no more physical server management! However, it does come with a cost because you are paying a cloud provider to manage your machines. There are certain companies that need in-house data centers for their applications (think finance companies trying to meet compliance standards). However, it turns out that managed cloud services are inexpensive enough that the ease of not having to manage in-house data centers is still attractive to a huge number of clients.

## Cloud: Managed Open Source Software (OSS)

Cloud providers will host OSS on their servers and allow users to rent out access to the specific software. This is great for developers because it reduces vendor lock-in, namely you can switch cloud providers relatively easily because the underlying OSS is identical. For example, migrating from Google Kubernetes Engine to Amazon Elastic Kubernetes Service is relatively straightforward.

However, this can sometimes be toxic for OSS creators because cloud providers can provide managed offerings of their service on a much larger scale at more competitive prices. This effectively takes all of the business away from all of the companies that actually developed the OSS, creating somewhat of an adversarial relationship between cloud providers and OSS creators.

One such managed OSS is Kubernetes! AWS, GCP, Digital Ocean, and others all provide managed Kubernetes offerings so that we can use Kubernetes without having to actually spin up our own cluster on our own machines. As a sidenote, Kubernetes was originally developed by Google and then ownership was transferred to the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/) which helps maintain Kubernetes. CNCF is not trying to turn a profit, so there is no conflict between CNCF and the cloud providers with a Kubernetes offering.

## Cloud: Managed Proprietary

These are services that are specific to a certain cloud provider, one example is [AWS Lambda](https://aws.amazon.com/lambda/) which allows us to process ad hoc jobs on the AWS cloud. These services have best-in-class integration with other services on the same cloud, but they also come with the drawback of vendor lock-in. If we design our infrastructure around AWS Lambda, we cannot easily switch cloud providers because the code we've written is specific to AWS Lambda and the AWS environment (it can be ported to use another serverless offering, like [Google Cloud Functions](https://cloud.google.com/functions) but this takes time and resources).

Using different offerings from different cloud providers is called **multi-cloud** infrastructure. While this is achievable, it is generally best to avoid if possible because interfacing between the different cloud providers can be quite difficult and also incurs a lot of security vulnerabilities.

## Exposing Services

How can we expose a service in our Kubernetes cluster to outside traffic? We generally have three options:

- `ClusterIp`: An IP address linked to a service which is only available from within the cluster or by forwarding a port using `kubectl`. This is great for debugging locally, but will not work in production as our users will not be using `kubectl` to forward a port on their machine to the cluster.
- `NodePort`:  Opens a port on every node in the cluster and instructs the nodes to listen on that port. Then, whenever a node gets an incoming request on that port, it forwards that request to the service associated with the port.
- `LoadBalancer`: This is a application that lives outside of Kubernetes. When you specify `LoadBalancer` service within your Kubernetes manifest, Kubernetes talks to your cloud provider and asks for a load balancer. The load balancer gets an IP and forwards data transmitted to that IP along to the node ports within your cluster. Additionally, we can configure the load balancer to load balance between the nodes in our cluster so that we can distribute the requests across the cluster.

[IMAGES]

## Ingress

Load balancers allow us to expose service on our cluster and expose it to the outside. However, we still need some additional steps to manage TLS, timeouts, authentication, etc. This is where an ingress becomes useful. An ingress will handle incoming traffic to your cluster and performs these additional steps on the request before passing them along to the services running on our cluster. Typically, the ingress will examine the `host` header in an HTTP request to route the request to the appropriate service. To specify these rules, we have to configure an ingress controller that defines these rules for how requests are forwarded to services within our cluster.

Two major ingress controllers are (Trafeik)[https://traefik.io/] and [Nginx Ingress Controller](https://www.nginx.com/products/nginx-ingress-controller/). As a sidenote, API gateways are fairly analogous to ingress controllers (they just don't use the ingress resource in Kubernetes), so if you read about API gateways online you can think of these working similarly to an ingress.

There is an important but nuanced distinction here: the Ingress resource in Kubernetes is not a physical process, instead it is just the configuration that is provided to your ingress controller (Trafeik, Nginx Ingress Controller, etc.) which does the routing.

## Productionizing Kubernetes

What we have in Kubernetes so far works great for local development, but it's not quite production ready. So what are we missing?

### Secrets

Are our secrets really secure the way that we have configured them so far? Well the secrets live in the Kubernetes manifest files which feels like a security vulnerability because anyone who is working on the codebase (or potentially the entire internet if we push our codebase to GitHub) would have access to secrets.

### HashiCorp Vault

[HasiCorp Vault](https://www.vaultproject.io/) is a tool for distributing secrets. We can initialize secrets in Vault and then have Vault load those secrets into our Kubernetes cluster; this way we can avoid having the secrets in our Kubernetes manifest files. Alternatively, Vault also provides an API which we can program our application to interface with, however authorization here can be fairly complex. Finally, Vault has highly granular permission management so that we can manage our secrets robustly, this is great because we want to limit visibility of our secrets to as few people as possible.

### Cert Manager

We want our ingress to be HTTPS, but how do we get TLS certificates to prove that our cluster actually owns the domain in question? Traditionally, this was done as a request through a web form. However, in modern architectures IP addresses are dynamic so we need to be able to dynamically request and prove ownership as the IP address changes. [Let's Encrypt](https://letsencrypt.org/) (LE) challenges allow us request a challenge, and upon completion of the challenge we will receive a certificate that our IP address owns the domain in question. [Cert Manager](https://cert-manager.io/docs/) is a Kubernetes operator that performs these LE challenges so that we can verify our ownership of the domain on demand.

## Abstraction

Writing the YAML for all of these different components of our Kubernetes cluster is manageable but still a lot of work. We can easy find ourselves duplicating YAML for difference Kubernetes objects to make only minor changes. What are some solutions?

### Kustomize

[Kustomize](https://kustomize.io/) is a tool built into kubectl that takes in a YAML file as well as a set of patches to those YAML files and produces a new YAML file with those updated patches. Say for example we had two deployments that were almost identical except for the deployment name and number of replicas, then we could write a single YAML file and use Kustomize to apply those small changes. Another example is if you have a YAML file that needs to undergo changes for development, staging, and production tiers of deployment, then you could write a single YAML file and have three potential patches on top of that file depending on your deployment tier.

### Helm

[Helm](https://helm.sh/) is a templating engine for Kubernetes manifests that allows us to create a Kubernetes manifest with variables. So, instead of hard-coding the image and tag that we want to use for a deployment, we could include it as a variable that is loaded into the YAML file when Helm compiles the manifest (if we use an image many times within our manifests, abstracting this away as a parameter saves us a lot of time). These templates are called **charts**.

### CDKs (Cloud Development Kits)

CDKs allow us to write our configuration in an actual programming language. This is great because we can have for loops, conditional statements, and types. At the end of the day, this compiles down into YAML and we still get all of the perks of declarative YAML. One example is the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) which allows us manage cloud resources in TypeScript, JavaScript, Python, Java, or C#.