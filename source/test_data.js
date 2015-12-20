/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

__author__ = "Craig Wieczorek, John Wieczorek"
__copyright__ = "Copyright 2015 Regents of the University of California"
__version__ = "test_data.js 2015-11-23T20:33:00-07:00"
*/


/* 
==============================DRAFT QUALITY HIERARCHY if that==========================
test structure hierarchy to be run by function runStabndardTests()

WARNING 11/19/2015 13:00T-07:00  these comments probably have some inaccuracies

g_tests []				a high level PASS/FAIL test
	test name
	test description
	a[]			an array of various type of steps to take. I loose the term step loosely
						a 'step' can be as little as "set" element X to Y, to "expect" values a b c d from elements w x y z


a[]	array of test steps, and test step type to perform
	[] row
		contains a target and type of UI actions to  do, let call them jumps for now

row[X]{}
	an object with type of action to take, adn targets of said action
	do{}  targets and values
	type set or expect

	set will set elment values
	expects will check elment values

also, not fully implemented		if( type =="visibility" )  11/19/2015 14:00T-07:00

Test are no limited to a single 'set and expect' like before	
with this set up you can
	a[0] row[0-3] doit:{ set calc type to "Coords and err", loc type, dataum to "Anidan"} type:"set"
	a[1] row[0] doit:{ expect datum to be "Anidan"}} type:"expect"
	a[2] row[0] doit:{ set lanuguage to be "Espanuel"}} type:"set"
	a[1] row[0-1] doit:{ expect datum to be "Anidan", calc type to be "Coordennados y error "}} type:"expect"

and so on.

*/


var g_tests = [];
	
g_tests[0] = {
	test_name : "coordinates_only" + "EX1",
	test_descr : "<b>Example 1</b>: \"35 degrees 22\' 24\" N, 119 degrees 1\' 4\" W", 
	//actions: {
		a:[
			{
				doit:{
					ChoiceCalcType: "Error only - enter Lat/Long for the actual locality",
					ChoiceModel: "Coordinates only",
					ChoiceCoordSource: "locality description",
					ChoiceCoordSystem: "degrees minutes seconds",
					//Latitude: "35 degrees 22' 24" N",
					ChoiceLatDirDMS: "N",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 22,
					txtT7Lat_Sec: 24,
					//Longitude: "119 degrees 1' 4" W",
					ChoiceLongDirDMS: "W",
					txtT7Long_DegDMS: 119,
					txtT7Long_MinDMS: 1,
					txtT7Long_Sec: 4,
					ChoiceDatum: "not recorded",
					ChoiceLatPrecision: "nearest second",
					TextFieldMeasurementError: 0,
					ChoiceDistUnits: "m",//, km, mi, yds, or ft",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.3733333",
					TextFieldCalcDecLong: "-119.0177778",
					TextFieldCalcErrorDist: "118.837",
					TextFieldCalcErrorUnits: "m"
					//m, 0.119 km, 0.074 mi, 130 yds, 390 ft, or 0.064 nm",
				},
				type:"expect",

			},
		
		],
		//}
	//},
	
	SKIPUncertaintysources: "79 m from unknown datum, 40 m from coordinate precision nearest second"
};



g_tests[1] = {
    test_name : "coordinates_only" + "EX2",
	test_descr : "<b>Example 2</b>: 35.37, -119.02, NAD27, Digital USGS Gosford Quad 1:24000 map", 
	
	//actions: {
		a:[
			{
				doit:{
				ChoiceCalcType: "Error only",
				ChoiceModel: "Coordinates only",
				ChoiceCoordSource: "USGS map: 1:24000",
				ChoiceCoordSystem: "decimal degrees",
				//Latitude: "35.37",
				//Longitude: "-119.02",
				txtT2Dec_Lat: 35.37,
				txtT2Dec_Long: -119.02,

				ChoiceDatum: "NAD27",
				ChoiceLatPrecision: "0.01 degrees",
				//TextFieldMeasurementError: "0 (digital map - no measurement error)",
				TextFieldMeasurementError: "0",
				//ChoiceDistUnits: "km, m, mi, yds, or ft",
				ChoiceDistUnits: "m",
				ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
				TextFieldCalcDecLat: "35.37",
				TextFieldCalcDecLong: "-119.02",
				TextFieldCalcErrorDist: "1446.325",
				TextFieldCalcErrorUnits: "m"
				},
				type:"expect",

			},
		
		],
		//}
	//},
	
	SKIPUncertaintysources: "12 m from coordinate source USGS 1:24,000 map, 1434 m from coordinate precision 0.02 degrees"
};

