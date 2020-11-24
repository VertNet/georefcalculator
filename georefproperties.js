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

__author__ = "Craig Wieczorek"
__author__ = "John Wieczorek"
__contributor__ = Gustavo Iglesias
__contributor__ = Jose (Wly) Dos Santos
__contributor__ = Tendro Ramaharitra
__contributor__ = Robert Hijmans
__contributor__ = Peter Desmet
__copyright__ = "Copyright 2020 Rauthiflor LLC"
__version__ = "georefproperties.js 2020-11-24T15:42-03:00"
*/

// Translations courtesy of:
// Gustavo Iglesias (Español)
// Jose (Wly) Dos Santos (Português)
// Tendro Ramaharitra (Français)
// Robert Hijmans & Peter Desmet (Nederlands)

/*
function test_getSource( lang )
{
	var x = language[lang];
	return g_properties.calctype.erroronly[lang];
}
*/
var test_props = {
	'get_props' : function(x){return x;},
	'get_Props2' : function(x){return x*2;},
	'getProp' : function( property ){
		return eval( property );
	}
}

//we'll tie all the object array created below into g_properties at the bottom of this file
var g_properties = {};

//NOTE: [0],[1] used to be java var names. I had to change to array in JS
//I also added the Enum type defs so I don't use magic numbers later on
var language = {};
language.name = [];
language.code = [];
language.en=0;
language.en=1;
language.es=2;
language.pt=3;
language.fr=4;
language.nl=5;
language.name[0] = "English";
language.code[0] = "en";
language.name[1] = "Español";
language.code[1] = "es";
language.name[2] = "Português";
language.code[2] = "pt";
language.name[3] = "Français";
language.code[3] = "fr";
language.name[4] = "Nederlands";
language.code[4] = "nl";

// Preferred Language
// Must be one of the codes from the Languages list above
g_properties.preferredlanguage = "en";

//Versions
var version= {};
version.en = "Version";
version.es = "Versión";
version.pt = "Versión";
version.fr = "Versión";
version.nl = "Versie";
//version.de = "Version

//##############################

// Nederlands

//##############################

// Locality Type
var loctype = {
		'coordonly' : {},
		'namedplaceonly' : {},
		'distanceonly' : {},
		'distalongpath' : {},
		'orthodist' : {},
		'distatheading' : {}
	}
loctype.coordonly.nl = "Enkel coördinaten (b.v.: 27\u00b034'23,4\" N, 121\u00b056'42,3\" W)";
loctype.namedplaceonly.nl = "Enkel een geografische entiteit (b.v.: Gent)";
loctype.distanceonly.nl = "Plaatsnaam en afstand (b.v.: 5 km van Gent)";
loctype.distalongpath.nl = "Afstand langs een route (b.v.: 13 km W (via de weg) van Gent)";
loctype.orthodist.nl = "Afstand in orthogonale richtingen (b.v.: 2 km ten Oosten en 3 km ten Noorden van Gent)";
loctype.distatheading.nl = "Afstand in een windrichting (b.v.: 10 km W (in vogelvlucht) van Gent)";

// Coordinate Systems
var coordsys = {
		'dd' : {},
		'dms' : {},
		'ddm' : {}
	};

coordsys.dd.nl = "decimale graden";
coordsys.dms.nl = "graden minuten seconden";
coordsys.ddm.nl = "graden decimale minuten";

// Heading Abbreviations:
var headings = {
		'n' : {},
		'e' : {},
		's' : {},
		'w' : {},
		'ne' : {},
		'se' : {},
		'sw' : {},
		'nw' : {},
		'nne' : {},
		'ene' : {},
		'ese' : {},
		'sse' : {},
		'ssw' : {},
		'wsw' : {},
		'wnw' : {},
		'nnw' : {},
		'nearestdegree' : {},
		'nbe' : {},
		'nebn' : {},
		'nebe' : {},
		'ebn' : {},
		'ebs' : {},
		'sebe' : {},
		'sebs' : {},
		'sbe' : {},
		'sbw' : {},
		'swbs' : {},
		'swbw' : {},
		'wbs' : {},
		'wbn' : {},
		'nwbw' : {},
		'nwbn' : {},
		'nbw' : {}
};

headings.n.nl = "N";
headings.e.nl = "O";
headings.s.nl = "Z";
headings.w.nl = "W";
headings.ne.nl = "NO";
headings.se.nl = "ZO";
headings.sw.nl = "ZW";
headings.nw.nl = "NW";
headings.nne.nl = "NNO";
headings.ene.nl = "ONO";
headings.ese.nl = "OZO";
headings.sse.nl = "ZZO";
headings.ssw.nl = "ZZW";
headings.wsw.nl = "WZW";
headings.wnw.nl = "WNW";
headings.nnw.nl = "NNW";
headings.nearestdegree.nl = "graden vanuit het N";
headings.nbe.nl  = "NbE";
headings.nebn.nl = "NEbN";
headings.nebe.nl = "NEbE";
headings.ebn.nl  = "EbN";
headings.ebs.nl  = "EbS";
headings.sebe.nl = "SEbE";
headings.sebs.nl = "SEbS";
headings.sbe.nl  = "SbE";
headings.sbw.nl  = "SbW";
headings.swbs.nl = "SWbS";
headings.swbw.nl = "SWbW";
headings.wbs.nl  = "WbS";
headings.wbn.nl  = "WbN";
headings.nwbw.nl = "NWbW";
headings.nwbn.nl = "NWbN";
headings.nbw.nl  = "NbW";

// Labels
var label = {
		'lat' : {},
		'lon' : {},
		'offset' : {},
		'extent' : { 'gps' : {} },
		'measurementerror' : {},
		'loctype' : {},
		'title' : {},
		'coordsource' : {},
		'coordsys' : {},
		'datum' : {},
		'coordprec' : {},
		'georeferencer' : {},
		'date' : {},
		'protocol' : {},		
		'distew' : {},
		'distns' : {},
		'distunits' : {},
		'distprec' : {},
		'direction' : {},
		'calculate' : {},
		'copy' : {},
		'copied' : {},
		'promote' : {},
		'declat' : {},
		'declon' : {},
		'maxerrdist' : {},
		'distanceconverter' : {},
		'scaleconverter' : {}
};

label.lat.nl = "Invoerbreedtegraad";
label.lon.nl = "Invoerlengtegraad";
label.offset.nl = "Afstand";
label.extent.nl = "Grootte van de entiteit";
label.measurementerror.nl = "Meetfout";
label.extent.gps.nl = "GPS Accuraatheid";
label.loctype.nl = "Locatieklasse";
label.title.nl = "Rekenmachine voor coördinatenbepaling";
label.coordsource.nl = "Coördinatenbron";
label.coordsys.nl = "Coördinaten formaat";
label.datum.nl = "Datum";
label.coordprec.nl = "Coördinatenprecisie";
label.georeferencer.nl = "Georeferentie door"
label.date.nl = "Datum vandaag"
label.protocol.nl = "Protocol"
label.distew.nl = "Afstand Oost of West";
label.distns.nl = "Afstand Noord of Zuid";
label.distunits.nl = "Afstandseenheden";
label.distprec.nl = "Afstandsprecisie";
label.direction.nl = "Richting";
label.calculate.nl = "Bereken";
label.copy.nl = "Kopiëren";
label.copied.nl = "Gekopieerd";
label.promote.nl = "Ga daarheen";
label.declat.nl = "Breedtegraad";
label.declon.nl = "Lengtegraad";
label.maxerrdist.nl = "Onzekerheid (m)";
label.distanceconverter.nl = "Aftandsomvormer:";
label.scaleconverter.nl = "Schaalomvormer:";

