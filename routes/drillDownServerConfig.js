var drillDownData = {
    reorderable: true,
    sortable: true,
    resizable: true,
    columns: {
        MechanicName: {
            title: 'Mechanic',
            filterable: true,
            width: 180,
            type: 'string'
        },
        Make: {
            filterable: true,
            width: 125,
            type: 'string'
        },
        Model: {
            filterable: true,
            width: 125,
            type: 'string'
        },
        Year: {
            filterable: true,
            width: 75,
            type: 'date'
        },
        Doors: {
            filterable: true,
            width: 100,
            type: 'number',
            title: 'Number of doors'
        },
        EngineType: {
            title: 'Engine Type',
            width: 75,
            type: 'string',
            filterable: true
        },
        EngineSize: {
            title: 'Engine Size',
            width: 75,
            type: 'string',
            filterable: true
        }
    }
};

module.exports = drillDownData;
