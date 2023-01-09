---
title: "The Cloud"
date: 2023-03-01
publishDate: 2020-12-01
slides: "https://docs.google.com/presentation/d/1G0fL13ac4V1VI7fpOQkTGdhaxySmv2NETfjSjGh0mTc/edit?usp=sharing"
draft: false
type: lec
---

# Lecture Six: Cloud Kubernetes

## Traditional Infrastructure

Traditionally, from the beginning of the web in the 1990s up through 2009 or 2010, traditional server infrastructure was oriented around physical machines. There are three general steps in terms of complexity within this traditional structure: the "server under a desk", colocation centers, and datacenters.

### "Server under the desk"

The "server under a desk" is exactly what it sounds like. Developers can (and did) set up static IP addresses through their internet service providers (ISPs) and simply plug in a server, expose its HTTP ports to the internet, and serve traffic. This approach can work for small sites that don't see a lot of traffic, but along with performance bottlenecks on a single, small machine that we've addressed previously, there's also the question of reliability. Apartments and offices might not have power 24/7/365: fuses sometimes trip, and generators aren't particularly common. If you want to host your web services out of your home or office, then you're responsible for everything from service reliability down to electricity. Networking can also be an issue. Sharing an Ethernet connection with the rest of the office can come at the expense of reliability and speed.

### Colocation Centers
The next step up the complexity chart are colocation centers. In colocation centers, a developer or team of developers can rent whole servers within datacenters. The largest improvements over the "server under a desk" setup are that most of the basic needs of the server are taken care of by the colocation facility itself. Power, air conditioning, and networking are overseen by professionals that a development team would otherwise have to manage themselves. The prices for these additional services are included in the rental costs that are paid to the colocation center.

### Datacenters

When services reach a certain size, single servers within a colocation center aren't enough. Larger companies can spend hundreds of thousands and sometimes millions of dollars to build first-party datacenters to host their web services. When running a datacenter, companies have to hire specific staff to deal with networking, physical and cybersecurity, power management, and air conditioning, among other needs. It's a huge capital investment that generally requires outside capital, either from venture capitalists or through an IPO.

A big drawback of traditional infrastructure is that teams and companies must move up the levels of complexity *before* their traffic demands it. It's important to always have excess capacity to be able to handle future growth, forcing developers to overprovision their infrastructure. In the case of moving from an in-house server to a colocated server, that change might not be too onerous, but constructing a datacenter requires months of engineering and financial planning, only for there to be significant amounts of excess compute power sitting around once it's finished, waiting for demand and network traffic to increase. Clearly, there's a problem with the speed and agility that developers, who deal mostly with software, expect, and the realities of dealing with the operations of hardware in the physical world. The first step on the solution to this is virtualization.

## Virtualization

Virtualization allows us to provision servers that of any size to handle different workloads. Rather than live with under-utilization of a physical server, it can be split up into many VMs which are only allocated the resources that given applications need to run. Virtualization works pretty well at the datacenter level to help with under-utilization, but most moderately sized companies would still need to employ network engineers, HVAC technicians, electricians and security staff in order to run their datacenters. Even in the case of virtualization inside a colocated environment, the Ops engineers still have to manage the host servers rather than just dealing with the VMs.

At this point, the clear question is "If I'm operating inside a VM all the time, what am I doing still managing my own hosts?"

## The Cloud and Virtual Machines

This kind of question is the question underlying the motivation for the cloud. Cloud computing is a system under which clients can rent out services from cloud providers (AWS, Azure, GCP, etc) for a fee.

In this model, cloud providers build and manage datacenters with physical machines and provide an API through which users (in this case, other developers) can access Virtual Machines running inside those datacenters. Now, customers of the cloud don't have to manage their own physical servers and can instead delegate that work to the cloud providers, for a cost. The Cloud has not fully taken over application hosting, however. Many companies have sunk vast resources into their own datacenters over the past two decades, and certain industries, like banking and finance, require in-house datacenters for security and compliance reasons. But for the majority of use cases, it's now cheaper and easier, once you factor in labor costs, to rent VMs and compute resources from a cloud provider than it is to manage a physical machine directly.

Once we've decided that we're going to use the cloud over managing our own machines, what kinds of services can the cloud provide for us? In addition to "bare" VMs, there's two general umbrella categories.

#### Cheaper and easier?

