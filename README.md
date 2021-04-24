Assignment 4 - Visualizations and Multiple Views  
===
Khulood Alkhudaidi

Introduction
---
The goal of this assignment is to create multiple views and link them where interactions in any given view updates the others. 
That allows the user to explore different parts of the data between views.

Github Pages Link
---

Description
---
<p>I chose to visualize data for Suicide Rates Overview 1985 to 2016 [1]. It has 27821 items, so I visualized the average of the first five years, namely (1985 -1990). 
I started with a code [2] from bl.ocks.org. The code has a bar chart, so I created a scatter plot, linked them together, and added interaction between them. </p>

- For the scatterplot side: A brush was created so that when the user brushes the scatterplot, the bar chart gets filtered. </br>

![screenshot1](https://github.com/Khulood20/04-multiple-views/blob/main/img/screen1.png)

- For the bar chart side: a hover event was added so that when the user hovers over a bar, the corresponding circle in the scatterplot is colored in red. </br> </br>

![screenshot2](https://github.com/Khulood20/04-multiple-views/blob/main/img/screen2.png)


Technical Achievements
---
- Linking and Filtering through brushing technique
- Coloring scatterplot circle when hovering on a bar

Design Achievements
---
- A blue gradient color for the bar chart from light to dark to indicate the high to low suicides rate
- Animating the bars when filtering
- Using google fonts

<p> A sketch and a color palette: </p>

![pa](https://github.com/Khulood20/04-multiple-views/blob/main/img/pa.png)

![sketch](https://github.com/Khulood20/04-multiple-views/blob/main/img/screen.jpeg)


Resources
---

1. https://www.kaggle.com/russellyates88/suicide-rates-overview-1985-to-2016
2. http://bl.ocks.org/San-dra/9400b1bbc5c34cec4b96b67072aab4cc
3. https://fonts.google.com/specimen/Roboto+Mono?preview.text=Suicides%20Rate&preview.text_type=custom&vfonly=true#standard-styles
