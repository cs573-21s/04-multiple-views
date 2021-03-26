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

function drawMap(svg, path, countries, data, categories) {
	const colorMappingScale = d3.scaleLinear().domain(d3.extent([0, ...Object.values(data).map(a => Math.max(...Object.entries(a).filter(([key, value]) => categories.includes(key)).map(([key, value]) => value)))])).range(["rgb(200, 200, 220)", "blue"])

	
	const mapSvgData = svg.append('g');

	const mapSvgDataPaths = mapSvgData.selectAll('path')
		.data(countries.features)
		.enter()
		.append('path')
		.attr('d', path)
		.style('stroke', config.map.stroke)
		.style('stroke-width', '1')
		.attr('fill', c => c.properties.ADMIN in data ? colorMappingScale(Math.max(...Object.entries(data[c.properties.ADMIN]).filter(([key, value]) => categories.includes(key)).map(([key, value]) => value))) : 'white')

	// let countriesWithData = countries.features.filter(d => d.properties.ADMIN in data);

	// const mapSvgDataPaths = svg.append('g').selectAll('path')
	// 	.data(countriesWithData)
	// 	.enter()
	// 	.append('path')
	// 	.attr('d', path)
	// 	.style('stroke', config.stroke)
	// 	.style('stroke-width', '1')
	// 	.attr('fill', c => colorMappingScale(Math.max(...Object.entries(data[c.properties.ADMIN]).filter(([key, value]) => categories.includes(key)).map(([key, value]) => value))))



		// TODO temp hard coded 1920, 937
		let brushCell;
		const brush = d3.brush()
			.extent([[0, 0], [1920, 937]])
			.on('start', brushstarted)
			.on('brush', brushed)
			.on('end', brushended);
		mapSvgData.call(brush);
		
		function brushstarted() {
			if (brushCell !== this) {
				d3.select(brushCell).call(brush.move, null);
				brushCell = this;
			}
		}
		function brushed({selection}) {
			let selected = [];
			if (selection) {
				const [[x0, y0], [x1, y1]] = selection; 
				mapSvgDataPaths.classed('hidden', c => {
						return x0 > countryCentroids[c.properties.ADMIN][0]
						|| x1 < countryCentroids[c.properties.ADMIN][0]
						|| y0 > countryCentroids[c.properties.ADMIN][1]
						|| y1 < countryCentroids[c.properties.ADMIN][1]
				});
			}
		}
		function brushended({selection}) {
			if (selection) return;
			mapSvgDataPaths.classed('hidden', false);
		}
}

function drawBar(svg, data, categories) {
	const barData = categories.map(c => ({ category: c, value: 0 }));
	for (const d of Object.values(data)) {
		for (const category of categories) {
			barData.find(a => a.category === category).value += d[category];
		}
	}
	const categoryScale = d3.scaleOrdinal(d3.schemeCategory10).domain(categories); // TODO not perfect because there are 12 categories and only 10 colors :(
	const barScale = d3.scaleLinear().domain(d3.extent(barData, d => d.value)).range([0, 400]);
	let xPos = 0;
	svg.append('g')
		.attr('class', 'bars')
		.selectAll('rect')
		.data(barData)
		.enter()
		.append('rect')
		.attr('x', d => xPos += 60)
		.attr('y', d => svg.attr('height') - barScale(d.value) - 200) // TODO 200 is padding this should be a config thing somewhere instead of hard coded
		.attr('width', 60)
		.attr('height', d => barScale(d.value))
		.style('stroke', config.stroke)
		.style('stroke-width', '1')
		.style('fill', d => categoryScale(d.category))
}

window.addEventListener('load', async function() {

	const svgMap = d3.select('#map');
	const svgBar = d3.select('#bar');
	const { clientWidth: width, clientHeight: height } = document.body;
	const projection = d3.geoMercator();
	const path = d3.geoPath(projection);

	svgMap.attr('width', width).attr('height', height);
	projection.translate([width / 2, height / 2]);
	svgBar.attr('width', width).attr('height', height);

	
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
				...a
			};
			delete newItem.Year;
			acc[newItem.Entity] = (newItem);
		}
		return acc;
	}, {});
	console.timeEnd('data fetch/parse');

	drawMap(svgMap, path, countries, aggregateAttacks, categories);
	drawBar(svgBar, aggregateAttacks, categories);
});



// function brush(cell, circle, svg) {
//   const brush = d3.brush()
//       .extent([[padding / 2, padding / 2], [size - padding / 2, size - padding / 2]])
//       .on("start", brushstarted)
//       .on("brush", brushed)
//       .on("end", brushended);

//   cell.call(brush);

//   let brushCell;

//   // Clear the previously-active brush, if any.
//   function brushstarted() {
//     if (brushCell !== this) {
//       d3.select(brushCell).call(brush.move, null);
//       brushCell = this;
//     }
//   }

//   // Highlight the selected circles.
//   function brushed({selection}, [i, j]) {
//     let selected = [];
//     if (selection) {
//       const [[x0, y0], [x1, y1]] = selection; 
//       circle.classed("hidden",
//         d => x0 > x[i](d[columns[i]])
//           || x1 < x[i](d[columns[i]])
//           || y0 > y[j](d[columns[j]])
//           || y1 < y[j](d[columns[j]]));
//       selected = data.filter(
//         d => x0 < x[i](d[columns[i]])
//           && x1 > x[i](d[columns[i]])
//           && y0 < y[j](d[columns[j]])
//           && y1 > y[j](d[columns[j]]));
//     }
//     svg.property("value", selected).dispatch("input");
//   }

//   // If the brush is empty, select all circles.
//   function brushended({selection}) {
//     if (selection) return;
//     svg.property("value", []).dispatch("input");
//     circle.classed("hidden", false);
//   }
// }