When we describe using the cloud as "cheaper and easier", we're specifically referring to the benefits the cloud gives organizations in terms of labor costs and technical complexity. Without the cloud, organizations must pay sysadmins and datacenter technicians to manage servers. These employees are expensive, so it can make sense to use resources from the cloud. While an individual VM may be more expensive in the cloud than on-premise, the infrastructure needed to host that VM is likely much more costly than the cloud provider's fee.

### Managed Open Source Software (OSS)

The history of the Web is tied up in the history of Open Source Software (OSS), from webservers like Apache to databases like MySQL and Postgres, to newer projects like Kubernetes itself. In many instances, this software can be difficult to run and maintain due to its complexity, and requires a significant amount of domain knowledge to run effectively. Traditionally, System Administrators (Sysadmins) or Database Administrators (DBAs) would be employed by companies to manage these services. Along with the management of physical infrastructure, Cloud providers also will host OSS products on their servers, abstracting away even the underlying VMs and providing application-level APIs. This is great for developers because it reduces vendor lock-in i.e. you can switch cloud providers relatively easily because the underlying OSS is identical. For example, migrating from Google Kubernetes Engine to Amazon Elastic Kubernetes Service is relatively straightforward. Additionally, companies can get by with fewer sysadmins and DBAs, since the cloud providers are serving that role for organizations.


#### Drawbacks of Managed OSS

