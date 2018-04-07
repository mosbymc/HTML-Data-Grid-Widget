var request =           require('request'),
    gridData =          require('../dev/scripts/data.js'),
    originalData =      require('./grid-server-data'),
    drillDownData =     require('./drillDownServerConfig'),
    columns =           originalData.columns,
    drillDownColumns =  drillDownData.columns,
    gridDataHelpers =   require('./gridDataHelpers.js'),
    data = require('./tmp_grid_data.js'),
    yearlyStatsColumns = require('./2014_server_stats').columns,
    aggregateStatsData = require('./aggregate_server_stats'),
    aggregateColumns = aggregateStatsData.columns,
    aggregateDrilldownColumns = require('./aggregate_server_drill_down.js').columns;

module.exports = function (router) {
    router.post('/grid/updateData', updateGridData);

    router.get('/grid/getpage', getGridPageData);

    router.get('/grid/getInitialDataSource', getInitialGridDataSource);

    router.get('/grid/drilldown/getpage', getDrillDownData);

    router.get('/grid/get_2014_stats', get2014StatsPage);

    router.get('/grid/get_aggregated_stats', aggregateStats);

    router.get('/grid/getyearlystats', getYearlyStats);

    //router.get('/grid/post', postGridData);
};

var reqObj = {
    filters: null,
    groupedBy: null,
    pageNum: 1,
    pageSize: 25,
    sortedBy: null,
    sortedOn: null
};

