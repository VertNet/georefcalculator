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
__version__ = "gc.ui.js 2015-11-23T06:22:55-08:00"
*/
	var lastcoordsystem = 1; // 1=dd.ddddd, 2=ddmmss.ss, 3=ddmm.mmmm
	
	var sign = 1;
	var degrees = 0;
	var minutes = 0;
	var seconds = 0;
	var decminutes = 0;

	var decimallatitude = 0; // holds the decimal latitude of the starting point
	var decimallongitude = 0; // holds the decimal longitude of the starting point

	var latmetersperdegree = 0; // holds number of meters per degree of latitude for the current coordinate and error calculation
	var longmetersperdegree = 0; // holds number of meters per degree of longitude for the current coordinate and error calculation

	var newdecimallatitude = 0; // holds the decimal latitude of the end point
	var newdecimallongitude = 0; // holds the decimal longitude of the end point

	var maxerrordistance = 0; // calculated max error distance

	var fromdistance = 0;  // holds the value of the left-hand side of the distance conversion equation
	var todistance = 0;    // holds the value of the right-hand side of the distance conversion equation
	var scalefromdistance = 0;  // holds the value of the left-hand side of the distance conversion equation
	var scaletodistance = 0;    // holds the value of the right-hand side of the distance conversion equation
	var scalefactor = 1; // holds the decimal latitude of the end point

	var lastdecimalminutes = 0;
	var lastdecimaldegrees = 0;

	var formatDec = g_factory.makeFormat("formatDec", "formatDec");
	var  formatDeg = g_factory.makeFormat("formatDeg", "formatDeg");
	var  formatMin = g_factory.makeFormat("formatMin", "formatMin");
	var  formatMinMM = g_factory.makeFormat("formatMinMM", "formatMinMM");
	var  formatSec = g_factory.makeFormat("formatSec", "formatSec");
	var  formatCalcError = g_factory.makeFormat("formatCalcError", "formatCalcError");
	var  formatDistance = g_factory.makeFormat("formatDistance", "formatDistance");
	var  formatCalcDec = g_factory.makeFormat("formatCalcDec", "formatCalcDec");

	var g_debug_active = false;
	var g_debug_loaded = false;


function downloadTests()
{
	if( g_debug_active == false )
	{
		var df = document.getElementById("divFiller");

		if( g_debug_loaded == false )
		{
			//load test_data.js
			e = document.createElement("script");
			e.src = "test_data.js";
			df.appendChild(e);
		
			//load auto-tests.js
			e = document.createElement("script");
			e.src = "auto-tests.js";
			df.appendChild(e);
			g_debug_loaded = true;
		}
		
		//create FAT button
		e = document.createElement( "BUTTON" );
		var t = document.createTextNode("FAT");
		e.setAttribute("onClick", "javascript: test_it();");
		e.setAttribute("ID", "FAT");

		e.appendChild(t);
		df.appendChild(e);
		
		//created SELECT button
		e = document.createElement( "SELECT" );
		//TODO i<8 is bad, but we cant use g_tests.length because it ?no longer global? due to delayed load?
		for( var i = 0; i< 8; i++ )
		{
			var option = document.createElement("option");
			option.text = "Test " + i;
			option.value= i;
			e.add( option );	
		}
		e.setAttribute("onselect", "javascript: onChoiceTest();");
		e.setAttribute("onchange", "javascript: onChoiceTest();");
		e.setAttribute("ID", "ChoiceTest");

		df.appendChild(e);
		
		g_debug_active = true;
	}
	else
	{
		if( uiIsVisible("ChoiceTest" ) )
		{
		   uiHideElement("fat");
		   uiHideElement("ChoiceTest");
		}
		else
		{
		   uiShowElement("fat");
		   uiShowElement("ChoiceTest");
		}
	}
}
	
function GC_init()
{
	g_embeddedCopyright = "Copyright 2015 Regents of the University of California";
	g_appletHeight = 480;  //TODO not needed anymore?
	g_appletWidth = 620;   //TODO not needed anymore?
	g_versionNumber = "20151123";

	
	g_canonicalheadings = g_factory.makeArrayList("g_canonicalheadings", "headings");
	g_canonicalcoordsystems = g_factory.makeArrayList("g_canonicalcoordsystems","coordsystem...");
	g_canonicalloctypes = g_factory.makeArrayList("g_canonicalloctypes","loctype...");
	g_canonicalcalctypes = g_factory.makeArrayList("g_canonicalcalctypes","calctypes...");
	g_canonicalddprec = g_factory.makeArrayList("g_canonicalddprec","ddprec");
	g_canonicaldmsprec = g_factory.makeArrayList("g_canonicaldmsprec","dmsprec");
	g_canonicalddmprec = g_factory.makeArrayList("g_canonicalddmprec","ddmprec");
	g_canonicalsources = g_factory.makeArrayList("g_canonicalsources","dunno");
	g_languagelist = g_factory.makeArrayList("g_languagelist", "languages");
	
	//Locale currentLocale = Locale.getDefault();
	g_currentLocale = "en"; //FIXME TODO getDefaultLocal();

	//NumberFormat numberFormatter = NumberFormat.getNumberInstance(currentLocale); 
	
	g_numberFormatter = "en"; //FIXME TODO getNumberInstance(currentLocale); 

	g_language = "en";	

	createDatum();
	var datumErrorInst = datumerror; 

	var language = g_language; 
	setVariables( language );
	
	//TODO the initialization of g_langualist should be its own function
	g_languagelist.clear();
	var i = 0;
	var lang = g_properties.getIndexedProperty( "language.name", i )
	var code = g_properties.getIndexedProperty( "language.code", i )
	var nObj = { 'name' : lang, 'value' : code };
	while( lang )
	{
		g_languagelist.add( nObj );
		i++;
		lang = g_properties.getIndexedProperty( "language.name", i );
		code = g_properties.getIndexedProperty( "language.code", i );
		nObj = { 'name' : lang, 'value' : code };
	}
	
	uiClearSelect( "ChoiceLanguage", "g_languagelist" );
	uiFillLanguageSelect( "ChoiceLanguage", "g_languagelist", false );
	uiShowElement( "LabelStepZero" );
	uiHideElement( "LabelTitle" );
	cleanSlate();
	uiSetSelectedIndex("ChoiceLanguage", 0 )
	onLanguageSelect();		

	uiClearSelect( "ChoiceCalcType" );
	uiSelectAddEmptyItem("ChoiceCalcType");
	uiSelectAddItem("ChoiceCalcType", "calctype.coordsanderror");
	uiSelectAddItem("ChoiceCalcType", "calctype.erroronly");
	uiSelectAddItem("ChoiceCalcType","calctype.coordsonly");
	uiSetSelectedIndex("ChoiceCalcType",0);
	
	populateCoordinatePrecision( g_properties.getPropertyLang("coordsys.dd") );
	showScaleConverter(true);
	showDistanceConverter(true);
	setTabOrders();
	setLanguageFocused();
	
} 

function setLanguageFocused()
{
	var e = document.getElementById( "ChoiceLanguage" );
	e.focus();
}

function setElementOrder( element, order )
{
	var e = document.getElementById( element );
	if( e )
	{
		e.tabIndex = order;
	}
	else
	{
		console.log("ERROR: setElementOrder, element not found" + element )
	}
	return order+1;
}

function setTabOrders()
{
	var a=1;

	a=setElementOrder("ChoiceLanguage", a);
	
	a=setElementOrder("ChoiceCalcType", a);
	a=setElementOrder("ChoiceModel", a);
	
	a=setElementOrder("ChoiceCoordSource", a);
	a=setElementOrder("ChoiceCoordSystem", a);

	//DD
	a=setElementOrder("txtT2Dec_Lat", a);
	a=setElementOrder("txtT2Dec_Long", a);

	//DDM
	a=setElementOrder("txtT7Lat_DegMM", a);
	a=setElementOrder("txtT7Lat_MinMM", a);
	a=setElementOrder("ChoiceLatDirMM", a);
	
	a=setElementOrder("txtT7Long_DegMM", a);
	a=setElementOrder("txtT7Long_MinMM", a);
	a=setElementOrder("ChoiceLongDirMM", a);
	
	//DMS
	a=setElementOrder("txtT7Lat_DegDMS", a);
	a=setElementOrder("txtT7Lat_MinDMS", a);
	a=setElementOrder("txtT7Lat_Sec", a);
	a=setElementOrder("ChoiceLatDirDMS", a);
		
	a=setElementOrder("txtT7Long_DegDMS", a);
	a=setElementOrder("txtT7Long_MinDMS", a);
	a=setElementOrder("txtT7Long_Sec", a);
	a=setElementOrder("ChoiceLongDirDMS", a);

	
	a=setElementOrder("ChoiceDatum", a);
	a=setElementOrder("ChoiceLatPrecision", a);

	//loc model dist at
	a=setElementOrder("ChoiceDirection", a);
	a=setElementOrder("TextFieldHeading", a);

	//loc model dist along
	a=setElementOrder("TextFieldOffset", a);
	a=setElementOrder("ChoiceOffsetNSDir", a);
	
	a=setElementOrder("TextFieldOffsetEW", a);
	a=setElementOrder("ChoiceOffsetEWDir", a);


	a=setElementOrder("TextFieldExtent", a);
	a=setElementOrder("TextFieldMeasurementError", a);
	a=setElementOrder("ChoiceDistUnits", a);
	a=setElementOrder("ChoiceDistancePrecision", a);	

	a=setElementOrder("ButtonCalculate", a);

	a=setElementOrder("TextFieldFullResult", a);

	a=setElementOrder("ButtonPromote", a);

	
	a=setElementOrder("TextFieldFromDistance", a);
	a=setElementOrder("ChoiceFromDistUnits", a);
	a=setElementOrder("TextFieldToDistance", a);
	a=setElementOrder("ChoiceToDistUnits", a);

	a=setElementOrder("TextFieldScaleFromDistance", a);
	a=setElementOrder("ChoiceScaleFromDistUnits", a);
	a=setElementOrder("ChoiceScale", a);
	a=setElementOrder("TextFieldScaleToDistance", a);
	a=setElementOrder("ChoiceScaleToDistUnits", a);
}


function uiIsVisible( name )
{
	var el = document.getElementById( name );
	returnVal = null;
	if( el )
	{
		var st = el.style.display
		if( st == "none" )
		{
			returnVal = false;
		}
		else 
		{
			returnVal = true;
		}	
	}
	else
	(
		console.log("ERROR uiIsVisible null element name:" + name )
	)
	return returnVal;
}

function onLanguageSelect()
{
	var el = document.getElementById( 'ChoiceLanguage' );

	g_language = el.options[el.selectedIndex].value;
	
	setVariables( );
	newLanguageChosen();
	
	uiSetLabel( "LabelStepZero", "label.step0" );
	uiSetLabel( "ChoiceCalcType", "calctype" );
}

function uiHideElement( name )
{
	var el = document.getElementById( name );
	if( el )
	{
		el.setAttribute("hidden", "true");
		el.style.display="none";
	}
	else
	(
		console.log("ERROR uiHideElement null element name:" + name )
	)
}

function uiShowElement( name )
{
	var el = document.getElementById( name );
	if( el )
	{
		el.setAttribute("hidden", "false");
		el.style.display="inline-block";
	}
	else
	(
		console.log("ERROR uiShowElement null element name:" + name )
	)

}


function uiSetLabel( name, source )
{
	var language = g_language;
	var el = document.getElementById( name );
	
	var c = eval( "g_properties." + source + "." + language );
	if(el )
	{
		if( el.childNodes.length > 0 )
		{
			el.removeChild( el.childNodes[0] );
		}
		var textnode = document.createTextNode(c);
		el.appendChild(textnode);
	}
	else
	(
		console.log("ERROR uiSetLabel null element name: " + name +" source: " + source)
	)
}

function uiSetTextExplicit( name, value )
{
	var el = document.getElementById( name );

	if( el )
	{
		el.text = value;
	}
	else
	(
		console.log("ERROR uiSetTextExplicit null element name: " + name +" source: " + value)
	)
}


function uiSetLabelExplicit( name, value )
{
	var el = document.getElementById( name );
	if( el )
	{
		if( el.childNodes.length > 0 )
		{
			el.removeChild(el.childNodes[0]);
		}
		var textnode = document.createTextNode(value);
		el.value = value;
		el.appendChild(textnode);
	}
	else
	(
		console.log("ERROR uiSetLabelExplicit null element name: " + name +" source: " + value)
	)
}


function uiEmptyLabel( name )
{
	var el = document.getElementById( name );

	if( el )
	{
		if( el.childNodes.length > 0 )
		{
			el.removeChild(el.childNodes[0]);
		}
		var textnode = document.createTextNode("");
		el.appendChild(textnode);
		el.value="";
	}
	else
	(
		console.log("ERROR uiEmptyLabel null element name: " + name)
	)
	
}

