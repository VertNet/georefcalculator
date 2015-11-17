 /*
	function convertDistance(){
		var fromdist;
		var todist;
		var s = null;
		var fromUnit = null;
		var toUnit = null;
		s = TextFieldFromDistance.getText(); //EDIT
		if( s == null || s.length() == 0 ){
			fromdist = 0;
		} else {
			var num = null;
			try {
				num = numberFormatter.parse(s.trim());
				fromdist = num.doubleValue();
				fromUnit = (String)ChoiceFromDistUnits.getSelectedItem();
				toUnit = (String)ChoiceToDistUnits.getSelectedItem();
				todist = convertLengthFromTo(fromdist,fromUnit,toUnit);
				TextFieldToDistance.setText( formatDistance.format(todist) ); //EDIT
			} catch (ParseException e) {
				errorDialog(props.getProperty("error.number.message."+language), props.getProperty("error.number.title."+language), 0);
				TextFieldFromDistance.setText( formatDistance.format(0) );  //EDIT
				TextFieldToDistance.setText( formatDistance.format(0) );	//EDIT
			}
		}
	}
*/
/*
	private void convertScale(){
		double fromdist;
		double todist;
		double scale = 1;
		String s = null;
		String fromUnit = null;
		String toUnit = null;
		String fromScale = null;
		s = TextFieldScaleFromDistance.getText(); //EDIT
		if( s == null || s.length() == 0 ){
			fromdist = 0;
		} else {
			Number num = null;
			try {
				num = numberFormatter.parse(s.trim());
				fromdist = num.doubleValue();
				fromUnit = (String)ChoiceScaleFromDistUnits.getSelectedItem();  //EDIT
				toUnit = (String)ChoiceScaleToDistUnits.getSelectedItem();  //EDIT
				fromScale = (String)ChoiceScale.getSelectedItem();//EDIT
				
				s = fromScale.substring(2, fromScale.length());
				if( s == null || s.length() == 0 ){
					scale = 1;
				} else {
					try {
						num = numberFormatter.parse(s.trim());
					} catch (ParseException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					scale = num.doubleValue();
				}			
				scalefactor = scale;
				if(fromUnit.equals("mm")){
					fromUnit = new String("m");
					scalefactor/=1000.0;
				} else if( fromUnit.equals("cm") ){
					fromUnit = new String("m");
					scalefactor/=100.0;
				} else if(fromUnit.equals("in")){
					fromUnit = new String("ft");
					scalefactor/=12.0;
				}
				todist = scalefactor*convertLengthFromTo(fromdist,fromUnit,toUnit);
				TextFieldScaleToDistance.setText( formatDistance.format(todist) ); //EDIT
			} catch (ParseException e) {
				errorDialog(props.getProperty("error.number.message."+language), props.getProperty("error.number.title."+language), 0); //EDIT
				TextFieldScaleFromDistance.setText( formatDistance.format(0) ); //EDIT
				TextFieldScaleToDistance.setText( formatDistance.format(0) ); //EDIT
			}
		}
	}
	private void calculateResults() throws ParseException{
		if( testParameterLimits() == false ) return;
		translateCoords();
		getNewCoordinates();
		testResultCoordinates();

		String declatstr = new String( String.valueOf(newdecimallatitude) );
		TextFieldCalcDecLat.setText( declatstr ); //EDIT

		String declongstr = new String( String.valueOf(newdecimallongitude) );
		TextFieldCalcDecLong.setText( declongstr ); //EDIT

		calculateMaxErrorDistance();

		String errstr = new String( String.valueOf(maxerrordistance) );
		TextFieldCalcErrorDist.setText( errstr ); //EDIT
		String distunits = (String)ChoiceDistUnits.getSelectedItem(); //EDIT

		TextFieldCalcErrorUnits.setText( distunits );//EDIT

		String datumstr = (String)ChoiceDatum.getSelectedItem();//EDIT
		String coordsysstr = (String)ChoiceCoordSystem.getSelectedItem();//EDIT
		String coordprecisionstr = (String)ChoiceLatPrecision.getSelectedItem();//EDIT
		String distanceprecisionstr = null;
		if( ChoiceDistancePrecision.isVisible() ){//EDIT
			distanceprecisionstr = (String)ChoiceDistancePrecision.getSelectedItem();//EDIT
		} else {
			distanceprecisionstr = new String( "" );
		}
		String extentstr = null;
		if( TextFieldExtent.isVisible() ){//EDIT
			extentstr = new String( TextFieldExtent.getText() );//EDIT
		} else {
			extentstr = new String( "" );
		}
		declatstr = new String(TextFieldCalcDecLat.getText());//EDIT
		declongstr = new String(TextFieldCalcDecLong.getText());//EDIT
		if( declatstr.length() > 9 ){ // if there are floating point residuals in the calculation
			declatstr = new String( declatstr.substring(0,9) );
		}
		if( declongstr.length() > 10 ){ // if there are floating point residuals in the calculation
			declongstr = new String( declongstr.substring(0,10) );
		}
		errstr = new String(TextFieldCalcErrorDist.getText());//EDIT
		double errorinmeters = Math.round(convertLengthFromTo( maxerrordistance, (String)ChoiceDistUnits.getSelectedItem(), "m" ));//EDIT

		//Format the results to show:
		TextFieldCalcDecLat.setText(formatCalcDec.format(newdecimallatitude));//EDIT
		TextFieldCalcDecLong.setText(formatCalcDec.format(newdecimallongitude));//EDIT
		TextFieldCalcErrorDist.setText(formatCalcError.format(maxerrordistance));//EDIT
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
		String resultstr = new String( 
			formatCalcDec.format(newdecimallatitude) + '\u0009' + 
			formatCalcDec.format(newdecimallongitude) + '\u0009' + 
			formatCalcDec.format(errorinmeters) + '\u0009' + 
			datumstr + '\u0009' + 
			coordsysstr + '\u0009' + 
			extentstr + '\u0009' +
			formatCalcError.format(maxerrordistance) + '\u0009' +
			distunits + '\u0009' + 
			distanceprecisionstr + '\u0009' +
			coordprecisionstr );
		TextFieldFullResult.setText(resultstr);//EDIT
	}
*/

	function convertFromFeetTo( m, units ){
		//BUGBUG units. is a clasee so the func call will fail
		var newvalue = m;
		// Convert from feet...
		if( units.equals("m") ){
			newvalue *= 0.3048;
		} else if( units.equals("km") ){
			newvalue *= 0.0003048;
		} else if( units.equals("mi") ){
			newvalue *= 0.0001893939393939;
		} else if( units.equals("yds") ){
			newvalue *= 0.333333333;
		} else if( units.equals("nm") ){
			newvalue *= 0.00016458;
		}
		return newvalue;
	}

	function convertFromMetersTo( m, units ){
		var newvalue = m;
		// Convert from meters...
		if( units.equals("ft") ){
			newvalue =  m*3.28084;
		} else if( units.equals("km") ){
			newvalue = m*0.001;
		} else if( units.equals("mi") ){
			newvalue =  m*0.000621371;
		} else if( units.equals("yds") ){
			newvalue =  m*1.09361;
		} else if( units.equals("nm") ){
			newvalue = m*0.00053996;
		}
		return newvalue;
	}

	function convertLengthFromTo( length, from_units, to_units ){
		//BUGBUG the == could be a BIG trap, may need ===
		//maybe typof instead of null check?
		if( from_units == null || to_units == null ) return 0.0;
		var newvalue = length;
		if( from_units.equals("m") ){ // meters to...
			if( to_units.equals("ft") ){
				newvalue *= 3.28084;
			} else if( to_units.equals("km") ){
				newvalue *= 0.001;
			} else if( to_units.equals("mi") ){
				newvalue *= 0.000621371;
			} else if( to_units.equals("yds") ){
				newvalue *= 1.09361;
			} else if( to_units.equals("nm") ){
				newvalue *= 0.00053996;
			}
		} else if( from_units.equals("ft") ){ // feet to...
			if( to_units.equals("m") ){
				newvalue *= 0.3048;
			} else if( to_units.equals("km") ){
				newvalue *= 0.0003048;
			} else if( to_units.equals("mi") ){
				newvalue *= 0.0001893939393939;
			} else if( to_units.equals("yds") ){
				newvalue *= 0.333333333;
			} else if( to_units.equals("nm") ){
				newvalue *= 0.00016458;
			}
		} else if( from_units.equals("km") ){ // kilometers to...
			if( to_units.equals("ft") ){
				newvalue *= 3280.84;
			} else if( to_units.equals("m") ){
				newvalue *= 1000.0;
			} else if( to_units.equals("mi") ){
				newvalue *= 0.621371;
			} else if( to_units.equals("yds") ){
				newvalue *= 1093.61;
			} else if( to_units.equals("nm") ){
				newvalue *= 0.53996;
			}
		} else if( from_units.equals("mi") ){ // miles to...
			if( to_units.equals("ft") ){
				newvalue *= 5280.0;
			} else if( to_units.equals("m") ){
				newvalue *= 1609.3445;
			} else if( to_units.equals("km") ){
				newvalue *= 1.6093445;
			} else if( to_units.equals("yds") ){
				newvalue *= 1760.0;
			} else if( to_units.equals("nm") ){
				newvalue *= 0.86897624;
			}
		} else if( from_units.equals("yds") ){ // yards to...
			if( to_units.equals("ft") ){
				newvalue *= 3.0;
			} else if( to_units.equals("m") ){
				newvalue *= 0.91440276;
			} else if( to_units.equals("km") ){
				newvalue *= 0.00091440276;
			} else if( to_units.equals("mi") ){
				newvalue *= 0.00056818182;
			} else if( to_units.equals("nm") ){
				newvalue *= 0.00049374;
			}
		} else if( from_units.equals("nm") ){ // nautical miles to...
			if( to_units.equals("ft") ){
				newvalue *= 6076.1155;
			} else if( to_units.equals("m") ){
				newvalue *= 1852.0;
			} else if( to_units.equals("km") ){
				newvalue *= 1.852;
			} else if( to_units.equals("mi") ){
				newvalue *= 1.1507795;
			} else if( to_units.equals("yds") ){
				newvalue *= 2025.3718;
			}
		}
		return newvalue;
	}

	function getDatumError(){ 
		var s = ChoiceDatum.getSelectedItem();  //EDIT
		if( s != null && !s.equals(props.getProperty("datum.notrecorded."+language)) ){
			return 0.0;
		}
		var error = 0.0;
		if( decimallatitude >= 13.79 && decimallatitude <= 84.69
				&& decimallongitude >= -179.48 && decimallongitude <= -51.48 ){
			// Coordinates are in North America region
			error = 1.0*readDatumError();
		} else {
			// Outside North America, an unknown datum is taken to contribute
			// up to a kilometer of error. The worst case scenario 3.552 km would be extremely rare.
			// The mean difference between any datum and WGS84 is 0.653 km.
			error = 1000.0;
		}
		var distunitsstr = ChoiceDistUnits.getSelectedItem();//EDIT
		error = convertFromMetersTo( error, distunitsstr );
		return error;
	}

	function getDecimalDegreesFromDegreesDecimalMinutes( d, m ){
		var ddegs = Math.abs(m/60.0);
		ddegs += Math.abs(d);
		return ddegs;
	}

	function getDecimalDegreesFromDMS( d, m, s)
	{
		var ddegs = Math.abs(s/3600.0);
		ddegs += Math.abs(m/60.0);
		ddegs += Math.abs(d);
		return ddegs;
	}

	function getDecimalMinutesFromMS( m, s)
	{
		var dmins = Math.abs(s/60.0);
		dmins += Math.abs(m);
		return dmins;
	}

	function getDirectionError( offset, disterr ){
		var alpha = 1.0; // direction precision, in degrees.
		var dir = ChoiceDirection.getSelectedItem();

		var index = canonicalheadings.indexOf(dir);
		if( index<4 )alpha=45.0;
		else if( index<8 ) alpha=22.5;
		else if( index<16 ) alpha=11.25;
		else if( index<32 ) alpha=5.625;

		var x = offset*Math.cos(alpha*Math.PI/180.0);
		var y = offset*Math.sin(alpha*Math.PI/180.0);
		var xp = offset+disterr;
		var error = Math.sqrt( Math.pow(xp-x,2) + Math.pow(y,2) );
		return error; // error is in whatever units are selected.
	}

	function getDistancePrecisionError(){
		var error = 0.0;
		var precstr = ChoiceDistancePrecision.getSelectedItem();
		var units = ChoiceDistUnits.getSelectedItem();

		if( precstr.equals("100 "+units) ){
			error = 50.0;
		} else if( precstr.equals("10 "+units) ){
			error = 5.0;
		} else if( precstr.equals("1 "+units) ){
			error = 0.5;
		} else if( precstr.equals("1/2 "+units) ){
			error = 0.25;
		} else if( precstr.equals("1/3 "+units) ){
			error = 0.1666667;
		} else if( precstr.equals("1/4 "+units) ){
			error = 0.125;
		} else if( precstr.equals("1/8 "+units) ){
			error = 0.0625;
		} else if( precstr.equals("1/10 "+units) ){
			error = 0.05;
		} else if( precstr.equals("1/100 "+units) ){
			error = 0.005;
		}
		return error;
	}

	function getDMSFromDecDegrees( dval ) { // 40.17, -67.1
		lastdecimaldegrees=dval;
		if ( dval < 0 ) sign = -1; // 1, -1
		else sign = 1;
		seconds = sign*dval*3600.0; // 14461.2,  24156
		var degs = sign*dval; // 40.17, 67.1
		degrees = degs; // 40, 67  //BUGBUG toInt?
		seconds -= degrees*3600.0; // 61.2, 36.0
		var mins = seconds/60.0; // 1.02, 0.6
		decminutes = mins;
		minutes = mins; // 1, 0
		seconds -= minutes*60.0; // 1.2, 36.0
		var secsAsInt = getNearestInt( seconds*1000.0 );
		seconds=secsAsInt/1000.0;
		while ( seconds >= 60.0 ){
			seconds -= 60.0;
			minutes++;
		}
		if( Math.abs(seconds-60.0) < 0.01 ){
			seconds = 0.0;
			minutes++;
		}
		while ( minutes >= 60 ){
			minutes -= 60;
			degrees++;
		}
	}

	function getEllipsoidCode( datumstr ){
		if( datumstr.equals("(WGS84) World Geodetic System 1984") ) return "WE";
		if( datumstr.equals("(NAD83) North American 1983") )        return "RF";
		if( datumstr.equals("(NAD27) North American 1927") )        return "CC";

		if( datumstr.equals("Adindan") )                       return "CD";
		if( datumstr.equals("Afgooye") )                       return "KA";
		if( datumstr.equals("Ain el Abd 1970") )               return "IN";
		if( datumstr.equals("Airy 1830 ellipsoid") )           return "AA";
		if( datumstr.equals("American Samoa 1962") )           return "CC";
		if( datumstr.equals("Anna 1 Astro 1965") )             return "AN";
		if( datumstr.equals("Antigua Island Astro 1943") )     return "CD";
		if( datumstr.equals("Arc 1950") )                      return "CD";
		if( datumstr.equals("Arc 1960") )                      return "CD";
		if( datumstr.equals("Ascension Island 1958") )         return "IN";
		if( datumstr.equals("Astro Beacon \"E\" 1945") )       return "IN";
		if( datumstr.equals("Astro DOS 71/4") )                return "IN";
		if( datumstr.equals("Astro Tern Island (FRIG) 1961") ) return "IN";
		if( datumstr.equals("Astronomic Station No. 1 1951") ) return "IN";
		if( datumstr.equals("Astronomic Station No. 2 1951, Truk Island") ) return "IN";
		if( datumstr.equals("Astronomic Station Ponape 1951") ) return "IN";
		if( datumstr.equals("Astronomical Station 1952") )      return "IN";
		if( datumstr.equals("(AGD66) Australian Geodetic Datum 1966") ) return "AN";
		if( datumstr.equals("(AGD84) Australian Geodetic 1984") ) return "AN";
		if( datumstr.equals("Australian National ellipsoid") )  return "AN";
		if( datumstr.equals("Ayabelle Lighthouse") )            return "CD";
		if( datumstr.equals("Bekaa Valley 1920 (IGN)") )        return "CD";
		if( datumstr.equals("Bellevue (IGN)") )                 return "IN";
		if( datumstr.equals("Bermuda 1957") )                   return "CC";
		if( datumstr.equals("Bessel 1841 ellipsoid (Namibia)") )     return "BN";
		if( datumstr.equals("Bessel 1841 ellipsoid (non-Namibia)") ) return "BR";
		if( datumstr.equals("Bissau") )                         return "IN";
		if( datumstr.equals("Bogota Observatory") )             return "IN";
		if( datumstr.equals("Bukit Rimpah") )                   return "BN";
		if( datumstr.equals("Campo Inchauspe") )                return "IN";
		if( datumstr.equals("Canton Astro 1966") )              return "IN";
		if( datumstr.equals("Cape") )                           return "CD";
		if( datumstr.equals("Cape Canaveral") )                 return "CC";
		if( datumstr.equals("Carthage") )                       return "CD";
		if( datumstr.equals("Chatham Island Astro 1971") )      return "IN";
		if( datumstr.equals("Chua Astro") )                     return "IN";
		if( datumstr.equals("Clarke 1858 ellipsoid") )          return "CE";
		if( datumstr.equals("Clarke 1866 ellipsoid") )          return "CC";
		if( datumstr.equals("Clarke 1880 ellipsoid") )          return "CD";
		if( datumstr.equals("Co-Ordinate System 1937 of Estonia") ) return "BR";
		if( datumstr.equals("Corrego Alegre") )                 return "IN";
		if( datumstr.equals("Dabola") )                         return "CD";
		if( datumstr.equals("Deception Island") )               return "CD";
		if( datumstr.equals("Djakarta (Batavia)") )             return "BR";
		if( datumstr.equals("DOS 1968") )                       return "IN";
		if( datumstr.equals("Easter Island 1967") )             return "IN"; 

		if( datumstr.equals("European 1950") )                  return "IN";
		if( datumstr.equals("European 1979") )                  return "IN";

		if( datumstr.equals("Everest ellipsoid (Brunei, Sabah, Sarawak)") ) return "EB";
		if( datumstr.equals("Everest India 1830 ellipsoid") )       return "EA";
		if( datumstr.equals("Everest India 1856 ellipsoid") )       return "EC";
		if( datumstr.equals("Everest Pakistan ellipsoid") )         return "EF";
		if( datumstr.equals("Everest ellipsoid (W. Malaysia, Singapore 1948)") ) return "EE";
		if( datumstr.equals("Everest W. Malaysia 1969 ellipsoid") )         return "ED";

		if( datumstr.equals("Fort Thomas 1955") )               return "CD";
		if( datumstr.equals("Gan 1970") )                       return "IN";
		if( datumstr.equals("Geodetic Datum 1949") )            return "IN";
		if( datumstr.equals("Graciosa Base SW 1948") )          return "IN";
		if( datumstr.equals("GRS80 ellipsoid") )                return "RF";
		if( datumstr.equals("Guam 1963") )                      return "CC";
		if( datumstr.equals("Gunung Segara") )                  return "BN";
		if( datumstr.equals("GUX 1 Astro") )                    return "IN";
		if( datumstr.equals("Helmert 1906 ellipsoid") )             return "HE";
		if( datumstr.equals("Hito XVIII 1963") )                  return "IN";
		if( datumstr.equals("Hjorsey 1955") )                   return "IN";
		if( datumstr.equals("Hong Kong 1963") )                 return "IN";
		if( datumstr.equals("Hough 1960 ellipsoid") )               return "HO";
		if( datumstr.equals("Hu-Tzu-Shan") )                    return "IN";
		if( datumstr.equals("Indian") )                         return "EC";
		if( datumstr.equals("Indian 1954") )                    return "EA";
		if( datumstr.equals("Indian 1960") )                    return "EA";
		if( datumstr.equals("Indian 1975") )                    return "EA";
		if( datumstr.equals("Indonesian 1974") )                return "ID";
		if( datumstr.equals("International 1924 ellipsoid") )       return "IN";
		if( datumstr.equals("Ireland 1965") )                   return "AM";
		if( datumstr.equals("ISTS 061 Astro 1968") )            return "IN";
		if( datumstr.equals("ISTS 073 Astro 1969") )            return "IN";
		if( datumstr.equals("Japanese Geodetic Datum 2000") )   return "RF";
		if( datumstr.equals("Johnston Island 1961") )           return "IN";
		if( datumstr.equals("Kandawala") )                      return "EA";
		if( datumstr.equals("Kapingamarangi Astronomic Station No. 3 1951") ) return "IN";
		if( datumstr.equals("Kerguelen Island 1949") )          return "IN";
		if( datumstr.equals("Kertau 1948") )                    return "EE";
		if( datumstr.equals("Korean Geodetic System 1995") )    return "WE";
		if( datumstr.equals("Krassovsky 1940 ellipsoid") )          return "KA";
		if( datumstr.equals("Kusaie Astro 1951") )              return "IN";
		if( datumstr.equals("L.C. 5 Astro 1961") )              return "CC";
		if( datumstr.equals("Leigon") )                         return "CD";
		if( datumstr.equals("Lemuta") )                         return "IN";
		if( datumstr.equals("Liberia 1964") )                   return "CD";
		if( datumstr.equals("Luzon") )                          return "CC";
		if( datumstr.equals("Mahe 1971") )                      return "CD";
		if( datumstr.equals("Massawa") )                        return "BR";
		if( datumstr.equals("Merchich") )                       return "CD";
		if( datumstr.equals("Midway Astro 1961") )              return "IN";
		if( datumstr.equals("Minna") )                          return "CD"; 

		if( datumstr.equals("Modified Airy ellipsoid") )              return "AM";
		if( datumstr.equals("Modified Fischer 1960 ellipsoid") )      return "FA";

		if( datumstr.equals("Montserrat Island Astro 1958") )     return "CD";
		if( datumstr.equals("M'Poraloko") )                       return "CD";
		if( datumstr.equals("Nahrwan") )                          return "CD";
		if( datumstr.equals("Naparima, BWI") )                    return "IN";
		if( datumstr.equals("Naparima 1972") )                    return "IN";
		if( datumstr.equals("North Sahara 1959") )                return "CD";
		if( datumstr.equals("Observatorio Meteorologico 1939") )  return "IN";
		if( datumstr.equals("Ocotepeque 1935") )                  return "CC";
		if( datumstr.equals("Old Egyptian 1907") )                return "HE";
		if( datumstr.equals("Old Hawaiian, Clarke 1866") )        return "CC";
		if( datumstr.equals("Old Hawaiian, International 1924") ) return "IN";
		if( datumstr.equals("Old Trinidad 1903") )                return "CE";
		if( datumstr.equals("Oman") )                             return "CD";
		if( datumstr.equals("Ordnance Survey of Great Britain 1936") ) return "AA";
		if( datumstr.equals("Pico de las Nieves") )               return "IN";
		if( datumstr.equals("Pitcairn Astro 1967") )              return "IN";
		if( datumstr.equals("Point 58") )                         return "CD";
		if( datumstr.equals("Point Noire 1958") )                 return "CD";
		if( datumstr.equals("Porto Santo 1936") )                 return "IN";
		if( datumstr.equals("Provisional South American 1956") )  return "IN";
		if( datumstr.equals("Provisional South Chilean 1963") )   return "IN";
		if( datumstr.equals("Puerto Rico") )                      return "CC";
		if( datumstr.equals("Qatar National") )                   return "IN";
		if( datumstr.equals("Qornoq") )                           return "IN";
		if( datumstr.equals("Reunion") )                          return "IN";
		if( datumstr.equals("Rome 1940") )                        return "IN";
		if( datumstr.equals("S-42 (Pulkovo 1942)") )              return "KA";
		if( datumstr.equals("S-JTSK") )                             return "BR";
		if( datumstr.equals("Santo (DOS) 1965") )                 return "IN";
		if( datumstr.equals("Sao Braz") )                         return "IN";
		if( datumstr.equals("Sapper Hill 1943") )                 return "IN";

		if( datumstr.equals("Schwarzeck") )                         return "BN";
		if( datumstr.equals("Selvagem Grande 1938") )               return "IN";
		if( datumstr.equals("Sierra Leone 1960") )                  return "CD";
		if( datumstr.equals("South American 1969") )                return "SA";
		if( datumstr.equals("SIRGAS - South American Geocentric Reference System") ) return "RF";
		if( datumstr.equals("South Asia") )                         return "FA";
		if( datumstr.equals("Tananarive Observatory 1925") )        return "IN";
		if( datumstr.equals("Timbalai 1948") )                      return "EB";
		if( datumstr.equals("Tokyo") )                              return "BR";
		if( datumstr.equals("Tristan Astro 1968") )                 return "IN";
		if( datumstr.equals("Viti Levu 1916") )                     return "CD";
		if( datumstr.equals("Voirol 1874") )                        return "CD";
		if( datumstr.equals("Voirol 1960") )                        return "CD";
		if( datumstr.equals("Wake-Eniwetok 1960") )                 return "HO";
		if( datumstr.equals("Wake Island Astro 1952") )             return "IN";
		if( datumstr.equals("(WGS66) World Geodetic System 1966") ) return "WC";
		if( datumstr.equals("(WGS72) World Geodetic System 1972") ) return "WD";
		if( datumstr.equals("Yacare") )                             return "IN";
		if( datumstr.equals("Zanderij") )                           return "IN";
		return "WE";
	}

	function getFlattening( ellipsoidIDCode ){
		// Data from NIMA TR8350.2
		if( ellipsoidIDCode.equals("WE") ) return 1/298.257223563; // WGS84
		if( ellipsoidIDCode.equals("RF") ) return 1/298.257222101; // GRS80 (NAD83)
		if( ellipsoidIDCode.equals("CC") ) return 1/294.9786982;   // Clarke 1866 (NAD27)
		if( ellipsoidIDCode.equals("AA") ) return 1/299.3249646;   // Airy 1830
		if( ellipsoidIDCode.equals("AN") ) return 1/298.25;        // Australian National
		if( ellipsoidIDCode.equals("BR") ) return 1/299.1528128;   // Bessel 1841 Ethiopia, Indonesia, Japan, and Korea
		if( ellipsoidIDCode.equals("BN") ) return 1/299.1528128;   // Bessel 1841 Namibia
		if( ellipsoidIDCode.equals("CD") ) return 1/293.465;       // Clarke 1880
		if( ellipsoidIDCode.equals("CE") ) return 1/294.26;        // Clarke 1858
		if( ellipsoidIDCode.equals("EB") ) return 1/300.8017;      // Everest Brunei and E. Malaysia (Sabah and Sarawak)
		if( ellipsoidIDCode.equals("EA") ) return 1/300.8017;      // Everest India 1830
		if( ellipsoidIDCode.equals("EC") ) return 1/300.8017;      // Everest India 1956
		if( ellipsoidIDCode.equals("EF") ) return 1/300.8017;      // Everest Pakistan
		if( ellipsoidIDCode.equals("EE") ) return 1/300.8017;      // Everest W. Malaysia and Singapore 1948
		if( ellipsoidIDCode.equals("ED") ) return 1/300.8017;      // Everest W. Malaysia 1969
		if( ellipsoidIDCode.equals("HE") ) return 1/298.3;         // Helmert 1906
		if( ellipsoidIDCode.equals("HO") ) return 1/297.0;         // Hough 1960
		if( ellipsoidIDCode.equals("ID") ) return 1/298.247;       // Indonesian 1974
		if( ellipsoidIDCode.equals("IN") ) return 1/297.0;         // International 1924
		if( ellipsoidIDCode.equals("KA") ) return 1/298.3;         // Krassovsky 1940
		if( ellipsoidIDCode.equals("AM") ) return 1/299.3249646;   // Modified Airy
		if( ellipsoidIDCode.equals("FA") ) return 1/298.3;         // Modified Fischer 1960
		if( ellipsoidIDCode.equals("SA") ) return 1/298.25;        // South American 1969
		if( ellipsoidIDCode.equals("WC") ) return 1/298.25;        // WGS 1966
		if( ellipsoidIDCode.equals("WD") ) return 1/298.26;        // WGS 1972
		return 1/298.257223563;
	}

	function getSemiMajorAxis( ellipsoidIDCode ){
		// Data from NIMA TR8350.2
		if( ellipsoidIDCode.equals("WE") ) return 6378137.0;   // WGS84
		if( ellipsoidIDCode.equals("RF") ) return 6378137.0;   // GRS80 (NAD83)
		if( ellipsoidIDCode.equals("CC") ) return 6378206.4;   // Clarke 1866 (NAD27)
		if( ellipsoidIDCode.equals("AA") ) return 6377563.396; // Airy 1830
		if( ellipsoidIDCode.equals("AN") ) return 6378160.0;   // Australian National
		if( ellipsoidIDCode.equals("BR") ) return 6377397.155; // Bessel 1841 Ethiopia, Indonesia, Japan, and Korea
		if( ellipsoidIDCode.equals("BN") ) return 6377483.865; // Bessel 1841 Namibia
		if( ellipsoidIDCode.equals("CD") ) return 6378249.145; // Clarke 1880
		if( ellipsoidIDCode.equals("CE") ) return 6378293.6;   // Clarke 1858
		if( ellipsoidIDCode.equals("EB") ) return 6377298.556; // Everest Brunei and E. Malaysia (Sabah and Sarawak)
		if( ellipsoidIDCode.equals("EA") ) return 6377276.345; // Everest India 1830
		if( ellipsoidIDCode.equals("EC") ) return 6377301.243; // Everest India 1956
		if( ellipsoidIDCode.equals("EF") ) return 6377309.613; // Everest Pakistan
		if( ellipsoidIDCode.equals("EE") ) return 6377304.063; // Everest W. Malaysia and Singapore 1948
		if( ellipsoidIDCode.equals("ED") ) return 6377295.664; // Everest W. Malaysia 1969
		if( ellipsoidIDCode.equals("HE") ) return 6378200.0;   // Helmert 1906
		if( ellipsoidIDCode.equals("HO") ) return 6378270.0;   // Hough 1960
		if( ellipsoidIDCode.equals("ID") ) return 6378160.0;   // Indonesian 1974
		if( ellipsoidIDCode.equals("IN") ) return 6378388.0;   // International 1924
		if( ellipsoidIDCode.equals("KA") ) return 6378245.0;   // Krassovsky 1940
		if( ellipsoidIDCode.equals("AM") ) return 6377340.189; // Modified Airy
		if( ellipsoidIDCode.equals("FA") ) return 6378155.0;   // Modified Fischer 1960
		if( ellipsoidIDCode.equals("SA") ) return 6378160.0;   // South American 1969
		if( ellipsoidIDCode.equals("WC") ) return 6378145.0;   // WGS 1966
		if( ellipsoidIDCode.equals("WD") ) return 6378135.0;   // WGS 1972
		return 6378137.0;
	}