function aggregateStats(request, response) {
    var data = [];

    get2014Stats(function _2014Results(err, stats2014) {
        if (null != err) response.send(err);
        get2015Stats(function _2015Results(err, stats2015) {
            if (null != err) response.send(err);
            get2016Stats(function _2016Results(err, stats2016) {
                if (null != err) response.send(err);
                get2017Stats(function _2017Results(err, stats2017) {
                    if (null != err) response.send(err);

                    var sharedResults = [],
                        nonSharedResults;

                    data = stats2014;

                    sharedResults = stats2015.filter(stat => stats2014.some(x => x.FirstName === stat.FirstName && x.LastName === stat.LastName));
                    nonSharedResults = stats2015.filter(stat => stats2014.every(s => s.FirstName !== stat.FirstName && s.LastName !== stat.LastName))
                        .map(function _map2015Players(player) {
                            return {
                                statIds: [{ year: '2015', id: player.id }],
                                FirstName: player.FirstName,
                                LastName: player.LastName,
                                Team: player.Team,
                                Position: player.Position,
                                GamesPlayed: player.GamesPlayed,
                                AtBat: player.AtBat,
                                Runs: player.Runs,
                                Hits: player.Hits,
                                '2B': player['2B'],
                                '3B': player['3B'],
                                HomeRuns: player.HomeRuns,
                                RBI: player.RBI,
                                Walks: player.Walks,
                                StrikeOuts: player.StrikeOuts,
                                StolenBases: player.StolenBases,
                                BattingAverage: player.BattingAverage
                            };
                        });
                    data = data.map(function _computeAverages(player) {
                        var player2015 = sharedResults.filter(x => x.FirstName === player.FirstName && x.LastName === player.LastName)[0] || {};

                        return {
                            statIds: [{ year: '2014', id: player.id }].concat(null != player2015.id ? [{ year: '2015', id: player2015.id }] : []),
                            FirstName: player.FirstName,
                            LastName: player.LastName,
                            Team: player.Team,
                            Position: player.Position,
                            GamesPlayed: Number.parseFloat(player.GamesPlayed) + (Number.parseInt(player2015.GamesPlayed) || 0),
                            AtBat: Number.parseFloat(player.AtBat) + (Number.parseInt(player2015.AtBat) || 0),
                            Runs: Number.parseFloat(player.Runs) + (Number.parseInt(player2015.Runs) || 0),
                            Hits: Number.parseFloat(player.Hits) + (Number.parseInt(player2015.Hits) || 0),
                            '2B': Number.parseFloat(player['2B']) + (Number.parseInt(player2015['2B']) || 0),
                            '3B': Number.parseFloat(player['3B']) + (Number.parseInt(player2015['3B']) || 0),
                            HomeRuns: Number.parseFloat(player.HomeRuns) + (Number.parseInt(player2015.HomeRuns) || 0),
                            RBI: Number.parseFloat(player.RBI) + (Number.parseInt(player2015.RBI) || 0),
                            Walks: Number.parseFloat(player.Walks) + (Number.parseInt(player2015.Walks) || 0),
                            StrikeOuts: Number.parseFloat(player.StrikeOuts) + (Number.parseInt(player2015.StrikeOuts) || 0),
                            StolenBases: Number.parseFloat(player.StolenBases) + (Number.parseInt(player2015.StolenBases) || 0),
                            BattingAverage: (Number.parseFloat(player.Hits) + (Number.parseInt(player2015.Hits) || 0)) /
                            (Number.parseFloat(player.AtBat) + (Number.parseInt(player2015.AtBat) || 0))
                        };
                    });

                    data = data.concat(nonSharedResults);

                    sharedResults = stats2016.filter(stat => data.some(x => x.FirstName === stat.FirstName && x.LastName === stat.LastName));
                    nonSharedResults = stats2016.filter(stat => data.every(s => s.FirstName !== stat.FirstName && s.LastName !== stat.LastName))
                        .map(function _map2015Players(player) {
                            return {
                                statIds: [{ year: '2016', id: player.id }],
                                FirstName: player.FirstName,
                                LastName: player.LastName,
                                Team: player.Team,
                                Position: player.Position,
                                GamesPlayed: player.GamesPlayed,
                                AtBat: player.AtBat,
                                Runs: player.Runs,
                                Hits: player.Hits,
                                '2B': player['2B'],
                                '3B': player['3B'],
                                HomeRuns: player.HomeRuns,
                                RBI: player.RBI,
                                Walks: player.Walks,
                                StrikeOuts: player.StrikeOuts,
                                StolenBases: player.StolenBases,
                                BattingAverage: player.BattingAverage
                            };
                        });
                    data = data.map(function _computeAverages(player) {
                        var player2016 = sharedResults.filter(x => x.FirstName === player.FirstName && x.LastName === player.LastName)[0] || {};

                        return {
                            statIds: player.statIds.concat(null != player2016.id ? [{ year: '2016', id: player2016.id }] : []),
                            FirstName: player.FirstName,
                            LastName: player.LastName,
                            Team: player.Team,
                            Position: player.Position,
                            GamesPlayed: Number.parseFloat(player.GamesPlayed) + (Number.parseInt(player2016.GamesPlayed) || 0),
                            AtBat: Number.parseFloat(player.AtBat) + (Number.parseInt(player2016.AtBat) || 0),
                            Runs: Number.parseFloat(player.Runs) + (Number.parseInt(player2016.Runs) || 0),
                            Hits: Number.parseFloat(player.Hits) + (Number.parseInt(player2016.Hits) || 0),
                            '2B': Number.parseFloat(player['2B']) + (Number.parseInt(player2016['2B']) || 0),
                            '3B': Number.parseFloat(player['3B']) + (Number.parseInt(player2016['3B']) || 0),
                            HomeRuns: Number.parseFloat(player.HomeRuns) + (Number.parseInt(player2016.HomeRuns) || 0),
                            RBI: Number.parseFloat(player.RBI) + (Number.parseInt(player2016.RBI) || 0),
                            Walks: Number.parseFloat(player.Walks) + (Number.parseInt(player2016.Walks) || 0),
                            StrikeOuts: Number.parseFloat(player.StrikeOuts) + (Number.parseInt(player2016.StrikeOuts) || 0),
                            StolenBases: Number.parseFloat(player.StolenBases) + (Number.parseInt(player2016.StolenBases) || 0),
                            BattingAverage: (Number.parseFloat(player.Hits) + (Number.parseInt(player2016.Hits) || 0)) /
                            (Number.parseFloat(player.AtBat) + (Number.parseInt(player2016.AtBat) || 0))
                        };
                    });

                    data = data.concat(nonSharedResults);

                    sharedResults = stats2017.filter(stat => data.some(x => x.FirstName === stat.FirstName && x.LastName === stat.LastName));
                    nonSharedResults = stats2017.filter(stat => data.every(s => s.FirstName !== stat.FirstName && s.LastName !== stat.LastName))
                        .map(function _map2015Players(player) {
                            return {
                                statIds: [{ year: '2017', id: player.id }],
                                FirstName: player.FirstName,
                                LastName: player.LastName,
                                Team: player.Team,
                                Position: player.Position,
                                GamesPlayed: player.GamesPlayed,
                                AtBat: player.AtBat,
                                Runs: player.Runs,
                                Hits: player.Hits,
                                '2B': player['2B'],
                                '3B': player['3B'],
                                HomeRuns: player.HomeRuns,
                                RBI: player.RBI,
                                Walks: player.Walks,
                                StrikeOuts: player.StrikeOuts,
                                StolenBases: player.StolenBases,
                                BattingAverage: player.BattingAverage
                            };
                        });
                    data = data.map(function _computeAverages(player) {
                        var player2017 = sharedResults.filter(x => x.FirstName === player.FirstName && x.LastName === player.LastName)[0] || {};

                        return {
                            statIds: player.statIds.concat(null != player2017.id ? [{ year: '2017', id: player2017.id }] : []),
                            FirstName: player.FirstName,
                            LastName: player.LastName,
                            Team: player.Team,
                            Position: player.Position,
                            GamesPlayed: Number.parseFloat(player.GamesPlayed) + (Number.parseInt(player2017.GamesPlayed) || 0),
                            AtBat: Number.parseFloat(player.AtBat) + (Number.parseInt(player2017.AtBat) || 0),
                            Runs: Number.parseFloat(player.Runs) + (Number.parseInt(player2017.Runs) || 0),
                            Hits: Number.parseFloat(player.Hits) + (Number.parseInt(player2017.Hits) || 0),
                            '2B': Number.parseFloat(player['2B']) + (Number.parseInt(player2017['2B']) || 0),
                            '3B': Number.parseFloat(player['3B']) + (Number.parseInt(player2017['3B']) || 0),
                            HomeRuns: Number.parseFloat(player.HomeRuns) + (Number.parseInt(player2017.HomeRuns) || 0),
                            RBI: Number.parseFloat(player.RBI) + (Number.parseInt(player2017.RBI) || 0),
                            Walks: Number.parseFloat(player.Walks) + (Number.parseInt(player2017.Walks) || 0),
                            StrikeOuts: Number.parseFloat(player.StrikeOuts) + (Number.parseInt(player2017.StrikeOuts) || 0),
                            StolenBases: Number.parseFloat(player.StolenBases) + (Number.parseInt(player2017.StolenBases) || 0),
                            BattingAverage: (Number.parseFloat(player.Hits) + (Number.parseInt(player2017.Hits) || 0)) /
                            (Number.parseFloat(player.AtBat) + (Number.parseInt(player2017.AtBat) || 0))
                        };
                    });

                    data = data.concat(nonSharedResults);

                    determinePageData(request.query, data, aggregateColumns, calculateStatsAggregations, function(err, data) {
                        response.send(data);
                        //response.send(null);
                        response.end()
                    });
                });
            });
        });
    });
}