However, this can sometimes be toxic for OSS-maintaining companies because cloud providers can provide managed offerings of their service on a much larger scale at more competitive prices. This effectively takes all of the business away from all of the companies that actually developed the OSS, creating somewhat of an adversarial relationship between cloud providers and OSS corporations. Because of this, many OSS companies have moved away from traditional licenses towards license that restrict distribution more such as the [BSL](https://www.cockroachlabs.com/blog/oss-relicensing-cockroachdb/) or [SSPL](https://www.mongodb.com/licensing/server-side-public-license).

One such managed OSS is Kubernetes! AWS, GCP, Digital Ocean, and others all provide managed Kubernetes offerings so that we can use Kubernetes without having to actually spin up our own cluster on our own machines. As a sidenote, Kubernetes was originally developed by Google and then ownership was transferred to the [Cloud Native Computing Foundation (CNCF)](https://www.cncf.io/) which helps maintain Kubernetes. CNCF is not trying to turn a profit, so there is no conflict between CNCF and the cloud providers with a Kubernetes offering.

### Managed Proprietary Software

These are services that are specific to a certain cloud provider. A good example is [AWS Lambda](https://aws.amazon.com/lambda/), which is AWS's runtime for "serverless functions," basically tasks to run on the AWS cloud when triggered by some event. Proprietary services have best-in-class integration with other services on the same cloud, but they also come with the drawback of vendor lock-in. If we design our infrastructure around AWS Lambda, we cannot easily switch cloud providers because the code we've written is specific to AWS Lambda and the AWS environment. The behavior of our Lambda services *can* be ported to another serverless offering, like [Google Cloud Functions](https://cloud.google.com/functions), but this would most likely be closer to a rewrite than a simple migration.

How can we avoid lock-in? One of the best ways is to use the techniques we've been learning in this class so far: containerization and Kubernetes.

## Cloud Kubernetes

While running Kubernetes locally and in the cloud both use the same API, there are some differences about what you need to do in order to effectively run Kubernetes in a cloud environment.

### Exposing Services

As we learned previously, Services are the resource we use for assigning IP addresses and hostnames to specific applications in our cluster. The default Service type, `CluseterIP`, can only make our application available from inside the cluster. Kubernetes actually has three kinds of Service:

- `ClusterIP`: An IP address linked to a service which is only available from within the cluster or by forwarding a port using `kubectl`. This service type should only be used for services that only communicate in-cluster.
- `NodePort`:  Opens a port on every node in the cluster and instructs the nodes to listen on that port. Then, whenever a node gets an incoming request on that port, it forwards that request to the service associated with the port. If we have a NodePort with port `8080` attached to our Service, we could visit our application by going to the IP address of any node in the cluster and sending a request to port `8080`. Kubernetes will then handle routing the request to a proper service.
- `LoadBalancer`: A load balancer is an application that lives outside of Kubernetes. When you specify a Service of the `LoadBalancer` kind in Kubernetes, Kubernetes will reach out to your cloud provider and request a load balancer be provisioned. The load balancer gets an IP and forwards data transmitted to that IP along to the nodes within your cluster. By default, the load balancer will distribute requests between the nodes in our cluster in a round-robin pattern.

### The Ingress Resource

[Ingress controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/) allow us to expose multiple services in our cluster through a single load balancer. They also manage TLS, request timeouts, authentication, and other networking responsibilities rather than having those delegated to the application itself. Typically, the ingress will examine the `host` header in an HTTP request to route the request to the appropriate service. To specify these rules, we have to configure an [Ingress resource](https://kubernetes.io/docs/concepts/services-networking/ingress/) in our cluster that defines these rules for how requests are forwarded to services within our cluster.

Two major ingress controllers are [Traefik](https://traefik.io/) and [Nginx Ingress Controller](https://www.nginx.com/products/nginx-ingress-controller/).

There is an important but nuanced distinction to be made: the Ingress resource in Kubernetes is not a physical process, but the configuration that is provided to the cluster's ingress controller (Traefik, Nginx Ingress Controller, etc.) which is responsible for routing requests to different services in the cluster.

### Productionizing Kubernetes

What other pieces from the puzzle are missing in order for us to run Kubernetes in the cloud securely and efficiently in production?

#### Secrets

When running Kind locally, we defined our Secrets in Kubernetes manifests and applied them to the cluster like we would any other resource. But are Secrets created in this way really, well, secret? They exist in plaintext on developer laptops, synced in with source control. Generally, it's good security practice not to include secrets within source control so that it's more difficult for sensitive data and credentials to leak out through inspection of open source git history, for example. How can we manage this in Kubernetes? There are a few solutions we'll discuss below.

##### HashiCorp Vault

[HasiCorp Vault](https://www.vaultproject.io/) is a tool for storing and distributing secrets. It stores secrets encrypted at rest, and has a complex permission system for fine-tuning what users can read and write which secrets inside of Vault. Vault can be configured to sync secrets into Kubernetes itself. Alternatively, Vault provides an API which we can program our application to interact with directly. The second option is generally considered more secure, especially if you can't trust all the applications running in a given cluster, but the authorization process can also be fairly complex.

##### Cert Manager

We want our entrypoints to the cluster to be secure through HTTPS, but how do we get TLS certificates to prove that our cluster actually owns the domain in question? Traditionally, this was done as a request through domain registrars. However this process is very manual, requiring a human action every time a new domain is registered or a certificate needs to be rotated. [Let's Encrypt](https://letsencrypt.org/) (LE) challenges allow us to programatically request a challenge, and upon completion of the challenge we will receive a certificate proving that we own the domain in question. [Cert Manager](https://cert-manager.io/docs/) is a Kubernetes operator that performs these LE challenges so that we can verify our ownership of the domain on demand.

### Template Abstractions

Writing the YAML for all of these different components of our Kubernetes cluster is manageable but still a lot of work. As we've seen, there's tons of duplicated strings around label selectors, and tons of boilerplate around constructing resources like CronJobs. We can easy find ourselves copy/pasting YAML for difference Kubernetes objects to make only minor changes. A software development mantra you might have encountered is [Don't Repeat Yourself, or DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself). At its core, DRY states that if you want to change some aspect of your system, there should be a single source of truth for that property, and changing it once should affect it everywhere. As is the spirit of DevOps, we can take this principle and apply it to our infrastructure as well as our code! Below we've catalogued a few different solutions that are out there:

#### Kustomize

[Kustomize](https://kustomize.io/) is a tool built into kubectl that takes in a YAML file as well as a set of patches to those YAML files and produces a new YAML file with those updated patches. If we had two deployments that were almost identical except for the deployment name and number of replicas, then we could write a single YAML file and use Kustomize to apply those small changes as patches. Another usecase for Kustomize is separate tiers and environments. If we have a YAML file that needs to undergo changes for development, staging, and production tiers of deployment, then you could write a single YAML file and have three potential patches on top of that file depending on your deployment environment.

While this is an improvement over copy/pasting entire YAML manifests, it's still a lot of work, and not very DRY, to specify patches for every place in the yaml where a property needs to change.

#### Helm

[Helm](https://helm.sh/) is a templating engine for Kubernetes manifests. Instead of hard-coding the image and tag that we want to use for a deployment, we could include it as a variable that is loaded into the YAML file when Helm compiles the manifest (if we use an image many times within our manifests, abstracting this away as a parameter saves us a lot of duplication). These templates are called **charts**.

#### CDKs (Cloud Development Kits)

CDKs allow us to write our configuration in an actual programming language. This is great because we can have for loops, conditional statements, and types. At the end of the day, this compiles down into YAML and we still get all of the perks of declarative YAML. One example is the [AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/home.html) which allows us manage cloud resources in TypeScript, JavaScript, Python, Java, or C#.

