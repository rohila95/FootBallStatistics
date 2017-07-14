// set of attributes for each player to be compared
var playerAttrSetArr = ["YDS","TD","INT"];

var attrArray = { "QB" : ["COMP","RATE","TD","YDS","YDS/G","ATT"],
"RB" : ["ATT","YDS/G","YDS","20+","TD","1DN"],
"WR" : ["YDS","AVG","TD","20+","YDS/G","1DN"],
"D"  : ["COMB","AST","SACK","FF","INT"]};

var superBowlArray = {"2016":"ne","2015":"den","2014":"ne","2013":"sea","2012":"bal","2011":"nyg","2010":"gb","2009":"no","2008":"pit","2007":"nyg","2006":"ind"};

var maxattrArray = {};

var playerAttrSetMaxValArr = {"YDS":4689,"TD":28,"INT":23};
var playerAttrSetMinValArr = [0,0,0];
var playerDictionary ={};
var datasetMatchesYearWise = [];
var dataSetWin =[], dataSetLoss=[];
var dataSetQuarterWins = [] ,dataSetQuarterLoss=[];
var donutColor = null;
var quarterBasedWinDic = {};
var barQuarterFunc,barWinLoseFunc;
var oTable;
var teamColors = ["#a8a8a8","#02244a"];
var curYear=2016;
var winLoseTrendYear=2016;
var curTeam={};
var comingFromAuto = false;
var curPlayerRowIndex=0;
var playerPastTenYearsArr;
var finalArrayTenYears=[];
var teamsAndCodes;