function uiEmptyTextElement( name )
{
	return uiEmptyLabel( name );
}


function uiClearSelect( name )
{
	var el = document.getElementById( name );
	if( el )
	{
		while( el.length > 0)
		{
			el.remove(el.length-1);
		}
	}
	else
	(
		console.log("ERROR uiClearSelect null element name: " + name)
	)
}
	

function uiClearAndFillSelectCanonical( name, source, initialEmpty )
{
		uiClearSelect( name );
		uiFillSelectCanonical( name, source, initialEmpty )
}

function uiSelectAddItem( name, source )
{
	var el = document.getElementById( name );
	var c = eval( "g_properties." + source + "." + g_language );
	
	if( el && c  )
	{
		var itemCount = el.length;
		var option = document.createElement("option");
		option.text = c;
		option.value= itemCount;
		el.add( option );
	}
	else
	(
		console.log("ERROR uiSelectAddItem null element name: " + name +" or source: "+ source + " c: " + c )
	)	
}

function uiSelectAddExplicitItem( name, value )
{
	var el = document.getElementById( name );
	
	if( el )
	{
		var option = document.createElement("option");
		option.text = value;
		option.value= value;
		el.add( option );
	}
	else
	(
		console.log("ERROR uiSelectAddExplicitItem null element name: " + name +" source: "+ value )
	)

}

function uiSelectAddEmptyItem( name )
{
	var el = document.getElementById( name );
	if( el )
	{
		var	option = document.createElement("option");
		option.text = " ";
		option.value= " ";
		el.add( option );
	}
	else
	(
		console.log("ERROR uiSelectAddEmptyItem null element name: " + name )
	)
}



function uiFillLanguageSelect( name, source, initialEmpty )
{
	var el = document.getElementById( name );
	var c = eval( source + ".contents" );
	
	if( el )
	{
		var option;
		if( initialEmpty )
		{
			option = document.createElement("option");
			option.text = " ";
			option.value= " ";
			el.add( option );
		}
	
		var l = 0
		while( l < c.length )
		{
			option = document.createElement("option");
			option.text = c[l].name;
			option.value= c[l].value;
			el.add( option );
			l++;
		}
	}
	else
	(
		console.log("ERROR uiFillLanguageSelect null element name: " + name )
	)
	
}

//FIXME unused?
/*
function uiFillSelect( name, source, initialEmpty )
{
	var el = document.getElementById( name );
	var c = eval( "g_properties." + source + "." +g_language );

	
	if( el )
	{
		var option;
		if( initialEmpty )
		{
			option = document.createElement("option");
			option.text = " ";
			option.value= " ";
			el.add( option );
		}
	
		var l = 0
		while( l < c.length )
		{
			option = document.createElement("option");
			option.text = c[l].name;
			option.value= c[l].value;
			el.add( option );
			l++;
		}
	}
	else
	(
		console.log("ERROR uiFillSelect null element name: " + name + " source: " + source )
	)
}
*/

function uiFillSelectCanonical( name, source, initialEmpty )
{
	var el = document.getElementById( name );
	var c = eval( source + ".contents");  //array

	
	if( el )
	{
		var option;
		if( initialEmpty )
		{
			option = document.createElement("option");
			option.text = "";
			option.value= "";
			el.add( option );
		}
	
		var l = 0;
		while( l < c.length )
		{
			option = document.createElement("option");
			option.text = c[l];
			option.value= l;
			el.add( option );
			l++;
		}
	}
	else
	(
		console.log("ERROR uiFillSelectCanonical null element name: " + name + " source: " + source )
	)
}


function uiGetTextValue( name )
{
	var ti = document.getElementById( name );
	var val = null;
	
	if( ti )
	{
		val = ti.value;
	}
	else
	(
		console.log("ERROR uiGetTextValue null element name:" + name )
	)
	return val;
}


