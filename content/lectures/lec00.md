---
title: "Course Intro, Python Basics"
date: 2021-01-25
publishDate: 2020-12-01
assignments: []
slides: ""
draft: false
---

Hello world! This is the first lecture.

## Demos

### Poetry

One reoccurring design pattern we see in DevOps is package managers. This is a tool that helps manage your program's dependencies. In other words, the package manager is in charge of keeping track of what packages your project needs to run correctly, and then downloading those packages in a way that makes it easy for your program to use this auxillary code.

We'll look at a few different package managers over the course of the semester. Node has one called NPM (Node Package Manager), Java has a package manager called Maven, and Python has a few offerings. Note that these package managers are all a little different because they work with different languages that all have different nuances. This is why we can't reuse package managers across languages.

The Python package manager we'll be using is called Poetry. Essentially, Poetry allows you to download certain Python libraries, then it creates a virtual python environment on your machine to run your code with the given libraries. So, why the virtual environment? The answer is that Python varies a lot from version to version (especially Python 2 compared to Python 3). The virtual environment ensures that you, your team of developers, and your production environment are all on the same version of Python. This way we can avoid any issues and bugs that may arise from code that's written to work on one version of Python actually being run with a different version of Python.

Now, let's get into how to actually use Poetry. First, make sure that you have Poetry installed on your machine, instructions for installation can be found [here](https://python-poetry.org/docs/).

Once you have Poetry installed, let's create a new project:

```
# Create a new folder called poetry_demo
$ mkdir poetry_demo
# Enter the new folder
$ cd poetry_demo
$ poetry init
```

Now Poetry will give you lots of options for how to initialize your project, just hit enter for all of them (Poetry will use the default setup which is fine for our purposes). Once you've finished, you'll see that there is a new file `pyproject.toml` in the directory, this is the file that stores the information we just initialized.

Next, let's add a dependency:

```
$ poetry add numpy
Creating virtualenv poetry-demo-KkU142w6-py3.9 in /Users/airbenderang/Library/Caches/pypoetry/virtualenvs
Using version ^1.19.5 for numpy

Updating dependencies
Resolving dependencies... (39.8s)

Writing lock file

Package operations: 1 install, 0 updates, 0 removals

  • Installing numpy (1.19.5)
```

Now, Poetry actually does two things here. It downloads NumPy, but before that it actually creates a virtual environment which we are going to use to run our Python code. If we wanted to use a deprecated version of Python (like Python 2) we could configure Poetry to setup the virtual environment so it runs an older release of Python. Again, you will see a new file in your directory, this is the `poetry.lock` file that doesn't make much sense to humans but tracks which packages your program depends on and the version number of those packages.

Finally, let's run some code on Poetry's virtual environment. There are two ways that you will run python programs with Poetry. The first is you can type `poetry run script.py` and this would run a Python script in the Poetry environment, but instead we will be opening a new shell that will have the Poetry virtual environment as our default Python environment:

```
$ poetry shell
Spawning shell within /Users/airbenderang/Library/Caches/pypoetry/virtualenvs/poetry-demo-KkU142w6-py3.9
$ . /Users/airbenderang/Library/Caches/pypoetry/virtualenvs/poetry-demo-KkU142w6-py3.9/bin/activate
# Open a new Python interactive terminal
$ python
Python 3.9.1 (default, Dec 24 2020, 16:53:18) 
[Clang 12.0.0 (clang-1200.0.32.28)] on darwin
Type "help", "copyright", "credits" or "license" for more information.
>>> import numpy as np
>>> x = np.array([1,2],[3,4])
>>> x
array([[1, 2],
       [3, 4]])
>>> y = np.linalg.inv(x)
>>> y
array([[-2. ,  1. ],
       [ 1.5, -0.5]])
>>> exit() # To leave the Python terminal
# Then exit again to leave the Poetry shell
$ exit
```

It looks like NumPy works! This means that Poetry has been properly able to manage our dependencies so that they are accessible when we run our Python code with Poetry. Now, let's make a simple Python file and have Poetry run it. Create a new file called `average.py` in the same directory as your `pyproject.toml` and `poetry.lock` and paste this code into it:
```
import sys
import numpy as np

if len(sys.argv) < 2:
    print("Not enough command line arguments")
    exit()

xs = []
try:
    for i in range(1, len(sys.argv)):
        xs.append(int(sys.argv[i]))
except:
    print("Command line arguments are not integers")
    exit()

print(np.average(np.asarray(xs)))
```
Now, we can run this in the virtual environment created by Poetry:
```
$ poetry run average.py 1 2 3
2.0
```
Awesome, it looks like this is working, too. Try changing around the command line arguments!