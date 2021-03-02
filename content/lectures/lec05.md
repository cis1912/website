---
title: "Practical Kubernetes"
date: 2021-03-01
publishDate: 2020-12-01
assignments: []
slides: ""
draft: false
---

# Lecture Five: Kubernetes

## Namespaces

Namespaces are ways to separate resources. This is just an easy way to group resources together under a common name. An example might be if we have a set of Secrets which we use in our deployment, we might want to use a namespace to group them together so we can access them individually and we know that they are distinct from other the Secrets. While many Kubernetes resources are scoped to a namespace, some are not (such as ClusterXYZ). 

[NAMESPACE EXAMPLE YAML HERE]

## Secret

Secrets are used to store sensitive runtime information such as API keys, username/passwords, or certificates. Secrets are stored as base64 in the API server. On the container, they can be mounted to files or exported to environment variables. Note that while they are base64 encoded, if an adversary gains admin privileges on the Kubernetes API they can just decode the Secrets from base64 and read them. So, while Secrets are intended to be for sensitive information, they are not infallible.

The default secret type is [Opaque Secrets](https://kubernetes.io/docs/concepts/configuration/secret/#opaque-secrets) which can be used to store arbitrary data. Other [types of Secrets](https://kubernetes.io/docs/concepts/configuration/secret/#secret-types) can be used for specific sensitive information (such as SSH credentials or TLS data).

[SECRET EXAMPLE]

## ConfigMap

These are for non-sensitive runtime configuration. Similarly to Secrets, ConfigMaps can be mounted to files or exported to environment variables.

[CONFIGMAP EXAMPLE]

## Jobs and Cronjobs

These are short-lived containers that are intended to run a specific task. Cronjobs allow jobs to be run on schedules. The scheduling syntax is the [same scheduling format as Cron in Unix](https://en.wikipedia.org/wiki/Cron). You can use the tool [https://crontab.guru/](https://crontab.guru/) to select the correct schedule.

[CRONJOB EXAMPLE]

At first it seems cumbersome that we have to next four or five YAML objects just to run a Cronjob. While this is a lot of boilerplate, there is a good reason for it. The idea here is that we want modularity. A Cronjob is just a job with a schedule which is just a container with a run command. While this modularity results in more complex YAML, it makes it much easier for us to reason about our object because it is really just a composition of simpler objects.

## Volumes

Volumes are used to provide filesystem-based persistence across application restarts or node reschedules. There [PersistentVolumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/) (PV) which is a physical representation of a disk in the API. Then we have [PersistentVolumeClaims](https://kubernetes.io/docs/concepts/storage/persistent-volumes) (PVCs) which is a request for access to a PersistentVolume. Then we can bind PVCs to PVs.

A PV is really a representation of the physical block where storage exists, and the PVC is a request to access that storage. This feels a little over-engineered, but it is actually really helpful when using cloud services like AWS where volumes are allocated independently of the machine running the containers.

## StatefulSet

This is a deployment where each pod gets a persistent volume. This is used for applications that need to be resistant to reboots. Common applications include:
- Distributed Databases: MongoDB, CockroachDB, Cassandra
- Games: Minecraft
- Search: AWS Elasticsearch

[STATEFULSET DIAGRAM]

Note that each StatefulSet has its own PV, therefore if want to StatefulSet Pod 0 to be able to access PersistentVolume 1 we need some trickery that can be troublesome [what do I mean here]?

## DaemonSet

This is a deployment where we have one pod per node. This is used to provide node-wide services such as:
- Authentication gateways
- Ingress router
these are services that we need to have on each node so that we can authenticate or route ingress regardless of which node is handling the request.

In AWS you can pay significantly less for VMs (up to 90%) if you use spot instances (offhand VMs that AWS reverses the right to take away from you at any time). Kubernetes works well with spot instances because we care less about the individual nodes and more about being able to maintain our desired state outlined in our manifest. So, one good example of a DaemonSet is an AWS termination handler, which polls AWS about whether or not the given node is going to be removed. When the termination handler gets the response that it is going to be removed it can gracefully drain the pods on the given node to other nodes; this way none of our services get interrupted.

## Annotations

Used to store auxillary information about a resource. Annotations are paired with a specific resource, so they are unlike ConfigMaps which can be tied to multiple resources. They are non-identifying and common use cases include:
- Special routing rules on ingresses
- Record last applied config
- Request a GPU in a cloud provider

## Kubernetes as an Abstraction

Sometimes instead of thinking about Kubernetes as a container orchestration tool, it can be better to think about it as an abstraction that allows us to reason about infrastructure. Kubernetes is the most popular container orchestration tool not because it is the best at orchestrating containers, but because the abstractions are simple and elegant.