// Errors
var error = {
		'heading' : { 'message' : {}, 'title' : {} },
		'lat' : { 'message' : {}, 'title' : {} },
		'lon' : { 'message' : {}, 'title' : {} },
		'min' : { 'message' : {}, 'title' : {} },
		'sec' : { 'message' : {}, 'title' : {} },
		'offset' : { 'message' : {}, 'title' : {} },
		'extent' : { 'message' : {}, 'title' : {} },
		'measurementerror' : { 'message' : {}, 'title' : {} },
		'number' : { 'message' : {}, 'title' : {} },
		'lng' : { 'message' : {}, 'title' : {} }
};
error.heading.message.nl = "De windrichting moet een waarde hebben tussen 0 (Noord) en 360.";
error.heading.title.nl = "Windrichting invoer fout";
error.lat.message.nl = "De breedtegraad moet een waarde hebben tussen de -90 (Zuidpool) en 90 (Noordpool).";
error.lat.title.nl = "Coördinaat invoer fout";
error.lon.message.nl = "De lengtegraad moet een waarde hebben tussen -180 en 180.";
error.lon.title.nl = "Coördinaat invoer fout";
error.min.message.nl = "De minuten moeten een waarde hebben tussen 0 en 60.";
error.min.title.nl = "Coördinaat invoer fout";
error.sec.message.nl = "De seconden moeten een waarde hebben tussen 0 en 60.";
error.sec.title.nl = "Coördinaat invoer fout";
error.offset.message.nl = "De afstand moet een positief getal zijn.";
error.offset.title.nl = "Afstand invoer fout";
error.extent.message.nl = "De Grootte moet een positief getal zijn.";
error.extent.title.nl = "Grootte invoer fout";
error.measurementerror.message.nl = "De Meetfout moet een positief getal zijn.";
error.measurementerror.title.nl = "Meetfout invoer fout";
error.number.message.nl = "Het formaat van het net ingevoerde getal moet de conventies van de gekozen taal volgen.";
error.number.title.nl = "Getal invoer fout";

// Coordinate Precisions
var coordprec = {
	'dd' : { 
		'degree' : {},
		'cp_01' : {},
		'cp_001' : {},
		'cp_0001' : {},
		'cp_00001' : {},
		'cp_000001' : {},
		'half' : {},
		'quarter' : {},
		'exact' : {}
		},
	'dms' : {
		'degree' : {},
		'cp_30m' : {},
		'cp_10m' : {},
		'cp_5m' : {},
		'cp_1m' : {},
		'cp_30s' : {},
		'cp_10s' : {},
		'cp_5s' : {},
		'cp_1s' : {},
		'cp_01s' : {},
		'cp_001s' : {},
		'exact' : {}
	},
	'ddm' : {
		'degree' : {},
		'cp_30m' : {},
		'cp_10m' : {},
		'cp_5m' : {},
		'cp_1m' : {},	
		'cp_01m' : {},	
		'cp_001m' : {},	
		'cp_0001m' : {},	
		'exact' : {}
	}
};

coordprec.dd.degree.nl = "dichtsbijzijnde graad";
coordprec.dd.cp_01.nl = "0.1 graden";
coordprec.dd.cp_001.nl = "0.01 graden";
coordprec.dd.cp_0001.nl = "0.001 graden";
coordprec.dd.cp_00001.nl = "0.0001 graden";
coordprec.dd.cp_000001.nl = "0.00001 graden";
coordprec.dd.half.nl = "1/2 graad";
coordprec.dd.quarter.nl = "1/4 graad";
coordprec.dd.exact.nl = "exact";

coordprec.dms.degree.nl = "dichtsbijzijnde graad";
coordprec.dms.cp_30m.nl = "dichtsbijzijnde 30 minuten";
coordprec.dms.cp_10m.nl = "dichtsbijzijnde 10 minuten";
coordprec.dms.cp_5m.nl = "dichtsbijzijnde 5 minuten";
coordprec.dms.cp_1m.nl = "dichtsbijzijnde minuut";
coordprec.dms.cp_30s.nl = "dichtsbijzijnde 30 seconden";
coordprec.dms.cp_10s.nl = "dichtsbijzijnde 10 seconden";
coordprec.dms.cp_5s.nl = "dichtsbijzijnde 5 seconden";
coordprec.dms.cp_1s.nl = "dichtsbijzijnde seconde";
coordprec.dms.cp_01s.nl = "dichtsbijzijnde 0.1 seconden";
coordprec.dms.cp_001s.nl = "dichtsbijzijnde 0.01 seconden";
coordprec.dms.exact.nl = "exact";

coordprec.ddm.degree.nl = "dichtsbijzijnde graad";
coordprec.ddm.cp_30m.nl = "dichtsbijzijnde 30 minuten";
coordprec.ddm.cp_10m.nl = "dichtsbijzijnde 10 minuten";
coordprec.ddm.cp_5m.nl = "dichtsbijzijnde 5 minuten";
coordprec.ddm.cp_1m.nl = "dichtsbijzijnde minuut";
coordprec.ddm.cp_01m.nl = "dichtsbijzijnde 0.1 minuten";
coordprec.ddm.cp_001m.nl = "dichtsbijzijnde 0.01 minuten";
coordprec.ddm.cp_0001m.nl = "dichtsbijzijnde 0.001 minuten";
coordprec.ddm.exact.nl = "exact";

// Datum
var datum = { 'notrecorded' : { 'nl' : "datum onbekend" } };

// Protocol
var protocol = { 
'notrecorded' : { },
'qrg2012' : { },
'qrg2020' : { }
};

protocol.notrecorded.nl = "protocol onbekend";
protocol.qrg2012.nl = "Georeferencing Quick Reference Guide. 2012";
protocol.qrg2020.nl = "Georeferencing Quick Reference Guide. 2020";

