var width, height;

const config = {
	stroke: '#000',
	map: {
		fill: '#fff',
		stroke: '#000'
	}
};

const countryCentroids = {};

// country names are not consistent between geoJSON data and terrorist attack data
// 'from csv': 'to geoJSON'
const countryNameTransformation = {
	'United States': 'United States of America'
};
function transformCountryNames(a) {
	if (a.Entity in countryNameTransformation) {
		a.Entity = countryNameTransformation[a.Entity];
	}
	return a;
}

function drawMap(svg, path, countries, data, categories, svgBar) {
	const colorMappingScale = d3.scaleLinear().domain(d3.extent([0, ...Object.values(data).map(a => Math.max(...Object.entries(a).filter(([key, value]) => categories.includes(key)).map(([key, value]) => value)))])).range(["#edf5ff", "#001d6c"])
	
	const mapSvgData = svg.append('g');
	const mapSvgDataPaths = mapSvgData.selectAll('path')
		.data(countries.features)
		.enter()
		.append('path')
		.attr('d', path)
		.style('stroke', config.map.stroke)
		.style('stroke-width', '1')
		.attr('fill', c => c.properties.ADMIN in data ? colorMappingScale(Math.max(...Object.entries(data[c.properties.ADMIN]).filter(([key, value]) => categories.includes(key)).map(([key, value]) => value))) : 'white')

		/**
		 * Brush stuff for map
		 */
		const brush = d3.brush()
			.extent([[0, 0], [width, height]])
			.on('start', brushstarted)
			.on('brush', debounceBrushed)
			.on('end', brushended);
		mapSvgData.call(brush);
		let brushCell;
		function brushstarted() {
			if (brushCell !== this) {
				d3.select(brushCell).call(brush.move, null);
				brushCell = this;
			}
		}
		function brushed({selection}) {
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection;
				mapSvgDataPaths.classed('hidden', c => {
					const country = c.properties.ADMIN;
					const [x, y] = countryCentroids[country];
					const isHidden = x0 > x || x1 < x || y0 > y || y1 < y;
					if (country in data) {
						data[country].isHidden = isHidden;
					}
					return isHidden;
				});
			}
			drawBar(svgBar, data, categories);
		}
		let brushTimer = null;
		function debounceBrushed(event) {
			clearTimeout(brushTimer);
			brushTimer = setTimeout(function() {
				brushed(event);
			}, 75);
		}
		function brushended({selection}) {
			if (selection) return;
			mapSvgDataPaths.classed('hidden', false);
			for (const country in data) {
				data[country].isHidden = false;
			}
			drawBar(svgBar, data, categories);
		}
}