var curCatTable;
function start(){

  $(document).ready(function(){


  		var selected = [];
  		drawTeamsOnUSMapGraph();

  		//drawLineBarQuarterChart();

  	   //populate the select boxes with the teams
		teamsAndCodes = { "NFC" : {"dal":"Dallas Cowboys","nyg":"New York Giants","atl":"Atlanta Falcons","sea":"Seattle Seahawks","gb":"Green Bay Packers","det":"Detroit Lions","tb":"Tampa Bay Buccaneers","wsh":"Washington Redskins","min":"Minnesota Vikings","ari":"Arizona Cardinals","no":"New Orleans Saints","car":"Carolina Panthers","phi":"Philadelphia Eagles","lar":"Los Angeles Rams","chi":"Chicago Bears","sf":"San Francisco 49ers"},
		"AFC" :{ "bal":"Baltimore Ravens","buf":"Buffalo Bills", "cin":"Cincinnati Bengals","cle":"Cleveland Browns","den":"Denver Broncos","hou":"Houston Texans","ind":"Indianapolis Colts","jax":"Jacksonville Jaguars","kc":"Kansas City Chiefs","mia":"Miami Dolphins","ne":"New England Patriots","nyj":"New York Jets","oak":"Oakland Raiders","pit":"Pittsburgh Steelers","lac":"San Diego Chargers","ten":"Tennessee Titans"}}

		var teamSelOptStr="";
		Object.keys(teamsAndCodes["NFC"]).forEach(function(teamCode){
		 	teamSelOptStr += "<option value='"+ teamCode.toUpperCase()+"'>"+teamsAndCodes["NFC"][teamCode]+"</option>";
		});
		Object.keys(teamsAndCodes["AFC"]).forEach(function(teamCode){
		 	teamSelOptStr += "<option value='"+ teamCode.toUpperCase()+"'>"+teamsAndCodes["AFC"][teamCode]+"</option>";
		});

		$(".playerTeam").html(teamSelOptStr);


  		var yearOptionsStr ="";
  		for(var i=2016;i>=2006;i--){
  			yearOptionsStr += "<option>"+i+"</option>";
  		}





  		$(".yearSelPlayerProfile").html(yearOptionsStr).trigger("change");
  		$(".yearSelectionSBWinner").html(yearOptionsStr);
  		$(".yearsel_teambased").html(yearOptionsStr);
  		$(".yearSelPlayerPerformance").html(yearOptionsStr);


  		$(document).on("change",".yearSelectionSBWinner",function(){
  			var teamcode = superBowlArray[$(this).val()];
  			// get the SuperBowl winner
  			$(".winnerimg").attr("src","./teamhelmets/transparent/"+teamcode +".PNG" );

				var teamName="";

						if(teamsAndCodes["NFC"].hasOwnProperty(teamcode.toLowerCase())){
								teamName = teamsAndCodes["NFC"][teamcode.toLowerCase()];
						}else{
								teamName = teamsAndCodes["AFC"][teamcode.toLowerCase()];
						}

  			$(".superBowlerTeamName").html(teamName);
			
		});

  		$(document).on("change",".yearSelPlayerProfile",function(){
			$(".posSelPlayerProfile").val($(".posSelPlayerProfile").val()).trigger("change");
		});

		$(document).on("change",".leagueSelection",function(){
			if($(this).val() == "Both"){
				$(".usmapsvg").find("circle").show();
			}else{
				$(".usmapsvg").find("circle").hide();
				$(".usmapsvg").find("circle[league='"+$(this).val().toLowerCase() +"']").show()
			}
		});

		$(document).on("change",".yearsel_teambased",function(){
			curYear = $(this).val();
			teamBasedMatchesStats(curTeam);
		});


		$(document).on("change",".playerTeam",function(){
			
			var selectedyear = $(".yearSelPlayerProfile").val();
			var selectedTeam = $(this).val();
				var playerOptionsStr="";
				Object.keys(playerDictionary[selectedyear]).forEach(function(player){
					if(playerDictionary[selectedyear][player]["TEAM"] == selectedTeam){
						playerOptionsStr += "<option>"+player+"</option>";
					}
			 	});
			$(this).parents(".teamAndPlayerGrp").find(".playerSelPlayerProfile").html(playerOptionsStr);

			if(comingFromAuto){
				$(this).parents(".teamAndPlayerGrp").find(".playerSelPlayerProfile").val(curCatTable.find("tr").eq($(this).attr("curTeam")).find("td").eq(0).html());	
			
				if($(this).attr("curTeam") == 2){
					$(".comparePlayerButt").trigger("click");	
					comingFromAuto = false;	
				}

			}
		});

		$(document).on("change",".posSelPlayerProfile",function(){
			if($(this).val() == "select"){
				$(".teamAndPlayerSelRow").hide();
			}else{
				$(".teamAndPlayerSelRow").show();
				drawPlayerRadialGraph();
			}
		});

		$(document).on("click",".comparePlayerButt",function(){
			console.log("compare butt clicked");
			displayHelperRadiusPlot();
		});

		// click registration on teambalsed table stat row
		$(document).on("click",".teamBasedMatchesTable tbody tr",function(){

			$(".teamBasedMatchesTable").dataTable().fnGetNodes().forEach(function(ele){
				 $(ele).removeClass("row_selected");
			});

	        $(this).addClass('row_selected');
	   		$(".goBackToPlayerstats").show();
	        $(".hometeam").html($(".selectedTeamLabel").html()).css("color",teamColors[0]);

	       $(".plotheading_line_winslose .teamName").html($(".selectedTeamLabel").html()).css("color",teamColors[0]);

	       var homeTeamScore="";
	       var OppTeamScore="";

	        if($(this).find("td").eq(2).html().split("&nbsp;")[0] == "W"){
	        		homeTeamScore = $.trim(($(this).find("td").eq(2).html().split("&nbsp;")[1]).split("-")[0]);
	        		OppTeamScore = $.trim(($(this).find("td").eq(2).html().split("&nbsp;")[1]).split("-")[1]);

	        	$(".matchWinByLabel").html("Won By "+$(".selectedTeamLabel").html()).css("color",teamColors[0]);
	        }else{
	        	$(".matchWinByLabel").html("Won By "+$(this).find("td").eq(1).html()).css("color",teamColors[1]);
	        	homeTeamScore = $.trim(($(this).find("td").eq(2).html().split("&nbsp;")[1]).split("-")[1]);
	        		OppTeamScore = $.trim(($(this).find("td").eq(2).html().split("&nbsp;")[1]).split("-")[0]);
	        }

	         $(".oppteam").html($(this).find("td").eq(1).html()).css("color",teamColors[1]);

	         $(".possessionTimingHeader .hometeam").html($.trim($(this).attr("possession").split("-")[0]));		
	         $(".possessionTimingHeader .oppteam").html($.trim($(this).attr("possession").split("-")[1]));

	        // $(this).css('background-color', "#D6D5C3");

			var donutData = donutDataHelper($(this));	
			drawTotalYards ($(this));
			drawPossesionDonut(donutData);	
			drawFirstDowns($(this));

			var quarterScoresTr="<tr><td><label>"+$(".selectedTeamLabel").html() +"</label></td><td>"+$.trim($(this).attr("q1").split("-")[0]) +"</td><td>"+ $.trim($(this).attr("q2").split("-")[0])+"</td><td>"+$.trim($(this).attr("q3").split("-")[0]) +"</td><td>"+$.trim($(this).attr("q4").split("-")[0]) +"</td><td>"+ homeTeamScore  +"</td></tr>";
			quarterScoresTr+="<tr><td><label>"+$(this).find("td").eq(1).html() +"</label></td><td>"+$.trim($(this).attr("q1").split("-")[1]) +"</td><td>"+ $.trim($(this).attr("q2").split("-")[1])+"</td><td>"+$.trim($(this).attr("q3").split("-")[1]) +"</td><td>"+$.trim($(this).attr("q4").split("-")[1]) +"</td><td>"+ OppTeamScore  +"</td></tr>";

			$(".quarterScores tbody").html(quarterScoresTr);
		});	

		// click registration on teambalsed table stat row
		$(document).on("click",".leaderstable tbody tr",function(){
			$(this).parents(".table").find("tbody .row_selected").removeClass("row_selected");
			$(this).addClass("row_selected");
			$(this).parents(".leadertablegraphCover").find(".playertrends").show();
			//alert("line graph with animation next to the table is appeared shortly");
			drawRespectiveLineGraphs($(this),$(this).parents("table").attr("purp"), $(this).find("td").eq(0).html());

		});

		$(document).on("change",".yearSelPlayerPerformance",function(){
			$(".yearSelPlayerProfile").val($(this).val());
			$(".playertrends").hide();

			getYearWiseGameLeaders("QB","highPassingYards");
			getYearWiseGameLeaders("RB","highRushingYards");
			getYearWiseGameLeaders("WR","highReceivingYards");	



		});


		$(".exploreButt").click(function(){
			comingFromAuto = true;
			$(".player_container").show();
			var clickedExploreButt = $(this);
			curCatTable = clickedExploreButt.parents("table").find("tbody");
			if(clickedExploreButt.parents("table").find(".row_selected").length == 0){
				alert("please click on a row to explore");
				return false;
			}
			var curCategory= clickedExploreButt.parents("table").attr("purp");
			$(".posSelPlayerProfile").val(curCategory).trigger("change");


			$('html, body').animate({
		        scrollTop: $("#player_radarplot").offset().top
		    }, 1000);

				/*$(".teamAndPlayerGrp").each(function(indx,ele){
					var index = indx;
					$(this).find(".playerTeam").val(curTable.find("tr").eq(0).attr("team")).trigger("change");		
						$(this).find(".playerSelPlayerProfile").val(curTable.find("tr").eq(0).find("td").eq(0).html());	
						if(index == 2){
							$(".comparePlayerButt").trigger("click");			
						}			
				});*/

		});
			$(".goToTop").click(function(){
				$('html, body').animate({
			        scrollTop: $("#wholebody").offset().top-100
			    }, 1000);
			});

		// this one to table the top players from all the categories
		getYearWiseGameLeaders("QB","highPassingYards");
		getYearWiseGameLeaders("RB","highRushingYards");
		getYearWiseGameLeaders("WR","highReceivingYards");

	   $('.combinedRFaceted input[type=radio][name=combinedRFaceted]').change(function() {
	       var value = this.value;
	        if (value == "nofacet")
	        {
	       			$(".combinedRadorPlot").show();
	       			$(".facetedRadorPlot").hide();
	        }	
	        else
	        {
	           	$(".combinedRadorPlot").hide();
	           	$(".facetedRadorPlot").show();
	        }
	       
	    });



    });
}

