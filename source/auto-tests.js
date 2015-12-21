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
__version__ = "auto_tests.js 2015-12-21T13:10-03:00"
*/

//NOT USED
var enum_report_level =
{
	FULL: 1,
	FAIL_ONLY: 2
}

//USED but somewhat silly
var tr =
{
	FAIL: false,
	PASS: true
//	SKIP: 3
}

//NOT USED
var g_test_report = enum_report_level.FULL;

var g_PASS = tr.PASS;
var g_FAIL = tr.FAIL;
//var g_SKIP = tr.SKIP;

var g_report_max_depth=2;
var g_report_current_depth=0;

function onChoiceTest()
{
	var testindex = uiGetSelectedIndex("ChoiceTest");
	var test_obj = [];
	var tc_base = "test " + testindex;
	var fName = "onChoiceTest" + testindex;
	test_obj[0] = g_tests[testindex];

	g_report_max_depth = 2;
	g_report_current_depth = 1;
	runStandardTests( tc_base, test_obj, fName );
}



function testCaseName( tc, add )
{
	g_report_current_depth = g_report_current_depth + 1;
	var prepend = "-";
	if( tc === null || tc == "null" || tc == undefined || tc == "" ) 
	{
		tc = "";
		prepend = "";
	}
	
	if( add && add.length > 0 )
	{
		tc = tc + prepend + add;
	}

	return tc;
}

function testHelperfName( callstack )
{
   var fName = arguments.callee.caller.toString();
   fName = fName.substr('function ', fName.length );
   fName = fName.substr(0, fName.indexOf('('));
   fName = fName.substr(9, fName.length );

   //fName = fName.substr(0, fName.indexOf('('));
	if(callstack)
	{
		fName = callstack + ":" + fName;
	}
   return fName;
}



function log_test_result( tc_base, callstack, result, extra )
{
	var rs = "%cFAIL%c";
	var failed = true;
	var cssnorm = "color: #000"
	var cssstr = "color: #800"
	if( result )
	{
		cssstr = "color: #060"
		rs = "%cPASS%c";
		failed = false;
	}
	
//console.log('%c Oh my heavens! ', 'background: #222; color: #bada55');

	if( ( g_report_current_depth <= g_report_max_depth ) || failed )
	{
		rs =  rs + " " + tc_base + ": "  + callstack;
	
		if( extra )
		{
			rs = rs + " Extra: " + extra;
		}

		console.log( rs, cssstr, cssnorm); 
	}
	else
	{
		var i;//console.log( "Skipping because g_report_current_depth = " + g_report_current_depth + " " + rs ); 
	}
	g_report_current_depth = g_report_current_depth - 1;
}


function testHiddenDisplay( tc_base, name, expected_hid, expected_dis, callstack )
{
	tc_base = testCaseName( tc_base, "H/D" );

	var fName = testHelperfName( callstack );
	var test_result_h = testHidden( tc_base, name, expected_hid, fName );
	var test_result_d = testDisplay( tc_base, name, expected_dis, fName );
   
	var test_result = g_FAIL;
	if( test_result_h && test_result_d )
	{
		test_result = g_PASS;
	}
	else
	{
		test_extra = "expected_hid: " +  expected_hid + " expected_dis: " + expected_dis;
	}
	
	log_test_result( tc_base, fName, test_result );
	return test_result;
}


function testHidden( tc_base, name, expected, callstack )
{
	var fName = testHelperfName( callstack );	
	tc_base = testCaseName( tc_base, "HIDDEN" );

	var test_result = g_FAIL;
	var test_extra = "";
	var el = document.getElementById( name );

	if( el )
	{
		var st = el.hidden;
		if( st !== undefined )
		{
			var actual = st.toString();
			if( actual == expected )
			{
				test_result = g_PASS;
				test_extra = "Actual: " + actual + " Expected: " + expected;
			}
			else 
			{
				test_extra = "Element " + name + " hidden Actual: " + actual + " Expected: " + expected;
			}
		}		
		else
		{
			test_extra = "Element " + name + " has no HTML attribute 'hidden'";
		}
	}
	else
	(
		test_extra = "Element " + name + " not found "
	)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function testGetElement( tc_base, name, callstack )
{
    var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "GETEL(" + name + ")");
	
	var test_result = g_FAIL;
	var test_extra = name + " not found";

	var el = document.getElementById( name );
	if( el )
	{
		test_result = g_PASS;
	}
	log_test_result(tc_base, fName, test_result, test_extra );
	return el;
}




