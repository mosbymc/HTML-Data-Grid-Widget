# HTML-Data-Grid-Widget
A JQuery-dependent, HTML data-grid widget

To use the grid on your site, include the entire contents of the 'dist' directory in your project as well as jQuery 1.7 of higher. You can rename the dist directory anything you wish, or even do without it. However, the three sub-directories of 'dist', 'scripts', 'styles', and 'images' must all be in the same directory in your project, otherwise the relative urls will not point to the correct locations.

View the grid demo [here](http://mosbymc.github.io/HTML-Data-Grid-Widget/).

###Currently Implemented Functionality:###
- Resizable Columns
- Reorderable Columns
- Filterable Columns
- Sortable Columns
- Groupable Columns
- Toggleable Columns
- In-cell Editing
- Paging
- Nested drill-down grids
    - The [grid config file](https://github.com/mosbymc/HTML-Data-Grid-Widget/wiki/Grid-Configuration) takes a 'drillDown' property that can be either another grid config for the drill down, or a function that returns a grid config file after retrieve the specific drill down data for the parent row in question. Drill down grids, like their parent's can be paged on the client or the server.
- Exporting data as an excel file via integration with [XcelXporter](https://github.com/mosbymc/XcelXporter)
- Standard Numeric Formatting (c, p, or n)
- Custom Numeric Formatting via # and 0
- Formatting user input when allowing in-cell editing via integration with [inputFormatter](https://github.com/mosbymc/inputformatter)
    - This allows formatting of string of characters like phone numbers or social security numbers.
- Partial integration with [validator.js](https://github.com/mosbymc/validator)... more to come
- Custom Classes and Data Attributes applied to Column Headers and Table Cells/Rows
- Grid Aggregates
- Group Aggregates
- Advanced filtering via integration with [ExpressionParser.js](https://github.com/mosbymc/ExpressionParser)
    - This functionality allows for both AND and OR type filter conjunctions as well as an arbitrary number of nested filter groups.

All data manipulation functionality (sorting, filtering, grouping, saving edits, and paging) can occur on the client-side or server-side depending on your configuration options.

###Planned functionality & upgrades:###
- Dynamically add new columns (in progress)
- Dynamically add new rows (in progress)
- Locked Columns
- Drag columns between grids
- Remove jQuery dependency (this will happen no time soon)


I just got my github project page for this repo up and running [here.](http://mosbymc.github.io/HTML-Data-Grid-Widget/) I had been including a demo page within the main repo, but now, as part of the clean up I intend to do, I will be removing the unecessary .html files from the repo. For now, you can check out the grid at the project page linked above. I'll make sure to keep it updated with the latest code.

Note that while the grid does indeed support the above list of implemented functionalities, there are some bugs with the in-cell editing. If you're interested in this repo, then I would suggest refraining from using the in-cell editing functionality in a production site. Most of the validation, formatting, and type checking is working, but there are still are few edges cases I am working on tracking down.

My plan is to get the remaining bugs/issues sorted out and finish fleshing out the existing functionality and styles. Afterwards, I'll start adding new features. Check back here later because I will continue to make commits to this project. In the meantime, you can check out my currently-meager wiki for some sparse [documentation on using the grid](https://github.com/mosbymc/HTML-Data-Grid-Widget/wiki).

