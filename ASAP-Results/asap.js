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

function createGraph(data, yName) {
    $("#chart")[0].innerHTML="";

    var n = data[0]["values"].length, // number of samples
        m = data.length;              // number of series

    var w = 680,
        h = 420,
        y = d3.scale.linear().domain([0, 1]).range([h, 0]),
        x0 = d3.scale.ordinal().domain(data[0].values.map(function(d) {return d.x;})).rangeBands([0, w], .2),
        x1 = d3.scale.ordinal().domain(d3.range(m)).rangeBands([0, x0.rangeBand()]),
        z = d3.scale.category10();

    var vis = d3.select("#chart")
      .append("svg:svg")
        .attr("width", w + 120)
        .attr("height", h + 40)
      .append("svg:g")
        .attr("transform", "translate(60,20)");

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    vis.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0,"+h+")")
      .call(xAxis)
     .append("text")
      .attr("y", 30)
      .attr("x", w/2-28)
      .attr("dy", ".71em")
      .style("text-anchor", "center")
      .text("Essay Set");

    vis.append("g")
      .attr("class", "y axis")
      .call(yAxis)
     .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -h/2)
      .attr("dy", ".71em")
      .style("text-anchor", "center")
      .text(yName);

    vis.selectAll(".y line")
      .attr("x2", w);

    var g = vis.selectAll("g barseries")
        .data(data)
      .enter().append("svg:g")
        .attr("fill", function(d, i) { var c=z(i*2); z(i+1); return c; })
        .attr("transform", function(d, i) { return "translate(" + x1(i) + ",0)"; });

    var rect = g.selectAll("rect")
        .data(function(d) {return d.values;})
      .enter().append("svg:rect")
        .attr("transform", function(d) { return "translate(" + x0(d.x) + ",0)"; })
        .attr("width", x1.rangeBand())
        .attr("height", function(d) { return h-y(d.y);})
        .attr("y", function(d) { return y(d.y); })
        .attr("opacity", 0.9);

    var legend = vis.selectAll(".legend")
        .data(data)
      .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { var y=i*20+3; return "translate(0," + y + ")"; });
    
    legend.append("rect")
        .attr("x", w - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) { return z(i*2);});
    
    legend.append("text")
        .attr("x", w - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d.key; });

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

function average_statistic(stat1, stat2) {
    return _.object(_.keys(stat1).map(function(key) { return [key, (stat1[key]+stat2[key])/2.0]}));
}

function exact(a, b) {
    return jStat.subtract(a,b).filter(function(x) {return x==0;}).length / a.length;
}

function adjacent(a, b) {
    return jStat.subtract(a,b).filter(function(x) {return Math.abs(x)<=1;}).length / a.length;
}

agreement_functions = {
    "correlation": jStat.corrcoeff,
    "exact": exact,
    "adjacent": adjacent
};

function getDataForGraph(rows, stat_function) {
    var intColumns = ["essay_id", "prediction_id", "rater1", "rater2", "combined", "winner"];
    rows.forEach(function(row) {
        intColumns.forEach(function(col) {row[col] = parseInt(row[col]); });
        row["winning_rater"] = combinedScoreToHumanRules[row["essay_set"]](row["winner"]);
        row["human_average_rater"] = Math.round((row["rater1"]+row["rater2"])/2);
    });

    data_by_essay_set = _.groupBy(rows, function(row) {return row.essay_set; });
    essay_sets = Object.keys(data_by_essay_set).sort();

    human_human_correlation = calculate_statistic(rows, "rater1", "rater2", stat_function);
    human1_machine_correlation = calculate_statistic(rows, "winning_rater", "rater1", stat_function);
    human2_machine_correlation = calculate_statistic(rows, "rater2", "winning_rater", stat_function);
    human_machine_correlation = average_statistic(human1_machine_correlation, human2_machine_correlation);

    max_correlation = calculate_statistic(rows, "rater1", "human_average_rater", stat_function);

    data_for_graph = [{"key": "Human", "values": _.pairs(human_human_correlation).sort(function(a,b) {return a[0]>b[0];}).map(pairToXY)},
                      {"key": "Machine", "values": _.pairs(human_machine_correlation).sort(function(a,b) {return a[0]>b[0];}).map(pairToXY)}];
    window.data_for_graph = data_for_graph;

    return data_for_graph;
}

d3.csv("asap-aes-results.csv", function(rows) {
    window.rows = rows;
    dataForGraph = getDataForGraph(rows, jStat.corrcoeff);
    window.dataForGraph = dataForGraph;
    createGraph(dataForGraph, "Correlation");
});

d3.select("#asap-aes-human-machine-rater-comparison-metric").on("change", function() {
  dataForGraph = getDataForGraph(rows, agreement_functions[this.value]);
  createGraph(dataForGraph, this.options[this.selectedIndex].text);
});