function testChooseSelectValue( tc_base, name, value, callstack ) 
{
    var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "SELECT" );
	
	var test_result = g_FAIL;
	var sub_result = g_FAIL;
	var temp = "";
	
	var test_extra = "";
	
	var el = testGetElement( tc_base, name, fName );
	if( el )
	{
		if( name.indexOf("Dir") > -1 || name.indexOf("Scale") > -1 || name.indexOf("Units") > -1 || name.indexOf("Dist") > -1 )
		{
			temp = value;
		}
		else
		{
			temp = testLazyLookUpSelect( tc_base, name, value, fName );
		}
		
		if( temp )
		{
			value = temp;
			uiSetSelectedValue( name, value );
			sub_result = uiGetSelectedValue( name );
		}
		
		if( sub_result && sub_result == value )
		{
			temp = "on"+ name.substr( 6,name.length ) + "Select()";
			var c = "";
			var caught = false;
			try
			{
				c = eval( temp );
			}
			catch(err)
			{
				test_extra = "error eval()ing " + temp + " " + err.messsage;
				caught = true;
			}
			finally
			{
				if( caught == false )
				{
					test_result = g_PASS;
				}			
			}
		}
		else
		{
			test_extra = "could select value" + value + " from " + name;
		}
	}
	else
	{
		test_extra = " could not find element name " + name;
	}
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function testSetTextValue( tc_base, name, value, raw_name, callstack ) 
{
    var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "SetText" );
	
	var test_result = g_FAIL;
	var sub_result = "";
	var temp = "";
	
	var test_extra = "";
	
	var el = testGetElement( tc_base, name, fName );
	if( el )
	{
		uiSetLabelExplicit( name, value );
		sub_result = uiGetTextValue( name );
		if( sub_result == value )
		{
			temp = name + "_focusGained()";
			var c = "";
			var caught = false;
			try
			{
				c = eval( temp );
			}
			catch(err)
			{
				test_extra = "error eval()ing " + temp + " " + err.messsage;
				caught = true;
			}
			finally
			{
				if( caught == false )
				{
					test_result = g_PASS;
				}			
			}
		}
		else
		{
			test_extra = "could not get value" + value + " from " + name +" got "+sub_result+" instead";
		}
	}
	else
	{
		test_extra = " could not find element name " + name;
	}
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}


function testButtonClick( tc_base, name, value, raw_name, callstack ) 
{
    var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "button click" );
	
	var test_result = g_FAIL;
	var sub_result = "";
	var temp = "";
	
	var test_extra = "";
	
	var el = testGetElement( tc_base, name, fName );
	if( el )
	{
		temp = name + "_afterActionPerformed()";
		
		
		var c = "";
		var caught = false;
		//try
		//{
			c = eval( temp );
		//}
		//catch(err)
		//{
			//test_extra = "error eval()ing " + temp + " " + err.messsage;
			//caught = true;
		//}
		//finally
		//{
			//if( caught == false )
			//{
				test_result = g_PASS;
			//}			
		//}
	}
	else
	{
		test_extra = " could not find element name " + name;
	}
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}




function testDisplay( tc_base, name, expected, callstack )
{
    var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "DISPLAY" );
	
	var test_result = g_FAIL;
	var test_extra = "";
	var el = document.getElementById( name );
	var actual = null;
	
	if( el )
	{
		var st = el.style.display;
		
		if( st )
		{
			actual = st.toString();
			if( actual == expected )
			{
				test_result = g_PASS;
				test_extra = "Actual: " + actual + " Expected: " + expected;
			}
			else 
			{
				test_extra = "Element " + name + " style.display Actual: " + actual + " Expected: " + expected;
			}
		}
		else if( ( expected === null || expected == "null" || expected == undefined || expected == "" )
				&&
				( st === null || st == "null" || st == undefined || st == "" ) 
				)
		{
				test_result = g_PASS;
				test_extra = "Actual: " + actual + " Expected: " + expected;
		}
		else
		{
			test_extra = "Element " + name + " has no CSS style property 'display'";
		}
	}
	else
	(
		test_extra = "Element " + name + " not found"
	)
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}


//TODO make this language independent	
function testCalcType( tc_base, calctype, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "CalcType" );
	var test_result = g_FAIL;
	var test_extra = "";
	//tc_base = tc_base + "-CalcType";
	
    if( calctype == "err only"  || calctype == "Error only"  || calctype == "Error only (because we already know the coordinates of the final location)")
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceCalcType", "Error only - enter Lat/Long for the actual locality", fName ) 
	}
	else if( calctype == "Coordinates and error"  || calctype == "coords and error" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceCalcType", "Coordinates and error - enter the Lat/Long for the named place or starting point", fName ) 	
	}
	else if( calctype == "Coordinate only" || calctype == "coords only")
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceCalcType", "Coordinates only - enter the Lat/Long for the named place or starting point", fName ) 		
	}
	else if( calctype == "" || calctype == "empty" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceCalcType", "", fName ) 		
	}
	else
	{
		test_extra = " calcctype :" + calctype + ": not found in if/else"
	}

	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;

}