function get2014Stats(cb) {
    request('http://localhost:5500/stats-2014', function _statsReq(err, res, body) {
        if (!err && res.statusCode === 200) {
            cb(null, JSON.parse(body));
        }
    });
}

function get2015Stats(cb) {
    request('http://localhost:5500/stats-2015', function _statsReq(err, res, body) {
        if (!err && res.statusCode === 200) {
            cb(null, JSON.parse(body));
        }
    });
}

function get2016Stats(cb) {
    request('http://localhost:5500/stats-2016', function _statsReq(err, res, body) {
        if (!err && res.statusCode === 200) {
            cb(null, JSON.parse(body));
        }
    });
}

function get2017Stats(cb) {
    request('http://localhost:5500/stats-2017', function _statsReq(err, res, body) {
        if (!err && res.statusCode === 200) {
            cb(null, JSON.parse(body));
        }
    });
}

var get2014StatsPage = function _get2014Stats(req, response) {
    request('http://localhost:5500/stats-2014', function(err, res, body) {
        if (!err && res.statusCode === 200) {
            determinePageData(req.query, JSON.parse(body), yearlyStatsColumns, calculateStatsAggregations, function(err, data) {
                response.send(data);
                //response.send(null);
                response.end()
            });
        }
        else {
            response.send();
            response.end();
        }
    });
};

