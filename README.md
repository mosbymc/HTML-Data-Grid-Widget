# HTML-Data-Grid-Widget
A JQuery-dependent, HTML data-grid widget

Now with 100% more validation!

Currently the master branch has no code, but the develop branch contains the working copy. This project is a long way off from 
its first master branch commit, but feel free to clone the develop branch and play around with the code base.

Currently Implemented Functionality:
- Resizable Columns
- Reorderable Columns
- Filterable Columns
- Sortable Columns
- In-cell Editing
- Client-side paging
- Partial integration with [validator.js](https://github.com/mosbymc/validator)... more to come

Planned functionality:
- Dynamically add new columns
- Dynamically add new rows
- Server-side paging
- Nested drill-down grids
- Export grid to cvs
- Event hooks
- Graphics/logo support
- Integration with [validator.js](https://github.com/mosbymc/validator)


The grid.html file is my test page for the functionality in the grid widget. It requires grid.js, and grid.css to run properly.

It's been a while since I first created this repo and I decided to make my first real commit. The code on the develop branch is still a long way from being truely released on the master branch, but the grid does now support some functionaltiy.

Note that while the grid does indeed support the above list of implemented functionalities, there are some bugs with it. If you're interested in this repo, then I would suggest cloning the grid to just play around with it and get familiar with how it works, but do not use this in any production site for the time being - or if you do, I'd steer clear of the in-cell editing and know that filtering only works well on string and numbers right now.

My plan is to get the remaining bugs/issues sorted out, and start on server-side paging/updates next. Check back here later because I will continue to make commits to this project.