//TODO make this language independent	
function testLocType( tc_base, loctype, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "LocType" );
	var test_result = g_FAIL;
	var test_extra = "";
	//tc_base = tc_base + "-LocType";

	
    if( loctype == "coords only"  || loctype == "Coordinates only" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "Coordinates only (e.g., 27\u00b034'23.4\" N, 121\u00b056'42.3\" W)", fName ) 
	}
	else if( loctype == "named place"  || loctype == "Named place"  || loctype == "Named place only" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "Named place only (e.g., Bakersfield)", fName ) 
	}
	else if( loctype == "dist only"  || loctype == "Distance only" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "Distance only (e.g., 5 mi from Bakersfield)", fName ) 
	}
	else if( loctype == "dist path"  || loctype == "Distance along path" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "Distance along path (e.g., 13 mi E (by road) Bakersfield)", fName ) 
	}
	else if( loctype == "dist ortho"  || loctype == "Distance along orthogonal directions" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "Distance along orthogonal directions (e.g., 2 mi E and 3 mi N of Bakersfield)", fName ) 
	}
	else if( loctype == "dist at"  || loctype == "Distance at a heading" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "Distance at a heading (e.g., 10 mi E (by air) Bakersfield)", fName ) 
	}
	else if( loctype == ""  || loctype == "empty" )
	{
		test_result = testChooseSelectValue( tc_base, "ChoiceModel", "", fName ) 
	}
	else
	{
		test_extra = " calcctype " + loctype + " not found in if else"
	}
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function testEmptyTextBoxes()
{
	uiSetLabelExplicit("TextFieldOffset", "" );
	uiSetLabelExplicit("TextFieldHeading", "" );
	uiSetLabelExplicit("TextFieldOffsetEW", "" );
	uiSetLabelExplicit("txtT7Lat_DegDMS", "" );
	uiSetLabelExplicit("txtT7Lat_MinDMS", "" );
	uiSetLabelExplicit("txtT7Lat_Sec", "" );
	uiSetLabelExplicit("txtT2Dec_Lat", "" );
	uiSetLabelExplicit("txtT7Lat_DegMM", "" );
	uiSetLabelExplicit("txtT7Lat_MinMM", "" );
	uiSetLabelExplicit("TextFieldExtent", "" );
	uiSetLabelExplicit("txtT7Long_DegDMS", "" );
	uiSetLabelExplicit("txtT7Long_MinDMS", "" );
	uiSetLabelExplicit("txtT7Long_Sec", "" );
	uiSetLabelExplicit("txtT2Dec_Long", "" );
	uiSetLabelExplicit("txtT7Long_DegMM", "" );
	uiSetLabelExplicit("txtT7Long_MinMM", "" );
	uiSetLabelExplicit("TextFieldMeasurementError", "" );
	uiSetLabelExplicit("TextFieldCalcDecLat", "" );
	uiSetLabelExplicit("TextFieldCalcDecLong", "" );
	uiSetLabelExplicit("TextFieldCalcErrorDist", "" );
	uiSetLabelExplicit("TextFieldCalcErrorUnits", "" );
	uiSetLabelExplicit("TextFieldFullResult", "" );
	uiSetLabelExplicit("TextFieldFromDistance", "" );
	uiSetLabelExplicit("TextFieldFromDistance", "" );
	uiSetLabelExplicit("TextFieldScaleFromDistance", "" );
}



function testSetSelectsDefault()
{
//Note: ORDER OF EXECUTION MATTERS

	uiSetSelectedIndex("ChoiceScale", 0 );
	onScaleSelect();
	uiSetSelectedIndex("ChoiceScaleFromDistUnits", 0 );
	onScaleFromDistUnitsSelect();
	uiSetSelectedIndex("ChoiceScaleToDistUnits", 0 );
	onScaleToDistUnitsSelect();
	uiSetSelectedIndex("ChoiceToDistUnits", 0 );
	onToDistUnitsSelect();
	uiSetSelectedIndex("ChoiceFromDistUnits", 0 );
	onFromDistUnitsSelect();

	uiSetSelectedIndex("ChoiceDistancePrecision", 0 );
	onDistancePrecisionSelect();
	
	uiSetSelectedIndex("ChoiceLatPrecision", 0 );
	onLatPrecisionSelect();

	uiSetSelectedIndex("ChoiceDistUnits", 0 );
	onDistUnitsSelect();

	
	uiSetSelectedIndex("ChoiceLongDirDMS", 0 );
	onLongDirDMSSelect();
	uiSetSelectedIndex("ChoiceLatDirDMS", 0 );
	onLatDirDMSSelect();

	uiSetSelectedIndex("ChoiceLongDirMM", 0 );
	onLongDirMMSelect();
	uiSetSelectedIndex("ChoiceLatDirMM", 0 );
	onLatDirMMSelect();
	
	uiSetSelectedIndex("ChoiceOffsetEWDir", 0 );
	onOffsetEWDirSelect();
	
	uiSetSelectedIndex("ChoiceCoordSystem", 0 );
	onCoordSystemSelect();
	
	uiSetSelectedIndex("ChoiceOffsetNSDir", 0 );
	onOffsetNSDirSelect();

	uiSetSelectedIndex("ChoiceDatum", 0 );
	onDatumSelect();
	
	uiSetSelectedIndex("ChoiceDirection", 0 );
	onDirectionSelect();
	uiSetSelectedIndex("ChoiceCoordSource", 0 );
	onCoordSourceSelect();
	uiSetSelectedValue("ChoiceModel", "" );
	onModelSelect();
	uiSetSelectedValue("ChoiceCalcType", "" );
	onCalcTypeSelect();
}