function setVariables( )
{
		var language = g_language;
		// Do not change the following, the order is important
		g_canonicalheadings.clear();
		g_canonicalheadings.add(g_properties.getProperty("headings.n."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.e."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.s."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.w."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.ne."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.se."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.sw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nne."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.ene."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.ese."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.sse."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.ssw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.wsw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.wnw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nnw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nbe."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nebn."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nebe."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.ebn."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.ebs."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.sebe."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.sebs."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.sbe."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.sbw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.swbs."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.swbw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.wbs."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.wbn."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nwbw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nwbn."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nbw."+language));
		g_canonicalheadings.add(g_properties.getProperty("headings.nearestdegree."+language));

		// Do not change the following, the order is important
		g_canonicalcoordsystems.clear();
		g_canonicalcoordsystems.add(g_properties.getProperty("coordsys.dd."+language));
		g_canonicalcoordsystems.add(g_properties.getProperty("coordsys.dms."+language));
		//g_canonicalcoordsystems.add(g_properties.getProperty("coordsys.dd."+language));
		g_canonicalcoordsystems.add(g_properties.getProperty("coordsys.ddm."+language));

		// Do not change the following, the order is important
		g_canonicalloctypes.clear();
		g_canonicalloctypes.add(g_properties.getProperty("loctype.coordonly."+language));
		g_canonicalloctypes.add(g_properties.getProperty("loctype.namedplaceonly."+language));
		g_canonicalloctypes.add(g_properties.getProperty("loctype.distanceonly."+language));
		g_canonicalloctypes.add(g_properties.getProperty("loctype.distalongpath."+language));
		g_canonicalloctypes.add(g_properties.getProperty("loctype.orthodist."+language));
		g_canonicalloctypes.add(g_properties.getProperty("loctype.distatheading."+language));

		// Do not change the following, the order is important
		g_canonicalcalctypes.clear();
		g_canonicalcalctypes.add(g_properties.getProperty("calctype.erroronly."+language));
		g_canonicalcalctypes.add(g_properties.getProperty("calctype.coordsanderror."+language));
		g_canonicalcalctypes.add(g_properties.getProperty("calctype.coordsonly."+language));

		// Do not change the following, the order is important
		g_canonicalsources.clear();
		g_canonicalsources.add(g_properties.getProperty("coordsource.gaz."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.gem."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.gps."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.loc."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs250000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs100000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs63360."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs62500."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs25000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs24000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs12000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs10000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs4800."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs2400."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.usgs1200."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.ntsa250000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.ntsb250000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.ntsc250000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.ntsa50000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.ntsb50000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.ntsc50000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non3000000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non2500000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non1000000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non500000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non250000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non200000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non180000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non150000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non125000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non100000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non80000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non62500."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non60000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non50000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non40000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non32500."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non25000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non20000."+language));
		g_canonicalsources.add(g_properties.getProperty("coordsource.non10000."+language));

		g_canonicalddprec.clear();
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.degree."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.cp_01."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.cp_001."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.cp_0001."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.cp_00001."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.cp_000001."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.half."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.quarter."+language));
		g_canonicalddprec.add(g_properties.getProperty("coordprec.dd.exact."+language));

		g_canonicaldmsprec.clear();
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.degree."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_30m."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_10m."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_5m."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_1m."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_30s."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_10s."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_5s."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_1s."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_01s."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.cp_001s."+language));
		g_canonicaldmsprec.add(g_properties.getProperty("coordprec.dms.exact."+language));

		g_canonicalddmprec.clear();
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.degree."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_30m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_10m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_5m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_1m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_01m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_001m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.cp_0001m."+language));
		g_canonicalddmprec.add(g_properties.getProperty("coordprec.ddm.exact."+language));
	}	
	
	
	function uiGetSelectedText( name )
	{
		var el = document.getElementById( name );
		var returnVal = null;
		if( el )
		{
			returnVal = el.options[el.selectedIndex].text;
		}
		else
		(
			console.log("ERROR uiGetSelectedText null element name: " + name  )
		)
		
		return returnVal;
	}

	function uiGetSelectedValue( name )
	{
		var el = document.getElementById( name );
		var returnVal = null;
		if( el )
		{
			returnVal = el.options[el.selectedIndex].text;
		}
		else
		(
			console.log("ERROR uiGetSelectedValue null element name: " + name  )
		)
		
		return returnVal;
	}
	
	function uiGetSelectIndexValue( name, index )
	{
		var el = document.getElementById( name );
		var returnVal = null;
		if( el &&  index !== null)
		{
			returnVal = el.options[index].text;
		}
		
		if( el == null|| returnVal == null )
		(
			console.log("ERROR uiGetSelectIndexValue null element or index name: " + name + " index: " + index )
		)
		
		return returnVal;
	
	}
	
	function uiGetSelectedIndex( name )
	{
		var el = document.getElementById( name );
		var returnVal = null;
		if( el )
		{
			returnVal = el.selectedIndex;
		}
		else
		(
			console.log("ERROR uiGetSelectedIndex null element name: " + name  )
		)
		return returnVal;
	}

	function uiSetSelectedValue( name, value )
	{
		var el = document.getElementById( name );
		var returnVal = -1;
		if( el )
		{
			for( var i = 0; i < el.length; i ++ )
			{
				if( el.options[ i ].text == value )
				{
					returnVal = i;
					el.selectedIndex = i;
					
					i = el.length;
				}
			}
		}
		else
		(
			console.log("ERROR uiSetSelectedValue null element name: " + name  + " value: " + value )
		)

		if( returnVal == -1 )
		(
			console.log("ERROR uiSetSelectedValue value not found in options: " + name  + " value: " + value )
		)

		return returnVal;
	}
	
	function uiSetSelectedIndex( name, index )
	{
		var el = document.getElementById( name );
		if( el )
		{
			el.selectedIndex = index;
		}
		else
		(
			console.log("ERROR uiSetSelectedIndex null element name: " + name  )
		)
	}
	
	
	
	function onCalcTypeSelect()
	{
		cleanCalcTypeSlate();
		var value = uiGetSelectedText( "ChoiceCalcType" );
		if( value == "" )
		{
			uiShowElement( "LabelStepZero" );
			uiHideElement( "LabelTitle" );
			setVisibility( "ChoiceModel", false );
			setVisibility( "LabelModel", false );
			
			uiHideElement( "LabelStepOne" );
			return;
		}
		else
		{
			uiHideElement( "LabelStepZero" );
			uiShowElement( "LabelTitle" );
			uiShowElement( "LabelStepOne" );
			
			setVisibility( "ChoiceModel", true );
			setVisibility( "LabelModel", true );	
		}

		uiClearSelect( "ChoiceModel" );
		uiSelectAddEmptyItem("ChoiceModel");

		var index = g_canonicalcalctypes.indexOf( value );
		
		if( index==0 )
		{
			uiSelectAddItem("ChoiceModel", "loctype.coordonly");
			uiSelectAddItem("ChoiceModel", "loctype.namedplaceonly");
			uiSelectAddItem("ChoiceModel", "loctype.distanceonly");
			uiSelectAddItem("ChoiceModel", "loctype.distalongpath");
			uiSetLabel("lblT2Dec_Lat","label.lat");
			uiSetLabel("lblT2Dec_Long","label.lon");
		}
		uiSelectAddItem("ChoiceModel", "loctype.orthodist" );
		uiSelectAddItem("ChoiceModel", "loctype.distatheading" );
		uiSetSelectedIndex("ChoiceModel", 0 );
	}

	function onCoordSourceSelect()
	{
		var model = uiGetSelectedText("ChoiceModel");
		newModelChosen( model );
		clearResults();
	}


	function onDatumSelect()
	{
		clearResults();
	}

	function onDirectionSelect()
	{
		clearResults();
		var value = uiGetSelectedText("ChoiceCalcType");
		
		if( value == "" )
		{
			var do_nothing=true;
		}
		else
		{
			var index = g_canonicalcalctypes.indexOf(value);
			if( index==0 )  //Error Only
			{
				showDirectionPrecision(true);
			}
			else
			{
				showDirection(true);
			}
		}
	}

	function onDistancePrecisionSelect()
	{	
		clearResults();
	}

	function onDistUnitsSelect()
	{
		var value = uiGetSelectedText("ChoiceDistUnits");
		clearResults();
		populateDistancePrecision(value);
	}

	function onLatDirDMSSelect()
	{
		var value = uiGetSelectedText("ChoiceLatDirDMS");
		clearResults();
		uiSetSelectedValue("ChoiceLatDirMM", value);
	}

	function onLatDirMMSelect()
	{
		var value = uiGetSelectedText("ChoiceLatDirMM");
		clearResults();
		uiSetSelectedValue("ChoiceLatDirDMS", value);
	}

	function onLatPrecisionSelect()
	{
		clearResults();
	}

	function onLongDirDMSSelect()
	{
		clearResults();
		var value = uiGetSelectedText("ChoiceLongDirDMS");
		uiSetSelectedValue("ChoiceLongDirMM",value);
	}

	function onLongDirMMSelect()
	{
		clearResults();
		var value = uiGetSelectedText("ChoiceLongDirMM");
		uiSetSelectedValue("ChoiceLongDirDMS",value);
	}

	function newLanguageChosen( ){

		//NOTE: original Java data types, for reference and debugging
		//double m, latminmm, longminmm, extent, measurementerror, latsec, longsec;
		//double offset, offsetew, heading;
		//int latdirindex, longdirindex, offsetdirnsindex, offsetdirewindex;
		//int datumindex, latprecindex, loctypeindex, calctypeindex;
		//int coordsystemindex, latdirmmindex, longdirmmindex, distunitsindex;
		//int distprecindex, coordsourceindex, directionindex;		
		var m, latminmm, longminmm, extent, measurementerror, latsec, longsec;
		var offset, offsetew, heading;
		var latdirindex, longdirindex, offsetdirnsindex, offsetdirewindex;
		var datumindex, latprecindex, loctypeindex, calctypeindex;
		var coordsystemindex, latdirmmindex, longdirmmindex, distunitsindex;
		var distprecindex, coordsourceindex, directionindex;
		

		latdirindex=uiGetSelectedIndex( "ChoiceLatDirDMS" );
		longdirindex=uiGetSelectedIndex( "ChoiceLongDirDMS" );
		latdirmmindex=uiGetSelectedIndex( "ChoiceLatDirMM" );
		longdirmmindex=uiGetSelectedIndex( "ChoiceLongDirMM" );
		offsetdirnsindex=uiGetSelectedIndex( "ChoiceOffsetNSDir" );
		offsetdirewindex=uiGetSelectedIndex( "ChoiceOffsetEWDir" );
		latprecindex=uiGetSelectedIndex( "ChoiceLatPrecision" );
		datumindex=uiGetSelectedIndex( "ChoiceDatum" );
		calctypeindex=uiGetSelectedIndex( "ChoiceCalcType" );
		loctypeindex=uiGetSelectedIndex( "ChoiceModel" );
		coordsourceindex=uiGetSelectedIndex( "ChoiceCoordSource" );
		coordsystemindex=uiGetSelectedIndex( "ChoiceCoordSystem" );
		distunitsindex=uiGetSelectedIndex( "ChoiceDistUnits" );
		distprecindex=uiGetSelectedIndex( "ChoiceDistancePrecision" );
		directionindex=uiGetSelectedIndex( "ChoiceDirection" );


		var num = null;
		
		var s = uiGetTextValue("txtT7Lat_MinMM");
		

		if( s == null || s.length == 0 ){
			m = 0;
		}
		else
		{
			num = formatMinMM.checkFormat(s);  
			m = num; //.doubleValue();
		}
		latminmm=m;

		s = uiGetTextValue("txtT7Long_MinMM");
		if( s == null || s.length == 0 )
		{
			m = 0;
		}
		else
		{
			num = formatMinMM.checkFormat(s);  
			m = num; //.doubleValue();
		}
		longminmm=m;

		s = uiGetTextValue("txtT7Lat_Sec");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatSec.checkFormat(s);  
			m = num; //.doubleValue();
		}
		latsec=m;

		s = uiGetTextValue("txtT7Long_Sec");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatSec.checkFormat(s);  
			m = num; //.doubleValue();
		}
		longsec=m;

		s = uiGetTextValue("TextFieldExtent");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s);;  
			m = num; //.doubleValue();
		}
		extent=m;

	
		s = uiGetTextValue("TextFieldMeasurementError");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s);  
			m = num; //.doubleValue();
		}
		measurementerror=m;


		s = uiGetTextValue("TextFieldOffset");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s); 
			m = num; //.doubleValue();
		}
		offset=m;

		s = uiGetTextValue("TextFieldOffsetEW");;
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s); 
			m = num; //.doubleValue();
		}
		offsetew=m;

		s = uiGetTextValue("TextFieldHeading");;
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s);   
			m = num; //.doubleValue();
		}
		heading=m;


		var language = g_language;
		clearResults();
		setVariables(language);
		setLabels();		
		
		//TODO add me back in when we start doing formatters
		//setDecimalFormat();
		
		var ci = uiGetSelectedIndex("ChoiceCalcType");
		var mi = uiGetSelectedIndex("ChoiceModel");
		populateStableControls();
		uiSetSelectedIndex("ChoiceCalcType", ci);

		uiClearSelect("ChoiceModel");
		uiSelectAddEmptyItem("ChoiceModel");
	
		if( calctypeindex>0 )
		{
			if( calctypeindex==2 ){
				uiSelectAddItem("ChoiceModel","loctype.coordonly");
				uiSelectAddItem("ChoiceModel","loctype.namedplaceonly");
				uiSelectAddItem("ChoiceModel","loctype.distanceonly");
				uiSelectAddItem("ChoiceModel","loctype.distalongpath");
				
				uiSetLabel( "lblT2Dec_Lat","label.lat");
				uiSetLabel( "lblT2Dec_Long","label.lon");
				
			}
			uiSelectAddItem("ChoiceModel","loctype.orthodist");
			uiSelectAddItem("ChoiceModel","loctype.distatheading");
		}
		uiSetSelectedIndex("ChoiceModel", mi);
		
		if(coordsystemindex==2){
			populateCoordinatePrecision(g_properties.getPropertyLang("coordsys.dms"));
		} else if(coordsystemindex==0){
			populateCoordinatePrecision(g_properties.getPropertyLang("coordsys.dd"));			
		} else {
			populateCoordinatePrecision(g_properties.getPropertyLang("coordsys.ddm"));
		}
		
		populateDistancePrecision(uiGetSelectIndexValue("ChoiceDistUnits",distunitsindex));


		uiSetTextExplicit("txtT2Dec_Lat", formatDec.checkFormat( decimallatitude ) );
		uiSetTextExplicit("txtT2Dec_Long", formatDec.checkFormat( decimallongitude ) );
		uiSetTextExplicit("txtT7Lat_MinMM",formatMinMM.checkFormat( latminmm ) );
		uiSetTextExplicit("txtT7Long_MinMM",formatMinMM.checkFormat( longminmm ) );
		uiSetTextExplicit("txtT7Lat_Sec",formatSec.checkFormat( latsec ) );
		uiSetTextExplicit("txtT7Long_Sec",formatSec.checkFormat( longsec ) );
		uiSetTextExplicit("TextFieldExtent",formatCalcError.checkFormat( extent ) );
		uiSetTextExplicit("TextFieldMeasurementError",formatCalcError.checkFormat( measurementerror ) );
		uiSetTextExplicit("TextFieldFromDistance",formatDistance.checkFormat( fromdistance ) );
		uiSetTextExplicit("TextFieldToDistance",formatDistance.checkFormat( todistance ) );
		uiSetTextExplicit("TextFieldScaleFromDistance",formatDistance.checkFormat( scalefromdistance ) );
		uiSetTextExplicit("TextFieldScaleToDistance",formatDistance.checkFormat( scaletodistance ) );
		uiSetTextExplicit("TextFieldOffset",formatCalcError.checkFormat( offset ) );
		uiSetTextExplicit("TextFieldOffsetEW",formatCalcError.checkFormat( offsetew ) );
		uiSetTextExplicit("TextFieldHeading",formatCalcError.checkFormat( heading ) );

		if(calctypeindex >= 0)
		{
			uiSetSelectedIndex("ChoiceCalcType", calctypeindex );
		}
		if(loctypeindex >= 0)
		{
			uiSetSelectedIndex("ChoiceModel",loctypeindex);
		}
		

		
		if( uiGetSelectedIndex("ChoiceModel") != 0 && 
			uiGetSelectedText( "ChoiceModel") ==
			g_properties.getPropertyLang("loctype.orthodist") )
		{
			uiSetLabel("LabelOffset", g_properties.getPropertyLang("label.distns"));
		}
		
		if(coordsourceindex >= 0)
		{
			uiSetSelectedIndex("ChoiceCoordSource",coordsourceindex);
		}
		if(coordsystemindex >= 0)
		{
			uiSetSelectedIndex("ChoiceCoordSystem",coordsystemindex);
		}
		if(latdirindex >= 0)
		{
			uiSetSelectedIndex("ChoiceLatDirDMS",latdirindex);
		}
		if(longdirindex >= 0)
		{
			uiSetSelectedIndex("ChoiceLongDirDMS",longdirindex);
		}
		if(latdirmmindex >= 0)
		{
			uiSetSelectedIndex("ChoiceLatDirMM",latdirmmindex);
		}
		if(longdirmmindex >= 0)
		{
			uiSetSelectedIndex("ChoiceLongDirMM",longdirmmindex);
		}
		if(datumindex >= 0)
		{
			uiSetSelectedIndex("ChoiceDatum",datumindex);
		}
		if(latprecindex >= 0)
		{
			uiSetSelectedIndex("ChoiceLatPrecision",latprecindex);
		}
		if(offsetdirnsindex >= 0)
		{
			uiSetSelectedIndex("ChoiceOffsetNSDir",offsetdirnsindex);
		}
		if(offsetdirewindex >= 0)
		{
			uiSetSelectedIndex("ChoiceOffsetEWDir",offsetdirewindex);
		}
		if(distunitsindex >= 0)
		{
			uiSetSelectedIndex("ChoiceDistUnits",distunitsindex);
		}
		if(distprecindex >= 0)
		{
			uiSetSelectedIndex("ChoiceDistancePrecision",distprecindex);
		}
		if(directionindex >= 0)
		{
			uiSetSelectedIndex("ChoiceDirection",directionindex);
		}
		
	}


	function onModelSelect( )
	{
		var value = uiGetSelectedText("ChoiceModel");
		newModelChosen(value);
	}
	

	//BEGIN Scale and distance converter control selects
	function onFromDistUnitsSelect()
	{
		convertDistance();
	}
	
	function onToDistUnitsSelect()
	{
		convertDistance();
	}

	function onScaleFromDistUnitsSelect()
	{
		convertScale();
	}
	
	function onScaleToDistUnitsSelect()
	{
		convertScale();
	}
	
	
	function onScaleConvertKeyUp()
	{
			convertScale();
	}
	
	function onDistConvertKeyUp()
	{
			convertDistance();
	}
	
	function onScaleSelect()
	{
		convertScale();
	}
	//END Scale and distance converter control selects

	
	function newModelChosen( value )
	{	
		if( value == "" )
		{
			cleanSlate();
			uiShowElement("LabelTitle");
			uiHideElement("LabelStepZero");
			return;
		}

		showResults(false);
		clearResults();
		showOffset(false);
		
		uiHideElement("LabelStepOne");
		uiShowElement("LabelStepTwo");
		
		showDistancePrecision(false);
		showDirectionPrecision(false);
		setVisibility("ButtonCalculate",false);
		setVisibility("ButtonPromote",false);
		
		showNSOffset(false);
		showEWOffset(false);
		
		uiHideElement( "TextFieldHeading" );
		
		showCoordinateSystem(true);
		showCoordinateSource(true);
		showDistanceUnits(true);
		showCoordinatePrecision(true);
		showExtents(true);
		showMeasurementError(true);
		showErrors(true);
		showRelevantCoordinates();
		
		uiSetLabel("LabelOffset","label.offset");
		uiSetLabel("LabelExtent","label.extent");
		uiSetLabel("LabelMeasurementError","label.measurementerror");
		var value = uiGetSelectedText("ChoiceModel");
		var index = g_canonicalloctypes.indexOf(value);
		var csource = uiGetSelectedText("ChoiceCoordSource");

		var cindex = g_canonicalsources.indexOf(csource);
		if( cindex==2 ){ // GPS
			uiSetLabel("LabelMeasurementError","label.extent.gps");
		} else {
			uiSetLabel("LabelMeasurementError","label.measurementerror");
		}

		if( index==0 ){ // Coordinates only
			showExtents(false);
		} else if( index==2 ){ // Distance only
			showOffset(true);
			showDistancePrecision(true);
		} else if( index==3 ){ // Distance along path
			showDistancePrecision(true);
		} else if( index==4 ){ // Distance along orthogonal directions
			var SCalcType = uiGetSelectedText("ChoiceCalcType");
			var calcindex = g_canonicalcalctypes.indexOf(SCalcType);
			
			if( calcindex==0 ){ // Error only
				showNSOffset(true);
				showEWOffset(true);
				showDistancePrecision(true);
			}else if( calcindex==1 ){ // Coordinates and error
				showNSOffset(true);
				showEWOffset(true);
				showDistancePrecision(true);
			} else if ( calcindex == 2 ){ // Coordinates only Calculation Type
				showNSOffset(true);
				showEWOffset(true);
				showDistancePrecision(false);
				showCoordinatePrecision(false);
				showDirectionPrecision(false);
				showExtents(false);
				showMeasurementError(false);
				showErrors(false);
			}
		} else if( index==5 ){ // Distance at a heading
			showOffset(true);
			var SCalcType = uiGetSelectedText("ChoiceCalcType");
			var calcindex = g_canonicalcalctypes.indexOf(SCalcType);
			if( calcindex==1 ){ // Coordinates and error
				showDistancePrecision(true);
				showDirection(true);
			} else if( calcindex==0 ){ // Error only
				showDistancePrecision(true);
				showDirectionPrecision(true);
			} else if ( calcindex == 2){ // Coordinates only
				showDirection(true);
			}
		}
		setVisibility( "LabelDatum", true );
		setVisibility( "ChoiceDatum", true );

		setVisibility("ButtonCalculate",true);
		setVisibility("ButtonPromote",true);
		showResults(true);
	}

	function onOffsetEWDirSelect()
	{
		clearResults();
	}

	function onOffsetNSDirSelect()
	{
		clearResults();
	}


	function onCoordSystemSelect( )
	{
		var value = uiGetSelectedText("ChoiceCoordSystem");
		lastcoordsystem = g_canonicalcoordsystems.indexOf( value );
		lastcoordsystem = lastcoordsystem  + 1;
		clearResults();
		showRelevantCoordinates();
		populateCoordinatePrecision(value);
		
		testLatLongLimits();
		translateCoords();
	}


	function cleanCalcTypeSlate(){
		cleanSlate();

		setVisibility("ChoiceModel", false );
		setVisibility("LabelModel", false );
		setVisibility("LabelTitle", false );
		//
		setVisibility("LabelStepZero", false );
		setVisibility("LabelStepOne", false );
		setVisibility("LabelStepTwo", false );
		
	}

	function cleanSlate()
	{
		showCoordinates(false);
		showCoordinateSource(false);
		showCoordinateSystem(false);
		showCoordinatePrecision(false);
		showDistancePrecision(false);
		showDistanceUnits(false);
		showDirectionPrecision(false);
		showResults(false);
		showExtents(false);
		showMeasurementError(false);
		
		//showDistanceConverter(false);
		//showScaleConverter(false);
		
		showOffset(false);
		showNSOffset(false);
		showEWOffset(false);

		setVisibility("TextFieldOffsetEW", false);
		setVisibility("ChoiceOffsetEWDir", false);
		uiHideElement("ChoiceOffsetNSDir");
		uiHideElement("TextFieldHeading");
		setVisibility("LabelOffsetEW", false);
		
		setVisibility("ButtonCalculate", false);
		setVisibility("ButtonPromote", false);
		
		uiHideElement("LabelTitle" );
		uiShowElement("LabelStepZero" );
	
		uiHideElement("LabelStepTwo");
		uiHideElement("LabelStepOne");
		
		setVisibility("LabelModel", false);
		setVisibility("ChoiceModel", false);		
	}

	function clearResults()
	{
		uiEmptyTextElement( "TextFieldCalcDecLat" );
		uiEmptyTextElement( "TextFieldCalcDecLong" );
		uiEmptyTextElement( "TextFieldCalcErrorDist" );
		uiEmptyTextElement( "TextFieldCalcErrorUnits" );
		uiEmptyTextElement( "TextFieldFullResult" );
	}



	function setLabels( ){
		var language = g_language;
		var version = g_versionNumber;
		var v = g_properties.getPropertyLang("version")+" " + version + language;
		uiSetLabelExplicit("LabelVersion", v);
		
		uiSetLabel("LabelCalcType", "label.calctype");
		uiSetLabel("LabelStepZero","label.step0");
		uiSetLabel("LabelTitle","label.title");
		uiSetLabel("LabelModel","label.loctype");
		uiSetLabel("LabelStepOne","label.step1");
		uiSetLabel("LabelStepTwo","label.step2");
		uiSetLabel("LabelCoordSource","label.coordsource");
		uiSetLabel("LabelCoordSystem","label.coordsys");
		uiSetLabel("lblT2Dec_Lat","label.lat");
		uiSetLabel("lblT2Dec_Long","label.lon");
		uiSetLabel("LabelDatum","label.datum");
		uiSetLabel("LabelLatPrecision","label.coordprec");
		uiSetLabel("LabelOffsetEW","label.distew");
		uiSetLabel("LabelOffset","label.offset");
		uiSetLabel("LabelExtent","label.extent");
		uiSetLabel("LabelMeasurementError","label.measurementerror");
		uiSetLabel("LabelDistUnits","label.distunits");
		uiSetLabel("LabelDistancePrecision","label.distprec");
		
		uiSetLabel("LabelDirection","label.direction");
		uiSetLabel("LabelCalcDecLat","label.declat");
		uiSetLabel("LabelCalcDecLong","label.declon");
		uiSetLabel("LabelCalcMaxError","label.maxerrdist");

		uiSetLabelExplicit("ButtonCalculate",g_properties.getPropertyLang("label.calculate"));
		uiSetLabelExplicit("ButtonPromote",g_properties.getPropertyLang("label.promote"));
		
		
		uiSetLabel("LabelDistanceConverter","label.distanceconverter");
		uiSetLabel("LabelScaleConverter","label.scaleconverter");
	
	}
	

	function getCoordPrecisionError()
	{
		var latprecision = uiGetSelectedText("ChoiceLatPrecision");
		
		if( latprecision == g_properties.getPropertyLang("coordprec.dd.exact")) 
		{
			return 0.0;
		}

		// Assume coordinate precision is the same in both latitude and longitude.
		// Also assume that precision of one degree corresponds to the distance
		// in one degree of both latitude and longitude from the given latitude
		// and longitude.
		calculateLatLongMetersPerDegree();
		
		//double error = Math.sqrt( Math.pow(latmetersperdegree,2.0) + Math.pow(longmetersperdegree,2.0) );
		var error = Math.sqrt( Math.pow(latmetersperdegree,2.0) + Math.pow(longmetersperdegree,2.0) );

		//String distunitsstr = (String)ChoiceDistUnits.getSelectedItem();
		var distunitsstr = uiGetSelectedText("ChoiceDistUnits");
		error = convertFromMetersTo( error, distunitsstr );

		if( latprecision == g_properties.getPropertyLang("coordprec.dd.degree") )
		{
			//"nearest degree"
			error *= 1.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.cp_01") )
		{
			//"0.1 degrees
			error *= 0.1;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.cp_001") )
		{
			//"0.01 degrees"
			error *= 0.01;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.cp_0001") )
		{
			//"0.001 degrees"
			error *= 0.001;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.cp_00001") )
		{
			//"0.0001 degrees"
			error *= 0.0001;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.cp_000001") )
		{
			//"0.00001 degrees"
			error *= 0.00001;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.half") )
		{
			//"nearest 1/2 degree"
			error *= 0.5;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dd.quarter") )
		{
			//"nearest 1/4 degree"
			error *= 0.25;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_30m") )
		{
			//"nearest 30 minutes"
			error *= 0.5;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_10m") )
		{
			//"nearest 10 minutes"
			error /= 6.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_5m") )
		{
			//"nearest 5 minutes"
			error /= 12.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_1m") )
		{
			//"nearest minute"
			error /= 60.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_30s") )
		{
			//"nearest 30 seconds"
			error /= 120.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_10s") )
		{
			//"nearest 10 seconds"
			error /= 360.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_5s") )
		{
			//"nearest 5 seconds"
			error /= 720.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_1s") )
		{
			//"nearest second"
			error /= 3600.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_01s") )
		{
			//"0.1 seconds"
			error /= 36000.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.dms.cp_001s") )
		{
			//"0.01 seconds"
			error /= 360000.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.ddm.cp_1m") )
		{
			//"1 minute"
			error /= 60.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.ddm.cp_01m") )
		{
			//"0.1 minutes"
			error /= 600.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.ddm.cp_001m") )
		{
			//"0.01 minutes"
			error /= 6000.0;
		}
		else if( latprecision == g_properties.getPropertyLang("coordprec.ddm.cp_0001m") )
		{
			//"0.001 minutes"
			error /= 60000.0;
		}
		return error;
	}

	

function onBodyKeyUp( e  )
{
	if( e.keyIdentifier == "Enter" && uiIsVisible("ButtonCalculate") )
	{
		ButtonCalculate_afterActionPerformed();
	}
	else if( e.srcElement.localName.toLowerCase() == "input" )
	{
		if( uiIsVisible("ButtonCalculate" ) && e.keyCode !== 9 )
		{
			var src = e.srcElement
			var id = src.id
			var clear = true;
			
			if( id == "TextFieldFromDistance" || id == "TextFieldScaleFromDistance" || src.readOnly )
			{
				clear = false
			}
			
			if( clear )
			{
				clearResults();
			}
		}
	}
	else if( e.keyIdentifier == "U+0044" && e.shiftKey == true && e.ctrlKey == true && e.altKey == true  )
	//FIXME    || ( put mac equiv logic in here  )
	{
		downloadTests();
	}
}

	// Populate the Coordinate Precision Controls based on the Coordinate System
	function populateCoordinatePrecision( system )
	{
		uiClearSelect("ChoiceLatPrecision");
		
		var index = g_canonicalcoordsystems.indexOf(system);
		if( index==0 ){
			for( var i=0;i<g_canonicalddprec.size();i++){
				uiSelectAddExplicitItem("ChoiceLatPrecision", g_canonicalddprec.get(i));
			}
			uiSetSelectedValue("ChoiceLatPrecision", g_properties.getPropertyLang("coordprec.dd.degree"));
		} else if( index==1 ){
			for( var i=0;i<g_canonicaldmsprec.size();i++){
				uiSelectAddExplicitItem("ChoiceLatPrecision", g_canonicaldmsprec.get(i));
			}
			uiSetSelectedValue("ChoiceLatPrecision", g_properties.getPropertyLang("coordprec.dms.degree"));
		} else if( index==2 ){
			for( var i=0;i<g_canonicalddmprec.size();i++){
				uiSelectAddExplicitItem("ChoiceLatPrecision", g_canonicalddmprec.get(i));
			}
			uiSetSelectedValue("ChoiceLatPrecision", g_properties.getPropertyLang("coordprec.ddm.degree"));
		}
	}

	function populateDistancePrecision( units )
	{
		uiClearSelect("ChoiceDistancePrecision");
		uiSelectAddExplicitItem("ChoiceDistancePrecision","100 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","10 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1/2 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1/3 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1/4 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1/8 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1/10 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision","1/100 " + units );
		uiSelectAddExplicitItem("ChoiceDistancePrecision", g_properties.getPropertyLang("coordprec.dd.exact") );
		uiSetSelectedValue("ChoiceDistancePrecision", "1 " + units );
	}


	function populateStableControls()
	{
		uiClearSelect( "ChoiceCalcType" );
		uiSelectAddEmptyItem("ChoiceCalcType");
		uiSelectAddItem("ChoiceCalcType", "calctype.coordsanderror");
		uiSelectAddItem("ChoiceCalcType", "calctype.erroronly");
		uiSelectAddItem("ChoiceCalcType","calctype.coordsonly");
		uiSetSelectedIndex("ChoiceCalcType",0);

		// Coordinate System controls
		//order is important
		uiClearSelect( "ChoiceCoordSystem");
		uiSelectAddItem("ChoiceCoordSystem","coordsys.dd");
		uiSelectAddItem("ChoiceCoordSystem","coordsys.ddm");
		uiSelectAddItem("ChoiceCoordSystem","coordsys.dms");
		
		uiSetSelectedValue("ChoiceCoordSystem", g_properties.getPropertyLang("coordsys.dd" ));
		uiSetSelectedIndex("ChoiceCoordSystem",1);
		// Coordinate Source controls
		var csi = uiSetSelectedIndex("ChoiceCoordSource")
		uiClearSelect("ChoiceCoordSource");
		for( var i=0; i< g_canonicalsources.contents.length; i++){
			uiSelectAddExplicitItem("ChoiceCoordSource", g_canonicalsources.contents[i] )
		}

		uiSetSelectedIndex("ChoiceCoordSource", csi );


		// Datum controls
		uiClearSelect("ChoiceDatum");
		uiSelectAddItem("ChoiceDatum","datum.notrecorded");

		uiSelectAddExplicitItem("ChoiceDatum","(WGS84) World Geodetic System 1984");
		uiSelectAddExplicitItem("ChoiceDatum","(NAD83) North American 1983");
		uiSelectAddExplicitItem("ChoiceDatum","(NAD27) North American 1927");

		uiSelectAddExplicitItem("ChoiceDatum","Adindan");
		uiSelectAddExplicitItem("ChoiceDatum","Afgooye");
		uiSelectAddExplicitItem("ChoiceDatum","Ain el Abd 1970");
		uiSelectAddExplicitItem("ChoiceDatum","Airy 1830 ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","American Samoa 1962");
		uiSelectAddExplicitItem("ChoiceDatum","Anna 1 Astro 1965");
		uiSelectAddExplicitItem("ChoiceDatum","Antigua Island Astro 1943");
		uiSelectAddExplicitItem("ChoiceDatum","Arc 1950");
		uiSelectAddExplicitItem("ChoiceDatum","Arc 1960");
		uiSelectAddExplicitItem("ChoiceDatum","Ascension Island 1958");
		uiSelectAddExplicitItem("ChoiceDatum","Astro Beacon 'E' 1945");
		uiSelectAddExplicitItem("ChoiceDatum","Astro DOS 71/4");
		uiSelectAddExplicitItem("ChoiceDatum","Astro Tern Island (FRIG) 1961");
		uiSelectAddExplicitItem("ChoiceDatum","Astronomic Station No. 1 1951");
		uiSelectAddExplicitItem("ChoiceDatum","Astronomic Station No. 2 1951, Truk Island");
		uiSelectAddExplicitItem("ChoiceDatum","Astronomic Station Ponape 1951");
		uiSelectAddExplicitItem("ChoiceDatum","Astronomical Station 1952");
		uiSelectAddExplicitItem("ChoiceDatum","(AGD66) Australian Geodetic 1966");
		uiSelectAddExplicitItem("ChoiceDatum","(AGD84) Australian Geodetic 1984");
		uiSelectAddExplicitItem("ChoiceDatum","Australian National ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Ayabelle Lighthouse");
		uiSelectAddExplicitItem("ChoiceDatum","Bekaa Valley 1920 (IGN)");
		uiSelectAddExplicitItem("ChoiceDatum","Bellevue (IGN)");
		uiSelectAddExplicitItem("ChoiceDatum","Bermuda 1957");
		uiSelectAddExplicitItem("ChoiceDatum","Bessel 1841 ellipsoid (Namibia)");
		uiSelectAddExplicitItem("ChoiceDatum","Bessel 1841 ellipsoid (non-Namibia)");
		uiSelectAddExplicitItem("ChoiceDatum","Bissau");
		uiSelectAddExplicitItem("ChoiceDatum","Bogota Observatory");
		uiSelectAddExplicitItem("ChoiceDatum","Bukit Rimpah");
		uiSelectAddExplicitItem("ChoiceDatum","Campo Inchauspe");
		uiSelectAddExplicitItem("ChoiceDatum","Canton Astro 1966");
		uiSelectAddExplicitItem("ChoiceDatum","Cape");
		uiSelectAddExplicitItem("ChoiceDatum","Cape Canaveral");
		uiSelectAddExplicitItem("ChoiceDatum","Carthage");
		uiSelectAddExplicitItem("ChoiceDatum","Chatham Island Astro 1971");
		uiSelectAddExplicitItem("ChoiceDatum","Chua Astro");
		uiSelectAddExplicitItem("ChoiceDatum","Clarke 1858 ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Clarke 1866 ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Clarke 1880 ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Co-Ordinate System 1937 of Estonia");
		uiSelectAddExplicitItem("ChoiceDatum","Corrego Alegre");
		uiSelectAddExplicitItem("ChoiceDatum","Dabola");
		uiSelectAddExplicitItem("ChoiceDatum","Deception Island");
		uiSelectAddExplicitItem("ChoiceDatum","Djakarta (Batavia)");
		uiSelectAddExplicitItem("ChoiceDatum","DOS 1968");
		uiSelectAddExplicitItem("ChoiceDatum","Easter Island 1967");

		uiSelectAddExplicitItem("ChoiceDatum","European 1950");
		uiSelectAddExplicitItem("ChoiceDatum","European 1979");

		uiSelectAddExplicitItem("ChoiceDatum","Everest ellipsoid (Brunei, Sabah, Sarawak)");
		uiSelectAddExplicitItem("ChoiceDatum","Everest India 1830 ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Everest India 1856 ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Everest Pakistan ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Everest ellipsoid (W. Malaysia, Singapore 1948)");
		uiSelectAddExplicitItem("ChoiceDatum","Everest W. Malaysia 1969 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Fort Thomas 1955");
		uiSelectAddExplicitItem("ChoiceDatum","Gan 1970");
		uiSelectAddExplicitItem("ChoiceDatum","Geodetic Datum 1949");
		uiSelectAddExplicitItem("ChoiceDatum","Graciosa Base SW 1948");

		uiSelectAddExplicitItem("ChoiceDatum","GRS80 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Guam 1963");
		uiSelectAddExplicitItem("ChoiceDatum","Gunung Segara");
		uiSelectAddExplicitItem("ChoiceDatum","GUX 1 Astro");

		uiSelectAddExplicitItem("ChoiceDatum","Helmert 1906 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Hito XVIII 1963");
		uiSelectAddExplicitItem("ChoiceDatum","Hjorsey 1955");
		uiSelectAddExplicitItem("ChoiceDatum","Hong Kong 1963");

		uiSelectAddExplicitItem("ChoiceDatum","Hough 1960 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Hu-Tzu-Shan");
		uiSelectAddExplicitItem("ChoiceDatum","Indian");
		uiSelectAddExplicitItem("ChoiceDatum","Indian 1954");
		uiSelectAddExplicitItem("ChoiceDatum","Indian 1960");
		uiSelectAddExplicitItem("ChoiceDatum","Indian 1975");
		uiSelectAddExplicitItem("ChoiceDatum","Indonesian 1974");

		uiSelectAddExplicitItem("ChoiceDatum","International 1924 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Ireland 1965");
		uiSelectAddExplicitItem("ChoiceDatum","ISTS 061 Astro 1968");
		uiSelectAddExplicitItem("ChoiceDatum","ISTS 073 Astro 1969");
		uiSelectAddExplicitItem("ChoiceDatum","Japanese Geodetic Datum 2000");
		uiSelectAddExplicitItem("ChoiceDatum","Johnston Island 1961");
		uiSelectAddExplicitItem("ChoiceDatum","Kandawala");
		uiSelectAddExplicitItem("ChoiceDatum","Kapingamarangi Astronomic Station No. 3 1951");
		uiSelectAddExplicitItem("ChoiceDatum","Kerguelen Island 1949");
		uiSelectAddExplicitItem("ChoiceDatum","Kertau 1948");
		uiSelectAddExplicitItem("ChoiceDatum","Korean Geodetic System 1995");

		uiSelectAddExplicitItem("ChoiceDatum","Krassovsky 1940 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Kusaie Astro 1951");
		uiSelectAddExplicitItem("ChoiceDatum","L.C. 5 Astro 1961");
		uiSelectAddExplicitItem("ChoiceDatum","Leigon");
		uiSelectAddExplicitItem("ChoiceDatum","Lemuta");
		uiSelectAddExplicitItem("ChoiceDatum","Liberia 1964");
		uiSelectAddExplicitItem("ChoiceDatum","Luzon");
		uiSelectAddExplicitItem("ChoiceDatum","Mahe 1971");
		uiSelectAddExplicitItem("ChoiceDatum","Massawa");
		uiSelectAddExplicitItem("ChoiceDatum","Merchich");
		uiSelectAddExplicitItem("ChoiceDatum","Midway Astro 1961");
		uiSelectAddExplicitItem("ChoiceDatum","Minna");

		uiSelectAddExplicitItem("ChoiceDatum","Modified Airy ellipsoid");
		uiSelectAddExplicitItem("ChoiceDatum","Modified Fischer 1960 ellipsoid");

		uiSelectAddExplicitItem("ChoiceDatum","Montserrat Island Astro 1958");
		uiSelectAddExplicitItem("ChoiceDatum","M'Poraloko");
		uiSelectAddExplicitItem("ChoiceDatum","Nahrwan");
		uiSelectAddExplicitItem("ChoiceDatum","Naparima, BWI");
		uiSelectAddExplicitItem("ChoiceDatum","Naparima 1972");
		uiSelectAddExplicitItem("ChoiceDatum","North Sahara 1959");
		uiSelectAddExplicitItem("ChoiceDatum","Observatorio Meteorologico 1939");
		uiSelectAddExplicitItem("ChoiceDatum","Ocotepeque 1935");
		uiSelectAddExplicitItem("ChoiceDatum","Old Egyptian 1907");
		uiSelectAddExplicitItem("ChoiceDatum","Old Hawaiian, Clarke 1866");
		uiSelectAddExplicitItem("ChoiceDatum","Old Hawaiian, International 1924");
		uiSelectAddExplicitItem("ChoiceDatum","Old Trinidad 1903");
		uiSelectAddExplicitItem("ChoiceDatum","Oman");
		uiSelectAddExplicitItem("ChoiceDatum","Ordnance Survey of Great Britain 1936");
		uiSelectAddExplicitItem("ChoiceDatum","Pico de las Nieves");
		uiSelectAddExplicitItem("ChoiceDatum","Pitcairn Astro 1967");
		uiSelectAddExplicitItem("ChoiceDatum","Point 58");
		uiSelectAddExplicitItem("ChoiceDatum","Point Noire 1958");
		uiSelectAddExplicitItem("ChoiceDatum","Porto Santo 1936");
		uiSelectAddExplicitItem("ChoiceDatum","Provisional South American 1956");
		uiSelectAddExplicitItem("ChoiceDatum","Provisional South Chilean 1963");
		uiSelectAddExplicitItem("ChoiceDatum","Puerto Rico");
		uiSelectAddExplicitItem("ChoiceDatum","Qatar National");
		uiSelectAddExplicitItem("ChoiceDatum","Qornoq");
		uiSelectAddExplicitItem("ChoiceDatum","Reunion");
		uiSelectAddExplicitItem("ChoiceDatum","Rome 1940");
		uiSelectAddExplicitItem("ChoiceDatum","S-42 (Pulkovo 1942)");
		uiSelectAddExplicitItem("ChoiceDatum","S-JTSK");
		uiSelectAddExplicitItem("ChoiceDatum","Santo (DOS) 1965");
		uiSelectAddExplicitItem("ChoiceDatum","Sao Braz");
		uiSelectAddExplicitItem("ChoiceDatum","Sapper Hill 1943");

		uiSelectAddExplicitItem("ChoiceDatum","Schwarzeck");
		uiSelectAddExplicitItem("ChoiceDatum","Selvagem Grande 1938");
		uiSelectAddExplicitItem("ChoiceDatum","Sierra Leone 1960");
		uiSelectAddExplicitItem("ChoiceDatum","South American 1969");
		uiSelectAddExplicitItem("ChoiceDatum","SIRGAS - South American Geocentric Reference System");
		uiSelectAddExplicitItem("ChoiceDatum","South Asia");
		uiSelectAddExplicitItem("ChoiceDatum","Tananarive Observatory 1925");
		uiSelectAddExplicitItem("ChoiceDatum","Timbalai 1948");
		uiSelectAddExplicitItem("ChoiceDatum","Tokyo");
		uiSelectAddExplicitItem("ChoiceDatum","Tristan Astro 1968");
		uiSelectAddExplicitItem("ChoiceDatum","Viti Levu 1916");
		uiSelectAddExplicitItem("ChoiceDatum","Voirol 1874");
		uiSelectAddExplicitItem("ChoiceDatum","Voirol 1960");
		uiSelectAddExplicitItem("ChoiceDatum","Wake-Eniwetok 1960");
		uiSelectAddExplicitItem("ChoiceDatum","Wake Island Astro 1952");
		uiSelectAddExplicitItem("ChoiceDatum","(WGS66) World Geodetic System 1966");
		uiSelectAddExplicitItem("ChoiceDatum","(WGS72) World Geodetic System 1972");
		uiSelectAddExplicitItem("ChoiceDatum","Yacare");
		uiSelectAddExplicitItem("ChoiceDatum","Zanderij");
		
		uiSetSelectedValue("ChoiceDatum",g_properties.getPropertyLang("datum.notrecorded"));


		// Distance Precision controls
		populateDistancePrecision("km");

		// Direction Precision controls
		uiClearSelect("ChoiceDirection");
		
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nearestdegree"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.n"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.e"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.s"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.w"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.ne"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.se"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.sw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nne"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.ene"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.ese"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.sse"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.ssw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.wsw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.wnw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nnw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nbe"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nebn"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nebe"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.ebn"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.ebs"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.sebe"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.sebs"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.sbe"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.sbw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.swbs"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.swbw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.wbs"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.wbn"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nwbw"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nwbn"));
		uiSelectAddExplicitItem("ChoiceDirection",g_properties.getPropertyLang("headings.nbw"));
		
		uiSetSelectedValue("ChoiceDirection",g_properties.getPropertyLang("headings.n"));

		// Distance Units controls
		uiClearSelect("ChoiceDistUnits");
		
		uiSelectAddExplicitItem("ChoiceDistUnits","km");
		uiSelectAddExplicitItem("ChoiceDistUnits","m");
		uiSelectAddExplicitItem("ChoiceDistUnits","mi");
		uiSelectAddExplicitItem("ChoiceDistUnits","yds");
		uiSelectAddExplicitItem("ChoiceDistUnits","ft");
		uiSelectAddExplicitItem("ChoiceDistUnits","nm");
		
		uiSetSelectedValue("ChoiceDistUnits","km");
		uiClearSelect("ChoiceFromDistUnits");
		
		uiSelectAddExplicitItem("ChoiceFromDistUnits","km");
		uiSelectAddExplicitItem("ChoiceFromDistUnits","m");
		uiSelectAddExplicitItem("ChoiceFromDistUnits","mi");
		uiSelectAddExplicitItem("ChoiceFromDistUnits","yds");
		uiSelectAddExplicitItem("ChoiceFromDistUnits","ft");
		uiSelectAddExplicitItem("ChoiceFromDistUnits","nm");
		
		uiSetSelectedValue("ChoiceFromDistUnits","km");
		uiClearSelect("ChoiceToDistUnits");
		
		uiSelectAddExplicitItem("ChoiceToDistUnits","km");
		uiSelectAddExplicitItem("ChoiceToDistUnits","m");
		uiSelectAddExplicitItem("ChoiceToDistUnits","mi");
		uiSelectAddExplicitItem("ChoiceToDistUnits","yds");
		uiSelectAddExplicitItem("ChoiceToDistUnits","ft");
		uiSelectAddExplicitItem("ChoiceToDistUnits","nm");
		
		uiSetSelectedValue("ChoiceToDistUnits","km");
		uiClearSelect("ChoiceScaleFromDistUnits");
		
		uiSelectAddExplicitItem("ChoiceScaleFromDistUnits","mm");
		uiSelectAddExplicitItem("ChoiceScaleFromDistUnits","cm");
		uiSelectAddExplicitItem("ChoiceScaleFromDistUnits","in");
		
		uiSetSelectedValue("ChoiceScaleFromDistUnits","mm");
		uiClearSelect("ChoiceScale");
		
		uiSelectAddExplicitItem("ChoiceScale","1:1000");
		uiSelectAddExplicitItem("ChoiceScale","1:1200");
		uiSelectAddExplicitItem("ChoiceScale","1:2000");
		uiSelectAddExplicitItem("ChoiceScale","1:2400");
		uiSelectAddExplicitItem("ChoiceScale","1:2500");
		uiSelectAddExplicitItem("ChoiceScale","1:4800");
		uiSelectAddExplicitItem("ChoiceScale","1:5000");
		uiSelectAddExplicitItem("ChoiceScale","1:9600");
		uiSelectAddExplicitItem("ChoiceScale","1:10000");
		uiSelectAddExplicitItem("ChoiceScale","1:12000");
		uiSelectAddExplicitItem("ChoiceScale","1:20000");
		uiSelectAddExplicitItem("ChoiceScale","1:24000");
		uiSelectAddExplicitItem("ChoiceScale","1:25000");
		uiSelectAddExplicitItem("ChoiceScale","1:32500");
		uiSelectAddExplicitItem("ChoiceScale","1:40000");
		uiSelectAddExplicitItem("ChoiceScale","1:50000");
		uiSelectAddExplicitItem("ChoiceScale","1:60000");
		uiSelectAddExplicitItem("ChoiceScale","1:62500");
		uiSelectAddExplicitItem("ChoiceScale","1:63600");
		uiSelectAddExplicitItem("ChoiceScale","1:80000");
		uiSelectAddExplicitItem("ChoiceScale","1:100000");
		uiSelectAddExplicitItem("ChoiceScale","1:120000");
		uiSelectAddExplicitItem("ChoiceScale","1:125000");
		uiSelectAddExplicitItem("ChoiceScale","1:150000");
		uiSelectAddExplicitItem("ChoiceScale","1:180000");
		uiSelectAddExplicitItem("ChoiceScale","1:200000");
		uiSelectAddExplicitItem("ChoiceScale","1:250000");
		uiSelectAddExplicitItem("ChoiceScale","1:500000");
		uiSelectAddExplicitItem("ChoiceScale","1:1000000");
		uiSelectAddExplicitItem("ChoiceScale","1:1500000");
		uiSelectAddExplicitItem("ChoiceScale","1:2500000");
		uiSelectAddExplicitItem("ChoiceScale","1:3000000");
		
		uiSetSelectedValue("ChoiceScale","1:24000");
		uiClearSelect("ChoiceScaleToDistUnits");
		
		uiSelectAddExplicitItem("ChoiceScaleToDistUnits","km");
		uiSelectAddExplicitItem("ChoiceScaleToDistUnits","m");
		uiSelectAddExplicitItem("ChoiceScaleToDistUnits","mi");
		uiSelectAddExplicitItem("ChoiceScaleToDistUnits","yds");
		uiSelectAddExplicitItem("ChoiceScaleToDistUnits","ft");
		uiSelectAddExplicitItem("ChoiceScaleToDistUnits","nm");
		
		uiSetSelectedValue("ChoiceScaleToDistUnits","km");
		// Lat/Long Direction controls
		uiClearSelect("ChoiceLatDirMM");
		
		uiSelectAddExplicitItem("ChoiceLatDirMM",g_properties.getPropertyLang("headings.n"));
		uiSelectAddExplicitItem("ChoiceLatDirMM",g_properties.getPropertyLang("headings.s"));

		uiClearSelect("ChoiceLongDirMM");
		
		uiSelectAddExplicitItem("ChoiceLongDirMM",g_properties.getPropertyLang("headings.w"));
		uiSelectAddExplicitItem("ChoiceLongDirMM",g_properties.getPropertyLang("headings.e"));

		uiClearSelect("ChoiceLatDirDMS");
		
		uiSelectAddExplicitItem("ChoiceLatDirDMS",g_properties.getPropertyLang("headings.n"));
		uiSelectAddExplicitItem("ChoiceLatDirDMS",g_properties.getPropertyLang("headings.s"));

		uiClearSelect("ChoiceLongDirDMS");
		
		uiSelectAddExplicitItem("ChoiceLongDirDMS",g_properties.getPropertyLang("headings.w"));
		uiSelectAddExplicitItem("ChoiceLongDirDMS",g_properties.getPropertyLang("headings.e"));

		// Offset Direction Controls
		uiClearSelect("ChoiceOffsetNSDir");
		
		uiSelectAddExplicitItem("ChoiceOffsetNSDir",g_properties.getPropertyLang("headings.n"));
		uiSelectAddExplicitItem("ChoiceOffsetNSDir",g_properties.getPropertyLang("headings.s"));
		
		uiClearSelect("ChoiceOffsetEWDir");
		
		uiSelectAddExplicitItem("ChoiceOffsetEWDir",g_properties.getPropertyLang("headings.w"));
		uiSelectAddExplicitItem("ChoiceOffsetEWDir",g_properties.getPropertyLang("headings.e"));
	}



	function showCoordinatePrecision( b )
	{
		PanelCoordPrecision_SetVisible(b);
	}

	function setVisibility( name, v )
	{
		var el = document.getElementById( name );
		if( el && v === true )
		{
			el.visibility = "visible";
			el.hidden = false;
		}
		else if( el )
		{
			el.visibility = "hidden";
			el.hidden = true;
		}
		else
		{
			console.log( "ERROR setVisibility el is null, name  " + name + " value is X" + v +"X");
		}
		
	}
	
	function PanelCoords_SetVisible( v )
	{
		setVisibility( "lblT2Dec_Lat", v);
		setVisibility( "lblT2Dec_Long", v);
		
		PanelDecLatLong_SetVisible( v );
		PanelDDMMSS_SetVisible( v );
		PanelDecMin_SetVisible( v );
		
		setVisibility( "LabelDatum", v );
		setVisibility( "ChoiceDatum", v );
	}

	function PanelCoordPrecision_SetVisible( v )
	{
		setVisibility( "LabelLatPrecision", v );
		setVisibility( "ChoiceLatPrecision", v );
	}
	

	function PanelDecLatLong_SetVisible( v )
	{
		var f_pointer = uiHideElement;
		if( v == true )
		{
			f_pointer=uiShowElement;
		}
		f_pointer( "txtT2Dec_Lat");
		f_pointer( "txtT2Dec_Long" );
	}


	function PanelDDMMSS_SetVisible( v )
	{
		
		var f_pointer = uiHideElement;
		if( v == true )
		{
			f_pointer=uiShowElement;
		}
		f_pointer("txtT7Lat_DegDMS");
		f_pointer( "txtT7Lat_DegDMS");
		f_pointer( "txtT7Lat_MinDMS" );
		f_pointer( "txtT7Lat_Sec" );
		f_pointer( "ChoiceLatDirDMS" );
		
		f_pointer( "txtT7Long_DegDMS" );
		f_pointer( "txtT7Long_MinDMS" );
		f_pointer( "txtT7Long_Sec" );
		f_pointer( "ChoiceLongDirDMS" );
		
		f_pointer( "Label211111" );
		f_pointer( "Label2211" );
		f_pointer( "Label21121" );
		f_pointer( "Label222" );
		f_pointer( "Label2123" );
		f_pointer( "Label23" );
	}
	
	
	function PanelDecMin_SetVisible( v )
	{
		var f_pointer = uiHideElement;
		if( v == true )
		{
			f_pointer=uiShowElement;
		}
		f_pointer( "txtT7Lat_DegMM");
		f_pointer( "txtT7Lat_MinMM");
		f_pointer( "ChoiceLatDirMM");
		
		f_pointer( "txtT7Long_DegMM");
		f_pointer( "txtT7Long_MinMM");
		f_pointer( "ChoiceLongDirMM");
		
		f_pointer( "Label2111111" );
		f_pointer( "Label22111" );
		f_pointer( "Label21212" );
		f_pointer( "Label231" );
	
	}

	function PanelResults_SetVisible( v )
	{
		setVisibility( "LabelCalcDecLat", v);
		setVisibility( "LabelCalcDecLong", v);
		setVisibility( "LabelCalcMaxError", v);
		if( v )
		{
			uiShowElement( "TextFieldFullResult" );
			uiShowElement( "TextFieldCalcDecLat");
			uiShowElement( "TextFieldCalcDecLong");
			uiShowElement( "TextFieldCalcErrorDist");
			uiShowElement( "TextFieldCalcErrorUnits");

		}
		else
		{
			uiHideElement( "TextFieldFullResult" );
			uiHideElement( "TextFieldCalcDecLat");
			uiHideElement( "TextFieldCalcDecLong");
			uiHideElement( "TextFieldCalcErrorDist");
			uiHideElement( "TextFieldCalcErrorUnits");
			uiHideElement( "TextFieldFullResult" );
		}
	}
	
/*Note: for reference only Java	 UI Layout, I am using it for hidden attribute setting as it does not translate well from Java pane to HTML div/span
//NOTE: I strongly suspect we do not need this reference any more.
	pane
		ChoiceLanguage
		LabelVersion
		LabelCopyright
		LabelCalcType
		ChoiceCalcType
		LabelStepZero
		LabelTitle
		LabelModel
		ChoiceModel
		LabelStepOne
		LabelStepTwo
		LabelCoordSource
		ChoiceCoordSource
		LabelCoordSystem
		ChoiceCoordSystem
		+	PanelCoords
		+	PanelCoordPrecision
		LabelDirection
		ChoiceDirection
		TextFieldHeading
		TextFieldOffset
		ChoiceOffsetNSDir
		LabelOffsetEW
		TextFieldOffsetEW
		ChoiceOffsetEWDir
		LabelOffset
		LabelExtent
		TextFieldExtent
		LabelMeasurementError
		TextFieldMeasurementError
		LabelDistUnits
		ChoiceDistUnits
		LabelDistancePrecision
		ChoiceDistancePrecision
		ButtonCalculate
		ButtonPromote
		+	PanelResults
		LabelDistanceConverter
		TextFieldFromDistance
		ChoiceFromDistUnits
		LabelEquals
		TextFieldToDistance
		ChoiceToDistUnits
		LabelScaleConverter
		TextFieldScaleFromDistance
		ChoiceScaleFromDistUnits
		ChoiceScale
		LabelScaleEquals
		TextFieldScaleToDistance
		ChoiceScaleToDistUnits
	
	PanelCoords
		lblT2Dec_Lat
		lblT2Dec_Long
		+	PanelDecLatLong
		+	PanelDDMMSS
		+	PanelDecMin
		LabelDatum
		ChoiceDatum
	
	PanelCoordPrecision
		LabelLatPrecision
		ChoiceLatPrecision
	
	PanelDecLatLong
		txtT2Dec_Lat
		txtT2Dec_Long
		
	PanelDDMMSS
		txtT7Lat_DegDMS
		txtT7Lat_MinDMS
		txtT7Lat_Sec
		ChoiceLatDirDMS
		
		txtT7Long_DegDMS
		txtT7Long_MinDMS
		txtT7Long_Sec
		ChoiceLongDirDMS
		
		Label211111
		Label2211
		Label21121
		Label222
		Label2123
		Label23
		
		
	PanelDecMin
		txtT7Lat_DegMM
		txtT7Lat_MinMM
		ChoiceLatDirMM
		
		txtT7Long_DegMM
		txtT7Long_MinMM
		ChoiceLongDirMM
		
		Label2111111
		Label22111
		Label21212
		Label231
		
	PanelResults
		LabelCalcDecLat
		TextFieldCalcDecLat
		LabelCalcDecLong
		TextFieldCalcDecLong
		LabelCalcMaxError
		TextFieldCalcErrorDist
		TextFieldCalcErrorUnits
		TextFieldFullResult
	*/
	
	function showCoordinates( b )
	{
		PanelCoords_SetVisible( b )
	}

	function showCoordinateSource( b )
	{
		setVisibility( "ChoiceCoordSource", b );
		setVisibility( "LabelCoordSource", b );

		setVisibility( "lblT2Dec_Lat", b);
		setVisibility( "lblT2Dec_Long", b);

	}

	function showCoordinateSystem( b )
	{
		setVisibility( "ChoiceCoordSystem", b );
		setVisibility( "LabelCoordSystem", b );
	}

	function showDecimalDegrees( b )
	{
		PanelDecLatLong_SetVisible( b );
	}

	function showDegreesDecimalMinutes( b )
	{
		PanelDecMin_SetVisible( b );
	}

	function showDirection( b )
	{
		var f_pointer = uiHideElement;
		if( b == true )
		{
			f_pointer=uiShowElement;
		}
		
		var value = uiGetSelectedText( "ChoiceDirection" );
		
		f_pointer("ChoiceDirection" );
		f_pointer("LabelDirection" );
	
		if( b && value == g_properties.getPropertyLang("headings.nearestdegree" ) )
		{
			uiShowElement( "TextFieldHeading" );
		}
		else
		{
			uiHideElement( "TextFieldHeading");
		}
	}

	function showDirectionPrecision( b )
	{
		var f_pointer = uiHideElement;
		if( b == true )
		{
			f_pointer=uiShowElement;
		}
	
		f_pointer( "ChoiceDirection" );
		f_pointer( "LabelDirection" );

		var value = uiGetSelectedText( "ChoiceDirection" );
		
		if( b && value == g_properties.getPropertyLang("headings.nearestdegree" ) )
		{
			uiShowElement( "TextFieldHeading" );
		}
		else
		{
			uiHideElement( "TextFieldHeading" );
		}
	}

	function showDistancePrecision( b )
	{
		setVisibility( "ChoiceDistancePrecision", b );
		setVisibility( "LabelDistancePrecision", b );
	}

	function showDistanceUnits( b )
	{
		setVisibility( "ChoiceDistUnits", b );
		setVisibility( "LabelDistUnits", b );
	}

	function showDistanceConverter( b )
	{
		//TODO should this ever get used the text and labels sould you show/hihe element funtion instead
		setVisibility( "ChoiceFromDistUnits", b );
		setVisibility( "ChoiceToDistUnits", b );
		setVisibility( "LabelEquals", b );
		setVisibility( "LabelDistanceConverter", b );
		setVisibility( "TextFieldFromDistance", b );
		setVisibility( "TextFieldToDistance", b );
	}

	function showScaleConverter( b )
	{
		//TODO should this ever get used the text and labels sould you show/hihe element funtion instead
		setVisibility( "ChoiceScaleFromDistUnits", b );
		setVisibility( "ChoiceScaleToDistUnits", b );
		setVisibility( "ChoiceScale", b );
		setVisibility( "LabelScaleEquals", b );
		setVisibility( "LabelScaleConverter", b );
		setVisibility( "TextFieldScaleFromDistance", b );
		setVisibility( "TextFieldScaleToDistance", b );
	}

	function showDMS( b )
	{
		PanelDDMMSS_SetVisible( b );
	}

	function showEWOffset( b )
	{
		setVisibility( "TextFieldOffsetEW", b );
		uiSetLabel( "LabelOffsetEW", "label.distew" );
		setVisibility( "LabelOffsetEW", b );
		setVisibility( "ChoiceOffsetEWDir", b );
	}

	function showExtents( b )
	{
		setVisibility( "LabelExtent", b );
		setVisibility( "TextFieldExtent", b );
	}

	function showMeasurementError( b )
	{
		setVisibility( "LabelMeasurementError", b );
		setVisibility( "TextFieldMeasurementError", b );
	}

	function showErrors( b )
	{
		setVisibility( "LabelCalcMaxError", b );
		if( b )
		{
			uiShowElement( "TextFieldFullResult" );
			uiShowElement( "TextFieldCalcErrorDist");
			uiShowElement( "TextFieldCalcErrorUnits");
		}
		else
		{
			uiHideElement( "TextFieldFullResult", b );
			uiHideElement( "TextFieldCalcErrorDist");
			uiHideElement( "TextFieldCalcErrorUnits");
		}
	}

	
	function showNSOffset( b )
	{
		var f_pointer=uiHideElement;
		if( b )
		{
			f_pointer=uiShowElement;
		}
		
		f_pointer( "TextFieldOffset" );

		uiSetLabel( "LabelOffset", "label.distns" );

		f_pointer( "LabelOffset" );
		f_pointer( "ChoiceOffsetNSDir" );
	}

	function showOffset( b )
	{
		setVisibility( "TextFieldOffsetEW", b );
		uiSetLabel( "LabelOffsetEW", "label.offset" );
		setVisibility( "LabelOffsetEW", b );
	}

	
	function showRelevantCoordinates( )
	{
		var value = uiGetSelectedText( "ChoiceCoordSystem");  
		var index = g_canonicalcoordsystems.indexOf( value );

		if ( index==0 ){
			showDMS( false );
			showDegreesDecimalMinutes( false );
			showDecimalDegrees( true );
		} else if ( index==1 ){
			showDecimalDegrees( false );
			showDegreesDecimalMinutes( false );
			showDMS( true );
		} else if ( index==2 ){
			showDecimalDegrees( false );
			showDMS( false );
			showDegreesDecimalMinutes( true );
		}
	}

	function showResults( b )
	{
		PanelResults_SetVisible( b );
	}

	
//TODO this could be improved by using prompt alert type.
//With a prompt we could display the bad value and the error, and get a replacement value back, plug in and roll with new number
//NOTE: style is not currently used
function errorDialog( error, title, source, style )
{
			var e = document.getElementById( source );
			if( e )
			{
				e.style.color = "#76ACFF";
				e.style.fontWeight = "bold";
			}
			else
			{
				console.log( "ERROR: errorDialog source not found " + source )
			}
	
			alert(title + '\n\n' + error );
	
			if( e )
			{
				e.style.color = "#000000";
				e.style.fontWeight = "normal";				
			}
}
	
	

//BEGIN test* functions

	function testHeadingLimits()
	{
//JAVA original source kept for debugging and reference
/*
		boolean testpasses = true;
		String s = null;
		double d = 0;
		Number num = null;
*/
		var testpasses = "true";
		var s = null;
		var d = 0;
		var num = null;
		
		
		s = uiGetTextValue("TextFieldHeading");
			
		if( s == null || s.length == 0 )
		{
			uiSetLabelExplicit("TextFieldHeading","0");
		}
		else
		{ // test input within limits and valid
			try{
				num = formatCalcDec.throwFormatError( s );
				//JAVA d = num.doubleValue();
				d = num;
				if( d < 0 || d >= 360 )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.heading.message"),
						g_properties.getPropertyLang("error.heading.title"), "TextFieldHeading", 0);
					uiSetTextExplicit("TextFieldHeading","0");
				}
			}
			catch( exp )
			{
				testpasses = false;
				errorDialog(g_properties.getPropertyLang("error.heading.message"),
					g_properties.getPropertyLang("error.heading.title"), "TextFieldHeading", 0);
				uiSetTextExplicit("TextFieldHeading","0");
			}
		}
		return testpasses;
	}

	function testLatLongLimits( )
	{
//JAVA original source kept for debugging and reference
/*
		boolean testpasses = true;
		double d = 0;
		int i = 0;
		String s = null;
		Number num = null;
*/
		var testpasses = true;
		var d = 0;
		var i = 0;
		var s = null;
		var num = null;
		
		
		if( uiIsVisible("txtT2Dec_Lat") )
		{
			s = uiGetTextValue("txtT2Dec_Lat");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit( "txtT2Dec_Lat",0);
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					d = num;
					if( d < -90.0 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lat.message"),
							g_properties.getPropertyLang("error.lat.title"), "txtT2Dec_Lat", 0);
						decimallatitude = -90;
						uiSetTextExplicit("txtT2Dec_Lat","-90");
					}
					else if( d > 90 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lat.message"),
							g_properties.getPropertyLang("error.lat.title"), "txtT2Dec_Lat", 0);
						decimallatitude = 90;
						uiSetTextExplicit("txtT2Dec_Lat","90");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog( g_properties.getPropertyLang("error.lat.message"),
						g_properties.getPropertyLang("error.lat.title"), "txtT2Dec_Lat" , 0 );					
					decimallatitude = 0;
					uiSetTextExplicit("txtT2Dec_Lat","0");
				}
			}
		}

		
		if( uiIsVisible("txtT2Dec_Long" ) )
		{
			s = uiGetTextValue("txtT2Dec_Long");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT2Dec_Long","0");
			}
			else
			{ // test input within limits and valid
				try
{
					num = formatCalcDec.throwFormatError( s );					
					//JAVA d = num.doubleValue();
					d = num;
					if( d < -180 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lon.message"),
							g_properties.getPropertyLang("error.lon.title"), "txtT2Dec_Long", 0);
						decimallongitude = -180;
						uiSetTextExplicit("txtT2Dec_Long","-180");
					}
					else if( d > 180 )
					{
						decimallongitude = 180;
						errorDialog(g_properties.getPropertyLang("error.lon.message"),
							g_properties.getPropertyLang("error.lon.title"), "txtT2Dec_Long", 0);
						uiSetTextExplicit("txtT2Dec_Long","180");
					}
				}
				catch( exp )
				{
					testpasses = false;
					decimallongitude = 0;
					errorDialog(g_properties.getPropertyLang("error.lon.message"),
						g_properties.getPropertyLang("error.lon.title"), "txtT2Dec_Long", 0);
					uiSetTextExplicit("txtT2Dec_Long","0");
				}
			}
		}

		
		
		if( uiIsVisible("txtT7Lat_DegDMS") )
		{
			s = uiGetTextValue("txtT7Lat_DegDMS");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Lat_DegDMS","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );					
//					JAVA i = num.intValue();
					i = num;
					if( i < 0 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lat.message"),
							g_properties.getPropertyLang("error.lat.title"), "txtT7Lat_DegDMS",0);
						uiSetTextExplicit("txtT7Lat_DegDMS","0");
					}
					else if( i > 90 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lat.message"),
							g_properties.getPropertyLang("error.lat.title"), "txtT7Lat_DegDMS",0);
						decimallatitude = 90;
						uiSetTextExplicit("txtT7Lat_DegDMS","90");
						uiSetTextExplicit("txtT7Lat_MinDMS","0");
						uiSetTextExplicit("txtT7Lat_Sec","0");
					}
				}
				catch( exp )
				{			
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.lat.message"),
						g_properties.getPropertyLang("error.lat.title"), "txtT7Lat_DegDMS",0);
					uiSetTextExplicit("txtT7Lat_DegDMS","0");
				}
			}
		}


		
		if( uiIsVisible("txtT7Long_DegDMS") )
		{
			s = uiGetTextValue("txtT7Long_DegDMS");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Long_DegDMS","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA i = num.intValue();
					i = num;
					if( i < 0 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lon.message"),
							g_properties.getPropertyLang("error.lon.title"), "txtT7Long_DegDMS", 0);
						uiSetTextExplicit("txtT7Long_DegDMS","0");
					}
					else if( i > 180 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lon.message"),
							g_properties.getPropertyLang("error.lon.title"), "txtT7Long_DegDMS", 0);
						uiSetTextExplicit("txtT7Long_DegDMS","180");
						uiSetTextExplicit("txtT7Long_MinDMS","0");
						uiSetTextExplicit("txtT7Long_Sec","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.lon.message"),
						g_properties.getPropertyLang("error.lon.title"), "txtT7Long_DegDMS", "txtT7Long_DegDMS", 0);
					uiSetTextExplicit("txtT7Long_DegDMS","0");
				}
			}
		}

				
		if( uiIsVisible("txtT7Lat_DegMM") )
		{
			s = uiGetTextValue("txtT7Lat_DegMM");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Lat_DegMM","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA i = num.intValue();
					i = num;
					if( i < 0 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lat.message"),
							g_properties.getPropertyLang("error.lat.title"), "txtT7Lat_DegMM", 0);
						uiSetTextExplicit("txtT7Lat_DegMM","0");
					}
					else if( i > 90 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lat.message"),
							g_properties.getPropertyLang("error.lat.title"), "txtT7Lat_DegMM", 0);
						uiSetTextExplicit("txtT7Lat_DegMM","90");
						uiSetTextExplicit("txtT7Lat_MinMM","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.lat.message"),
						g_properties.getPropertyLang("error.lat.title"), "txtT7Lat_DegMM", 0);
					uiSetTextExplicit("txtT7Lat_DegMM","0");
				}
			}
		}

		if( uiIsVisible("txtT7Long_DegMM") )
		{
			s = uiGetTextValue("txtT7Long_DegMM");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Long_DegMM","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
//					JAVA i = num.intValue();
					i = num;
					if( i < 0 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lon.message"),
							g_properties.getPropertyLang("error.lon.title"), "txtT7Long_DegMM",0);
						uiSetTextExplicit("txtT7Long_DegMM","0");
					}
					else if( i > 180 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.lon.message"),
							g_properties.getPropertyLang("error.lon.title"), "txtT7Long_DegMM",0);
						uiSetTextExplicit("txtT7Long_DegMM","180");
						uiSetTextExplicit("txtT7Long_MinMM","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.lon.message"),
						g_properties.getPropertyLang("error.lon.title"), "txtT7Long_DegMM",0);
					uiSetTextExplicit("txtT7Long_DegMM","0");
				}
			}
		}

		if( uiIsVisible("txtT7Lat_MinDMS") )
		{
			s = uiGetTextValue("txtT7Lat_MinDMS");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Lat_MinDMS","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA i = num.intValue();
					num =s;
					i = num;
					if( i < 0 || i >= 60 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.min.message"),
							g_properties.getPropertyLang("error.min.title"), "txtT7Lat_MinDMS",0);
						uiSetTextExplicit("txtT7Lat_MinDMS","0");
						uiSetTextExplicit("txtT7Lat_Sec","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.lon.message"),
						g_properties.getPropertyLang("error.lon.title"), "txtT7Lat_MinDMS",0);
					uiSetTextExplicit("txtT7Long_DegMM","0");
				}
			}
		}

		
		if( uiIsVisible("txtT7Long_MinDMS") )
		{
			s = uiGetTextValue("txtT7Long_MinDMS");
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Long_MinDMS","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA i = num.intValue();
					
					i = num;
					if( i < 0 || i >= 60 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.min.message"),
							g_properties.getPropertyLang("error.min.title"), "txtT7Long_MinDMS",0);
						uiSetTextExplicit("txtT7Long_MinDMS","0");
						uiSetTextExplicit("txtT7Long_Sec","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.min.message"),
						g_properties.getPropertyLang("error.min.title"), "txtT7Long_MinDMS", 0);
					uiSetTextExplicit("txtT7Long_MinDMS","0");
					uiSetTextExplicit("txtT7Long_Sec","0");
				}
			}
		}

		if( uiIsVisible("txtT7Lat_MinMM") )
		{
			s = uiGetTextValue("txtT7Lat_MinMM");
			
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Lat_MinMM","0");
			}
			else
			{ // test input within limits and valid
				try{
					num = formatCalcDec.throwFormatError( s );
					//JAVA d = num.doubleValue();					
					d = num;
					if( d < 0 || d >= 60 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.min.message"),
							g_properties.getPropertyLang("error.min.title"), "txtT7Lat_MinMM",0);
						uiSetTextExplicit("txtT7Lat_MinMM","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.min.message"),
						g_properties.getPropertyLang("error.min.title"), "txtT7Lat_MinMM",0);
					uiSetTextExplicit("txtT7Lat_MinMM","0");
				}
			}
		}

		if( uiIsVisible("txtT7Long_MinMM") )
		{
			s = uiGetTextValue("txtT7Long_MinMM");
			
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Long_MinMM","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA d = num.doubleValue();				
					d = num;
					if( d < 0 || d >= 60 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.min.message"),
							g_properties.getPropertyLang("error.min.title"), "txtT7Long_MinMM",0);
						uiSetTextExplicit("txtT7Long_MinMM","0");
					}
				}
				catch( exp )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.min.message"),
						g_properties.getPropertyLang("error.min.title"), "txtT7Long_MinMM",0);
					uiSetTextExplicit("txtT7Long_MinMM","0");
				}
			}
		}

		if( uiIsVisible("txtT7Lat_Sec") )
		{
			s = uiGetTextValue("txtT7Lat_Sec");
			
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Lat_Sec","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA d = num.doubleValue()
					d = num;
					if( d < 0 || d >= 60 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.sec.message"),
							g_properties.getPropertyLang("error.sec.title"), "txtT7Lat_Sec",0);
						uiSetTextExplicit("txtT7Lat_Sec","0");
					}
				} catch( exp ){
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.sec.message"),
						g_properties.getPropertyLang("error.sec.title"), "txtT7Lat_Sec",0);
					uiSetTextExplicit("txtT7Lat_Sec","0");
				}
			}
		}

		if( uiIsVisible("txtT7Long_Sec") )
		{
			s = uiGetTextValue("txtT7Long_Sec");
			
			if( s == null || s.length == 0 )
			{
				uiSetLabelExplicit("txtT7Long_Sec","0");
			}
			else
			{ // test input within limits and valid
				try
				{
					num = formatCalcDec.throwFormatError( s );
					//JAVA d = num.doubleValue();
					
					d = num;
					if( d < 0 || d >= 60 )
					{
						testpasses = false;
						errorDialog(g_properties.getPropertyLang("error.sec.message"),
							g_properties.getPropertyLang("error.sec.title"), "txtT7Long_Sec",0);
						uiSetTextExplicit("txtT7Long_Sec","0");
					}
				} catch( exp ){
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.sec.message"),
						g_properties.getPropertyLang("error.sec.title"),"txtT7Long_Sec", 0);
					uiSetTextExplicit("txtT7Long_Sec","0");
				}
			}
		}
		return testpasses;
	}



	function testOffsetLimits()
	{
//	throws ParseException
		//Original JAVA kept for reference and debugging
		/*
		boolean testpasses = true;
		String s = null;
		double d = 0;
		Number num = null;
		*/
		var testpasses = true;
		var s = null;
		var d = 0;
		var num = null;
		
		s = uiGetTextValue("TextFieldOffset");
		if( s == null || s.length == 0 )
		{
			uiSetLabelExplicit("TextFieldOffset","0");
		}
		else
		{
			try
			{
				num = formatCalcDec.throwFormatError( s );
				//JAVA d = num.doubleValue();
				
				d = num;
				if( d < 0 )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.offset.message"),
						g_properties.getPropertyLang("error.offset.title"), "TextFieldOffset",0);
					uiSetTextExplicit("TextFieldOffset","0");
				}
			}
			catch( exp )
			{
				testpasses = false;
				errorDialog(g_properties.getPropertyLang("error.offset.message"),
					g_properties.getPropertyLang("error.offset.title"), "TextFieldOffset",0);
				uiSetTextExplicit("TextFieldOffset","0");
			}
		}

	
		s = uiGetTextValue("TextFieldOffsetEW");
		if( s == null || s.length == 0 )
		{
			uiSetLabelExplicit("TextFieldOffsetEW","0");
		}
		else
		{
			try
			{
				num = formatCalcDec.throwFormatError( s );
				//JAVA d = num.doubleValue();
				
				d = num;
				if( d < 0 )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.offset.message"),
						g_properties.getPropertyLang("error.offset.title"), "TextFieldOffsetEW", 0);
					uiSetTextExplicit("TextFieldOffsetEW","0");
				}
			}
			catch( exp )
			{
				testpasses = false;
				errorDialog(g_properties.getPropertyLang("error.offset.message"),
					g_properties.getPropertyLang("error.offset.title"), "TextFieldOffsetEW", 0);
				uiSetTextExplicit("TextFieldOffsetEW","0");
			}
		}
		
		s = uiGetTextValue("TextFieldExtent");
		if( s == null || s.length == 0 )
		{
			uiSetLabelExplicit("TextFieldExtent","0");
		}
		else
		{ // test input within limits and valid
			try
			{
				num = formatCalcDec.throwFormatError( s );
				//JAVA d = num.doubleValue();
				
				d = num;
				if( d < 0 )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.extent.message"),
						g_properties.getPropertyLang("error.extent.title"), "TextFieldExtent", 0);
					uiSetTextExplicit("TextFieldExtent","0");
				}
			}
			catch( exp )
			{
				testpasses = false;
				errorDialog(g_properties.getPropertyLang("error.extent.message"),
					g_properties.getPropertyLang("error.offset.extent"), "TextFieldExtent", 0);
				uiSetTextExplicit("TextFieldExtent","0");
			}
		}

		s = uiGetTextValue("TextFieldMeasurementError");
		
		if( s == null || s.length == 0 )
		{
			uiSetLabelExplicit("TextFieldMeasurementError","0");
		}
		else
		{ // test input within limits and valid
			try
			{
				num = formatCalcDec.throwFormatError( s );
				//JAVA d = num.doubleValue();
				d = num;
				if( d < 0 )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.measurementerror.message"),
						g_properties.getPropertyLang("error.measurementerror.title"), "TextFieldMeasurementError", 0);
					uiSetTextExplicit("TextFieldMeasurementError","0");
				}
			}
			catch( exp )
			{
				testpasses = false;
				errorDialog(g_properties.getPropertyLang("error.measurementerror.message"),
					g_properties.getPropertyLang("error.measurementerror.title"), "TextFieldMeasurementError",0);
				uiSetTextExplicit("TextFieldMeasurementError","0");
			}
		}
		return testpasses;
	}


	function testResultCoordinates()
	{
		if( newdecimallatitude > 90.0 )
		{
			newdecimallatitude = 90.0;
		}
		if( newdecimallatitude < -90.0 )
		{
			newdecimallatitude = -90.0;
		}
		if( newdecimallatitude == 90.0 || newdecimallatitude == -90.0 )
		{
			newdecimallongitude = decimallongitude;
		}
		else
		{
			while( newdecimallongitude > 180.0 )
			{
				newdecimallatitude -= 360.0;
			}
			while( newdecimallongitude < -180.0 )
			{
				newdecimallongitude += 360.0;
			}
		}
	}
