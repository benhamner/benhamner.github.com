halfAndRound = function(x) {return Math.round(x/2);}

combinedScoreToHumanRules = {
    "1" : halfAndRound,
    "2a" : _.identity,
    "2b" : _.identity,
    "3" : _.identity,
    "4" : _.identity,
    "5" : _.identity,
    "6" : _.identity,
    "7" : halfAndRound,
    "8" : halfAndRound
}

function extractColumn(rows, column) {
    return rows.map(function (row) {return row[column];});
}

function rowsToColumns(rows) {
    columns = _.object(_.keys(rows[0]).map(function(col) {return [col, []];}));
    rows.forEach(function(row) {_.keys(row).forEach(function(col) { columns[col].push(row[col])})});
    return columns;
}

function createGraph(data) {
  var columns = Object.keys(data[0]);
  var chart = nv.models.multiBarChart()
      .showControls(false);

  nv.addGraph(function() {

    chart.yAxis
        .tickFormat(d3.format(',.2f'));

    d3.select('#chart')
      .append("svg")
      .attr("height", "50%")
      .attr("width", "50%")
        .datum(data)
      .transition().duration(1).call(chart);

    nv.utils.windowResize(chart.update);

    return chart;
  });
}

function pairToXY(pair) {
    return {"x": pair[0], "y": pair[1]};
}

function mean_squared_error(a,b) {
    return jStat.mean(jStat.pow(jStat.subtract(a,b), 2));
}

function calculate_statistic(rows, col1, col2, stat_function) {
    data_by_essay_set = _.groupBy(rows, function(row) {return row.essay_set; });
    essay_sets = Object.keys(data_by_essay_set).sort();

    return _.object(essay_sets.map( function(essay_set) {
        var columns = rowsToColumns(data_by_essay_set[essay_set]);
        return [essay_set, stat_function(columns[col1], columns[col2])];
    }));
}

d3.csv("asap-aes-results.csv", function(rows) {
    var intColumns = ["essay_id", "prediction_id", "rater1", "rater2", "combined", "winner"];
    rows.forEach(function(row) {
        intColumns.forEach(function(col) {row[col] = parseInt(row[col]); });
        row["winning_rater"] = combinedScoreToHumanRules[row["essay_set"]](row["winner"]);
        row["human_average_rater"] = Math.round((row["rater1"]+row["rater2"])/2);
    });

    data_by_essay_set = _.groupBy(rows, function(row) {return row.essay_set; });
    essay_sets = Object.keys(data_by_essay_set).sort();

    stat_function = jStat.corrcoeff;

    human_human_correlation = calculate_statistic(rows, "rater1", "rater2", stat_function);
    human1_machine_correlation = calculate_statistic(rows, "winning_rater", "rater1", stat_function);
    human2_machine_correlation = calculate_statistic(rows, "rater2", "winning_rater", stat_function);
    max_correlation = calculate_statistic(rows, "rater1", "human_average_rater", stat_function);

    window.rows=rows;
    window.data_by_essay_set = data_by_essay_set;
    window.human_human_correlation = human_human_correlation;
    window.human1_machine_correlation = human1_machine_correlation;
    window.human2_machine_correlation = human2_machine_correlation;

    data_for_graph = [{"key": "Human 1 - Human2", "values": _.pairs(human_human_correlation).sort(function(a,b) {return a[0]>b[0];}).map(pairToXY)},
                      {"key": "Human 1 - Machine", "values": _.pairs(human1_machine_correlation).sort(function(a,b) {return a[0]>b[0];}).map(pairToXY)},
                      {"key": "Human 2 - Machine", "values": _.pairs(human2_machine_correlation).sort(function(a,b) {return a[0]>b[0];}).map(pairToXY)}];
    window.data_for_graph = data_for_graph;
    createGraph(data_for_graph);
});