g_tests[2] = {
    test_name : "named_place_only" + "EX1",
	test_descr : "\"Bakersfield\", Suppose the coordinates for Bakersfield came from the GNIS database, (a gazetteer) and the distance from the center of Bakersfield to the furthest, city limit is 3 km.", 
	//actions: {	
		a:[
			{
				doit:{
					ChoiceCalcType: "Error only - enter Lat/Long for the actual locality",
					ChoiceModel: "Named place only",
					ChoiceCoordSource: "gazetteer",
					ChoiceCoordSystem: "degrees minutes seconds",
					//Latitude: "35 degrees 22' 24" N",
					ChoiceLatDirDMS: "N",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 22,
					txtT7Lat_Sec: 24,
					//Longitude: "119 degrees 1' 4" W",
					ChoiceLongDirDMS: "W",
					txtT7Long_DegDMS: 119,
					txtT7Long_MinDMS: 1,
					txtT7Long_Sec: 4,

					ChoiceDatum: "not recorded",
					ChoiceLatPrecision: "nearest second",
					TextFieldMeasurementError: "0",
					TextFieldExtent: "3",
					ChoiceDistUnits: "km",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.3733333",
					TextFieldCalcDecLong: "-119.0177778",
					TextFieldCalcErrorDist: "3.119",
					TextFieldCalcErrorUnits: "km"
				},
				type:"expect",

			},
		
		],
		//}
	//},
	
	SKIPUncertaintysources: "79 m from unknown datum, 40 m from coordinate precision nearest second, 3000 m from the extent of the named place"
};


g_tests[3] = {
    test_name : "distance_only" + "EX1",
	test_descr : "5 mi from Bakersfield,	Suppose the coordinates for Bakersfield came from Topozone for which all map coordinates have been reprojected in NAD27. Suppose also that the distance from the center of Bakersfield to the furthest city limit is 2 mi.", 
	
		a:[
			{
				doit:{
					ChoiceCalcType: "Error only - enter Lat/Long for the actual locality",
					ChoiceModel: "Distance only",
					ChoiceCoordSource: "gazetteer", 
					ChoiceCoordSystem: "decimal degrees",
					//Latitude: "35.373"
					//Longitude: "-119.018"
					txtT2Dec_Lat: 35.373,
					txtT2Dec_Long: -119.018,

					ChoiceDatum: "NAD27",
					ChoiceLatPrecision: "0.001 degrees",
					ChoiceDistUnits: "mi",
					TextFieldOffsetEW: "5",
					TextFieldExtent: "2",
					TextFieldMeasurementError: "0",
					ChoiceDistancePrecision: "1 mi",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.373",
					TextFieldCalcDecLong: "-119.018",
					TextFieldCalcErrorDist: "7.589",
					TextFieldCalcErrorUnits: "mi"
				},
				type:"expect",

			},
		
		],
		//}
//	},
	
	SKIPUncertaintysources: "0.089 mi (143 m) from coordinate precision 0.001 degrees, 2 mi (3219 m) from the extent of the named place, 5 mi (8047 m) from the offset distance, 0.5 mi (805 m) from the 1 mi distance precision"
};


g_tests[4] = {
    test_name : "distance_along_a_pathEX1",
	test_descr : "13 mi E (by road) Bakersfield, Suppose the coordinates for this locality were interpolated to the nearest 1/10th minute from the printed USGS Taft 1:100,000 Quad map and the distance from the center of Bakersfield to the furthest city limit is 2mi.", 
	
		a:[
			{
				doit:{
					ChoiceCalcType: "Error only - enter Lat/Long for the actual locality",
					ChoiceModel: "Distance along path",
					ChoiceCoordSource: "USGS map: 1:100000",
					ChoiceCoordSystem: "degrees decimal minutes",
					//Latitude: "35 degrees 26.1' N"
					txtT7Lat_DegMM: 35,
					txtT7Lat_MinMM: 26.1,
					ChoiceLatDirMM: "N",
					//Longitude: "118 degrees 48.1' W"
					txtT7Long_DegMM: 118,
					txtT7Long_MinMM: 48.1,
					ChoiceLongDirMM: "W",
					
					ChoiceDatum: "NAD27",
					ChoiceLatPrecision: "0.1 minutes",
					TextFieldExtent: "2",
					TextFieldMeasurementError: "0.03107",// mi (0.5 mm on 1:100,000 map)",
					ChoiceDistUnits: "mi",
					ChoiceDistancePrecision: "1 mi",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.435",
					TextFieldCalcDecLong: "-118.8016667",
					TextFieldCalcErrorDist: "2.711",// mi (4365 m)",		
					TextFieldCalcErrorUnits: "mi"
				},
				type:"expect",

			},
		
		],
		//}
//	},
	
	SKIPUncertaintysources: "0.03107 mi (50 m) from printed USGS 1:100,000 map accuracy, 0.148 mi (239 m) from coordinate precision 0.1 minutes, 2 mi (3219 m) from the extent of the named place, 0.03107 mi (50 m) from the ability to distinguish 0.5 mm on a printed USGS 1:100,000 map, 0.5 mi (805 m) from the 1 mi distance precision"
};