// Coordinate Source
var coordsource = {
'gaz' : { },
'gem2008' : { },
'gem2018' : { },
'gps' : { },
'loc' : { },
'non3000000' : { },
'non2500000' : { },
'non1000000' : { },
'non500000' : { },
'non250000' : { },
'non200000' : { },
'non180000' : { },
'non150000' : { },
'non125000' : { },
'non100000' : { },
'non80000' : { },
'non62500' : { },
'non60000' : { },
'non50000' : { },
'non40000' : { },
'non32500' : { },
'non25000' : { },
'non20000' : { },
'non10000' : { },
'usgs250000' : { },
'usgs100000' : { },
'usgs63360' : { },
'usgs62500' : { },
'usgs25000' : { },
'usgs24000' : { },
'usgs12000' : { },
'usgs10000' : { },
'usgs4800' : { },
'usgs2400' : { },
'usgs1200' : { },
'ntsa250000' : { },
'ntsb250000' : { },
'ntsc250000' : { },
'ntsa50000' : { },
'ntsb50000' : { },
'ntsc50000' : { }
};
coordsource.gaz.nl = "plaatsnamenlijst (gazetteer)";
coordsource.gem2008.nl = "Google Earth/Maps <=2008";
coordsource.gem2018.nl = "Google Earth/Maps >2008";
coordsource.gps.nl = "GPS";
coordsource.loc.nl = "locatiebeschrijving";
coordsource.non3000000.nl = "andere kaart: 1:3000000";
coordsource.non2500000.nl = "andere kaart: 1:2500000";
coordsource.non1000000.nl = "andere kaart: 1:1000000";
coordsource.non500000.nl = "andere kaart: 1:500000";
coordsource.non250000.nl = "andere kaart: 1:250000";
coordsource.non200000.nl = "andere kaart: 1:200000";
coordsource.non180000.nl = "andere kaart: 1:180000";
coordsource.non150000.nl = "andere kaart: 1:150000";
coordsource.non125000.nl = "andere kaart: 1:125000";
coordsource.non100000.nl = "andere kaart: 1:100000";
coordsource.non80000.nl = "andere kaart: 1:80000";
coordsource.non62500.nl = "andere kaart: 1:62500";
coordsource.non60000.nl = "andere kaart: 1:60000";
coordsource.non50000.nl = "andere kaart: 1:50000";
coordsource.non40000.nl = "andere kaart: 1:40000";
coordsource.non32500.nl = "andere kaart: 1:32500";
coordsource.non25000.nl = "andere kaart: 1:25000";
coordsource.non20000.nl = "andere kaart: 1:20000";
coordsource.non10000.nl = "andere kaart: 1:10000";
coordsource.usgs250000.nl = "USGS kaart: 1:250000";
coordsource.usgs100000.nl = "USGS kaart: 1:100000";
coordsource.usgs63360.nl = "USGS kaart: 1:63360";
coordsource.usgs62500.nl = "USGS kaart: 1:62500";
coordsource.usgs25000.nl = "USGS kaart: 1:25000";
coordsource.usgs24000.nl = "USGS kaart: 1:24000";
coordsource.usgs12000.nl = "USGS kaart: 1:12000";
coordsource.usgs10000.nl = "USGS kaart: 1:10000";
coordsource.usgs4800.nl = "USGS kaart: 1:4800";
coordsource.usgs2400.nl = "USGS kaart: 1:2400";
coordsource.usgs1200.nl = "USGS kaart: 1:1200";
coordsource.ntsa250000.nl = "NTS kaart (A): 1:250000";
coordsource.ntsb250000.nl = "NTS kaart (B): 1:250000";
coordsource.ntsc250000.nl = "NTS kaart (C): 1:250000";
coordsource.ntsa50000.nl = "NTS kaart (A): 1:50000";
coordsource.ntsb50000.nl = "NTS kaart (B): 1:50000";
coordsource.ntsc50000.nl = "NTS kaart (C): 1:50000";

//##############################
// English
//##############################
// Locality Type
loctype.coordonly.en = "Coordinates only (e.g., 27\u00b034'23.4\" N, 121\u00b056'42.3\" W)";
loctype.namedplaceonly.en = "Geographic feature only (e.g., Bakersfield)";
loctype.distanceonly.en = "Distance only (e.g., 5 mi from Bakersfield)";
loctype.distalongpath.en = "Distance along path (e.g., 13 mi E (by road) Bakersfield)";
loctype.orthodist.en = "Distance along orthogonal directions (e.g., 2 mi E and 3 mi N of Bakersfield)";
loctype.distatheading.en = "Distance at a heading (e.g., 10 mi E (by air) Bakersfield)";

// Coordinate Systems
coordsys.dd.en = "decimal degrees";
coordsys.dms.en = "degrees minutes seconds";
coordsys.ddm.en = "degrees decimal minutes";

// Heading Abbreviations:
headings.n.en = "N";
headings.e.en = "E";
headings.s.en = "S";
headings.w.en = "W";
headings.ne.en = "NE";
headings.se.en = "SE";
headings.sw.en = "SW";
headings.nw.en = "NW";
headings.nne.en = "NNE";
headings.ene.en = "ENE";
headings.ese.en = "ESE";
headings.sse.en = "SSE";
headings.ssw.en = "SSW";
headings.wsw.en = "WSW";
headings.wnw.en = "WNW";
headings.nnw.en = "NNW";
headings.nbe.en  = "NbE";
headings.nebn.en = "NEbN";
headings.nebe.en = "NEbE";
headings.ebn.en  = "EbN";
headings.ebs.en  = "EbS";
headings.sebe.en = "SEbE";
headings.sebs.en = "SEbS";
headings.sbe.en  = "SbE";
headings.sbw.en  = "SbW";
headings.swbs.en = "SWbS";
headings.swbw.en = "SWbW";
headings.wbs.en  = "WbS";
headings.wbn.en  = "WbN";
headings.nwbw.en = "NWbW";
headings.nwbn.en = "NWbN";
headings.nbw.en  = "NbW";
headings.nearestdegree.en = "degrees from N";

// Labels
label.lat.en = "Input Latitude";
label.lon.en = "Input Longitude";
label.offset.en = "Offset Distance";
label.extent.en = "Radial of Feature";
label.measurementerror.en = "Measurement Error";
label.extent.gps.en = "GPS Accuracy";
label.loctype.en = "Locality Type";
label.title.en = "Georeferencing Calculator";
label.coordsource.en = "Coordinate Source";
label.coordsys.en = "Coordinate Format";
label.datum.en = "Datum";
label.coordprec.en = "Precision";
//label.coordprec.en = "Coordinate Precision";
label.georeferencer.en = "Georeferenced by"
label.date.en = "Date"
label.protocol.en = "Protocol"
label.distew.en = "East or West Offset Distance";
label.distns.en = "North or South Offset Distance";
label.distunits.en = "Distance Units";
label.distprec.en = "Precision";
label.direction.en = "Direction";
label.calculate.en = "Calculate";
label.copy.en = "Copy";
label.copied.en = "Copied";
label.promote.en = "Go here";
label.declat.en = "Latitude";
label.declon.en = "Longitude";
label.maxerrdist.en = "Uncertainty (m)";
label.distanceconverter.en = "Distance Converter:";
label.scaleconverter.en = "Scale Converter:";

// Errors
error.heading.message.en = "The heading must be a value between 0 (North) and 360.";
error.heading.title.en = "Heading Input Error";
error.lat.message.en = "The latitude must be a value between -90 (South Pole) and 90 (North Pole).";
error.lat.title.en = "Coordinate Input Error";
error.lon.message.en = "The longitude must be a value between -180 and 180.";
error.lon.title.en = "Coordinate Input Error";
error.min.message.en = "The minutes must be a value between 0 and 60.";
error.min.title.en = "Coordinate Input Error";
error.sec.message.en = "The seconds must be a value between 0 and 60.";
error.sec.title.en = "Coordinate Input Error";
error.offset.message.en = "The offset must be a non-negative value.";
error.offset.title.en = "Offset Input Error";
error.extent.message.en = "The radial must be a non-negative value.";
error.extent.title.en = "Radial Input Error";
error.measurementerror.message.en = "The measurement error must be a non-negative value.";
error.measurementerror.title.en = "Measurement Error Input Error";
error.number.message.en = "The format of the number just entered must follow convention of the chosen language.";
error.number.title.en = "Number Input Error";