/*
	function getGPSAccuracy() throws ParseException{
		if( ((String)ChoiceCoordSource.getSelectedItem()).equals(props.getProperty("coordsource.gps."+language)) ){
			return getMeasurementError();
		}
		return 0;
	}
*/

	function getExtentsError(){
		var exerr = 0;
		var s = TextFieldExtent.getText();
		var e = 0;
		var num = null;

		if( s != null && s.length() != 0 ){
			num = numberFormatter.parse(s.trim()); 
			e = num.doubleValue();
			exerr = e;
		}
		return exerr;
	}

	function getMeasurementError()
	{
		var measurementerr = 0;
		var s = TextFieldMeasurementError.getText();
		var e = 0;
		var num = null;

		if( s != null && s.length() != 0 ){
			num = numberFormatter.parse(s.trim()); 
			e = num.doubleValue();
			measurementerr = e;
		}

		return measurementerr;
	}

	function getMapScaleError(){
		var error = 0.0; // in feet
		var sourcestr = ChoiceCoordSource.getSelectedItem();
		var index = canonicalsources.indexOf(sourcestr);

		if( index==0 /*sourcestr.equals("gazetteer")*/ ){
			error = 0.0;
		} else if( index==1 /*sourcestr.equals("GPS")*/ ){
			error = 0.0;
		} else if( index==2 /*sourcestr.equals("locality description")*/ ){
			error = 0.0;
		} else if( index==3 /*sourcestr.equals("USGS map: 1:250,000")*/ ){
			error = 417;
		} else if( index==4 /*sourcestr.equals("USGS map: 1:100,000")*/ ){
			error = 167;
		} else if( index==5 /*sourcestr.equals("USGS map: 1:63,360")*/ ){
			error = 106;
		} else if( index==6 /*sourcestr.equals("USGS map: 1:62,500")*/ ){
			error = 105;
		} else if( index==7 /*sourcestr.equals("USGS map: 1:25,000")*/ ){
			error = 41.8;
		} else if( index==8 /*sourcestr.equals("USGS map: 1:24,000")*/ ){
			error = 40.0;
		} else if( index==9 /*sourcestr.equals("USGS map: 1:12,000")*/ ){
			error = 33.3;
		} else if( index==10 /*sourcestr.equals("USGS map: 1:10,000")*/ ){
			error = 27.8;
		} else if( index==11 /*sourcestr.equals("USGS map: 1:4800")*/ ){
			error = 13.3;
		} else if( index==12 /*sourcestr.equals("USGS map: 1:2400")*/ ){
			error = 6.7;
		} else if( index==13 /*sourcestr.equals("USGS map: 1:1200")*/ ){
			error = 3.3;
		} else if( index==14 /*sourcestr.equals("NTS map (A): 1:250,000")*/ ){
			error = 125*3.28084; // 0.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
		} else if( index==15 /*sourcestr.equals("NTS map (B): 1:250,000")*/ ){
			error = 250*3.28084; // 1.0mm NATO STANAG 2215 Edition 5 Accuracy ratings
		} else if( index==16 /*sourcestr.equals("NTS map (C): 1:250,000")*/ ){
			error = 375*3.28084; // 1.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
		} else if( index==17 /*sourcestr.equals("NTS map (A): 1:50,000")*/ ){
			error = 25*3.28084; // 0.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
		} else if( index==18 /*sourcestr.equals("NTS map (B): 1:50,000")*/ ){
			error = 50*3.28084; // 1.0mm NATO STANAG 2215 Edition 5 Accuracy ratings
		} else if( index==19 /*sourcestr.equals("NTS map (C): 1:50,000")*/ ){
			error = 75*3.28084; // 1.5mm NATO STANAG 2215 Edition 5 Accuracy ratings
		} else if( index==20 /*sourcestr.equals("non-USGS map: 1:3,000,000")*/ ){
			error = 3000.0*3.28084; // 1mm error default when map quality not known
		} else if( index==21 /*sourcestr.equals("non-USGS map: 1:2,500,000")*/ ){
			error = 2500.0*3.28084; // 1mm error default when map quality not known
		} else if( index==22 /*sourcestr.equals("non-USGS map: 1:1,000,000")*/ ){
			error = 1000.0*3.28084; // 1mm error default when map quality not known
		} else if( index==23 /*sourcestr.equals("non-USGS map: 1:500,000")*/ ){
			error = 500.0*3.28084; // 1mm error default when map quality not known
		} else if( index==24 /*sourcestr.equals("non-USGS map: 1:250,000")*/ ){
			error = 250.0*3.28084; // 1mm error default when map quality not known
		} else if( index==25 /*sourcestr.equals("non-USGS map: 1:200,000")*/ ){
			error = 200.0*3.28084; // 1mm error default when map quality not known
		} else if( index==26 /*sourcestr.equals("non-USGS map: 1:180,000")*/ ){
			error = 180.0*3.28084; // 1mm error default when map quality not known
		} else if( index==27 /*sourcestr.equals("non-USGS map: 1:150,000")*/ ){
			error = 150.0*3.28084; // 1mm error default when map quality not known
		} else if( index==28 /*sourcestr.equals("non-USGS map: 1:125,000")*/ ){
			error = 125.0*3.28084; // 1mm error default when map quality not known
		} else if( index==29 /*sourcestr.equals("non-USGS map: 1:100,000")*/ ){
			error = 100.0*3.28084; // 1mm error default when map quality not known
		} else if( index==30 /*sourcestr.equals("non-USGS map: 1:80,000")*/ ){
			error = 80.0*3.28084; // 1mm error default when map quality not known
		} else if( index==31 /*sourcestr.equals("non-USGS map: 1:62,500")*/ ){
			error = 62.5*3.28084; // 1mm error default when map quality not known
		} else if( index==32 /*sourcestr.equals("non-USGS map: 1:60,000")*/ ){
			error = 60.0*3.28084; // 1mm error default when map quality not known
		} else if( index==33 /*sourcestr.equals("non-USGS map: 1:50,000")*/ ){
			error = 50.0*3.28084; // 1mm error default when map quality not known
		} else if( index==34 /*sourcestr.equals("non-USGS map: 1:40,000")*/ ){
			error = 40.0*3.28084; // 1mm error default when map quality not known
		} else if( index==35 /*sourcestr.equals("non-USGS map: 1:32,500")*/ ){
			error = 32.5*3.28084; // 1mm error default when map quality not known
		} else if( index==36 /*sourcestr.equals("non-USGS map: 1:25,000")*/ ){
			error = 25.0*3.28084; // 1mm error default when map quality not known
		} else if( index==37 /*sourcestr.equals("non-USGS map: 1:20,000")*/ ){
			error = 20.0*3.28084; // 1mm error default when map quality not known
		} else if( index==38 /*sourcestr.equals("non-USGS map: 1:10,000")*/ ){
			error = 10.0*3.28084; // 1mm error default when map quality not known
		}
		var distunitsstr = ChoiceDistUnits.getSelectedItem();
		error = convertFromFeetTo( error, distunitsstr );
		return error;
	}

	function getMSFromDecMinutes( dval ) {
		lastdecimalminutes=dval;
		seconds = dval*60.0;
		var mins = dval;
		minutes = mins.intValue();
		seconds -= minutes*60.0;
		var secsAsInt = getNearestInt( seconds*1000.0 );
		seconds=secsAsInt/1000.0;
		while( seconds >= 60.0 ){
			seconds -= 60.0;
			minutes++;
		}
		if( Math.abs(seconds-60.0) < .01 ){
			seconds = 0.0;
			minutes++;
		}
		while ( minutes >= 60 ){
			minutes -= 60;
			degrees++;
		}
	}

	function getNearestInt( dval ) {
		var dValue = dval;
		var ival = dValue.intValue();
		if( dval-ival <= 0.5 ) return ival;
		else return( ival+1 );
	}