g_tests[5] = {
    test_name : "distance_along_orthogonal_directionsEX1",
	test_descr : "2 mi E and 3 mi N of Bakersfield Suppose the coordinates for Bakersfield (the named place) came from the GNIS database (a gazetteer), the coordinates of the locality were calculated to the nearest second, and the distance from the center of Bakersfield to the furthest city limit is 2 mi.", 
	
		a:[
			{
				doit:{
					ChoiceCalcType: "Coordinates and error",
					ChoiceModel: "Distance along orthogonal directions",
					ChoiceCoordSource: "gazetteer", 
					ChoiceCoordSystem: "degrees minutes seconds",
					//Latitude: "35 degrees 25' 4" N"
					ChoiceLatDirDMS: "N",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 25,
					txtT7Lat_Sec: 4,
					//Longitude: "118 degrees 58' 54" W"
					ChoiceLongDirDMS: "W",
					txtT7Long_DegDMS: 118,
					txtT7Long_MinDMS: 58,
					txtT7Long_Sec: 54,

					ChoiceDatum: "not recorded",
					ChoiceLatPrecision: "nearest second",
					TextFieldOffset: "3",
					ChoiceOffsetNSDir: "N",
					TextFieldOffsetEW: "2",
					ChoiceOffsetEWDir: "E",
					TextFieldExtent: "2",
					TextFieldMeasurementError: "0",
					ChoiceDistUnits: "mi",
					ChoiceDistancePrecision: "1 mi",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.4612939",
					TextFieldCalcDecLong: "-118.946227",
					TextFieldCalcErrorDist: "2.781",
					TextFieldCalcErrorUnits: "mi"
				},
				type:"expect",

			},
		
		],
		//}
//	},
	
	SKIPUncertaintysources: "0.049 mi (79 m) from unknown datum, 0.025 mi (40 m) from coordinate precision nearest second, 2 mi (3219 m) from the extent of the named place, 0.707 mi (1138 m) from the 1 mi distance precision in two dimensions (the diagonal of a 0.5 mi by 0.5 mi square)"
};

g_tests[6] = {
    test_name : "distance_at_a_heading" + "EX1",
	test_descr : "10 mi E (by air) Bakersfield Suppose the coordinates for Bakersfield came from the GNIS database(a gazetteer), the coordinates of the locality were calculated to the nearest second, and the distance from the center of Bakersfield to the furthest city limit is 2 mi.", 
	
		a:[
			{
				doit:{
					ChoiceCalcType: "Coordinates and error",
					ChoiceModel: "Distance at a heading",
					ChoiceCoordSource: "gazetteer",
					ChoiceCoordSystem: "degrees minutes seconds",
					
					//Latitude: "35 degrees 22' 24" N"
					ChoiceLatDirDMS: "N",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 22,
					txtT7Lat_Sec: 24,
					//Longitude: "118 degrees 50' 56 W"
					ChoiceLongDirDMS: "W",
					txtT7Long_DegDMS: 118,
					txtT7Long_MinDMS: 50,
					txtT7Long_Sec: 56,
					
					ChoiceDatum: "not recorded",
					ChoiceLatPrecision: "nearest second",
					ChoiceDirection: "E",
					TextFieldOffsetEW: "10",
					TextFieldExtent: "2",
					TextFieldMeasurementError: "0",
					ChoiceDistUnits: "mi",
					ChoiceDistancePrecision: "10 mi",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.3733333",
					TextFieldCalcDecLong: "-118.671788",
					TextFieldCalcErrorDist: "12.254",// mi (19721 m)",
					TextFieldCalcErrorUnits: "mi"
				},
				type:"expect",

			},
		
		],
		//}
//	},
	
	SKIPDirectionPrecision: "45 degrees (between NE and SE, each 45 degrees from E)",
	SKIPUncertaintysources: "complicated combination of unknown datum, coordinate precision nearest second, extent of the named place, distance precision, and direction precision"
};

