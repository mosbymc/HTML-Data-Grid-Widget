var aggregateDrillDown = {
    reorderable: true,
    sortable: true,
    resizable: true,
    columns: {
        Year: {
            filterable: true,
            width: 180,
            type: 'date'
        },
        FirstName: {
            filterable: true,
            width: 125,
            type: 'string'
        },
        LastName: {
            filterable: true,
            width: 125,
            type: 'string'
        },
        Team: {
            filterable: true,
            width: 75,
            type: 'string'
        },
        Position: {
            filterable: true,
            width: 100,
            type: 'string'
        },
        GamesPlayed: {
            field: 'GamesPlayed',
            title: 'Games Played',
            type: "number",
            filterable: true,
            editable: true,
            min: 1,
            max: 10000,
            width: 150
        },
        AtBat: {
            field: 'AtBat',
            title: 'At Bat',
            type: "number",
            editable: true,
            width: 80
        },
        Runs: {
            field: 'Runs',
            filterable: false,
            type: "number",
            width: 80,
            editable: true,
        },
        Hits: {
            field: 'Hits',
            filterable: true,
            type: "number",
            width: 80,
            editable: true
        },
        '2B': {
            field: '2B',
            filterable: true,
            type: "number",
            width: 100,
            editable: true
        },
        '3B': {
            field: '3B',
            type: "number",
            editable: true,
            filterable: true,
            width: 100
        },
        HomeRuns: {
            field: 'HomeRuns',
            title: 'Home Runs',
            type: 'number',
            width: 110
        },
        RBI: {
            field: 'RBI',
            type: 'number',
            width: 50
        },
        Walks: {
            field: 'Walks',
            type: 'number',
            width: 80
        },
        StrikeOuts: {
            field: 'StrikeOuts',
            title: 'Strike Outs',
            type: 'number',
            width: 100
        },
        StolenBases: {
            field: 'StolenBases',
            title: 'Stolen Bases',
            type: 'number',
            width: 125
        },
        BattingAverage: {
            field: 'BattingAverage',
            title: 'Batting Average',
            type: 'number',
            width: 140
        }
    }
};

module.exports = aggregateDrillDown;
