# HTML-Data-Grid-Widget
A JavaScript controlled, HTML data-grid widget

Currently the master branch has no code, but the develop branch contains the working copy. This project is a long way off from 
its first master branch commit, but feel free to clone the develop branch and play around with the code base.

Planned functionality:

1) Sortable columns

2) Filterable columns

3) Reorderable columns
4) In-cells editing

5) Dynamically add new columns

6) Dynamically add new rows

7) Server-side and client-side paging

8) Nested drill-down grids

9) Export grid to .cvs

10) Event hooks

11) Graphics/logo support

The file dominator.js is currently need by grid.js for it to run. dominator.js also has its own github repo and is currently 
only available on its develop branch. I have a JQuery dependent client-side form [validator](https://github.com/mosbymc/validator) that I am trying to remove JQuery 
from and the dominator is a collection of functions that I've created to reproduce some of the JQuery functionality. However, 
it has not been extensively tested and is also a long way from being released on a master branch.

The grid.html file is my test page for the functionality in the grid widget. It requires grid.js, grid.css, and dominator.js to run properly.
