# HTML-Data-Grid-Widget
A JQuery-dependent, HTML data-grid widget

Now with 100% more validation!

I am still working on getting this to both a stable and functional version. The develop branch is used primarily to merge working branches into,
and then, every so often, the develop branch is merged with Master.

Currently Implemented Functionality:
- Resizable Columns
- Reorderable Columns
- Filterable Columns
- Sortable Columns
- Groupable Columns
- Hidable Columns
- In-cell Editing
- Paging
- Exporting data as an excel file via integration with [XcelXporter](https://github.com/mosbymc/XcelXporter)
- Standard Numeric Formatting (c, p, or n)
- Custom Numeric Formatting via # and 0
- Formatting user input when allowing in-cell editing via integration with [inputFormatter](https://github.com/mosbymc/inputformatter)
    - This allows formatting of string of characters like phone numbers or social security numbers.
- Partial integration with [validator.js](https://github.com/mosbymc/validator)... more to come
- Custom Classes and Data Attributes applied to Column Headers and Table Cells/Rows
- Grid Aggregates
- Group Aggregates

All data manipulation functionality (sorting, filtering, grouping, editing, and paging) can occur on the client-side or server-side depending on your configuration options.

Planned functionality & upgrades:
- Dynamically add new columns (in progress)
- Dynamically add new rows (in progress)
- Nested drill-down grids
- Remove jQuery dependency (this will happen no time soon)


The grid.html file is my test page for the functionality in the grid widget. It requires grid.js, and grid.css to run properly. You can view the test page
by starting up the node server and navigating a browser to: http://localhost:3000/build/grid.html

This test page shows a grid that is configured to use client-side paging via the gridData.js file. You will probably notice that there are no phone numbers
in the 'Phone Number' column of the grid. This is because I created the phone numbers in my local data store, but have not yet updated the gridData.js file
with the new data. The grid still creates the column because it is listed in the columns object of gridData.js; as it is intended to do.

Note that while the grid does indeed support the above list of implemented functionalities, there are some bugs with it. If you're interested in this repo,
then I would suggest cloning the grid to just play around with it and get familiar with how it works, but do not use this in any production site for the time being.
The primary concern is with the in-cell editing. Most of the validation, formatting, and type checking is working, but there are still are few edges cases I am working
on tracking down.

My plan is to get the remaining bugs/issues sorted out and finish fleshing out the existing functionality. Afterwards, I'll start adding new features. Check back here later because
I will continue to make commits to this project. In the meantime, you can check out my currently-meager wiki for some sparse [documentation on using the grid](https://github.com/mosbymc/HTML-Data-Grid-Widget/wiki).
Included is the same grid config file I am using in my test project but with comments next to the properties to explain what they do.
