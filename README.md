Assignment 4 - Visualizations and Multiple Views  
===

Imogen Cleaver-Stigum
CS 573 Data Vis

Writeup
===

https://imogencs.github.io/04-multiple-views/

Description
---

I used a dataset from Data Is Plural about the lifespans of different species from https://genomics.senescence.info/species/index.html. The dataset contained the classification of each species as well as the number of days to reach maturity, maximum lifespan, and other data points. I did some preprocessing of the data so the files in the repo do not match exactly to the download on the site. 

Species are classified as follows:
0. Domain 
1. Kingdom
2. Phylum
3. Class
4. Order
5. Family
6. Genus
7. Species

I made a scatterplot that plots the number of days to reach maturity for each species for females (x axis) and males (y axis). The points are scaled to correspond to the maximum longevity of the species, and color coded based on the class of the species. The scatterplot has some features:
- Hovering over a point brings it into focus
- You can select the class to highlight using a dropdown menu

There is also a sunburst diagram that shows the classifications of the animals hierarchically. This required some preprocessing because the original data was in csv format with the classifications for each species, so I used python to convert it into a json format so that each class is a child of the phylum, etc. This helps it be displayed in this hierarchical format. 

These views compliment each other because the scatterplot provides more quantitative data about each species (maturity timeframe and lifespan) while the sunburst diagram shows how the species relate to each other. 

References
===

- https://bl.ocks.org/mbostock/ca5b03a33affa4160321
- https://medium.com/@mbostock/a-better-way-to-code-2b1d2876a3a0
- https://bl.ocks.org/vasturiano/12da9071095fbd4df434e60d52d2d58d
- https://www.d3-graph-gallery.com/graph/connectedscatter_select.html


Assignment Details
===

One of the most powerful techniques for mitigating the shortcomings of a given visualization is to link it with other views.
Linking a map to a bar or scatterplot, for instance, may allow you to overcome the shortcomings of a map.
In general, linking visualizations allows you to explore different parts of the data between views, and mitigates the shortcomings of a given view by pairing it with other views.
This technique, called coordinated multiple views, is the focus of this assignment.

Your task is to choose an interesting dataset and visualize it in *at least two* **linked** views, where interactions in any given view updates the others.
Each view should use a different visualization type, and interaction in one of the views should impact what's shown in the other views.

You should choose data and visualizations that are sufficiently complex and interesting to ensure a user can discover interesting patterns and trends on their own.

For this assignment you should write everything from scratch.
You may *reference and adapt* code from books or the web, and if you do please provide a References section with links at the end of your Readme.

Resources
---

Data is Plural has a list of interesting datasets, many of which require processing.

These three examples are intended to show you what multiple views visualizations might look like. 
I wouldn't recommend using them as a your starting point, but you may find some inspiration:

1. This [scatterplot matrix](http://bl.ocks.org/mbostock/4063663) has code that explains brushing and linking. But remember you'll be doing this with different types of views.

2. The example visualization for [Crossfilter](http://square.github.io/crossfilter/) uses coordinated multiple views. The interaction and brushing technique is well-executed.

3. The [dispatching events](https://github.com/d3/d3-dispatch) page is a good example of using events, rather than explicit functions, for controlling behavior. Views can listen for events in other views and respond accordingly.

*If you aren't familiar with event-based programming you should experiment with d3.dispatch and other approaches to coordinating views well before the deadline (it's tricky.)*

Don't forget to run a local webserver when you're coding and debugging.

Requirements
---

0. Your code should be forked from the GitHub repo and linked using GitHub pages.
1. Your project should load a dataset you found on the web. Put this file in your repo.
2. Your project should use d3 to build a visualization of the dataset. 
3. Your writeup (readme.md in the repo) should contain the following:

- Working link to the visualization hosted on gh-pages.
- Concise description and screenshot of your visualization.
- Description of the technical achievements you attempted with this visualization.
- Description of the design achievements you attempted with this visualization.

GitHub Details
---

- Fork the GitHub Repository. You now have a copy associated with your username.
- Make changes to index.html to fulfill the project requirements. 
- Make sure your "master" branch matches your "gh-pages" branch, if using gh-pages for hosting. See the GitHub Guides referenced above if you need help.
- Edit the README.md with a link to your site, for example http://YourUsernameGoesHere.github.io/04-MapsAndViews/index.html
- To submit, make a [Pull Request](https://help.github.com/articles/using-pull-requests/) on the original repository. Name it: 
```
a4-username-firstName-lastName
```