// Coordinate Precisions
coordprec.dd.degree.en = "nearest degree";
coordprec.dd.cp_01.en = "0.1 degrees";
coordprec.dd.cp_001.en = "0.01 degrees";
coordprec.dd.cp_0001.en = "0.001 degrees";
coordprec.dd.cp_00001.en = "0.0001 degrees";
coordprec.dd.cp_000001.en = "0.00001 degrees";
coordprec.dd.half.en = "1/2 degree";
coordprec.dd.quarter.en = "1/4 degree";
coordprec.dd.exact.en = "exact";

coordprec.dms.degree.en = "nearest degree";
coordprec.dms.cp_30m.en = "nearest 30 minutes";
coordprec.dms.cp_10m.en = "nearest 10 minutes";
coordprec.dms.cp_5m.en = "nearest 5 minutes";
coordprec.dms.cp_1m.en = "nearest minute";
coordprec.dms.cp_30s.en = "nearest 30 seconds";
coordprec.dms.cp_10s.en = "nearest 10 seconds";
coordprec.dms.cp_5s.en = "nearest 5 seconds";
coordprec.dms.cp_1s.en = "nearest second";
coordprec.dms.cp_01s.en = "nearest 0.1 seconds";
coordprec.dms.cp_001s.en = "nearest 0.01 seconds";
coordprec.dms.exact.en = "exact";

coordprec.ddm.degree.en = "nearest degree";
coordprec.ddm.cp_30m.en = "nearest 30 minutes";
coordprec.ddm.cp_10m.en = "nearest 10 minutes";
coordprec.ddm.cp_5m.en = "nearest 5 minutes";
coordprec.ddm.cp_1m.en = "nearest minute";
coordprec.ddm.cp_01m.en = "nearest 0.1 minutes";
coordprec.ddm.cp_001m.en = "nearest 0.01 minutes";
coordprec.ddm.cp_0001m.en = "nearest 0.001 minutes";
coordprec.ddm.exact.en = "exact";

// Datum
datum.notrecorded.en = "datum not recorded";

// Protocol
protocol.notrecorded.en = "protocol not recorded";
protocol.qrg2012.en = "Georeferencing Quick Reference Guide. 2012";
protocol.qrg2020.en = "Georeferencing Quick Reference Guide. 2020";

// Coordinate Source
coordsource.gaz.en = "gazetteer";
coordsource.gem2008.en = "Google Earth/Maps <=2008";
coordsource.gem2018.en = "Google Earth/Maps >2008";
coordsource.gps.en = "GPS";
coordsource.loc.en = "locality description";
coordsource.usgs250000.en = "USGS map: 1:250000";
coordsource.usgs100000.en = "USGS map: 1:100000";
coordsource.usgs63360.en = "USGS map: 1:63360";
coordsource.usgs62500.en = "USGS map: 1:62500";
coordsource.usgs25000.en = "USGS map: 1:25000";
coordsource.usgs24000.en = "USGS map: 1:24000";
coordsource.usgs12000.en = "USGS map: 1:12000";
coordsource.usgs10000.en = "USGS map: 1:10000";
coordsource.usgs4800.en = "USGS map: 1:4800";
coordsource.usgs2400.en = "USGS map: 1:2400";
coordsource.usgs1200.en = "USGS map: 1:1200";
coordsource.ntsa250000.en = "NTS map (A): 1:250000";
coordsource.ntsb250000.en = "NTS map (B): 1:250000";
coordsource.ntsc250000.en = "NTS map (C): 1:250000";
coordsource.ntsa50000.en = "NTS map (A): 1:50000";
coordsource.ntsb50000.en = "NTS map (B): 1:50000";
coordsource.ntsc50000.en = "NTS map (C): 1:50000";
coordsource.non3000000.en = "other map: 1:3000000";
coordsource.non2500000.en = "other map: 1:2500000";
coordsource.non1000000.en = "other map: 1:1000000";
coordsource.non500000.en = "other map: 1:500000";
coordsource.non250000.en = "other map: 1:250000";
coordsource.non200000.en = "other map: 1:200000";
coordsource.non180000.en = "other map: 1:180000";
coordsource.non150000.en = "other map: 1:150000";
coordsource.non125000.en = "other map: 1:125000";
coordsource.non100000.en = "other map: 1:100000";
coordsource.non80000.en = "other map: 1:80000";
coordsource.non62500.en = "other map: 1:62500";
coordsource.non60000.en = "other map: 1:60000";
coordsource.non50000.en = "other map: 1:50000";
coordsource.non40000.en = "other map: 1:40000";
coordsource.non32500.en = "other map: 1:32500";
coordsource.non25000.en = "other map: 1:25000";
coordsource.non20000.en = "other map: 1:20000";
coordsource.non10000.en = "other map: 1:10000";

//##############################
// Español
//##############################
// Tipo de Localidad 
loctype.coordonly.es = "Solo Coordenadas ( p.ej., 27\u00b034'23,4\" S, 61\u00b056'42,3\" O)"  
loctype.namedplaceonly.es = "Solo una Entidad Geográfica (p.ej., San Marcos)";
loctype.distanceonly.es = "Solo Distancia (p.ej., 5 km de San Marcos)";
loctype.distalongpath.es = "Distancia por ruta (p.ej., 13 km E (por ruta) de San Marcos)";
loctype.orthodist.es = "Distancia por direcciones ortogonales (p.ej., 2 km E y 3 km N de San Marcos)";
loctype.distatheading.es = "Distancia en una dirección ( p.ej., 10 km E (por aire) de San Marcos)";

// Sistema de las Coordenadas
coordsys.dd.es = "grados decimales";
coordsys.dms.es = "grados, minutos y segundos" 
coordsys.ddm.es = "grados y minutos decimales";

// Abreviaturas de las Direcciones: 
headings.n.es = "N";
headings.e.es = "E";
headings.s.es = "S";
headings.w.es = "O";
headings.ne.es = "NE";
headings.se.es = "SE";
headings.sw.es = "SO";
headings.nw.es = "NO";
headings.nne.es = "NNE";
headings.ene.es = "ENE";
headings.ese.es = "ESE";
headings.sse.es = "SSE";
headings.ssw.es = "SSO";
headings.wsw.es = "OSO";
headings.wnw.es = "ONO";
headings.nnw.es = "NNO";
headings.nbe.es  = "NbE";
headings.nebn.es = "NEbN";
headings.nebe.es = "NEbE";
headings.ebn.es  = "EbN";
headings.ebs.es  = "EbS";
headings.sebe.es = "SEbE";
headings.sebs.es = "SEbS";
headings.sbe.es  = "SbE";
headings.sbw.es  = "SbW";
headings.swbs.es = "SWbS";
headings.swbw.es = "SWbW";
headings.wbs.es  = "WbS";
headings.wbn.es  = "WbN";
headings.nwbw.es = "NWbW";
headings.nwbn.es = "NWbN";
headings.nbw.es  = "NbW";
headings.nearestdegree.es = "grados desde N";