function drawBar(svg, data, categories) {
	const dataToDraw = Object.values(data).filter(d => !d.isHidden);
	if (!dataToDraw.length) { // case where everything is hidden, clear bars from chart and exit
		svg.selectAll('g.bars').remove();
		return;
	};
	const barData = categories.map(c => ({ category: c, value: 0 }));
	for (const d of dataToDraw) {
		for (const category of categories) {
			barData.find(a => a.category === category).value += d[category];
		}
	}
	const padding = 200, barWidth = 40, bWidth = width / 4, bHeight = height / 2;
	svg.selectAll('g').remove();
	const categoryScale = d3.scaleOrdinal(d3.schemeCategory10).domain(categories); // TODO not perfect because there are 12 categories and only 10 colors :(
	const barScale = d3.scaleLinear().domain(d3.extent(barData, d => d.value)).range([0, bHeight - padding]);
	let xPos = 0;
	svg.append('g')
		.attr('class', 'bars')
		.selectAll('rect')
		.data(barData)
		.enter()
		.append('rect')
		.attr('x', d => xPos += barWidth)
		.attr('y', d => svg.attr('height') - barScale(d.value) - padding)
		.attr('width', barWidth)
		.attr('height', d => barScale(d.value))
		.style('stroke', config.stroke)
		.style('stroke-width', '1')
		.style('fill', d => categoryScale(d.category));


	const xAxis = d3.axisBottom()
		.scale(d3.scalePoint().domain(categories).range([barWidth, barWidth * categories.length]))
	const xAxisGroup = svg.append('g')
		.attr('class', 'axis')
		.attr('transform', `translate(${barWidth / 2}, ${bHeight - padding})`)
	xAxisGroup.call(xAxis);
	xAxisGroup.attr('text-anchor', 'left')
		.attr('font-size', '16');
	xAxisGroup.selectAll('.tick > text')
		.style('transform', 'rotate(90deg) translate(10px, -14px)')
		.style('-webkit-font-smoothing', 'subpixel-antialiased')
		.style('user-select', 'none');

	const yAxisScale = d3.scaleLinear().domain(d3.extent(barData, d => d.value)).range([bHeight - padding, 0]);
	const yAxis = d3.axisLeft()
		.scale(yAxisScale)
	const yAxisGroup = svg.append('g')
		.attr('class', 'axis')
		.attr('transform', `translate(${barWidth}, 0)`)
		yAxisGroup.call(yAxis);
		yAxisGroup.selectAll('.tick > text')
		.style('-webkit-font-smoothing', 'subpixel-antialiased')
		.style('user-select', 'none');
}

window.addEventListener('load', async function() {

	const svgMap = d3.select('#map');
	const svgBar = d3.select('#bar');
	const { clientWidth, clientHeight } = document.body;
	width = clientWidth;
	height = clientHeight;
	const projection = d3.geoMercator();
	const path = d3.geoPath(projection);

	svgMap.attr('width', width).attr('height', height);
	projection.translate([width / 2, height / 2]);
	svgBar.attr('width', width / 4).attr('height', height / 2);

	
	console.time('data fetch/parse');
	const countries = await d3.json('data/countries.geo.json');
	for (const country of countries.features) {
		countryCentroids[country.properties.ADMIN] = path.centroid(country);
	}
	const countriesList = countries.features.map(feature => feature.properties.ADMIN);

	const attacks = (await d3.csv('data/Terrorist attacks by weapon type - Global Terrorism Database (2018).csv'))
		.map(transformCountryNames) // try to make country names uniform between geoJSON and csv data
		.filter(a => countriesList.includes(a.Entity.trim())) // make sure we have geoJSON data for these datapoints
		.map(a => ({
			Biological: parseInt(a.Biological),
			Chemical: parseInt(a.Chemical),
			Entity: a.Entity,
			Explosives: parseInt(a.Explosives),
			'Fake Weapons': parseInt(a['Fake Weapons']),
			Firearms: parseInt(a.Firearms),
			Incendiary: parseInt(a.Incendiary),
			Melee: parseInt(a.Melee),
			Other: parseInt(a.Other),
			Radiological: parseInt(a.Radiological),
			'Sabotage Equipment': parseInt(a['Sabotage Equipment']),
			Unknown: parseInt(a.Unknown),
			Vehicle: parseInt(a.Vehicle),
			Year: parseInt(a.Year)
		}))
		.filter(a => a.Year >= 2013);
	
	// get categories from data
	const categories = Object.keys(attacks[0]).filter(key => key !== 'Entity' && key !== 'Year');

	const aggregateAttacks = attacks.reduce((acc, a) => {
		if (a.Entity in acc) {
			for (category of categories) {
				acc[a.Entity][category] += a[category];
			}
		} else {
			const newItem = {
				...a,
				isHidden: false
			};
			delete newItem.Year;
			acc[newItem.Entity] = (newItem);
		}
		return acc;
	}, {});
	console.timeEnd('data fetch/parse');

	drawMap(svgMap, path, countries, aggregateAttacks, categories, svgBar);
	drawBar(svgBar, aggregateAttacks, categories);
});