function testReset()
{
	testSetSelectsDefault();
	testEmptyTextBoxes();
}

function testMapElementToProperty( name )
{
  var returnVal = null;
  if( name )
  {
	if( name == "ChoiceScale" )
	{
		returnVal={ d:0, a:["static"] };
	}
	else if( name == "ChoiceScaleFromDistUnits" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceScaleToDistUnits" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceToDistUnits" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceFromDistUnits" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceDistancePrecision" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceLatPrecision" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceDistUnits" )
	{
		returnVal={ d:0, a:["static"] };
	}  
	else if( name == "ChoiceLatDirDMS" )
	{
		//TODO nw /ew are all included imn heading making it possible to screw up test data
		returnVal={  d:1, a:[ "headings.n", "headings.s" ] };
	}  
	else if( name == "ChoiceLongDirDMS" )
	{
		//TODO nw /ew are all included imn heading making it possible to screw up test data
		returnVal={  d:1, a:[ "headings.e", "headings.w" ] };
	}  
	else if( name == "ChoiceLatDirMM" )
	{
		//TODO nw /ew are all included imn heading making it possible to screw up test data
		returnVal={  d:1, a:[ "headings.n", "headings.s" ] };
	}  
	else if( name == "ChoiceLongDirMM" )
	{
		//TODO nw /ew are all included imn heading making it possible to screw up test data
		returnVal={  d:1, a:[ "headings.e", "headings.w" ] };
	}  
	else if( name == "ChoiceOffsetEWDir" )
	{
		//TODO nw /ew are all included imn heading making it possible to screw up test data
		returnVal={  d:1, a:[ "headings.e", "headings.w" ] };
	}  
	else if( name == "ChoiceCoordSystem" )
	{
		returnVal={  d:2, a:["coordsys"] };
	}  
	else if( name == "ChoiceOffsetNSDir" )
	{
		//TODO nw /ew are all included imn heading making it possible to screw up test data
		returnVal={  d:1, a:[ "headings.n", "headings.s" ] };
	}  
	else if( name == "ChoiceDatum" )
	{
		returnVal={  d:0, a:[ "static" ] };  //not really rtue, datum not recorded is special cased
	}  
	else if( name == "ChoiceDirection" )
	{
		returnVal={  d:2, a:[ "headings"] };
	}  
	else if( name == "ChoiceCoordSource" )
	{
		returnVal={  d:2, a:[ "coordsource" ] };
	}  
	else if( name == "ChoiceModel" )
	{
		returnVal={  d:2, a:["loctype"] };
	}  
	else if( name == "ChoiceCalcType" )
	{
		returnVal={  d:2, a:["calctype"] };
	}  
	else if( name == "ChoiceLanguage" )
	{
		returnVal={  d:0, a:["static"] };
	}  
  }
  
  if( !returnVal )
  {
	consoloe.log("ERROR testMapElementToProperty element not found:"+name+":")
  }  
  return returnVal;
}

function testMapLanguageToShortName( language )
{
  var returnVal = null;
  if( language )
  {
	var l = toLowerCase(language);
	if( l == "en" || 
		l == "english" || 
		l == "english(local)" || 
		l == "eng")
	{
		returnVal="en";
	}
	else if(l == "es" || 
		l == "esp" || 
		l == "espa" || 
		l == "span" || 
		l == "spanish" //|| 
		//wont work  l == "español" 
		)
	{
		returnVal="esp";
	}
	else if(//wont work  l == "português" || 
		l == "pt" || 
		l == "portuguese" || 
		l == "port" )
	{
		returnVal="pt";	
	}
	else if(l == "fr" || 
		l == "french" || 
		//wont work  l == "français" || 
		l == "fren" )
	{
		returnVal="fr";	
	}
	else if(l == "nl" || 
		l == "neder" || 
		l == "nederlands" || 
		l == "ederlander" )
	{
		returnVal="nl";	
	}
  }
  
  if( !returnVal )
  {
	consoloe.log("ERROR testMapLanguageToShortName language not found:"+language+":")
  }
  
  return returnVal;
}

//poorly mnamed, source is not used
function testGetLangEquiv( src_lang, writ_lang, props_from )
{
	returnVal = null;

	var src_val = g_properties.getProperty(props_from, src_lang );
	var w_val =	g_properties.getProperty(props_from, writ_from );
	
	if( w_val && src_val )
	{
		returnVal = w_val;
	}	
	return returnVal;
}


