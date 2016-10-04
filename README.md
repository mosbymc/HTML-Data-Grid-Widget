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
- Dynamically add new columns
- Dynamically add new rows
- Locked Columns
- Advanced filtering (in progress)
- Nested drill-down grids (in progress)
- Remove jQuery dependency (this will happen no time soon)

To see a client-side demo of the grid, (view my git hub project page[http://mosbymc.github.io/HTML-Data-Grid-Widget/].

My plan is to get the remaining bugs/issues sorted out and finish fleshing out the existing functionality. Afterwards, I'll start adding new features. Check back here later because
I will continue to make commits to this project. In the meantime, you can check out my currently-meager wiki for some sparse [documentation on using the grid](https://github.com/mosbymc/HTML-Data-Grid-Widget/wiki).
Included is the same grid config file I am using in my test project but with comments next to the properties to explain what they do.