var postGridData = function _postGridData(req, response) {
    var errors = [];

    var item = data.data.map(function _mapResults(player) {
        return {
            'FirstName': player.name_first,
            'LastName': player.last_name,
            'Team': player.team_name,
            'Position': player.pos,
            'GamesPlayed': Number.parseFloat(player.g),
            'AtBat': Number.parseFloat(player.ab),
            'Runs': Number.parseFloat(player.r),
            'Hits': Number.parseFloat(player.h),
            '2B': Number.parseFloat(player.d),
            '3B': Number.parseFloat(player.t),
            'HomeRuns': Number.parseFloat(player.hr),
            'RBI': Number.parseFloat(player.rbi),
            'Walks': Number.parseFloat(player.bb),
            'StrikeOuts': Number.parseFloat(player.so),
            'StolenBases': Number.parseFloat(player.sb),
            'BattingAverage': Number.parseFloat(player.avg)
        };
    }).forEach(function _postEachDatum(d) {
        request.post('http://localhost:5500/stats-2014', { json: d }, function(err, res) {
            var x;
        });
    });
    response.send(item);
};

var getGridPageData = function _getGridPageData(req, response) {
    request('http://localhost:2304/auto-repairs', function(err, res, body) {
        if (!err && res.statusCode === 200) {
            determinePageData(req.query, JSON.parse(body), columns, calculateAggregations, function(err, data) {
                response.send(data);
                //response.send(null);
                response.end()
            });
        }
        else {
            response.send();
            response.end();
        }
    });
};

var updateGridData = function _updateGridData(request, response) {
    response.send(request.body);
    response.end();
    /*performUpdate(function _updatesComplete(err, res) {
        response.send(res);
        response.end();
    });*/
};

function performUpdate(models, callback) {
    var idx = 0;
    makePutRequest(models[idx], function _updateCallback(err, res) {
        if (!err && models.length > 1) performUpdate(models.slice(1, models.length), callback);
        else callback(err, res);
    });
}

function makePutRequest(model, callback) {
    request.put('http://localhost:2304/auto-repairs', model, function(err, res, body) {
        callback(err, res, body);
    });
}

var getInitialGridDataSource = function _getInitialGridDataSource(req, res) {
    res.send(originalData);
    res.end();
};

var getDrillDownData = function _getDrillDownData(req, response) {
    request('http://localhost:2304/auto-repair-info', function(err, res, body) {
        if (!err && res.statusCode === 200) {
            var childData = findDataByParentId(JSON.parse(body), req.query.parentId);
            determinePageData(req.query, childData, drillDownColumns, calculateAggregations, function(err, data) {
                response.send(data);
                response.end();
            });
        }
        else {
            response.send();
            response.end();
        }
    });
};

var getYearlyStats = function _getYearlyStats(req, response) {
    var requests = (req.query['2014'] ? [{ year: '2014', id: req.query['2014'] }] : []).concat((req.query['2015'] ? [{ year: '2015', id: req.query['2015'] }] : []))
            .concat((req.query['2016'] ? [{ year: '2016', id: req.query['2016'] }] : [])).concat((req.query['2017'] ? [{ year: '2017', id: req.query['2017'] }] : [])),
        numRequests = requests.length,
        count = 0,
        results = [];

    requests.forEach(function _getStats(re) {
        request('http://localhost:5500/stats-' + re.year + '/' + re.id, function _response(err, res, body) {
            if (!err && res.statusCode === 200) {
                if (count === numRequests - 1) {
                    results = gridDataHelpers.sortGridData([{ field: 'Year', sortDirection: 'asc' }], results.concat(mapInYear(JSON.parse(body), re.year)), aggregateDrilldownColumns);
                    determinePageData(req.query, results, aggregateDrilldownColumns, calculateStatsAggregations, function(err, data) {
                        response.send(data);
                        response.end();
                    });
                }
                else {
                    count++;
                    results = results.concat(mapInYear(JSON.parse(body), re.year));
                }
            }
            else {
                response.send();
                response.end();
            }
        })
    });

    function mapInYear(stats, year) {
        return {
            Year: year,
            FirstName: stats.FirstName,
            LastName: stats.LastName,
            Team: stats.Team,
            Position: stats.Position,
            GamesPlayed: stats.GamesPlayed,
            AtBat: stats.AtBat,
            Runs: stats.Runs,
            Hits: stats.Hits,
            '2B': stats['2B'],
            '3B': stats['3B'],
            HomeRuns: stats.HomeRuns,
            RBI: stats.RBI,
            Walks: stats.Walks,
            StrikeOuts: stats.StrikeOuts,
            StolenBases: stats.StolenBases,
            BattingAverage: stats.BattingAverage
        };
    }
};