/*
	function getNewCoordinates(){ 
		// this method should be called only to calculate new coordinates
		newdecimallatitude=decimallatitude;
		newdecimallongitude=decimallongitude;

		String SCalcType = ChoiceCalcType.getSelectedItem();
		var cindex = canonicalcalctypes.indexOf(SCalcType);
		if( cindex==0 ){ // Error only
//			if( SCalcType.equals("Error only - enter Lat/Long for the actual locality") ){
			return;
		}
		var s = null;
		var d = 0;
		var meterseast = 0;
		var metersnorth = 0;
		var metersoffset = 0;
		var num = null;

		calculateLatLongMetersPerDegree();
		var SBoxModel = ChoiceModel.getSelectedItem();
		if( SBoxModel.equals(props.getProperty("loctype.orthodist."+language)) ){
//			if( SBoxModel.equals("Distance along orthogonal directions (e.g., 2 mi E and 3 mi N of Bakersfield)") ){
			s = TextFieldOffset.getText();
			if( s == null || s.length() == 0 ){
				metersnorth = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				metersnorth = d;
				String SOffsetNSDir = (String)ChoiceOffsetNSDir.getSelectedItem();
				if( SOffsetNSDir.equals(props.getProperty("headings.s."+language)) ){
//					if( SOffsetNSDir.equals("S") ){
					metersnorth *= -1.0;
				}
			}
			s = TextFieldOffsetEW.getText();
			if( s == null || s.length() == 0 ){
				meterseast = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				meterseast = d;
				String SOffsetEWDir = (String)ChoiceOffsetEWDir.getSelectedItem();
				if( SOffsetEWDir.equals(props.getProperty("headings.w."+language)) ){
//					if( SOffsetEWDir.equals("W") ){
					meterseast *= -1.0;
				}
			}
		} else if( SBoxModel.equals(props.getProperty("loctype.distatheading."+language)) ){
//			} else if( SBoxModel.equals("Distance at a heading (e.g., 10 mi E (by air) Bakersfield)") ){
			double heading = 0;
			String headingstr = (String)ChoiceDirection.getSelectedItem();
			if( headingstr.equals(props.getProperty("headings.nearestdegree."+language)) ){
//				if( headingstr.equals("nearest degree") ){
				s = TextFieldHeading.getText();
				if( s == null || s.length() == 0 ){
					heading = 0;
				} else {
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					heading = d;
				}
			} else if( headingstr.equals(props.getProperty("headings.n."+language)) ){
				heading = 0;
			} else if( headingstr.equals(props.getProperty("headings.nbe."+language)) ){
				heading = 11.25;
			} else if( headingstr.equals(props.getProperty("headings.nne."+language)) ){
				heading = 22.5;
			} else if( headingstr.equals(props.getProperty("headings.nebn."+language)) ){
				heading = 33.75;
			} else if( headingstr.equals(props.getProperty("headings.ne."+language)) ){
				heading = 45.0;
			} else if( headingstr.equals(props.getProperty("headings.nebe."+language)) ){
				heading = 56.25;
			} else if( headingstr.equals(props.getProperty("headings.ene."+language)) ){
				heading = 67.5;
			} else if( headingstr.equals(props.getProperty("headings.ebn."+language)) ){
				heading = 78.75;
			} else if( headingstr.equals(props.getProperty("headings.e."+language)) ){
				heading = 90.0;
			} else if( headingstr.equals(props.getProperty("headings.ebs."+language)) ){
				heading = 101.25;
			} else if( headingstr.equals(props.getProperty("headings.ese."+language)) ){
				heading = 112.5;
			} else if( headingstr.equals(props.getProperty("headings.sebe."+language)) ){
				heading = 123.75;
			} else if( headingstr.equals(props.getProperty("headings.se."+language)) ){
				heading = 135.0;
			} else if( headingstr.equals(props.getProperty("headings.sebs."+language)) ){
				heading = 146.25;
			} else if( headingstr.equals(props.getProperty("headings.sse."+language)) ){
				heading = 157.5;
			} else if( headingstr.equals(props.getProperty("headings.sbe."+language)) ){
				heading = 168.75;
			} else if( headingstr.equals(props.getProperty("headings.s."+language)) ){
				heading = 180.0;
			} else if( headingstr.equals(props.getProperty("headings.sbw."+language)) ){
				heading = 191.25;
			} else if( headingstr.equals(props.getProperty("headings.ssw."+language)) ){
				heading = 202.5;
			} else if( headingstr.equals(props.getProperty("headings.swbs."+language)) ){
				heading = 213.75;
			} else if( headingstr.equals(props.getProperty("headings.sw."+language)) ){
				heading = 225.0;
			} else if( headingstr.equals(props.getProperty("headings.swbw."+language)) ){
				heading = 236.25;
			} else if( headingstr.equals(props.getProperty("headings.wsw."+language)) ){
				heading = 247.5;
			} else if( headingstr.equals(props.getProperty("headings.wbs."+language)) ){
				heading = 258.75;
			} else if( headingstr.equals(props.getProperty("headings.w."+language)) ){
				heading = 270.0;
			} else if( headingstr.equals(props.getProperty("headings.wbn."+language)) ){
				heading = 281.25;
			} else if( headingstr.equals(props.getProperty("headings.wnw."+language)) ){
				heading = 292.5;
			} else if( headingstr.equals(props.getProperty("headings.nwbw."+language)) ){
				heading = 303.75;
			} else if( headingstr.equals(props.getProperty("headings.nw."+language)) ){
				heading = 315.0;
			} else if( headingstr.equals(props.getProperty("headings.nwbn."+language)) ){
				heading = 326.25;
			} else if( headingstr.equals(props.getProperty("headings.nnw."+language)) ){
				heading = 337.5;
			} else if( headingstr.equals(props.getProperty("headings.nbw."+language)) ){
				heading = 348.75;
			}
			s = TextFieldOffsetEW.getText();
			if( s == null || s.length() == 0 ){
				metersoffset = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				metersoffset = d;
			}
			metersnorth = metersoffset*Math.cos(Math.PI*heading/180.0);
			meterseast = metersoffset*Math.cos(Math.PI*(heading-90)/180.0);
		}
		// at this point metersnorth and meterseast are actually the values in the
		// selected distance units. These need to be converted to meters.
		metersnorth = convertLengthFromTo( metersnorth, (String)ChoiceDistUnits.getSelectedItem(), "m" );
		meterseast = convertLengthFromTo( meterseast, (String)ChoiceDistUnits.getSelectedItem(), "m" );

		double latchange = metersnorth/latmetersperdegree;
		double longchange = meterseast/longmetersperdegree;
		newdecimallatitude = decimallatitude + latchange;
		newdecimallatitude = 1.0*Math.round(newdecimallatitude*10000000)/10000000;
		newdecimallongitude = decimallongitude + longchange;
		newdecimallongitude = 1.0*Math.round(newdecimallongitude*10000000)/10000000;
	}

	function getOffset() throws ParseException{
		Number num = null;
		String offsetstr = TextFieldOffsetEW.getText();
		double offset = 0;
		if( offsetstr == null || offsetstr.length() == 0 ){
			offset = 0;
		} else {
			num = numberFormatter.parse(offsetstr.trim());
			offset = num.doubleValue();
		}
		double d = offset; // offset distance
		return d;
	}

	
	*/
	
	function readDatumError(){
		var error = 1000; // 1 km error if file can't be read properly
		var col = Math.round( 5*(decimallongitude+179.48) );
		var row = Math.round( 5*(84.69-decimallatitude) );
		error = datumErrorInst.datumerror[col][row];
		return error;
	}



