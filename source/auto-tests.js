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
__version__ = "auto_tests.js 2015-11-23T20:33:00-07:00"
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

function runChoiceElement( tc_base, element, value, raw_name, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runChoice" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	test_result = testChooseSelectValue(tc_base, element, value, fName)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runTextElement( tc_base, element, value, raw_name, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runText" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	test_result = testSetTextValue(tc_base, element, value, raw_name, fName)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runButtonElement( tc_base, element, value, raw_name, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runText" );
	var test_result = g_FAIL;
	var test_extra = "";
	
	test_result = testButtonClick(tc_base, element, value, raw_name, fName)
	
	log_test_result(tc_base, fName, test_result, test_extra );
	return test_result;
}

function runStandardCheckElement( tc_base, name, value, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "CheckElement" );
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

function runStandardUIElement( tc_base, element, value, callstack )
{
	var fName =  testHelperfName( callstack );
	tc_base = testCaseName( tc_base, "runStandardUI" );
	var test_result = g_FAIL;
	var test_extra = "";

	var raw_name = "";
	var firstPart = element.substring( 0, 3 );
	if( firstPart == "Cho" )
	{
		raw_name = element.substring( 6, element.length );
		test_result = runChoiceElement( tc_base, element, value, raw_name, fName );
	}
	else if( firstPart == "txt")
	{
		raw_name = element.substring( 3, element.length );
		test_result = runTextElement( tc_base, element, value, raw_name, fName );
	}
	else if( firstPart == "Tex" )
	{
		raw_name = element.substring( 4, element.length );
		test_result = runTextElement( tc_base, element, value, raw_name, fName );
	}
	else if( firstPart == "But" )
	{
		raw_name = element.substring( 6, element.length );
		test_result = runButtonElement( tc_base, element, value, raw_name, fName );
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
			if( el.options[ i ].text.indexOf( value ) > -1 )
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
	//var t = g_report_max_depth;
	//g_report_max_depth = g_report_current_depth + 1;
	if( testObjs )
	{
		if( testObjs.length )
		{
			expected_passes = testObjs.length;
			for( var i = 0; i < testObjs.length; i++ )
			{
  				testReset();

				var sets = testObjs[i].set;
				var exps = testObjs[i].expect;
				var temp_result = g_FAIL;
				var temp_value="";
				
				if( sets && exps )
				{
					fail_count = 0;
					for (var kv in sets )
					{
						//required? the if seems somewhat dumb in this context, sets are guaranteed .
						if (sets.hasOwnProperty(kv))
						{
							
							var elName = kv;
							temp_value = sets[kv];
							temp_result = runStandardUIElement( tc_base + "-"+ i+ "-"+testObjs[i].test_name + "-" , elName, temp_value, fName );							
							if( temp_result == g_FAIL)
							{
								fail_count = fail_count + 1;
							}
							
						}
					}

					for (var kv in exps )
					{
						//required? the if seems somewhat dumb in this context, sets is guaranteed .
						if( exps.hasOwnProperty( kv ) )
						{
							var elName = kv;
							temp_value = exps[kv];
							temp_result = runStandardCheckElement( tc_base + "-"+ i+ "-"+testObjs[i].test_name + "-" , elName, temp_value, fName );							
							if( temp_result == g_FAIL )
							{
								fail_count = fail_count + 1;
							}
						}
					}

					
					
					if( fail_count == 0 )
					{
						pass_count = pass_count + 1;
					}
				}
				else
				{
					test_extra = "setters or expected null for I" + i;
					i = testObjs.length;
				}
			}
		}
		else
		{
			text_extra = "testObjs length is empty";
		}
	}
	else
	{
		text_extra = "testObjs null";
	}

	if( pass_count == expected_passes )
	{
		test_result = g_PASS;
		test_extra = "";
	}
	
	log_test_result(tc_base, fName, test_result, test_extra );

	//g_report_max_depth = t;

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
	testCalcType( tc_base, "err only", fName ) ;
	testLocType( tc_base, "dist at", fName );
	testReset();
	runStandardTests( tc_base, g_tests, fName );
	//onChoiceTest()
}