//**** this one is to draw a Radial graph for the player attributes
function drawPlayerRadialGraph(){
	var dataForPPRador =[];
	playerDictionary ={};
	var max=0.0;

	var curEle="";
	var selectedyear = $(".yearSelPlayerProfile").val();
		d3.json("./datasrc/leaders_"+$(".posSelPlayerProfile").val() +".json", function(error, dataFromJsonFile) {
				dataFromJsonFile.rows.forEach(function(obj) {
				    //console.log(obj);
				    if(obj["YEAR"] == selectedyear){
				    	if(!(playerDictionary.hasOwnProperty(obj["YEAR"])))
					    {
					    	playerDictionary[obj["YEAR"]] = {};
					    	playerDictionary[obj["YEAR"]][obj["PLAYER"]]= obj;
					    }
					    else
					    {
					    	playerDictionary[obj["YEAR"]][obj["PLAYER"]]= obj;
					    }
				    }
				});
				// console.log(playerDictionary);	
				maxattrArray = {};

				for(var index in attrArray[$(".posSelPlayerProfile").val()]){
					maxattrArray[attrArray[$(".posSelPlayerProfile").val()][index]] = 0;		
				}
				for(var key in playerDictionary[selectedyear]){
					Object.keys(maxattrArray).forEach(function(d){
						if(maxattrArray[d] <= parseFloat(String(playerDictionary[selectedyear][key][d]).replace(/\,/g,""))){
							maxattrArray[d] = parseFloat(String(playerDictionary[selectedyear][key][d]).replace(/\,/g,""));
						}
					});
				}



				//here all the jsons regarding the players statistics are read
				var playerOptionsStr="";
				

				for(var i=0;i<3;i++){
					playerOptionsStr ="";
					Object.keys(playerDictionary[selectedyear]).forEach(function(player){
						if(playerDictionary[selectedyear][player]["TEAM"] == $(".playerTeam").eq(i).val() ){
							playerOptionsStr += "<option>"+player+"</option>";
						}
							
				 	});
				 	$(".playerSelPlayerProfile").eq(i).html(playerOptionsStr);
				}

				// for the auto triggering
				if(comingFromAuto){

					for(var i=0;i<3;i++){
						$(".teamAndPlayerGrp").eq(i).find(".playerTeam").val(curCatTable.find("tr").eq(i).attr("team")).trigger("change");
					}
						
				}
					

		});
	
}



//**** this one is to get the tables for  all category game leaders
function getYearWiseGameLeaders(filetype,catergory){
	var passingPlayerDic ={};
	var max=0.0;

	var curEle="";
	var selectedyear = $(".yearSelPlayerPerformance").val();
	var playerCount = 0;
		d3.json("./datasrc/leaders_"+filetype+".json", function(error, dataFromJsonFile) {
				
				dataFromJsonFile.rows.forEach(function(obj) {
				    //console.log(obj);
				    if(obj["YEAR"] == selectedyear){
				    	if(!(passingPlayerDic.hasOwnProperty(obj["YEAR"])))
					    {
					    	passingPlayerDic[obj["YEAR"]] = {};
					    	passingPlayerDic[obj["YEAR"]][obj["PLAYER"]]= obj;
					    	playerCount++;
					    }
					    else
					    {
					    	passingPlayerDic[obj["YEAR"]][obj["PLAYER"]]= obj;
					    	playerCount++;
					    }
				    }
				    if(playerCount == 3){
				    	return false;
				    }
				});


				console.log(passingPlayerDic);	
				//here all the jsons regarding the players statistics are read
				var playerTrStr="";

				for(var i=0;i< 3; i++){
					var player = Object.keys(passingPlayerDic[selectedyear])[i];
					var teamName="";

						if(teamsAndCodes["NFC"].hasOwnProperty(passingPlayerDic[selectedyear][player]["TEAM"].toLowerCase())){
								teamName = teamsAndCodes["NFC"][ passingPlayerDic[selectedyear][player]["TEAM"].toLowerCase()];
						}else{
								teamName = teamsAndCodes["AFC"][passingPlayerDic[selectedyear][player]["TEAM"].toLowerCase()];
						}

					playerTrStr+="<tr team='"+ passingPlayerDic[selectedyear][player]["TEAM"] + "'><td>"+ player +"</td><td>"+passingPlayerDic[selectedyear][player]["YDS"] +"</td><td>"+ teamName +"</td></tr>"; 
				}
				$("."+catergory+" tbody").empty();
				$("."+catergory+" tbody").append(playerTrStr);

				if(filetype =="WR"){						
						$(".leaderstable tbody").eq(0).find("tr").eq(0).trigger("click");
				}
		});




}

function displayHelperRadiusPlot(){

		//$(".yearSelPlayerProfile").val("2016");
		var margin = {top: 100, right: 100, bottom: 100, left: 100},
		width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
		height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

		/*var yearOptionForRadiusMap = "";
	 	Object.keys(playerDictionary).forEach(function(year){
	 			yearOptionForRadiusMap += "<option>"+year+"</option>";
	 	});

	 	$(".yearSelPlayerProfile").html(yearOptionForRadiusMap);*/
	 
	 	dataForPPRador =[];


	 	// console.log(maxattrArray);
		$(".playerSelPlayerProfile").each(function(idx){
			curEle = $(this);
			$(".playerName"+(idx+1)).html($(this).val());

			var innerObjArr = [];
				Object.keys(maxattrArray).forEach(function(attrName) {
					var innerObj ={};
					innerObj["axis"] = attrName;
					var valStr = playerDictionary[$(".yearSelPlayerProfile").val()][curEle.val()][attrName];



					// console.log(valStr);
					innerObj["value"] = (parseFloat(valStr.replace(",", ""))/maxattrArray[attrName]);
					innerObj["max"] = maxattrArray[attrName];
					innerObjArr.push(innerObj);
				});
				dataForPPRador.push(innerObjArr);
		});
		
		var color = d3.scale.ordinal()
			.range(["#EDC951","#CC333F","#00A0B0"]);
		var radarChartOptions = {
		  w: width/2,
		  h: height/2,
		  margin: margin,
		  maxValue: 1,
		  levels: 5,
		  roundStrokes: false,
		  color: color
		};








		//Call function to draw the Radar chart
		RadarChart(".radarChart", dataForPPRador, radarChartOptions);

		// RadarChart(".radarChart", data, radarChartOptions);
}

