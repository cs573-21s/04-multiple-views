Assignment 4 - Visualizations and Multiple Views  
===

## Link to Visualization

https://04-multiple-views.ryanlamarche.dev/

## The Data

Data can be found in `public/data/Terrorist attacks by weapon type - Global Terrorism Database (2018).csv`

Data Source: [Our World in Data github](https://github.com/owid/owid-datasets/tree/master/datasets/Terrorist%20attacks%20by%20weapon%20type%20-%20Global%20Terrorism%20Database%20(2018))

## Description

This visualization aggregates geoJSON data with a public terrorism dataset provided by Our World in Data. The goal was to create a visualization that users could use to explore the weapon types used in terrorist attacks in different regions of the world.

### The visualization consists of:

* __A Bar Chart__ - showing the distribution of weapon type for the currently selected countries
* __An Interactive World Map__ - a "brushable" world map using the `d3.brush()` API. The brush "selects" countries by comparing the user's current selection with the centroid of points for each country in the geoJSON dataset. This allows the user to select different regions of the world and explore geospatial trends.
* __A Table__ - below is a table, which is also filtered when the user brushes over the world map. This lets the user see the individual data points to make precise comparisons and draw conclusions. The __country name__ is also clickable, which will filter the map to just that 1 country. This makes it possible to filter the bar chart to see just 1 country at a time.

## Screenshots



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