function  testGetStaticValuesFromChoice( element, src_lang, writ_lang  )
{
	var el=document.getElementById(element);
	var additions=[];
	//testGetLangEquiv( src_lang, writ_lang, props_from )
	var  slv = g_properties.getProperty( "datum.notrecorded", src_lang );
	//var  elv = g_properties.getProperty( "datum.notrecorded", "en" );
	var  wlv = g_properties.getProperty( "datum.notrecorded", writ_lang );

	if( el )
	{		
		for( var i=0; i< el.length; i++ )
		{
			var val = el[i].text;
			
			if( src_lang && val && val == slv )
			{
				additions.push( wlv );
			}
			else
			{
				additions.push( val );
			}
		}
	}
	return additions
}

function runChoiceElement( tc_base, element, value, raw_name, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runChoice" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	test_result = testChooseSelectValue(tc_base, element, value, fName);
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runChoiceElement_crap( tc_base, element, value, raw_name, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runChoice" );
	var test_result = g_FAIL;
	var test_extra = "";
	var addition = [];
	
	var t = value;
	var lookup_table = {};
	if( ltf !== ltw )
	{
		var lt = testMapLanguageToShortName(ltf);
		var lw = testMapLanguageToShortName(ltw);
		
		var props= testMapElementToProperty(element);
		if( props && props.length )
		{
			var l = props.length
			
			for( var i=0; i< l; i++)
			{
				if( props[i] == "static" ) //i should always end at for static
				{
						var additions = testGetStaticValuesFromChoice( element, ltf, ltw )
				}
				else
				{
						var str = props[i];
						//TODO this is a really weak determine hack, lookds for "coords" rather than "headings.n"
						var split_count = str.split(".");
						if( split_count == 0 )
						{
							c = eval( "props" )
							for( var k in c )
							{
								
								var a = eval( props + k + ltf );
								var b = eval( props + k + ltw );
								if( a && b )
								{
									aditions.push( ltw );
								}
								
							}
						}
				}
			}
			
		}
	}
	
	test_result = testChooseSelectValue(tc_base, element, t, fName)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runTextElement( tc_base, element, value, raw_name, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runText" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	test_result = testSetTextValue(tc_base, element, value, raw_name, fName)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runButtonElement( tc_base, element, value, raw_name, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runText" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	test_result = testButtonClick(tc_base, element, value, raw_name, fName)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runStandardCheckTextElement( tc_base, name, value, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "CheckTextElement" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	var temp = "";
	temp = uiGetTextValue( name );
	
	if( temp == value )
	{
		test_result = g_PASS;
	}
	else
	{
		test_extra = "value :" + value + ": found :" + temp + ": for element :" + name +":";
	}
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function testGetValuesFromProps( props, ltw)
{
	returnArray = null;
	returnArray = [];
	for(var p in props )
	{
		
	}
	
	
	return[];
}

//TODO this should be for check or set choice, OR label, not just check choice
function runStandardCheckChoiceElement( tc_base, name, value, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "CheckChoiceElement" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	var versus_val = uiGetSelectedValue( name );
	var full_eng_equiv = null;
	var target_lang_equiv = null;
	
	var prop_types = testMapElementToProperty( name )
	var eng_array_lookup = [];
	var ltf_array_lookup = [];


	//purpose of eng_array
	//a test case a choice may short hand a set or an expect as "Distance at orth"
	//"error only", nad27, and so on.
	//we need to turn that short handvalue into the *exact* value to expect
	//'error only' gets lookup being "Error only - enter Lat/Long for the actual locality"
	//if we are testing versus spanish, we can then say in english I said "Error only - enter Lat/Long for the actual locality",
	//what is the exact equiv in spanish
	
	//ex: text case right 'expect the spanish equiv for 'local' in 'ChoiceCoordSource'
	//so  we lookup 'local' for possible matches in 'enn', finding only 1, "locality description"
	//we then look up the spanish equiv to "locality description" as being "localidad textual"
	//check the selected item of "ChoiceCoordSource" to be sure it equals "localidad textual"
	//this is more useful for the calc and loc lookups
	//short hand is very nice for datum
	//language jumping is very nice if you dont know the other language, ex: french y nederlander ?Dutch? y potuguese.
	//AND for now, some characters just wont work, ?cildilla?cidila?, e with accent grave, the n w/ tilde in spanish
	//there are auto conversion issues in JS, css, HTML, or something I just cant figure out, so I have to short hand it.
	
	
	//note soon eng_array will be ltw array
	//that way a test could be short-hartned in any language, than translated to the target language
	
	//TODO very buggy check, if 1 and static, look up static, + special vars(special for datum)
	// if 1 then assume like coordsys.*.*lang
	// if 2 assume xxx.{yyy}.lang and loop trough, for dms, ddm, dd and such
	
	//if property type is static is not stored in any canonical array
	//it is stuffed into SELECTS programatically, most the time
	//ex: [km, m, yds, in]
	//another type of static are mixed in 1 of 2??? ways
	//1) ChoiceDatum, element option [0] is based on "datum.notrecorded.+language, then a very large array of static static data, then  NAD27, Adindan...
	//2) distance precision, mixed, "static number" + units based lang, and "exact" for lang
	//3)??
	//testGetStaticValuesFromChoice special cases 1), and soon 2)
	
	
	//short hand rules find the  value of test data, lower cases, *in* one and only one of all the strings in the array supplied
	//'dist' matches 4 for of the possible loc type, no bueno. 'distance at' matches one and only one, bueno. 'named', again, bueno.
	
	//BEGIN SHORTHAND TO FILL possible eng values into array
	//if static, grab values from text choice boxes, special casing ChoiceDatum and ChoiceCoordSource
	if( prop_types.d == 0 && prop_types.a[0]=="static" )
	{
			if( name == "ChoiceDatum" )
			{
					//eng_array_lookup = testGetStaticValuesFromChoice(name);
					//TODO FIXME look this up lagnuage dependant
					eng_array_lookup.push(g_properties.getProperty("datum.notrecorded", "en"))
					eng_array_lookup = testGetStaticValuesFromChoice(name, ltf, ltw);
			}
			if( name == "ChoiceDistancePrecision" )
			{
				var msmt_types = [ "km","m","mi","yds","ft","nm" ]
				for( var t in msmt_types )
				{
					eng_array_lookup.push( "100 " + t  );
					eng_array_lookup.push( "10 " + t  );
					eng_array_lookup.push( "1 " + t  );
					eng_array_lookup.push( "1/2 " + t  );
					eng_array_lookup.push( "1/3 " + t  );
					eng_array_lookup.push( "1/8 " + t  );
					eng_array_lookup.push( "1/10 " + t  );
					eng_array_lookup.push( "1/100 " + t  );
				}
				eng_array_lookup.push(g_properties.getProperty("oordprec.dd.exact.",'en'));

				eng_array_lookup.push("exact");
			}
			else
			{
				eng_array_lookup = testGetStaticValuesFromChoice(name, ltf, ltw);
			}
	}//if array leng of test data is 1, we lookup up elements data source, and for ex:  for 'coordsys' we grabs from all available, coordssys.dms, coordssys..ddm, *and* coordssys..dd
	else if( prop_types.d == 1 )//coordssys and such
	{//BUGBUG OT FULLY IMPLEMENTED 11/30/15 23:00 PST
		eng_array_lookup = testGetValuesFromProps( props[0], ltw);
	}//if array leng of test data is 2, we lookup up elements data source, 100% likely [ "headings.n", "headings.s"] or [ "headings.e", "headings.w"]
	else if( prop_types.d == 2 )//headings
	{//BUGBUG OT FULLY IMPLEMENTED 11/30/15 23:00 PST
		eng_array_lookup.push(testGetValuesFromProps( props[0], ltw));
		eng_array_lookup.push(testGetValuesFromProps( props[1], ltw));
		eng_array_lookup.push(testGetValuesFromProps( props[0], ltw));
		eng_array_lookup.push(testGetValuesFromProps( props[1], ltw));
	}

	//BEGIN SHORTHAND eng vs eng array lookup
	var num_found=0;
	var found_at=-1;
	for( var i=0; i< eng_array_lookup.length; i++ )
	{
		var v = eng_array_lookup[i].indexOf( value );
		if(v > -1 )
		{
			found_at=i;
			num_found++;
		}
	}
	var full_eng_quiv = null;
	if( num_found == 1)
	{
		//must be an index and value
		full_eng_quiv = eng_array_lookup[found_at];
	}
		

	if( !full_eng_quiv )
	{
		test_extra = "runStandardCheckChoiceElement, bad test data, more than one, or 0 lookups found, please refine v=:" + value + ": number found=:" + num_found+":";
	}
	else
	{
		if( prop_types.length == 1 && prop_types[0]=="static" )
		{
				ltf_array_lookup = testGetStaticValuesFromChoice(name, ltf, ltw);
				
				if( name == "ChoiceDatum" )
				{
					ltf_array_lookup = testGetStaticValuesFromChoice(name, ltf, ltw);
					//TODO FIXME look this up lagnuage dependant
					ltf_array_lookup.push(g_properties.getProperty("datum.notrecorded", ltf))
				}
				else if( name == "ChoiceDistancePrecision" )
				{
					var msmt_types = [ "km","m","mi","yds","ft","nm" ]
					for( var t in msmt_types )
					{
						ltf_array_lookup.push( "100 " + t  );
						ltf_array_lookup.push( "10 " + t  );
						ltf_array_lookup.push( "1 " + t  );
						ltf_array_lookup.push( "1/2 " + t  );
						ltf_array_lookup.push( "1/3 " + t  );
						ltf_array_lookup.push( "1/8 " + t  );
						ltf_array_lookup.push( "1/10 " + t  );
						ltf_array_lookup.push( "1/100 " + t  );
					}
					ltf_array_lookup.push(g_properties.getProperty("oordprec.dd.exact.",ltf));
				}
		}
		else if( prop_types.length == 1 )//coordssys and such
		{//BUGBUG OT FULLY IMPLEMENTED 11/30/15 23:00 PST
			ltf_array_lookup = testGetValuesFromProps( props[0], ltf);
		}//if array leng of test data is 2, we lookup up elements data source, 100% likely [ "headings.n", "headings.s"] or [ "headings.e", "headings.w"]
		else if( prop_types.length == 2 )//headings
		{//BUGBUG OT FULLY IMPLEMENTED 11/30/15 23:00 PST
			ltf_array_lookup.push(testGetValueFromProps( props[0], ltf));
			ltf_array_lookup.push(testGetValueFromProps( props[1], ltf));
		}

		full_eng_quiv = eng_array_lookup[found_at];
	}


	//BUGBUG, overwritesprevious tes extra values
	if( full_eng_quiv )
	{
		test_result = g_PASS;
	}
	else
	{
		test_extra = "value :" + value + ": found :" + temp + ": for element :" + name +":";
	}

	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}


function runStandardUICheckElement( tc_base, element, value, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runStandardUICheckElement" );
	var test_result = g_FAIL;
	var test_extra = "";

	if( !ltf )
	{
		ltf="en";
	}
	
	if( !ltw )
	{
		ltw="en";
	}
	
	var raw_name = "";
	var firstPart = element.substring( 0, 3 );
	//TODO WARNING FIXME there are much better ways of getting element type than x == "string"
	if( firstPart == "Cho" )
	{
		raw_name = element.substring( 6, element.length );
//					  runStandardCheckChoiceElement( tc_base, name,    value, callstack, ltf, ltw )
		test_result = runStandardCheckChoiceElement( tc_base, element, value, fName,     ltf, ltw );
	}
	else if( firstPart == "txt")
	{
		raw_name = element.substring( 3, element.length );
		test_result = runStandardCheckTextElement( tc_base, element, value, raw_name, fName, ltf, ltw );
	}
	else if( firstPart == "Tex" )
	{
		raw_name = element.substring( 4, element.length );
		test_result = runStandardCheckTextElement( tc_base, element, value, raw_name, fName, ltf, ltw );
	}
//	else if( firstPart == "But" )
//	{
//		raw_name = element.substring( 6, element.length );
//		test_result = runStandardCheckButtonElement( tc_base, element, value, raw_name, fName, ltf, ltw );
//	}
	else
	{
		test_extra = "unrecognised name scheme to element :"+element+":";
	}

 	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result; 
 }


function runStandardUIElement( tc_base, element, value, callstack, ltf, ltw )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runStandardUIElement" );
	var test_result = g_FAIL;
	var test_extra = "";

	if( !ltf )
	{
		ltf="English";
	}
	
	if( !ltw )
	{
		ltw="English";
	}
	
	var raw_name = "";
	var firstPart = element.substring( 0, 3 );
	//TODO WARNING FIXME there are much better ways of getting element type than x == "string"
	if( firstPart == "Cho" )
	{
		raw_name = element.substring( 6, element.length );
		test_result = runChoiceElement( tc_base, element, value, raw_name, fName, ltf, ltw );
	}
	else if( firstPart == "txt")
	{
		raw_name = element.substring( 3, element.length );
		test_result = runTextElement( tc_base, element, value, raw_name, fName, ltf, ltw );
	}
	else if( firstPart == "Tex" )
	{
		raw_name = element.substring( 4, element.length );
		test_result = runTextElement( tc_base, element, value, raw_name, fName, ltf, ltw );
	}
	else if( firstPart == "But" )
	{
		raw_name = element.substring( 6, element.length );
		test_result = runButtonElement( tc_base, element, value, raw_name, fName, ltf, ltw );
	}
	else
	{
		test_extra = "unrecognised name scheme to element :"+element+":";
	}

 	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result; 
 }

 function testLazyLookUpSelect( tc_base, name, value, callstack )
 {
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "LazyLookup" );
	var test_result = g_FAIL;
	var test_extra = "";
	var num_found = 0;
	//Not used
	var first_found = 0;
	var return_val = "";
	
	var el = document.getElementById( name );
	if( el )
	{
		for( var i = 0; i < el.length; i++ )
		{	
			//TODO fix bad programming, inefficeint
			var elv = el.options[ i ].text.toLowerCase();
			var nv = value.toLowerCase( );
			
			if( elv.indexOf( nv ) > -1 )
			{
				if( first_found == -1 )
				{
					first_found == i;
				}
				num_found = num_found + 1;
				if( num_found == 1 )
				{
					return_val = el.options[ i ].text;
					test_extra = name +" value :" + value + ": matches" + el.options[ i ].text + " ";
				}
				else
				{
					return_val = "";
					test_extra = test_extra + "X value :" + value + ": matches" + el.options[ i ].text + " ";
				}
			}			
		}
		
		if( num_found == 1 )
		{
			test_result = g_PASS;
		}
		else
		{
			if( num_found == 0 )
			{
				return_val = "";
				test_extra = "element :"+name+": with value :"+value+": not found";
			}
		}
	}
	else
	{
		return_val = "";
		test_extra = "element :"+name+": not found";
	}
	
 	log_test_result(tc_base, fName, test_result, test_extra );
	
	//somewhat janky way of returning the val.
	//I am hesitant to use byRef, if its even possible in JS.
	if(test_result)
	{
		test_result = return_val;
	}
	return test_result;
 }
 
function runStandardTests( tc_base, testObjs, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "STANDARD" );
	var test_result = g_FAIL;
	var test_extra = "";
	var pass_count = 0;
	var expected_passes = -1;
	var fail_count=0;

	if( testObjs )
	{
		if( testObjs.length )
		{
			expected_passes = testObjs.length;
			for( var i = 0; i < testObjs.length; i++ )
			{
  				testReset();

				var a = testObjs[i].a;

				var temp_result = g_FAIL;
				var temp_value="";
				
				if( a && a.length)
				{
					fail_count = 0;
					//var a = actions.a;
					for (var j=0; j< a.length; j++ )
					{
						temp_result = g_FAIL;
						var t = a[j];
						//required? the if seems somewhat dumb in this context, sets are guaranteed .
						//if (actions.hasOwnProperty(kv))
						//{
						var type = t.type;
						var doit = t.doit;
						var ltf=t.language_test_for;
						var ltw=t.language_test_written;
				
						if( !ltf )
						{
							ltf="en";
						}
						if( !ltw )
						{
							ltw="en";
						}

						if( doit )
						{
							for (var kv in doit )
							{							
								var elName = kv;
								temp_value = doit[kv];
								
								if( type =="set" )
								{
									temp_result = runStandardUIElement( tc_base + "-"+ i+ "-"+testObjs[i].test_name + "-" , elName, temp_value, fName, ltf, ltw );
								}
								if( type =="expect" )
								{
									temp_result = runStandardUICheckElement( tc_base + "-"+ i+ "-"+testObjs[i].test_name + "-" , elName, temp_value, fName, ltf, ltw );
								}
								if( type =="visibility" )
								{
									temp_result = runStandardUICheckVisibility( tc_base + "-"+ i+ "-"+testObjs[i].test_name + "-" , elName, temp_value, fName, ltf, ltw );
								}
								else
								{
									test_extra = "ERROR: bad test data name="+ elName + "type= " + temp_value.type;
								}
								
								if( temp_result == g_FAIL)
								{
									fail_count = fail_count + 1;
								}
							}
						}
						else
						{
							test_extra = "ERROR: do element not found for "+ j;
							fail_count = fail_count + 1;
						}
					}
					
					if( fail_count == 0 )
					{
						pass_count = pass_count + 1;
					}
					
				}
				else
				{
					test_extra = "actions is null or empty or undefined";
					i = testObjs.length;
				}
			}
		}
		else
		{
			text_extra = "testObjs length is 0";
		}
	}
	else
	{
		text_extra = "testObjs is null";
	}

	if( pass_count == expected_passes )
	{
		test_result = g_PASS;
		test_extra = "";
	}
	
	log_test_result(tc_base, fName, test_result, test_extra );


	return test_result;
}

//BASIC TEST FUNCTION FORMAT/PATTERN 
function testStar( tc_base, name, expected, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "SOME VALUE" );
	var test_result = g_FAIL;
	var test_extra = "";

	//do stuff
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function test_it( tc_base, callstack  )
{
	g_report_max_depth = 2;
	g_report_current_depth = 1;
	var fName =  "FAT";	
	var tc_base = "test_it";
//	log_test_result(tc_base, "log_test_result", "pass", "foo");
//	testHiddenDisplay(tc_base+"(eFAIL)", "ChoiceModel", "fail", "I should fail", fName );
//	testHiddenDisplay(tc_base+"(ePASS)", "ChoiceModel", "true", "null", fName );
//	testChooseSelectValue( tc_base, "ChoiceCalcType", "Error only - enter Lat/Long for the actual locality", fName );
	testReset();
	//testCalcType( tc_base, "err only", fName ) ;
	//testLocType( tc_base, "dist at", fName );
	//testReset();
	var t = g_tests[8];
	g_tests.pop(8);
	runStandardTests( tc_base, g_tests, fName );
	g_tests[8]=t;
	//onChoiceTest()
}