//** Worldmap with the teams placement */
function drawTeamsOnUSMapGraph(){
	//Width and height of map
	var width = 960;
	var height = 500;

	// D3 Projection
	var projection = d3.geo.albersUsa()
	.translate([(width/2)+20, height/2])    // translate to center of screen
	.scale([1000]);          // scale things down so see entire US

	// Define path generator
	var path = d3.geo.path()               // path generator that will convert GeoJSON to SVG paths
	.projection(projection);  // tell path generator to use albersUsa projection


	// Define linear scale for output
	var color = d3.scale.linear()
	.range(["rgb(213,222,217)","rgb(69,173,168)","rgb(84,36,55)","rgb(217,91,67)"]);

	var legendText = ["Cities Lived", "States Lived", "States Visited", "Nada"];

	//Create SVG element and append map to the SVG
	var svg = d3.select(".usmapwithteams")
	.append("svg").attr("class","usmapsvg")
	.attr("width", width)
	.attr("height", height);

	// Append Div for tooltip to SVG
	var div = d3.select(".usmapwithteams")
	.append("div")   
	.attr("class", "tooltip")               
	.style("opacity", 0);

	/*var div = d3.select(".usmapwithteams")
	.append("div")   
	.attr("class", "tooltipHelmets")               
	.style("opacity", 0);
*/
	// Load in my states data!
	d3.csv("./datasrc/stateslived.csv", function(data) {
		color.domain([0,1,2,3]); // setting the range of the input data

		// Load GeoJSON data and merge with states data
		d3.json("./datasrc/us-states.json", function(json) {

			// Loop through each state data value in the .csv file
			for (var i = 0; i < data.length; i++) {
				// Grab State Name
				var dataState = data[i].state;

				// Grab data value 
				var dataValue = data[i].visited;

					// Find the corresponding state inside the GeoJSON
					for (var j = 0; j < json.features.length; j++)  {
						var jsonState = json.features[j].properties.name;
						if (dataState == jsonState) {
							// Copy the data value into the JSON
							json.features[j].properties.visited = dataValue; 
							// Stop looking through the JSON
							break;
						}
					}
			}

			// Bind the data to the SVG and create one path per GeoJSON feature
			svg.selectAll("path")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke", "#fff")
			.style("stroke-width", "1")
			.style("fill", function(d) {
				// Get data value
				var value = d.properties.visited;
				if (value) {
					//If value exists…
					return color(value);
				} else {
					//If value is undefined…
					return "rgb(213,222,217)";
				}
			});


			// Map the cities I have lived in!
			d3.csv("./datasrc/cities-lived.csv", function(data) {
				svg.selectAll("circle")
				.data(data)
				.enter()
				.append("circle").attr("class","teamdot").attr("league",function(d) {
					return $.trim(d.league);
				})
				.attr("conf",function(d) {
					return $.trim(d.conf);
				})
				.attr("cx", function(d) {
					return projection([d.lon, d.lat])[0];
				})
				.attr("cy", function(d) {
					return projection([d.lon, d.lat])[1];
				})
				.attr("r", function(d) {
					return 6;
				})
				.style("fill", "#00448e")	
				.style("opacity", 0.85)	
				// Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks" 
				// http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
				.on("mouseover", function(d) {      
					/*var img=div.append("img");
					img.attr("src","./teamhelmets/"+d.teamcode+".PNG")*/
					/*div.transition() .duration(200)      
					.style("opacity", .9);      
					div.text(d.place)
					.style("left", (d3.event.pageX-105) + "px")     
					.style("top", (d3.event.pageY-100) + "px"); 
*/					$(".usmapsvg").find("circle[conf='"+d.conf +"'][league='"+d.league +"']").css("fill","green");
					$(".teamHelmetToolTip").show("slow");
					$(".teamHelmetToolTip").find("img").attr("src","./teamhelmets/transparent/"+d.teamcode+".PNG");
					$(".teamHelmetToolTip").find(".helmetTeamName").html(d.place+"<br/>"+d.league.toUpperCase()+" "+d.conf.charAt(0).toUpperCase() + d.conf.slice(1));
					$(".teamHelmetToolTip").css({
							position: 'absolute',
	   				 		top: event.pageY,
		    				left: event.pageX		    				
						});
			    	
					console.log("Team Hovered:"+d.teamcode);
				})   

				// fade out tooltip on mouse out               
				.on("mouseout", function(d) {  

					$(".usmapsvg").find("circle").css("fill","#00448e");

					div.transition()        
					.duration(500)      
					.style("opacity", 0);  
					 $(".teamHelmetToolTip").hide();
					 $(".selectedTeamOnUS").css("fill","green");

				})
				// onclick               
				.on("click", function(d) { 
					
					$(".usmapsvg .teamdot").css("fill","#00448e");
					$(".selectedTeamOnUS").removeClass("selectedTeamOnUS");
					$(this).addClass("selectedTeamOnUS");

					d3.select(this).style("fill","green");
					$(".superBowlWinnerDiv").hide();
					$(".topPlayerTableStats").hide();
					$(".teams_quarterwinsloseplot").show();
					$(".matchBasedStats").show();
					curTeam = d;
					$(".player_container").hide();
					 	$('#cover').show();
					teamBasedMatchesStats(d);
				});
			});  
		});
	});
}


function drawLineBarQuarterChart(){
	drawWinsLoseChart();
	// defaulted to win 
	drawBarQuarterImpChart(curYear,1);
	 	$('#cover').hide();

}

