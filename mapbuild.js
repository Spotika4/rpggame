var fs = require("fs")


fs.readFile('game/data/maps/map.json', function(err, data){
	if(err){
		return console.error(err);
	}

	let jsonMap = JSON.parse(data);


	for(let i in jsonMap.layers){
		let indexes = [];
		for(let ii in jsonMap.layers[i].data){
			if(jsonMap.layers[i].data[ii] > 0){
				indexes.push(ii);
			}
		}
		jsonMap.layers[i].indexes = indexes;
	}

	for(let i in jsonMap.tilesets){
		jsonMap.tilesets[i].img = 'img/tilesets/' + jsonMap.tilesets[i].image.replace(/^.*[\\/]/, '');
	}


	fs.writeFile('game/data/maps/map.json', JSON.stringify(jsonMap), function(err){
		if(err){
			return console.error(err);
		}
	});
});