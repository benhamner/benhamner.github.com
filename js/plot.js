function get_domain(dataset, axis) {
    x_min = parseFloat(d3.min(dataset, function(d) { return d[axis]; }));
    x_max = parseFloat(d3.max(dataset, function(d) { return d[axis]; }));
    x_range = x_max - x_min;
    return [x_min-0.1*x_range, x_max+0.1*x_range];
};

function combine_datasets(data_array, xName, yName) {
    dataset = []
    fillColors = ["#50AFEF", "#50EFAF", "#EF50AF"];

    for (i=0;i<data_array.length; i++)
    {
        temp_dataset = data_array[i].map(function (d) {return [d[xName], d[yName]];});
        temp_dataset.forEach(function(d) {d.push(fillColors[i])});
        window.td = temp_dataset;
        dataset=dataset.concat(temp_dataset);
    }

    return dataset;
}

function create_scatterplot(data_array, xName, yName) {
    h=400
    w=500
    padding=40

    dataset = combine_datasets(data_array, xName, yName);

    //Create scale functions
    var xScale = d3.scale.linear()
                         .domain(get_domain(dataset, 0))
                         .range([padding, w]);

    var yScale = d3.scale.linear()
                         .domain(get_domain(dataset, 1))
                         .range([h - padding, padding]);

    //Define X axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(8);

    //Define Y axis
    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(8);

    //Create SVG element
    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    //Create circles
    svg.selectAll("circle")
       .data(dataset)
       .enter()
       .append("circle")
       .attr("cx", function(d) {
            return xScale(d[0]);
       })
       .attr("cy", function(d) {
            return yScale(d[1]);
       })
       .attr("r", 3)
       .attr("fill", function(d) {return d[2]});

    //Create X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    svg.append("g")
      .append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", w-5)
        .attr("y", h-padding-10)
        .text(xName);

    //Create Y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", padding+15)
        .attr("x", -padding-10)
        .attr("transform", "rotate(-90)")
        .text(yName);

};

function expected_mean_absolute_error(p, phat) {
    return p+phat-2*p*phat;
}

function expected_k_loss(k, p, phat) {
    return p*Math.pow(1-phat,k)+(1-p)*Math.pow(phat,k);
}

function expected_mean_squared_error(p, phat) {
    return Math.pow(phat,2)+p-2*p*phat;
}

function expected_log_loss(p, phat) {
    return -(p)*Math.log(phat)-(1-p)*Math.log(1-phat);
}

function create_errorgraph() {
    h=400
    w=500
    padding=40

    //Create scale functions
    var xScale = d3.scale.linear()
                         .domain([0,1])
                         .range([padding, w]);

    var yScale = d3.scale.linear()
                         .domain([0,1])
                         .range([h - padding, padding]);

    //Define X axis
    var xAxis = d3.svg.axis()
                      .scale(xScale)
                      .orient("bottom")
                      .ticks(8);

    //Define Y axis
    var yAxis = d3.svg.axis()
                      .scale(yScale)
                      .orient("left")
                      .ticks(8);

    //Create SVG element
    var svg = d3.select("#chart")
                .append("svg")
                .attr("width", w)
                .attr("height", h);

    xs = d3.range(0.01,0.99,0.01);
    ys = xs.map(function (x) {return expected_k_loss(2, 0.7, x)});
    values = _.zip(xs, ys);

    // A line generator, for the dark stroke.
    var line = d3.svg.line()
        .interpolate("monotone")
        .x(function(d) { return xScale(d[0]); })
        .y(function(d) { return yScale(d[1]); });

      // Add the line path.
    svg.append("svg:path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr("d", line(values));

    //Create X axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);

    //Create Y axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

}