g_tests[7] = {
    test_name : "distance_at_a_heading" + "EX2",
	test_descr : "10 mi ENE (by air) Bakersfield, Suppose the coordinates for the locality were interpolated to the nearest second from the USGS Gosford 1:24,000 Quad map on which you can distinguish between millimeters and the distance from the center of Bakersfield to the furthest city limit is 2 mi.", 
	
		a:[
			{
				doit:{
					ChoiceCalcType: "Coordinates and error",
					ChoiceModel: "Distance at a heading",
					ChoiceCoordSource: "USGS map: 1:24000",
					ChoiceCoordSystem: "degrees minutes seconds",
					//Latitude: "35 degrees 24' 21" N"
					ChoiceLatDirDMS: "N",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 24,
					txtT7Lat_Sec: 21,
					//Longitude: "118 degrees 51' 25" W"
					ChoiceLongDirDMS: "W",
					txtT7Long_DegDMS: 118,
					txtT7Long_MinDMS: 51,
					txtT7Long_Sec: 25,
					
					ChoiceDatum: "NAD27",
					ChoiceLatPrecision: "nearest second",
					ChoiceDirection: "ENE",
					TextFieldOffsetEW: "10",
					TextFieldExtent: "2",
					TextFieldMeasurementError: "0.007",// mi (0.5 mm on 1:24,000 map)",
					ChoiceDistUnits: "mi",
					ChoiceDistancePrecision: "10 mi",
					ButtonCalculate: "click"
				},
				type:"set",
			},
			{
				doit:{
					TextFieldCalcDecLat: "35.4613445",
					TextFieldCalcDecLong: "-118.6932627",
					TextFieldCalcErrorDist: "7.491",
					TextFieldCalcErrorUnits: "mi"
				},
				type:"expect",

			},
		
		],
		//}
	//},
	SKIPDirectionPrecision: "11.25 degrees either side of ENE",
	SKIPUncertaintysources: "complicated combination of map accuracy, unknown datum, coordinate precision nearest second, extent of the named place, measurement accuracy (0.5 mm at 1:24,000), distance precision, and direction precision"
};


g_tests[8] = {
	test_name : "language change DDM",
	test_descr : "from eng to spanish, make sure selects stay on previous item before language change", 
		a:[
			{
				type:"set",
				doit:{
					//=====================top=================
					ChoiceCalcType: "Error only",
					ChoiceModel: "along orthogonal",
					
					//===================left side=================
					ChoiceCoordSource: "GPS",
					ChoiceCoordSystem: "degrees decimal minutes",
					
					txtT7Lat_DegMM: 35,
					txtT7Lat_MinMM: 12.34,
					ChoiceLatDirMM: "S",

					txtT7Long_DegMM: 35,
					txtT7Long_MinMM: 12.34,
					ChoiceLongDirMM: "E",
					
					/*
					ChoiceLatDirDMS: "S",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 22,
					txtT7Lat_Sec: 24,
					*/
					
					/*
					ChoiceLongDirDMS: "E",
					txtT7Long_DegDMS: 119,
					txtT7Long_MinDMS: 1,
					txtT7Long_Sec: 4,
					*/
					
					ChoiceDatum: "Adindan",
					ChoiceLatPrecision: "nearest minute",
					//===================right side=================
					TextFieldOffset: 5,
					ChoiceOffsetNSDir: "S",

					TextFieldOffsetEW: 4,
					ChoiceOffsetEWDir: "E",
					
					TextFieldExtent: 8,

					TextFieldMeasurementError: 7,
					ChoiceDistUnits: "m",//, km, mi, yds, or ft",
					ChoiceDistancePrecision: "100 m",//, km, mi, yds, or ft",
					ButtonCalculate: "click",
					ChoiceLanguage: "es", //cannot use ntilde &nilde; as there is very odd atuo conversion going on
				},
			},
			{
				type:"expect",
				language_test_for: "Esp",
				language_test_written: "En",
				doit:{
					ChoiceLanguage: "Esp",
					ChoiceCalcType: "error only",
					ChoiceModel: "along orthogonal",
					
					//===================left side=================
					ChoiceCoordSource: "GPS",
					ChoiceCoordSystem: "degrees decimal minutes",
					
					txtT7Lat_DegMM: 35,
					txtT7Lat_MinMM: 12.34,
					ChoiceLatDirMM: "S",

					txtT7Long_DegMM: 35,
					txtT7Long_MinMM: 12.34,
					ChoiceLongDirMM: "E",
					
					/*
					ChoiceLatDirDMS: "S",
					txtT7Lat_DegDMS: 35,
					txtT7Lat_MinDMS: 22,
					txtT7Lat_Sec: 24,
					*/
					
					/*
					ChoiceLongDirDMS: "E",
					txtT7Long_DegDMS: 119,
					txtT7Long_MinDMS: 1,
					txtT7Long_Sec: 4,
					*/
					
					ChoiceDatum: "Anindan",
					ChoiceLatPrecision: "nearest minute",
					//===================right side=================
					TextFieldOffset: 5,
					ChoiceOffsetNSDir: "S",

					TextFieldOffsetEW: 4,
					ChoiceOffsetEWDir: "E",
					
					TextFieldExtent: 8,

					TextFieldMeasurementError: 7,
					ChoiceDistUnits: "m",//, km, mi, yds, or ft",
					ChoiceDistancePrecision: "100 m",//, km, mi, yds, or ft",
				},
			},
		],
		//}
	//},
	
	SKIPUncertaintysources: "79 m from unknown datum, 40 m from coordinate precision nearest second"
};
