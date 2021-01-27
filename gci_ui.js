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
__contributor__ = "Marcelo Oyaneder Labarca"
__copyright__ = "Copyright 2021 Rauthiflor LLC"
__version__ = "gc_ui.js 2021-01-27T13:11-3:00"
*/
	// Base version, full version includes language code suffix
	var g_versionNumber = "20210127";

	// most recently chosen coordinate format
	var lastcoordsystem = 1; // 1=dd.ddddd, 2=ddmmss.ss, 3=ddmm.mmmm
	// most recently chosen decimal minutes
	var lastdecimalminutes = 0;
	// most recently chosen decimal degrees
	var lastdecimaldegrees = 0;

	var sign = 1;
	var degrees = 0;
	var minutes = 0;
	var seconds = 0;
	var decminutes = 0;

	// decimal latitude of the starting point
	var decimallatitude = 0;
	// decimal longitude of the starting point
	var decimallongitude = 0;
	// decimal latitude of the end point
	var newdecimallatitude = 0;
	// decimal longitude of the end point
	var newdecimallongitude = 0;
	// number of meters per degree of latitude for the current calculation
	var latmetersperdegree = 0;
	// number of meters per degree of longitude for the current calculation
	var longmetersperdegree = 0;
	// calculated maximum error distance
	var maxerrordistance = 0;

	// value of the left-hand side of the distance conversion equation
	var fromdistance = 0;
	// value of the right-hand side of the distance conversion equation
	var todistance = 0;
	// value of the left-hand side of the scale conversion equation
	var scalefromdistance = 0;
	// value of the right-hand side of the scale conversion equation
	var scaletodistance = 0;
	var scalefactor = 1; // distance unit conversion factor

	var formatDec = g_factory.makeFormat("formatDec", "formatDec");
	var formatDeg = g_factory.makeFormat("formatDeg", "formatDeg");
	var formatMin = g_factory.makeFormat("formatMin", "formatMin");
	var formatMinMM = g_factory.makeFormat("formatMinMM", "formatMinMM");
	var formatSec = g_factory.makeFormat("formatSec", "formatSec");
	var formatCalcError = g_factory.makeFormat("formatCalcError", "formatCalcError");
	var formatDistance = g_factory.makeFormat("formatDistance", "formatDistance");
	var formatCalcDec = g_factory.makeFormat("formatCalcDec", "formatCalcDec");

	var g_debug_active = false;
	var g_debug_loaded = false;

function GC_init()
{
	g_embeddedCopyright = "Copyright 2020 Rauthiflor LLC";
	g_canonicalheadings = g_factory.makeArrayList("g_canonicalheadings", "headings");
	g_canonicalcoordsystems = g_factory.makeArrayList("g_canonicalcoordsystems","coordsystem...");
	g_canonicalloctypes = g_factory.makeArrayList("g_canonicalloctypes","loctype...");
	g_canonicalddprec = g_factory.makeArrayList("g_canonicalddprec","ddprec");
	g_canonicaldmsprec = g_factory.makeArrayList("g_canonicaldmsprec","dmsprec");
	g_canonicalddmprec = g_factory.makeArrayList("g_canonicalddmprec","ddmprec");
	g_canonicalsources = g_factory.makeArrayList("g_canonicalsources","dunno");
	g_languagelist = g_factory.makeArrayList("g_languagelist", "languages");
	g_numberFormatter = "en";
	g_language = "en";	

	var language = g_language; 
	setVariables( language );

	// Initialize the language list and get the properties
	g_languagelist.clear();
	var i = 0;
	var lang = g_properties.getPropertyByIndex( "language.name", i )
	var code = g_properties.getPropertyByIndex( "language.code", i )
	var nObj = { 'name' : lang, 'value' : code };
	while( lang )
	{
		g_languagelist.add( nObj );
		i++;
		lang = g_properties.getPropertyByIndex( "language.name", i );
		code = g_properties.getPropertyByIndex( "language.code", i );
		nObj = { 'name' : lang, 'value' : code };
	}
	
	uiShowElement( "LabelTitle" );
	uiShowElement( "LabelCopyright" );
	uiClearSelect( "ChoiceLanguage", "g_languagelist" );
	uiFillLanguageSelect( "ChoiceLanguage", "g_languagelist", false );

	cleanSlate();
	uiSetSelectedIndex("ChoiceLanguage", 0 )
	onLanguageSelect();		

	populateCoordinatePrecision( g_properties.getPropertyLang("coordsys.dd") );
	showScaleConverter(true);
	showDistanceConverter(true);
	setTabOrders();
	setLanguageFocused();
} 

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
		// TODO:  i<8 is bad, but we cant use g_tests.length because it ?no longer global? due to delayed load?
		for( var i = 0; i< 9; i++ )
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
	a=setElementOrder("TextFieldOffsetNS", a);
	a=setElementOrder("ChoiceOffsetNSDir", a);
	
	a=setElementOrder("TextFieldOffsetEW", a);
	a=setElementOrder("ChoiceOffsetEWDir", a);


	a=setElementOrder("TextFieldExtent", a);
	a=setElementOrder("TextFieldMeasurementError", a);
	a=setElementOrder("ChoiceDistUnits", a);
	a=setElementOrder("ChoiceDistancePrecision", a);	

	a=setElementOrder("ButtonCalculate", a);
	a=setElementOrder("ButtonCopy", a);

	a=setElementOrder("TextFieldCalcDecLat", a);
	a=setElementOrder("TextFieldCalcDecLong", a);
	a=setElementOrder("TextFieldCalcDatum", a);
	a=setElementOrder("TextFieldCalcErrorDist", a);
	a=setElementOrder("TextFieldCalcPrecision", a);
	a=setElementOrder("TextFieldCalcGeoreferencer", a);
	a=setElementOrder("TextFieldCalcDate", a);
	a=setElementOrder("ChoiceProtocol", a);

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

function uiElementSetFocus( target, selecttext )
{
	var el = document.getElementById( target );
	
	if( el )
	{
		el.focus();
		el.focus();
		if( selecttext && el.firstChild && el.firstChild.nodeName=="#text" )
		{
			el.select();
		}
	}
	else
	(
		console.log("ERROR uiElementSetFocus element name not found" + target )
	)
}

function uiIsVisible( name )
{
	var el = document.getElementById( name );
	if( el )
	{
		var v = el.visibility;
		if (typeof v !== 'undefined') 
		{
		    if( v == "visible" )
		    {
		    	return true;
		    }
		    else
		    {
		    	return false;
		    }
		}
		var st = el.style.display;
		if( st == "none" || st == "" )
		{
			return false;
		}
		else 
		{
			return true;
		}	
	}
	else
	(
		console.log("ERROR uiIsVisible null element name:" + name )
	)
	return null;
}