/*




	*/
/*
	public void setDecimalFormat(){
		if(ChoiceLanguage.getSelectedIndex()==0) currentLocale = Locale.getDefault();
		else if(ChoiceLanguage.getSelectedItem().equalsIgnoreCase("english")){
			currentLocale = Locale.US;
		} else {
			currentLocale=Locale.FRENCH;
		}
		numberFormatter = NumberFormat.getNumberInstance(currentLocale); 

		formatDec = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatDeg = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatMin = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatMinMM = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatSec = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatCalcError = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatDistance = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		formatCalcDec = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		if ( formatDec instanceof DecimalFormat) {
			((DecimalFormat) formatDec).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatDec).setGroupingUsed(false);
			((DecimalFormat) formatDec).setMaximumFractionDigits(7);
		}
		if ( formatDeg instanceof DecimalFormat) {
			((DecimalFormat) formatDeg).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatDeg).setGroupingUsed(false);
			((DecimalFormat) formatDeg).setMaximumFractionDigits(0);
		}
		if ( formatMin instanceof DecimalFormat) {
			((DecimalFormat) formatMin).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatMin).setGroupingUsed(false);
			((DecimalFormat) formatMin).setMaximumFractionDigits(0);
		}
		if ( formatMinMM instanceof DecimalFormat) {
			((DecimalFormat) formatMinMM).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatMinMM).setGroupingUsed(false);
			((DecimalFormat) formatMinMM).setMaximumFractionDigits(6);
		}
		if ( formatSec instanceof DecimalFormat) {
			((DecimalFormat) formatSec).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatSec).setGroupingUsed(false);
			((DecimalFormat) formatSec).setMaximumFractionDigits(2);
		}
		if ( formatCalcError instanceof DecimalFormat) {
			((DecimalFormat) formatCalcError).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatCalcError).setGroupingUsed(false);
			((DecimalFormat) formatCalcError).setMaximumFractionDigits(3);
		}
		if ( formatDistance instanceof DecimalFormat) {
			((DecimalFormat) formatDistance).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatDistance).setGroupingUsed(false);
			((DecimalFormat) formatDistance).setMaximumFractionDigits(5);
		}
		if ( formatCalcDec instanceof DecimalFormat) {
			((DecimalFormat) formatCalcDec).setDecimalSeparatorAlwaysShown(false);
			((DecimalFormat) formatCalcDec).setGroupingUsed(false);
			((DecimalFormat) formatCalcDec).setMaximumFractionDigits(7);
		}
	}

*/

