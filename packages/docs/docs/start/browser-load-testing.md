---
id: browser-load-testing
title: Browser Load Testing With Element
---

Browser load testing is a novel approach to load testing which works by simulating user interactions against a website or application, and then scaling that out to hundreds or thousands of browser instances.

Thanks for the economies of scale associated with modern cloud computing platforms, this provides an efficient and scalable way to generate load without worrying about the complexities of network correlation, and over-tuning specific endpoints.

Browser based load testing often produces more accurate real world load simulations than protocol based load testing tools.

You can use Element on its own as a functional test automation tool, but it really shines when you can reuse it for your load tests.

The easiest way to run Element scripts as load test scripts is to use [Flood](https://flood.io). Flood is a cloud-based distributed load testing platform that allows you to scale up your tests quickly, and it already supports Element scripts. All you have to do is upload your script to the Flood site and you'll be able to set test settings for your scenario. In this way you can quickly start running your script with as many users as you want from the cloud.

Check out the [Flood documentation](https://guides.flood.io/scripting-and-tools/flood-element/getting-started-with-element) on running Element scripts to get started!