function determinePageData(requestObj, fullGridData, columns, aggregateCalculator, callback) {
    //TODO: I can make this much smarter and faster by checking to see if a filter has been added or removed. If added, just take the existing data
    //TODO: and filter it again. If removed, need to take the original data and apply all remaining filters.
    if (requestObj.filters && requestObj.filters.filterGroup && requestObj.filters.filterGroup.length) {
        fullGridData = gridDataHelpers.expressionParser.createFilterTreeFromFilterObject(requestObj.filters).filterCollection(fullGridData);
    }
    //TODO: figure out why node or jquery isn't preserving the empty [] sent from grid...
    if ((requestObj.groupedBy && requestObj.groupedBy.length) || (requestObj.sortedOn && requestObj.sortedOn.length)) {
        var groupSort;
        if ((requestObj.groupedBy && requestObj.groupedBy.length) && (requestObj.sortedOn && requestObj.sortedOn.length)) groupSort = requestObj.groupedBy.concat(requestObj.sortedOn);
        else if (requestObj.groupedBy && requestObj.groupedBy.length) groupSort = requestObj.groupedBy;
        else groupSort = requestObj.sortedOn;
        var sortedData = gridDataHelpers.sortGridData(groupSort, fullGridData, columns);
        limitPageData(requestObj, sortedData, aggregateCalculator, callback);
        return;
    }
    limitPageData(requestObj, fullGridData, aggregateCalculator, callback);
}

function limitPageData(requestObj, fullGridData, aggregateCalculator, callback) {
    var aggregations = aggregateCalculator(fullGridData);
    var returnData;
    if (requestObj.pageSize >= fullGridData.length)
        returnData = fullGridData;
    else {
        returnData = [];
        var startRow = (requestObj.pageNum-1) * (requestObj.pageSize);
        var endRow = fullGridData.length >= (startRow + parseInt(requestObj.pageSize)) ? (startRow + parseInt(requestObj.pageSize)) : fullGridData.length;

        for (var i = startRow; i < endRow; i++){
            returnData.push(fullGridData[i]);
        }
    }

    callback(null, { rowCount: fullGridData.length, data: returnData, aggregations: aggregations });
}

function calculateAggregations(fullGridData) {
    var labor, total = 0, mTotal = 0, max;
    for (var i = 0; i < fullGridData.length; i++) {
        total += parseFloat(fullGridData[i]['Labor']);
        if (!max || parseFloat(fullGridData[i]["Cost"]) > max) max = parseFloat(fullGridData[i]["Cost"]);
        mTotal += parseFloat(fullGridData[i]["Billed"]);
    }
    labor = parseFloat(total/parseFloat(fullGridData.length)).toFixed(2);
    return { Service: fullGridData.length, Labor: labor, Cost: max, Paid: fullGridData.length, Billed: mTotal };
}

function findDataByParentId(collection, parentId) {
    return collection.filter(function findChildData(data) {
        return data.AutoRepairId === parentId;
    });
}

function calculateStatsAggregations(data) {
    var games = 0,
        atBat = 0,
        runs = 0,
        hits = 0,
        doubles = 0,
        triples = 0,
        homeRuns = 0,
        rbi = 0,
        walks = 0,
        strikeOuts = 0,
        stolenBases = 0;

    data.forEach(function _calculateAvg(d) {
        games += d.GamesPlayed;
        atBat += d.AtBat;
        runs += d.Runs;
        hits += d.Hits;
        doubles += d['2B'];
        triples += d['3B'];
        homeRuns += d.HomeRuns;
        rbi += d.RBI;
        walks += d.Walks;
        strikeOuts += d.StrikeOuts;
        stolenBases += d.StolenBases;
    });

    return {
        GamesPlayed: (games / data.length).toFixed(2),
        AtBat: (atBat / data.length).toFixed(2),
        Runs: (runs / data.length).toFixed(2),
        Hits: (hits / data.length).toFixed(2),
        '2B': (doubles / data.length).toFixed(2),
        '3B': (triples / data.length).toFixed(2),
        HomeRuns: (homeRuns / data.length).toFixed(2),
        RBI: (rbi / data.length).toFixed(2),
        Walks: (walks / data.length).toFixed(2),
        StrikeOuts: (strikeOuts / data.length).toFixed(2),
        StolenBases: (stolenBases / data.length).toFixed(2),
        BattingAverage: (hits / atBat).toFixed(3)
    };
}