function onLanguageSelect()
{
	var el = document.getElementById( 'ChoiceLanguage' );
	g_language = el.options[el.selectedIndex].value;
	setVariables( );
	newLanguageChosen();
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
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.n."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.e."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.s."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.w."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.ne."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.se."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.sw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nne."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.ene."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.ese."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.sse."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.ssw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.wsw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.wnw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nnw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nbe."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nebn."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nebe."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.ebn."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.ebs."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.sebe."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.sebs."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.sbe."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.sbw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.swbs."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.swbw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.wbs."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.wbn."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nwbw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nwbn."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nbw."+language));
		g_canonicalheadings.add(g_properties.getPropertyByName("headings.nearestdegree."+language));

		// Do not change the following, the order is important
		g_canonicalcoordsystems.clear();
		g_canonicalcoordsystems.add(g_properties.getPropertyByName("coordsys.dd."+language));
		g_canonicalcoordsystems.add(g_properties.getPropertyByName("coordsys.dms."+language));
		g_canonicalcoordsystems.add(g_properties.getPropertyByName("coordsys.ddm."+language));

		// Do not change the following, the order is important
		g_canonicalloctypes.clear();
		g_canonicalloctypes.add(g_properties.getPropertyByName("loctype.coordonly."+language));
		g_canonicalloctypes.add(g_properties.getPropertyByName("loctype.namedplaceonly."+language));
		g_canonicalloctypes.add(g_properties.getPropertyByName("loctype.distanceonly."+language));
		g_canonicalloctypes.add(g_properties.getPropertyByName("loctype.distalongpath."+language));
		g_canonicalloctypes.add(g_properties.getPropertyByName("loctype.orthodist."+language));
		g_canonicalloctypes.add(g_properties.getPropertyByName("loctype.distatheading."+language));

		// Do not change the following, the order is important
		g_canonicalsources.clear();
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.gaz."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.gem2008."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.gem2018."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.gps."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.loc."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs250000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs100000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs63360."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs62500."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs25000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs24000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs12000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs10000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs4800."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs2400."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.usgs1200."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.ntsa250000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.ntsb250000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.ntsc250000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.ntsa50000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.ntsb50000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.ntsc50000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non3000000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non2500000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non1000000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non500000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non250000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non200000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non180000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non150000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non125000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non100000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non80000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non62500."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non60000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non50000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non40000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non32500."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non25000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non20000."+language));
		g_canonicalsources.add(g_properties.getPropertyByName("coordsource.non10000."+language));

		g_canonicalddprec.clear();
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.degree."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.cp_01."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.cp_001."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.cp_0001."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.cp_00001."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.cp_000001."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.half."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.quarter."+language));
		g_canonicalddprec.add(g_properties.getPropertyByName("coordprec.dd.exact."+language));

		g_canonicaldmsprec.clear();
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.degree."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_30m."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_10m."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_5m."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_1m."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_30s."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_10s."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_5s."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_1s."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_01s."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.cp_001s."+language));
		g_canonicaldmsprec.add(g_properties.getPropertyByName("coordprec.dms.exact."+language));

		g_canonicalddmprec.clear();
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.degree."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_30m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_10m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_5m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_1m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_01m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_001m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.cp_0001m."+language));
		g_canonicalddmprec.add(g_properties.getPropertyByName("coordprec.ddm.exact."+language));
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
		showDirectionPrecision(true);
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
		uiSetSelectedValue("ChoiceLongDirDMS",value);
	}

	function onLongDirMMSelect()
	{
		clearResults();
		var value = uiGetSelectedText("ChoiceLongDirMM");
		uiSetSelectedValue("ChoiceLongDirMM",value);
	}

	function newLanguageChosen( ){
		var m, latminmm, longminmm, extent, measurementerror, latsec, longsec;
		var offset, offsetns, offsetew, heading;
		var latdirindex, longdirindex, offsetdirnsindex, offsetdirewindex;
		var datumindex, latprecindex, loctypeindex;
		var coordsystemindex, latdirmmindex, longdirmmindex, distunitsindex;
		var distprecindex, coordsourceindex, directionindex, protocolindex;

		latdirindex=uiGetSelectedIndex( "ChoiceLatDirDMS" );
		longdirindex=uiGetSelectedIndex( "ChoiceLongDirDMS" );
		latdirmmindex=uiGetSelectedIndex( "ChoiceLatDirMM" );
		longdirmmindex=uiGetSelectedIndex( "ChoiceLongDirMM" );
		offsetdirnsindex=uiGetSelectedIndex( "ChoiceOffsetNSDir" );
		offsetdirewindex=uiGetSelectedIndex( "ChoiceOffsetEWDir" );
		latprecindex=uiGetSelectedIndex( "ChoiceLatPrecision" );
		datumindex=uiGetSelectedIndex( "ChoiceDatum" );
		loctypeindex=uiGetSelectedIndex( "ChoiceModel" );
		coordsourceindex=uiGetSelectedIndex( "ChoiceCoordSource" );
		coordsystemindex=uiGetSelectedIndex( "ChoiceCoordSystem" );
		distunitsindex=uiGetSelectedIndex( "ChoiceDistUnits" );
		distprecindex=uiGetSelectedIndex( "ChoiceDistancePrecision" );
		directionindex=uiGetSelectedIndex( "ChoiceDirection" );
		protocolindex=uiGetSelectedIndex( "ChoiceProtocol" );

		var num = null;
		
		var s = uiGetTextValue("txtT7Lat_MinMM");

		if( s == null || s.length == 0 ){
			m = 0;
		}
		else
		{
			num = formatMinMM.checkFormat(s);  
			m = num;
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
			m = num;
		}
		longminmm=m;

		s = uiGetTextValue("txtT7Lat_Sec");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatSec.checkFormat(s);  
			m = num;
		}
		latsec=m;

		s = uiGetTextValue("txtT7Long_Sec");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatSec.checkFormat(s);  
			m = num;
		}
		longsec=m;

		s = uiGetTextValue("TextFieldExtent");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s);;  
			m = num;
		}
		extent=m;
	
		s = uiGetTextValue("TextFieldMeasurementError");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s);  
			m = num;
		}
		measurementerror=m;

		s = uiGetTextValue("TextFieldOffsetNS");
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s); 
			m = num;
		}
		offsetns=m;

		s = uiGetTextValue("TextFieldOffsetEW");;
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s); 
			m = num;
		}
		offsetew=m;
		offset=m;

		s = uiGetTextValue("TextFieldHeading");;
		m = 0;
		if( s == null || s.length == 0 ){
			m = 0;
		} else {
			num = formatCalcError.checkFormat(s);   
			m = num;
		}
		heading=m;

		var language = g_language;
		clearResults();
		setVariables(language);
		setLabels();		
		
		var mi = uiGetSelectedIndex("ChoiceModel");
		populateStableControls();

		uiClearSelect("ChoiceModel");
		uiSelectAddEmptyItem("ChoiceModel");
		uiSelectAddItem("ChoiceModel","loctype.coordonly");
		uiSelectAddItem("ChoiceModel","loctype.namedplaceonly");
		uiSelectAddItem("ChoiceModel","loctype.distanceonly");
		uiSelectAddItem("ChoiceModel","loctype.distalongpath");
				
		uiSetLabel( "lblT2Dec_Lat","label.lat");
		uiSetLabel( "lblT2Dec_Long","label.lon");

		uiSelectAddItem("ChoiceModel","loctype.orthodist");
		uiSelectAddItem("ChoiceModel","loctype.distatheading");
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
		uiSetTextExplicit("TextFieldOffsetNS",formatCalcError.checkFormat( offset ) );
		uiSetTextExplicit("TextFieldOffsetEW",formatCalcError.checkFormat( offsetew ) );
		uiSetTextExplicit("TextFieldHeading",formatCalcError.checkFormat( heading ) );

		if(loctypeindex >= 0) // a loctype has been chosen
		{
			if(uiGetSelectedText( "ChoiceModel") ==
			g_properties.getPropertyLang("loctype.orthodist"))
			{
				uiSetLabelExplicit("LabelOffsetNS", g_properties.getPropertyLang("label.distns"));
			}
			uiSetSelectedIndex("ChoiceModel",loctypeindex);
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
		if(protocolindex >= 0)
		{
			uiSetSelectedIndex("ChoiceProtocol",protocolindex);
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
			return;
		}

		showResults(false);
		clearResults();
		
		showDistancePrecision(false);
		showDirectionPrecision(false);
		setVisibility("ButtonCalculate",false);
		setVisibility("ButtonCopy",false);
		setVisibility("ButtonPromote",false);
		
		showOffset(false);
		showNSOffset(false);
		showEWOffset(false);
		
		uiHideElement("TextFieldHeading");
		
		showCoordinateSystem(true);
		showCoordinateSource(true);
		showDistanceUnits(true);
		showCoordinatePrecision(true);
		showExtents(true);
		showMeasurementError(true);
		showErrors(true);
		showRelevantCoordinates();
		
		uiSetLabel("LabelOffsetEW","label.offset");
		uiSetLabel("LabelExtent","label.extent");
		uiSetLabel("LabelMeasurementError","label.measurementerror");
		var value = uiGetSelectedText("ChoiceModel");
		var index = g_canonicalloctypes.indexOf(value);
		var csource = uiGetSelectedText("ChoiceCoordSource");

		var cindex = g_canonicalsources.indexOf(csource);
		if( cindex==3 ){ // GPS
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
			showNSOffset(true);
			showEWOffset(true);
			showDistancePrecision(true);
		} else if( index==5 ){ // Distance at a heading
			showOffset(true);
			showDistancePrecision(true);
			showDirectionPrecision(true);
		}
		setVisibility( "LabelDatum", true );
		setVisibility( "ChoiceDatum", true );

		setVisibility("ButtonCalculate",true);
		setVisibility("ButtonCopy",true);
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
		clearResults();
		showRelevantCoordinates();
		populateCoordinatePrecision(value);
		
		testLatLongLimits();
		translateCoords();
		lastcoordsystem = g_canonicalcoordsystems.indexOf( value );
		lastcoordsystem = lastcoordsystem  + 1;
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
		
		showOffset(false);
		showNSOffset(false);
		showEWOffset(false);

		setVisibility("TextFieldOffsetEW", false);
		setVisibility("ChoiceOffsetEWDir", false);
		uiHideElement("ChoiceOffsetNSDir");
		uiHideElement("TextFieldHeading");
		setVisibility("LabelOffsetEW", false);
		setVisibility("LabelOffsetNS", false);
		
		setVisibility("ButtonCalculate", false);
		setVisibility("ButtonCopy", false);
		setVisibility("ButtonPromote", false);
		
		setVisibility("LabelModel", true);
		setVisibility("ChoiceModel", true);		
	}

	function clearResults()
	{
		uiEmptyTextElement( "TextFieldCalcDecLat" );
		uiEmptyTextElement( "TextFieldCalcDecLong" );
		uiEmptyTextElement( "TextFieldCalcErrorDist" );
		uiEmptyTextElement( "TextFieldCalcDatum" );
		uiEmptyTextElement( "TextFieldCalcPrecision" );
		uiEmptyTextElement( "TextFieldFullResult" );
	}

	function setLabels( ){
		var language = g_language;
		var loctypeindex=uiGetSelectedIndex( "ChoiceModel" );
		var version = g_versionNumber;
		var v = g_properties.getPropertyLang("version")+" " + version + language;
		uiSetLabelExplicit("LabelVersion", v);
		uiSetLabelExplicit("LabelCopyright", g_embeddedCopyright);
		
		uiSetLabel("LabelTitle","label.title");
		uiSetLabel("LabelModel","label.loctype");
		uiSetLabel("LabelCoordSource","label.coordsource");
		uiSetLabel("LabelCoordSystem","label.coordsys");
		uiSetLabel("lblT2Dec_Lat","label.lat");
		uiSetLabel("lblT2Dec_Long","label.lon");
		uiSetLabel("LabelDatum","label.datum");
		uiSetLabel("LabelLatPrecision","label.coordprec");
		uiSetLabel("LabelOffsetEW","label.distew");

		if( loctypeindex==5 ){ // Distance in orthogonal directions
		    uiSetLabel("LabelOffsetEW","label.distew");
		} else {
		    uiSetLabel("LabelOffsetEW","label.offset");
		}
		uiSetLabel("LabelExtent","label.extent");
		uiSetLabel("LabelMeasurementError","label.measurementerror");
		uiSetLabel("LabelDistUnits","label.distunits");
		uiSetLabel("LabelDistancePrecision","label.distprec");
		
		uiSetLabel("LabelDirection","label.direction");
		uiSetLabel("LabelCalcDecLat","label.declat");
		uiSetLabel("LabelCalcDecLong","label.declon");
		uiSetLabel("LabelCalcMaxError","label.maxerrdist");
		uiSetLabel("LabelCalcDatum","label.datum");
		uiSetLabel("LabelCalcPrecision","label.coordprec");
		uiSetLabel("LabelCalcGeoreferencer","label.georeferencer");
		uiSetLabel("LabelCalcDate","label.date");
		uiSetLabel("LabelCalcProtocol","label.protocol");

		uiSetLabelExplicit("ButtonCalculate",g_properties.getPropertyLang("label.calculate"));
		uiSetLabelExplicit("ButtonCopy",g_properties.getPropertyLang("label.copy"));
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
		
		var error = Math.sqrt( Math.pow(latmetersperdegree,2.0) + Math.pow(longmetersperdegree,2.0) );

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
			var src = e.srcElement;
			var id = src.id;
			var clear = true;

			if( id == "TextFieldFromDistance" )
			{
				clear = false;
				onDistConvertKeyUp();
			}
			else if( id == "TextFieldScaleFromDistance" )
			{
				clear = false;
				onScaleConvertKeyUp()
			}
			else if( id == "TextFieldCalcGeoreferencer" )
			{
				clear = false;
			}
			
			else if( src.readOnly )
			{
				clear = false;
			}
			
			if( clear )
			{
				clearResults();
			}
		}
	}
	else if( e.keyIdentifier == "U+0044" && e.shiftKey == true && e.ctrlKey == true && e.altKey == true  )
	// Mac combination is option control shift d
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

		// Protocol controls
		uiClearSelect("ChoiceProtocol");
		uiSelectAddItem("ChoiceProtocol","protocol.notrecorded");
		uiSelectAddItem("ChoiceProtocol","protocol.qrg2012");
		uiSelectAddItem("ChoiceProtocol","protocol.qrg2020");

		// Datum controls
		uiClearSelect("ChoiceDatum");
		uiSelectAddItem("ChoiceDatum","datum.notrecorded");

        uiSelectAddExplicitItem("ChoiceDatum","(WGS84) World Geodetic System 1984");
        uiSelectAddExplicitItem("ChoiceDatum","Abidjan 1987");
        uiSelectAddExplicitItem("ChoiceDatum","Accra");
        uiSelectAddExplicitItem("ChoiceDatum","Aden 1925");
        uiSelectAddExplicitItem("ChoiceDatum","Adindan");
        uiSelectAddExplicitItem("ChoiceDatum","Afgooye");
        uiSelectAddExplicitItem("ChoiceDatum","Ain el Abd 1970");
        uiSelectAddExplicitItem("ChoiceDatum","Airy 1830 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Airy Modified 1849 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Alaska (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Alaska/Canada (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Albanian 1987");
        uiSelectAddExplicitItem("ChoiceDatum","American Samoa 1962");
        uiSelectAddExplicitItem("ChoiceDatum","Amersfoort");
        uiSelectAddExplicitItem("ChoiceDatum","Ammassalik 1958");
        uiSelectAddExplicitItem("ChoiceDatum","Anguilla 1957");
        uiSelectAddExplicitItem("ChoiceDatum","Anna 1 Astro 1965");
        uiSelectAddExplicitItem("ChoiceDatum","Antigua Island Astro 1943");
        uiSelectAddExplicitItem("ChoiceDatum","Aratu");
        uiSelectAddExplicitItem("ChoiceDatum","Arc 1950 mean");
        uiSelectAddExplicitItem("ChoiceDatum","Arc 1960 mean");
        uiSelectAddExplicitItem("ChoiceDatum","Ascension Island 1958");
        uiSelectAddExplicitItem("ChoiceDatum","Astro Beacon \"E\" 1945");
        uiSelectAddExplicitItem("ChoiceDatum","Astro DOS 71/4");
        uiSelectAddExplicitItem("ChoiceDatum","Astro Tern Island (FRIG) 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Astronomic Station No. 1 1951");
        uiSelectAddExplicitItem("ChoiceDatum","Astronomic Station No. 2 1951, Truk Island");
        uiSelectAddExplicitItem("ChoiceDatum","Astronomic Station Ponape 1951");
        uiSelectAddExplicitItem("ChoiceDatum","Astronomical Station 1952");
        uiSelectAddExplicitItem("ChoiceDatum","Australian Antarctic Datum 1998");
        uiSelectAddExplicitItem("ChoiceDatum","(AGD66) Australian Geodetic Datum 1966");
        uiSelectAddExplicitItem("ChoiceDatum","(AGD84) Australian Geodetic Datum 1984");
        uiSelectAddExplicitItem("ChoiceDatum","Australian National ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Autonomous Regions of Portugal 2008");
        uiSelectAddExplicitItem("ChoiceDatum","Average Terrestrial System 1977 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Ayabelle Lighthouse");
        uiSelectAddExplicitItem("ChoiceDatum","Azores Central Islands 1948");
        uiSelectAddExplicitItem("ChoiceDatum","Azores Central Islands 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Azores Occidental Islands 1939");
        uiSelectAddExplicitItem("ChoiceDatum","Azores Oriental Islands 1940");
        uiSelectAddExplicitItem("ChoiceDatum","Azores Oriental Islands 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Bahamas (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Barbados 1938");
        uiSelectAddExplicitItem("ChoiceDatum","Batavia");
        uiSelectAddExplicitItem("ChoiceDatum","Beduaram");
        uiSelectAddExplicitItem("ChoiceDatum","Beijing 1954");
        uiSelectAddExplicitItem("ChoiceDatum","Bekaa Valley 1920 (IGN)");
        uiSelectAddExplicitItem("ChoiceDatum","Bellevue (IGN)");
        uiSelectAddExplicitItem("ChoiceDatum","Bermuda 1957");
        uiSelectAddExplicitItem("ChoiceDatum","Bermuda 2000");
        uiSelectAddExplicitItem("ChoiceDatum","Bessel 1841 ellipsoid (Namibia)");
        uiSelectAddExplicitItem("ChoiceDatum","Bessel 1841 ellipsoid (non-Namibia)");
        uiSelectAddExplicitItem("ChoiceDatum","Bessel Modified ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Bhutan National Geodetic Datum");
        uiSelectAddExplicitItem("ChoiceDatum","Bioko");
        uiSelectAddExplicitItem("ChoiceDatum","Bissau");
        uiSelectAddExplicitItem("ChoiceDatum","Bogota 1975");
        uiSelectAddExplicitItem("ChoiceDatum","Bukit Rimpah");
        uiSelectAddExplicitItem("ChoiceDatum","Bulgaria Geodetic System 2005");
        uiSelectAddExplicitItem("ChoiceDatum","Cadastre 1997");
        uiSelectAddExplicitItem("ChoiceDatum","Camacupa");
        uiSelectAddExplicitItem("ChoiceDatum","Camp Area Astro");
        uiSelectAddExplicitItem("ChoiceDatum","Campo Inchauspe");
        uiSelectAddExplicitItem("ChoiceDatum","Canada Mean (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Canal Zone (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Canton Astro 1966");
        uiSelectAddExplicitItem("ChoiceDatum","Cape");
        uiSelectAddExplicitItem("ChoiceDatum","Cape Canaveral mean");
        uiSelectAddExplicitItem("ChoiceDatum","Caribbean (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Carthage");
        uiSelectAddExplicitItem("ChoiceDatum","Cayman Islands Geodetic Datum 2011");
        uiSelectAddExplicitItem("ChoiceDatum","Central America (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Centre Spatial Guyanais 1967");
        uiSelectAddExplicitItem("ChoiceDatum","CH1903");
        uiSelectAddExplicitItem("ChoiceDatum","CH1903+");
        uiSelectAddExplicitItem("ChoiceDatum","Chatham Island Astro 1971");
        uiSelectAddExplicitItem("ChoiceDatum","Chatham Islands Datum 1979");
        uiSelectAddExplicitItem("ChoiceDatum","Chua Astro");
        uiSelectAddExplicitItem("ChoiceDatum","Clarke 1858 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Clarke 1866 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Clarke 1880 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Clarke 1880 (Benoit) ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Clarke 1880 (international foot) ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Co-Ordinate System 1937 of Estonia");
        uiSelectAddExplicitItem("ChoiceDatum","Cocos Islands 1965");
        uiSelectAddExplicitItem("ChoiceDatum","Combani 1950");
        uiSelectAddExplicitItem("ChoiceDatum","Conakry 1905");
        uiSelectAddExplicitItem("ChoiceDatum","Congo 1960 Pointe Noire");
        uiSelectAddExplicitItem("ChoiceDatum","Corrego Alegre 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Corrego Alegre 1970-72");
        uiSelectAddExplicitItem("ChoiceDatum","Costa Rica 2005");
        uiSelectAddExplicitItem("ChoiceDatum","Cuba (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Croatian Terrestrial Reference System");
        uiSelectAddExplicitItem("ChoiceDatum","Cyprus");
        uiSelectAddExplicitItem("ChoiceDatum","Cyprus Geodetic Reference System 1993");
        uiSelectAddExplicitItem("ChoiceDatum","Dabola 1981");
        uiSelectAddExplicitItem("ChoiceDatum","Danish 1876");
        uiSelectAddExplicitItem("ChoiceDatum","Datum 73");
        uiSelectAddExplicitItem("ChoiceDatum","Datum Geodesi Nasional 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Dealul Piscului 1930");
        uiSelectAddExplicitItem("ChoiceDatum","Deception Island");
        uiSelectAddExplicitItem("ChoiceDatum","Deir ez Zor");
        uiSelectAddExplicitItem("ChoiceDatum","Deutsches Hauptdreiecksnetz");
        uiSelectAddExplicitItem("ChoiceDatum","Diego Garcia 1969");
        uiSelectAddExplicitItem("ChoiceDatum","Djakarta (Batavia)");
        uiSelectAddExplicitItem("ChoiceDatum","DOS 1968");
        uiSelectAddExplicitItem("ChoiceDatum","Dominica 1945");
        uiSelectAddExplicitItem("ChoiceDatum","Douala 1948");
        uiSelectAddExplicitItem("ChoiceDatum","Easter Island 1967"); 
        uiSelectAddExplicitItem("ChoiceDatum","Egypt 1907");
        uiSelectAddExplicitItem("ChoiceDatum","Egypt Gulf of Suez S-650 TL");
        uiSelectAddExplicitItem("ChoiceDatum","Estonia 1992");
        uiSelectAddExplicitItem("ChoiceDatum","Estonia 1997");
        uiSelectAddExplicitItem("ChoiceDatum","European 1950");
        uiSelectAddExplicitItem("ChoiceDatum","European 1950 mean");
        uiSelectAddExplicitItem("ChoiceDatum","European Datum 1950(1977)");
        uiSelectAddExplicitItem("ChoiceDatum","European 1979 mean");
        uiSelectAddExplicitItem("ChoiceDatum","European Datum 1987");
        uiSelectAddExplicitItem("ChoiceDatum","European Libyan Datum 1979");
        uiSelectAddExplicitItem("ChoiceDatum","European Terrestrial Reference System 1989");
        uiSelectAddExplicitItem("ChoiceDatum","Everest ellipsoid (Brunei, Sabah, Sarawak)");
        uiSelectAddExplicitItem("ChoiceDatum","Everest ellipsoid (W. Malaysia, Singapore 1948)");
        uiSelectAddExplicitItem("ChoiceDatum","Everest 1830 (1937 Adjustment) ellipsoid India");
        uiSelectAddExplicitItem("ChoiceDatum","Everest India 1856 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Everest 1830 (1962 Definition) ellipsoid India");
        uiSelectAddExplicitItem("ChoiceDatum","Everest 1830 (1975 Definition) ellipsoid India");
        uiSelectAddExplicitItem("ChoiceDatum","Everest Pakistan ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Everest W. Malaysia 1969 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Fahud");
        uiSelectAddExplicitItem("ChoiceDatum","Fatu Iva 72");
        uiSelectAddExplicitItem("ChoiceDatum","Fehmarnbelt Datum 2010");
        uiSelectAddExplicitItem("ChoiceDatum","Fiji 1956");
        uiSelectAddExplicitItem("ChoiceDatum","Fiji Geodetic Datum 1986");
        uiSelectAddExplicitItem("ChoiceDatum","Final Datum 1958");
        uiSelectAddExplicitItem("ChoiceDatum","Finnish Nautical Chart");
        uiSelectAddExplicitItem("ChoiceDatum","Fort Marigot");
        uiSelectAddExplicitItem("ChoiceDatum","Fort Thomas 1955");
        uiSelectAddExplicitItem("ChoiceDatum","Gambia");
        uiSelectAddExplicitItem("ChoiceDatum","Gan 1970");
        uiSelectAddExplicitItem("ChoiceDatum","Gandajika Base");
        uiSelectAddExplicitItem("ChoiceDatum","Gan 1970");
        uiSelectAddExplicitItem("ChoiceDatum","Geocentric Datum Brunei Darussalam 2009");
        uiSelectAddExplicitItem("ChoiceDatum","Geocentric Datum of Australia 1994");
        uiSelectAddExplicitItem("ChoiceDatum","Geocentric Datum of Australia 2020");
        uiSelectAddExplicitItem("ChoiceDatum","Geocentric Datum of Korea");
        uiSelectAddExplicitItem("ChoiceDatum","Geodetic Datum of 1965");
        uiSelectAddExplicitItem("ChoiceDatum","Geodetic Datum 1949");
        uiSelectAddExplicitItem("ChoiceDatum","Geodetic Reference System 1967 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Geodetic Reference System 1967 Modified ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Geodetic Reference System 1980 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Ghana");
        uiSelectAddExplicitItem("ChoiceDatum","Graciosa Base SW 1948");
        uiSelectAddExplicitItem("ChoiceDatum","Grand Cayman Geodetic Datum 1959");
        uiSelectAddExplicitItem("ChoiceDatum","Grand Comoros");
        uiSelectAddExplicitItem("ChoiceDatum","Greek Geodetic Reference System 1987");
        uiSelectAddExplicitItem("ChoiceDatum","Greenland (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Greenland 1996");
        uiSelectAddExplicitItem("ChoiceDatum","Grenada 1953");
        uiSelectAddExplicitItem("ChoiceDatum","Guadeloupe 1948");
        uiSelectAddExplicitItem("ChoiceDatum","Guam 1963");
        uiSelectAddExplicitItem("ChoiceDatum","Gulshan 303");
        uiSelectAddExplicitItem("ChoiceDatum","Gunung Segara");
        uiSelectAddExplicitItem("ChoiceDatum","Gunung Serindung 1962");
        uiSelectAddExplicitItem("ChoiceDatum","GUX 1 Astro");
        uiSelectAddExplicitItem("ChoiceDatum","Hanoi 1972");
        uiSelectAddExplicitItem("ChoiceDatum","Hartebeesthoek94");
        uiSelectAddExplicitItem("ChoiceDatum","Helle 1954");
        uiSelectAddExplicitItem("ChoiceDatum","Helmert 1906 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Herat North");
        uiSelectAddExplicitItem("ChoiceDatum","Hito XVIII 1963");
        uiSelectAddExplicitItem("ChoiceDatum","Hjorsey 1955");
        uiSelectAddExplicitItem("ChoiceDatum","Hong Kong 1963(67)");
        uiSelectAddExplicitItem("ChoiceDatum","Hong Kong 1980");
        uiSelectAddExplicitItem("ChoiceDatum","Hong Kong Geodetic");
        uiSelectAddExplicitItem("ChoiceDatum","Hough 1960 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Hu-Tzu-Shan 1950");
        uiSelectAddExplicitItem("ChoiceDatum","Hungarian Datum 1909");
        uiSelectAddExplicitItem("ChoiceDatum","Hungarian Datum 1972");
        uiSelectAddExplicitItem("ChoiceDatum","IGN 1962 Kerguelen");
        uiSelectAddExplicitItem("ChoiceDatum","IGN53 Mare");
        uiSelectAddExplicitItem("ChoiceDatum","IGN56 Lifou");
        uiSelectAddExplicitItem("ChoiceDatum","IGN63 Hiva Oa");
        uiSelectAddExplicitItem("ChoiceDatum","IGN72 Grande Terre");
        uiSelectAddExplicitItem("ChoiceDatum","IGN72 Nuku Hiva");
        uiSelectAddExplicitItem("ChoiceDatum","Indian");
        uiSelectAddExplicitItem("ChoiceDatum","Indian 1954");
        uiSelectAddExplicitItem("ChoiceDatum","Indian 1960");
        uiSelectAddExplicitItem("ChoiceDatum","Indian 1975");
        uiSelectAddExplicitItem("ChoiceDatum","Indonesian 1974 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Indonesian Datum 1974");
        uiSelectAddExplicitItem("ChoiceDatum","Institut Geographique du Congo Belge 1955");
        uiSelectAddExplicitItem("ChoiceDatum","International 1924 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Iran");
        uiSelectAddExplicitItem("ChoiceDatum","Iraqi Geospatial Reference System");
        uiSelectAddExplicitItem("ChoiceDatum","Iraq-Kuwait Boundary Datum 1992");
        uiSelectAddExplicitItem("ChoiceDatum","Ireland 1965");
        uiSelectAddExplicitItem("ChoiceDatum","IRENET95");
        uiSelectAddExplicitItem("ChoiceDatum","Islands Net 1993");
        uiSelectAddExplicitItem("ChoiceDatum","Islands Net 2004");
        uiSelectAddExplicitItem("ChoiceDatum","Israel 1993");
        uiSelectAddExplicitItem("ChoiceDatum","Istituto Geografico Militaire 1995");
        uiSelectAddExplicitItem("ChoiceDatum","ISTS 061 Astro 1968");
        uiSelectAddExplicitItem("ChoiceDatum","ISTS 073 Astro 1969");
        uiSelectAddExplicitItem("ChoiceDatum","Iwo Jima 1945");
        uiSelectAddExplicitItem("ChoiceDatum","Jamaica 1969");
        uiSelectAddExplicitItem("ChoiceDatum","Jamaica 2001");
        uiSelectAddExplicitItem("ChoiceDatum","Japanese Geodetic Datum 2000");
        uiSelectAddExplicitItem("ChoiceDatum","Johnston Island 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Jouik 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Kalianpur 1937");
        uiSelectAddExplicitItem("ChoiceDatum","Kalianpur 1962");
        uiSelectAddExplicitItem("ChoiceDatum","Kalianpur 1975");
        uiSelectAddExplicitItem("ChoiceDatum","Kandawala");
        uiSelectAddExplicitItem("ChoiceDatum","Kapingamarangi Astronomic Station No. 3 1951");
        uiSelectAddExplicitItem("ChoiceDatum","Karbala 1979");
        uiSelectAddExplicitItem("ChoiceDatum","Kartastokoordinaattijarjestelma (1966)");
        uiSelectAddExplicitItem("ChoiceDatum","Katanga 1955");
        uiSelectAddExplicitItem("ChoiceDatum","Kerguelen Island 1949");
        uiSelectAddExplicitItem("ChoiceDatum","Kertau 1948");
        uiSelectAddExplicitItem("ChoiceDatum","Kertau 1968");
        uiSelectAddExplicitItem("ChoiceDatum","Korean Datum 1985");
        uiSelectAddExplicitItem("ChoiceDatum","Korean Geodetic System 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Kosovo Reference System 2001");
        uiSelectAddExplicitItem("ChoiceDatum","Krassowsky 1940 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Kusaie Astro 1951");
        uiSelectAddExplicitItem("ChoiceDatum","Kuwait Oil Company");
        uiSelectAddExplicitItem("ChoiceDatum","Kuwait Utility");
        uiSelectAddExplicitItem("ChoiceDatum","L.C. 5 Astro 1961");
        uiSelectAddExplicitItem("ChoiceDatum","La Canoa");
        uiSelectAddExplicitItem("ChoiceDatum","La Reunion");
        uiSelectAddExplicitItem("ChoiceDatum","Lao National Datum 1997");
        uiSelectAddExplicitItem("ChoiceDatum","Latvia 1992");
        uiSelectAddExplicitItem("ChoiceDatum","Le Pouce 1934");
        uiSelectAddExplicitItem("ChoiceDatum","Leigon");
        uiSelectAddExplicitItem("ChoiceDatum","Lemuta");
        uiSelectAddExplicitItem("ChoiceDatum","Liberia 1964");
        uiSelectAddExplicitItem("ChoiceDatum","Libyan Geodetic Datum 2006");
        uiSelectAddExplicitItem("ChoiceDatum","Lisbon 1890");
        uiSelectAddExplicitItem("ChoiceDatum","Lisbon 1937");
        uiSelectAddExplicitItem("ChoiceDatum","Lithuania 1994 (ETRS89)");
        uiSelectAddExplicitItem("ChoiceDatum","Locodjo 1965");
        uiSelectAddExplicitItem("ChoiceDatum","Luxembourg 1930");
        uiSelectAddExplicitItem("ChoiceDatum","Luzon 1911");
        uiSelectAddExplicitItem("ChoiceDatum","Macao 1920");
        uiSelectAddExplicitItem("ChoiceDatum","Macao Geodetic Datum 2008");
        uiSelectAddExplicitItem("ChoiceDatum","Mahe 1971");
        uiSelectAddExplicitItem("ChoiceDatum","Makassar");
        uiSelectAddExplicitItem("ChoiceDatum","Malongo 1987");
        uiSelectAddExplicitItem("ChoiceDatum","Manoca 1962");
        uiSelectAddExplicitItem("ChoiceDatum","Marco Astro");
        uiSelectAddExplicitItem("ChoiceDatum","Marco Geocentrico Nacional de Referencia");
        uiSelectAddExplicitItem("ChoiceDatum","Marco Geodesico Nacional de Bolivia");
        uiSelectAddExplicitItem("ChoiceDatum","Marcus Island 1952");
        uiSelectAddExplicitItem("ChoiceDatum","Marshall Islands 1960");
        uiSelectAddExplicitItem("ChoiceDatum","Martinique 1938");
        uiSelectAddExplicitItem("ChoiceDatum","Masirah Is. (Nahrwan)");
        uiSelectAddExplicitItem("ChoiceDatum","Massawa");
        uiSelectAddExplicitItem("ChoiceDatum","Maupiti 83");
        uiSelectAddExplicitItem("ChoiceDatum","Mauritania 1999");
        uiSelectAddExplicitItem("ChoiceDatum","Merchich");
        uiSelectAddExplicitItem("ChoiceDatum","Mexico (NAD27)");
        uiSelectAddExplicitItem("ChoiceDatum","Mexico ITRF2008");
        uiSelectAddExplicitItem("ChoiceDatum","Mexico ITRF92");
        uiSelectAddExplicitItem("ChoiceDatum","MGI 1901");
        uiSelectAddExplicitItem("ChoiceDatum","Midway Astro 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Militar-Geographische Institut");
        uiSelectAddExplicitItem("ChoiceDatum","Mindanao");
        uiSelectAddExplicitItem("ChoiceDatum","Minna"); 
        uiSelectAddExplicitItem("ChoiceDatum","Modified Fischer 1960 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","MOLDREF99");
        uiSelectAddExplicitItem("ChoiceDatum","MOMRA Terrestrial Reference Frame 2000");
        uiSelectAddExplicitItem("ChoiceDatum","Monte Mario");
        uiSelectAddExplicitItem("ChoiceDatum","Montjong Lowe");
        uiSelectAddExplicitItem("ChoiceDatum","Montserrat Island Astro 1958");
        uiSelectAddExplicitItem("ChoiceDatum","Moorea 87");
        uiSelectAddExplicitItem("ChoiceDatum","MOP78");
        uiSelectAddExplicitItem("ChoiceDatum","Moznet (ITRF94)");
        uiSelectAddExplicitItem("ChoiceDatum","M'Poraloko");
        uiSelectAddExplicitItem("ChoiceDatum","Nahrwan");
        uiSelectAddExplicitItem("ChoiceDatum","Nahrwan 1934");
        uiSelectAddExplicitItem("ChoiceDatum","Nahrwan 1967");
        uiSelectAddExplicitItem("ChoiceDatum","Nakhl-e Ghanem");
        uiSelectAddExplicitItem("ChoiceDatum","Naparima 1955");
        uiSelectAddExplicitItem("ChoiceDatum","Naparima 1972");
        uiSelectAddExplicitItem("ChoiceDatum","Naparima, BWI");
        uiSelectAddExplicitItem("ChoiceDatum","National Geodetic Network");
        uiSelectAddExplicitItem("ChoiceDatum","NEA74 Noumea");
        uiSelectAddExplicitItem("ChoiceDatum","Nepal 1981");
        uiSelectAddExplicitItem("ChoiceDatum","New Zealand Geodetic Datum 1949");
        uiSelectAddExplicitItem("ChoiceDatum","New Zealand Geodetic Datum 2000");
        uiSelectAddExplicitItem("ChoiceDatum","NGO 1948");
        uiSelectAddExplicitItem("ChoiceDatum","(NAD83) North American Datum 1983");
        uiSelectAddExplicitItem("ChoiceDatum","NAD83 (High Accuracy Reference Network)");
        uiSelectAddExplicitItem("ChoiceDatum","NAD83 (National Spatial Reference System 2007)");
        uiSelectAddExplicitItem("ChoiceDatum","NAD83 Canadian Spatial Reference System");
        uiSelectAddExplicitItem("ChoiceDatum","North American Datum 1927");
        uiSelectAddExplicitItem("ChoiceDatum","North American Datum 1927 (1976)");
        uiSelectAddExplicitItem("ChoiceDatum","North American Datum 1927 (CGQ77)");
        uiSelectAddExplicitItem("ChoiceDatum","(NAD27) North American 1927 mean");
        uiSelectAddExplicitItem("ChoiceDatum","Nord Sahara 1959");
        uiSelectAddExplicitItem("ChoiceDatum","Nouakchott 1965");
        uiSelectAddExplicitItem("ChoiceDatum","Nouvelle Triangulation Francaise");
        uiSelectAddExplicitItem("ChoiceDatum","Observatorio Meteorologico 1939");
        uiSelectAddExplicitItem("ChoiceDatum","Observatorio 1966");
        uiSelectAddExplicitItem("ChoiceDatum","Ocotepeque 1935");
        uiSelectAddExplicitItem("ChoiceDatum","Old Egyptian 1907");
        uiSelectAddExplicitItem("ChoiceDatum","Old Hawaiian mean");
        uiSelectAddExplicitItem("ChoiceDatum","Old Hawaiian Kauai");
        uiSelectAddExplicitItem("ChoiceDatum","Old Hawaiian Maui");
        uiSelectAddExplicitItem("ChoiceDatum","Old Hawaiian Oahu");
        uiSelectAddExplicitItem("ChoiceDatum","Old Trinidad 1903");
        uiSelectAddExplicitItem("ChoiceDatum","Oman");
        uiSelectAddExplicitItem("ChoiceDatum","Oman National Geodetic Datum 2014");
        uiSelectAddExplicitItem("ChoiceDatum","Ordnance Survey of Great Britain 1936");
        uiSelectAddExplicitItem("ChoiceDatum","Ordnance Survey of Northern Ireland 1952");
        uiSelectAddExplicitItem("ChoiceDatum","Padang 1884");
        uiSelectAddExplicitItem("ChoiceDatum","Palestine 1923");
        uiSelectAddExplicitItem("ChoiceDatum","Pampa del Castillo");
        uiSelectAddExplicitItem("ChoiceDatum","Papua New Guinea Geodetic Datum 1994");
        uiSelectAddExplicitItem("ChoiceDatum","Parametry Zemli 1990");
        uiSelectAddExplicitItem("ChoiceDatum","PDO Survey Datum 1993");
        uiSelectAddExplicitItem("ChoiceDatum","Peru96");
        uiSelectAddExplicitItem("ChoiceDatum","Petrels 1972");
        uiSelectAddExplicitItem("ChoiceDatum","Philippine Reference System 1992");
        uiSelectAddExplicitItem("ChoiceDatum","Phoenix Islands 1966");
        uiSelectAddExplicitItem("ChoiceDatum","Pico de las Nieves 1984");
        uiSelectAddExplicitItem("ChoiceDatum","Pitcairn 2006");
        uiSelectAddExplicitItem("ChoiceDatum","Pitcairn Astro 1967");
        uiSelectAddExplicitItem("ChoiceDatum","Point 58");
        uiSelectAddExplicitItem("ChoiceDatum","Point Noire 1958");
        uiSelectAddExplicitItem("ChoiceDatum","Pointe Geologie Perroud 1950");
        uiSelectAddExplicitItem("ChoiceDatum","Porto Santo 1936");
        uiSelectAddExplicitItem("ChoiceDatum","Porto Santo 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Posiciones Geodesicas Argentinas 1994");
        uiSelectAddExplicitItem("ChoiceDatum","Posiciones Geodesicas Argentinas 1998");
        uiSelectAddExplicitItem("ChoiceDatum","Posiciones Geodesicas Argentinas 2007");
        uiSelectAddExplicitItem("ChoiceDatum","Potsdam Datum/83");
        uiSelectAddExplicitItem("ChoiceDatum","Potsdam Rauenberg DHDN");
        uiSelectAddExplicitItem("ChoiceDatum","Provisional South American 1956");
        uiSelectAddExplicitItem("ChoiceDatum","Provisional South Chilean 1963");
        uiSelectAddExplicitItem("ChoiceDatum","Puerto Rico");
        uiSelectAddExplicitItem("ChoiceDatum","Pulkovo 1942");
        uiSelectAddExplicitItem("ChoiceDatum","Pulkovo 1942(58)");
        uiSelectAddExplicitItem("ChoiceDatum","Pulkovo 1942(83)");
        uiSelectAddExplicitItem("ChoiceDatum","Pulkovo 1995");
        uiSelectAddExplicitItem("ChoiceDatum","PZ-90");
        uiSelectAddExplicitItem("ChoiceDatum","Qatar 1974");
        uiSelectAddExplicitItem("ChoiceDatum","Qatar National Datum 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Qornoq 1927");
        uiSelectAddExplicitItem("ChoiceDatum","Rassadiran");
        uiSelectAddExplicitItem("ChoiceDatum","Rauenberg Datum/83");
        uiSelectAddExplicitItem("ChoiceDatum","Red Geodesica de Canarias 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Red Geodesica Venezolana");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau de Reference des Antilles Francaises 1991");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique de la Polynesie Francaise");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique de la RDC 2005");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique de la Reunion 1992");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique de Mayotte 2004");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique de Nouvelle Caledonie 91-93");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique de Saint Pierre et Miquelon 2006");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique des Antilles Francaises 2009");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique Francais 1993");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau Geodesique Francais Guyane 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Reseau National Belge 1972");
        uiSelectAddExplicitItem("ChoiceDatum","Rete Dinamica Nazionale 2008");
        uiSelectAddExplicitItem("ChoiceDatum","Reunion 1947");
        uiSelectAddExplicitItem("ChoiceDatum","Reykjavik 1900");
        uiSelectAddExplicitItem("ChoiceDatum","Rikets koordinatsystem 1990");
        uiSelectAddExplicitItem("ChoiceDatum","Rome 1940");
        uiSelectAddExplicitItem("ChoiceDatum","Ross Sea Region Geodetic Datum 2000");
        uiSelectAddExplicitItem("ChoiceDatum","S-42");
        uiSelectAddExplicitItem("ChoiceDatum","S-JTSK");
        uiSelectAddExplicitItem("ChoiceDatum","Saint Pierre et Miquelon 1950");
        uiSelectAddExplicitItem("ChoiceDatum","Santo (DOS) 1965");
        uiSelectAddExplicitItem("ChoiceDatum","Sao Braz");
        uiSelectAddExplicitItem("ChoiceDatum","Sapper Hill 1943");
        uiSelectAddExplicitItem("ChoiceDatum","Schwarzeck");
        uiSelectAddExplicitItem("ChoiceDatum","Scoresbysund 1952");
        uiSelectAddExplicitItem("ChoiceDatum","Selvagem Grande 1938");
        uiSelectAddExplicitItem("ChoiceDatum","Serbian Reference Network 1998");
        uiSelectAddExplicitItem("ChoiceDatum","Serbian Spatial Reference System 2000");
        uiSelectAddExplicitItem("ChoiceDatum","Sicily");
        uiSelectAddExplicitItem("ChoiceDatum","Sierra Leone 1960");
        uiSelectAddExplicitItem("ChoiceDatum","Sierra Leone 1968");
        uiSelectAddExplicitItem("ChoiceDatum","SIRGAS_ES2007.8");
        uiSelectAddExplicitItem("ChoiceDatum","SIRGAS-Chile");
        uiSelectAddExplicitItem("ChoiceDatum","SIRGAS-ROU98");
        uiSelectAddExplicitItem("ChoiceDatum","Sistema de Referencia Geocentrico para America del Sur 1995");
        uiSelectAddExplicitItem("ChoiceDatum","Sistema de Referencia Geocentrico para las Americas 2000");
        uiSelectAddExplicitItem("ChoiceDatum","Sistema Geodesico Nacional de Panama MACARIO SOLIS");
        uiSelectAddExplicitItem("ChoiceDatum","Sister Islands Geodetic Datum 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Slovenia Geodetic Datum 1996");
        uiSelectAddExplicitItem("ChoiceDatum","Solomon 1968");
        uiSelectAddExplicitItem("ChoiceDatum","South American 1969 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","South American Datum 1969");
        uiSelectAddExplicitItem("ChoiceDatum","South American Datum 1969(96)");
        uiSelectAddExplicitItem("ChoiceDatum","South Asia");
        uiSelectAddExplicitItem("ChoiceDatum","South East Island 1943");
        uiSelectAddExplicitItem("ChoiceDatum","South Georgia 1968");
        uiSelectAddExplicitItem("ChoiceDatum","South Yemen");
        uiSelectAddExplicitItem("ChoiceDatum","Southeast Base");
        uiSelectAddExplicitItem("ChoiceDatum","Sri Lanka Datum 1999");
        uiSelectAddExplicitItem("ChoiceDatum","St. George Island");
        uiSelectAddExplicitItem("ChoiceDatum","St. Helena Geodetic Datum 2015");
        uiSelectAddExplicitItem("ChoiceDatum","St. Helena Tritan");
        uiSelectAddExplicitItem("ChoiceDatum","St. Kitts 1955");
        uiSelectAddExplicitItem("ChoiceDatum","St. Lawrence Island");
        uiSelectAddExplicitItem("ChoiceDatum","St. Lucia 1955");
        uiSelectAddExplicitItem("ChoiceDatum","St. Paul Island");
        uiSelectAddExplicitItem("ChoiceDatum","St. Vincent 1945");
        uiSelectAddExplicitItem("ChoiceDatum","ST71 Belep");
        uiSelectAddExplicitItem("ChoiceDatum","ST84 Ile des Pins");
        uiSelectAddExplicitItem("ChoiceDatum","ST87 Ouvea");
        uiSelectAddExplicitItem("ChoiceDatum","SVY21");
        uiSelectAddExplicitItem("ChoiceDatum","SWEREF99");
        uiSelectAddExplicitItem("ChoiceDatum","Swiss Terrestrial Reference Frame 1995");
        uiSelectAddExplicitItem("ChoiceDatum","System of the Unified Trigonometrical Cadastral Ne");
        uiSelectAddExplicitItem("ChoiceDatum","Tahaa 54");
        uiSelectAddExplicitItem("ChoiceDatum","Tahiti 52");
        uiSelectAddExplicitItem("ChoiceDatum","Tahiti 79");
        uiSelectAddExplicitItem("ChoiceDatum","Taiwan Datum 1997");
        uiSelectAddExplicitItem("ChoiceDatum","Tananarive Observatory 1925");
        uiSelectAddExplicitItem("ChoiceDatum","Tern Island 1961");
        uiSelectAddExplicitItem("ChoiceDatum","Tete");
        uiSelectAddExplicitItem("ChoiceDatum","Timbalai 1948");
        uiSelectAddExplicitItem("ChoiceDatum","TM65");
        uiSelectAddExplicitItem("ChoiceDatum","Tokyo");
        uiSelectAddExplicitItem("ChoiceDatum","Trinidad 1903");
        uiSelectAddExplicitItem("ChoiceDatum","Tristan Astro 1968");
        uiSelectAddExplicitItem("ChoiceDatum","Turkish National Reference Frame");
        uiSelectAddExplicitItem("ChoiceDatum","Ukraine 2000");
        uiSelectAddExplicitItem("ChoiceDatum","United Arab Emirates (Nahrwan)");
        uiSelectAddExplicitItem("ChoiceDatum","Vanua Levu 1915");
        uiSelectAddExplicitItem("ChoiceDatum","Vietnam 2000");
        uiSelectAddExplicitItem("ChoiceDatum","Viti Levu 1912");
        uiSelectAddExplicitItem("ChoiceDatum","Viti Levu 1916");
        uiSelectAddExplicitItem("ChoiceDatum","Voirol 1874");
        uiSelectAddExplicitItem("ChoiceDatum","Voirol 1875");
        uiSelectAddExplicitItem("ChoiceDatum","Voirol 1960");
        uiSelectAddExplicitItem("ChoiceDatum","(WGS66) World Geodetic System 1966");
        uiSelectAddExplicitItem("ChoiceDatum","(WGS66) World Geodetic System 1966 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","(WGS72) World Geodetic System 1972");
        uiSelectAddExplicitItem("ChoiceDatum","(WGS72) World Geodetic System 1972 ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","(WGS72) Transit Broadcast Ephemeris");
        uiSelectAddExplicitItem("ChoiceDatum","Wake Island Astro 1952");
        uiSelectAddExplicitItem("ChoiceDatum","Wake-Eniwetok 1960");
        uiSelectAddExplicitItem("ChoiceDatum","War Office ellipsoid");
        uiSelectAddExplicitItem("ChoiceDatum","Yacare");
        uiSelectAddExplicitItem("ChoiceDatum","Yemen National Geodetic Network 1996");
        uiSelectAddExplicitItem("ChoiceDatum","Yoff");
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
		setVisibility( "LabelCalcDatum", v);
		setVisibility( "LabelCalcPrecision", v);
		setVisibility( "LabelCalcDatum", v);
		setVisibility( "LabelCalcGeoreferencer", v);
		setVisibility( "LabelCalcDate", v);
		setVisibility( "LabelCalcProtocol", v);
		if( v )
		{
//			uiShowElement( "TextFieldFullResult" );
			uiShowElement( "TextFieldCalcDecLat");
			uiShowElement( "TextFieldCalcDecLong");
			uiShowElement( "TextFieldCalcErrorDist");
			uiShowElement( "TextFieldCalcPrecision");
			uiShowElement( "TextFieldCalcDatum");
			uiShowElement( "TextFieldCalcGeoreferencer");
			uiShowElement( "TextFieldCalcDate");
			uiShowElement( "ChoiceProtocol");
		}
		else
		{
			uiHideElement( "TextFieldFullResult" );
			uiHideElement( "TextFieldCalcDecLat");
			uiHideElement( "TextFieldCalcDecLong");
			uiHideElement( "TextFieldCalcErrorDist");
			uiHideElement( "TextFieldCalcPrecision");
			uiHideElement( "TextFieldCalcDatum");
			uiHideElement( "TextFieldCalcGeoreferencer");
			uiHideElement( "TextFieldCalcDate");
			uiHideElement( "ChoiceProtocol");
		}
	}
	
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
		//TODO: If this ever gets used, the text and labels should use show/hide element function instead.
		setVisibility( "ChoiceFromDistUnits", b );
		setVisibility( "ChoiceToDistUnits", b );
		setVisibility( "LabelEquals", b );
		setVisibility( "LabelDistanceConverter", b );
		setVisibility( "TextFieldFromDistance", b );
		setVisibility( "TextFieldToDistance", b );
	}

	function showScaleConverter( b )
	{
		//TODO: If this ever gets used, the text and labels should use show/hide element function instead.
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
		setVisibility( "LabelCalcDatum", b );
		setVisibility( "LabelCalcPrecision", b );
		setVisibility( "LabelCalcGeoreferencer", b );
		setVisibility( "LabelCalcDate", b );
		setVisibility( "LabelCalcProtocol", b );
		if( b )
		{
//			uiShowElement( "TextFieldFullResult" );
			uiShowElement( "TextFieldCalcErrorDist");
			uiShowElement( "TextFieldCalcDatum");
			uiShowElement( "TextFieldCalcPrecision");
			uiShowElement( "TextFieldCalcGeoreferencer");
			uiShowElement( "TextFieldCalcDate");
			uiShowElement( "ChoiceProtocol");
		}
		else
		{
			uiHideElement( "TextFieldFullResult", b );
			uiHideElement( "TextFieldCalcErrorDist");
			uiHideElement( "TextFieldCalcDatum");
			uiHideElement( "TextFieldCalcPrecision");
			uiHideElement( "TextFieldCalcGeoreferencer");
			uiHideElement( "TextFieldCalcDate");
			uiHideElement( "ChoiceProtocol");
		}
	}
	
	// re-use OffsetEW controls for regular offset also
	function showOffset( b )
	{
		setVisibility( "TextFieldOffsetEW", b );
		uiSetLabel( "LabelOffsetEW", "label.offset" );
		setVisibility( "LabelOffsetEW", b );
	}

	function showEWOffset( b )
	{
		setVisibility( "TextFieldOffsetEW", b );
		uiSetLabel( "LabelOffsetEW", "label.distew" );
		setVisibility( "LabelOffsetEW", b );
		setVisibility( "ChoiceOffsetEWDir", b );
	}

	function showNSOffset( b )
	{
		var f_pointer=uiHideElement;
		if( b )
		{
			f_pointer=uiShowElement;
		}
		f_pointer( "TextFieldOffsetNS" );
		uiSetLabel( "LabelOffsetNS", "label.distns" );
		f_pointer( "ChoiceOffsetNSDir" );
		setVisibility( "LabelOffsetNS", b );
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

/* 
TODO: This could be improved by using prompt alert type. With a prompt we could display 
the bad value and the error, and get a replacement value back, plug in and roll with 
new number.
*/
// NOTE: style is not currently used
function errorDialog( error, title, source, style )
{
			var e = document.getElementById( source );
			if( e )
			{
				e.style.color = "#FF0000";
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
	function testExtentLimits()
	{
		if( !uiIsVisible("TextFieldExtent") )
		{
			return "true";
		}
		var testpasses = "true";
		var s = null;
		var d = 0;
		var num = null;
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
					g_properties.getPropertyLang("error.extent.title"), "TextFieldExtent", 0);
				uiSetTextExplicit("TextFieldExtent","0");
			}
		}
		return testpasses;
	}

	function testMeasurementErrorLimits()
	{
		if( !uiIsVisible("TextFieldMeasurementError") )
		{
			return "true";
		}
		var testpasses = "true";
		var s = null;
		var d = 0;
		var num = null;
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

	function testHeadingLimits()
	{
		if( !uiIsVisible("TextFieldHeading") )
		{
			return "true";
		}
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
			try
			{
				num = formatCalcDec.throwFormatError( s );
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

	function testOffsetLimits()
	{
		if( !uiIsVisible("TextFieldOffsetNS") )
		{
			return "true";
		}
		var testpasses = true;
		var s = null;
		var d = 0;
		var num = null;
		s = uiGetTextValue("TextFieldOffsetNS");
		if( s == null || s.length == 0 )
		{
			uiSetLabelExplicit("TextFieldOffsetNS","0");
		}
		else
		{ // test input within limits and valid
			try
			{
				num = formatCalcDec.throwFormatError( s );
				d = num;
				if( d < 0 )
				{
					testpasses = false;
					errorDialog(g_properties.getPropertyLang("error.offset.message"),
						g_properties.getPropertyLang("error.offset.title"), "TextFieldOffsetNS",0);
					uiSetTextExplicit("TextFieldOffsetNS","0");
				}
			}
			catch( exp )
			{
				testpasses = false;
				errorDialog(g_properties.getPropertyLang("error.offset.message"),
					g_properties.getPropertyLang("error.offset.title"), "TextFieldOffsetNS",0);
				uiSetTextExplicit("TextFieldOffsetNS","0");
			}
		}
		return testpasses;
	}
	
	function testOffsetEWLimits()
	{
		if( !uiIsVisible("TextFieldOffsetEW") )
		{
			return "true";
		}
		var testpasses = true;
		var s = null;
		var d = 0;
		var num = null;
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
		return testpasses;
	}

	function testLatLongLimits( )
	{
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

	function TextFieldOffsetNS_focusGained()
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
