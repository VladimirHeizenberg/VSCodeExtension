# Rule of three extension
Vladimir Kalganov, M3103

This is an extension for VSCode IDE that implements the rule of three for object-oriented programming.

## Features

If there is a class and it has a constructor but doesn't have the copy-constructor or assignment operator then the extension will add them to the class. (But unfortunately you will need to implement them on yourself).

## Functions

```
C++ Rule of three generator: Add copy constructor and assignment operator
```
will add copy constructor and assignment operator to your class if they're needed.

## Known Issues

As regexes are used in this extension, now it doesn't work when there are many classes in file.

## Release Notes

### 1.0.0

b40ecd
Author: VladimirHeizenberg
Date: 2024-12-19
Message: initial commit and extension