//END test* functions

//BEGIN TextX onFocus functions
	function TextFieldFromDistance_focusGained()
	{
		convertDistance();
	}

	function TextFieldToDistance_focusGained()
	{
		convertDistance();
	}

	function TextFieldScaleFromDistance_focusGained()
	{
		convertScale();
	}
	
	function TextFieldScaleToDistance_focusGained()
	{
		convertScale();
	}

	//FIXME remove these no longer used functions, and references to them in grc.html
	function TextFieldExtent_focusGained()
	{
		//clearResults();
	}
	//FIXME remove these no longer used functions, and references to them in grc.html
	function TextFieldMeasurementError_focusGained()
	{
		//clearResults();
	}



	function TextFieldHeading_focusGained()
	{
		//clearResults();
	}

	function TextFieldOffset_focusGained()
	{
		//clearResults();
	}

	function TextFieldOffsetEW_focusGained()
	{
		//clearResults();
	}
	
//END TextX onFocus functions



//BEGIN txtX onFocus functions
//FIXME remove these no longer used functions, and references to them in grc.html
	function txtT2Dec_Lat_focusGained()
	{
		//clearResults();
	}

	function txtT2Dec_Long_focusGained()
	{
		//clearResults();
	}

	function txtT7Lat_DegDMS_focusGained()
	{
		//clearResults();
	}

	function txtT7Lat_DegMM_focusGained()
	{
		//clearResults();
	}

	function txtT7Lat_MinDMS_focusGained()
	{
		//clearResults();
	}

	function txtT7Lat_MinMM_focusGained()
	{
		//clearResults();
	}

	function txtT7Lat_Sec_focusGained()
	{
		//clearResults();
	}

	function txtT7Long_DegDMS_focusGained()
	{
		//clearResults();
	}

	function txtT7Long_DegMM_focusGained()
	{
		//clearResults();
	}

	function txtT7Long_MinDMS_focusGained()
	{
		//clearResults();
	}

	function txtT7Long_MinMM_focusGained()
	{
		//clearResults();
	}

	function txtT7Long_Sec_focusGained()
	{
		//clearResults();
	}