function drawBarQuarterImpChart(year,winRLoss)
{
	// $(".bar_quartertrends").empty();
	dataSetQuarterWins = [];
	dataSetQuarterLoss=[]

    	for(var i=1;i<=4;i++){
    		var tempQuarterWinDic = {},tempQuarterLossDic={};
    		tempQuarterWinDic["label"] = "Quarter "+i;
    		tempQuarterWinDic["value"]= quarterBasedWinDic[year]["Q"+i+"W"];

    		tempQuarterLossDic["label"] = "Quarter "+i;
    		tempQuarterLossDic["value"]= quarterBasedWinDic[year]["Q"+i+"L"];

	    	dataSetQuarterWins.push(tempQuarterWinDic);
	    	dataSetQuarterLoss.push(tempQuarterLossDic);
    	}

    // var margin = {top: (parseInt(d3.select('body').style('height'), 10)/20), right: (parseInt(d3.select('body').style('width'), 10)/20), bottom: (parseInt(d3.select('body').style('height'), 10)/20), left: (parseInt(d3.select('body').style('width'), 10)/5)},
    	 var margin = {
		        top: 20,
		        right: 20,
		        bottom: 30,
		        left: 60
		    },
            // width = parseInt(d3.select('body').style('width'), 10) - margin.left - margin.right,
            // height = parseInt(d3.select('body').style('height'), 10) - margin.top - margin.bottom;
            width = 500 - margin.left - margin.right,
   			height = 250 - margin.top - margin.bottom;

    $(".bar_quartertrends").empty();
    var div = d3.select("body").append("div").attr("class", "toolTip");

    var formatPercent = d3.format("");

    var y = d3.scale.ordinal()
            .rangeRoundBands([height, 0], .2, 0.5);

    var x = d3.scale.linear()
            .range([0, width]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(-height)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
    //.tickFormat(formatPercent);


    var svg = d3.select(".bar_quartertrends").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    if(winRLoss == 1){
    	 barQuarterChange(dataSetQuarterWins);
    }else{
    	barQuarterChange(dataSetQuarterLoss);
    }
   

    function barQuarterChange(dataset) {

    	var winRLoss = $('.winLoseMatchForm input[type=radio][name=datasetWinLoseMatch]:checked').val();
    	var axisLable = ""
    	if(winRLoss =="win" ){
    		axisLable = "Wins";
    	}else{
    		axisLable = "Losses";
    	}

        y.domain(dataset.map(function(d) { return d.label; }));
        x.domain([0, d3.max(dataset, function(d) { return d.value; })]);

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        svg.select(".y.axis").remove();
        svg.select(".x.axis").remove();

        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);
 		svg.append("text").attr(
					"transform",
					"translate(" + (width / 2) + " ," + (height + margin.bottom)
							+ ")").style("text-anchor", "middle").text("No of " + axisLable);
				
		svg.append("text").attr("y",
				-12).attr("x",  -25 ).attr("dy", "0.3em")
				.style("text-anchor", "middle").text("Quarters");

        var bar = svg.selectAll(".bar")
                .data(dataset, function(d) { return d.label; });
        // new data:
        bar.enter().append("rect")
                .attr("class", "bar")
                .attr("x", function(d) { return x(d.value); })
                .attr("y", function(d) { return y(d.label); })
                .attr("width", function(d) { return width-x(d.value); })
                .attr("height", y.rangeBand());

        bar.on("mousemove", function(d){
                    div.style("left", d3.event.pageX+10+"px");
                    div.style("top", d3.event.pageY-25+"px");
                    div.style("display", "inline-block");
                    div.html((d.label)+"<br>"+(d.value));
                });
        bar.on("mouseout", function(d){
                    div.style("display", "none");
                });


        // removed data:
        bar.exit().remove();

        // updated data:
        bar.transition()
                .duration(750)
                .attr("x", function(d) { return 0; })
                .attr("y", function(d) { return y(d.label); })
                .attr("width", function(d) { return x(d.value); })
                .attr("height", y.rangeBand());

    };
}


function drawWinsLoseChart()
{

	var winRLoss = $('.winLoseMatchForm input[type=radio][name=datasetWinLoseMatch]:checked').val();
    var axisLable = ""
    if(winRLoss =="win" ){
    	axisLable = "Wins";
    }else{
    	axisLable = "Losses";
    }


    var lineChart= {};
    $(".line_winslose").empty();
    // $(".line_winslose").empty()
	dataSetWin =[];
	dataSetLoss=[];
    Object.keys(quarterBasedWinDic).forEach(function(year){
    	var tempWinDic = {},tempLossDic={};
    	var wins = quarterBasedWinDic[year]["Win"];
    	var loss = quarterBasedWinDic[year]["Loss"];


    	tempWinDic["label"] = year.toString();
    	tempWinDic["value"]= quarterBasedWinDic[year]["Win"];
    	tempLossDic["label"] = year.toString();
    	tempLossDic["value"]= quarterBasedWinDic[year]["Loss"];
    	dataSetWin.push(tempWinDic);
    	dataSetLoss.push(tempLossDic);
	});

    $('.winLoseMatchForm input[type=radio][name=datasetWinLoseMatch]').change(function() {
	       var value = this.value;
	        if (value == "win")
	        {
	            winLoseChange(dataSetWin);
	            drawBarQuarterImpChart(winLoseTrendYear,1)
	        }
	        else if (value == "loss")
	        {
	            winLoseChange(dataSetLoss);
	            drawBarQuarterImpChart(winLoseTrendYear,2);
	        }
       
    });





    // var margin = {top: (parseInt(d3.select('body').style('height'), 10)/20), right: (parseInt(d3.select('body').style('width'), 10)/20), bottom: (parseInt(d3.select('body').style('height'), 10)/20), left: (parseInt(d3.select('body').style('width'), 10)/5)},
    	 var margin = {
		        top: 20,
		        right: 20,
		        bottom: 30,
		        left: 40
		    },
            // width = parseInt(d3.select('body').style('width'), 10) - margin.left - margin.right,
            // height = parseInt(d3.select('body').style('height'), 10) - margin.top - margin.bottom;
            width = 500 - margin.left - margin.right,
   			height = 250 - margin.top - margin.bottom;
   	    $(".line_winslose").empty();
    var div = d3.select("body").append("div").attr("class", "toolTip");

    var formatPercent = d3.format("");

    var x = d3.scale.ordinal()
            .rangeRoundBands([0,width], .2, 0.5);

    var y = d3.scale.linear()
            .range([height,0]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .tickSize(-height)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");
    //.tickFormat(formatPercent);

    var svg = d3.select(".line_winslose").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

    d3.select("input[value=\"total\"]").property("checked", true);
    winLoseChange(dataSetWin);

    function winLoseChange(dataset1) {
    	var winRLoss = $('.winLoseMatchForm input[type=radio][name=datasetWinLoseMatch]:checked').val();
	    var axisLable = ""
	    if(winRLoss =="win" ){
	    	axisLable = "Wins";
	    }else{
	    	axisLable = "Losses";
	    }


    	console.log(dataset1);
        x.domain(dataset1.map(function(d) { return d.label; }));
        y.domain([0, d3.max(dataset1, function(d) { return d.value; })]);

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        svg.select(".y.axis").remove();
        svg.select(".x.axis").remove();

        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis)
                ;

       	$(".line_winslose .axislabel").remove();   
        svg.append("text").attr("class","axislabel").attr(
					"transform",
					"translate(" + (width / 2) + " ," + (height + margin.bottom)
							+ ")").style("text-anchor", "middle").text("Year");
				
		svg.append("text").attr("transform", "rotate(-90)").attr("class","axislabel").attr("y",
				0 - margin.left+10).attr("x", 0 - (height / 2)).attr("dy", "0.3em")
				.style("text-anchor", "middle").text("No of "+axisLable);


	console.log(dataset1);
        var bar = svg.selectAll(".bar")
                .data(dataset1);
        // new data:
        bar.enter().append("rect")
                .attr("class", "bar")
                .attr("y", function(d) {console.log(d); return y(d.value); })
                .attr("x", function(d) {return x(d.label); })
                .attr("height", function(d) { return y(d.value); })
                .attr("width", x.rangeBand())
                .style("stroke-width","3px") 
                .style("stroke", function(d){
                	if(d.label == "2016"){
                		return "black";
                	}
                	return "none";
                });

        bar.on("mouseover", function(d){
                    div.style("left", d3.event.pageX+10+"px");
                    div.style("top", d3.event.pageY-25+"px");
                    div.style("display", "inline-block");
                    div.html((d.label)+"<br>"+(d.value));
                });

        bar.on("mouseout", function(d){
                    div.style("display", "none");
                });

        bar.on("click", function(d){
        			$(".line_winslose").find("rect").css("stroke","none");
        			$(this).css("stroke","black");
        			$(this).css("stroke-width","3px");
        			$(".plotheading_bar_quartertrends").find("b").html(d.label);
        			winLoseTrendYear = parseInt(d.label);
                   console.log(d.label);
                   if( $('.winLoseMatchForm input[type=radio][name=datasetWinLoseMatch]:checked').val() == "win"){
				        drawBarQuarterImpChart(d.label,1);
				    }
				    else{			           
				         drawBarQuarterImpChart(d.label,2);
       				}
            });

        // removed data:
        bar.exit().remove();

        // updated data:
        bar.transition()
                .duration(750)
                .attr("y", function(d) { return y(d.value); })
                .attr("x", function(d) { return x(d.label); })
                .attr("height", function(d) { return height-y(d.value); })
                .attr("width", x.rangeBand());

    };
}