// Etiquetas
label.lat.es = "Latitud de entrada";
label.lon.es = "Longitud de entrada";
label.offset.es = "Desplazamiento";
label.extent.es = "Radial de la Entidad";
label.measurementerror.es = "Error de Medición";
label.extent.gps.es = "Exactidud del GPS";
label.loctype.es = "Tipo de Localidad";
label.title.es = "Calculadora de Georreferenciación";
label.coordsource.es = "Fuente de las Coordenadas";
label.coordsys.es = "Formato de Coordenadas";
label.datum.es = "Datum"
label.coordprec.es = "Precisión";
label.georeferencer.es = "Georreferenciado por"
label.date.es = "Fecha"
label.protocol.es = "Protocolo"
label.distew.es = "Distancia al Este o Oeste";
label.distns.es = "Distancia al Norte o Sur";
label.distunits.es = "Unidades de la Distancia";
label.distprec.es = "Precisión de la Distancia";
label.direction.es = "Dirección";
label.calculate.es = "Calcular";
label.copy.es = "Copiar";
label.copied.es = "Copiado";
label.promote.es = "Ir allí";
label.declat.es = "Latitud";
label.declon.es = "Longitud";
label.maxerrdist.es = "Incertidumbre (m)";
label.distanceconverter.es = "Convertidor de Distancias:";
label.scaleconverter.es = "Convertidor de Escalas:";

// Errores
error.heading.message.es = "La dirección debe ser un valor entre 0 (Norte) y 360.";
error.heading.title.es = "Error de la dirección";
error.lat.message.es = "La latitud debe ser un valor entre -90 (Polo Sur) y 90 (Polo Norte).";
error.lat.title.es = "Error de las Coordenadas Ingresadas";
error.lon.message.es = "La longitud debe ser un valor entre -180 y 180.";
error.lon.title.es = "Error de las Coordenadas Ingresadas";
error.min.message.es = "Los minutos deben ser un valor entre 0 y 60.";
error.min.title.es = "Error de las Coordenadas Ingresadas";
error.sec.message.es = "Los segundos deben ser un valor entre 0 y 60.";
error.sec.title.es = "Error de las Coordenadas Ingresadas";
error.offset.message.es = "El valor de la desplazamiento debe ser más que cero.";
error.offset.title.es = "Error de la Desplazamiento Ingresada";
error.extent.message.es = "El valor del radial debe ser más que cero.";
error.extent.title.es = "Error del Radial Ingresada";
error.measurementerror.message.es = "El valor de la medición debe ser más que cero.";
error.measurementerror.title.es = "Error de la Medición Ingresada";
error.number.message.es = "The format of the number just entered must follow convention of the chosen language.*";
error.number.title.es = "Error del Número Ingresado";

// Precision de las Coordenadas
coordprec.dd.degree.es = "grado más cercano";
coordprec.dd.cp_01.es = "0.1 grados";
coordprec.dd.cp_001.es = "0.01 grados";
coordprec.dd.cp_0001.es = "0.001 grados";
coordprec.dd.cp_00001.es = "0.0001 grados";
coordprec.dd.cp_000001.es = "0.00001 grados";
coordprec.dd.half.es = "1/2 grado";
coordprec.dd.quarter.es = "1/4 grado";
coordprec.dd.exact.es = "exacto";

coordprec.dms.degree.es = "grado más cercano";
coordprec.dms.cp_30m.es = "30 minutos";
coordprec.dms.cp_10m.es = "10 minutos";
coordprec.dms.cp_5m.es = "5 minutos";
coordprec.dms.cp_1m.es = "minuto más cercano" 
coordprec.dms.cp_30s.es = "30 segundos";
coordprec.dms.cp_10s.es = "10 segundos";
coordprec.dms.cp_5s.es = "5 segundos";
coordprec.dms.cp_1s.es = "segundo más cercano";
coordprec.dms.cp_01s.es = "0.1 segundos";
coordprec.dms.cp_001s.es = "0.01 segundos";
coordprec.dms.exact.es = "exacto";

coordprec.ddm.degree.es = "grado más cercano";
coordprec.ddm.cp_30m.es = "30 minutos";
coordprec.ddm.cp_10m.es = "10 minutos";
coordprec.ddm.cp_5m.es = "5 minutos";
coordprec.ddm.cp_1m.es = "minuto más cercano";
coordprec.ddm.cp_01m.es = "0.1 minutos";
coordprec.ddm.cp_001m.es = "0.01 minutos";
coordprec.ddm.cp_0001m.es = "0.001 minutos";
coordprec.ddm.exact.es = "exacto";

// Datum
datum.notrecorded.es = "datum no indicado";

// Protocol
protocol.notrecorded.es = "protocol no indicado";
protocol.qrg2012.es = "Georeferencing Quick Reference Guide. 2012";
protocol.qrg2020.es = "Georeferencing Quick Reference Guide. 2020";

// Fuentes de las Coordenadas
coordsource.gaz.es = "gacetero";
coordsource.gem2008.es = "Google Earth/Maps <=2008";
coordsource.gem2018.es = "Google Earth/Maps >2008";
coordsource.gps.es = "GPS";
coordsource.loc.es = "localidad textual";
coordsource.usgs250000.es = "mapa USGS: 1:250000";
coordsource.usgs100000.es = "mapa USGS: 1:100000";
coordsource.usgs63360.es = "mapa USGS: 1:63360";
coordsource.usgs62500.es = "mapa USGS: 1:62500";
coordsource.usgs25000.es = "mapa USGS: 1:25000";
coordsource.usgs24000.es = "mapa USGS: 1:24000";
coordsource.usgs12000.es = "mapa USGS: 1:12000";
coordsource.usgs10000.es = "mapa USGS: 1:10000";
coordsource.usgs4800.es = "mapa USGS: 1:4800";
coordsource.usgs2400.es = "mapa USGS: 1:2400";
coordsource.usgs1200.es = "mapa USGS: 1:1200";
coordsource.ntsa250000.es = "mapa NTS (A): 1:250000";
coordsource.ntsb250000.es = "mapa NTS (B): 1:250000";
coordsource.ntsc250000.es = "mapa NTS (C): 1:250000";
coordsource.ntsa50000.es = "mapa NTS (A): 1:50000";
coordsource.ntsb50000.es = "mapa NTS (B): 1:50000";
coordsource.ntsc50000.es = "mapa NTS (C): 1:50000";
coordsource.non3000000.es = "otro mapa: 1:3000000";
coordsource.non2500000.es = "otro mapa: 1:2500000";
coordsource.non1000000.es = "otro mapa: 1:1000000";
coordsource.non500000.es = "otro mapa: 1:500000";
coordsource.non250000.es = "otro mapa: 1:250000";
coordsource.non200000.es = "otro mapa: 1:200000";
coordsource.non180000.es = "otro mapa: 1:180000";
coordsource.non150000.es = "otro mapa: 1:150000";
coordsource.non125000.es = "otro mapa: 1:125000";
coordsource.non100000.es = "otro mapa: 1:100000";
coordsource.non80000.es = "otro mapa: 1:80000";
coordsource.non62500.es = "otro mapa: 1:62500";
coordsource.non60000.es = "otro mapa: 1:60000";
coordsource.non50000.es = "otro mapa: 1:50000";
coordsource.non40000.es = "otro mapa: 1:40000";
coordsource.non32500.es = "otro mapa: 1:32500";
coordsource.non25000.es = "otro mapa: 1:25000";
coordsource.non20000.es = "otro mapa: 1:20000";
coordsource.non10000.es = "otro mapa: 1:10000";

