gfwordnet = {}

gfwordnet.grammar_url = "http://cloud.grammaticalframework.org/robust/Parse.pgf"

gfwordnet.grammar_call=function(querystring,cont,errcont) {
    http_get_json(gfwordnet.grammar_url+querystring,cont,errcont)
}

gfwordnet.sense_url = "http://www.grammaticalframework.org/~krasimir/SenseService.fcgi"

gfwordnet.sense_call=function(querystring,cont,errcont) {
    http_get_json(gfwordnet.sense_url+querystring,cont,errcont)
}

gfwordnet.initialize = function () {
	this.lex_ids   = {};
	this.can_check = window.location.href.endsWith("?can_check");

	this.langs      = {"ParseBul": {name: "Bulgarian",  index: 1},
		               "ParseEng": {name: "English",    index: 2},
		               "ParseFin": {name: "Finnish",    index: 3},
			           "ParsePor": {name: "Portuguese", index: 4},
			           "ParseSwe": {name: "Swedish",    index: 5}};
	this.langs_list = ["ParseBul", "ParseEng", "ParseFin", "ParsePor", "ParseSwe"];
}

gfwordnet.search = function (from, input, result) {
	if (input == "")
		return;

	function errcont(text,code) { }
	function extract_linearization(lins) {
		for (var i in lins) {
			var lin = lins[i];
			var txt = gfwordnet.can_check ? lin.texts.join(", ") : lin.text;
			this[gfwordnet.langs[lin.to].index].appendChild(text(txt));
		}
	}
	function extract_senses(senses) {
		var index = 1;
		for (var i in senses) {
			result.appendChild(tr(node("td",{colspan: 2 + gfwordnet.langs_list.length + (gfwordnet.can_check ? 1 : 0)},[text(index+". "+senses[i].gloss)]))); index++;
			for (var lex_id in senses[i].lex_ids) {
				gfwordnet.lex_ids[lex_id] = senses[i].lex_ids[lex_id];
				
				var synonyms = senses[i].synset.slice(0);
				var k = synonyms.indexOf(lex_id);
				if (k > -1) {
					synonyms.splice(k, 1);
				}
				gfwordnet.lex_ids[lex_id].synonyms = synonyms;

				var icon;
				var row = this[lex_id];
				var domains = senses[i].lex_ids[lex_id].domains;
				if (domains.indexOf("unchecked") >= 0 && domains.indexOf("checked") < 0) {
					icon = img("unchecked.png");
					if (gfwordnet.can_check)
						row.push(td([node("button",{onclick: "gfwordnet.onclick_check(this)"},[text("Check")])]));
				} else {
					icon = node("img", {src: "checked_plus.png", onclick: "gfwordnet.onclick_minus(event,this)"});
					if (gfwordnet.can_check)
						row.push(td([]));
				}
				row[0].insertBefore(icon, row[0].firstChild);
				result.appendChild(tr(row));
			}
		}
	}
	function extract_search(lemmas) {
		function cell(contents) {
			return node("td",{onclick: "gfwordnet.onclick_cell(this)"},contents);
		}

		gfwordnet.lex_ids = {};
		clear(result);

		var rows        = {};
		var lexical_ids = ""
		
		var row = [th(text("Abstract"))];
		for (var lang in gfwordnet.langs_list) {
			row.push(th(text(gfwordnet.langs[gfwordnet.langs_list[lang]].name)));
		}
		row.push(node("th",{style: "width: 10px; font-style: italic"},[text("f")]));
		if (gfwordnet.can_check)
			row.push(node("th",{style: "width: 10px"},[]));
		result.appendChild(tr(row));

		var min = Number.MAX_VALUE;
		var max = Number.MIN_VALUE;
		for (var i in lemmas) {
			var prob = Math.exp(-lemmas[i].prob);
			if (min > prob) min = prob;
			if (max < prob) max = prob;
		}
		var scale = Math.min(5/max,3/min);

		for (var i in lemmas) {
			var lemma = lemmas[i].lemma;
			if (!(lemma in rows)) {
				var row = [cell([text(lemma)])];
				for (var lang in gfwordnet.langs) {
					row.push(cell([]));
				}
				var rank_bar = node("td",{style: "white-space: nowrap"});
				var rank = Math.round(Math.exp(-lemmas[i].prob)*scale);
				while (rank > 0) {
					rank_bar.appendChild(div_class("bar",[]));
					rank--;
				}
				row.push(rank_bar);
				rows[lemma] = row;
				lexical_ids = lexical_ids+" "+lemma;

				var cmd = gfwordnet.can_check ? "c-linearizeAll" : "c-linearize";
				gfwordnet.grammar_call("?command="+cmd+"&to="+gfwordnet.langs_list.join("%20")+"&tree="+encodeURIComponent(lemma),bind(extract_linearization,row),errcont);
			}
		}
		gfwordnet.sense_call("?lexical_ids="+encodeURIComponent(lexical_ids),bind(extract_senses,rows),errcont);
    }

	gfwordnet.grammar_call("?command=c-lookupmorpho&input="+encodeURIComponent(input)+"&from="+from,extract_search,errcont);
}
gfwordnet.init_wordcloud = function(canvas) {
	var lex_def = this.lex_ids[canvas.lex_id];

	var min = Number.MAX_VALUE;
	var max = Number.MIN_VALUE;
	for (var head in lex_def.heads) {
		if (max < lex_def.heads[head])
			max = lex_def.heads[head];
		if (min > lex_def.heads[head])
			min = lex_def.heads[head];
	}
	for (var mod  in lex_def.modifiers) {
		if (max < lex_def.modifiers[mod])
			max = lex_def.modifiers[mod];
		if (min > lex_def.modifiers[mod])
			min = lex_def.modifiers[mod];
	}
	var popup = canvas.parentNode.className == "popup";
	var fontSize = parseInt(window.getComputedStyle(document.getElementsByTagName("body")[0]).getPropertyValue('font-size'));
	var scale = fontSize*Math.min((popup ? 8 : 2)/max,(popup ? 2 : 0.5)/min);
	var list = [];
	for (var head in lex_def.heads) {
		var size = lex_def.heads[head]*scale;
		if (size > 1) {
			if (size < 9)
				size = 9;
			list.push([head,size]);
		}
	}
	for (var mod  in lex_def.modifiers) {
		var size = lex_def.modifiers[mod]*scale;
		if (size > 1) {
			if (size < 9)
				size = 9;
			list.push([mod,size]);
		}
	}
	if (list.length > 1) {
		list.sort(function(a,b) {
					if (a[1] > b[1])
					  return -1;
					if (a[1] < b[1])
					  return 1;
					return 0;
				  });

		function select_color(word, weight, fontSize, distance, theta) {
			if (word in this.heads) {
				return "orange";
			}
			if (word in this.modifiers) {
				return "turquoise";
			}
			return "black";
		}

		WordCloud(canvas,{list: list, shuffle: false, color: bind(select_color,lex_def)});
	}
}
gfwordnet.init_embedding = function(canvas) {
	var lex_def = this.lex_ids[canvas.lex_id];

	var tsne = new tsnejs.tSNE({}); // create a tSNE instance

	// initialize data. Here we have 3 points and some example pairwise dissimilarities
	var dists = [];
	for (var fun in lex_def.relations) {
		dists.push(lex_def.relations[fun]);
	}
	tsne.initDataDist(dists);

	for(var k = 0; k < 500; k++) {
	  tsne.step(); // every time you call this, solution gets better
	}

	var points = tsne.getSolution(); // Y is an array of 2-D points that you can plot
	
	var minx = Number.MAX_VALUE;
	var maxx = Number.MIN_VALUE;
	var miny = Number.MAX_VALUE;
	var maxy = Number.MIN_VALUE;
	for (var i in points) {
		var point = points[i];
		if (point[0] < minx) minx = point[0];
		if (point[0] > maxx) maxx = point[0];
		if (point[1] < miny) miny = point[1];
		if (point[1] > maxy) maxy = point[1];
	}
	var scalex = (canvas.width -60)/(maxx-minx);
	var scaley = (canvas.height-60)/(maxy-miny);
	var scale  = Math.min(scalex,scaley);

	var popup = canvas.parentNode.className == "popup";
	var fontSize = window.getComputedStyle(document.getElementsByTagName("body")[0]).getPropertyValue('font-size');

	var ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = fontSize + " Ariel";
	var i = 0;
	for (var fun in lex_def.relations) {
		var point = points[i++];
		if (fun == canvas.lex_id)
			ctx.fillStyle = '#ff0000';
		ctx.fillText(fun, (point[0]-minx)*scale, (point[1]-minx)*scale);
		if (fun == canvas.lex_id)
			ctx.fillStyle = '#000000';
	}
}
gfwordnet.init_canvas = function (tab,canvas) {
	if (tab.innerHTML == "Context") {
		gfwordnet.init_wordcloud(canvas);
	} else if (tab.innerHTML == "Related") {
		gfwordnet.init_embedding(canvas);
	}
}
gfwordnet.onclick_cell = function (cell) {
	var icon = cell.parentNode.firstChild.firstChild;
	if (icon.src.endsWith("unchecked.png"))
		return;

	function errcont(text,code) { }
	function extract_linearization(lins) {
		var rows = []
		for (var i in lins) {
			var lin = lins[i];
			rows.push(tr([th(text(gfwordnet.langs[lin.to].name)), td(text(lin.text))]));
		}
		this.parentNode.insertBefore(node("table",{class: "result"},rows), this.nextSibling);
	}
	function extract_linearization_synonym(lins) {
		for (var i in lins) {
			var lin = lins[i];
			this[gfwordnet.langs[lin.to].index].appendChild(text(lin.text));
		}
	}
	function extract_linearization_morpho(lins) {
		this.innerHTML = lins[0].text;
	}

	var details = null;
	if (cell.parentNode.nextSibling == null ||
	    cell.parentNode.nextSibling.firstChild == null ||
	    cell.parentNode.nextSibling.firstChild.className != "details") {
		details = node("div", {}, []);
		cell.parentNode.parentNode.insertBefore(tr(node("td",{colspan: 2 + gfwordnet.langs_list.length + (gfwordnet.can_check ? 1 : 0), class: "details"},[details])), cell.parentNode.nextSibling);

		cell.parentNode.firstChild.firstChild.src = "checked_minus.png";
	} else {
		details = cell.parentNode.nextSibling.firstChild.firstChild;
		clear(details);
	}

	var index = -1;
	var siblings = cell.parentNode.children;
	for (var i = 0; i < siblings.length; i++) {
		if (siblings[i] == cell) {
			index = i;
		}
		siblings[i].className = "unselected"
	}
	cell.className = "selected";

	var lex_id = cell.parentNode.firstChild.firstChild.nextSibling.textContent;

	if (index == 0) {
		var lex_def = this.lex_ids[lex_id];

		popup = node("div",{},[]);
		details.appendChild(popup);

		tabs = node("table",{class: "header-tabs"},[
				 tr([td(node("h1",{class: "selected",   onclick: "gfwordnet.onclick_tab(this)"},[text("Context")])),
					 td(node("h1",{class: "unselected", onclick: "gfwordnet.onclick_tab(this)"},[text("Related")])),
					 td(node("input", {type: "range", min: 1, max: 100, value: 50}))
					])]);
		popup.appendChild(tabs);

		var canvas = node("canvas", {width: 10, height: 10, onclick: "gfwordnet.onclick_canvas(this)"}, []);
		canvas.lex_id = lex_id;
		popup.appendChild(canvas);

		this.init_wordcloud(canvas);

		var row = [];
		if (lex_def.synonyms.length > 0) {
			details.appendChild(node("h1",{},[text("Synonyms")]));
			var result = node("table",{class: "result"},[]);
			var row = [th(text("Abstract"))]
			for (var lang in gfwordnet.langs_list) {
				row.push(th(text(gfwordnet.langs[gfwordnet.langs_list[lang]].name)));
			}
			result.appendChild(tr(row));
			for (var i in lex_def.synonyms) {
				var row = [td([text(lex_def.synonyms[i])])]
				for (var lang in gfwordnet.langs_list) {
					row.push(td([]));
				}
				gfwordnet.grammar_call("?command=c-linearize&to="+gfwordnet.langs_list.join("%20")+"&tree="+encodeURIComponent(lex_def.synonyms[i]),bind(extract_linearization_synonym,row),errcont);
				result.appendChild(tr(row));
			}
			details.appendChild(result);
		}
		if (lex_def.examples.length > 0) {
			var header = node("h1",{},[text("Examples")]);
			details.appendChild(header);
			for (var i in lex_def.examples) {
				gfwordnet.grammar_call("?command=c-linearize&to="+gfwordnet.langs_list.join("%20")+"&tree="+encodeURIComponent(lex_def.examples[i]),bind(extract_linearization,header),errcont);
			}
		}
		if (lex_def.secondary_examples.length > 0) {
			var header = node("h1",{},[text("Secondary Examples")]);
			details.appendChild(header);
			for (var i in lex_def.secondary_examples) {
				gfwordnet.grammar_call("?command=c-linearize&to="+gfwordnet.langs_list.join("%20")+"&tree="+encodeURIComponent(lex_def.secondary_examples[i]),bind(extract_linearization,header),errcont);
			}
		}
	} else {
		var s   = lex_id.split("_");
		var cat = s[s.length-1];
		gfwordnet.grammar_call("?command=c-linearize&to="+gfwordnet.langs_list[index-1]+"&tree="+encodeURIComponent("MkDocument (NoDefinition \"\") (Inflection"+cat+" "+lex_id+") \"\""),bind(extract_linearization_morpho,details),errcont);
	}
}
gfwordnet.onclick_minus = function (event, icon) {
	if (!icon.src.endsWith("checked_minus.png"))
		return;

	event.stopPropagation();

	var row = icon.parentNode.parentNode;
	var siblings = row.children;
	for (var i = 0; i < siblings.length; i++) {
		siblings[i].className = "unselected"
	}
	row.parentNode.removeChild(row.nextSibling);
	
	icon.src = "checked_plus.png"
}
gfwordnet.onclick_check = function (btn) {
	function errcont(text,code) { }
	function extract_confirm() {
		this.src = "checked_plus.png";
		this.onclick = function(event) { gfwordnet.onclick_minus(event, this) };
		btn.parentNode.removeChild(btn);
	}

	var img    = btn.parentNode.parentNode.firstChild.firstChild;
	var lex_id = img.nextSibling.textContent;
	gfwordnet.sense_call("?check_id="+encodeURIComponent(lex_id),bind(extract_confirm,img),errcont);	
}
gfwordnet.onclick_tab = function (tab) {
	var tr = tab.parentNode.parentNode;
	var td = tr.firstChild;
	while (td != null) {
		if (td.firstChild == tab) {
			td.firstChild.className = "selected";
		} else if (td.firstChild.className == "selected") {
			td.firstChild.className = "unselected";
		}
		td = td.nextSibling;
	}

	var canvas = tab.parentNode.parentNode.parentNode.nextSibling;
	gfwordnet.init_canvas(tab,canvas);
}
gfwordnet.onclick_canvas = function (canvas) {
	var tab = null;
	var tr  = canvas.parentNode.firstElementChild.firstElementChild;
	var td  = tr.firstChild;
	while (td != null) {
		if (td.firstChild.className == "selected") {
			tab = td.firstChild;
			break;
		}
		td = td.nextSibling;
	}
	if (tab == null)
		return;

	if (canvas.parentNode.className == "popup") {
		canvas.parentNode.className = "";
		canvas.width  = canvas.save_width;
		canvas.height = canvas.save_height;
	} else {
		canvas.parentNode.className = "popup";
		canvas.save_width = canvas.width;
		canvas.save_height = canvas.height;
		canvas.width  = canvas.parentNode.offsetWidth;
		canvas.height = canvas.parentNode.offsetHeight-canvas.offsetTop;
	}
	gfwordnet.init_canvas(tab,canvas);
}