// this function to get the table that shows the seasons wise matches played with the team
function teamBasedMatchesStats(currentTeam){

	var tableSkeleton = '<table class="table teamBasedMatchesTable display" cellspacing="0" width="100%"><thead><tr><th class="col-xs-3">RND</th><th class="col-xs-6">Opponent</th><th class="col-xs-3">Result</th></tr></thead><tbody>	</tbody></table>';
	$(".matchBasedActualtableDiv").empty();
	$(".matchBasedActualtableDiv").append(tableSkeleton);
	$(".selectedTeamLabel").html(currentTeam.place);
	console.log("------------Current team selected: "+currentTeam.teamcode);
	d3.json("./datasrc/totalData.json", function(error, dataFromJsonFile) {
		var tableRows="";
		var matchCounter = 0;
		 for(i=2006;i<2017;i++){
		    quarterBasedWinDic[String(i)]={"Win":0,"Loss":0,"Q1W":0,"Q2W":0,"Q3W":0,"Q4W":0,"Q1L":0,"Q2L":0,"Q3L":0,"Q4L":0};

		 }
		dataFromJsonFile.rows.forEach(function(obj) {
			var quarterArr =["Q1","Q2","Q3","Q4"];
		    if(obj["Team code"] == currentTeam.teamcode && parseInt(obj["Year"])>2005){
		    	console.log(obj,quarterBasedWinDic);
		    	if(obj["Win/lose"] == "W" ){
		    		// console.log(quarterBasedWinDic[obj["Year"]]["Win"]);
		    		quarterBasedWinDic[obj["Year"]]["Win"]++;
		    	}else{
		    		quarterBasedWinDic[obj["Year"]]["Loss"]++;
		    	}

		    	for(var i=0;i<=3;i++){
		    		if ( parseInt($.trim(obj[quarterArr[i]].split("-")[0])) >  parseInt($.trim(obj[quarterArr[i]].split("-")[1]))){
		    			quarterBasedWinDic[obj["Year"]][quarterArr[i]+"W"]++;
		    		}else if (parseInt($.trim(obj[quarterArr[i]].split("-")[0])) <  parseInt($.trim(obj[quarterArr[i]].split("-")[1]))){
		    			quarterBasedWinDic[obj["Year"]][quarterArr[i]+"L"]++;
		    		}
		    		
		    	}

		    }

			//code segment to give the table for matches
			if(obj["Team code"] == currentTeam.teamcode &&  obj["Year"]==curYear){
					matchCounter++;
				    tableRows+="<tr team='"+obj["Team"]+"' possession='"+ obj["Possession"] +"' totalyards='"+obj["Total Yards"] + "' firstdowns='"+obj["First Downs"]+ "' q1='"+obj["Q1"]+ "' q2='"+obj["Q2"]+"' q3='"+obj["Q3"]+"' q4='"+obj["Q4"]+  "'><td class='col-xs-3'>"+obj["Week"] +"</td><td class='col-xs-6'>"+obj["Opponent_team"]+"</td><td class='col-xs-3'>"+obj["Win/lose"]+"&nbsp;"+obj["Score"] +"</td></tr>";
			
				    /*if(matchCounter ==17){
				    	return false;
				    }*/
			}

		});
		$(".teamBasedMatchesCover").show();
		$(".teamBasedMatchesTable tbody").append(tableRows);

		$(".teamBasedMatchesTable").dataTable({
			"iDisplayLength": 4,
			"lengthChange": false
		});

		$(".teamBasedMatchesTable tbody tr").eq(0).trigger("click");

		drawLineBarQuarterChart();

	}); 

}


