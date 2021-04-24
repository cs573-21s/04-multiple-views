Assignment 4 - Visualizations and Multiple Views  
===
By Jyalu Wu

GitHub Site
---
https://jwu2018.github.io/04-multiple-views/


Description
---

The goal of this project was to choose an interesting dataset and visualize it in at least two linked views, where interactions in any given view updates the others. I chose to use the [Mushroom Classification](https://www.kaggle.com/uciml/mushroom-classification) dataset published by UCI Machine Learning for this project on a whim and built the visualizations around it.

The website includes three linked visualizations: an illustration diagram of a mushroom, a pie chart, and a bar graph. The colors of the mushroom parts can be customized in the illustration visualization, which then updates the information and insights shown by the pie chart and bar chart. These parts include the cap, the gills, the part of the stalk above the mushroom's ring, and the part of the stalk below the ring.

Based on the colors inputted by the user, the pie chart shows the probability of the mushrooms in the database that have that same color pattern to be poisonous. The bar chart shows what porportion of all the mushrooms have each of the specified colors.

*Disclaimer: there are at least 10,000 species of mushrooms that exist and this dataset only contains data for 23 species in the Agaricus and Lepiota families. Thus, these predictions are only relevant if the mushroom is known to be in those families, which are all gilled mushrooms, and should be taken with a grain of salt if the mushroom doesn't seem to be from those families.*


Technical Achievements
---
- **Smooth transitions:** When you change the color for a part of the mushroom, the mushroom diagram, pie chart, and bar chart all do smooth animations when they are updated.
- **Three vizzes:** There are 3 visualizations: an illustration diagram, a pie chart, and a bar chart, though the illustration diagram may not really count.


Design Achievements
---
- **Fonts:** I customized the title font to be a funky font called *Mushroom* and standardized the rest of the text to be in the font *Geneva*.
- **Clean layout:** The layout of the website is clean and minimal.
- **Mushroom:** I drew a mushroom!
- **Coordinating colors:** 2/3 vizzes have colors!


Screenshots
---
![Website screenshot](/screenshots/pretty-shroom.png)

A very poisonous color combination
![Very poisonous](/screenshots/very-poisonous.png)

A surprisingly not-so-poisonous color combination
![Not so poisonous](/screenshots/surprisingly-not-poisonous.png)


Resources
---
- Interactive buttons https://www.d3-graph-gallery.com/graph/interactivity_button.html
- Basic pie chart https://www.geeksforgeeks.org/d3-js-pie-function/
- Basic bar chart https://www.tutorialsteacher.com/d3js/create-bar-chart-using-d3js