/*
	private void calculateMaxErrorDistance() throws ParseException {
		maxerrordistance=0.0;
		String model = (String)ChoiceModel.getSelectedItem();
		int index = canonicalloctypes.indexOf(model);
		
		//BUGBUG change index == to non magic numbers?
		
		// Coordinates only
		if( index==0 ){
			//			if( model.equals("Coordinates only (e.g., 27\u00b034'23.4\" N, 121\u00b056'42.3\" W)")){
			maxerrordistance += getDatumError();
			maxerrordistance += getCoordPrecisionError();
			maxerrordistance += getMapScaleError();
			maxerrordistance += getMeasurementError();
//			maxerrordistance += getGPSAccuracy();
		}

		// Named Place only
		if( index==1 ){
			//			if( model.equals("Named place only (e.g., Bakersfield)") ){
			maxerrordistance += getDatumError();
			maxerrordistance += getExtentsError();
			maxerrordistance += getMeasurementError();
			maxerrordistance += getMapScaleError();
			maxerrordistance += getCoordPrecisionError();
		}

		// Distance only
		if( index==2 ){
			//			if( model.equals("Distance only (e.g., 5 mi from Bakersfield)") ){
			maxerrordistance += getDatumError();
			maxerrordistance += getExtentsError();
			maxerrordistance += getMeasurementError();
			maxerrordistance += getDistancePrecisionError();
			maxerrordistance += getMapScaleError();
			maxerrordistance += getOffset();
			maxerrordistance += getCoordPrecisionError();
		}

		// Distance along path
		if( index==3 ){
			//			if( model.equals("Distance along path (e.g., 13 mi E (by road) Bakersfield)") ){
			maxerrordistance += getDatumError();
			maxerrordistance += getExtentsError();
			maxerrordistance += getMeasurementError();
			maxerrordistance += getDistancePrecisionError();
			maxerrordistance += getMapScaleError();
			maxerrordistance += getCoordPrecisionError();
		}

		// Orthogonal directions
		if( index==4 ){
			//			if( model.equals("Distance along orthogonal directions (e.g., 2 mi E and 3 mi N of Bakersfield)") ){
			// The method used here since version 20130205 is better method for calculating 
			// uncertainty than the method described in detail in the Georeferencing Guidelines.
			// This method always result in smaller radii than the published one, because the 
			// published one multiplies the contributions of various errors by the square root
			// of 2 unnecessarily.
			// Alternate Method: Datum, Extent, Measurement, Scale, and Coordinate Precision 
			// already account for the two dimansions. Only Distance Precision error needs
			// to be multiplied by the square root of 2.
			
// Method prior to version 20130205:
//
			//maxerrordistance += getDatumError();
			//maxerrordistance += getExtentsError();
			//maxerrordistance += getMeasurementError();
			//maxerrordistance += getMapScaleError();
			//maxerrordistance += getDistancePrecisionError();
			//maxerrordistance *= Math.sqrt(2.0);
			//maxerrordistance += getCoordPrecisionError();
//
			// Alternate Method resulting in smaller radii:
			maxerrordistance += getDistancePrecisionError()*Math.sqrt(2.0);
			maxerrordistance += getDatumError();
			maxerrordistance += getExtentsError();
			maxerrordistance += getMeasurementError();
			maxerrordistance += getMapScaleError();
			maxerrordistance += getCoordPrecisionError();
		}

		// Distance at Heading
		if( index==5 ){
			//			if( model.equals("Distance at a heading (e.g., 10 mi E (by air) Bakersfield)") ){
			double dp = 0.0; // distance error
			double d = getOffset(); // offset distance
			dp += getDatumError();
			dp += getExtentsError();
			dp += getMeasurementError();
			dp += getDistancePrecisionError();
			dp += getMapScaleError();
			maxerrordistance = getDirectionError( d, dp );
			maxerrordistance += getCoordPrecisionError();
		}
	}
*/
	function calculateLatLongMetersPerDegree()
	{
		// The distance between point A at a latitude equal to decimallatitude and point B
		// at a latitude one degree removed from point A, but at the same longitude, is here
		// estimated to be the length of an arc subtending an angle of one degree with a
		// radius equal to the distance from the center of the ellipsoid to the point A.

		// The distance between point A at a latitude equal to decimallatitude and point B
		// at the same latitude, but one degree removed from point A in longitude, is here
		// estimated to be the length of an arc subtending an angle of one degree with a
		// radius equal to the distance from point A to the polar axis and orthogonal to it.
		// The source for the following values is NIMA 8350.2, 4 Jul 1977

//		Note: This is original Java source for debugging type conversion/promotion issues
//		String datumstr = (String)ChoiceDatum.getSelectedItem();
//		double a = getSemiMajorAxis( getEllipsoidCode( datumstr ) );
//		double f = getFlattening( getEllipsoidCode( datumstr ) );
//		double e_squared = 2.0*f - Math.pow(f,2.0); // e^2 = 2f - f^2
		
		var datumstr = uiGetSelectedText("ChoiceDatum");
		var a = getSemiMajorAxis( getEllipsoidCode( datumstr ) );
		var f = getFlattening( getEllipsoidCode( datumstr ) );

		var e_squared = 2.0*f - Math.pow(f,2.0); // e^2 = 2f - f^2

		// N - radius of curvature in the prime vertical, (tangent to ellipsoid at latitude)
		//JAVA double N = a/Math.sqrt(1.0 - e_squared*(Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0))); // N(lat) = a/(1-e^2*sin^2(lat))^0.5
		var N = a/Math.sqrt(1.0 - e_squared*(Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0))); // N(lat) = a/(1-e^2*sin^2(lat))^0.5

		// M - radius of curvature in the prime meridian, (tangent to ellipsoid at latitude)
		//JAVA double M = a*(1.0 - e_squared)/Math.pow(1.0 - e_squared*Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0),1.5); // M(lat) = a(1-e^2)/(1-e^2*sin^2(lat))^1.5
		var M = a*(1.0 - e_squared)/Math.pow(1.0 - e_squared*Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0),1.5); // M(lat) = a(1-e^2)/(1-e^2*sin^2(lat))^1.5

		// longitude is irrelevant for the calculations to follow so simplify by using longitude = 0, so Y = 0
		//double X = N*Math.cos(decimallatitude*Math.PI/180.0)*1.0; // X = Ncos(lat)cos(long). long = 0, so  cos(long) = 1.0
		var X = N*Math.cos(decimallatitude*Math.PI/180.0)*1.0; // X = Ncos(lat)cos(long). long = 0, so  cos(long) = 1.0

		latmetersperdegree = Math.PI*M/180.0; // M is a function of latitude.
		longmetersperdegree = Math.PI*X/180.0; // X is the orthogonal distance to the polar axis.
	}
	


	
