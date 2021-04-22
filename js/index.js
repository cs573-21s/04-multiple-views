$(function () {
    console.log(d3);
    d3.csv('data/yellow.csv').then(function (data_csv) {
        d3.json('data/NYC Taxi Zones.geojson').then(function (data_geo) {
            var brushforscatter;
            let margin = $('div.scatter').width() / 10;
            let margin_bar = $('div.bar').width() / 10;
            let status_scatter = 0;
            let status_bar = 0;
            let extentforscatter;
            let extentForScatterChoose = [[0, 0], [$('div.scatter').width(), $('div.scatter').height()]]
            let extentforbar;
            let extentForBarChoose = [0, $('div.bar').width() - margin_bar * 2];

            let x = d3.scaleTime()
                .domain([new Date('2020/12/1 0:00'), new Date('2020/12/1 6:00')])
                .rangeRound([0, $('div.bar').width() - margin_bar * 2])
                .clamp(true);
            let x_scale = d3.scaleLinear()
                .domain(d3.extent(data_csv, d => +(d.trip_distance)))
                .range([0, $('div.scatter').width() - 2 * margin]);

            let y_scale = d3.scaleLinear()
                .domain(d3.extent(data_csv, d => +(d.total_amount)))
                .range([$('div.scatter').height() - 2 * margin, 0])

            var dispatch = d3.dispatch("load", "brushScatter");

            $('button#linemap').on('click', function () {
                $("div.mapHeat").hide();
                $("div.mapGeo").show('clip', 1000, function () {
                    $('button#linemap').prop('disabled', true);
                    $('button#heatmap').prop('disabled', false);
                });
            })

            $('button#heatmap').on('click', function () {
                $("div.mapGeo").hide();
                $("div.mapHeat").show('clip', 1000, function () {
                    $('button#heatmap').prop('disabled', true);
                    $('button#linemap').prop('disabled', false);
                });

            })

            /******************************画一个时钟******************************************/
            dispatch.on('load.clock', function (data_csv, data_geo) {
                let clockWidth = $('div.clock').width();
                let clockHeight = $('div.clock').height();
                let clockSvgWidth = clockWidth > clockHeight ? clockHeight : clockWidth;
                let margin_clock = clockSvgWidth / 10;
                let clockRadius = (clockSvgWidth - 2 * margin_clock) / 2;
                let radians = Math.PI / 180
                let secondTickStart = clockRadius;
                let secondTickLength = -10;
                let hourTickStart = clockRadius;
                let hourTickLength = -18;
                let secondLabelRadius = clockRadius + 12;
                let hourLabelRadius = clockRadius - 40;
                let hourLabelYOffset = 7;

                let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();

                const sixty = d3
                    .scaleLinear()
                    .range([0, 360])
                    .domain([0, 60]);

                const twelve = d3
                    .scaleLinear()
                    .range([0, 360])
                    .domain([0, 12]);

                let arc = d3.arc()
                    .innerRadius(0)
                    .outerRadius(secondTickStart + secondTickLength)
                    .startAngle(twelve(getHoursX1) * radians)
                    .endAngle(twelve(getHoursX2) * radians)

                var svgClock = d3.select('div.clock')
                    .append('svg')
                    .attr('width', clockSvgWidth)
                    .attr('height', clockSvgWidth)


                const face = svgClock
                    .append("g")
                    .attr("id", "clock-face")
                    .attr("transform", 'translate(' + clockSvgWidth / 2 + ',' + clockSvgWidth / 2 + ')');

                var face_arc = face.append('path')
                    .attr('class', 'clock_arc')
                    .attr('d', arc)
                    .attr('fill', 'rgb(246,147,31,0.5)')

                face.selectAll(".second-tick")
                    .data(d3.range(0, 60))
                    .enter()
                    .append("line")
                    .attr("class", "second-tick")
                    .attr("x1", 0)
                    .attr("x2", 0)
                    .attr("y1", secondTickStart)
                    .attr("y2", secondTickStart + secondTickLength)
                    .attr("transform", d => 'rotate(' + sixty(d) + ')')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 3);

                face
                    .selectAll(".second-label")
                    .data(d3.range(5, 61, 5))
                    .enter()
                    .append("text")
                    .attr("class", "second-label")
                    .attr("text-anchor", "middle")
                    .attr("x", d => secondLabelRadius * Math.sin(sixty(d) * radians))
                    .attr("y", d => -secondLabelRadius * Math.cos(sixty(d) * radians) + 5)
                    .text(d => d);

                face
                    .selectAll(".hour-tick")
                    .data(d3.range(0, 12))
                    .enter()
                    .append("line")
                    .attr("class", "hour-tick")
                    .attr("x1", 0)
                    .attr("x2", 0)
                    .attr("y1", hourTickStart)
                    .attr("y2", hourTickStart + hourTickLength)
                    .attr("transform", d => 'rotate(' + twelve(d) + ')')
                    .attr('stroke', 'black')
                    .attr('stroke-width', 5);

                face
                    .selectAll(".hour-label")
                    .data(d3.range(3, 13, 3))
                    .enter()
                    .append("text")
                    .attr("class", "hour-label")
                    .attr("text-anchor", "middle")
                    .attr("x", d => hourLabelRadius * Math.sin(twelve(d) * radians))
                    .attr(
                        "y",
                        d => -hourLabelRadius * Math.cos(twelve(d) * radians) + hourLabelYOffset
                    )
                    .style('font-size', '24px')
                    .text(d => d);

                dispatch.on('brushScatter', function (extentForScatterChoose, extentForBarChoose) {
                    let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                    let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();
                    let arc = d3.arc()
                        .innerRadius(0)
                        .outerRadius(secondTickStart + secondTickLength)
                        .startAngle(twelve(getHoursX1) * radians)
                        .endAngle(twelve(getHoursX2) * radians)

                    face_arc.attr('d', arc)
                })
            })

            /****************************控制面板***************************************/
            dispatch.on('load.pannel', function (data_csv, data_geo) {
                $("#slider-range-trip_distance").slider({
                    range: true,
                    min: d3.min(data_csv, d => +(d.trip_distance)),
                    max: d3.max(data_csv, d => +(d.trip_distance)),
                    values: [d3.min(data_csv, d => +(d.trip_distance)), d3.max(data_csv, d => +(d.trip_distance))],
                    slide: function (event, ui) {
                        $("#trip_distance").val(ui.values[0] + " miles - " + ui.values[1] + " miles");
                        extentForScatterChoose[0][0] = x_scale(ui.values[0]) + margin;
                        extentForScatterChoose[1][0] = x_scale(ui.values[1]) + margin;
                        if (status_bar || status_scatter) {
                            d3.select('g.svgScatter').call(brushforscatter.move, [[extentForScatterChoose[0][0], extentForScatterChoose[0][1]], [extentForScatterChoose[1][0], extentForScatterChoose[1][1]]]);
                        } else {
                            status_scatter = 1;
                            extentForScatterChoose[0][1] = 0;
                            extentForScatterChoose[1][1] = $('div.scatter').height();
                            d3.select('g.svgScatter').call(brushforscatter.move, [[extentForScatterChoose[0][0], extentForScatterChoose[0][1]], [extentForScatterChoose[1][0], extentForScatterChoose[1][1]]]);
                        }
                    }
                });
                $("#trip_distance").val($("#slider-range-trip_distance").slider("values", 0) +
                    " miles - " + $("#slider-range-trip_distance").slider("values", 1) + " miles");

                $("#slider-range-total_amount").slider({
                    range: true,
                    min: d3.min(data_csv, d => +(d.total_amount)),
                    max: d3.max(data_csv, d => +(d.total_amount)),
                    values: [d3.min(data_csv, d => +(d.total_amount)), d3.max(data_csv, d => +(d.total_amount))],
                    slide: function (event, ui) {
                        $("#total_amount").val(ui.values[0] + " $ - " + ui.values[1] + " $");
                        extentForScatterChoose[1][1] = y_scale(ui.values[0]) + margin;
                        extentForScatterChoose[0][1] = y_scale(ui.values[1]) + margin;
                        if (status_bar || status_scatter) {
                            d3.select('g.svgScatter').call(brushforscatter.move, [[extentForScatterChoose[0][0], extentForScatterChoose[0][1]], [extentForScatterChoose[1][0], extentForScatterChoose[1][1]]]);
                        } else {
                            status_scatter = 1;
                            extentForScatterChoose[0][0] = 0;
                            extentForScatterChoose[1][0] = $('div.scatter').width();
                            d3.select('g.svgScatter').call(brushforscatter.move, [[extentForScatterChoose[0][0], extentForScatterChoose[0][1]], [extentForScatterChoose[1][0], extentForScatterChoose[1][1]]]);
                        }
                    }
                });
                $("#total_amount").val($("#slider-range-total_amount").slider("values", 0) +
                    " $ - " + $("#slider-range-total_amount").slider("values", 1) + " $");

                dispatch.on('brushScatter.pannel', function (extentforscatter, extentForBarChoose) {
                    if (extentforscatter[0][0] !== extentforscatter[1][0] && extentforscatter[0][1] !== extentforscatter[1][1]) {
                        $('#slider-range-trip_distance').slider("values", [x_scale.invert(extentforscatter[0][0] - margin), x_scale.invert(extentforscatter[1][0] - margin)]);
                        $("#trip_distance").val($("#slider-range-trip_distance").slider("values", 0) +
                            " miles - " + $("#slider-range-trip_distance").slider("values", 1) + " miles");
                        $('#slider-range-total_amount').slider("values", [y_scale.invert(extentforscatter[1][1] - margin), y_scale.invert(extentforscatter[0][1] - margin)]);
                        $("#total_amount").val($("#slider-range-total_amount").slider("values", 0) +
                            " $ - " + $("#slider-range-total_amount").slider("values", 1) + " $");
                    } else {
                        $('#slider-range-trip_distance').slider("values", [d3.min(data_csv, d => +(d.trip_distance)), d3.max(data_csv, d => +(d.trip_distance))]);
                        $("#trip_distance").val($("#slider-range-trip_distance").slider("values", 0) +
                            " miles - " + $("#slider-range-trip_distance").slider("values", 1) + " miles");
                        $('#slider-range-total_amount').slider("values", [d3.min(data_csv, d => +(d.total_amount)), d3.max(data_csv, d => +(d.total_amount))]);
                        $("#total_amount").val($("#slider-range-total_amount").slider("values", 0) +
                            " $ - " + $("#slider-range-total_amount").slider("values", 1) + " $");
                    }

                })

            })
            /***********************画一个热图****************************************/
            dispatch.on('load.heatmap', function (data_csv, data_geo) {
                var heatMapDataGenerater = (function (extentForScatterChoose, extentForBarChoose) {
                    let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                    let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();
                    let brushDataBar = data_csv.filter(function (d) {
                        return x_scale(d.trip_distance) > (extentForScatterChoose[0][0] - margin) && x_scale(d.trip_distance) < (extentForScatterChoose[1][0] - margin) && y_scale(d.total_amount) > (extentForScatterChoose[0][1] - margin) && y_scale(d.total_amount) < (extentForScatterChoose[1][1] - margin)
                            && (new Date(d.tpep_pickup_datetime)).getHours() >= getHoursX1 && (new Date(d.tpep_pickup_datetime)).getHours() < getHoursX2
                    })

                    b = d3.group(brushDataBar, d => d.PULocationID)

                    return b;
                });
                var data_csv_Heat = heatMapDataGenerater(extentForScatterChoose, extentForBarChoose);

                var color = d3.scaleSequential(d3.interpolateOranges)
                    .domain([0, d3.max(data_csv_Heat, d => d[1].length)])

                var mapHeatHeight = $('div.mapGeo').height();
                var mapHeatWidth = $('div.mapGeo').width();
                var svgMap = d3.select('.mapHeat')
                    .append('svg')
                    .attr('width', '100%')
                    .attr('height', '100%');

                var projection = d3.geoMercator().fitExtent(
                    [
                        [20, 20],
                        [mapHeatWidth - 20, mapHeatHeight - 20],
                    ], data_geo);

                var pathGenerator = d3.geoPath()
                    .projection(projection);

                var mapPath = svgMap.append('g');

                var paths = mapPath.selectAll("path")
                    .data(data_geo.features)
                    .enter()
                    .append("path")
                    .attr("d", pathGenerator)
                    .attr("stroke-width", 0.5)
                    .attr("stroke", "black")
                    .attr("fill", function (d, i) {
                        if (data_csv_Heat.get(d.properties.location_id)) {
                            return color(data_csv_Heat.get(d.properties.location_id).length)
                        } else {
                            return 'gray'
                        }
                    })

                $('button#heatmap').prop('disabled', true);
                $('button#linemap').prop('disabled', true);
                $("div.mapHeat").show('fade', 2000, function () {
                    $('button#linemap').prop('disabled', false);
                });


                dispatch.on('brushScatter.heatmap', function (extentForScatterChoose, extentForBarChoose) {
                    if (status_bar || status_scatter) {
                        var data_csv_Heat = heatMapDataGenerater(extentForScatterChoose, extentForBarChoose);
                        paths.attr('fill', color(0))
                            .attr("fill", function (d, i) {

                                if (data_csv_Heat.get(d.properties.location_id)) {
                                    return color(data_csv_Heat.get(d.properties.location_id).length)
                                } else {
                                    return 'gray'
                                }
                            })
                    } else {
                        extentForScatterChoose = [[0, 0], [$('div.scatter').width(), $('div.scatter').height()]];
                        extentForBarChoose = [0, $('div.bar').width() - margin_bar * 2];
                        var data_csv_Heat = heatMapDataGenerater(extentForScatterChoose, extentForBarChoose);
                        paths.attr('fill', color(0))
                            .attr("fill", function (d, i) {

                                if (data_csv_Heat.get(d.properties.location_id)) {
                                    return color(data_csv_Heat.get(d.properties.location_id).length)
                                } else {
                                    return 'gray'
                                }
                            })
                    }

                })
            })

            /***********************画一个地图******************************/
            dispatch.on('load.map', function (data_csv, data_geo) {
                var mapGeoHeight = $('div.mapGeo').height();
                var mapGeoWidth = $('div.mapGeo').width();
                var centroid = {};
                let margin = $('div.scatter').width() / 10;

                var svgMap = d3.select('.mapGeo')
                    .append('svg')
                    .attr('width', '100%')
                    .attr('height', '100%')
                    .style('background-color', 'rgba(112,128,144,0)')

                var projection = d3.geoMercator().fitExtent(
                    [
                        [20, 20],
                        [mapGeoWidth - 20, mapGeoHeight - 20],
                    ], data_geo);

                var pathGenerator = d3.geoPath()
                    .projection(projection);

                var mapPath = svgMap.append('g');

                mapPath.selectAll("path")
                    .data(data_geo.features)
                    .enter()
                    .append("path")
                    .attr("d", pathGenerator)
                    .attr("stroke-width", 0.5)
                    .attr("stroke", "#fff")
                    .attr("fill", 'gray')

                var mapcenter = svgMap.append('g')
                mapcenter.selectAll('circle')
                    .data(data_geo.features)
                    .enter()
                    .append('circle')
                    .attr('cx', function (d) {
                        var key = d.properties.location_id;
                        centroid[key] = {
                            'x': pathGenerator.centroid(d)[0],
                            'y': pathGenerator.centroid(d)[1]
                        }
                        return pathGenerator.centroid(d)[0]
                    })
                    .attr('cy', function (d) {
                        return pathGenerator.centroid(d)[1]
                    })
                    .attr('r', 1)
                    .attr('fill', 'none')

                var map_line = svgMap.append('g')
                var lines = map_line.selectAll('line')
                    .data(data_csv)
                    .enter()
                    .append('line')
                    .style("stroke", "#fee0c3")
                    .style("stroke-width", 1)
                    .attr('opacity', 0.3)
                    .attr('x1', function (d, i) {
                        if (d.DOLocationID < 264 && d.PULocationID < 264) {
                            return +centroid[d.DOLocationID].x
                        } else {
                            return -10
                        }
                    })
                    .attr('y1', function (d) {
                        if (d.DOLocationID < 264 && d.PULocationID < 264) {
                            return +centroid[d.DOLocationID].y
                        } else {
                            return -10
                        }
                    })
                    .attr('x2', function (d) {
                        if (d.DOLocationID < 264 && d.PULocationID < 264) {
                            return +centroid[d.PULocationID].x
                        } else {
                            return -10
                        }

                    })
                    .attr('y2', function (d) {
                        if (d.DOLocationID < 264 && d.PULocationID < 264) {
                            return +centroid[d.PULocationID].y
                        } else {
                            return -10
                        }
                    })

                var linemapLegend = svgMap.append('g')

                linemapLegend.append('rect')
                    .attr('x', mapGeoWidth * 7 / 10)
                    .attr('y', mapGeoHeight * 9 / 10)
                    .attr('width', 10)
                    .attr('height', 10)
                    .attr('fill', "#fee0c3");

                linemapLegend.append('rect')
                    .attr('x', mapGeoWidth * 7 / 10)
                    .attr('y', mapGeoHeight * 9 / 10 + 20)
                    .attr('width', 10)
                    .attr('height', 10)
                    .attr('fill', '#f7700d');

                linemapLegend.append('text')
                    .attr('x', mapGeoWidth * 7 / 10 + 20)
                    .attr('y', mapGeoHeight * 9 / 10 + 7.5)
                    .style('font-size', 15)
                    .text('unselected path')

                linemapLegend.append('text')
                    .attr('x', mapGeoWidth * 7 / 10 + 20)
                    .attr('y', mapGeoHeight * 9 / 10 + 27.5)
                    .style('font-size', 15)
                    .text('selected path')

                dispatch.on('brushScatter.map', function (extentForScatterChoose, extentForBarChoose) {
                    let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                    let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();
                    lines.style('stroke', '#fee0c3')
                        .style("stroke-width", 1)
                        .attr('opacity', '0.3')
                        .filter(function (d) {
                            if (x_scale(d.trip_distance) > (extentForScatterChoose[0][0] - margin) && x_scale(d.trip_distance) < (extentForScatterChoose[1][0] - margin) && y_scale(d.total_amount) > (extentForScatterChoose[0][1] - margin) && y_scale(d.total_amount) < (extentForScatterChoose[1][1] - margin)
                                && (new Date(d.tpep_pickup_datetime)).getHours() >= getHoursX1 && (new Date(d.tpep_pickup_datetime)).getHours() < getHoursX2) {
                                return d;
                            }
                        })
                        .transition()
                        .duration(100)
                        .style('stroke', '#f7700d')
                        .style("stroke-width", 2)
                        .attr('opacity', '1');
                })
            })

            /****************************画一个散点图**********************************/
            dispatch.on('load.scatter', function (data_csv, data_geo) {
                var svgScatter = d3.select('.scatter')
                    .append('svg')
                    .attr('width', '100%')
                    .attr('height', '100%');

                var x_axis_scatter = d3.axisBottom()
                    .scale(x_scale);

                var y_axis_scatter = d3.axisLeft()
                    .scale(y_scale);

                var svgScatterCircle = svgScatter.append('g');
                var cirlces = svgScatterCircle.selectAll('circle')
                    .data(data_csv)
                    .enter()
                    .append('circle')
                    .attr('cx', function (d) {
                        return x_scale(d.trip_distance)
                    })
                    .attr('cy', function (d) {
                        return y_scale(d.total_amount)
                    })
                    .attr('r', 3)
                    .attr('opacity', 0.5)
                    .attr('fill', 'gray')
                    .attr('transform', 'translate(' + margin + ',' + margin + ')');

                svgScatter.append('g')
                    .call(x_axis_scatter)
                    .attr('transform', 'translate(' + margin + ',' + ($('div.scatter').height() - margin) + ')');
                svgScatter.append('g')
                    .call(y_axis_scatter)
                    .attr('transform', 'translate(' + margin + ',' + margin + ')')

                svgScatter.append('g')
                    .append('text')
                    .attr('text-anchor', 'start')
                    .text('$')
                    .attr('x', $('div.scatter').width() / 9)
                    .attr('y', $('div.scatter').height() / 10)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .style('font-size', 20)
                svgScatter.append('g')
                    .append('text')
                    .attr('text-anchor', 'end')
                    .text('miles')
                    .attr('x', $('div.scatter').width() * 9 / 10)
                    .attr('y', $('div.scatter').height() * 9 / 10)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .style('font-size', 20)


                brushforscatter = d3.brush()
                    .extent([[0, 0], [$('div.scatter').width(), $('div.scatter').height()]])
                    .on('end', function (e) {
                        if (!e.sourceEvent == true) {
                            dispatch.call('brushScatter', this, extentForScatterChoose, extentForBarChoose);
                            return;
                        }
                        if (e.selection !== null) {
                            extentforscatter = e.selection;
                            extentForScatterChoose = e.selection;
                            status_scatter = 1;
                        } else {
                            extentforscatter = [[0, 0], [0, 0]];
                            status_scatter = 0;
                            if (!(status_bar || status_scatter)) {
                                extentForScatterChoose = [[0, 0], [0, 0]];
                            } else {
                                extentForScatterChoose = [[0, 0], [$('div.scatter').width(), $('div.scatter').height()]];
                            }
                        }

                        dispatch.call('brushScatter', this, extentForScatterChoose, extentForBarChoose)
                    })

                svgScatter.append('g')
                    .attr('class', 'svgScatter')
                    .call(brushforscatter)

                dispatch.on('brushScatter.scatter', function (extentForScatterChoose, extentForBarChoose) {
                    let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                    let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();
                    cirlces.style('fill', 'gray')
                        .style("stroke", 'none')
                        .attr('opacity', '0.5')
                        .filter(function (d) {
                            if (x_scale(d.trip_distance) > (extentForScatterChoose[0][0] - margin) && x_scale(d.trip_distance) < (extentForScatterChoose[1][0] - margin) && y_scale(d.total_amount) > (extentForScatterChoose[0][1] - margin) && y_scale(d.total_amount) < (extentForScatterChoose[1][1] - margin)
                                && (new Date(d.tpep_pickup_datetime)).getHours() >= getHoursX1 && (new Date(d.tpep_pickup_datetime)).getHours() < getHoursX2) {
                                return d;
                            }
                        })
                        .style("stroke", "#f6931f")
                        .style('fill', 'white')
                        .attr('opacity', '0.7')
                })
            })

            /********************************画一个直方图****************************************/
            dispatch.on('load.bar', function (data_csv, data_geo) {
                var barDataGenarater = (function (data) {
                    var count01 = count12 = count23 = count34 = count45 = count56 = 0;
                    for (let i = 0; i < data.length; i++) {
                        if (new Date(data[i].tpep_pickup_datetime).getHours() == 0) {
                            count01++;
                        } else if (new Date(data[i].tpep_pickup_datetime).getHours() == 1) {
                            count12++;
                        } else if (new Date(data[i].tpep_pickup_datetime).getHours() == 2) {
                            count23++;
                        } else if (new Date(data[i].tpep_pickup_datetime).getHours() == 3) {
                            count34++;
                        } else if (new Date(data[i].tpep_pickup_datetime).getHours() == 4) {
                            count45++;
                        } else if (new Date(data[i].tpep_pickup_datetime).getHours() == 5) {
                            count56++;
                        }
                    }
                    let count = [count01, count12, count23, count34, count45, count56];
                    return count;
                })
                var count = barDataGenarater(data_csv);

                var label = ['0:00-1:00am', '1:00-2:00am', '2:00-3:00am', '3:00-4:00am', '4:00-5:00am', '5:00-6:00am'];
                var svgBar = d3.select('.bar')
                    .append('svg')
                    .attr('width', '100%')
                    .attr('height', '100%');

                var x_scale_bar = d3.scaleBand()
                    .domain(label)
                    .range([0, $('div.bar').width() - 2 * margin_bar])

                var y_scale_bar = d3.scaleLinear()
                    .domain([0, d3.max(count)])
                    .range([$('div.bar').height() - 2 * margin_bar, 0])

                var x_axis_bar = d3.axisBottom()
                    .scale(x_scale_bar);

                var y_axis_bar = d3.axisLeft()
                    .scale(y_scale_bar);

                var svgBarReact = svgBar.append('g');
                var rects = svgBarReact.selectAll('.rect')
                    .data(count)
                    .enter()
                    .append('rect')
                    .attr('x', function (d, i) {
                        return x_scale_bar(label[i])
                    })
                    .attr('y', function (d, i) {
                        return y_scale_bar(d)
                    })
                    .attr('width', function () {
                        return ($('div.bar').width() - margin_bar * 2) / 6
                    })
                    .attr('height', function (d, i) {
                        return ($('div.bar').height() - margin_bar * 2) - y_scale_bar(d)
                    })
                    .attr('fill', 'gray')
                    .attr('stroke', 'white')
                    .attr('transform', 'translate(' + margin_bar + ',' + margin_bar + ')')

                svgBar.append('g')
                    .call(x_axis_bar)
                    .attr('transform', 'translate(' + margin_bar + ',' + ($('div.bar').height() - margin_bar) + ')')
                    .selectAll('text')
                    .attr("transform", "rotate(15)");

                svgBar.append('g')
                    .call(y_axis_bar)
                    .attr('transform', 'translate(' + margin_bar + ',' + (margin_bar) + ')')

                svgBar.append('g')
                    .append('text')
                    .attr('text-anchor', 'start')
                    .text('counts')
                    .attr('x', $('div.scatter').width() / 10)
                    .attr('y', $('div.scatter').height() / 20)
                    .attr('fill', 'white')
                    .attr('stroke', 'black')
                    .style('font-size', 20)

                var brushforbar = d3.brushX()
                    .extent([[0, 0], [$('div.bar').width(), $('div.bar').height()]])
                    .on('end', function (e) {
                        if (e.selection !== null) {
                            if (!(status_bar || status_scatter)) {
                                extentForScatterChoose = [[0, 0], [$('div.scatter').width(), $('div.scatter').height()]]
                            }
                            status_bar = 1;
                            extentforbar = e.selection;
                            extentForBarChoose = e.selection;

                            if (!e.sourceEvent == true) {
                                dispatch.call('brushScatter', this, extentForScatterChoose, extentForBarChoose)
                                return;
                            }

                            let x1 = d3.timeHour.floor(x.invert(extentforbar[0] - margin_bar + 2))
                            let x2 = d3.timeHour.ceil(x.invert(extentforbar[1] - margin_bar - 2))
                            console.log('x1' + x.invert(extentforbar[0] - margin_bar), x1)
                            console.log('x2' + x.invert(extentforbar[1] - margin_bar), x2)
                            d3.select(this).transition().call(brushforbar.move, [x(x1) + margin_bar, x(x2) + margin_bar])

                        } else {
                            extentforbar = [0, 0];
                            status_bar = 0;
                            if (!(status_bar || status_scatter)) {
                                extentForScatterChoose = [[0, 0], [0, 0]];
                                extentForBarChoose = [0, $('div.bar').width() - margin_bar * 2];
                            } else {
                                extentForBarChoose = [0, $('div.bar').width() - margin_bar * 2];
                            }
                            dispatch.call('brushScatter', this, extentForScatterChoose, extentForBarChoose)
                        }
                    })

                svgBar.append('g')
                    .call(brushforbar);

                dispatch.on('brushScatter.bar', function (extentForScatterChoose, extentForBarChoose) {
                    if (status_bar || status_scatter) {
                        let brushDataBar = data_csv.filter(function (d) {
                            return d.trip_distance > x_scale.invert(extentForScatterChoose[0][0] - margin) && d.trip_distance < x_scale.invert(extentForScatterChoose[1][0] - margin) && d.total_amount < y_scale.invert(extentForScatterChoose[0][1] - margin) && d.total_amount > y_scale.invert(extentForScatterChoose[1][1] - margin)
                        })
                        let countBrush = barDataGenarater(brushDataBar);
                        svgBarReact.selectAll('rect')
                            .data(countBrush)
                            .join(
                                enter => enter,
                                update => {
                                    update.transition()
                                        .attr('y', function (d) {
                                            return y_scale_bar(d)
                                        })
                                        .attr('height', function (d) {
                                            return ($('div.bar').height() - margin_bar * 2) - y_scale_bar(d)
                                        })
                                }
                            )
                    } else {
                        svgBarReact.selectAll('rect')
                            .data(count)
                            .join(
                                enter => enter,
                                update => {
                                    update.transition()
                                        .attr('y', function (d) {
                                            return y_scale_bar(d)
                                        })
                                        .attr('height', function (d) {
                                            return ($('div.bar').height() - margin_bar * 2) - y_scale_bar(d)
                                        })
                                }
                            )
                    }
                })
            })

            /*******************************生成数据栏****************************************************/
            dispatch.on('load.data', function (data_csv, data_geo) {
                let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();

                let brushDataBar = data_csv.filter(function (d) {
                    return x_scale(d.trip_distance) > (extentForScatterChoose[0][0] - margin) && x_scale(d.trip_distance) < (extentForScatterChoose[1][0] - margin) && y_scale(d.total_amount) > (extentForScatterChoose[0][1] - margin) && y_scale(d.total_amount) < (extentForScatterChoose[1][1] - margin)
                        && (new Date(d.tpep_pickup_datetime)).getHours() >= getHoursX1 && (new Date(d.tpep_pickup_datetime)).getHours() < getHoursX2
                })
                var table = $('div.date table');
                for (let i = 0; i < brushDataBar.length; i++) {
                    table.append('<tr><td>' + i + '</td><td>' + brushDataBar[i].tpep_pickup_datetime + '</td><td>' + brushDataBar[i].tpep_dropoff_datetime + '</td><td>' + brushDataBar[i].trip_distance + '</td><td>' + brushDataBar[i].PULocationID + '</td><td>' + brushDataBar[i].DOLocationID + '</td><td>' + brushDataBar[i].tip_amount + '</td><td>' + brushDataBar[i].total_amount + '</td></tr>')
                }

                dispatch.on('brushScatter.data', function (extentForScatterChoose, extentForBarChoose) {
                    if (status_bar || status_scatter) {
                        let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                        let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();
                        let brushDataBar = data_csv.filter(function (d) {
                            return x_scale(d.trip_distance) > (extentForScatterChoose[0][0] - margin) && x_scale(d.trip_distance) < (extentForScatterChoose[1][0] - margin) && y_scale(d.total_amount) > (extentForScatterChoose[0][1] - margin) && y_scale(d.total_amount) < (extentForScatterChoose[1][1] - margin)
                                && (new Date(d.tpep_pickup_datetime)).getHours() >= getHoursX1 && (new Date(d.tpep_pickup_datetime)).getHours() < getHoursX2
                        })
                        table.html('');
                        table.append('<tr><th>id<th>tpep_pickup_datetime<th>tpep_dropoff_datetime<th>trip_dista<th>PULocationID</th><th>DOLocationID</th><th>tip_amount</th><th>total_amount</th></tr>');
                        for (let i = 0; i < brushDataBar.length; i++) {
                            table.append('<tr><td>' + i + '</td><td>' + brushDataBar[i].tpep_pickup_datetime + '</td><td>' + brushDataBar[i].tpep_dropoff_datetime + '</td><td>' + brushDataBar[i].trip_distance + '</td><td>' + brushDataBar[i].PULocationID + '</td><td>' + brushDataBar[i].DOLocationID + '</td><td>' + brushDataBar[i].tip_amount + '</td><td>' + brushDataBar[i].total_amount + '</td></tr>')
                        }
                    } else {
                        extentForScatterChoose = [[0, 0], [$('div.scatter').width(), $('div.scatter').height()]];
                        extentForBarChoose = [0, $('div.bar').width() - margin_bar * 2];
                        let getHoursX1 = x.invert(extentForBarChoose[0]).getHours();
                        let getHoursX2 = x.invert(extentForBarChoose[1]).getHours();
                        let brushDataBar = data_csv.filter(function (d) {
                            return x_scale(d.trip_distance) > (extentForScatterChoose[0][0] - margin) && x_scale(d.trip_distance) < (extentForScatterChoose[1][0] - margin) && y_scale(d.total_amount) > (extentForScatterChoose[0][1] - margin) && y_scale(d.total_amount) < (extentForScatterChoose[1][1] - margin)
                                && (new Date(d.tpep_pickup_datetime)).getHours() >= getHoursX1 && (new Date(d.tpep_pickup_datetime)).getHours() < getHoursX2
                        })
                        table.html('');
                        table.append('<tr><th>id<th>tpep_pickup_datetime<th>tpep_dropoff_datetime<th>trip_dista<th>PULocationID</th><th>DOLocationID</th><th>tip_amount</th><th>total_amount</th></tr>');
                        for (let i = 0; i < brushDataBar.length; i++) {
                            table.append('<tr><td>' + i + '</td><td>' + brushDataBar[i].tpep_pickup_datetime + '</td><td>' + brushDataBar[i].tpep_dropoff_datetime + '</td><td>' + brushDataBar[i].trip_distance + '</td><td>' + brushDataBar[i].PULocationID + '</td><td>' + brushDataBar[i].DOLocationID + '</td><td>' + brushDataBar[i].tip_amount + '</td><td>' + brushDataBar[i].total_amount + '</td></tr>')
                        }
                    }
                })
            })

            dispatch.call('load', this, data_csv, data_geo);
        })
    });
})