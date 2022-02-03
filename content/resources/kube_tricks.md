---
title: Kube Tricks
---
 
Quickly scaffolding manifests:
```
kubectl create deployment foo \  
  --image=nginx:1.21 \  
  --dry-run=client \  
  -o yaml
```

K8s YAML generator with descriptions:

https://k8syaml.com/

Debugging workflow:
- `kubectl get`
	- Do I see the resources I expect?
	- What are their states?
- `kubectl describe`
	- What are the events?
	- Does the describe line up with your manifest?
- `kubectl logs`
	- Are there errors in the logs?
	- Are your requests making it to the application?
- read manifests
	- Understand the system holistically

Common helpful questions:
- How do labels work/what are your labels doing?
- Can you trace a request from your laptop to the application?