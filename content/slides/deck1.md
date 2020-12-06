---
title: "Welcome"
date: 2020-11-26T22:45:26-05:00
draft: false
---

## Welcome to CIS 188!

----

# About Us

TODO: add pictures, fun facts

---
## Peyton

- Junior in CIS
- peyton is so bad at math he had to drop out of nets

---
## Armaan

- Junior in CIS and (wait for it) Finance
- armaan's fun fact is that he has no free time ever

---
## Davis

- Senior in CIS
- resident cranky old man
- fun fact: davis was right about covid

---
## Campbell

- Sophomore in NETS
- resident baby
- fun fact: campbell refuses to sleep ... ever

----
## Housekeeping

- Grade breakdown
  - 60% homework (6 homeworks)
  - 40% final project
- Gradescope for submission
- Piazza for class questions
- Two 2-hour office hour sessions per-week

----
## What is DevOps?

DevOps is the breaking down of the wall between Developers and Operations to allow more frequent and reliable feature shipping.

----
## Traditional model of deployment
1. Developers write code
2. Code gets thrown over to Ops
3. Ops deploys the code and handles its reliability

---
<!-- .slide: class="dense" -->
## Issues with this model

- Developers and Ops are enemies of each other
  - Ops has no buy-in on the features developers build
  - Developers has no buy-in on the reliability of their software
- New features are slow-to-deploy, often requiring extensive QA cycles
- When a crash happens in production, the people handling the crash aren't the ones familiar with the code!

---
## DevOps solutions

- Automated testing and deployment
- Easy deploy rollback
- Observability

----
## Course Goals

- Learn about DevOps philosophies
  - Covered in lecture
- Learn to implement such philosophies
  - Covered in lecture + homeworks

----
<!-- .slide: data-auto-animate -->
# Python

---
<!-- .slide: data-auto-animate -->
# Python

- Easy to learn
- Easy to read/write
- Wide library support

----

## Control Flow

```python [1|3|4|5-7|6|8-12]
import time

for i in range(1, 16):
    print(i)
    if i % 3 == 0 and i % 5 == 0:
        print(time.time())
        print("fizzbuzz")
    elif i % 3 == 0:
        print("fizz")
    elif i % 5 == 0:
        print("buzz")
```

---

```
$ python3 test.py
1
2
3
fizz
4
5
buzz
6
fizz
7
8
9
fizz
10
buzz
11
12
fizz
13
14
15
1607229328.9530184
fizzbuzz
```

----
## Functions

```python[1|11|]
def get_buzz(i):
    if i % 3 == 0 and i % 5 == 0:
        return "fizzbuzz"
    elif i % 3 == 0:
        return "fizz"
    elif i % 5 == 0:
        return "buzz"
    return ""

for i in range(1, 16):
    print(str(i) + " " + get_buzz(i))
```

---

```
$ python3 test.py
1 
2 
3 fizz
4 
5 buzz
6 fizz
7 
8 
9 fizz
10 buzz
11 
12 fizz
13 
14 
15 fizzbuzz
```

----
<!-- .slide: data-auto-animate -->
## Packaging
---
<!-- .slide: data-auto-animate -->
## Packaging

- Ensure consistent versions across everyone writing this software
- Ensure dependencies are version-compatible with each other