//##############################
// Português
//##############################
// Tipo de Localidade
loctype.coordonly.pt = "Coordenadas apenas (e.g., 27\u00b034'23,4\" N, 121\u00b056' 42,3\" W)";
loctype.namedplaceonly.pt = "Entidade geográfica apenas (e.g., Manaus)";
loctype.distanceonly.pt = "Distância apenas (e.g., 5 km de Manaus)";
loctype.distalongpath.pt = "Distância por rota (e.g., 13 km E (por estrada) Manaus)";
loctype.orthodist.pt = "Distância por direções ortogonais (e.g., 2 km E e 3 km N de Manaus)";
loctype.distatheading.pt = "Distância a uma direção (e.g., 10 km E (por ar) Manaus)";

// Sistema de Coordenadas
coordsys.dd.pt = "graus decimais";
coordsys.dms.pt = "graus minutos segundos";
coordsys.ddm.pt = "graus e minutos decimais";

// Abreviações das Direções:
headings.n.pt = "N";
headings.e.pt = "L";
headings.s.pt = "S";
headings.w.pt = "O";
headings.ne.pt = "NE";
headings.se.pt = "SE";
headings.sw.pt = "SO";
headings.nw.pt = "NO";
headings.nne.pt = "NNE";
headings.ene.pt = "ENE";
headings.ese.pt = "ESE";
headings.sse.pt = "SSE";
headings.ssw.pt = "SSO";
headings.wsw.pt = "OSO";
headings.wnw.pt = "ONO";
headings.nnw.pt = "NNO";
headings.nbe.pt  = "NbE";
headings.nebn.pt = "NEbN";
headings.nebe.pt = "NEbE";
headings.ebn.pt  = "EbN";
headings.ebs.pt  = "EbS";
headings.sebe.pt = "SEbE";
headings.sebs.pt = "SEbS";
headings.sbe.pt  = "SbE";
headings.sbw.pt  = "SbW";
headings.swbs.pt = "SWbS";
headings.swbw.pt = "SWbW";
headings.wbs.pt  = "WbS";
headings.wbn.pt  = "WbN";
headings.nwbw.pt = "NWbW";
headings.nwbn.pt = "NWbN";
headings.nbw.pt  = "NbW";
headings.nearestdegree.pt = "graus do N";

// Etiqueta
label.lat.pt = "Latitude de entrada";
label.lon.pt = "Longitude de entrada";
label.offset.pt = "Distância";
label.extent.pt = "Radial do Entidade";
label.measurementerror.pt = "Erro de Medição";
label.extent.gps.pt = "Precisão do GPS";
label.loctype.pt = "Tipo de Localidade";
label.title.pt = "Calculador de Georeferenciamento";
label.coordsource.pt = "Fonte das Coordenadas";
label.coordsys.pt = "Formato das Coordenadas";
label.datum.pt = "Datum";
label.coordprec.pt = "Precisão";
label.georeferencer.pt = "Georreferenciado por"
label.date.pt = "Data"
label.protocol.pt = "Protocolo"
label.distew.pt = "Distância a Leste ou Oeste";
label.distns.pt = "Distância a Norte ou Sul";
label.distunits.pt = "Unidades da Distância";
label.distprec.pt = "Precisão da Distância";
label.direction.pt = "Direção";
label.calculate.pt = "Calcular";
label.copy.pt = "Copiar";
label.copied.pt = "Copiado";
label.promote.pt = "Ir ali";
label.declat.pt = "Latitude";
label.declon.pt = "Longitude";
label.maxerrdist.pt = "Incerteza (m)";
label.distanceconverter.pt = "Convertidor da Distâncias:";
label.scaleconverter.pt = "Convertidor da Escalas:";

// Erros
error.heading.message.pt = "A direção deve ser um valor entre 0 (Norte) e 360.";
error.heading.title.pt = "Erro na entrada de dados de direção ";
error.lat.message.pt = "A latitude deve ser um valor entre -90 (Polo Sul) e 90 (Polo Norte).";
error.lat.title.pt = "Erro na entrada de coordenada";
error.lng.message.pt = "A longitude deve ser um valor entre -180 e 180. error.lng.title.pt = \"Erro na entrada de coordenada\"";
error.lng.title.pt = "Erro na entrada de coordenada";
error.min.message.pt = "Os minutos devem ser valores entre 0 e 60.";
error.min.title.pt = "Erro na entrada de coordenada";
error.sec.message.pt = "Os segundos devem ser valores entre 0 e 60.";
error.sec.title.pt = "Erro na entrada de coordenada";
error.offset.message.pt = "A perpendicular deve ser um valor não negativo.";
error.offset.title.pt = "Erro na entrada de perpendicular";
error.extent.message.pt = "O radial deve ser um valor não negativo.";
error.extent.title.pt = "Erro na entrada de Radial";
error.measurementerror.message.pt = "A medição deve ser um valor não negativo.";
error.measurementerror.title.pt = "Erro na entrada de Medição";
error.number.message.pt = "The format of the number just entered must follow convention of the chosen language.*";
error.number.title.pt = "Erro na entrada de número*";

// Precisão das Coordenadas
coordprec.dd.degree.pt = "grau mais próximo";
coordprec.dd.cp_01.pt = "0.1 graus";
coordprec.dd.cp_001.pt = "0.01 graus";
coordprec.dd.cp_0001.pt = "0.001 graus";
coordprec.dd.cp_00001.pt = "0.0001 graus";
coordprec.dd.cp_000001.pt = "0.00001 graus";
coordprec.dd.half.pt = "1/2 grau";
coordprec.dd.quarter.pt = "1/4 grau";
coordprec.dd.exact.pt = "exato";

coordprec.dms.degree.pt = "grau mais próximo";
coordprec.dms.cp_30m.pt = "30 minutos mais próximos";
coordprec.dms.cp_10m.pt = "10 minutos mais próximos";
coordprec.dms.cp_5m.pt = "5 minutos mais próximos";
coordprec.dms.cp_1m.pt = "minuto mais próximo";
coordprec.dms.cp_30s.pt = "30 segundos mais próximos";
coordprec.dms.cp_10s.pt = "10 segundos mais próximos";
coordprec.dms.cp_5s.pt = "5 segundos mais próximos";
coordprec.dms.cp_1s.pt = "segundo mais próximo";
coordprec.dms.cp_01s.pt = "0.1 segundos mais próximos";
coordprec.dms.cp_001s.pt = "0.01 segundos mais próximos";
coordprec.dms.exact.pt = "exato";

coordprec.ddm.degree.pt = "grau mais próximo";
coordprec.ddm.cp_30m.pt = "30 minutos mais próximos";
coordprec.ddm.cp_10m.pt = "10 minutos mais próximos";
coordprec.ddm.cp_5m.pt = "5 minutos mais próximos";
coordprec.ddm.cp_1m.pt = "minuto mais próximo";
coordprec.ddm.cp_01m.pt = "0.1 minutos mais próximos";
coordprec.ddm.cp_001m.pt = "0.01 minutos mais próximos";
coordprec.ddm.cp_0001m.pt = "0.001 minutos mais próximos";
coordprec.ddm.exact.pt = "exato";

// Datum
datum.notrecorded.pt = "datum não indicado";

