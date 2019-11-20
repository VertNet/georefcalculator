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
__copyright__ = "Copyright 2019 Rauthiflor LLC"
__version__ = "support.js 2019-11-20T12:56-3:00"
*/

    function convertDistance(){
        var fromdist;
        var todist;
        var s = null;
        var fromUnit = null;
        var toUnit = null;
        s = uiGetTextValue("TextFieldFromDistance");

        if( s == null || s.length == 0 )
        {
            fromdist = 0;
            uiSetLabelExplicit("TextFieldToDistance","0");
        }
        else
        {
            var num = null;
            try 
            {
                num = formatCalcDec.throwFormatError( s );
                fromdist = num;
                fromUnit = uiGetSelectedText("ChoiceFromDistUnits");
                toUnit = uiGetSelectedText("ChoiceToDistUnits");
                todist = convertLengthFromTo(fromdist,fromUnit,toUnit);
                uiSetLabelExplicit("TextFieldToDistance", formatDistance.checkFormat(todist) );
            }
            catch ( exp )
            {
                errorDialog(g_properties.getPropertyLang("error.number.message"),
                    g_properties.getPropertyLang("error.number.title"), "TextFieldFromDistance", 0);
                uiSetLabelExplicit("TextFieldFromDistance","0" );
                uiSetLabelExplicit("TextFieldToDistance", "0" );
            }
        }
    }

    function convertScale(){
        var fromdist;
        var todist;
        var scale = 1;
        var s = null;
        var fromUnit = null;
        var toUnit = null;
        var fromScale = null;
    
        s = uiGetTextValue("TextFieldScaleFromDistance");
        if( s == null || s.length == 0 )
        {
            fromdist = 0;
            uiSetLabelExplicit("TextFieldScaleToDistance","0");
        }
        else
        {
            var num = null;
            try
            {
                num = s;
                fromdist = num;
                fromUnit = uiGetSelectedText("ChoiceScaleFromDistUnits");
                toUnit = uiGetSelectedText("ChoiceScaleToDistUnits");
                fromScale = uiGetSelectedText("ChoiceScale");
                
                s = fromScale.substring(2, fromScale.length);
                
                if( s == null || s.length == 0 )
                {
                    scale = 1;
                }
                else
                {
                    num = s;
                    scale = num;
                }           
                scalefactor = scale;
                if(fromUnit == "mm" )
                {
                    fromUnit = "m";
                    scalefactor/=1000.0;
                }
                else if( fromUnit == "cm" ) 
                {
                    fromUnit = "m";
                    scalefactor/=100.0;
                }
                else if(fromUnit == "in")
                {
                    fromUnit = "ft";
                    scalefactor/=12.0;
                }
                todist = scalefactor*convertLengthFromTo(fromdist,fromUnit,toUnit);
                uiSetLabelExplicit("TextFieldScaleToDistance", formatDistance.checkFormat(todist) );
            }
            catch( exp )
            {
                errorDialog(g_properties.getPropertyLang("error.number.message"),
                    g_properties.getPropertyLang("error.number.title."), "TextFieldScaleFromDistance", 0);
                uiSetLabelExplicit("TextFieldScaleFromDistance", "0" ); 
                uiSetLabelExplicit("TextFieldScaleToDistance", "0" );
            }
        }
    }
    
    function testParameterLimits(){
        if( !testLatLongLimits() )
        {
            console.log("ERROR: testParameterLimits() failed at testLatLongLimits");
            return false;
        }       
        if( !testHeadingLimits() )
        {
            console.log("ERROR: testParameterLimits() failed at testHeadingLimits()");
            return false;
        }
        if( !testOffsetLimits() )
        {
            console.log("ERROR: testParameterLimits() failed at testOffsetLimits()");
            return false;
        }
        if( !testOffsetEWLimits() )
        {
            console.log("ERROR: testParameterLimits() failed at testOffsetEWLimits()");
            return false;
        }
        if( !testExtentLimits() )
        {
            console.log("ERROR: testParameterLimits() failed at testExtentLimits()");
            return false;
        }
        if ( !testMeasurementErrorLimits() )
        {
            console.log("ERROR: testParameterLimits() failed at testMeasurementErrorLimits()");
            return false;
        }
        return true;
    }

    function calculateResults(){
        if( testParameterLimits() == false )
        {
            return;
        }
        
        translateCoords();
        getNewCoordinates();
        testResultCoordinates();

        var declatstr = newdecimallatitude;
        uiSetLabelExplicit("TextFieldCalcDecLat",  declatstr );

        var declongstr = newdecimallongitude;
        uiSetLabelExplicit("TextFieldCalcDecLong", declongstr );

        calculateMaxErrorDistance();

        var errstr = maxerrordistance;
//        uiSetLabelExplicit("TextFieldCalcErrorDist", errstr );
        var distunits = uiGetSelectedText("ChoiceDistUnits");
        
        var datumstr = uiGetSelectedText("ChoiceDatum");
        var coordsysstr = uiGetSelectedText("ChoiceCoordSystem");
        var coordprecisionstr = uiGetSelectedText("ChoiceLatPrecision");
        var georeferencerstr = uiGetTextValue("TextFieldCalcGeoreferencer");
 		var currentDate = new Date();
        var datestr = currentDate.toISOString()
        var protocolstr = uiGetSelectedText("ChoiceProtocol");
        var distanceprecisionstr = null;
        var resultprecisionstr = "0.0000001"

        if( uiIsVisible("ChoiceDistancePrecision") )
        {
            distanceprecisionstr = uiGetSelectedText("ChoiceDistancePrecision");
        }
        else
        {
            distanceprecisionstr = "";
        }
        
        var extentstr = null;
        
        if( uiIsVisible("TextFieldExtent") )
        {
            extentstr = uiGetTextValue("TextFieldExtent");
        }
        else
        {
            extentstr = "";
        }
        
        declatstr = uiGetTextValue("TextFieldCalcDecLat");
        declongstr = uiGetTextValue("TextFieldCalcDecLong");
        
        if( declatstr.length > 9 )
        { // if there are floating point residuals in the calculation
            declatstr = declatstr.substring(0,9);
        }
        
        if( declongstr.length > 10 )
        { // if there are floating point residuals in the calculation
            declongstr = declongstr.substring(0,10);
        }

//        errstr = uiGetTextValue("TextFieldCalcErrorDist");
        var errorinmeters = Math.round(
                                convertLengthFromTo( maxerrordistance,
                                    uiGetSelectedText("ChoiceDistUnits"), "m" )
                               );

        uiSetLabelExplicit("TextFieldCalcDecLat", formatCalcDec.checkFormat( newdecimallatitude ) );
        uiSetLabelExplicit("TextFieldCalcDecLong",formatCalcDec.checkFormat( newdecimallongitude) );
//        uiSetLabelExplicit("TextFieldCalcErrorDist", formatCalcError.checkFormat( maxerrordistance ) );
        uiSetLabelExplicit("TextFieldCalcErrorDist", formatCalcError.checkFormat( errorinmeters ) );
        uiSetLabelExplicit("TextFieldCalcDatum", datumstr);
        uiSetLabelExplicit("TextFieldCalcPrecision", resultprecisionstr);
        uiSetLabelExplicit("TextFieldCalcDate", datestr);
        /***
            Output meant to have tab-delimited output in the full result text box.
            This can then be copied and pasted into a spreadsheet from the application.
            Field order consists first of Darwin Core (http://rs.tdwg.org/dwc/) terms:
              decimalLatitude, decimalLongitude, coordinateUncertaintyInMeters, geodeticDatum, verbatimCoordinateSystem
              followed by additional parameters of the calculation:
              Extent, MaxErrorDistance, DistanceUnits, DistancePrecision, CoordinatePrecision
            The CoordinatePrecision here is the precision of the input coordinates, not of the final output. So this does
            not match the meaning of the Darwin Core term coordinatePrecision.
        ***/

/*
        var resultstr = formatCalcDec.checkFormat( newdecimallatitude ) + '\u0009' +
                        formatCalcDec.checkFormat( newdecimallongitude ) + '\u0009' +
                        formatCalcDec.checkFormat( errorinmeters ) + '\u0009' +
                        datumstr + '\u0009' + 
                        coordsysstr + '\u0009' + 
                        extentstr + '\u0009' +
                        formatCalcError.checkFormat( maxerrordistance ) + '\u0009' +
                        distunits + '\u0009' + 
                        distanceprecisionstr + '\u0009' +
                        coordprecisionstr;
*/
        var resultstr = formatCalcDec.checkFormat( newdecimallatitude ) + '\u0009' +
                        formatCalcDec.checkFormat( newdecimallongitude ) + '\u0009' +
                        datumstr + '\u0009' + 
                        formatCalcDec.checkFormat( errorinmeters ) + '\u0009' +
                        resultprecisionstr + '\u0009' + 
                        georeferencerstr + '\u0009' + 
                        datestr + '\u0009' + 
                        protocolstr;

        uiSetLabelExplicit("TextFieldFullResult",resultstr);
        return true;
    }

    function translateCoords(){
        var ddeclat = 0;
        var ddeclong = 0;
        var num = null;
        var s = null;

        if( lastcoordsystem == 1 )
        { // was decimal degrees
            s = uiGetTextValue("txtT2Dec_Lat");
            if( s == null || s.length == 0 )
            {
                ddeclat = 0;
            }
            else
            {
                num = s;
                ddeclat = num;
            }
            decimallatitude = ddeclat;
            getDMSFromDecDegrees( decimallatitude );

            uiSetLabelExplicit("txtT7Lat_DegDMS",formatDeg.checkFormat( degrees ) );
            uiSetLabelExplicit("txtT7Lat_DegMM",formatDeg.checkFormat(degrees)); 
            uiSetLabelExplicit("txtT7Lat_MinDMS",formatMin.checkFormat(minutes));
            uiSetLabelExplicit("txtT7Lat_Sec",formatSec.checkFormat(seconds)); 
            
            if( decimallatitude >= 0 )
            {
                uiSetSelectedValue("ChoiceLatDirDMS",g_properties.getPropertyLang("headings.n"));
                uiSetSelectedValue("ChoiceLatDirMM",g_properties.getPropertyLang("headings.n"));
            }
            else
            {
                uiSetSelectedValue("ChoiceLatDirDMS",g_properties.getPropertyLang("headings.s"));
                uiSetSelectedValue("ChoiceLatDirMM",g_properties.getPropertyLang("headings.s"));
            }

            var dmins = getDecimalMinutesFromMS( minutes, seconds );
            
            uiSetLabelExplicit("txtT7Lat_MinMM",formatMinMM.checkFormat(dmins));

            s = uiGetTextValue("txtT2Dec_Long");
            if( s == null || s.length == 0 )
            {
                ddeclong = 0;
            }
            else
            {
                num = s;
                ddeclong = num;
            }

            decimallongitude = ddeclong;
            getDMSFromDecDegrees( decimallongitude );
            uiSetLabelExplicit("txtT7Long_DegDMS",formatDeg.checkFormat(degrees));
            uiSetLabelExplicit("txtT7Long_DegMM",formatDeg.checkFormat(degrees));
            uiSetLabelExplicit("txtT7Long_MinDMS",formatMin.checkFormat(minutes));
            uiSetLabelExplicit("txtT7Long_Sec",formatSec.checkFormat(seconds));
            if( decimallongitude >= 0 )
            {
                uiSetSelectedValue("ChoiceLongDirDMS",g_properties.getPropertyLang("headings.e"));
                uiSetSelectedValue("ChoiceLongDirMM",g_properties.getPropertyLang("headings.e"));
            }
            else
            {
                uiSetSelectedValue("ChoiceLongDirDMS",g_properties.getPropertyLang("headings.w"));
                uiSetSelectedValue("ChoiceLongDirMM",g_properties.getPropertyLang("headings.w"));
            }

            dmins = getDecimalMinutesFromMS( minutes, seconds );
            uiSetLabelExplicit("txtT7Long_MinMM",formatMinMM.checkFormat(dmins));
        }
        else if( lastcoordsystem == 2 )
        { // was degrees minutes seconds
            num = uiGetTextValue("txtT7Lat_DegDMS");
            degrees = num;
            num = uiGetTextValue("txtT7Lat_MinDMS");
            minutes = num;
            var d = 0;
            s = uiGetTextValue("txtT7Lat_Sec");
            if( s == null || s.length == 0 )
            {
                d = 0;
            }
            else
            {
                num = s;
                d = num;
            }
            seconds = d;

            decimallatitude = Math.abs( getDecimalDegreesFromDMS(degrees, minutes, seconds) );

            var SLatDirDMS = uiGetSelectedText("ChoiceLatDirDMS");
            
            if( SLatDirDMS == g_properties.getPropertyLang("headings.s")) 
            {
                decimallatitude *= -1.0;
            }
            uiSetLabelExplicit("txtT2Dec_Lat", formatDec.checkFormat(decimallatitude ));

            uiSetLabelExplicit("txtT7Lat_DegMM",formatDeg.checkFormat(degrees));
            decminutes = getDecimalMinutesFromMS( minutes, seconds );
            uiSetLabelExplicit("txtT7Lat_MinMM",formatMinMM.checkFormat(decminutes));

            num = uiGetTextValue("txtT7Long_DegDMS");
            degrees = num;


            num = uiGetTextValue("txtT7Long_MinDMS");
            minutes = num;

            s = uiGetTextValue("txtT7Long_Sec");
            if( s == null || s.length == 0 )
            {
                d = 0;
            }
            else
            {
                num = s;
                d = num;
            }
            seconds = d;

            decimallongitude = Math.abs( getDecimalDegreesFromDMS(degrees, minutes, seconds) );
            var SLongDirDMS = uiGetSelectedText("ChoiceLongDirDMS");
            
            if( SLongDirDMS  == g_properties.getPropertyLang("headings.w") )
            {
                decimallongitude *= -1;
            }
            uiSetLabelExplicit("txtT2Dec_Long", formatDec.checkFormat( decimallongitude ) );

            uiSetLabelExplicit("txtT7Long_DegMM", formatDeg.checkFormat( degrees ));
            decminutes = getDecimalMinutesFromMS( minutes, seconds );
            uiSetLabelExplicit("txtT7Long_MinMM", formatMinMM.checkFormat( decminutes));
        }
        else if( lastcoordsystem == 3 )
        { // was degrees decimal minutes
            num = uiGetTextValue("txtT7Lat_DegMM");
            degrees = num;

            //double m = 0;
            var m = 0;
            s = uiGetTextValue("txtT7Lat_MinMM");
            if( s == null || s.length == 0 )
            {
                m = 0;
            }
            else
            {
                num = s;
                m = num;
            }
            decminutes = m;

            decimallatitude = Math.abs( getDecimalDegreesFromDegreesDecimalMinutes(degrees, decminutes) );
            var SLatDirMM = uiGetSelectedText("ChoiceLatDirMM");
            if( SLatDirMM == g_properties.getPropertyLang("headings.s"))  
            {
                decimallatitude *= -1;
            }
            
            uiSetLabelExplicit("txtT2Dec_Lat",formatDec.checkFormat( decimallatitude));

            getMSFromDecMinutes(decminutes);
            uiSetLabelExplicit("txtT7Lat_DegDMS", formatDeg.checkFormat( degrees ));
            uiSetLabelExplicit("txtT7Lat_MinDMS", formatMin.checkFormat( minutes ));
            uiSetLabelExplicit("txtT7Lat_Sec", formatSec.checkFormat( seconds ));

            uiSetSelectedValue("ChoiceLatDirDMS", uiGetSelectedText("ChoiceLatDirMM") );

            num = uiGetTextValue("txtT7Long_DegMM");
            degrees = num;

            s = uiGetTextValue("txtT7Long_MinMM");
            if( s == null || s.length == 0 )
            {
                m = 0;
            }
            else
            {
                num = s;
                m = num;
            }
            decminutes = m;
            decimallongitude = Math.abs( getDecimalDegreesFromDegreesDecimalMinutes(degrees, decminutes) );
            var SLongDirMM = uiGetSelectedText("ChoiceLongDirMM");
            if( SLongDirMM == g_properties.getPropertyLang("headings.w") )
            {
                decimallongitude *= -1;
            }
            uiSetLabelExplicit("txtT2Dec_Long", formatDec.checkFormat( decimallongitude ));

            getMSFromDecMinutes(decminutes);
            uiSetLabelExplicit("txtT7Long_DegDMS", formatDeg.checkFormat( degrees ));
            uiSetLabelExplicit("txtT7Long_MinDMS", formatMin.checkFormat( minutes ));
            uiSetLabelExplicit("txtT7Long_Sec", formatSec.checkFormat( seconds ));
            uiSetSelectedValue( "ChoiceLongDirDMS", uiGetSelectedText( "ChoiceLongDirMM" ) );
        }
        else
        {
            console.log( "ERROR: translateCoords index not found :" + index + ":" )
        }
        var SCoordSystem = uiGetSelectedText("ChoiceCoordSystem");
        var index = g_canonicalcoordsystems.indexOf(SCoordSystem);

        lastcoordsystem = index+1;
    }

    function convertFromFeetTo( m, units ){
        var newvalue = m;
        // Convert from feet...
        if( units =="m" )
        {
            newvalue *= 0.3048;
        }
        else if( units == "km" )
        {
            newvalue *= 0.0003048;
        }
        else if( units == "mi" )
        {
            newvalue *= 0.0001893939393939;
        }
        else if( units == "yds" ) 
        {
            newvalue *= 0.333333333;
        }
        else if( units == "nm" )
        {
            newvalue *= 0.00016458;
        }
        return newvalue;
    }
    
    function convertFromMetersTo( m, units ){
        var newvalue = m;
        // Convert from meters...
        if( units == "ft" )
        {
            newvalue =  m*3.28084;
        }
        else if( units == "km" )
        {
            newvalue = m*0.001;
        }
        else if( units == "mi" )
        {
            newvalue =  m*0.000621371;
        }
        else if( units == "yds" )
        {
            newvalue =  m*1.09361;
        }
        else if( units == "nm" )
        {
            newvalue = m*0.00053996;
        }
        return newvalue;
    }

    function convertLengthFromTo( length, from_units, to_units ){
        if( from_units == null || to_units == null )
        {
            return 0.0;
        }
        
        var newvalue = length;
        if( from_units == "m" )
        { // meters to...
            if( to_units == "ft" )
            {
                newvalue *= 3.28084;
            }
            else if( to_units == "km" )
            {
                newvalue *= 0.001;
            }
            else if( to_units == "mi" )
            {
                newvalue *= 0.000621371;
            }
            else if( to_units == "yds" )
            {
                newvalue *= 1.09361;
            }
            else if( to_units == "nm" )
            {
                newvalue *= 0.00053996;
            }
        }
        else if( from_units == "ft" )
        { // feet to...
            if( to_units == "m" )
            {
                newvalue *= 0.3048;
            }
            else if( to_units == "km" )
            {
                newvalue *= 0.0003048;
            }
            else if( to_units == "mi" )
            {
                newvalue *= 0.0001893939393939;
            }
            else if( to_units == "yds" )
            {
                newvalue *= 0.333333333;
            }
            else if( to_units == "nm" )
            {
                newvalue *= 0.00016458;
            }
        }
        else if( from_units == "km" )
        { // kilometers to...
            if( to_units == "ft" )
            {
                newvalue *= 3280.84;
            }
            else if( to_units == "m" )
            {
                newvalue *= 1000.0;
            }
            else if( to_units == "mi" )
            {
                newvalue *= 0.621371;
            }
            else if( to_units == "yds" )
            {
                newvalue *= 1093.61;
            }
            else if( to_units == "nm" )
            {
                newvalue *= 0.53996;
            }
        }
        else if( from_units == "mi" )
        { // miles to...
            if( to_units == "ft" )
            {
                newvalue *= 5280.0;
            }
            else if( to_units == "m" )
            {
                newvalue *= 1609.3445;
            }
            else if( to_units == "km" )
            {
                newvalue *= 1.6093445;
            }
            else if( to_units == "yds" )
            {
                newvalue *= 1760.0;
            }
            else if( to_units == "nm" )
            {
                newvalue *= 0.86897624;
            }
        }
        else if( from_units == "yds" )
        { // yards to...
            if( to_units == "ft" )
            {
                newvalue *= 3.0;
            }
            else if( to_units == "m" )
            {
                newvalue *= 0.91440276;
            }
            else if( to_units == "km" )
            {
                newvalue *= 0.00091440276;
            }
            else if( to_units == "mi" )
            {
                newvalue *= 0.00056818182;
            }
            else if( to_units == "nm" )
            {
                newvalue *= 0.00049374;
            }
        }
        else if( from_units == "nm" )
        { // nautical miles to...
            if( to_units == "ft" )
            {
                newvalue *= 6076.1155;
            }
            else if( to_units == "m" )
            {
                newvalue *= 1852.0;
            }
            else if( to_units == "km" )
            {
                newvalue *= 1.852;
            }
            else if( to_units == "mi" )
            {
                newvalue *= 1.1507795;
            }
            else if( to_units == "yds" )
            {
                newvalue *= 2025.3718;
            }
        }
        return newvalue;
    }

    function getDatumError(){ 
        var s = uiGetSelectedText("ChoiceDatum");
        if( s != null && s !== g_properties.getPropertyLang("datum.notrecorded") )
        {
            return 0.0;
        }
        var error = 0.0;
        var latcells = 180/GRIDDEGREES;
        var i = Math.round((Number(decimallatitude)+90)/GRIDDEGREES);
        var j = Math.round((Number(decimallongitude)+180)/GRIDDEGREES);
        var n = j*latcells + i;
        error = datumerror[n];
        return error;
    }

    function getDecimalDegreesFromDegreesDecimalMinutes( d, m ){
        var ddegs = Math.abs(m/60.0);
        ddegs += Math.abs(d);
        return ddegs;
    }

    function getDecimalDegreesFromDMS( d, m, s){
        var ddegs = Math.abs(s/3600.0);
        ddegs += Math.abs(m/60.0);
        ddegs += Math.abs(d);
        return ddegs;
    }

    function getDecimalMinutesFromMS( m, s){
        var dmins = Math.abs(s/60.0);
        dmins += Math.abs(m);
        return dmins;
    }

    function getDirectionError( offset, disterr ){
        var alpha = 1.0; // direction precision, in degrees.
        var dir = uiGetSelectedText("ChoiceDirection");

        var index = g_canonicalheadings.indexOf(dir);
        if( index<4 )
        {
            alpha=45.0;
        }
        else if( index<8 )
        {
            alpha=22.5;
        }
        else if( index<16 )
        {
            alpha=11.25;
        }
        else if( index<32 )
        {
            alpha=5.625;
        }

        var x = offset*Math.cos(alpha*Math.PI/180.0);
        var y = offset*Math.sin(alpha*Math.PI/180.0);
        var xp = offset+disterr;
        var error = Math.sqrt( Math.pow(xp-x,2) + Math.pow(y,2) );
        return error; // error is in whatever units are selected.
    }

    function getDistancePrecisionError(){
        var error = 0.0;
        var precstr = uiGetSelectedText("ChoiceDistancePrecision");
        var units = uiGetSelectedText("ChoiceDistUnits");

        if( precstr == "100 " + units )
        {
            error = 50.0;
        }
        else if( precstr == "10 " + units )
        {
            error = 5.0;
        }
        else if( precstr == "1 " + units )
        {
            error = 0.5;
        }
        else if( precstr == "1/2 " + units )
        {
            error = 0.25;
        }
        else if( precstr == "1/3 " + units )
        {
            error = 0.1666667;
        }
        else if( precstr == "1/4 " + units )
        {
            error = 0.125;
        }
        else if( precstr == "1/8 " + units )
        {
            error = 0.0625;
        }
        else if( precstr == "1/10 " + units )
        {
            error = 0.05;
        }
        else if( precstr == "1/100 " + units )
        {
            error = 0.005;
        }
        return error;
    }

    function getDMSFromDecDegrees( dval )
    { // 40.17, -67.1
        lastdecimaldegrees=dval;
        if ( dval < 0 ){
            sign = -1; // 1, -1
        }
        else
        {
            sign = 1;
        }
        
        seconds = sign*Number(dval)*3600.0; // 14461.2,  24156
        var degs = Math.floor(seconds/3600); // 40.17, 67.1
        degrees = degs; // 40, 67  
        seconds -= degrees*3600.0; // 61.2, 36.0
        var mins = seconds/60.0; // 1.02, 0.6
        decminutes = mins;
        minutes = Math.floor(mins); // 1, 0
        seconds -= minutes*60.0; // 1.2, 36.0
        var secsAsInt = getNearestInt( seconds*1000.0 );
        seconds=secsAsInt/1000.0;
        while ( seconds >= 60.0 )
        {
            seconds -= 60.0;
            minutes++;
        }
        if( Math.abs(seconds-60.0) < 0.01 )
        {
            seconds = 0.0;
            minutes++;
        }
        while ( minutes >= 60 )
        {
            minutes -= 60;
            degrees++;
        }
    }

    function getEllipsoidCode( datumstr ){
        if( datumstr == "(WGS84) World Geodetic System 1984") return "WE";
        if( datumstr == "Abidjan 1987") return "CD";
        if( datumstr == "Accra") return "WO";
        if( datumstr == "Aden 1925") return "CD";
        if( datumstr == "Adindan") return "CD";
        if( datumstr == "Afgooye") return "KA";
        if( datumstr == "Ain el Abd 1970") return "IN";
        if( datumstr == "Airy 1830 ellipsoid") return "AA";
        if( datumstr == "Airy Modified 1849 ellipsoid") return "AM";
        if( datumstr == "Alaska (NAD27)") return "CC";
        if( datumstr == "Alaska/Canada (NAD27)") return "CC";
        if( datumstr == "Albanian 1987") return "KA";
        if( datumstr == "American Samoa 1962") return "CC";
        if( datumstr == "Amersfoort") return "BR";
        if( datumstr == "Ammassalik 1958") return "IN";
        if( datumstr == "Anguilla 1957") return "CD";
        if( datumstr == "Anna 1 Astro 1965") return "AN";
        if( datumstr == "Antigua Island Astro 1943") return "CD";
        if( datumstr == "Aratu") return "IN";
        if( datumstr == "Arc 1950 mean") return "CD";
        if( datumstr == "Arc 1960 mean") return "CD";
        if( datumstr == "Ascension Island 1958") return "IN";
        if( datumstr == "Astro Beacon \"E\" 1945") return "IN";
        if( datumstr == "Astro DOS 71/4") return "IN";
        if( datumstr == "Astro Tern Island (FRIG) 1961") return "IN";
        if( datumstr == "Astronomic Station No. 1 1951") return "IN";
        if( datumstr == "Astronomic Station No. 2 1951, Truk Island") return "IN";
        if( datumstr == "Astronomic Station Ponape 1951") return "IN";
        if( datumstr == "Astronomical Station 1952") return "IN";
        if( datumstr == "Australian Antarctic Datum 1998") return "RF";
        if( datumstr == "(AGD66) Australian Geodetic Datum 1966") return "AN";
        if( datumstr == "(AGD84) Australian Geodetic Datum 1984") return "AN";
        if( datumstr == "Australian National ellipsoid") return "AN";
        if( datumstr == "Autonomous Regions of Portugal 2008") return "RF";
        if( datumstr == "Average Terrestrial System 1977 ellipsoid") return "AV";
        if( datumstr == "Ayabelle Lighthouse") return "CD";
        if( datumstr == "Azores Central Islands 1948") return "IN";
        if( datumstr == "Azores Central Islands 1995") return "IN";
        if( datumstr == "Azores Occidental Islands 1939") return "IN";
        if( datumstr == "Azores Oriental Islands 1940") return "IN";
        if( datumstr == "Azores Oriental Islands 1995") return "IN";
        if( datumstr == "Bahamas (NAD27)") return "CC";
        if( datumstr == "Barbados 1938") return "CD";
        if( datumstr == "Batavia") return "BR";
        if( datumstr == "Beduaram") return "CD";
        if( datumstr == "Beijing 1954") return "KA";
        if( datumstr == "Bekaa Valley 1920 (IGN)") return "CD";
        if( datumstr == "Bellevue (IGN)") return "IN";
        if( datumstr == "Bermuda 1957") return "CC";
        if( datumstr == "Bermuda 2000") return "WE";
        if( datumstr == "Bessel 1841 ellipsoid (Namibia)") return "BN";
        if( datumstr == "Bessel 1841 ellipsoid (non-Namibia)") return "BR";
        if( datumstr == "Bessel Modified ellipsoid") return "BM";
        if( datumstr == "Bhutan National Geodetic Datum") return "RF";
        if( datumstr == "Bioko") return "IN";
        if( datumstr == "Bissau") return "IN";
        if( datumstr == "Bogota 1975") return "IN";
        if( datumstr == "Bukit Rimpah") return "BN";
        if( datumstr == "Bulgaria Geodetic System 2005") return "RF";
        if( datumstr == "Cadastre 1997") return "IN";
        if( datumstr == "Camacupa") return "CD";
        if( datumstr == "Camp Area Astro") return "IN";
        if( datumstr == "Campo Inchauspe") return "IN";
        if( datumstr == "Canada Mean (NAD27)") return "CC";
        if( datumstr == "Canal Zone (NAD27)") return "CC";
        if( datumstr == "Canton Astro 1966") return "IN";
        if( datumstr == "Cape") return "CD";
        if( datumstr == "Cape Canaveral mean") return "CC";
        if( datumstr == "Caribbean (NAD27)") return "CC";
        if( datumstr == "Carthage") return "CD";
        if( datumstr == "Cayman Islands Geodetic Datum 2011") return "RF";
        if( datumstr == "Central America (NAD27)") return "CC";
        if( datumstr == "Centre Spatial Guyanais 1967") return "IN";
        if( datumstr == "CH1903") return "BR";
        if( datumstr == "CH1903+") return "BR";
        if( datumstr == "Chatham Island Astro 1971") return "IN";
        if( datumstr == "Chatham Islands Datum 1979") return "IN";
        if( datumstr == "Chua Astro") return "IN";
        if( datumstr == "Clarke 1858 ellipsoid") return "CE";
        if( datumstr == "Clarke 1866 ellipsoid") return "CC";
        if( datumstr == "Clarke 1880 ellipsoid") return "CD";
        if( datumstr == "Clarke 1880 (Benoit) ellipsoid") return "CB";
        if( datumstr == "Clarke 1880 (international foot) ellipsoid") return "CI";
        if( datumstr == "Co-Ordinate System 1937 of Estonia") return "BR";
        if( datumstr == "Cocos Islands 1965") return "AF";
        if( datumstr == "Combani 1950") return "IN";
        if( datumstr == "Conakry 1905") return "CD";
        if( datumstr == "Congo 1960 Pointe Noire") return "CD";
        if( datumstr == "Corrego Alegre 1961") return "IN";
        if( datumstr == "Corrego Alegre 1970-72") return "IN";
        if( datumstr == "Costa Rica 2005") return "WE";
        if( datumstr == "Cuba (NAD27)") return "CC";
        if( datumstr == "Croatian Terrestrial Reference System") return "RF";
        if( datumstr == "Cyprus") return "IN";
        if( datumstr == "Cyprus Geodetic Reference System 1993") return "WE";
        if( datumstr == "Dabola 1981") return "CD";
        if( datumstr == "Danish 1876") return "DN";
        if( datumstr == "Datum 73") return "IN";
        if( datumstr == "Datum Geodesi Nasional 1995") return "WE";
        if( datumstr == "Dealul Piscului 1930") return "IN";
        if( datumstr == "Deception Island") return "CD";
        if( datumstr == "Deir ez Zor") return "CD";
        if( datumstr == "Deutsches Hauptdreiecksnetz") return "BR";
        if( datumstr == "Diego Garcia 1969") return "IN";
        if( datumstr == "Djakarta (Batavia)") return "BR";
        if( datumstr == "DOS 1968") return "IN";
        if( datumstr == "Dominica 1945") return "CD";
        if( datumstr == "Douala 1948") return "IN";
        if( datumstr == "Easter Island 1967") return "IN"; 
        if( datumstr == "Egypt 1907") return "HE";
        if( datumstr == "Egypt Gulf of Suez S-650 TL") return "HE";
        if( datumstr == "Estonia 1992") return "RF";
        if( datumstr == "Estonia 1997") return "RF";
        if( datumstr == "European 1950") return "IN";
        if( datumstr == "European 1950 mean") return "IN";
        if( datumstr == "European Datum 1950(1977)") return "IN";
        if( datumstr == "European 1979 mean") return "IN";
        if( datumstr == "European Datum 1987") return "IN";
        if( datumstr == "European Libyan Datum 1979") return "IN";
        if( datumstr == "European Terrestrial Reference System 1989") return "RF";
        if( datumstr == "Everest ellipsoid (Brunei, Sabah, Sarawak)") return "EB";
        if( datumstr == "Everest ellipsoid (W. Malaysia, Singapore 1948)") return "EE";
        if( datumstr == "Everest 1830 (1937 Adjustment) ellipsoid India") return "EA";
        if( datumstr == "Everest India 1856 ellipsoid") return "EC";
        if( datumstr == "Everest 1830 (1962 Definition) ellipsoid India") return "EG";
        if( datumstr == "Everest 1830 (1975 Definition) ellipsoid India") return "EH";
        if( datumstr == "Everest Pakistan ellipsoid") return "EF";
        if( datumstr == "Everest W. Malaysia 1969 ellipsoid") return "ED";
        if( datumstr == "Fahud") return "CD";
        if( datumstr == "Fatu Iva 72") return "IN";
        if( datumstr == "Fehmarnbelt Datum 2010") return "RF";
        if( datumstr == "Fiji 1956") return "IN";
        if( datumstr == "Fiji Geodetic Datum 1986") return "WD";
        if( datumstr == "Final Datum 1958") return "CD";
        if( datumstr == "Finnish Nautical Chart") return "IN";
        if( datumstr == "Fort Marigot") return "IN";
        if( datumstr == "Fort Thomas 1955") return "CD";
        if( datumstr == "Gambia") return "CD";
        if( datumstr == "Gan 1970") return "IN";
        if( datumstr == "Gandajika Base") return "IN";
        if( datumstr == "Gan 1970") return "IN";
        if( datumstr == "Geocentric Datum Brunei Darussalam 2009") return "RF";
        if( datumstr == "Geocentric Datum of Australia 1994") return "RF";
        if( datumstr == "Geocentric Datum of Australia 2020") return "RF";
        if( datumstr == "Geocentric Datum of Korea") return "RF";
        if( datumstr == "Geodetic Datum of 1965") return "AM";
        if( datumstr == "Geodetic Datum 1949") return "IN";
        if( datumstr == "Geodetic Reference System 1967 ellipsoid") return "RE";
        if( datumstr == "Geodetic Reference System 1967 Modified ellipsoid") return "RD";
        if( datumstr == "Geodetic Reference System 1980 ellipsoid") return "RF";
        if( datumstr == "Ghana") return "WE";
        if( datumstr == "Graciosa Base SW 1948") return "IN";
        if( datumstr == "Grand Cayman Geodetic Datum 1959") return "CC";
        if( datumstr == "Grand Comoros") return "IN";
        if( datumstr == "Greek Geodetic Reference System 1987") return "RF";
        if( datumstr == "Greenland (NAD27)") return "CC";
        if( datumstr == "Greenland 1996") return "RF";
        if( datumstr == "Grenada 1953") return "CD";
        if( datumstr == "Guadeloupe 1948") return "IN";
        if( datumstr == "Guam 1963") return "CC";
        if( datumstr == "Gulshan 303") return "EA";
        if( datumstr == "Gunung Segara") return "BN";
        if( datumstr == "Gunung Serindung 1962") return "WE";
        if( datumstr == "GUX 1 Astro") return "IN";
        if( datumstr == "Hanoi 1972") return "KA";
        if( datumstr == "Hartebeesthoek94") return "WE";
        if( datumstr == "Helle 1954") return "IN";
        if( datumstr == "Helmert 1906 ellipsoid") return "HE";
        if( datumstr == "Herat North") return "IN";
        if( datumstr == "Hito XVIII 1963") return "IN";
        if( datumstr == "Hjorsey 1955") return "IN";
        if( datumstr == "Hong Kong 1963(67)") return "IN";
        if( datumstr == "Hong Kong 1980") return "IN";
        if( datumstr == "Hong Kong Geodetic") return "RF";
        if( datumstr == "Hough 1960 ellipsoid") return "HO";
        if( datumstr == "Hu-Tzu-Shan 1950") return "IN";
        if( datumstr == "Hungarian Datum 1909") return "BR";
        if( datumstr == "Hungarian Datum 1972") return "RE";
        if( datumstr == "IGN 1962 Kerguelen") return "IN";
        if( datumstr == "IGN53 Mare") return "IN";
        if( datumstr == "IGN56 Lifou") return "IN";
        if( datumstr == "IGN63 Hiva Oa") return "IN";
        if( datumstr == "IGN72 Grande Terre") return "IN";
        if( datumstr == "IGN72 Nuku Hiva") return "IN";
        if( datumstr == "Indian") return "EC";
        if( datumstr == "Indian 1954") return "EA";
        if( datumstr == "Indian 1960") return "EA";
        if( datumstr == "Indian 1975") return "EA";
        if( datumstr == "Indonesian 1974 ellipsoid") return "ID";
        if( datumstr == "Indonesian Datum 1974") return "ID";
        if( datumstr == "Institut Geographique du Congo Belge 1955") return "CD";
        if( datumstr == "International 1924 ellipsoid") return "IN";
        if( datumstr == "Iran") return "IN";
        if( datumstr == "Iraqi Geospatial Reference System") return "RF";
        if( datumstr == "Iraq-Kuwait Boundary Datum 1992") return "WE";
        if( datumstr == "Ireland 1965") return "AM";
        if( datumstr == "IRENET95") return "RF";
        if( datumstr == "Islands Net 1993") return "RF";
        if( datumstr == "Islands Net 2004") return "RF";
        if( datumstr == "Israel 1993") return "RF";
        if( datumstr == "Istituto Geografico Militaire 1995") return "WE";
        if( datumstr == "ISTS 061 Astro 1968") return "IN";
        if( datumstr == "ISTS 073 Astro 1969") return "IN";
        if( datumstr == "Iwo Jima 1945") return "IN";
        if( datumstr == "Jamaica 1969") return "CC";
        if( datumstr == "Jamaica 2001") return "WE";
        if( datumstr == "Japanese Geodetic Datum 2000") return "RF";
        if( datumstr == "Johnston Island 1961") return "IN";
        if( datumstr == "Jouik 1961") return "CD";
        if( datumstr == "Kalianpur 1937") return "EA";
        if( datumstr == "Kalianpur 1962") return "EG";
        if( datumstr == "Kalianpur 1975") return "EH";
        if( datumstr == "Kandawala") return "EA";
        if( datumstr == "Kapingamarangi Astronomic Station No. 3 1951") return "IN";
        if( datumstr == "Karbala 1979") return "CD";
        if( datumstr == "Kartastokoordinaattijarjestelma (1966)") return "IN";
        if( datumstr == "Katanga 1955") return "CC";
        if( datumstr == "Kerguelen Island 1949") return "IN";
        if( datumstr == "Kertau 1948") return "EE";
        if( datumstr == "Kertau 1968") return "EE";
        if( datumstr == "Korean Datum 1985") return "BR";
        if( datumstr == "Korean Geodetic System 1995") return "WE";
        if( datumstr == "Kosovo Reference System 2001") return "RF";
        if( datumstr == "Krassowsky 1940 ellipsoid") return "KA";
        if( datumstr == "Kusaie Astro 1951") return "IN";
        if( datumstr == "Kuwait Oil Company") return "CD";
        if( datumstr == "Kuwait Utility") return "RF";
        if( datumstr == "L.C. 5 Astro 1961") return "CC";
        if( datumstr == "La Canoa") return "IN";
        if( datumstr == "La Reunion") return "IN";
        if( datumstr == "Lao National Datum 1997") return "KA";
        if( datumstr == "Latvia 1992") return "RF";
        if( datumstr == "Le Pouce 1934") return "CD";
        if( datumstr == "Leigon") return "CD";
        if( datumstr == "Lemuta") return "IN";
        if( datumstr == "Liberia 1964") return "CD";
        if( datumstr == "Libyan Geodetic Datum 2006") return "IN";
        if( datumstr == "Lisbon 1890") return "BR";
        if( datumstr == "Lisbon 1937") return "IN";
        if( datumstr == "Lithuania 1994 (ETRS89)") return "RF";
        if( datumstr == "Locodjo 1965") return "CD";
        if( datumstr == "Luxembourg 1930") return "IN";
        if( datumstr == "Luzon 1911") return "CC";
        if( datumstr == "Macao 1920") return "IN";
        if( datumstr == "Macao Geodetic Datum 2008") return "RF";
        if( datumstr == "Mahe 1971") return "CD";
        if( datumstr == "Makassar") return "BR";
        if( datumstr == "Malongo 1987") return "IN";
        if( datumstr == "Manoca 1962") return "CD";
        if( datumstr == "Marco Astro") return "IN";
        if( datumstr == "Marco Geocentrico Nacional de Referencia") return "RF";
        if( datumstr == "Marco Geodesico Nacional de Bolivia") return "RF";
        if( datumstr == "Marcus Island 1952") return "IN";
        if( datumstr == "Marshall Islands 1960") return "HO";
        if( datumstr == "Martinique 1938") return "IN";
        if( datumstr == "Masirah Is. (Nahrwan)") return "CD";
        if( datumstr == "Massawa") return "BR";
        if( datumstr == "Maupiti 83") return "IN";
        if( datumstr == "Mauritania 1999") return "RF";
        if( datumstr == "Merchich") return "CD";
        if( datumstr == "Mexico (NAD27)") return "CC";
        if( datumstr == "Mexico ITRF2008") return "RF";
        if( datumstr == "Mexico ITRF92") return "RF";
        if( datumstr == "MGI 1901") return "BR";
        if( datumstr == "Midway Astro 1961") return "IN";
        if( datumstr == "Militar-Geographische Institut") return "BR";
        if( datumstr == "Mindanao") return "CC";
        if( datumstr == "Minna") return "CD"; 
        if( datumstr == "Modified Fischer 1960 ellipsoid") return "FA";
        if( datumstr == "MOLDREF99") return "RF";
        if( datumstr == "MOMRA Terrestrial Reference Frame 2000") return "RF";
        if( datumstr == "Monte Mario") return "IN";
        if( datumstr == "Montjong Lowe") return "WE";
        if( datumstr == "Montserrat Island Astro 1958") return "CD";
        if( datumstr == "Moorea 87") return "IN";
        if( datumstr == "MOP78") return "IN";
        if( datumstr == "Moznet (ITRF94)") return "WE";
        if( datumstr == "M'Poraloko") return "CD";
        if( datumstr == "Nahrwan") return "CD";
        if( datumstr == "Nahrwan 1934") return "CD";
        if( datumstr == "Nahrwan 1967") return "CD";
        if( datumstr == "Nakhl-e Ghanem") return "WE";
        if( datumstr == "Naparima 1955") return "IN";
        if( datumstr == "Naparima 1972") return "IN";
        if( datumstr == "Naparima, BWI") return "IN";
        if( datumstr == "National Geodetic Network") return "WE";
        if( datumstr == "NEA74 Noumea") return "IN";
        if( datumstr == "Nepal 1981") return "EA";
        if( datumstr == "New Zealand Geodetic Datum 1949") return "IN";
        if( datumstr == "New Zealand Geodetic Datum 2000") return "RF";
        if( datumstr == "NGO 1948") return "BM";
        if( datumstr == "(NAD83) North American Datum 1983") return "RF";
        if( datumstr == "NAD83 (High Accuracy Reference Network)") return "RF";
        if( datumstr == "NAD83 (National Spatial Reference System 2007)") return "RF";
        if( datumstr == "NAD83 Canadian Spatial Reference System") return "RF";
        if( datumstr == "(NAD27) North American 1927 mean") return "CC";
        if( datumstr == "North American Datum 1927") return "CC";
        if( datumstr == "North American Datum 1927 (1976)") return "CC";
        if( datumstr == "North American Datum 1927 (CGQ77)") return "CC";
        if( datumstr == "Nord Sahara 1959") return "CD";
        if( datumstr == "Nouakchott 1965") return "CD";
        if( datumstr == "Nouvelle Triangulation Francaise") return "CD";
        if( datumstr == "Observatorio Meteorologico 1939") return "IN";
        if( datumstr == "Observatorio 1966") return "IN";
        if( datumstr == "Ocotepeque 1935") return "CC";
        if( datumstr == "Old Egyptian 1907") return "HE";
        if( datumstr == "Old Hawaiian mean") return "CC";
        if( datumstr == "Old Hawaiian Kauai") return "CC";
        if( datumstr == "Old Hawaiian Maui") return "CC";
        if( datumstr == "Old Hawaiian Oahu") return "CC";
        if( datumstr == "Old Trinidad 1903") return "CE";
        if( datumstr == "Oman") return "CD";
        if( datumstr == "Oman National Geodetic Datum 2014") return "RF";
        if( datumstr == "Ordnance Survey of Great Britain 1936") return "AA";
        if( datumstr == "Ordnance Survey of Northern Ireland 1952") return "AA";
        if( datumstr == "Padang 1884") return "BR";
        if( datumstr == "Palestine 1923") return "CB";
        if( datumstr == "Pampa del Castillo") return "IN";
        if( datumstr == "Papua New Guinea Geodetic Datum 1994") return "RF";
        if( datumstr == "Parametry Zemli 1990") return "PZ";
        if( datumstr == "PDO Survey Datum 1993") return "CD";
        if( datumstr == "Peru96") return "RF";
        if( datumstr == "Petrels 1972") return "IN";
        if( datumstr == "Philippine Reference System 1992") return "CC";
        if( datumstr == "Phoenix Islands 1966") return "IN";
        if( datumstr == "Pico de las Nieves 1984") return "IN";
        if( datumstr == "Pitcairn 2006") return "WE";
        if( datumstr == "Pitcairn Astro 1967") return "IN";
        if( datumstr == "Point 58") return "CD";
        if( datumstr == "Point Noire 1958") return "CD";
        if( datumstr == "Pointe Geologie Perroud 1950") return "IN";
        if( datumstr == "Porto Santo 1936") return "IN";
        if( datumstr == "Porto Santo 1995") return "IN";
        if( datumstr == "Posiciones Geodesicas Argentinas 1994") return "WE";
        if( datumstr == "Posiciones Geodesicas Argentinas 1998") return "RF";
        if( datumstr == "Posiciones Geodesicas Argentinas 2007") return "RF";
        if( datumstr == "Potsdam Datum/83") return "BR";
        if( datumstr == "Potsdam Rauenberg DHDN") return "BN";
        if( datumstr == "Provisional South American 1956") return "IN";
        if( datumstr == "Provisional South Chilean 1963") return "IN";
        if( datumstr == "Puerto Rico") return "CC";
        if( datumstr == "Pulkovo 1942") return "KA";
        if( datumstr == "Pulkovo 1942(58)") return "KA";
        if( datumstr == "Pulkovo 1942(83)") return "KA";
        if( datumstr == "Pulkovo 1995") return "KA";
        if( datumstr == "PZ-90") return "PZ";
        if( datumstr == "Qatar 1974") return "IN";
        if( datumstr == "Qatar National Datum 1995") return "IN";
        if( datumstr == "Qornoq 1927") return "IN";
        if( datumstr == "Rassadiran") return "IN";
        if( datumstr == "Rauenberg Datum/83") return "BR";
        if( datumstr == "Red Geodesica de Canarias 1995") return "RF";
        if( datumstr == "Red Geodesica Venezolana") return "RF";
        if( datumstr == "Reseau de Reference des Antilles Francaises 1991") return "RF";
        if( datumstr == "Reseau Geodesique de la Polynesie Francaise") return "RF";
        if( datumstr == "Reseau Geodesique de la RDC 2005") return "RF";
        if( datumstr == "Reseau Geodesique de la Reunion 1992") return "RF";
        if( datumstr == "Reseau Geodesique de Mayotte 2004") return "RF";
        if( datumstr == "Reseau Geodesique de Nouvelle Caledonie 91-93") return "RF";
        if( datumstr == "Reseau Geodesique de Saint Pierre et Miquelon 2006") return "RF";
        if( datumstr == "Reseau Geodesique des Antilles Francaises 2009") return "RF";
        if( datumstr == "Reseau Geodesique Francais 1993") return "RF";
        if( datumstr == "Reseau Geodesique Francais Guyane 1995") return "RF";
        if( datumstr == "Reseau National Belge 1972") return "IN";
        if( datumstr == "Rete Dinamica Nazionale 2008") return "RF";
        if( datumstr == "Reunion 1947") return "IN";
        if( datumstr == "Reykjavik 1900") return "DN";
        if( datumstr == "Rikets koordinatsystem 1990") return "BR";
        if( datumstr == "Rome 1940") return "IN";
        if( datumstr == "Ross Sea Region Geodetic Datum 2000") return "RF";
        if( datumstr == "S-42") return "KA";
        if( datumstr == "S-JTSK") return "BR";
        if( datumstr == "Saint Pierre et Miquelon 1950") return "CC";
        if( datumstr == "Santo (DOS) 1965") return "IN";
        if( datumstr == "Sao Braz") return "IN";
        if( datumstr == "Sapper Hill 1943") return "IN";
        if( datumstr == "Schwarzeck") return "BN";
        if( datumstr == "Scoresbysund 1952") return "IN";
        if( datumstr == "Selvagem Grande 1938") return "IN";
        if( datumstr == "Serbian Reference Network 1998") return "RF";
        if( datumstr == "Serbian Spatial Reference System 2000") return "RF";
        if( datumstr == "Sicily") return "IN";
        if( datumstr == "Sierra Leone 1960") return "CD";
        if( datumstr == "Sierra Leone 1968") return "CD";
        if( datumstr == "SIRGAS_ES2007.8") return "RF";
        if( datumstr == "SIRGAS-Chile") return "RF";
        if( datumstr == "SIRGAS-ROU98") return "WE";
        if( datumstr == "Sistema de Referencia Geocentrico para America del Sur 1995") return "RF";
        if( datumstr == "Sistema de Referencia Geocentrico para las Americas 2000") return "RF";
        if( datumstr == "Sistema Geodesico Nacional de Panama MACARIO SOLIS") return "RF";
        if( datumstr == "Sister Islands Geodetic Datum 1961") return "CC";
        if( datumstr == "Slovenia Geodetic Datum 1996") return "RF";
        if( datumstr == "Solomon 1968") return "IN";
        if( datumstr == "South American 1969 ellipsoid") return "SA";
        if( datumstr == "South American Datum 1969") return "SA";
        if( datumstr == "South American Datum 1969(96)") return "RD";
        if( datumstr == "South Asia") return "FA";
        if( datumstr == "South East Island 1943") return "CD";
        if( datumstr == "South Georgia 1968") return "IN";
        if( datumstr == "South Yemen") return "KA";
        if( datumstr == "Southeast Base") return "IN";
        if( datumstr == "Sri Lanka Datum 1999") return "EA";
        if( datumstr == "St. George Island") return "CC";
        if( datumstr == "St. Helena Geodetic Datum 2015") return "RF";
        if( datumstr == "St. Helena Tritan") return "WE";
        if( datumstr == "St. Kitts 1955") return "CD";
        if( datumstr == "St. Lawrence Island") return "CC";
        if( datumstr == "St. Lucia 1955") return "CD";
        if( datumstr == "St. Paul Island") return "CC";
        if( datumstr == "St. Vincent 1945") return "CD";
        if( datumstr == "ST71 Belep") return "IN";
        if( datumstr == "ST84 Ile des Pins") return "IN";
        if( datumstr == "ST87 Ouvea") return "WE";
        if( datumstr == "SVY21") return "WE";
        if( datumstr == "SWEREF99") return "RF";
        if( datumstr == "Swiss Terrestrial Reference Frame 1995") return "RF";
        if( datumstr == "System of the Unified Trigonometrical Cadastral Ne") return "BR";
        if( datumstr == "Tahaa 54") return "IN";
        if( datumstr == "Tahiti 52") return "IN";
        if( datumstr == "Tahiti 79") return "IN";
        if( datumstr == "Taiwan Datum 1997") return "RF";
        if( datumstr == "Tananarive Observatory 1925") return "IN";
        if( datumstr == "Tern Island 1961") return "IN";
        if( datumstr == "Tete") return "CC";
        if( datumstr == "Timbalai 1948") return "EB";
        if( datumstr == "TM65") return "AM";
        if( datumstr == "Tokyo") return "BR";
        if( datumstr == "Trinidad 1903") return "CE";
        if( datumstr == "Tristan Astro 1968") return "IN";
        if( datumstr == "Turkish National Reference Frame") return "RF";
        if( datumstr == "Ukraine 2000") return "KA";
        if( datumstr == "United Arab Emirates (Nahrwan") return "CD";
        if( datumstr == "Vanua Levu 1915") return "CI";
        if( datumstr == "Vietnam 2000") return "WE";
        if( datumstr == "Viti Levu 1912") return "CI";
        if( datumstr == "Viti Levu 1916") return "CD";
        if( datumstr == "Voirol 1874") return "CD";
        if( datumstr == "Voirol 1875") return "CD";
        if( datumstr == "Voirol 1960") return "CD";
        if( datumstr == "(WGS66) World Geodetic System 1966") return "WC";
        if( datumstr == "(WGS66) World Geodetic System 1966 ellipsoid") return "WC";
        if( datumstr == "(WGS72) World Geodetic System 1972") return "WD";
        if( datumstr == "(WGS72) World Geodetic System 1972 ellipsoid") return "WD";
        if( datumstr == "(WGS72) Transit Broadcast Ephemeris") return "WD";
        if( datumstr == "Wake Island Astro 1952") return "IN";
        if( datumstr == "Wake-Eniwetok 1960") return "HO";
        if( datumstr == "War Office ellipsoid") return "WO";
        if( datumstr == "Yacare") return "IN";
        if( datumstr == "Yemen National Geodetic Network 1996") return "WE";
        if( datumstr == "Yoff") return "CD";
        if( datumstr == "Zanderij") return "IN";
        return "WE";
    }

    function getFlattening( ellipsoidIDCode ){
        // Data from NIMA TR8350.2
        if( ellipsoidIDCode == "AA") return 1/299.3249646;   // Airy 1830
        if( ellipsoidIDCode == "AM") return 1/299.3249646;   // Airy Modified 1849
        if( ellipsoidIDCode == "AN") return 1/298.25;        // Australian National
        if( ellipsoidIDCode == "AV") return 1/298.257;       // Average Terrestrial System 1977
        if( ellipsoidIDCode == "BR") return 1/299.1528128;   // Bessel 1841 Ethiopia, Indonesia, Japan, and Korea
        if( ellipsoidIDCode == "BN") return 1/299.1528128;   // Bessel 1841 Namibia
        if( ellipsoidIDCode == "BM") return 1/299.1528128;   // Bessel Modified
        if( ellipsoidIDCode == "CE") return 1/294.26;        // Clarke 1858
        if( ellipsoidIDCode == "CC") return 1/294.9786982;   // Clarke 1866
        if( ellipsoidIDCode == "CD") return 1/293.465;       // Clarke 1880
        if( ellipsoidIDCode == "CB") return 1/293.46631554;  // Clarke 1880 (Benoit)
        if( ellipsoidIDCode == "CI") return 1/293.4663077;   // Clarke 1880 (international foot)
        if( ellipsoidIDCode == "DN") return 1/300.0;         // Danish 1876
        if( ellipsoidIDCode == "EB") return 1/300.8017;      // Everest Brunei and E. Malaysia (Sabah and Sarawak)
        if( ellipsoidIDCode == "EA") return 1/300.8017;      // Everest 1830 (1937 Adjustment) India
        if( ellipsoidIDCode == "EC") return 1/300.8017;      // Everest India 1956
        if( ellipsoidIDCode == "EG") return 1/300.8017;      // Everest 1830 (1962 Definition) India
        if( ellipsoidIDCode == "EH") return 1/300.8017255;   // Everest 1830 (1975 Definition) India
        if( ellipsoidIDCode == "EF") return 1/300.8017;      // Everest Pakistan
        if( ellipsoidIDCode == "EE") return 1/300.8017;      // Everest W. Malaysia and Singapore 1948
        if( ellipsoidIDCode == "ED") return 1/300.8017;      // Everest W. Malaysia 1969
        if( ellipsoidIDCode == "RE") return 1/298.247167427; // Geodetic Reference System 1967
        if( ellipsoidIDCode == "RD") return 1/298.25;        // Geodetic Reference System 1967 Modified
        if( ellipsoidIDCode == "RF") return 1/298.257222101; // Geodetic Reference System 1980
        if( ellipsoidIDCode == "HE") return 1/298.3;         // Helmert 1906
        if( ellipsoidIDCode == "HO") return 1/297.0;         // Hough 1960
        if( ellipsoidIDCode == "ID") return 1/298.247;       // Indonesian 1974
        if( ellipsoidIDCode == "IN") return 1/297.0;         // International 1924
        if( ellipsoidIDCode == "KA") return 1/298.3;         // Krassowsky 1940
        if( ellipsoidIDCode == "PZ") return 1/298.257839303; // PZ-90
        if( ellipsoidIDCode == "FA") return 1/298.3;         // Modified Fischer 1960
        if( ellipsoidIDCode == "SA") return 1/298.25;        // South American 1969
        if( ellipsoidIDCode == "WO") return 1/296.0;         // War Office
        if( ellipsoidIDCode == "WC") return 1/298.25;        // WGS 1966
        if( ellipsoidIDCode == "WD") return 1/298.26;        // WGS 1972
        if( ellipsoidIDCode == "WE") return 1/298.257223563; // WGS84
        return 1/298.257223563;
    }

    function getSemiMajorAxis( ellipsoidIDCode ){
        // Data from NIMA TR8350.2
        if( ellipsoidIDCode == "AA") return 6377563.396; // Airy 1830
        if( ellipsoidIDCode == "AM") return 6377340.189; // Airy Modified 1849
        if( ellipsoidIDCode == "AN") return 6378160.0;   // Australian National Spheroid
        if( ellipsoidIDCode == "AV") return 6378135.0;   // Average Terrestrial System 1977
        if( ellipsoidIDCode == "BR") return 6377397.155; // Bessel 1841 Ethiopia, Indonesia, Japan, and Korea
        if( ellipsoidIDCode == "BN") return 6377483.865; // Bessel 1841 Namibia
        if( ellipsoidIDCode == "BM") return 6377492.018; // Bessel Modified
        if( ellipsoidIDCode == "CE") return 6378293.6;   // Clarke 1858
        if( ellipsoidIDCode == "CC") return 6378206.4;   // Clarke 1866
        if( ellipsoidIDCode == "CD") return 6378249.145; // Clarke 1880
        if( ellipsoidIDCode == "CB") return 6378300.789; // Clarke 1880 (Benoit)
        if( ellipsoidIDCode == "CI") return 6378306.370; // Clarke 1880 (international foot)
        if( ellipsoidIDCode == "DN") return 6377019.27;  // Danish 1876
        if( ellipsoidIDCode == "EB") return 6377298.556; // Everest Brunei and E. Malaysia (Sabah and Sarawak)
        if( ellipsoidIDCode == "EA") return 6377276.345; // Everest 1830 (1937 Adjustment) India
        if( ellipsoidIDCode == "EG") return 6377301.243; // Everest India 1956
        if( ellipsoidIDCode == "EC") return 6377301.243; // Everest 1830 (1962 Definition)
        if( ellipsoidIDCode == "EH") return 6377299.151; // Everest 1830 (1975 Definition)
        if( ellipsoidIDCode == "EF") return 6377309.613; // Everest Pakistan
        if( ellipsoidIDCode == "EE") return 6377304.063; // Everest W. Malaysia and Singapore 1948
        if( ellipsoidIDCode == "ED") return 6377295.664; // Everest W. Malaysia 1969
        if( ellipsoidIDCode == "RE") return 6378160.0;   // Geodetic Reference System 1967
        if( ellipsoidIDCode == "RD") return 6378160.0;   // Geodetic Reference System 1967 Modified
        if( ellipsoidIDCode == "RF") return 6378137.0;   // Geodetic Reference System 1980
        if( ellipsoidIDCode == "HE") return 6378200.0;   // Helmert 1906
        if( ellipsoidIDCode == "HO") return 6378270.0;   // Hough 1960
        if( ellipsoidIDCode == "ID") return 6378160.0;   // Indonesian 1974
        if( ellipsoidIDCode == "IN") return 6378388.0;   // International 1924
        if( ellipsoidIDCode == "KA") return 6378245.0;   // Krassowsky 1940
        if( ellipsoidIDCode == "FA") return 6378155.0;   // Modified Fischer 1960
        if( ellipsoidIDCode == "PZ") return 6378136.0;   // PZ-90
        if( ellipsoidIDCode == "SA") return 6378160.0;   // South American 1969
        if( ellipsoidIDCode == "WC") return 6378145.0;   // WGS 1966
        if( ellipsoidIDCode == "WO") return 6378300.0;   // War Office
        if( ellipsoidIDCode == "WD") return 6378135.0;   // WGS 1972
        if( ellipsoidIDCode == "WE") return 6378137.0;   // WGS84
        return 6378137.0;
    }

    function getGPSAccuracy(){
        if( uiGetSelectedText("ChoiceCoordSource") == g_properties.getPropertyLang("coordsource.gps") )
        {
            return getMeasurementError();
        }
        return 0;
    }

    function getExtentsError(){
        var exerr = 0;
        var s = uiGetTextValue("TextFieldExtent");
        var e = 0;
        var num = null;

        if( s != null && s.length != 0 )
        {
            num = s; 
            e = num;
            exerr = e;
        }
        return exerr;
    }

    function getMeasurementError(){
        var measurementerr = 0;
        var s = uiGetTextValue("TextFieldMeasurementError");
        var e = 0;
        var num = null;

        if( s != null && s.length != 0 )
        {
            num = s; 
            e = num;
            measurementerr = e;
        }

        return measurementerr;
    }

    function getMapScaleError(){
        var error = 0.0; // in feet
        var sourcestr = uiGetSelectedText("ChoiceCoordSource");
        var index = g_canonicalsources.indexOf(sourcestr);

        if( index==0 /*sourcestr.equals("gazetteer")*/ )
        {
            error = 0.0;
        }
        else if( index==1 /*sourcestr.equals("Google Maps/Earth 2008")*/ )
        {
            error = 167.0;
        }
        else if( index==2 /*sourcestr.equals("Google Maps/Earth 2018")*/ )
        {
            error = 26.0;
        }
        else if( index==3 /*sourcestr.equals("GPS")*/ )
        {
            error = 0.0;
        } else if( index==4 /*sourcestr.equals("locality description")*/ )
        {
            error = 0.0;
        } else if( index==5 /*sourcestr.equals("USGS map: 1:250,000")*/ )
        {
            error = 417;
        } else if( index==6 /*sourcestr.equals("USGS map: 1:100,000")*/ )
        {
            error = 167;
        }
        else if( index==7 /*sourcestr.equals("USGS map: 1:63,360")*/ )
        {
            error = 106;
        }
        else if( index==8 /*sourcestr.equals("USGS map: 1:62,500")*/ )
        {
            error = 105;
        }
        else if( index==9 /*sourcestr.equals("USGS map: 1:25,000")*/ )
        {
            error = 41.8;
        }
        else if( index==10 /*sourcestr.equals("USGS map: 1:24,000")*/ )
        {
            error = 40.0;
        }
        else if( index==11 /*sourcestr.equals("USGS map: 1:12,000")*/ )
        {
            error = 33.3;
        }
        else if( index==12 /*sourcestr.equals("USGS map: 1:10,000")*/ )
        {
            error = 27.8;
        }
        else if( index==13 /*sourcestr.equals("USGS map: 1:4800")*/ )
        {
            error = 13.3;
        }
        else if( index==14 /*sourcestr.equals("USGS map: 1:2400")*/ )
        {
            error = 6.7;
        }
        else if( index==15 /*sourcestr.equals("USGS map: 1:1200")*/ )
        {
            error = 3.3;
        }
        else if( index==16 /*sourcestr.equals("NTS map (A): 1:250,000")*/ )
        {
            error = 125*3.28084; // 0.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
        }
        else if( index==17 /*sourcestr.equals("NTS map (B): 1:250,000")*/ )
        {
            error = 250*3.28084; // 1.0mm NATO STANAG 2215 Edition 5 Accuracy ratings
        }
        else if( index==18 /*sourcestr.equals("NTS map (C): 1:250,000")*/ )
        {
            error = 375*3.28084; // 1.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
        }
        else if( index==19 /*sourcestr.equals("NTS map (A): 1:50,000")*/ )
        {
            error = 25*3.28084; // 0.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
        }
        else if( index==20 /*sourcestr.equals("NTS map (B): 1:50,000")*/ )
        {
            error = 50*3.28084; // 1.0mm NATO STANAG 2215 Edition 5 Accuracy ratings
        }
        else if( index==21 /*sourcestr.equals("NTS map (C): 1:50,000")*/ )
        {
            error = 75*3.28084; // 1.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
        }
        else if( index==22 /*sourcestr.equals("non-USGS map: 1:3,000,000")*/ )
        {
            error = 3000.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==23 /*sourcestr.equals("non-USGS map: 1:2,500,000")*/ )
        {
            error = 2500.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==24 /*sourcestr.equals("non-USGS map: 1:1,000,000")*/ )
        {
            error = 1000.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==25 /*sourcestr.equals("non-USGS map: 1:500,000")*/ )
        {
            error = 500.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==26 /*sourcestr.equals("non-USGS map: 1:250,000")*/ )
        {
            error = 250.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==27 /*sourcestr.equals("non-USGS map: 1:200,000")*/ )
        {
            error = 200.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==28 /*sourcestr.equals("non-USGS map: 1:180,000")*/ )
        {
            error = 180.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==29 /*sourcestr.equals("non-USGS map: 1:150,000")*/ )
        {
            error = 150.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==30 /*sourcestr.equals("non-USGS map: 1:125,000")*/ )
        {
            error = 125.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==31 /*sourcestr.equals("non-USGS map: 1:100,000")*/ )
        {
            error = 100.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==32 /*sourcestr.equals("non-USGS map: 1:80,000")*/ )
        {
            error = 80.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==33 /*sourcestr.equals("non-USGS map: 1:62,500")*/ )
        {
            error = 62.5*3.28084; // 1mm error default when map quality not known
        }
        else if( index==34 /*sourcestr.equals("non-USGS map: 1:60,000")*/ )
        {
            error = 60.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==35 /*sourcestr.equals("non-USGS map: 1:50,000")*/ )
        {
            error = 50.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==36 /*sourcestr.equals("non-USGS map: 1:40,000")*/ )
        {
            error = 40.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==37 /*sourcestr.equals("non-USGS map: 1:32,500")*/ )
        {
            error = 32.5*3.28084; // 1mm error default when map quality not known
        }
        else if( index==38 /*sourcestr.equals("non-USGS map: 1:25,000")*/ )
        {
            error = 25.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==39 /*sourcestr.equals("non-USGS map: 1:20,000")*/ )
        {
            error = 20.0*3.28084; // 1mm error default when map quality not known
        }
        else if( index==40 /*sourcestr.equals("non-USGS map: 1:10,000")*/ )
        {
            error = 10.0*3.28084; // 1mm error default when map quality not known
        }
        var distunitsstr = uiGetSelectedText("ChoiceDistUnits");
        error = convertFromFeetTo( error, distunitsstr );
        return error;
    }

    function getMSFromDecMinutes( dval ){
        lastdecimalminutes=dval;
        seconds = dval*60.0;
        var mins = dval;
        minutes = Math.floor(Number(mins));
        seconds -= minutes*60.0;
        var secsAsInt = getNearestInt( seconds*1000.0 );
        seconds=secsAsInt/1000.0;
        
        while( seconds >= 60.0 )
        {
            seconds -= 60.0;
            minutes++;
        }
        
        if( Math.abs(seconds-60.0) < .01 )
        {
            seconds = 0.0;
            minutes++;
        }
        
        while ( minutes >= 60 )
        {
            minutes -= 60;
            degrees++;
        }
    }

    function getNearestInt( dval ){
        var dValue = dval;
        var ival = Number(formatDeg.checkFormat(dValue));
        return ival;
    }

    function getNewCoordinates(){ 
        // this method should be called only to calculate new coordinates
        newdecimallatitude=Number( decimallatitude );
        newdecimallongitude=Number(decimallongitude );

        var s = null;
        var d = 0;
        var meterseast = 0;
        var metersnorth = 0;
        var metersoffset = 0;
        var num = null;

        calculateLatLongMetersPerDegree();

        var SBoxModel = uiGetSelectedText("ChoiceModel");
        if( SBoxModel == g_properties.getPropertyLang("loctype.orthodist"))
        {
            s = uiGetTextValue("TextFieldOffsetNS");
            if( s == null || s.length == 0 )
            {
                metersnorth = 0;
            }
            else
            {
                num = s;
                d = num;
                metersnorth = d;
                var SOffsetNSDir = uiGetSelectedText("ChoiceOffsetNSDir");
                if( SOffsetNSDir == g_properties.getPropertyLang("headings.s" ) )
                {
                    metersnorth *= -1.0;
                }
            }
            s = uiGetTextValue("TextFieldOffsetEW");
            if( s == null || s.length == 0 )
            {
                meterseast = 0;
            }
            else
            {
                num = s;
                d = num;
                meterseast = d;
                var SOffsetEWDir = uiGetSelectedText("ChoiceOffsetEWDir");
                if( SOffsetEWDir == g_properties.getPropertyLang("headings.w" ) )
                {
                    meterseast *= -1.0;
                }
            }
        }
        else if( SBoxModel == g_properties.getPropertyLang("loctype.distatheading" ) )
        {
            var heading = 0;
            var headingstr = uiGetSelectedText("ChoiceDirection");
            if( headingstr == g_properties.getPropertyLang("headings.nearestdegree" ) )
            {
                s = uiGetTextValue("TextFieldHeading");
                if( s == null || s.length == 0 )
                {
                    heading = 0;
                }
                else
                {
                    num = s;
                    d = num;
                    heading = d;
                }
            }
            else if( headingstr == g_properties.getPropertyLang("headings.n" ) )
            {
                heading = 0;
            } else if( headingstr == g_properties.getPropertyLang("headings.nbe" ) )
            {
                heading = 11.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.nne" ) )
            {
                heading = 22.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.nebn" ) )
            {
                heading = 33.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.ne" ) )
            {
                heading = 45.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.nebe" ) )
            {
                heading = 56.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.ene" ) )
            {
                heading = 67.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.ebn" ) )
            {
                heading = 78.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.e" ) )
            {
                heading = 90.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.ebs" ) )
            {
                heading = 101.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.ese" ) )
            {
                heading = 112.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.sebe" ) )
            {
                heading = 123.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.se" ) )
            {
                heading = 135.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.sebs" ) )
            {
                heading = 146.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.sse" ) )
            {
                heading = 157.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.sbe" ) )
            {
                heading = 168.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.s" ) )
            {
                heading = 180.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.sbw" ) )
            {
                heading = 191.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.ssw" ) )
            {
                heading = 202.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.swbs" ) )
            {
                heading = 213.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.sw" ) )
            {
                heading = 225.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.swbw" ) )
            {
                heading = 236.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.wsw" ) )
            {
                heading = 247.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.wbs" ) )
            {
                heading = 258.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.w" ) )
            {
                heading = 270.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.wbn" ) )
            {
                heading = 281.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.wnw" ) )
            {
                heading = 292.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.nwbw" ) )
            {
                heading = 303.75;
            } else if( headingstr == g_properties.getPropertyLang("headings.nw" ) )
            {
                heading = 315.0;
            } else if( headingstr == g_properties.getPropertyLang("headings.nwbn" ) )
            {
                heading = 326.25;
            } else if( headingstr == g_properties.getPropertyLang("headings.nnw" ) )
            {
                heading = 337.5;
            } else if( headingstr == g_properties.getPropertyLang("headings.nbw" ) )
            {
                heading = 348.75;
            }

            s = uiGetTextValue("TextFieldOffsetEW");
            if( s == null || s.length == 0 )
            {
                metersoffset = 0;
            }
            else
            {
                num = s;
                d = num;
                metersoffset = d;
            }
            metersnorth = metersoffset*Math.cos(Math.PI*heading/180.0);
            meterseast = metersoffset*Math.cos(Math.PI*(heading-90)/180.0);
        }
        // at this point metersnorth and meterseast are actually the values in the
        // selected distance units. These need to be converted to meters.
        metersnorth = convertLengthFromTo( metersnorth, uiGetSelectedText("ChoiceDistUnits"), "m" );
        meterseast = convertLengthFromTo( meterseast, uiGetSelectedText("ChoiceDistUnits"), "m" );

        var latchange = metersnorth/latmetersperdegree;
        var longchange = meterseast/longmetersperdegree;
        newdecimallatitude = Number( decimallatitude ) + Number( latchange );
        newdecimallatitude = 1.0*Math.round(newdecimallatitude*10000000)/10000000;
        newdecimallongitude = Number( decimallongitude ) + Number( longchange );
        newdecimallongitude = 1.0*Math.round(newdecimallongitude*10000000)/10000000;
    }


    function getOffset() {
        var num = null;
        var offsetstr = uiGetTextValue("TextFieldOffsetEW");
        var offset = 0;
        if( offsetstr == null || offsetstr.length == 0 )
        {
            offset = 0;
        } else {
            num = offsetstr;
            offset = num;
        }
        var d = offset; // offset distance
        return d;
    }
    
/*
    function readDatumError(){
        var error = 1000; // 1 km error if file can't be read properly
        var col = Math.round( 5*(Number(decimallongitude)+179.48) );
        var row = Math.round( 5*(84.69-Number(decimallatitude)) );

        error = datumerror[col][row];
        return error;
    }
*/

    function calculateMaxErrorDistance(){
        maxerrordistance=0.0;
        var model = uiGetSelectedText("ChoiceModel");
        var index = g_canonicalloctypes.indexOf(model);
        
        // Coordinates only
        if( index==0 )
        {
            //"Coordinates only (e.g., 27\u00b034'23.4\" N, 121\u00b056'42.3\" W)"
            maxerrordistance += Number( getDatumError());
            maxerrordistance += Number( getCoordPrecisionError());
            maxerrordistance += Number( getMapScaleError());
            maxerrordistance += Number( getMeasurementError() );
            // GPS accuracy and MeasurementError share the same TextField, no need to 
            // add it a second time.
        }

        // Named Place only
        if( index==1 )
        {
            //"Named place only (e.g., Bakersfield)"
            maxerrordistance += Number( getDatumError() );
            maxerrordistance += Number( getExtentsError() );
            maxerrordistance += Number( getMeasurementError() );
            maxerrordistance += Number( getMapScaleError() );
            maxerrordistance += Number( getCoordPrecisionError() );
        }

        // Distance only
        if( index==2 )
        {
            //"Distance only (e.g., 5 mi from Bakersfield)"
            maxerrordistance += Number( getDatumError());
            maxerrordistance += Number( getExtentsError());
            maxerrordistance += Number( getMeasurementError());
            maxerrordistance += Number( getDistancePrecisionError());
            maxerrordistance += Number( getMapScaleError());
            maxerrordistance += Number( getOffset());
            maxerrordistance += Number( getCoordPrecisionError());
        }

        // Distance along path
        if( index==3 )
        {
            //"Distance along path (e.g., 13 mi E (by road) Bakersfield)"
            maxerrordistance += Number( getDatumError() );
            maxerrordistance += Number( getExtentsError() );
            maxerrordistance += Number( getMeasurementError() );
            maxerrordistance += Number( getDistancePrecisionError() );
            maxerrordistance += Number( getMapScaleError() );
            maxerrordistance += Number( getCoordPrecisionError() );
        }

        // Orthogonal directions
        if( index==4 )
        {
            /***
            "Distance along orthogonal directions (e.g., 2 mi E and 3 mi N of Bakersfield)")
            The method used here since version 20130205 is better method for calculating 
            uncertainty than the method described in detail in the Georeferencing Guidelines.
            This method always result in smaller radii than the published one, because the 
            published one multiplies the contributions of various errors by the square root
            of 2 unnecessarily.
            Alternate Method: Datum, Extent, Measurement, Scale, and Coordinate Precision 
            already account for the two dimansions. Only Distance Precision error needs
            to be multiplied by the square root of 2.
            
            // Method prior to version 20130205:
            maxerrordistance += getDatumError();
            maxerrordistance += getExtentsError();
            maxerrordistance += getMeasurementError();
            maxerrordistance += getMapScaleError();
            maxerrordistance += getDistancePrecisionError();
            maxerrordistance *= Math.sqrt(2.0);
            maxerrordistance += getCoordPrecisionError();
            ***/

            // Alternate Method resulting in smaller radii:
            maxerrordistance += Number( getDistancePrecisionError())*Math.sqrt(2.0);
            maxerrordistance += Number( getDatumError());
            maxerrordistance += Number( getExtentsError());
            maxerrordistance += Number( getMeasurementError());
            maxerrordistance += Number( getMapScaleError());
            maxerrordistance += Number( getCoordPrecisionError());
        }

        // Distance at Heading
        if( index==5 )
        {
            //"Distance at a heading (e.g., 10 mi E (by air) Bakersfield)"
            var dp = 0.0; // distance error
            var d = Number( getOffset()); // offset distance
            dp += Number( getDatumError());
            dp += Number( getExtentsError());
            dp += Number( getMeasurementError());
            dp += Number( getDistancePrecisionError());
            dp += Number( getMapScaleError());
            maxerrordistance = Number( getDirectionError( d, dp ));
            maxerrordistance += Number( getCoordPrecisionError());
        }
    }
    
    function calculateLatLongMetersPerDegree(){
        /***
        The distance between point A at a latitude equal to decimallatitude and point B
        at a latitude one degree removed from point A, but at the same longitude, is here
        estimated to be the length of an arc subtending an angle of one degree with a
        radius equal to the distance from the center of the ellipsoid to the point A.

        The distance between point A at a latitude equal to decimallatitude and point B
        at the same latitude, but one degree removed from point A in longitude, is here
        estimated to be the length of an arc subtending an angle of one degree with a
        radius equal to the distance from point A to the polar axis and orthogonal to it.
        The source for the following values is NIMA 8350.2, 4 Jul 1977

        Note: This is original Java source for debugging type conversion/promotion issues
        String datumstr = (String)ChoiceDatum.getSelectedItem();
        double a = getSemiMajorAxis( getEllipsoidCode( datumstr ) );
        double f = getFlattening( getEllipsoidCode( datumstr ) );
        double e_squared = 2.0*f - Math.pow(f,2.0); // e^2 = 2f - f^2
        ***/
        var datumstr = uiGetSelectedText("ChoiceDatum");
        var a = getSemiMajorAxis( getEllipsoidCode( datumstr ) );
        var f = getFlattening( getEllipsoidCode( datumstr ) );

        var e_squared = 2.0*f - Math.pow(f,2.0); // e^2 = 2f - f^2

        // N - radius of curvature in the prime vertical, (tangent to ellipsoid at latitude)
        // JAVA double N = a/Math.sqrt(1.0 - e_squared*(Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0))); // N(lat) = a/(1-e^2*sin^2(lat))^0.5
        var N = a/Math.sqrt(1.0 - e_squared*(Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0))); // N(lat) = a/(1-e^2*sin^2(lat))^0.5

        // M - radius of curvature in the prime meridian, (tangent to ellipsoid at latitude)
        // JAVA double M = a*(1.0 - e_squared)/Math.pow(1.0 - e_squared*Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0),1.5); // M(lat) = a(1-e^2)/(1-e^2*sin^2(lat))^1.5
        var M = a*(1.0 - e_squared)/Math.pow(1.0 - e_squared*Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0),1.5); // M(lat) = a(1-e^2)/(1-e^2*sin^2(lat))^1.5

        // longitude is irrelevant for the calculations to follow so simplify by using longitude = 0, so Y = 0
        // JAVA double X = N*Math.cos(decimallatitude*Math.PI/180.0)*1.0; // X = Ncos(lat)cos(long). long = 0, so  cos(long) = 1.0
        var X = N*Math.cos(decimallatitude*Math.PI/180.0)*1.0; // X = Ncos(lat)cos(long). long = 0, so  cos(long) = 1.0

        latmetersperdegree = Math.PI*M/180.0; // M is a function of latitude.
        longmetersperdegree = Math.PI*X/180.0; // X is the orthogonal distance to the polar axis.
    }

    function ButtonCalculate_afterActionPerformed(){
        clearResults();
        var r = calculateResults();
        showResults(true);
    }

    function ButtonCopy_afterActionPerformed(){
        clearResults();
    	calculateResults();
    	showResults(true);
		var copyText = document.getElementById("TextFieldFullResult");
		copyText.focus();
		copyText.select();
		s = g_properties.getPropertyLang("label.copied")
		var v = copyText.value
		copyStringToClipboard(v)
		alert(s+": " + v);		
    }

	function copyStringToClipboard (str) {
		// Create new element
		var el = document.createElement('textarea');
		// Set value (string to be copied)
		el.value = str;
		// Set non-editable to avoid focus and move outside of view
		el.setAttribute('readonly', '');
		el.style = {position: 'absolute', left: '-9999px'};
		document.body.appendChild(el);
		// Select text inside element
		el.select();
		// Copy text to clipboard
		document.execCommand('copy');
		// Remove temporary element
		document.body.removeChild(el);
	}

    function ButtonPromote_afterActionPerformed(){
        lastcoordsystem = 1;        
        uiSetLabelExplicit("txtT2Dec_Lat",formatCalcDec.checkFormat( newdecimallatitude));
        uiSetLabelExplicit("txtT2Dec_Long",formatCalcDec.checkFormat(  newdecimallongitude));
        onCoordSystemSelect();
    }