Blocking
========

A super simple file loading and page blocking tester.

You can customize your page and submit it to see how different the script blocking the page.

The online version is here [Blocking](http://blocking.liuxijin.com).


Get Started
========

1. `git clone https://github.com/ssnau/blocking.git`
2. `npm install`
3. `node main.js`
4. visit `http://localhost:5000/`, enjoy!

Features
=======

###[2014-12-4]

- I've host the project on [Blocking](http://blocking.liuxijin.com), you can visit it and have try.
- Once you commit a request your snippet will save forever. Just don't forget the snippet code in the url.

####[2014-11-28]


 - You can now use {{no-cache}} to eliminate cache problem, otherwise you will meet cache hit from the resources in the same name.

 - A div will get background image if you assign 'sp1' as its class. The tailing `1` means the image will get 1s latency. However, you can also use `sp2`, `sp3` up to `sp10.

####[2014-11-27] 

You can now use {{flush xx}} command to flush your document early while the rest part of your document still pending.

```
<html>
<head>
</head>
<body>
  <p>Imagine there's no heaven</p>
  {{flush 1000}}
  <p>It's easy if you try</p>
  {{flush 2000}}
  <p>No hell below us</p>
  {{flush 2000}}
  <p>Above us only sky</p>
  <p>Imagine all the people</p>
  <p>Living for today...</p>
</body>
</html>
```

In this example, you will see the first paragragh instantly and then after 1000ms you will see the second paragraph.
As the script show, you will have to wait for 2000ms to see the third paragragh and another 2000ms to get the rest.
It is helpful for you to analyze how the "flush early" strategy affect your page loading performance when the dom structure is complex.

####[init version] 

There are several macros for you to customize your script/css blocking time. For example:

- `<scirpt src="/t/wait-3s.js"></script>`, will tell the engine that this script will blocking for 3s before the server send the very first byte.
- `<scirpt src="/t/busy-3s.js"></script>`, the script will execute a loop for 3s while it will blocking everything on the page.
- `<script src="/t/wait-2s-busy-3s.js"></script>`, combine this two macro you will get a script that require 2s to download and 3s to be executed.

These rules are also applied to CSS.

- `<link rel="stylesheet" href="/t/wait-3s.css" />` will get an empty style sheet after 3s.
- `<link rel="stylesheet" href="/t/wait-3s-red.css" />`, the last word of the request means the body color property in the incoming css file, after the css is applied your document background will turn red.


License
=====
MIT
