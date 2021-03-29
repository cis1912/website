---
title: "Continuous Integration / Continuous Deployment"
date: 2021-03-22
publishDate: 2020-12-01
assignments: ["hw3"]
slides: ""
draft: false
---

# Lecture Eight: CI/CD

## Developer Experience

What steps are required to deploy a new version of our code?

1. Make code change
2. Test code
3. Build Docker image
4. Tag Docker image
5. Push to Docker Hub
6. Update Kubernetes manifests to new Docker image tag
7. Apply updated manifests

This is quite a few steps, however steps 3-7 are the same every time we deploy our code, so they can be automated. This makes the deployment process quicker so that developers can focus on making code changes instead of deploying those changes.

## CI vs. CD vs. CD

There are three iterations of this automated deployment process. Typically, when we say CI/CD in this course we will be referring to Continuous Integration and Continuous Deployment.

### Continuous Integration (CI)

This is the practice of merging in code changes regularly with automated tests that run on the changes. This means we can merge features and updates as they are completed. The inclusion of automated tests (both unit tests and integration tests) allows us to ensure that these updates will not break our codebase.

### Continuous Delivery (CD)

This practice extends CI to also deploy to a staging environment where developers can their code changes.

### Continuous Deployment (CD)

This practice extends CI to deploy code changes into production if all tests pass in a staging environment. The upside here is that updates are rolled out as they are completed instead of being queued up to be deployed in batches (we can also avoid that "feature freeze" that is typically a part of this older model).

### Canary Deployment

As a side note, Canary Deployments are a specific kind of automated deployment where users are gradually shifted from one iteration of the codebase to another. This is useful if you make large changes to the codebase and are not fully confident that they are working correctly. You can direct 5% of traffic to the new deployment and 95% of traffic to the old deployment. If there is an issue with your new deployment, all is ok because a user can just re-try and chances are they will be directed to the old deployment which you know works. This is a good way to confirm that large changes have been implemented correctly, however it requires a fair bit of overhead and a very robust testing suite to reconcile potential issues with the new system.

## Git Flow

Lots of version control systems now have support for CI/CD systems, conceptually this works really well because version control is where our actual code changes are happening, so being able to move those changes right from version control into a deployment is ideal. The canonical workflow for CI/CD integration with Git is the **Git Flow**:

![Git Flow Visualization](/img/lec08/git_flow_vis.png)

While Git Flow is well adopted, it is not perfect for everything. An alternative is **Trunk Flow** where you have different branches for environments (staging, production, etc.) and branch off of those environment branches depending on what kind of code change you are making (this works really well for libraries that have lots of different feature sets and versions, but not as well for applications with a single deliverable like a web app). The general rule is: use Git Flow until Git Flow stops working for you. Once Git Flow starts to constrain your development process, you can swap to a Trunk Flow or do something more customized to fit your needs.

## How Does CI/CD Work?

Fundamentally, CI/CD is just executing bash scripts on the cloud to perform steps 3-7 of our deployment process. Typically, CI/CD is linked with a Git repository such that actions are triggered by Git events (making a pull request, merging into main, creating an issue, etc.). Finally, CI/CD is generally configured using YAML with provider-specific (CircleCI, GitHub Actions, etc.) configuration wrapping the actual commands you want to run.

## GitHub Actions

