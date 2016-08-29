---
layout: page
title: FAQ
nav_order: 21
nav_subpage: 1
---

# Why does the performance of my app seem slow compared to the samples? 

A typical cause of sluggish or jerky performance is extra DOM refreshes. The performance of any web application is bound to the way an application interacts with the DOM. 

Reading the DOM is potentially worse that writing. Any time the value of a DOM property is changed, the DOM is marked as dirty and scheduled to be repaired and refreshed, which may happen at any time.  However, if a DOM property is read when the DOM is dirty, the entire page will be immediately repaired and reflowed *before returning the value of the DOM property*. In a traditional 2D web page, this  guarantees that the properties are correct, and that content is updated automatically when something changes. When nothing changes, the page does not need to be refreshed.

However, in a 3D web page, such as those created with *argon.js*, the page is rendered continuously, at speeds of 30, 60 or more times per second.  DOM repair is **very expensive**, and even a single extra repair will dramatically affect the performance of a 3D web app.

Therefore, we strongly advise against unnecessarily reading any DOM properties, especially after changing any properties.  Similarly, property updates should also be minimized or grouped together as much as possible. We have found that updating the properties of DOM elements performs best when done in *requestAnimationFrame* callback functions, which we use in our HTML 3D examples.