// Protocol
protocol.notrecorded.pt = "protocol não indicado";
protocol.qrg2012.pt = "Georeferencing Quick Reference Guide. 2012";
protocol.qrg2020.pt = "Georeferencing Quick Reference Guide. 2020";

// Fonte das Coordenadas
coordsource.gaz.pt = "dicionário geográfico";
coordsource.gem2008.pt = "Google Earth/Maps <=2008";
coordsource.gem2018.pt = "Google Earth/Maps >2008";
coordsource.gps.pt = "GPS";
coordsource.loc.pt = "descrição da localidade";
coordsource.usgs250000.pt = "mapa USGS: 1:250000";
coordsource.usgs100000.pt = "mapa USGS: 1:100000";
coordsource.usgs63360.pt = "mapa USGS: 1:63360";
coordsource.usgs62500.pt = "mapa USGS: 1:62500";
coordsource.usgs25000.pt = "mapa USGS: 1:25000";
coordsource.usgs24000.pt = "mapa USGS: 1:24000";
coordsource.usgs12000.pt = "mapa USGS: 1:12000";
coordsource.usgs10000.pt = "mapa USGS: 1:10000";
coordsource.usgs4800.pt = "mapa USGS: 1:4800";
coordsource.usgs2400.pt = "mapa USGS: 1:2400";
coordsource.usgs1200.pt = "mapa USGS: 1:1200";
coordsource.ntsa250000.pt = "mapa NTS (A): 1:250000";
coordsource.ntsb250000.pt = "mapa NTS (B): 1:250000";
coordsource.ntsc250000.pt = "mapa NTS (C): 1:250000";
coordsource.ntsa50000.pt = "mapa NTS (A): 1:50000";
coordsource.ntsb50000.pt = "mapa NTS (B): 1:50000";
coordsource.ntsc50000.pt = "mapa NTS (C): 1:50000";
coordsource.non3000000.pt = "outro mapa: 1:3000000";
coordsource.non2500000.pt = "outro mapa: 1:2500000";
coordsource.non1000000.pt = "outro mapa: 1:1000000";
coordsource.non500000.pt = "outro mapa: 1:500000";
coordsource.non250000.pt = "outro mapa: 1:250000";
coordsource.non200000.pt = "outro mapa: 1:200000";
coordsource.non180000.pt = "outro mapa: 1:180000";
coordsource.non150000.pt = "outro mapa: 1:150000";
coordsource.non100000.pt = "outro mapa: 1:100000";
coordsource.non125000.pt = "outro mapa: 1:125000";
coordsource.non80000.pt = "outro mapa: 1:80000";
coordsource.non62500.pt = "outro mapa: 1:62500";
coordsource.non60000.pt = "outro mapa: 1:60000";
coordsource.non50000.pt = "outro mapa: 1:50000";
coordsource.non40000.pt = "outro mapa: 1:40000";
coordsource.non32500.pt = "outro mapa: 1:32500";
coordsource.non25000.pt = "outro mapa: 1:25000";
coordsource.non20000.pt = "outro mapa: 1:20000";
coordsource.non10000.pt = "outro mapa: 1:10000";

//##############################
// Français
//##############################
// Type de Localité
loctype.coordonly.fr = "Coordonnées seulement (e.g., 27\u00b034'23,4\"N, 121\u00b056'42,3\" O)";
loctype.namedplaceonly.fr = "Entité géographique seulement (e.g., Toliara)";
loctype.distanceonly.fr = "Distance seulement (e.g., 5 km de Toliara)";
loctype.distalongpath.fr = "Distance le long de voie d'accès (e.g., 13 km E (par voie terrestre) de Toliara)";
loctype.orthodist.fr = "Distance le long des directions orthogonales (e.g., 2 km E et 3 km N de Toliara)";
loctype.distatheading.fr = "Distance par rapport à la direction (e.g., 10 km E (par avion) de Toliara)";

// Systèmes de coordonnées
coordsys.dd.fr = "degrés décimales";
coordsys.dms.fr = "degrés minutes seconds";
coordsys.ddm.fr = "degrés décimales minutes";

// Abréviations à l'entête
headings.n.fr = "N";
headings.e.fr = "E";
headings.s.fr = "S";
headings.w.fr = "O";
headings.ne.fr = "NE";
headings.se.fr = "SE";
headings.sw.fr = "SO";
headings.nw.fr = "NO";
headings.nne.fr = "NNE";
headings.ene.fr = "ENE";
headings.ese.fr = "ESE";
headings.sse.fr = "SSE";
headings.ssw.fr = "SSO";
headings.wsw.fr = "OSO";
headings.wnw.fr = "ONO";
headings.nnw.fr = "NNO";
headings.nbe.fr  = "NbE";
headings.nebn.fr = "NEbN";
headings.nebe.fr = "NEbE";
headings.ebn.fr  = "EbN";
headings.ebs.fr  = "EbS";
headings.sebe.fr = "SEbE";
headings.sebs.fr = "SEbS";
headings.sbe.fr  = "SbE";
headings.sbw.fr  = "SbW";
headings.swbs.fr = "SWbS";
headings.swbw.fr = "SWbW";
headings.wbs.fr  = "WbS";
headings.wbn.fr  = "WbN";
headings.nwbw.fr = "NWbW";
headings.nwbn.fr = "NWbN";
headings.nbw.fr  = "NbW";
headings.nearestdegree.fr = "degrés du N";

// Labels
label.lat.fr = "Latitude d'entrée";
label.lon.fr = "Longitude d'entrée";
label.offset.fr = "Distance de l'Offset";
label.extent.fr = "Le radial de la Entité";
label.measurementerror.fr = "Erreur de Mesure";
label.extent.gps.fr = "Exactitude de GPS";
label.loctype.fr = "Type de Localité";
label.title.fr = "Calculateur de Géoréférence";
label.coordsource.fr = "Source de Coordonnées";
label.coordsys.fr = "Format de Coordonnées";
label.datum.fr = "Datum"
label.coordprec.fr = "Précision";
label.georeferencer.fr = "Géoréférencé par"
label.date.fr = "Date"
label.protocol.fr = "Protocole"
label.distew.fr = "Dist. de l'Offset Est ou Ouest";
label.distns.fr = "Dist. de l'Offset Nord ou Sud";
label.distunits.fr = "Unités de Distance";
label.distprec.fr = "Précision de Distance";
label.direction.fr = "Direction";
label.calculate.fr = "Calcul";
label.copy.fr = "Copier";
label.copied.fr = "Copié";
label.promote.fr = "Va là-bas"
label.declat.fr = "Latitude";
label.declon.fr = "Longitude";
label.maxerrdist.fr = "Incertitude (m)";
label.distanceconverter.fr = "Converteur de Distance:";
label.scaleconverter.fr = "Converteur de Scale:";