function drawPossesionDonut(donutData){


	$(".teampossessiondonutchart").empty();

	var svg = d3.select("body .teampossessiondonutchart")
	.append("svg")
	.append("g")

	svg.append("g")
		.attr("class", "slices");
	svg.append("g")
		.attr("class", "labels");
	svg.append("g")
		.attr("class", "lines");

	var width = 280,
	    height = 210,
		radius = Math.min(width-50, height-100) / 2;

	var pie = d3.layout.pie()
		.sort(null)
		.value(function(d) {
			return d.value;
		});

	var arc = d3.svg.arc()
		.outerRadius(radius * 0.8)
		.innerRadius(radius * 0.6);

	var outerArc = d3.svg.arc()
		.innerRadius(radius * 0.9)
		.outerRadius(radius * 0.9);

	svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	var key = function(d){ return d.data.label; };

	// var color = d3.scale.ordinal()
	// .domain(["Lorem ipsum", "dolor sit", "amet", "consectetur", "adipisicing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt"])
	// .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);


	change(donutData);



	function change(data) {

		/* ------- PIE SLICES -------*/
		var slice = svg.select(".slices").selectAll("path.slice")
			.data(pie(data), key);

		slice.enter().insert("path")
			.style("fill", function(d) { return donutColor(d.data.label); })
			.attr("class", "slice");

		slice.transition().duration(1000)
			.attrTween("d", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					return arc(interpolate(t));
				};
			})

		slice.exit()
			.remove();

		/* ------- TEXT LABELS -------*/

		var text = svg.select(".labels").selectAll("text")
			.data(pie(data), key);

		text.enter()
			.append("text")
			.attr("dy", ".35em")
			.text(function(d) {
				return d.data.label;
			});
		
		function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		}

		text.transition().duration(1000)
			.attrTween("transform", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
					return "translate("+ pos +")";
				};
			})
			.styleTween("text-anchor", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					return midAngle(d2) < Math.PI ? "start":"end";
				};
			});

		text.exit()
			.remove();

		/* ------- SLICE TO TEXT POLYLINES -------*/

		var polyline = svg.select(".lines").selectAll("polyline")
			.data(pie(data), key);
		
		polyline.enter()
			.append("polyline");

		polyline.transition().duration(1000)
			.attrTween("points", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
					return [arc.centroid(d2), outerArc.centroid(d2), pos];
				};			
			});
		
		polyline.exit()
			.remove();
	}

}


function donutDataHelper (matchSel){
	donutColor = d3.scale.ordinal()
	.domain([matchSel.attr("team"), matchSel.find("td").eq(1).html()])
	.range(["#a8a8a8", "#02244a"]);

	var possessionObjects = [];
	possession = matchSel.attr("possession");
	possession = possession.split(" - ");
	a = parseFloat(possession[0].split(":")[0])+parseFloat(parseInt(possession[0].split(":")[1])/60)
	b = parseFloat(possession[1].split(":")[0])+parseFloat(parseInt(possession[1].split(":")[1])/60)
	console.log(possession);
	possessionObjects.push({label:matchSel.attr("team"),value:a})
	possessionObjects.push({label:matchSel.find("td").eq(1).html(),value:b}) 

	return possessionObjects;
}



function drawTotalYards(matchSel){

	var yardsArr = matchSel.attr("totalyards").split(" - ");
	var size = 0;
	if(yardsArr[0]>yardsArr[1]){
		size=yardsArr[0];
	}
	else{
		size = yardsArr[1];
	}
	$(".homeprogress").empty();
	$(".opponentprogress").empty();	
	drawTotalYardsHelper(".totalyardscover .homeprogress",yardsArr[0],"#a8a8a8",size);
	drawTotalYardsHelper(".totalyardscover .opponentprogress",yardsArr[1],"#02244a",size);


	var firstdownsArr = matchSel.attr("firstdowns").split(" - ");
	size = 0;
	if(firstdownsArr[0]>firstdownsArr[1]){
		size=firstdownsArr[0];
	}
	else{
		size = firstdownsArr[1];
	}
	drawTotalYardsHelper(".firstdownscover .homeprogress",firstdownsArr[0],"#a8a8a8",size);
	drawTotalYardsHelper(".firstdownscover .opponentprogress",firstdownsArr[1],"#02244a",size);
}


function drawTotalYardsHelper(curProgress,value,color,size){

	var svg = d3.select(curProgress)
		.append('svg')
		.attr('height', 100)
		.attr('width', 263.835);

	var states = ['started', 'inProgress', 'completed'],
	    segmentWidth = 100,
		currentState = 'started';

	var colorScale = d3.scale.ordinal()
		.domain(states)
		.range(['yellow', 'orange', 'green']);

	svg.append('rect')
		.attr('class', 'bg-rect')
		.attr('rx', 10)
		.attr('ry', 10)
		.attr('fill', '#f2f2f2')
		.attr('height', 15)
		.attr('width', function(){
			return 263.835;
		})
		.attr('x', 0);

	var progress = svg.append('rect')
					.attr('class', 'progress-rect')
					.attr('fill', function(){
						return color;
					})
					.attr('height', 15)
					.attr('width', 0)
					.attr('rx', 10)
					.attr('ry', 10)
					.attr('x', 0);

	progress.transition()
		.duration(1000)
		.attr('width', function(){		
			return value*263.835/size;
		});

	$(curProgress).parents(".progressBinder").find("div").eq(0).find("h3").html(value);


}


function drawFirstDowns(matchSel){
	var firstArr = matchSel.attr("firstdowns").split(" - ");
}


