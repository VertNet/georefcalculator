var enum_report_level =
{
	FULL: 1,
	FAIL_ONLY: 2
}

var tr =
{
	FAIL: false,
	PASS: true
//	SKIP: 3
}


var g_test_report = enum_report_level.FULL;

var g_PASS = tr.PASS;
var g_FAIL = tr.FAIL;
var g_SKIP = tr.SKIP;


function log_test_result( name, result, extra )
{
	console.log("Test: " + name + " Result: " + result )
	if( extra )
	{
		console.log("Test: " + name + " Extra: " + extra )
	}
}

function test_SetSelectIndex( name, index )
{

}


function testHiddenDisplay( name, expected_hid, expected_dis )
{
	var fName = testHelperfName();
	var test_result_h = testHidden( name, expected_hid );
	var test_result_d = testDisplay( name, expected_dis );;
   
	var test_result = g_FAIL;
	if( test_result_h && test_result_d )
	{
		test_result = g_PASS;
	}
	return test_result;
}

function testHelperfName()
{
   var fName = arguments.callee.caller.toString();
   fName = fName.substr('function ', fName.length );
   fName = fName.substr(0, fName.indexOf('('));
   fName = fName.substr(9, fName.length );

   //fName = fName.substr(0, fName.indexOf('('));

   return fName;
}

function testHidden( name, expected )
{
   var fName = testHelperfName();

	var test_result = g_FAIL;
	var test_extra = "UNKNOWN";
	var el = document.getElementById( name );

	if( el )
	{
		var st = el.hidden;
		if( st )
		{
			var actual = st.toString();
			if( st == expected )
			{
				test_result = g_PASS;
			}
			else 
			{
				test_extra = fName + ": Element " + name + " style.display Actual: " + actual + " Expected: " + expected;
			}
		}		
		else
		{
			test_extra = fName + ": Element " + name + " has no HTML attribute 'hidden'";
		}
	}
	else
	(
		test_extra = fName + ": Element " + name + " not found "
	)
	return test_result;

}



function testDisplay( name, expected )
{
   var fName = testHelperfName();

	var test_result = g_FAIL;
	var test_extra = "UNKNOWN";
	var el = document.getElementById( name );

	if( el )
	{
		var st = el.style.display;
		if( st )
		{
			var actual = st.toString();
			if( st == expected )
			{
				test_result = g_PASS;
			}
			else 
			{
				test_extra = fName +": Element " + name + " style.display Actual: " + actual + " Expected: " + expected;
			}
		}		
		else
		{
			test_extra = fName +": Element " + name + " has no CSS style property 'display'";
		}
	}
	else
	(
		test_extra = fName +": Element " + name + " not found"
	)
	return test_result;
}




function test_it()
{
	log_test_result("log_test_result", "pass", "foo");
	testHiddenDisplay("ChoiceModel", "fail", "fail" );
	testHiddenDisplay("ChoiceModel", "true", "none" );
	
}