// Erreurs
error.heading.message.fr = "L'entête doit être une valeur entre 0 (Nord) et 360.";
error.heading.title.fr = "Erreur de saisie de l'entête";
error.lat.message.fr = "La latitude doit être entre -90 (Pole Sud) et 90 (Pole Nord).";
error.lat.title.fr = "Erreur de Saisie de Coordonnée";
error.lon.message.fr = "La longitude doit être entre -180 et 180.";
error.lon.title.fr = "Erreur de Saisie de Coordonnée";
error.min.message.fr = "Les minutes doit être entre 0 et 60.";
error.min.title.fr = "Erreur de Saisie de Coordonnée";
error.sec.message.fr = "Les seconds doit être entre 0 et 60.";
error.sec.title.fr = "Erreur de Saisie de Coordonnée";
error.offset.message.fr = "L'Offset ne doit pas avoir une valeur négative.";
error.offset.title.fr = "Erreur de Saisie de valeur de l'Offset";
error.extent.message.fr = "Le radial ne doit pas avoir une valeur négative.";
error.extent.title.fr = "Erreur de Saisie de valeur de le radial";
error.measurementerror.message.fr = "L'Offset ne doit pas avoir une valeur négative.";
error.measurementerror.title.fr = "Erreur de Saisie de valeur de Measure";
error.number.message.fr = "Le format du numéro doit suivre les conventions de la langue choisie.";
error.number.title.fr = "Erreur de Saisie de Número";

// Précision des Coordonnées
coordprec.dd.degree.fr = "degré près";
coordprec.dd.cp_01.fr = "0.1 degrés";
coordprec.dd.cp_001.fr = "0.01 degrés";
coordprec.dd.cp_0001.fr = "0.001 degrés";
coordprec.dd.cp_00001.fr = "0.0001 degrés";
coordprec.dd.cp_000001.fr = "0.00001 degrés";
coordprec.dd.half.fr = "1/2 degré";
coordprec.dd.quarter.fr = "1/4 degré";
coordprec.dd.exact.fr = "exacte";

coordprec.dms.degree.fr = "degré près";
coordprec.dms.cp_30m.fr = "30 minutes près";
coordprec.dms.cp_10m.fr = "10 minutes près";
coordprec.dms.cp_5m.fr = "5 minutes près";
coordprec.dms.cp_1m.fr = "minute près";
coordprec.dms.cp_30s.fr = "30 seconds près";
coordprec.dms.cp_10s.fr = "10 seconds près";
coordprec.dms.cp_5s.fr = "5 seconds près";
coordprec.dms.cp_1s.fr = "second près";
coordprec.dms.cp_01s.fr = "0.1 seconds près";
coordprec.dms.cp_001s.fr = "0.01 seconds près";
coordprec.dms.exact.fr = "exacte";

coordprec.ddm.degree.fr = "degré près";
coordprec.ddm.cp_30m.fr = " 30 minutes près";
coordprec.ddm.cp_10m.fr = "10 minutes près";
coordprec.ddm.cp_5m.fr = "5 minutes près";
coordprec.ddm.cp_1m.fr = "minute près";
coordprec.ddm.cp_01m.fr = "0.1 minutes près";
coordprec.ddm.cp_001m.fr = "0.01 minutes près";
coordprec.ddm.cp_0001m.fr = "0.001 minutes près";
coordprec.ddm.exact.fr = "exacte";

// Datum (Informations)
datum.notrecorded.fr = "informations (datum) non enregistrés";

// Protocol
protocol.notrecorded.fr = "protocol non enregistrés";
protocol.qrg2012.fr = "Georeferencing Quick Reference Guide. 2012";
protocol.qrg2020.fr = "Georeferencing Quick Reference Guide. 2020";

// Source de Coordonnées
coordsource.gaz.fr = "répertoire de localité (gazetteer)";
coordsource.gem2008.fr = "Google Earth/Maps <=2008";
coordsource.gem2018.fr = "Google Earth/Maps >2008";
coordsource.gps.fr = "GPS";
coordsource.loc.fr = "description de la localité";
coordsource.usgs250000.fr = "Carte USGS: 1:250000";
coordsource.usgs100000.fr = "Carte USGS: 1:100000";
coordsource.usgs63360.fr = "Carte USGS: 1:63360";
coordsource.usgs62500.fr = "Carte USGS: 1:62500";
coordsource.usgs25000.fr = "Carte USGS: 1:25000";
coordsource.usgs24000.fr = "Carte USGS: 1:24000";
coordsource.usgs12000.fr = "Carte USGS: 1:12000";
coordsource.usgs10000.fr = "Carte USGS: 1:10000";
coordsource.usgs4800.fr = "Carte USGS: 1:4800";
coordsource.usgs2400.fr = "Carte USGS: 1:2400";
coordsource.usgs1200.fr = "Carte USGS: 1:1200";
coordsource.ntsa250000.fr = "Carte NTS (A): 1:250000";
coordsource.ntsb250000.fr = "Carte NTS (B): 1:250000";
coordsource.ntsc250000.fr = "Carte NTS (C): 1:250000";
coordsource.ntsa50000.fr = "Carte NTS (A): 1:50000";
coordsource.ntsb50000.fr = "Carte NTS (B): 1:50000";
coordsource.ntsc50000.fr = "Carte NTS (C): 1:50000";
coordsource.non3000000.fr = "Autre Carte: 1:3000000";
coordsource.non2500000.fr = "Autre Carte: 1:2500000";
coordsource.non1000000.fr = "Autre Carte: 1:1000000";
coordsource.non500000.fr = "Autre Carte: 1:500000";
coordsource.non250000.fr = "Autre Carte: 1:250000";
coordsource.non200000.fr = "Autre Carte: 1:200000";
coordsource.non180000.fr = "Autre Carte: 1:180000";
coordsource.non150000.fr = "Autre Carte: 1:150000";
coordsource.non125000.fr = "Autre Carte: 1:125000";
coordsource.non100000.fr = "Autre Carte: 1:100000";
coordsource.non80000.fr = "Autre Carte: 1:80000";
coordsource.non62500.fr = "Autre Carte: 1:62500";
coordsource.non60000.fr = "Autre Carte: 1:60000";
coordsource.non50000.fr = "Autre Carte: 1:50000";
coordsource.non40000.fr = "Autre Carte: 1:40000";
coordsource.non32500.fr = "Autre Carte: 1:32500";
coordsource.non25000.fr = "Autre Carte: 1:25000";
coordsource.non20000.fr = "Autre Carte: 1:20000";
coordsource.non10000.fr = "Autre Carte: 1:10000";

//################################
// Unit Abbreviations:
// Canonical (don't change these!)
var units = {};
units.meter = "m";
units.foot = "ft";
units.mile = "mi";
units.yard = "yds";
units.kilometer = "km";

//tie the above object arrays into a single global properties object
g_properties.language = language;
g_properties.version = version;
g_properties.loctype = loctype;
g_properties.coordsys = coordsys;
g_properties.headings = headings;
g_properties.label = label;
g_properties.error = error;
g_properties.coordprec = coordprec;
g_properties.datum = datum;
g_properties.coordsource = coordsource;
g_properties.protocol = protocol;

//TODO Needed wanted for garbage collection???
loctype = null;
coordsys = null;
headings = null;
label = null;
error = null;
coordprec = null;
datum = null;
protocol = null;
date = null;
coordsource = null;
version = null;
language = null;  

g_properties.getPropertyLang = function( name )
{
	var language = g_language;
	var prop = eval( "g_properties." + name + "." + language );
	return prop;
}

g_properties.getPropertyByName = function( name )
{
	var prop = eval( "g_properties." + name );
	return prop;
}

g_properties.getPropertyByIndex = function( name, index )
{
	var prop = eval( "g_properties." + name );
	var prop2 = prop[index];
	return prop2;
}