GitHub Actions is the CI/CD provider that we will be using for this course, it is built into GitHub and has a lot of excellent community support. To use GitHub Actions we add **workflows** to the `.github/workflows` directory within our repository. Each workflow represents a distinct goal or process (lint my project and deploy, run tests, remove unnecessary files, etc.). A workflow is composed of a set of jobs, each of which is essentially a single step towards accomplishing the workflow goal. Jobs can either be specific bash commands or 3rd party reusable components called **actions**. There is a extensive [GitHub Actions Marketplace](https://github.com/marketplace) where you can browse these pre-built 3rd party actions, often there are already an action written for a task you are hoping to accomplish with workflows (for example, there are actions for publishing to NPM or linting Python code).

Because the GitHub Actions documentation is a little overloaded with jargon, it can be helpful to checkout the [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions).

## Debugging CI/CD

Fair warning, debugging CI/CD can be a pain because every time we want to see how our system works we have to make a commit to our version control system, wait for that commit to register, and wait for the processes that commit triggers to run. The VSCode (YAML extension)[https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml] will help catch issues in your GitHub Actions workflows.

## GitOps

Instead of installing new versions of our application into our cluster with Helm, we can actually store the desired state of our cluster within the Git repository itself. This process is called **GitOps** and it affords us a lot of benefits:

- **Rollback**: if a change breaks out application, we can rollback using the tools available through Git.
- **Discoverability**: just like in any Git repository, we can search and share our manifests.
- **Reproducibility**: changes can be made easily to the Git repository without running additional commands to update our cluster.

### Argo

[Argo](https://argoproj.github.io/) is a tool that we can use to achieve GitOps. Essentially Argo is a process that lives in the Kubernetes cluster, polling the corresponding Git repository to check for changes. If we modify the manifests within the Git repository that is being watched, Argo will see those changes and change the desired state of our Kubernetes cluster accordingly. So, to make a change to the cluster, all we need to do is make those changes in our manifests and push those changes to our Git repository. This is much more streamlined than installing the new application with Helm every time we need to update our cluster.

![Argo Visualization](/img/lec08/argo_vis.png)

## Where We've Been

Let's diagram out the tools which we've learned about this semester:

![Lectures 0 to 7 Visualization](/img/lec08/drawing_1.png)

Here we see both Peyton and Armaan can both run our FastAPI server locally thanks to Docker. Then, if Armaan wants to host the FastAPI server in the cloud, he can request a cluster through AWS's EKS service (any other cloud provider with a Kubernetes offering would also work). From here, Armaan can apply the Kubernetes manifests into his cluster using kubectl.

![Lecture 8 Visualization](/img/lec08/drawing_2.png)

Now, with the inclusion of CI/CD, we can see how this process changes. Now, if Armaan wants to deploy the FastAPI server from his local machine, he can `git push` the code into a GitHub repository. Assuming we have setup our CI/CD using GitHub Actions, we would then have two major GitHub Actions which are triggered by this push. First, the newly built Docker image is published to the GitHub Container Registry (abbreviated GCR, but watch out because Google Container Registry is also GCR) and typically tagged by the Git SHA of the most recent commit. Additionally, another action runs `helm upgrade` on our Kubernetes cluster to load the new manifests into the cluster. The new manifests will link to the new Docker image which we published to GCR and will pull that image into our Kubernetes cluster.

# Demo

To do the demo you need your own Git repository so you can test out workflows. Fork [this](https://github.com/cis188/ci-demo) repository and clone the forked repository onto your machine. Once you have cloned the forked repository, reset the repository to an earlier commit as follows so that we can do the steps demoed in lecture:
```
$ cd ci-demo
# Reset to the commit labelled "testing"
$ git reset 43d48188948c858e6428f064f41ada57484af33b
# Ignore changes in staging area
$ git restore .
# Push this reset to the repository in GitHub
$ git push --force
```
Now, let's take a look at our `publish.yaml` workflow in `.github/workflows`:
```(yaml)
name: Lint and Publish
on: push
jobs:
  lint:
    name: Run lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: |
          yarn install
          yarn lint
  publish:
    name: Publish to github package registry
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: echo "TODO:"
```
So we have two jobs, one that lints and the other which publishes. Looking at the lint job, we see that it runs two commands: `yarn install` and `yarn lint`. This is just installing the yarn dependencies and then running the associated lint command. We also see that both jobs have `runs-on: ubuntu-latest` which tells GitHub Actions that we want this job to run on an Ubuntu virtual machine running the latest version of Ubuntu (remember though that using the latest tag can result in all types of issues, so it would be better to specify the Ubuntu version with `runs-on: ubuntu-20.04`). Finally, we have this `uses: actions/checkout@v2` line in both jobs. This tells GitHub Actions to use the pre-defined action [actions/checkout](https://github.com/actions/checkout). The [actions](https://github.com/actions) project contains a number of pre-defined actions created by the team at GitHub. This action essentially just clones your repository into the virtual machine running the job, the reason that GitHub doesn't do this automatically is that certain jobs might not actually need your repository code to run.

Now, let's look more closely at this publish job. We want to publish our application as a package on NPM. Luckily, there is a pre-defined job which will do this for us called [npm-publish](https://github.com/marketplace/actions/npm-publish). If we can over the documentation provided in the repository README, we can get a good sense of how to integrate this into our workflow. Update the publish job to be:
```
publish:
    name: Publish to github package registry
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: JS-DevTools/npm-publish@v1
        with:
            registry: https://npm.pkg.github.com
            token: ${{ secrets.GITHUB_TOKEN }}
            tag: ${ GITHUB_SHA }
```
Now, the publish job will use `JS-DevTools/npm-publish@v1` and the `with` keyword allows us to provide parameters to this pre-built action. The two we provide are `registry: https://npm.pkg.github.com` which tells the action to use GitHub's NPM package registry instead of the actual NPM registry (we already have a GitHub auth token built-in, so this is easier). The second `token: ${{ secrets.GITHUB_TOKEN }}` sets the token to be the GitHub token which is unique to our repository (using templating similar to that which we saw in Helm). GitHub uses this token when authorizing new packages to their package registry, so we need to provide this otherwise we will not be able to publish.

After making these changes, let's run our workflow and see how it looks:
```
$ git add .
$ git commit -m "Updated publish job"
$ git push
```
the workflow should take a little while to run, but after thirty seconds or so on GitHub you should see:

![Lint Job Screenshot](/img/lec08/lint_screenshot.png)

for the lint job, additionally for the publish job you should have:

![Publish Job Screenshot](/img/lec08/publish_screenshot.png)

If your workflow did not run, you may need to make an additional commit (just change something in `index.js`) for GitHub to recognize that workflows should be run.

Next, we probably don't want to publish our package to the package registry if it doesn't pass the linter. So, we want to configure our workflow such that the publishing job depends on the lint job. We can do this by adding the `needs: lint` keyword to our publish job:
```
publish:
    name: Publish to github package registry
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v2
      - uses: JS-DevTools/npm-publish@v1
        with:
            registry: https://npm.pkg.github.com
            token: ${{ secrets.GITHUB_TOKEN }}
```
Let's commit and make sure the dependency is reflected in our workflow: 
```
$ git add .
$ git commit -m "Added publish job depends on lint job"
$ git push
```
Now, you should be able to see the dependency graph on GitHub:

![Needs Example Screenshot](/img/lec08/needs_screenshot.png)

Think about what other parts of the development process you might be able to automate with GitHub Actions: running tests, test coverage reports, dependency deprecation checks, installing into a Kubernetes cluster with Helm, etc. Feel free to experiment with your repository using different actions available on the GitHub Actions Marketplace!