function drawRespectiveLineGraphs(curTr,category,player){
	
	var curPlayerTrendEle = curTr.parents(".leadertablegraphCover").find(".playertrends"+category);
	var curPlayerName = curTr.find("td").eq(0).html()
	curPlayerTrendEle.empty();
	console.log(category);

	console.log(player);
	playerPastTenYearsArr=[];

	finalArrayTenYears=[];
	var avgDic={};
	d3.json("./datasrc/leaders_"+category +".json", function(error, dataFromJsonFile) {
				dataFromJsonFile.rows.forEach(function(obj) {
					var tempDic = {};
					if(obj["YEAR"] in avgDic){
						if(parseInt(String(obj["YDS"]).replace(",", "")) > avgDic[obj["YEAR"]]["total"]){
							avgDic[obj["YEAR"]]["high"] = parseInt(String(obj["YDS"]).replace(",", ""));
						}
						// avgDic[obj["YEAR"]]["total"]+=parseInt(String(obj["YDS"]).replace(",", ""));
						// avgDic[obj["YEAR"]]["count"]+=1;
					}
					else{
						avgDic[obj["YEAR"]]={"high":parseInt(String(obj["YDS"]).replace(",", "")) ,"count": 1}
					}
					if(obj["PLAYER"]==player){
						console.log(obj["PLAYER"],player);
						tempDic["Player"] = player;
						tempDic["Year"] = obj["YEAR"];
						if(category=="QB" || category=="RB" || category=="WR"){
							tempDic["value"] = parseInt(String(obj["YDS"]).replace(",", ""));
						}
						else{
							tempDic["value"] = parseInt(String(obj["COMB"]).replace(",", ""));	
						}
						playerPastTenYearsArr.push(tempDic);
					}
				});
				// console.log(avgDic);
				Object.keys(avgDic).forEach(function(key){
					// console.log(key,avgDic[key]);
					playerPastTenYearsArr.forEach(function(obj){
						if(obj["Year"]==key){
							obj["Average"] = parseFloat(avgDic[key]["high"]);
							finalArrayTenYears.push(obj);
						}
					});

				});
				// console.log(playerPastTenYearsArr);
				// console.log(finalArrayTenYears);
			var tooltip = d3.select("body").append("div").attr("class", "tooltip")
				.style("opacity", 0);

				//chart
				var margin = {
						top : 30,
						right : 20,
						bottom : 30,
						left : 100
					}, width = 500 - margin.left - margin.right, height =190
							- margin.top - margin.bottom;

					var parseDate = d3.time.format("%d-%m-%Y").parse;
					// Set the ranges
					var x = d3.time.scale().range([ 0, width ]);
					var y = d3.scale.linear().range([ height, 0 ]);

					// Define the axes
					var xAxis = d3.svg.axis().scale(x).orient("bottom")
							.ticks(5);

					var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5);

					// Define the line
					var valueline = d3.svg.line().x(function(d) {
						return x(d.Year);
					}).y(function(d) {
						return y(d.value);
					});
					var valueline1 = d3.svg.line().x(function(d) {
						return x(d.Year);
					}).y(function(d) {
						return y(d.Average);
					});

					// Adds the svg canvas
					var svg = d3.select(".playertrends"+category).append("svg").attr(
							"width", width + margin.left + margin.right).attr(
							"height", height + margin.top + margin.bottom)
							.append("g").attr(
									"transform",
									"translate(" + margin.left + ","
											+ margin.top + ")");


					// Get the data

					finalArrayTenYears.forEach(function(d) {
						// console.log(d);
						 d.YearLabel=d.Year;
						d.Year = parseDate("01-01-" + d.Year);
						d.value = +d.value;
						d.Average=+d.Average;
					});

					// Scale the range of the data
					x.domain(d3.extent(finalArrayTenYears, function(d) {
						console.log(d.Year);
						return d.Year;
					}));
					y.domain([ 0, d3.max(finalArrayTenYears, function(d) {
						return Math.max(d.value,d.Average);
					}) ]);

					// Add the valueline path.
					var path=svg.append("path").attr("class", "line").attr("d",
							valueline(finalArrayTenYears)).style("stroke","red");
					var path1=svg.append("path").attr("class", "line").attr("d",
							valueline1(finalArrayTenYears)).style("stroke","blue");

					//add scatterplot
					svg.selectAll("dot").data(finalArrayTenYears).enter().append("circle")
					.attr("r", 3.5).attr("cx", function(d) {
						return x(d.Year);
					}).attr("cy", function(d) {
						return y(d.value);
					}).style("fill", "red").on(
							"mouseover",
							function(d) {
								tooltip.transition().duration(200).style(
										"opacity", .9);
								tooltip.html(
										"Yards " + d.value + " <br/>Year:"
												+ d.YearLabel).style("left",
										(d3.event.pageX + 5) + "px").style(
										"top", (d3.event.pageY - 28) + "px");
							}).on("mouseout", function(d) {
						tooltip.transition().duration(500).style("opacity", 0);


					});

					svg.selectAll("dot").data(finalArrayTenYears).enter().append("circle")
					.attr("r", 3.5).attr("cx", function(d) {
						return x(d.Year);
					}).attr("cy", function(d) {
						return y(d.Average);
					}).style("fill", "blue").on(
							"mouseover",
							function(d) {
								tooltip.transition().duration(200).style(
										"opacity", .9);
								tooltip.html(
										"Yards " + d.Average + " <br/>Year:"
												+ d.YearLabel).style("left",
										(d3.event.pageX + 5) + "px").style(
										"top", (d3.event.pageY - 28) + "px");
							}).on("mouseout", function(d) {
						tooltip.transition().duration(500).style("opacity", 0);
					});


					// Add the X Axis
					svg.append("g").attr("class", "x axis").attr("transform",
							"translate(0," + height + ")").call(xAxis);

					// Add the Y Axis
					svg.append("g").attr("class", "y axis").call(yAxis);
					var totalLength = path.node().getTotalLength();
					d3.select(path.node())
						  .attr("stroke-dasharray", totalLength  ) 
						  .attr("stroke-dashoffset", totalLength)
						  .transition()
							.duration(1000)
							.ease("linear")
							.attr("stroke-dashoffset", 0);

							var totalLength1 = path1.node().getTotalLength();
					d3.select(path1.node())
						  .attr("stroke-dasharray", totalLength  ) 
						  .attr("stroke-dashoffset", totalLength)
						  .transition()
							.duration(1000)
							.ease("linear")
							.attr("stroke-dashoffset", 0);
				svg.append("text").attr(
					"transform",
					"translate(" + (width / 2) + " ," + (height + margin.bottom)
							+ ")").style("text-anchor", "middle").text("Year");
				
			svg.append("text").attr("transform", "rotate(-90)").attr("y",
				0 - margin.left+45).attr("x", 0 - (height / 2)).attr("dy", "0.3em")
				.style("text-anchor", "middle").text("Yards");

				var legendNames=["","",""];




		   var color=[{"name":"Max in Years","value":" blue"},{"name":curPlayerName,"value":"red"}];

		  var legend = svg.selectAll(".legend")
		      .data(color)
		    	.enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) {var val=(i*10)-30; return "translate(500," + val + ")"; });
	
		  legend.append("rect")
		      .attr("x", -150)
		      .attr("width", 10)
		      .attr("height", 10).style("font-size", "13px")
		      .style("fill", function(d){
		    	console.log(d.value); return d.value;
		      });
	
		  legend.append("text")
		      .attr("x", -155)
		      .attr("y", 6)
		      .attr("dy", ".35em")
		      .style("text-anchor", "end")
		      .text(function(d) { return d.name; });
				
	});		
}

start();