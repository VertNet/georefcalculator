/*import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.applet.*;
import java.awt.*;
import java.awt.event.*;
import java.text.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Locale;
import java.util.Properties;*/

//public class GC extends Applet implements ActionListener, ItemListener, FocusListener, KeyListener{ 

	public static final String embeddedCopyright = "copyright (c) 2001-2013 Regents of the University of California";
	private static final int appletHeight = 480;
	private static final int appletWidth = 620;
	private static final String versionNumber = "20130205";

	protected HashMap propertyMap = new HashMap();
	private static Properties props = new Properties();
	final ArrayList canonicalheadings = new ArrayList();
	final ArrayList canonicalcoordsystems = new ArrayList();
	final ArrayList canonicalloctypes = new ArrayList();
	final ArrayList canonicalcalctypes = new ArrayList();
	final ArrayList canonicalddprec = new ArrayList();
	final ArrayList canonicaldmsprec = new ArrayList();
	final ArrayList canonicalddmprec = new ArrayList();
	final ArrayList canonicalsources = new ArrayList();
	final ArrayList languagelist = new ArrayList();
	Locale currentLocale = Locale.getDefault();
	NumberFormat numberFormatter = NumberFormat.getNumberInstance(currentLocale); 
	String language = null;

	public GC(){
		initProps("georefcalculator.properties", props);
		language = new String(props.getProperty("preferredlanguage"));
		setVariables(language);
		languagelist.clear();
		int i=0;
		while( props.getProperty("language.name."+i) == null){
			languagelist.add(props.getProperty("language.name."+i));
			i++;
		}
	}

	private void convertDistance(){
		double fromdist;
		double todist;
		String s = null;
		String fromUnit = null;
		String toUnit = null;
		s = TextFieldFromDistance.getText();
		if( s == null || s.length() == 0 ){
			fromdist = 0;
		} else {
			Number num = null;
			try {
				num = numberFormatter.parse(s.trim());
				fromdist = num.doubleValue();
				fromUnit = (String)ChoiceFromDistUnits.getSelectedItem();
				toUnit = (String)ChoiceToDistUnits.getSelectedItem();
				todist = convertLengthFromTo(fromdist,fromUnit,toUnit);
				TextFieldToDistance.setText( formatDistance.format(todist) );
			} catch (ParseException e) {
				errorDialog(props.getProperty("error.number.message."+language), props.getProperty("error.number.title."+language), 0);
				TextFieldFromDistance.setText( formatDistance.format(0) );
				TextFieldToDistance.setText( formatDistance.format(0) );
			}
		}
	}

	private void convertScale(){
		double fromdist;
		double todist;
		double scale = 1;
		String s = null;
		String fromUnit = null;
		String toUnit = null;
		String fromScale = null;
		s = TextFieldScaleFromDistance.getText();
		if( s == null || s.length() == 0 ){
			fromdist = 0;
		} else {
			Number num = null;
			try {
				num = numberFormatter.parse(s.trim());
				fromdist = num.doubleValue();
				fromUnit = (String)ChoiceScaleFromDistUnits.getSelectedItem();
				toUnit = (String)ChoiceScaleToDistUnits.getSelectedItem();
				fromScale = (String)ChoiceScale.getSelectedItem();
				
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
				TextFieldScaleToDistance.setText( formatDistance.format(todist) );
			} catch (ParseException e) {
				errorDialog(props.getProperty("error.number.message."+language), props.getProperty("error.number.title."+language), 0);
				TextFieldScaleFromDistance.setText( formatDistance.format(0) );
				TextFieldScaleToDistance.setText( formatDistance.format(0) );
			}
		}
	}
	private void calculateResults() throws ParseException{
		if( testParameterLimits() == false ) return;
		translateCoords();
		getNewCoordinates();
		testResultCoordinates();

		String declatstr = new String( String.valueOf(newdecimallatitude) );
		TextFieldCalcDecLat.setText( declatstr );

		String declongstr = new String( String.valueOf(newdecimallongitude) );
		TextFieldCalcDecLong.setText( declongstr );

		calculateMaxErrorDistance();

		String errstr = new String( String.valueOf(maxerrordistance) );
		TextFieldCalcErrorDist.setText( errstr );
		String distunits = (String)ChoiceDistUnits.getSelectedItem();

		TextFieldCalcErrorUnits.setText( distunits );

		String datumstr = (String)ChoiceDatum.getSelectedItem();
		String coordsysstr = (String)ChoiceCoordSystem.getSelectedItem();
		String coordprecisionstr = (String)ChoiceLatPrecision.getSelectedItem();
		String distanceprecisionstr = null;
		if( ChoiceDistancePrecision.isVisible() ){
			distanceprecisionstr = (String)ChoiceDistancePrecision.getSelectedItem();
		} else {
			distanceprecisionstr = new String( "" );
		}
		String extentstr = null;
		if( TextFieldExtent.isVisible() ){
			extentstr = new String( TextFieldExtent.getText() );
		} else {
			extentstr = new String( "" );
		}
		declatstr = new String(TextFieldCalcDecLat.getText());
		declongstr = new String(TextFieldCalcDecLong.getText());
		if( declatstr.length() > 9 ){ // if there are floating point residuals in the calculation
			declatstr = new String( declatstr.substring(0,9) );
		}
		if( declongstr.length() > 10 ){ // if there are floating point residuals in the calculation
			declongstr = new String( declongstr.substring(0,10) );
		}
		errstr = new String(TextFieldCalcErrorDist.getText());
		double errorinmeters = Math.round(convertLengthFromTo( maxerrordistance, (String)ChoiceDistUnits.getSelectedItem(), "m" ));

		//Format the results to show:
		TextFieldCalcDecLat.setText(formatCalcDec.format(newdecimallatitude));
		TextFieldCalcDecLong.setText(formatCalcDec.format(newdecimallongitude));
		TextFieldCalcErrorDist.setText(formatCalcError.format(maxerrordistance));
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
		TextFieldFullResult.setText(resultstr);
	}

	void ChoiceCalcType_itemStateChanged(String value){
		cleanCalcTypeSlate();

		if( value.equals("") ){
			LabelStepZero.setVisible(true);
			return;
		} else {
			LabelStepZero.setVisible(false);
			LabelTitle.setVisible(true);
			ChoiceModel.setVisible(true);
			LabelModel.setVisible(true);
			LabelStepOne.setVisible(true);
		}

		ChoiceModel.removeAll();

		ChoiceModel.addItem("");
		int index=canonicalcalctypes.indexOf(value);
		if( index==0 ){
//			if( value.equals("Error only - enter Lat/Long for the actual locality") ){
			ChoiceModel.addItem(props.getProperty("loctype.coordonly."+language));
			ChoiceModel.addItem(props.getProperty("loctype.namedplaceonly."+language));
			ChoiceModel.addItem(props.getProperty("loctype.distanceonly."+language));
			ChoiceModel.addItem(props.getProperty("loctype.distalongpath."+language));
			lblT2Dec_Lat.setText(props.getProperty("label.lat."+language));
			lblT2Dec_Long.setText(props.getProperty("label.lon."+language));
//			lblT2Dec_Lat.setText("Latitude");
//			lblT2Dec_Long.setText("Longitude");
		}
		ChoiceModel.addItem(props.getProperty("loctype.orthodist."+language));
		ChoiceModel.addItem(props.getProperty("loctype.distatheading."+language));
		ChoiceModel.select(0);
	}

	void ChoiceCoordSource_itemStateChanged(String value){
		newModelChosen( (String)ChoiceModel.getSelectedItem() );
		clearResults();
	}

	void ChoiceCoordSystem_itemStateChanged(String value) throws ParseException{
		clearResults();
		showRelevantCoordinates();
		populateCoordinatePrecision(value);
		testLatLongLimits();
		translateCoords();
	}

	void ChoiceDatum_itemStateChanged(String value){
		clearResults();
	}

	void ChoiceDirection_itemStateChanged(String value){
		clearResults();
		int index = canonicalcalctypes.indexOf(value);
		if( index==0 ){
//			if( value.equals("Error only - enter Lat/Long for the actual locality") ){
			showDirectionPrecision(true);
		} else {
			showDirection(true);
		}
	}

	void ChoiceDistancePrecision_itemStateChanged(String value ){
		clearResults();
	}

	void ChoiceDistUnits_itemStateChanged(String value){
		clearResults();
		populateDistancePrecision(value);
	}

	void ChoiceLatDirDMS_itemStateChanged(String value){
		clearResults();
		ChoiceLatDirMM.select(value);
	}

	void ChoiceLatDirMM_itemStateChanged(String value){
		clearResults();
		ChoiceLatDirDMS.select(value);
	}

	void ChoiceLatPrecision_itemStateChanged(String value){
		clearResults();
	}

	void ChoiceLongDirDMS_itemStateChanged(String value ){
		clearResults();
		ChoiceLongDirMM.select(value);
	}

	void ChoiceLongDirMM_itemStateChanged(String value ){
		clearResults();
		ChoiceLongDirDMS.select(value);
	}

	void ChoiceLanguage_itemStateChanged(int value )throws ParseException{
		newLanguageChosen(value);
	}

	private void newLanguageChosen(int value) throws ParseException{
		double m, latminmm, longminmm, extent, measurementerror, latsec, longsec;
		double offset, offsetew, heading;
		int latdirindex, longdirindex, offsetdirnsindex, offsetdirewindex;
		int datumindex, latprecindex, loctypeindex, calctypeindex;
		int coordsystemindex, latdirmmindex, longdirmmindex, distunitsindex;
		int distprecindex, coordsourceindex, directionindex;
		latdirindex=ChoiceLatDirDMS.getSelectedIndex();
		longdirindex=ChoiceLongDirDMS.getSelectedIndex();
		latdirmmindex=ChoiceLatDirMM.getSelectedIndex();
		longdirmmindex=ChoiceLongDirMM.getSelectedIndex();
		offsetdirnsindex=ChoiceOffsetNSDir.getSelectedIndex();
		offsetdirewindex=ChoiceOffsetEWDir.getSelectedIndex();
		latprecindex=ChoiceLatPrecision.getSelectedIndex();
		datumindex=ChoiceDatum.getSelectedIndex();
		calctypeindex=ChoiceCalcType.getSelectedIndex();
		loctypeindex=ChoiceModel.getSelectedIndex();
		coordsourceindex=ChoiceCoordSource.getSelectedIndex();
		coordsystemindex=ChoiceCoordSystem.getSelectedIndex();
		distunitsindex=ChoiceDistUnits.getSelectedIndex();
		distprecindex=ChoiceDistancePrecision.getSelectedIndex();
		directionindex=ChoiceDirection.getSelectedIndex();

		Number num = null;
		String s = txtT7Lat_MinMM.getText();
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatMinMM.parse(s.trim());
			m = num.doubleValue();
		}
		latminmm=m;

		s = txtT7Long_MinMM.getText();
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatMinMM.parse(s.trim());
			m = num.doubleValue();
		}
		longminmm=m;

		s = txtT7Lat_Sec.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatSec.parse(s.trim());
			m = num.doubleValue();
		}
		latsec=m;

		s = txtT7Long_Sec.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatSec.parse(s.trim());
			m = num.doubleValue();
		}
		longsec=m;

		s = TextFieldExtent.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatCalcError.parse(s.trim());
			m = num.doubleValue();
		}
		extent=m;

		s = TextFieldMeasurementError.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatCalcError.parse(s.trim());
			m = num.doubleValue();
		}
		measurementerror=m;

		s = TextFieldOffset.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatCalcError.parse(s.trim());
			m = num.doubleValue();
		}
		offset=m;

		s = TextFieldOffsetEW.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatCalcError.parse(s.trim());
			m = num.doubleValue();
		}
		offsetew=m;

		s = TextFieldHeading.getText();
		m = 0;
		if( s == null || s.length() == 0 ){
			m = 0;
		} else {
			num = formatCalcError.parse(s.trim());
			m = num.doubleValue();
		}
		heading=m;

		language = new String(props.getProperty("language.code."+value));
		clearResults();
		setVariables(language);
		setLabels();		
		setDecimalFormat();
		populateStableControls();

		ChoiceModel.removeAll();
		ChoiceModel.addItem("");
		if( calctypeindex>0 ){
			if( calctypeindex==2 ){
				ChoiceModel.addItem(props.getProperty("loctype.coordonly."+language));
				ChoiceModel.addItem(props.getProperty("loctype.namedplaceonly."+language));
				ChoiceModel.addItem(props.getProperty("loctype.distanceonly."+language));
				ChoiceModel.addItem(props.getProperty("loctype.distalongpath."+language));
				lblT2Dec_Lat.setText(props.getProperty("label.lat."+language));
				lblT2Dec_Long.setText(props.getProperty("label.lon."+language));
			}
			ChoiceModel.addItem(props.getProperty("loctype.orthodist."+language));
			ChoiceModel.addItem(props.getProperty("loctype.distatheading."+language));
		}


		if(coordsystemindex==0){
			populateCoordinatePrecision(props.getProperty("coordsys.dms."+language));
		} else if(coordsystemindex==1){
			populateCoordinatePrecision(props.getProperty("coordsys.dd."+language));			
		} else {
			populateCoordinatePrecision(props.getProperty("coordsys.ddm."+language));
		}
		populateDistancePrecision(ChoiceDistUnits.getItem(distunitsindex));

		txtT2Dec_Lat.setText( formatDec.format(decimallatitude) );
		txtT2Dec_Long.setText( formatDec.format(decimallongitude) );
		txtT7Lat_MinMM.setText( formatMinMM.format(latminmm) );		
		txtT7Long_MinMM.setText( formatMinMM.format(longminmm) );
		txtT7Lat_Sec.setText( formatSec.format(latsec) );
		txtT7Long_Sec.setText( formatSec.format(longsec) );
		TextFieldExtent.setText( formatCalcError.format(extent) );
		TextFieldMeasurementError.setText( formatCalcError.format(measurementerror) );
		TextFieldFromDistance.setText( formatDistance.format(fromdistance) );
		TextFieldToDistance.setText( formatDistance.format(todistance) );
		TextFieldScaleFromDistance.setText( formatDistance.format(scalefromdistance) );
		TextFieldScaleToDistance.setText( formatDistance.format(scaletodistance) );
		TextFieldOffset.setText( formatCalcError.format(offset) );
		TextFieldOffsetEW.setText( formatCalcError.format(offsetew) );
		TextFieldHeading.setText( formatCalcError.format(heading) );

		if(calctypeindex >= 0) ChoiceCalcType.select(calctypeindex);
		if(loctypeindex >= 0) ChoiceModel.select(loctypeindex);
		if(ChoiceModel.getSelectedIndex()!=-1 && ChoiceModel.getSelectedItem().equals(props.getProperty("loctype.orthodist."+language))){
			LabelOffset.setText(props.getProperty("label.distns."+language));
		}
		if(coordsourceindex >= 0) ChoiceCoordSource.select(coordsourceindex);
		if(coordsystemindex >= 0) ChoiceCoordSystem.select(coordsystemindex);
		if(latdirindex >= 0) ChoiceLatDirDMS.select(latdirindex);
		if(longdirindex >= 0) ChoiceLongDirDMS.select(longdirindex);
		if(latdirmmindex >= 0) ChoiceLatDirMM.select(latdirmmindex);
		if(longdirmmindex >= 0) ChoiceLongDirMM.select(longdirmmindex);
		if(datumindex >= 0) ChoiceDatum.select(datumindex);
		if(latprecindex >= 0) ChoiceLatPrecision.select(latprecindex);
		if(offsetdirnsindex >= 0) ChoiceOffsetNSDir.select(offsetdirnsindex);
		if(offsetdirewindex >= 0) ChoiceOffsetEWDir.select(offsetdirewindex);
		if(distunitsindex >= 0) ChoiceDistUnits.select(distunitsindex);
		if(distprecindex >= 0) ChoiceDistancePrecision.select(distprecindex);
		if(directionindex >= 0) ChoiceDirection.select(directionindex);
	}
	void ChoiceModel_itemStateChanged(String value ){
		newModelChosen(value);
	}

	void ChoiceFromDistUnits_itemStateChanged(String value){
		convertDistance();
	}
	void ChoiceToDistUnits_itemStateChanged(String value){
		convertDistance();
	}

	void ChoiceScaleFromDistUnits_itemStateChanged(String value){
		convertScale();
	}
	void ChoiceScaleToDistUnits_itemStateChanged(String value){
		convertScale();
	}
	void ChoiceScale_itemStateChanged(String value){
		convertScale();
	}

	private void newModelChosen(String value){
		try{
			if( value.equals("") ){
				cleanSlate();
				LabelTitle.setVisible(true);
				return;
			}
		}catch (NullPointerException e){
			return;
		}

		showResults(false);
		clearResults();
		showOffset(false);
		LabelStepOne.setVisible(false);
		LabelStepTwo.setVisible(true);
		showDistancePrecision(false);
		showDirectionPrecision(false);
		ButtonCalculate.setVisible(false);
		ButtonPromote.setVisible(false);
		showNSOffset(false);
		showEWOffset(false);
		TextFieldHeading.setVisible(false);
		showCoordinateSystem(true);
		showCoordinateSource(true);
		showDistanceUnits(true);
		showCoordinatePrecision(true);
		showExtents(true);
		showMeasurementError(true);
		showErrors(true);
		showDistanceConverter(true);
		showScaleConverter(true);
		showRelevantCoordinates();
		LabelOffset.setText(props.getProperty("label.offset."+language));
		LabelExtent.setText(props.getProperty("label.extent."+language));
		LabelMeasurementError.setText(props.getProperty("label.measurementerror."+language));
		int index = canonicalloctypes.indexOf(value);
		String csource = new String(ChoiceCoordSource.getSelectedItem());
		int cindex = canonicalsources.indexOf(csource);
		if( cindex==1 ){ // GPS
//			if( ((String)ChoiceCoordSource.getSelectedItem()).equals("GPS") ){
			LabelMeasurementError.setText(props.getProperty("label.extent.gps."+language));
//			LabelMeasurementError.setText("GPS accuracy");
//			showExtents(false);
//			showMeasurementError(true);
		} else {
			LabelMeasurementError.setText(props.getProperty("label.measurementerror."+language));
		}
		if( index==0 ){ // Coordinates only
//			if( value.equals("Coordinates only (e.g., 27\u00b034'23.4\" N, 121\u00b056'42.3\" W)")){
			showExtents(false);
//			showMeasurementError(true);
		} else if( index==2 ){ // Distance only
//			} else if( value.equals("Distance only (e.g., 5 mi from Bakersfield)") ){
			showOffset(true);
			showDistancePrecision(true);
		} else if( index==3 ){ // Distance along path
//			} else if( value.equals("Distance along path (e.g., 13 mi E (by road) Bakersfield)") ){
			showDistancePrecision(true);
		} else if( index==4 ){ // Distance along orthogonal directions
//			} else if( value.equals("Distance along orthogonal directions (e.g., 2 mi E and 3 mi N of Bakersfield)") ){
			String SCalcType = (String)ChoiceCalcType.getSelectedItem();
			int calcindex = canonicalcalctypes.indexOf(SCalcType);
			if( calcindex==0 ){ // Error only
//				if( SCalcType.equals("Error only - enter Lat/Long for the actual locality") ){
				showNSOffset(true);
				showEWOffset(true);
				showDistancePrecision(true);
			}else if( calcindex==1 ){ // Coordinates and error
//				}else if( SCalcType.equals("Coordinates and error - enter the Lat/Long for the named place or starting point") ){
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
//			} else if( value.equals("Distance at a heading (e.g., 10 mi E (by air) Bakersfield)") ){
			showOffset(true);
			String SCalcType = (String)ChoiceCalcType.getSelectedItem();
			int calcindex = canonicalcalctypes.indexOf(SCalcType);
			if( calcindex==1 ){ // Coordinates and error
//				if( SCalcType.equals("Coordinates and error - enter the Lat/Long for the named place or starting point") ){
				showDistancePrecision(true);
				showDirection(true);
			} else if( calcindex==0 ){ // Error only
//				} else if( SCalcType.equals("Error only - enter Lat/Long for the actual locality") ){
				showDistancePrecision(true);
				showDirectionPrecision(true);
			} else if ( calcindex == 2){ // Coordinates only
				showDirection(true);
			}
		}
		ButtonCalculate.setVisible(true);
		ButtonPromote.setVisible(true);
		showResults(true);
	}

	void ChoiceOffsetEWDir_itemStateChanged(String value ){
		clearResults();
	}

	void ChoiceOffsetNSDir_itemStateChanged(String value ){
		clearResults();
	}

	private void cleanCalcTypeSlate(){
		cleanSlate();
		ChoiceModel.setVisible(false);
		LabelModel.setVisible(false);
		LabelTitle.setVisible(false);
		LabelStepOne.setVisible(false);
		LabelStepTwo.setVisible(false);
		LabelStepZero.setVisible(true);
	}

	private void cleanSlate(){
		// Coordinates Panel
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
		showDistanceConverter(false);
		showScaleConverter(false);
		showOffset(false);
		showNSOffset(false);
		showEWOffset(false);
		TextFieldOffsetEW.setVisible(false);
		ChoiceOffsetEWDir.setVisible(false);
		ChoiceOffsetNSDir.setVisible(false);
		TextFieldHeading.setVisible(false);
		LabelOffsetEW.setVisible(false);
		ButtonCalculate.setVisible(false);
		ButtonPromote.setVisible(false);
		LabelTitle.setVisible(false);
		LabelStepTwo.setVisible(false);
		LabelStepOne.setVisible(true);
	}

	private void clearResults(){
		TextFieldCalcDecLat.setText("");
		TextFieldCalcDecLong.setText("");
		TextFieldCalcErrorDist.setText("");
		TextFieldCalcErrorUnits.setText("");
		TextFieldFullResult.setText("");
	}

	private double convertFromFeetTo( double m, String units ){
		double newvalue = m;
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

	private double convertFromMetersTo( double m, String units ){
		double newvalue = m;
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

	private double convertLengthFromTo( double length, String from_units, String to_units ){
		if( from_units == null || to_units == null ) return 0.0;
		double newvalue = length;
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

	public void setLabels(){
		LabelVersion.setText(props.getProperty("version."+language)+" "+versionNumber+language);
		LabelCalcType.setText(props.getProperty("label.calctype."+language));
		LabelStepZero.setText(props.getProperty("label.step0."+language));
		LabelTitle.setText(props.getProperty("label.title."+language));
		LabelModel.setText(props.getProperty("label.loctype."+language));
		LabelStepOne.setText(props.getProperty("label.step1."+language));
		LabelStepTwo.setText(props.getProperty("label.step2."+language));
		LabelCoordSource.setText(props.getProperty("label.coordsource."+language));
		LabelCoordSystem.setText(props.getProperty("label.coordsys."+language));
		lblT2Dec_Lat.setText(props.getProperty("label.lat."+language));
		lblT2Dec_Long.setText(props.getProperty("label.lon."+language));
		LabelDatum.setText(props.getProperty("label.datum."+language));
		LabelLatPrecision.setText(props.getProperty("label.coordprec."+language));
		LabelOffsetEW.setText(props.getProperty("label.distew."+language));
		LabelOffset.setText(props.getProperty("label.offset."+language));
		LabelExtent.setText(props.getProperty("label.extent."+language));
		LabelMeasurementError.setText(props.getProperty("label.measurementerror."+language));
		LabelDistUnits.setText(props.getProperty("label.distunits."+language));
		LabelDistancePrecision.setText(props.getProperty("label.distprec."+language));
		LabelDirection.setText(props.getProperty("label.direction."+language));
		LabelCalcDecLat.setText(props.getProperty("label.declat."+language));
		LabelCalcDecLong.setText(props.getProperty("label.declon."+language));
		LabelCalcMaxError.setText(props.getProperty("label.maxerrdist."+language));
		ButtonCalculate.setLabel(props.getProperty("label.calculate."+language));
		ButtonPromote.setLabel(props.getProperty("label.promote."+language));
		LabelDistanceConverter.setText(props.getProperty("label.distanceconverter."+language));
		LabelScaleConverter.setText(props.getProperty("label.scaleconverter."+language));
	}
	public Component createComponents() {
		pane = new Panel();
		if(pane==null) return null;
		pane.setSize(appletWidth, appletHeight);
		pane.setLayout(null);  
		pane.setVisible(true);

		ChoiceLanguage = new Choice ();
		ChoiceLanguage.setName ("ChoiceLanguage");
		ChoiceLanguage.setFont (new Font ("Helvetica", 0, 12));
		ChoiceLanguage.setForeground (new Color (0x000000));
		ChoiceLanguage.setBackground (new Color (0xffffff));
		ChoiceLanguage.setVisible(true);
		pane.add (ChoiceLanguage);
		ChoiceLanguage.setBounds (5, 5, 110, 23);

		ChoiceLanguage.removeAll();
		int i=0;
		while(props.getProperty("language.name."+i)!=null){
			ChoiceLanguage.addItem(props.getProperty("language.name."+i));
			i++;
		}

		LabelVersion = new Label (props.getProperty("version."+language)+" "+versionNumber+language, Label.LEFT);
		LabelVersion.setName ("LabelVersion");
		LabelVersion.setFont (new Font ("Helvetica", 0, 10));
		LabelVersion.setForeground (new Color (0x000000));
		LabelVersion.setBackground (new Color (0xc0c0c0));
		LabelVersion.setVisible (true);
		pane.add(LabelVersion);
		LabelVersion.setBounds (10, 465, 100, 10);

		LabelCopyright = new Label (embeddedCopyright, Label.RIGHT);
		LabelCopyright.setName ("LabelCopyright");
		LabelCopyright.setFont (new Font ("Helvetica", 0, 10));
		LabelCopyright.setForeground (new Color (0x000000));
		LabelCopyright.setBackground (new Color (0xc0c0c0));
		LabelCopyright.setVisible (true);
		pane.add(LabelCopyright);
		LabelCopyright.setBounds (310, 465, 300, 10);

		LabelCalcType = new Label (props.getProperty("label.calctype."+language), Label.LEFT);
		LabelCalcType.setName ("LabelCalcType");
		LabelCalcType.setFont (new Font ("Helvetica", 0, 12));
		LabelCalcType.setForeground (new Color (0x000000));
		LabelCalcType.setBackground (new Color (0xc0c0c0));
		pane.add (LabelCalcType);
		LabelCalcType.setBounds (5, 33, 115, 27);
		LabelCalcType.setVisible(true);

		ChoiceCalcType = new Choice ();
		ChoiceCalcType.setName ("ChoiceCalcType");
		ChoiceCalcType.setFont (new Font ("Helvetica", 0, 12));
		ChoiceCalcType.setForeground (new Color (0x000000));
		ChoiceCalcType.setBackground (new Color (0xffffff));
		ChoiceCalcType.setVisible(true);
		pane.add (ChoiceCalcType);
		ChoiceCalcType.setBounds (125, 33, 490, 23);

		LabelStepZero = new Label (props.getProperty("label.step0."+language), Label.CENTER);
		LabelStepZero.setName ("LabelStepZero");
		LabelStepZero.setFont (new Font ("Helvetica", 0, 18));
		LabelStepZero.setForeground (new Color (0x000000));
		LabelStepZero.setBackground (new Color (0xc0c0c0));
		LabelCalcType.setVisible(true);
		pane.add (LabelStepZero);
		LabelStepZero.setBounds (125, 2, 490, 27);

		LabelTitle = new Label (props.getProperty("label.title."+language), Label.CENTER);
		LabelTitle.setName ("LabelTitle");
		LabelTitle.setFont (new Font ("Helvetica", 0, 18));
		LabelTitle.setForeground (new Color (0x000000));
		LabelTitle.setBackground (new Color (0xc0c0c0));
		LabelTitle.setVisible (false);
		pane.add (LabelTitle);
		LabelTitle.setBounds (125, 2, 490, 27);

		LabelModel = new Label (props.getProperty("label.loctype."+language), Label.LEFT);
		LabelModel.setName ("LabelModel");
		LabelModel.setSize( 118, 27);
		LabelModel.setFont (new Font ("Helvetica", 0, 12));
		LabelModel.setVisible (false);
		LabelModel.setForeground (new Color (0x000000));
		LabelModel.setBackground (new Color (0xc0c0c0));
		pane.add (LabelModel);
		LabelModel.setBounds (5, 86, 108, 27);

		ChoiceModel = new Choice ();
		ChoiceModel.setName ("ChoiceModel");
		ChoiceModel.setFont (new Font ("Helvetica", 0, 12));
		ChoiceModel.setVisible (false);
		ChoiceModel.setForeground (new Color (0x00000));
		ChoiceModel.setBackground (new Color (0xffffff));
		ChoiceModel.setVisible(false);
		pane.add (ChoiceModel);
		ChoiceModel.setBounds (125, 87, 490, 23);

		LabelStepOne = new Label (props.getProperty("label.step1."+language), Label.CENTER);
		LabelStepOne.setName ("LabelStepOne");
		LabelStepOne.setFont (new Font ("Helvetica", 0, 18));
		LabelStepOne.setVisible (false);
		LabelStepOne.setForeground (new Color (0x000000));
		LabelStepOne.setBackground (new Color (0xc0c0c0));
		pane.add (LabelStepOne);
		LabelStepOne.setBounds (125, 61, 490, 27);

		LabelStepTwo = new Label (props.getProperty("label.step2."+language), Label.CENTER);
		LabelStepTwo.setName ("LabelStepTwo");
		LabelStepTwo.setFont (new Font ("Helvetica", 0, 18));
		LabelStepTwo.setVisible (false);
		LabelStepTwo.setForeground (new Color (0x000000));
		LabelStepTwo.setBackground (new Color (0xc0c0c0));
		pane.add (LabelStepTwo);
		LabelStepTwo.setBounds (125, 113, 490, 27);

		LabelCoordSource = new Label (props.getProperty("label.coordsource."+language), Label.LEFT);
		LabelCoordSource.setName ("LabelCoordSource");
		LabelCoordSource.setFont (new Font ("Helvetica", 0, 12));
		LabelCoordSource.setVisible (false);
		LabelCoordSource.setForeground (new Color (0x000000));
		pane.add (LabelCoordSource);
		LabelCoordSource.setBounds (5, 145, 160, 27);

		ChoiceCoordSource = new Choice ();
		ChoiceCoordSource.setName ("ChoiceCoordSource");
		ChoiceCoordSource.setFont (new Font ("Helvetica", 0, 12));
		ChoiceCoordSource.setVisible (false);
		ChoiceCoordSource.setForeground (new Color (0x000000));
		ChoiceCoordSource.setBackground (new Color (0xffffff));
		ChoiceCoordSource.setVisible(false);
		pane.add (ChoiceCoordSource);
		ChoiceCoordSource.setBounds (165, 146, 180, 23);

		LabelCoordSystem = new Label (props.getProperty("label.coordsys."+language), Label.LEFT);
		LabelCoordSystem.setName ("LabelCoordSystem");
		LabelCoordSystem.setFont (new Font ("Helvetica", 0, 12));
		LabelCoordSystem.setVisible (false);
		LabelCoordSystem.setForeground (new Color (0x000000));
		pane.add (LabelCoordSystem);
		LabelCoordSystem.setBounds (5, 172, 160, 27);

		ChoiceCoordSystem = new Choice ();
		ChoiceCoordSystem.setName ("ChoiceCoordSystem");
		ChoiceCoordSystem.setFont (new Font ("Helvetica", 0, 12));
		ChoiceCoordSystem.setVisible (false);
		ChoiceCoordSystem.setForeground (new Color (0x000000));
		ChoiceCoordSystem.setBackground (new Color (0xffffff));
		ChoiceCoordSystem.setVisible(false);
		pane.add (ChoiceCoordSystem);
		ChoiceCoordSystem.setBounds (165, 173, 180, 23);

		PanelCoords = new Panel ();
		PanelCoords.setName ("PanelCoords");
		PanelCoords.setLayout(null);
		PanelCoords.setFont (new Font ("Helvetica", 0, 12));
		PanelCoords.setVisible (false);
		PanelCoords.setForeground (new Color (0x000000));
		pane.add (PanelCoords);
		PanelCoords.setBounds (4, 201, 340, 83);

		lblT2Dec_Lat = new Label (props.getProperty("label.lat."+language), Label.LEFT);
		lblT2Dec_Lat.setName ("lblT2Dec_Lat");
		lblT2Dec_Lat.setFont (new Font ("Helvetica", 0, 12));
		lblT2Dec_Lat.setForeground (new Color (0x000000));
		PanelCoords.add (lblT2Dec_Lat);
		lblT2Dec_Lat.setBounds (2, 2, 80, 26);

		lblT2Dec_Long = new Label (props.getProperty("label.lon."+language), Label.LEFT);
		lblT2Dec_Long.setName ("lblT2Dec_Long");
		lblT2Dec_Long.setFont (new Font ("Helvetica", 0, 12));
		lblT2Dec_Long.setForeground (new Color (0x000000));
		PanelCoords.add (lblT2Dec_Long);
		lblT2Dec_Long.setBounds (2, 29, 80, 24);

		PanelDecLatLong = new Panel ();
		PanelDecLatLong.setName ("PanelDecLatLong");
		PanelDecLatLong.setLayout(null);  
		PanelDecLatLong.setFont (new Font ("Helvetica", 0, 12));
		PanelDecLatLong.setForeground (new Color (0x000000));
		PanelCoords.add (PanelDecLatLong);
		PanelDecLatLong.setBounds (80, 0, 120, 51);

		txtT2Dec_Lat = new TextField ("txtT2Dec_Lat");
		txtT2Dec_Lat.setName ("txtT2Dec_Lat");
		txtT2Dec_Lat.setFont (new Font ("TimesRoman", 0, 13));
		txtT2Dec_Lat.setForeground (new Color (0x000000));
		txtT2Dec_Lat.setText ("");
		PanelDecLatLong.add (txtT2Dec_Lat);
		txtT2Dec_Lat.setBounds (4, 2, 108, 23);

		txtT2Dec_Long = new TextField ("txtT2Dec_Long");
		txtT2Dec_Long.setName ("txtT2Dec_Long");
		txtT2Dec_Long.setFont (new Font ("TimesRoman", 0, 13));
		txtT2Dec_Long.setForeground (new Color (0x000000));
		txtT2Dec_Long.setText ("");
		PanelDecLatLong.add (txtT2Dec_Long);
		txtT2Dec_Long.setBounds (4, 26, 108, 23);

		PanelDDMMSS = new Panel ();
		PanelDDMMSS.setName ("PanelDDMMSS");
		PanelDDMMSS.setLayout(null);  
		PanelDDMMSS.setFont (new Font ("Helvetica", 0, 12));
		PanelDDMMSS.setForeground (new Color (0x000000));
		PanelCoords.add (PanelDDMMSS);
		PanelDDMMSS.setBounds (96, 0, 250, 53);

		txtT7Lat_DegDMS = new TextField ("txtT7Lat_DegDMS");
		txtT7Lat_DegDMS.setName ("txtT7Lat_DegDMS");
		txtT7Lat_DegDMS.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Lat_DegDMS.setForeground (new Color (0x000000));
		txtT7Lat_DegDMS.setText ("");
		PanelDDMMSS.add (txtT7Lat_DegDMS);
		txtT7Lat_DegDMS.setBounds (4, 2, 45, 23);

		txtT7Lat_MinDMS = new TextField ("txtT7Lat_MinDMS");
		txtT7Lat_MinDMS.setName ("txtT7Lat_MinDMS");
		txtT7Lat_MinDMS.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Lat_MinDMS.setForeground (new Color (0x000000));
		txtT7Lat_MinDMS.setText ("");
		PanelDDMMSS.add (txtT7Lat_MinDMS);
		txtT7Lat_MinDMS.setBounds (62, 2, 40, 23);

		txtT7Lat_Sec = new TextField ("txtT7Lat_Sec");
		txtT7Lat_Sec.setName ("txtT7Lat_Sec");
		txtT7Lat_Sec.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Lat_Sec.setForeground (new Color (0x000000));
		txtT7Lat_Sec.setText ("");
		PanelDDMMSS.add (txtT7Lat_Sec);
		txtT7Lat_Sec.setBounds (112, 2, 65, 23);

		ChoiceLatDirDMS = new Choice ();
		ChoiceLatDirDMS.setName ("ChoiceLatDirDMS");
		ChoiceLatDirDMS.setFont (new Font ("Helvetica", 0, 12));
		ChoiceLatDirDMS.setForeground (new Color (0x000000));
		ChoiceLatDirDMS.setBackground (new Color (0xffffff));
		ChoiceLatDirDMS.setVisible(false);
		PanelDDMMSS.add (ChoiceLatDirDMS);
		ChoiceLatDirDMS.setBounds (188, 2, 41, 23);

		txtT7Long_DegDMS = new TextField ("txtT7Long_DegDMS");
		txtT7Long_DegDMS.setName ("txtT7Long_DegDMS");
		txtT7Long_DegDMS.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Long_DegDMS.setForeground (new Color (0x000000));
		txtT7Long_DegDMS.setText ("");
		PanelDDMMSS.add (txtT7Long_DegDMS);
		txtT7Long_DegDMS.setBounds (4, 26, 45, 23);

		txtT7Long_MinDMS = new TextField ("txtT7Long_MinDMS");
		txtT7Long_MinDMS.setName ("txtT7Long_MinDMS");
		txtT7Long_MinDMS.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Long_MinDMS.setForeground (new Color (0x000000));
		txtT7Long_MinDMS.setText ("");
		PanelDDMMSS.add (txtT7Long_MinDMS);
		txtT7Long_MinDMS.setBounds (62, 26, 40, 23);

		txtT7Long_Sec = new TextField ("txtT7Long_Sec");
		txtT7Long_Sec.setName ("txtT7Long_Sec");
		txtT7Long_Sec.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Long_Sec.setForeground (new Color (0x000000));
		txtT7Long_Sec.setText ("");
		PanelDDMMSS.add (txtT7Long_Sec);
		txtT7Long_Sec.setBounds (112, 26, 65, 23);

		ChoiceLongDirDMS = new Choice ();
		ChoiceLongDirDMS.setName ("ChoiceLongDirDMS");
		ChoiceLongDirDMS.setFont (new Font ("Helvetica", 0, 12));
		ChoiceLongDirDMS.setForeground (new Color (0x000000));
		ChoiceLongDirDMS.setBackground (new Color (0xffffff));
		ChoiceLongDirDMS.setVisible(false);
		PanelDDMMSS.add (ChoiceLongDirDMS);
		ChoiceLongDirDMS.setBounds (188, 26, 56, 23);

		PanelDecMin = new Panel ();
		PanelDecMin.setName ("PanelDecMin");
		PanelDecMin.setLayout(null);  
		PanelDecMin.setFont (new Font ("Helvetica", 0, 12));
		PanelDecMin.setForeground (new Color (0x000000));
		PanelCoords.add (PanelDecMin);
		PanelDecMin.setBounds (142, 0, 210, 51);

		txtT7Lat_DegMM = new TextField ("txtT7Lat_DegMM");
		txtT7Lat_DegMM.setName ("txtT7Lat_DegMM");
		txtT7Lat_DegMM.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Lat_DegMM.setForeground (new Color (0x000000));
		txtT7Lat_DegMM.setText ("");
		PanelDecMin.add (txtT7Lat_DegMM);
		txtT7Lat_DegMM.setBounds (4, 2, 45, 22);

		txtT7Lat_MinMM = new TextField ("txtT7Lat_MinMM");
		txtT7Lat_MinMM.setName ("txtT7Lat_MinMM");
		txtT7Lat_MinMM.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Lat_MinMM.setForeground (new Color (0x000000));
		txtT7Lat_MinMM.setText ("");
		PanelDecMin.add (txtT7Lat_MinMM);
		txtT7Lat_MinMM.setBounds (61, 2, 70, 23);

		ChoiceLatDirMM = new Choice ();
		ChoiceLatDirMM.setName ("ChoiceLatDirMM");
		ChoiceLatDirMM.setFont (new Font ("Helvetica", 0, 12));
		ChoiceLatDirMM.setForeground (new Color (0x000000));
		ChoiceLatDirMM.setBackground (new Color (0xffffff));
		ChoiceLatDirMM.setVisible(false);
		PanelDecMin.add (ChoiceLatDirMM);
		ChoiceLatDirMM.setBounds (142, 3, 56, 23);

		txtT7Long_DegMM = new TextField ("txtT7Long_DegMM");
		txtT7Long_DegMM.setName ("txtT7Long_DegMM");
		txtT7Long_DegMM.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Long_DegMM.setForeground (new Color (0x000000));
		txtT7Long_DegMM.setText ("");
		PanelDecMin.add (txtT7Long_DegMM);
		txtT7Long_DegMM.setBounds (4, 26, 45, 23);

		txtT7Long_MinMM = new TextField ("txtT7Long_MinMM");
		txtT7Long_MinMM.setName ("txtT7Long_MinMM");
		txtT7Long_MinMM.setFont (new Font ("TimesRoman", 0, 13));
		txtT7Long_MinMM.setForeground (new Color (0x000000));
		txtT7Long_MinMM.setText ("");
		PanelDecMin.add (txtT7Long_MinMM);
		txtT7Long_MinMM.setBounds (61, 26, 70, 23);

		ChoiceLongDirMM = new Choice ();
		ChoiceLongDirMM.setName ("ChoiceLongDirMM");
		ChoiceLongDirMM.setFont (new Font ("Helvetica", 0, 12));
		ChoiceLongDirMM.setForeground (new Color (0x000000));
		ChoiceLongDirMM.setBackground (new Color (0xffffff));
		ChoiceLongDirMM.setVisible(false);
		PanelDecMin.add (ChoiceLongDirMM);
		ChoiceLongDirMM.setBounds (142, 27, 56, 23);

		Label2111111 = new Label ("'", Label.LEFT);
		Label2111111.setName ("Label2111111");
		Label2111111.setFont (new Font ("Helvetica", 0, 14));
		Label2111111.setForeground (new Color (0x000000));
		PanelDecMin.add (Label2111111);
		Label2111111.setBounds (133, 26, 12, 14);

		Label22111 = new Label ("'", Label.LEFT);
		Label22111.setName ("Label22111");
		Label22111.setFont (new Font ("Helvetica", 0, 14));
		Label22111.setForeground (new Color (0x000000));
		PanelDecMin.add (Label22111);
		Label22111.setBounds (133, 0, 12, 14);

		Label21212 = new Label ("o", Label.LEFT);
		Label21212.setName ("Label21212");
		Label21212.setFont (new Font ("Helvetica", 0, 12));
		Label21212.setForeground (new Color (0x000000));
		PanelDecMin.add (Label21212);
		Label21212.setBounds (50, 23, 12, 14);

		Label231 = new Label ("o", Label.LEFT);
		Label231.setName ("Label231");
		Label231.setFont (new Font ("Helvetica", 0, 12));
		Label231.setForeground (new Color (0x000000));
		PanelDecMin.add (Label231);
		Label231.setBounds (50, -1, 12, 14);

		Label211111 = new Label ("\"", Label.LEFT);
		Label211111.setName ("Label211111");
		Label211111.setFont (new Font ("Helvetica", 0, 14));
		Label211111.setForeground (new Color (0x000000));
		PanelDDMMSS.add (Label211111);
		Label211111.setBounds (179, 25, 12, 14);

		Label2211 = new Label ("\"", Label.LEFT);
		Label2211.setName ("Label2211");
		Label2211.setFont (new Font ("Helvetica", 0, 14));
		Label2211.setForeground (new Color (0x000000));
		PanelDDMMSS.add (Label2211);
		Label2211.setBounds (179, 0, 12, 14);

		Label21121 = new Label ("'", Label.LEFT);
		Label21121.setName ("Label21121");
		Label21121.setFont (new Font ("Helvetica", 0, 14));
		Label21121.setForeground (new Color (0x000000));
		PanelDDMMSS.add (Label21121);
		Label21121.setBounds (105, 25, 12, 14);

		Label222 = new Label ("'", Label.LEFT);
		Label222.setName ("Label222");
		Label222.setFont (new Font ("Helvetica", 0, 14));
		Label222.setForeground (new Color (0x000000));
		PanelDDMMSS.add (Label222);
		Label222.setBounds (105, 0, 12, 14);

		Label2123 = new Label ("o", Label.LEFT);
		Label2123.setName ("Label2123");
		Label2123.setFont (new Font ("Helvetica", 0, 12));
		Label2123.setForeground (new Color (0x000000));
		PanelDDMMSS.add (Label2123);
		Label2123.setBounds (50, 21, 12, 14);

		Label23 = new Label ("o", Label.LEFT);
		Label23.setName ("Label23");
		Label23.setFont (new Font ("Helvetica", 0, 12));
		Label23.setForeground (new Color (0x000000));
		Label23.setBounds (50, -1, 12, 14);
		PanelDDMMSS.add (Label23);

		LabelDatum = new Label (props.getProperty("label.datum."+language), Label.LEFT);
		LabelDatum.setName ("LabelDatum");
		LabelDatum.setFont (new Font ("Helvetica", 0, 12));
		LabelDatum.setForeground (new Color (0x000000));
		LabelDatum.setBackground (new Color (0xc0c0c0));
		PanelCoords.add (LabelDatum);
		LabelDatum.setBounds (2, 52, 42, 27);

		ChoiceDatum = new Choice ();
		ChoiceDatum.setName ("ChoiceDatum");
		ChoiceDatum.setFont (new Font ("Helvetica", 0, 12));
		ChoiceDatum.setForeground (new Color (0x000000));
		ChoiceDatum.setBackground (new Color (0xffffff));
		ChoiceDatum.setVisible(false);
		PanelCoords.add (ChoiceDatum);
		ChoiceDatum.setBounds (50, 53, 290, 23);

		PanelCoordPrecision = new Panel ();
		PanelCoordPrecision.setName ("PanelCoordPrecision");
		PanelCoordPrecision.setLayout(null);  
		PanelCoordPrecision.setFont (new Font ("Helvetica", 0, 12));
		PanelCoordPrecision.setVisible (false);
		PanelCoordPrecision.setForeground (new Color (0x000000));
		pane.add (PanelCoordPrecision);
		PanelCoordPrecision.setBounds (3, 281, 340, 32);

		LabelLatPrecision = new Label (props.getProperty("label.coordprec."+language), Label.LEFT);
		LabelLatPrecision.setName ("LabelLatPrecision");
		LabelLatPrecision.setFont (new Font ("Helvetica", 0, 12));
		LabelLatPrecision.setForeground (new Color (0x000000));
		PanelCoordPrecision.add (LabelLatPrecision);
		LabelLatPrecision.setBounds (2, 3, 170, 27);

		ChoiceLatPrecision = new Choice ();
		ChoiceLatPrecision.setName ("ChoiceLatPrecision");
		ChoiceLatPrecision.setFont (new Font ("Helvetica", 0, 12));
		ChoiceLatPrecision.setForeground (new Color (0x000000));
		ChoiceLatPrecision.setBackground (new Color (0xffffff));
		ChoiceLatPrecision.setVisible(false);
		PanelCoordPrecision.add (ChoiceLatPrecision);
		ChoiceLatPrecision.setBounds (175, 4, 165, 23);

		LabelDirection = new Label (props.getProperty("label.direction."+language), Label.RIGHT);
		LabelDirection.setName ("LabelDirection");
		LabelDirection.setFont (new Font ("Helvetica", 0, 12));
		LabelDirection.setVisible (false);
		LabelDirection.setForeground (new Color (0x000000));
		LabelDirection.setBackground (new Color (0xc0c0c0));
		pane.add (LabelDirection);
		LabelDirection.setBounds (360, 146, 90, 23);

		ChoiceDirection = new Choice ();
		ChoiceDirection.setName ("ChoiceDirection");
		ChoiceDirection.setFont (new Font ("Helvetica", 0, 12));
		ChoiceDirection.setVisible (false);
		ChoiceDirection.setForeground (new Color (0x000000));
		ChoiceDirection.setBackground (new Color (0xffffff));
		ChoiceDirection.setVisible(false);
		pane.add (ChoiceDirection);
		ChoiceDirection.setBounds (455, 145, 110, 23);

		TextFieldHeading = new TextField ("TextFieldHeading");
		TextFieldHeading.setName ("TextFieldHeading");
		TextFieldHeading.setFont (new Font ("Helvetica", 0, 12));
		TextFieldHeading.setVisible (false);
		TextFieldHeading.setForeground (new Color (0x000000));
		TextFieldHeading.setBackground (new Color (0xffffff));
		TextFieldHeading.setText("");
		pane.add (TextFieldHeading);
		TextFieldHeading.setBounds (570, 145, 40, 23);

		TextFieldOffset = new TextField ("TextFieldOffset");
		TextFieldOffset.setName ("TextFieldOffset");
		TextFieldOffset.setFont (new Font ("Helvetica", 0, 12));
		TextFieldOffset.setVisible (false);
		TextFieldOffset.setForeground (new Color (0x000000));
		TextFieldOffset.setBackground (new Color (0xffffff));
		TextFieldOffset.setText("");
		pane.add (TextFieldOffset);
		TextFieldOffset.setBounds (525, 146, 40, 23);

		ChoiceOffsetNSDir = new Choice ();
		ChoiceOffsetNSDir.setName ("ChoiceOffsetNSDir");
		ChoiceOffsetNSDir.setFont (new Font ("Helvetica", 0, 12));
		ChoiceOffsetNSDir.setForeground (new Color (0x000000));
		ChoiceOffsetNSDir.setBackground (new Color (0xffffff));
		ChoiceOffsetNSDir.setVisible(false);
		pane.add (ChoiceOffsetNSDir);
		ChoiceOffsetNSDir.setBounds (565, 145, 50, 23);

		LabelOffsetEW = new Label (props.getProperty("label.distew."+language), Label.RIGHT);
		LabelOffsetEW.setName ("LabelOffsetEW");
		LabelOffsetEW.setFont (new Font ("Helvetica", 0, 12));
		LabelOffsetEW.setVisible (false);
		LabelOffsetEW.setForeground (new Color (0x000000));
		LabelOffsetEW.setBackground (new Color (0xc0c0c0));
		pane.add (LabelOffsetEW);
		LabelOffsetEW.setBounds (350, 174, 170, 23);

		TextFieldOffsetEW = new TextField ("TextFieldOffsetEW");
		TextFieldOffsetEW.setName ("TextFieldOffsetEW");
		TextFieldOffsetEW.setFont (new Font ("Helvetica", 0, 12));
		TextFieldOffsetEW.setVisible (false);
		TextFieldOffsetEW.setForeground (new Color (0x000000));
		TextFieldOffsetEW.setBackground (new Color (0xffffff));
		TextFieldOffsetEW.setText("");
		pane.add (TextFieldOffsetEW);
		TextFieldOffsetEW.setBounds (525, 173, 40, 23);

		ChoiceOffsetEWDir = new Choice();
		ChoiceOffsetEWDir.setName("ChoiceOffsetEWDir");
		ChoiceOffsetEWDir.setFont(new Font ("Helvetica", 0, 12));
		ChoiceOffsetEWDir.setForeground (new Color (0x000000));
		ChoiceOffsetEWDir.setBackground (new Color (0xffffff));
		ChoiceOffsetEWDir.setVisible(false);
		pane.add(ChoiceOffsetEWDir);
		ChoiceOffsetEWDir.setBounds(565, 172, 50, 23);

		LabelOffset = new Label (props.getProperty("label.offset."+language), Label.RIGHT);
		LabelOffset.setName ("LabelOffset");
		LabelOffset.setFont (new Font ("Helvetica", 0, 12));
		LabelOffset.setVisible (false);
		LabelOffset.setForeground (new Color (0x000000));
		LabelOffset.setBackground (new Color (0xc0c0c0));
		pane.add (LabelOffset);
		LabelOffset.setBounds (340, 147, 180, 23);

		LabelExtent = new Label (props.getProperty("label.extent."+language), Label.RIGHT);
		LabelExtent.setName ("LabelExtent");
		LabelExtent.setFont (new Font ("Helvetica", 0, 12));
		LabelExtent.setVisible (false);
		LabelExtent.setForeground (new Color (0x000000));
		LabelExtent.setBackground (new Color (0xc0c0c0));
		pane.add (LabelExtent);
		LabelExtent.setBounds (340, 201, 180, 23);

		TextFieldExtent = new TextField ("TextFieldExtent");
		TextFieldExtent.setName ("TextFieldExtent");
		TextFieldExtent.setFont (new Font ("Helvetica", 0, 12));
		TextFieldExtent.setVisible (false);
		TextFieldExtent.setForeground (new Color (0x000000));
		TextFieldExtent.setBackground (new Color (0xffffff));
		TextFieldExtent.setText ("");
		pane.add (TextFieldExtent);
		TextFieldExtent.setBounds (525, 200, 40, 23);

		LabelMeasurementError = new Label (props.getProperty("label.measurementerror."+language), Label.RIGHT);
		LabelMeasurementError.setName ("LabelMeasurementError");
		LabelMeasurementError.setFont (new Font ("Helvetica", 0, 12));
		LabelMeasurementError.setVisible (false);
		LabelMeasurementError.setForeground (new Color (0x000000));
		LabelMeasurementError.setBackground (new Color (0xc0c0c0));
		pane.add (LabelMeasurementError);
		LabelMeasurementError.setBounds (340, 226, 180, 23);

		TextFieldMeasurementError = new TextField ("TextFieldMeasurementError");
		TextFieldMeasurementError.setName ("TextFieldMeasurementError");
		TextFieldMeasurementError.setFont (new Font ("Helvetica", 0, 12));
		TextFieldMeasurementError.setVisible (false);
		TextFieldMeasurementError.setForeground (new Color (0x000000));
		TextFieldMeasurementError.setBackground (new Color (0xffffff));
		TextFieldMeasurementError.setText ("");
		pane.add (TextFieldMeasurementError);
		TextFieldMeasurementError.setBounds (525, 226, 40, 23);

		LabelDistUnits = new Label (props.getProperty("label.distunits."+language), Label.RIGHT);
		LabelDistUnits.setName ("LabelDistUnits");
		LabelDistUnits.setFont (new Font ("Helvetica", 0, 12));
		LabelDistUnits.setVisible (false);
		LabelDistUnits.setForeground (new Color (0x000000));
		LabelDistUnits.setBackground (new Color (0xc0c0c0));
		pane.add (LabelDistUnits);
		LabelDistUnits.setBounds (340, 255, 180, 27);

		ChoiceDistUnits = new Choice ();
		ChoiceDistUnits.setName ("ChoiceDistUnits");
		ChoiceDistUnits.setFont (new Font ("Helvetica", 0, 12));
		ChoiceDistUnits.setVisible (false);
		ChoiceDistUnits.setForeground (new Color (0x000000));
		ChoiceDistUnits.setBackground (new Color (0xffffff));
		ChoiceDistUnits.setVisible(false);
		pane.add (ChoiceDistUnits);
		ChoiceDistUnits.setBounds (525, 256, 60, 23);

		LabelDistancePrecision = new Label (props.getProperty("label.distprec."+language), Label.RIGHT);
		LabelDistancePrecision.setName ("LabelDistancePrecision");
		LabelDistancePrecision.setFont (new Font ("Helvetica", 0, 12));
		LabelDistancePrecision.setVisible (false);
		LabelDistancePrecision.setForeground (new Color (0x000000));
		LabelDistancePrecision.setBackground (new Color (0xc0c0c0));
		pane.add (LabelDistancePrecision);
		LabelDistancePrecision.setBounds (350, 280, 170, 23);

		ChoiceDistancePrecision = new Choice ();
		ChoiceDistancePrecision.setName ("ChoiceDistancePrecision");
		ChoiceDistancePrecision.setFont (new Font ("Helvetica", 0, 12));
		ChoiceDistancePrecision.setVisible (false);
		ChoiceDistancePrecision.setForeground (new Color (0x000000));
		ChoiceDistancePrecision.setBackground (new Color (0xffffff));
		ChoiceDistancePrecision.setVisible(false);
		pane.add (ChoiceDistancePrecision);
		ChoiceDistancePrecision.setBounds (525, 281, 90, 23);

		ButtonCalculate = new Button(props.getProperty("label.calculate."+language));
		ButtonCalculate.setName ("ButtonCalculate");
		ButtonCalculate.setFont (new Font ("Helvetica", 1, 12));
		ButtonCalculate.setForeground (new Color (0x000000));
		ButtonCalculate.setBackground (new Color (0xc6c6c6));
		ButtonCalculate.setVisible (false);
		pane.add(ButtonCalculate);
		ButtonCalculate.setBounds (445, 343, 82, 26); 

		ButtonPromote = new Button(props.getProperty("label.promote."+language));
		ButtonPromote.setName ("ButtonPromote");
		ButtonPromote.setFont (new Font ("Helvetica", 1, 12));
		ButtonPromote.setForeground (new Color (0x000000));
		ButtonPromote.setBackground (new Color (0xc6c6c6));
		ButtonPromote.setVisible (false);
		pane.add(ButtonPromote);
		ButtonPromote.setBounds (527, 343, 82, 26); 

		PanelResults = new Panel ();
		PanelResults.setName ("PanelResults");
		PanelResults.setLayout(null);  
		PanelResults.setFont (new Font ("Helvetica", 0, 12));
		PanelResults.setVisible (false);
		PanelResults.setForeground (new Color (0x000000));
		pane.add (PanelResults);
		PanelResults.setBounds (4, 322, 611, 77);

		LabelCalcDecLat = new Label (props.getProperty("label.declat."+language), Label.CENTER);
		LabelCalcDecLat.setName ("LabelCalcDecLat");
		LabelCalcDecLat.setFont (new Font ("Helvetica", 0, 12));
		LabelCalcDecLat.setForeground (new Color (0x000000));
		PanelResults.add (LabelCalcDecLat);
		LabelCalcDecLat.setBounds (1, 3, 134, 18);

		TextFieldCalcDecLat = new TextField ("TextFieldCalcDecLat");
		TextFieldCalcDecLat.setName ("TextFieldCalcDecLat");
		TextFieldCalcDecLat.setFont (new Font ("Helvetica", 1, 12));
		TextFieldCalcDecLat.setForeground (new Color (0x0000ff));
		TextFieldCalcDecLat.setText ("");
		TextFieldCalcDecLat.setEditable(false);
		PanelResults.add (TextFieldCalcDecLat);
		TextFieldCalcDecLat.setBounds (5, 21, 130, 25);

		LabelCalcDecLong = new Label (props.getProperty("label.declon."+language), Label.CENTER);
		LabelCalcDecLong.setName ("LabelCalcDecLong");
		LabelCalcDecLong.setFont (new Font ("Helvetica", 0, 12));
		LabelCalcDecLong.setForeground (new Color (0x000000));
		PanelResults.add (LabelCalcDecLong);
		LabelCalcDecLong.setBounds (138, 3, 134, 18);

		TextFieldCalcDecLong = new TextField ("TextFieldCalcDecLong");
		TextFieldCalcDecLong.setName ("TextFieldCalcDecLong");
		TextFieldCalcDecLong.setFont (new Font ("Helvetica", 1, 12));
		TextFieldCalcDecLong.setForeground (new Color (0x0000ff));
		TextFieldCalcDecLong.setText ("");
		TextFieldCalcDecLong.setEditable(false);
		PanelResults.add (TextFieldCalcDecLong);
		TextFieldCalcDecLong.setBounds (140, 21, 130, 25);

		LabelCalcMaxError = new Label (props.getProperty("label.maxerrdist."+language), Label.CENTER);
		LabelCalcMaxError.setName ("LabelCalcMaxError");
		LabelCalcMaxError.setFont (new Font ("Helvetica", 0, 12));
		LabelCalcMaxError.setForeground (new Color (0x000000));
		PanelResults.add (LabelCalcMaxError);
		LabelCalcMaxError.setBounds (273, 3, 165, 18);

		TextFieldCalcErrorDist = new TextField ("TextFieldCalcErrorDist");
		TextFieldCalcErrorDist.setName ("TextFieldCalcErrorDist");
		TextFieldCalcErrorDist.setFont (new Font ("Helvetica", 1, 12));
		TextFieldCalcErrorDist.setForeground (new Color (0x0000ff));
		TextFieldCalcErrorDist.setText ("");
		TextFieldCalcErrorDist.setEditable(false);
		PanelResults.add (TextFieldCalcErrorDist);
		TextFieldCalcErrorDist.setBounds (275, 21, 111, 25);

		TextFieldCalcErrorUnits = new TextField ("TextFieldCalcErrorUnits");
		TextFieldCalcErrorUnits.setName ("TextFieldCalcErrorUnits");
		TextFieldCalcErrorUnits.setFont (new Font ("Helvetica", 1, 12));
		TextFieldCalcErrorUnits.setForeground (new Color (0x0000ff));
		TextFieldCalcErrorUnits.setEditable(false);
		PanelResults.add (TextFieldCalcErrorUnits);
		TextFieldCalcErrorUnits.setBounds (390, 21, 46, 25);

		TextFieldFullResult = new TextField ("TextFieldFullResult");
		TextFieldFullResult.setName ("TextFieldFullResult");
		TextFieldFullResult.setFont (new Font ("Helvetica", 1, 12));
		TextFieldFullResult.setForeground (new Color (0x0000ff));
		TextFieldFullResult.setEditable(false);
		PanelResults.add (TextFieldFullResult);
		TextFieldFullResult.setBounds (5, 48, 602, 25);

		//=== Distance Converter Controls ===//
		LabelDistanceConverter = new Label (props.getProperty("label.distanceconverter."+language), Label.LEFT);
		LabelDistanceConverter.setName ("LabelDistanceConverter");
		LabelDistanceConverter.setFont (new Font ("Helvetica", 0, 12));
		LabelDistanceConverter.setVisible (false);
		LabelDistanceConverter.setForeground (new Color (0x000000));
		LabelDistanceConverter.setBackground (new Color (0xc0c0c0));
		pane.add (LabelDistanceConverter);
		LabelDistanceConverter.setBounds (10, 410, 160, 27);

		TextFieldFromDistance = new TextField ("TextFieldFromDistance");
		TextFieldFromDistance.setName ("TextFieldFromDistance");
		TextFieldFromDistance.setFont (new Font ("Helvetica", 0, 12));
		TextFieldFromDistance.setVisible (false);
		TextFieldFromDistance.setForeground (new Color (0x000000));
		TextFieldFromDistance.setBackground (new Color (0xffffff));
		TextFieldFromDistance.setText ("");
		pane.add (TextFieldFromDistance);
		TextFieldFromDistance.setBounds (180, 410, 80, 23);

		ChoiceFromDistUnits = new Choice();
		ChoiceFromDistUnits.setName ("ChoiceFromDistUnits");
		ChoiceFromDistUnits.setFont (new Font ("Helvetica", 0, 12));
		ChoiceFromDistUnits.setVisible (false);
		ChoiceFromDistUnits.setForeground (new Color (0x000000));
		ChoiceFromDistUnits.setBackground (new Color (0xffffff));
		ChoiceFromDistUnits.setVisible(false);
		pane.add (ChoiceFromDistUnits);
		ChoiceFromDistUnits.setBounds (265, 410, 60, 23);

		LabelEquals = new Label ("=", Label.CENTER);
		LabelEquals.setName ("LabelEquals");
		LabelEquals.setFont (new Font ("Helvetica", 0, 12));
		LabelEquals.setVisible (false);
		LabelEquals.setForeground (new Color (0x000000));
		LabelEquals.setBackground (new Color (0xc0c0c0));
		pane.add (LabelEquals);
		LabelEquals.setBounds (325, 410, 20, 27);

		TextFieldToDistance = new TextField ("TextFieldToDistance");
		TextFieldToDistance.setName ("TextFieldToDistance");
		TextFieldToDistance.setFont (new Font ("Helvetica", 1, 12));
		TextFieldToDistance.setVisible (false);
		TextFieldToDistance.setForeground (new Color (0x0000ff));
		TextFieldToDistance.setText ("");
		TextFieldToDistance.setEditable(false);
		pane.add (TextFieldToDistance);
		TextFieldToDistance.setBounds (345, 410, 80, 23);
		
		ChoiceToDistUnits = new Choice();
		ChoiceToDistUnits.setName ("ChoiceToDistUnits");
		ChoiceToDistUnits.setFont (new Font ("Helvetica", 0, 12));
		ChoiceToDistUnits.setVisible (false);
		ChoiceToDistUnits.setForeground (new Color (0x000000));
		ChoiceToDistUnits.setBackground (new Color (0xffffff));
		ChoiceToDistUnits.setVisible(false);
		pane.add (ChoiceToDistUnits);
		ChoiceToDistUnits.setBounds (430, 410, 60, 23);

		//=== Scale Converter Controls ===//
		LabelScaleConverter = new Label (props.getProperty("label.scaleconverter."+language), Label.LEFT);
		LabelScaleConverter.setName ("LabelScaleConverter");
		LabelScaleConverter.setFont (new Font ("Helvetica", 0, 12));
		LabelScaleConverter.setVisible (false);
		LabelScaleConverter.setForeground (new Color (0x000000));
		LabelScaleConverter.setBackground (new Color (0xc0c0c0));
		pane.add (LabelScaleConverter);
		LabelScaleConverter.setBounds (10, 440, 160, 27);

		TextFieldScaleFromDistance = new TextField ("TextFieldScaleFromDistance");
		TextFieldScaleFromDistance.setName ("TextFieldScaleFromDistance");
		TextFieldScaleFromDistance.setFont (new Font ("Helvetica", 0, 12));
		TextFieldScaleFromDistance.setVisible (false);
		TextFieldScaleFromDistance.setForeground (new Color (0x000000));
		TextFieldScaleFromDistance.setBackground (new Color (0xffffff));
		TextFieldScaleFromDistance.setText ("");
		pane.add (TextFieldScaleFromDistance);
		TextFieldScaleFromDistance.setBounds (180, 440, 80, 23);

		ChoiceScaleFromDistUnits = new Choice();
		ChoiceScaleFromDistUnits.setName ("ChoiceScaleFromDistUnits");
		ChoiceScaleFromDistUnits.setFont (new Font ("Helvetica", 0, 12));
		ChoiceScaleFromDistUnits.setVisible (false);
		ChoiceScaleFromDistUnits.setForeground (new Color (0x000000));
		ChoiceScaleFromDistUnits.setBackground (new Color (0xffffff));
		ChoiceScaleFromDistUnits.setVisible(false);
		pane.add (ChoiceScaleFromDistUnits);
		ChoiceScaleFromDistUnits.setBounds (265, 440, 60, 23);

		ChoiceScale = new Choice();
		ChoiceScale.setName ("ChoiceScale");
		ChoiceScale.setFont (new Font ("Helvetica", 0, 12));
		ChoiceScale.setVisible (false);
		ChoiceScale.setForeground (new Color (0x000000));
		ChoiceScale.setBackground (new Color (0xffffff));
		ChoiceScale.setVisible(false);
		pane.add (ChoiceScale);
		ChoiceScale.setBounds (325, 440, 120, 23);

		LabelScaleEquals = new Label ("=", Label.CENTER);
		LabelScaleEquals.setName ("LabelScaleEquals");
		LabelScaleEquals.setFont (new Font ("Helvetica", 0, 12));
		LabelScaleEquals.setVisible (false);
		LabelScaleEquals.setForeground (new Color (0x000000));
		LabelScaleEquals.setBackground (new Color (0xc0c0c0));
		pane.add (LabelScaleEquals);
		LabelScaleEquals.setBounds (445, 440, 20, 27);

		TextFieldScaleToDistance = new TextField ("TextFieldScaleToDistance");
		TextFieldScaleToDistance.setName ("TextFieldScaleToDistance");
		TextFieldScaleToDistance.setFont (new Font ("Helvetica", 1, 12));
		TextFieldScaleToDistance.setVisible (false);
		TextFieldScaleToDistance.setForeground (new Color (0x0000ff));
		TextFieldScaleToDistance.setText ("");
		TextFieldScaleToDistance.setEditable(false);
		pane.add (TextFieldScaleToDistance);
		TextFieldScaleToDistance.setBounds (465, 440, 80, 23);
		
		ChoiceScaleToDistUnits = new Choice();
		ChoiceScaleToDistUnits.setName ("ChoiceScaleToDistUnits");
		ChoiceScaleToDistUnits.setFont (new Font ("Helvetica", 0, 12));
		ChoiceScaleToDistUnits.setVisible (false);
		ChoiceScaleToDistUnits.setForeground (new Color (0x000000));
		ChoiceScaleToDistUnits.setBackground (new Color (0xffffff));
		ChoiceScaleToDistUnits.setVisible(false);
		pane.add (ChoiceScaleToDistUnits);
		ChoiceScaleToDistUnits.setBounds (545, 440, 60, 23);

		PanelResults.setBackground (new Color (0xc0c0c0));
		PanelCoords.setBackground (new Color (0xc0c0c0));
		PanelDecLatLong.setBackground (new Color (0xc0c0c0));
		PanelDecMin.setBackground (new Color (0xc0c0c0));
		PanelDDMMSS.setBackground (new Color (0xc0c0c0));
		PanelCoordPrecision.setBackground (new Color (0xc0c0c0));
		pane.setBackground (new Color (0xc0c0c0));

		afterFormInitialize();
		addListeners();
		return pane;
	}

	public void focusGained(FocusEvent e){
		if (e.getSource() == TextFieldFromDistance) {
			TextFieldFromDistance_focusGained();
		}
		if (e.getSource() == TextFieldToDistance) {
			TextFieldToDistance_focusGained();
		}
		if (e.getSource() == TextFieldScaleFromDistance) {
			TextFieldScaleFromDistance_focusGained();
		}
		if (e.getSource() == TextFieldScaleToDistance) {
			TextFieldScaleToDistance_focusGained();
		}
		if (e.getSource() == TextFieldExtent) {
			TextFieldExtent_focusGained();
		}
		if (e.getSource() == TextFieldMeasurementError) {
			TextFieldMeasurementError_focusGained();
		}
		if (e.getSource() == txtT2Dec_Lat) {
			txtT2Dec_Lat_focusGained();
		}
		if (e.getSource() == txtT2Dec_Long) {
			txtT2Dec_Long_focusGained();
		}
		if (e.getSource() == txtT7Lat_DegDMS) {
			txtT7Lat_DegDMS_focusGained();
		}
		if (e.getSource() == txtT7Lat_DegMM) {
			txtT7Lat_DegMM_focusGained();
		}
		if (e.getSource() == txtT7Lat_MinDMS) {
			txtT7Lat_MinDMS_focusGained();
		}
		if (e.getSource() == txtT7Lat_MinMM) {
			txtT7Lat_MinMM_focusGained();
		}
		if (e.getSource() == txtT7Lat_Sec) {
			txtT7Lat_Sec_focusGained();
		}
		if (e.getSource() == txtT7Long_DegDMS) {
			txtT7Long_DegDMS_focusGained();
		}
		if (e.getSource() == txtT7Long_DegMM) {
			txtT7Long_DegMM_focusGained();
		}
		if (e.getSource() == txtT7Long_MinDMS) {
			txtT7Long_MinDMS_focusGained();
		}
		if (e.getSource() == txtT7Long_MinMM) {
			txtT7Long_MinMM_focusGained();
		}
		if (e.getSource() == txtT7Long_Sec) {
			txtT7Long_Sec_focusGained();
		}
		if (e.getSource() == TextFieldOffset) {
			TextFieldOffset_focusGained();
		}
		if (e.getSource() == TextFieldOffsetEW) {
			TextFieldOffsetEW_focusGained();
		}
		if (e.getSource() == TextFieldHeading) {
			TextFieldHeading_focusGained();
		}
	}

	public void focusLost( FocusEvent e ){}

	private double getCoordPrecisionError(){
		String latprecision = (String)ChoiceLatPrecision.getSelectedItem();
		if( latprecision.equals(props.getProperty("coordprec.dd.exact."+language)) ) return 0.0;

		// Assume coordinate precision is the same in both latitude and longitude.
		// Also assume that precision of one degree corresponds to the distance
		// in one degree of both latitude and longitude from the given latitude
		// and longitude.
		calculateLatLongMetersPerDegree();
		double error = Math.sqrt( Math.pow(latmetersperdegree,2.0) + Math.pow(longmetersperdegree,2.0) );

		String distunitsstr = (String)ChoiceDistUnits.getSelectedItem();
		error = convertFromMetersTo( error, distunitsstr );

		if( latprecision.equals(props.getProperty("coordprec.dd.degree."+language)) ){
//			if( latprecision.equals("nearest degree") ){
			error *= 1.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.01."+language)) ){
//			} else if( latprecision.equals("0.1 degrees") ){
			error *= 0.1;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.001."+language)) ){
//			} else if( latprecision.equals("0.01 degrees") ){
			error *= 0.01;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.0001."+language)) ){
//			} else if( latprecision.equals("0.001 degrees") ){
			error *= 0.001;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.00001."+language)) ){
//			} else if( latprecision.equals("0.0001 degrees") ){
			error *= 0.0001;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.000001."+language)) ){
//			} else if( latprecision.equals("0.00001 degrees") ){
			error *= 0.00001;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.half."+language)) ){
//			} else if( latprecision.equals("nearest 1/2 degree") ){
			error *= 0.5;
		} else if( latprecision.equals(props.getProperty("coordprec.dd.quarter."+language)) ){
//			} else if( latprecision.equals("nearest 1/4 degree") ){
			error *= 0.25;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.30m."+language)) ){
//			} else if( latprecision.equals("nearest 30 minutes") ){
			error *= 0.5;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.10m."+language)) ){
//			} else if( latprecision.equals("nearest 10 minutes") ){
			error /= 6.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.5m."+language)) ){
//			} else if( latprecision.equals("nearest 5 minutes") ){
			error /= 12.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.1m."+language)) ){
//			} else if( latprecision.equals("nearest minute") ){
			error /= 60.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.30s."+language)) ){
//			} else if( latprecision.equals("nearest 30 seconds") ){
			error /= 120.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.10s."+language)) ){
//			} else if( latprecision.equals("nearest 10 seconds") ){
			error /= 360.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.5s."+language)) ){
//			} else if( latprecision.equals("nearest 5 seconds") ){
			error /= 720.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.1s."+language)) ){
//			} else if( latprecision.equals("nearest second") ){
			error /= 3600.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.01s."+language)) ){
//			} else if( latprecision.equals("0.1 seconds") ){
			error /= 36000.0;
		} else if( latprecision.equals(props.getProperty("coordprec.dms.001s."+language)) ){
//			} else if( latprecision.equals("0.01 seconds") ){
			error /= 360000.0;
		} else if( latprecision.equals(props.getProperty("coordprec.ddm.1m."+language)) ){
//			} else if( latprecision.equals("1 minute") ){
			error /= 60.0;
		} else if( latprecision.equals(props.getProperty("coordprec.ddm.01m."+language)) ){
//			} else if( latprecision.equals("0.1 minutes") ){
			error /= 600.0;
		} else if( latprecision.equals(props.getProperty("coordprec.ddm.001m."+language)) ){
//			} else if( latprecision.equals("0.01 minutes") ){
			error /= 6000.0;
		} else if( latprecision.equals(props.getProperty("coordprec.ddm.0001m."+language)) ){
//			} else if( latprecision.equals("0.001 minutes") ){
			error /= 60000.0;
		}
		return error;
	}

	private double getDatumError(){
		String s = (String)ChoiceDatum.getSelectedItem();
		if( s != null && !s.equals(props.getProperty("datum.notrecorded."+language)) ){
			return 0.0;
		}
		double error = 0.0;
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
		String distunitsstr = (String)ChoiceDistUnits.getSelectedItem();
		error = convertFromMetersTo( error, distunitsstr );
		return error;
	}

	public double getDecimalDegreesFromDegreesDecimalMinutes( int d, double m ){
		double ddegs = Math.abs(m/60.0);
		ddegs += Math.abs(d);
		return ddegs;
	}

	public double getDecimalDegreesFromDMS(int d, int m, double s)
	{
		double ddegs = Math.abs(s/3600.0);
		ddegs += Math.abs(m/60.0);
		ddegs += Math.abs(d);
		return ddegs;
	}

	public double getDecimalMinutesFromMS(int m, double s)
	{
		double dmins = Math.abs(s/60.0);
		dmins += Math.abs(m);
		return dmins;
	}

	private double getDirectionError( double offset, double disterr ){
		double alpha = 1.0; // direction precision, in degrees.
		String dir = (String)ChoiceDirection.getSelectedItem();

		int index = canonicalheadings.indexOf(dir);
		if( index<4 )alpha=45.0;
		else if( index<8 ) alpha=22.5;
		else if( index<16 ) alpha=11.25;
		else if( index<32 ) alpha=5.625;

		double x = offset*Math.cos(alpha*Math.PI/180.0);
		double y = offset*Math.sin(alpha*Math.PI/180.0);
		double xp = offset+disterr;
		double error = Math.sqrt( Math.pow(xp-x,2) + Math.pow(y,2) );
		return error; // error is in whatever units are selected.
	}

	private double getDistancePrecisionError(){
		double error = 0.0;
		String precstr = (String)ChoiceDistancePrecision.getSelectedItem();
		String units = (String)ChoiceDistUnits.getSelectedItem();

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

	public void getDMSFromDecDegrees( double dval ) { // 40.17, -67.1
		lastdecimaldegrees=dval;
		if ( dval < 0 ) sign = -1; // 1, -1
		else sign = 1;
		seconds = sign*dval*3600.0; // 14461.2,  24156
		Double degs = new Double(sign*dval); // 40.17, 67.1
		degrees = degs.intValue(); // 40, 67
		seconds -= degrees*3600.0; // 61.2, 36.0
		Double mins = new Double(seconds/60.0); // 1.02, 0.6
		decminutes = mins.doubleValue();
		minutes = mins.intValue(); // 1, 0
		seconds -= minutes*60.0; // 1.2, 36.0
		int secsAsInt = getNearestInt( seconds*1000.0 );
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

	private String getEllipsoidCode( String datumstr ){
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

	private double getFlattening( String ellipsoidIDCode ){
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

	private double getSemiMajorAxis( String ellipsoidIDCode ){
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
	private double getGPSAccuracy() throws ParseException{
		if( ((String)ChoiceCoordSource.getSelectedItem()).equals(props.getProperty("coordsource.gps."+language)) ){
			return getMeasurementError();
		}
		return 0;
	}
*/
	private double getExtentsError() throws ParseException{
		double exerr = 0;
		String s = TextFieldExtent.getText();
		double e = 0;
		Number num = null;

		if( s != null && s.length() != 0 ){
			num = numberFormatter.parse(s.trim()); 
			e = num.doubleValue();
			exerr = e;
		}
		return exerr;
	}

	private double getMeasurementError() throws ParseException{
		double measurementerr = 0;
		String s = TextFieldMeasurementError.getText();
		double e = 0;
		Number num = null;

		if( s != null && s.length() != 0 ){
			num = numberFormatter.parse(s.trim()); 
			e = num.doubleValue();
			measurementerr = e;
		}

		return measurementerr;
	}

	private double getMapScaleError(){
		double error = 0.0; // in feet
		String sourcestr = (String)ChoiceCoordSource.getSelectedItem();
		int index = canonicalsources.indexOf(sourcestr);

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
		String distunitsstr = (String)ChoiceDistUnits.getSelectedItem();
		error = convertFromFeetTo( error, distunitsstr );
		return error;
	}

	public void getMSFromDecMinutes( double dval ) {
		lastdecimalminutes=dval;
		seconds = dval*60.0;
		Double mins = new Double(dval);
		minutes = mins.intValue();
		seconds -= minutes*60.0;
		int secsAsInt = getNearestInt( seconds*1000.0 );
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

	public int getNearestInt( double dval ) {
		Double dValue = new Double(dval);
		int ival = dValue.intValue();
		if( dval-(double)ival <= 0.5 ) return ival;
		else return( ival+1 );
	}

	private void getNewCoordinates() throws ParseException{ 
		// this method should be called only to calculate new coordinates
		newdecimallatitude=decimallatitude;
		newdecimallongitude=decimallongitude;

		String SCalcType = (String)ChoiceCalcType.getSelectedItem();
		int cindex = canonicalcalctypes.indexOf(SCalcType);
		if( cindex==0 ){ // Error only
//			if( SCalcType.equals("Error only - enter Lat/Long for the actual locality") ){
			return;
		}
		String s = null;
		double d = 0;
		double meterseast = 0;
		double metersnorth = 0;
		double metersoffset = 0;
		Number num = null;

		calculateLatLongMetersPerDegree();
		String SBoxModel = (String)ChoiceModel.getSelectedItem();
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

	private double getOffset() throws ParseException{
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

	//initialize the applet
	public void init() {
		Component contents = createComponents();
		this.add(contents);
		this.setVisible(true);
		setIgnoreRepaint(true);
		datumErrorInst=new Datumerror();
		datumErrorInst.init();
		datumErrorInst.create();
	}

	public void keyPressed(KeyEvent e) {
		int keyCode = e.getKeyCode();
		if (keyCode == 10) { // Enter = Calculate
			if (ButtonCalculate.isShowing()){
				try {
					ButtonCalculate_afterActionPerformed();
				} catch (ParseException e1) {
					e1.printStackTrace();
				}
			}
		}
	}

	public void keyReleased(KeyEvent e) {
		convertDistance();
		convertScale();
	}

	public void keyTyped(KeyEvent e) {
	}

	public void paint(Graphics g) {
		super.paint (g);
		if (!ChoiceOffsetEWDir.isShowing ()) {
			ChoiceOffsetEWDir.setBounds (565, 173, 50, 23);
		}
		if(!ChoiceOffsetNSDir.isShowing ()) {
			ChoiceOffsetNSDir.setBounds (565, 146, 50, 23);
		}
		if (!ChoiceCalcType.isShowing ()) {
			ChoiceCalcType.setBounds (117, 33, 478, 23);
			ChoiceCalcType.setVisible(true);
		}
		if (!ChoiceModel.isShowing ()) {
			ChoiceModel.setBounds (125, 87, 490, 23);
		}
		if (!ChoiceCoordSource.isShowing ()) {
			ChoiceCoordSource.setBounds (165, 146, 180, 23);
		}
		if (!ChoiceCoordSystem.isShowing ()) {
			ChoiceCoordSystem.setBounds (165, 173, 180, 23);
		}
		if (!ChoiceDatum.isShowing ()) {
			ChoiceDatum.setBounds (50, 53, 290, 23);
			ChoiceDatum.setVisible(true);
		}
		if (!ChoiceDistUnits.isShowing ()) {
			ChoiceDistUnits.setBounds (525, 256, 60, 23);
		}
		if (!ChoiceFromDistUnits.isShowing ()) {
			ChoiceFromDistUnits.setBounds (265, 410, 60, 23);
		}
		if (!ChoiceToDistUnits.isShowing ()) {
			ChoiceToDistUnits.setBounds (430, 410, 60, 23);
		}
		if (!ChoiceScaleFromDistUnits.isShowing ()) {
			ChoiceScaleFromDistUnits.setBounds (265, 440, 60, 23);
		}
		if (!ChoiceScaleToDistUnits.isShowing ()) {
			ChoiceScaleToDistUnits.setBounds (545, 440, 60, 23);
		}
		if (!ChoiceScale.isShowing ()) {
			ChoiceScale.setBounds (325, 440, 120, 23);
		}

		if (!ChoiceDistancePrecision.isShowing ()) {
			ChoiceDistancePrecision.setBounds (525, 281, 90, 23);
		}
		if (!ChoiceDirection.isShowing ()) {
			ChoiceDirection.setBounds (455, 145, 110, 23);
		}
		if (!ChoiceLatDirMM.isShowing ()) {
			ChoiceLatDirMM.setBounds (142, 2, 56, 23);
			ChoiceLatDirMM.setVisible(true);
		}
		if (!ChoiceLongDirMM.isShowing ()) {
			ChoiceLongDirMM.setBounds (142, 26, 56, 23);
			ChoiceLongDirMM.setVisible(true);
		}
		if (!ChoiceLongDirDMS.isShowing ()) {
			ChoiceLongDirDMS.setBounds (188, 26, 56, 23);
			ChoiceLongDirDMS.setVisible(true);
		}
		if (!ChoiceLatDirDMS.isShowing ()) {
			ChoiceLatDirDMS.setBounds (188, 2, 56, 23);
			ChoiceLatDirDMS.setVisible(true);
		}
		if (!ChoiceLatPrecision.isShowing ()) {
			ChoiceLatPrecision.setBounds (175, 4, 165, 23);
			ChoiceLatPrecision.setVisible(true);
		}
	}

	// Populate the Coordinate Precision Controls based on the Coordinate System
	private void populateCoordinatePrecision( String system ){
		ChoiceLatPrecision.removeAll();
		int index = canonicalcoordsystems.indexOf(system);
		if( index==0 ){
			for(int i=0;i<canonicalddprec.size();i++){
				ChoiceLatPrecision.addItem((String)canonicalddprec.get(i));
			}
			ChoiceLatPrecision.select(props.getProperty("coordprec.dd.degree."+language));
		} else if( index==1 ){
			for(int i=0;i<canonicaldmsprec.size();i++){
				ChoiceLatPrecision.addItem((String)canonicaldmsprec.get(i));
			}
			ChoiceLatPrecision.select(props.getProperty("coordprec.dms.degree."+language));
		} else if( index==2 ){
			for(int i=0;i<canonicalddmprec.size();i++){
				ChoiceLatPrecision.addItem((String)canonicalddmprec.get(i));
			}
			ChoiceLatPrecision.select(props.getProperty("coordprec.ddm.degree."+language));
		}
	}

	private void populateDistancePrecision( String units ){
		ChoiceDistancePrecision.removeAll();
		ChoiceDistancePrecision.addItem("100 "+units);
		ChoiceDistancePrecision.addItem("10 "+units);
		ChoiceDistancePrecision.addItem("1 "+units);
		ChoiceDistancePrecision.addItem("1/2 "+units);
		ChoiceDistancePrecision.addItem("1/3 "+units);
		ChoiceDistancePrecision.addItem("1/4 "+units);
		ChoiceDistancePrecision.addItem("1/8 "+units);
		ChoiceDistancePrecision.addItem("1/10 "+units);
		ChoiceDistancePrecision.addItem("1/100 "+units);
		ChoiceDistancePrecision.addItem(props.getProperty("coordprec.dd.exact."+language));
		ChoiceDistancePrecision.select("1 "+units);
	}

	private void populateStableControls(){
		ChoiceCalcType.removeAll();
		ChoiceCalcType.addItem("");
		ChoiceCalcType.addItem(props.getProperty("calctype.coordsanderror."+language));
		ChoiceCalcType.addItem(props.getProperty("calctype.erroronly."+language));
		ChoiceCalcType.addItem(props.getProperty("calctype.coordsonly."+language));
		ChoiceCalcType.select("");

		// Coordinate System controls
		ChoiceCoordSystem.removeAll();
		ChoiceCoordSystem.addItem(props.getProperty("coordsys.dms."+language));
		ChoiceCoordSystem.addItem(props.getProperty("coordsys.dd."+language));
		ChoiceCoordSystem.addItem(props.getProperty("coordsys.ddm."+language));
		ChoiceCoordSystem.select(props.getProperty("coordsys.dd."+language));

		// Coordinate Source controls
		ChoiceCoordSource.removeAll();
		for(int i=0; i<canonicalsources.size(); i++){
			ChoiceCoordSource.addItem((String)canonicalsources.get(i));
		}
		ChoiceCoordSource.select("gazetteer");

		// Datum controls
		ChoiceDatum.removeAll();
		ChoiceDatum.addItem(props.getProperty("datum.notrecorded."+language));
		ChoiceDatum.addItem("(WGS84) World Geodetic System 1984");
		ChoiceDatum.addItem("(NAD83) North American 1983");
		ChoiceDatum.addItem("(NAD27) North American 1927");

		ChoiceDatum.addItem("Adindan");
		ChoiceDatum.addItem("Afgooye");
		ChoiceDatum.addItem("Ain el Abd 1970");
		ChoiceDatum.addItem("Airy 1830 ellipsoid");
		ChoiceDatum.addItem("American Samoa 1962");
		ChoiceDatum.addItem("Anna 1 Astro 1965");
		ChoiceDatum.addItem("Antigua Island Astro 1943");
		ChoiceDatum.addItem("Arc 1950");
		ChoiceDatum.addItem("Arc 1960");
		ChoiceDatum.addItem("Ascension Island 1958");
		ChoiceDatum.addItem("Astro Beacon 'E' 1945");
		ChoiceDatum.addItem("Astro DOS 71/4");
		ChoiceDatum.addItem("Astro Tern Island (FRIG) 1961");
		ChoiceDatum.addItem("Astronomic Station No. 1 1951");
		ChoiceDatum.addItem("Astronomic Station No. 2 1951, Truk Island");
		ChoiceDatum.addItem("Astronomic Station Ponape 1951");
		ChoiceDatum.addItem("Astronomical Station 1952");
		ChoiceDatum.addItem("(AGD66) Australian Geodetic 1966");
		ChoiceDatum.addItem("(AGD84) Australian Geodetic 1984");
		ChoiceDatum.addItem("Australian National ellipsoid");
		ChoiceDatum.addItem("Ayabelle Lighthouse");
		ChoiceDatum.addItem("Bekaa Valley 1920 (IGN)");
		ChoiceDatum.addItem("Bellevue (IGN)");
		ChoiceDatum.addItem("Bermuda 1957");
		ChoiceDatum.addItem("Bessel 1841 ellipsoid (Namibia)");
		ChoiceDatum.addItem("Bessel 1841 ellipsoid (non-Namibia)");
		ChoiceDatum.addItem("Bissau");
		ChoiceDatum.addItem("Bogota Observatory");
		ChoiceDatum.addItem("Bukit Rimpah");
		ChoiceDatum.addItem("Campo Inchauspe");
		ChoiceDatum.addItem("Canton Astro 1966");
		ChoiceDatum.addItem("Cape");
		ChoiceDatum.addItem("Cape Canaveral");
		ChoiceDatum.addItem("Carthage");
		ChoiceDatum.addItem("Chatham Island Astro 1971");
		ChoiceDatum.addItem("Chua Astro");
		ChoiceDatum.addItem("Clarke 1858 ellipsoid");
		ChoiceDatum.addItem("Clarke 1866 ellipsoid");
		ChoiceDatum.addItem("Clarke 1880 ellipsoid");
		ChoiceDatum.addItem("Co-Ordinate System 1937 of Estonia");
		ChoiceDatum.addItem("Corrego Alegre");
		ChoiceDatum.addItem("Dabola");
		ChoiceDatum.addItem("Deception Island");
		ChoiceDatum.addItem("Djakarta (Batavia)");
		ChoiceDatum.addItem("DOS 1968");
		ChoiceDatum.addItem("Easter Island 1967");

		ChoiceDatum.addItem("European 1950");
		ChoiceDatum.addItem("European 1979");

		ChoiceDatum.addItem("Everest ellipsoid (Brunei, Sabah, Sarawak)");
		ChoiceDatum.addItem("Everest India 1830 ellipsoid");
		ChoiceDatum.addItem("Everest India 1856 ellipsoid");
		ChoiceDatum.addItem("Everest Pakistan ellipsoid");
		ChoiceDatum.addItem("Everest ellipsoid (W. Malaysia, Singapore 1948)");
		ChoiceDatum.addItem("Everest W. Malaysia 1969 ellipsoid");

		ChoiceDatum.addItem("Fort Thomas 1955");
		ChoiceDatum.addItem("Gan 1970");
		ChoiceDatum.addItem("Geodetic Datum 1949");
		ChoiceDatum.addItem("Graciosa Base SW 1948");

		ChoiceDatum.addItem("GRS80 ellipsoid");

		ChoiceDatum.addItem("Guam 1963");
		ChoiceDatum.addItem("Gunung Segara");
		ChoiceDatum.addItem("GUX 1 Astro");

		ChoiceDatum.addItem("Helmert 1906 ellipsoid");

		ChoiceDatum.addItem("Hito XVIII 1963");
		ChoiceDatum.addItem("Hjorsey 1955");
		ChoiceDatum.addItem("Hong Kong 1963");

		ChoiceDatum.addItem("Hough 1960 ellipsoid");

		ChoiceDatum.addItem("Hu-Tzu-Shan");
		ChoiceDatum.addItem("Indian");
		ChoiceDatum.addItem("Indian 1954");
		ChoiceDatum.addItem("Indian 1960");
		ChoiceDatum.addItem("Indian 1975");
		ChoiceDatum.addItem("Indonesian 1974");

		ChoiceDatum.addItem("International 1924 ellipsoid");

		ChoiceDatum.addItem("Ireland 1965");
		ChoiceDatum.addItem("ISTS 061 Astro 1968");
		ChoiceDatum.addItem("ISTS 073 Astro 1969");
		ChoiceDatum.addItem("Japanese Geodetic Datum 2000");
		ChoiceDatum.addItem("Johnston Island 1961");
		ChoiceDatum.addItem("Kandawala");
		ChoiceDatum.addItem("Kapingamarangi Astronomic Station No. 3 1951");
		ChoiceDatum.addItem("Kerguelen Island 1949");
		ChoiceDatum.addItem("Kertau 1948");
		ChoiceDatum.addItem("Korean Geodetic System 1995");

		ChoiceDatum.addItem("Krassovsky 1940 ellipsoid");

		ChoiceDatum.addItem("Kusaie Astro 1951");
		ChoiceDatum.addItem("L.C. 5 Astro 1961");
		ChoiceDatum.addItem("Leigon");
		ChoiceDatum.addItem("Lemuta");
		ChoiceDatum.addItem("Liberia 1964");
		ChoiceDatum.addItem("Luzon");
		ChoiceDatum.addItem("Mahe 1971");
		ChoiceDatum.addItem("Massawa");
		ChoiceDatum.addItem("Merchich");
		ChoiceDatum.addItem("Midway Astro 1961");
		ChoiceDatum.addItem("Minna");

		ChoiceDatum.addItem("Modified Airy ellipsoid");
		ChoiceDatum.addItem("Modified Fischer 1960 ellipsoid");

		ChoiceDatum.addItem("Montserrat Island Astro 1958");
		ChoiceDatum.addItem("M'Poraloko");
		ChoiceDatum.addItem("Nahrwan");
		ChoiceDatum.addItem("Naparima, BWI");
		ChoiceDatum.addItem("Naparima 1972");
		ChoiceDatum.addItem("North Sahara 1959");
		ChoiceDatum.addItem("Observatorio Meteorologico 1939");
		ChoiceDatum.addItem("Ocotepeque 1935");
		ChoiceDatum.addItem("Old Egyptian 1907");
		ChoiceDatum.addItem("Old Hawaiian, Clarke 1866");
		ChoiceDatum.addItem("Old Hawaiian, International 1924");
		ChoiceDatum.addItem("Old Trinidad 1903");
		ChoiceDatum.addItem("Oman");
		ChoiceDatum.addItem("Ordnance Survey of Great Britain 1936");
		ChoiceDatum.addItem("Pico de las Nieves");
		ChoiceDatum.addItem("Pitcairn Astro 1967");
		ChoiceDatum.addItem("Point 58");
		ChoiceDatum.addItem("Point Noire 1958");
		ChoiceDatum.addItem("Porto Santo 1936");
		ChoiceDatum.addItem("Provisional South American 1956");
		ChoiceDatum.addItem("Provisional South Chilean 1963");
		ChoiceDatum.addItem("Puerto Rico");
		ChoiceDatum.addItem("Qatar National");
		ChoiceDatum.addItem("Qornoq");
		ChoiceDatum.addItem("Reunion");
		ChoiceDatum.addItem("Rome 1940");
		ChoiceDatum.addItem("S-42 (Pulkovo 1942)");
		ChoiceDatum.addItem("S-JTSK");
		ChoiceDatum.addItem("Santo (DOS) 1965");
		ChoiceDatum.addItem("Sao Braz");
		ChoiceDatum.addItem("Sapper Hill 1943");

		ChoiceDatum.addItem("Schwarzeck");
		ChoiceDatum.addItem("Selvagem Grande 1938");
		ChoiceDatum.addItem("Sierra Leone 1960");
		ChoiceDatum.addItem("South American 1969");
		ChoiceDatum.addItem("SIRGAS - South American Geocentric Reference System");
		ChoiceDatum.addItem("South Asia");
		ChoiceDatum.addItem("Tananarive Observatory 1925");
		ChoiceDatum.addItem("Timbalai 1948");
		ChoiceDatum.addItem("Tokyo");
		ChoiceDatum.addItem("Tristan Astro 1968");
		ChoiceDatum.addItem("Viti Levu 1916");
		ChoiceDatum.addItem("Voirol 1874");
		ChoiceDatum.addItem("Voirol 1960");
		ChoiceDatum.addItem("Wake-Eniwetok 1960");
		ChoiceDatum.addItem("Wake Island Astro 1952");
		ChoiceDatum.addItem("(WGS66) World Geodetic System 1966");
		ChoiceDatum.addItem("(WGS72) World Geodetic System 1972");
		ChoiceDatum.addItem("Yacare");
		ChoiceDatum.addItem("Zanderij");
		ChoiceDatum.select(props.getProperty("datum.notrecorded."+language));


		// Distance Precision controls
		populateDistancePrecision("km");

		// Direction Precision controls
		ChoiceDirection.removeAll();
		ChoiceDirection.addItem(props.getProperty("headings.nearestdegree."+language));
		ChoiceDirection.addItem(props.getProperty("headings.n."+language));
		ChoiceDirection.addItem(props.getProperty("headings.e."+language));
		ChoiceDirection.addItem(props.getProperty("headings.s."+language));
		ChoiceDirection.addItem(props.getProperty("headings.w."+language));
		ChoiceDirection.addItem(props.getProperty("headings.ne."+language));
		ChoiceDirection.addItem(props.getProperty("headings.se."+language));
		ChoiceDirection.addItem(props.getProperty("headings.sw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nne."+language));
		ChoiceDirection.addItem(props.getProperty("headings.ene."+language));
		ChoiceDirection.addItem(props.getProperty("headings.ese."+language));
		ChoiceDirection.addItem(props.getProperty("headings.sse."+language));
		ChoiceDirection.addItem(props.getProperty("headings.ssw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.wsw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.wnw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nnw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nbe."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nebn."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nebe."+language));
		ChoiceDirection.addItem(props.getProperty("headings.ebn."+language));
		ChoiceDirection.addItem(props.getProperty("headings.ebs."+language));
		ChoiceDirection.addItem(props.getProperty("headings.sebe."+language));
		ChoiceDirection.addItem(props.getProperty("headings.sebs."+language));
		ChoiceDirection.addItem(props.getProperty("headings.sbe."+language));
		ChoiceDirection.addItem(props.getProperty("headings.sbw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.swbs."+language));
		ChoiceDirection.addItem(props.getProperty("headings.swbw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.wbs."+language));
		ChoiceDirection.addItem(props.getProperty("headings.wbn."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nwbw."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nwbn."+language));
		ChoiceDirection.addItem(props.getProperty("headings.nbw."+language));
		ChoiceDirection.select(props.getProperty("headings.n."+language));

		// Distance Units controls
		ChoiceDistUnits.removeAll();
		ChoiceDistUnits.addItem("km");
		ChoiceDistUnits.addItem("m");
		ChoiceDistUnits.addItem("mi");
		ChoiceDistUnits.addItem("yds");
		ChoiceDistUnits.addItem("ft");
		ChoiceDistUnits.addItem("nm");
		ChoiceDistUnits.select("km");

		ChoiceFromDistUnits.removeAll();
		ChoiceFromDistUnits.addItem("km");
		ChoiceFromDistUnits.addItem("m");
		ChoiceFromDistUnits.addItem("mi");
		ChoiceFromDistUnits.addItem("yds");
		ChoiceFromDistUnits.addItem("ft");
		ChoiceFromDistUnits.addItem("nm");
		ChoiceFromDistUnits.select("km");

		ChoiceToDistUnits.removeAll();
		ChoiceToDistUnits.addItem("km");
		ChoiceToDistUnits.addItem("m");
		ChoiceToDistUnits.addItem("mi");
		ChoiceToDistUnits.addItem("yds");
		ChoiceToDistUnits.addItem("ft");
		ChoiceToDistUnits.addItem("nm");
		ChoiceToDistUnits.select("km");

		ChoiceScaleFromDistUnits.removeAll();
		ChoiceScaleFromDistUnits.addItem("mm");
		ChoiceScaleFromDistUnits.addItem("cm");
		ChoiceScaleFromDistUnits.addItem("in");
		ChoiceScaleFromDistUnits.select("mm");

		ChoiceScale.removeAll();
		ChoiceScale.addItem("1:1000");
		ChoiceScale.addItem("1:1200");
		ChoiceScale.addItem("1:2000");
		ChoiceScale.addItem("1:2400");
		ChoiceScale.addItem("1:2500");
		ChoiceScale.addItem("1:4800");
		ChoiceScale.addItem("1:5000");
		ChoiceScale.addItem("1:9600");
		ChoiceScale.addItem("1:10000");
		ChoiceScale.addItem("1:12000");
		ChoiceScale.addItem("1:20000");
		ChoiceScale.addItem("1:24000");
		ChoiceScale.addItem("1:25000");
		ChoiceScale.addItem("1:32500");
		ChoiceScale.addItem("1:40000");
		ChoiceScale.addItem("1:50000");
		ChoiceScale.addItem("1:60000");
		ChoiceScale.addItem("1:62500");
		ChoiceScale.addItem("1:63600");
		ChoiceScale.addItem("1:80000");
		ChoiceScale.addItem("1:100000");
		ChoiceScale.addItem("1:120000");
		ChoiceScale.addItem("1:125000");
		ChoiceScale.addItem("1:150000");
		ChoiceScale.addItem("1:180000");
		ChoiceScale.addItem("1:200000");
		ChoiceScale.addItem("1:250000");
		ChoiceScale.addItem("1:500000");
		ChoiceScale.addItem("1:1000000");
		ChoiceScale.addItem("1:1500000");
		ChoiceScale.addItem("1:2500000");
		ChoiceScale.addItem("1:3000000");
		ChoiceScale.select("1:24000");

		ChoiceScaleToDistUnits.removeAll();
		ChoiceScaleToDistUnits.addItem("km");
		ChoiceScaleToDistUnits.addItem("m");
		ChoiceScaleToDistUnits.addItem("mi");
		ChoiceScaleToDistUnits.addItem("yds");
		ChoiceScaleToDistUnits.addItem("ft");
		ChoiceScaleToDistUnits.addItem("nm");
		ChoiceScaleToDistUnits.select("km");

		// Lat/Long Direction controls
		ChoiceLatDirMM.removeAll();
		ChoiceLatDirMM.addItem(props.getProperty("headings.n."+language));
		ChoiceLatDirMM.addItem(props.getProperty("headings.s."+language));
//		ChoiceLatDirMM.addItem("N");
//		ChoiceLatDirMM.addItem("S");

		ChoiceLongDirMM.removeAll();
		ChoiceLongDirMM.addItem(props.getProperty("headings.w."+language));
		ChoiceLongDirMM.addItem(props.getProperty("headings.e."+language));
//		ChoiceLongDirMM.addItem("W");
//		ChoiceLongDirMM.addItem("E");

		ChoiceLatDirDMS.removeAll();
		ChoiceLatDirDMS.addItem(props.getProperty("headings.n."+language));
		ChoiceLatDirDMS.addItem(props.getProperty("headings.s."+language));
//		ChoiceLatDirDMS.addItem("N");
//		ChoiceLatDirDMS.addItem("S");

		ChoiceLongDirDMS.removeAll();
		ChoiceLongDirDMS.addItem(props.getProperty("headings.w."+language));
		ChoiceLongDirDMS.addItem(props.getProperty("headings.e."+language));
//		ChoiceLongDirDMS.addItem("W");
//		ChoiceLongDirDMS.addItem("E");

		// Offset Direction Controls
		ChoiceOffsetNSDir.removeAll();
		ChoiceOffsetNSDir.addItem(props.getProperty("headings.n."+language));
		ChoiceOffsetNSDir.addItem(props.getProperty("headings.s."+language));
		ChoiceOffsetEWDir.removeAll();
		ChoiceOffsetEWDir.addItem(props.getProperty("headings.w."+language));
		ChoiceOffsetEWDir.addItem(props.getProperty("headings.e."+language));
//		ChoiceOffsetNSDir.addItem("N");
//		ChoiceOffsetNSDir.addItem("S");
//		ChoiceOffsetEWDir.addItem("W");
//		ChoiceOffsetEWDir.addItem("E");
	}

	private int readDatumError(){
		int error = 1000; // 1 km error if file can't be read properly
		long col = Math.round( 5*(decimallongitude+179.48) );
		long row = Math.round( 5*(84.69-decimallatitude) );
		error = (int)datumErrorInst.datumerror[(int)col][(int)row];
		return error;
	}

	private void showCoordinatePrecision( boolean b ){
		PanelCoordPrecision.setVisible(b);
	}

	private void showCoordinates( boolean b ){
		PanelCoords.setVisible(b);
	}

	private void showCoordinateSource( boolean b ){
		ChoiceCoordSource.setVisible(b);
		LabelCoordSource.setVisible(b);
	}

	private void showCoordinateSystem( boolean b ){
		ChoiceCoordSystem.setVisible(b);
		LabelCoordSystem.setVisible(b);
	}

	private void showDecimalDegrees( boolean b ){
		PanelDecLatLong.setVisible(b);
	}

	private void showDegreesDecimalMinutes( boolean b ){
		PanelDecMin.setVisible(b);
	}

	private void showDirection( boolean b ){
		String value = (String)ChoiceDirection.getSelectedItem();
		ChoiceDirection.setVisible(b);
		LabelDirection.setVisible(b);
		if( b && value.equals(props.getProperty("headings.nearestdegree."+language)) ){
//			if( b && value.equals("nearest degree") ){
			TextFieldHeading.setVisible(true);
		} else {
			TextFieldHeading.setVisible(false);
		}
	}

	private void showDirectionPrecision( boolean b ){
		ChoiceDirection.setVisible(b);
		LabelDirection.setVisible(b);
		TextFieldHeading.setVisible(false);
	}

	private void showDistancePrecision( boolean b ){
		ChoiceDistancePrecision.setVisible(b);
		LabelDistancePrecision.setVisible(b);
	}

	private void showDistanceUnits( boolean b ){
		ChoiceDistUnits.setVisible(b);
		LabelDistUnits.setVisible(b);
	}

	private void showDistanceConverter( boolean b ){
		ChoiceFromDistUnits.setVisible(b);
		ChoiceToDistUnits.setVisible(b);
//		LabelFromDistUnits.setVisible(b);
//		LabelToDistUnits.setVisible(b);
		LabelEquals.setVisible(b);
		LabelDistanceConverter.setVisible(b);
		TextFieldFromDistance.setVisible(b);
		TextFieldToDistance.setVisible(b);
	}

	private void showScaleConverter( boolean b ){
		ChoiceScaleFromDistUnits.setVisible(b);
		ChoiceScaleToDistUnits.setVisible(b);
		ChoiceScale.setVisible(b);
		LabelScaleEquals.setVisible(b);
		LabelScaleConverter.setVisible(b);
		TextFieldScaleFromDistance.setVisible(b);
		TextFieldScaleToDistance.setVisible(b);
	}

	private void showDMS( boolean b ){
		PanelDDMMSS.setVisible(b);
	}

	private void showEWOffset( boolean b ){
		TextFieldOffsetEW.setVisible(b);
		LabelOffsetEW.setText(props.getProperty("label.distew."+language));
//		LabelOffsetEW.setText("East or West Offset Distance");
		LabelOffsetEW.setVisible(b);
		ChoiceOffsetEWDir.setVisible(b);
	}

	private void showExtents( boolean b ){
		LabelExtent.setVisible(b);
		TextFieldExtent.setVisible(b);
	}

	private void showMeasurementError( boolean b ){
		LabelMeasurementError.setVisible(b);
		TextFieldMeasurementError.setVisible(b);
	}

	private void showErrors( boolean b ){
		LabelCalcMaxError.setVisible(b);
// TODO: check this commented out.		TextFieldExtent.setVisible(b);
		TextFieldCalcErrorDist.setVisible(b);
		TextFieldCalcErrorUnits.setVisible(b);
		TextFieldFullResult.setVisible(b);
	}

	private void showNSOffset( boolean b ){
		TextFieldOffset.setVisible(b);
		LabelOffset.setText(props.getProperty("label.distns."+language));
//		LabelOffset.setText("North or South Offset Distance");
		LabelOffset.setVisible(b);
		ChoiceOffsetNSDir.setVisible(b);
	}

	private void showOffset( boolean b ){
		TextFieldOffsetEW.setVisible(b);
		LabelOffsetEW.setText(props.getProperty("label.offset."+language));
//		LabelOffsetEW.setText("Offset Distance");
		LabelOffsetEW.setVisible(b);
	}

	private void showRelevantCoordinates(){
		String value = (String)ChoiceCoordSystem.getSelectedItem();
		int index = canonicalcoordsystems.indexOf(value);

		if ( index==0 ){
//			if ( value.equals("decimal degrees") ){
			showDMS(false);
			showDegreesDecimalMinutes(false);
			showDecimalDegrees(true);
		} else if ( index==1 ){
//			} else if ( value.equals("degrees minutes seconds") ){
			showDecimalDegrees(false);
			showDegreesDecimalMinutes(false);
			showDMS(true);
		} else if ( index==2 ){
//			} else if ( value.equals("degrees decimal minutes") ){
			showDecimalDegrees(false);
			showDMS(false);
			showDegreesDecimalMinutes(true);
		}
		showCoordinates(true);
	}

	private void showResults( boolean b ){
		PanelResults.setVisible(b);
	}

	private boolean testHeadingLimits() throws ParseException{
		boolean testpasses = true;
		String s = null;
		double d = 0;
		Number num = null;

		s = TextFieldHeading.getText();
		if( s == null || s.length() == 0 ){
			TextFieldHeading.setText("0");
		} else { // test input within limits and valid
			try{
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				if( d < 0 || d >= 360 ){
					testpasses = false;
					errorDialog(props.getProperty("error.heading.message."+language), 						props.getProperty("error.heading.title."+language), 0);
//					errorDialog("The heading must be a value between 0 (North) and 360.", "Heading Input Error", 0);
					TextFieldHeading.setText("0");
				}
			}catch(NumberFormatException e){
				testpasses = false;
				errorDialog(props.getProperty("error.heading.message."+language), props.getProperty("error.heading.title."+language), 0);
//				errorDialog("The heading must be a value between 0 (North) and 360.", "Heading Input Error", 0);
				TextFieldHeading.setText("0");
			}
		}
		return testpasses;
	}

	private boolean testLatLongLimits() throws ParseException{
		boolean testpasses = true;
		double d = 0;
		int i = 0;
		String s = null;
		Number num = null;
		if( txtT2Dec_Lat.isVisible() ){
			s = txtT2Dec_Lat.getText();
			if( s == null || s.length() == 0 ){
				txtT2Dec_Lat.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					if( d < -90.0 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lat.message."+language), 							props.getProperty("error.lat.title."+language), 0);
//						errorDialog("The latitude must be a between -90 (South Pole) and 90 (North Pole).", "Coordinate Input Error", 0);
						decimallatitude = -90;
						txtT2Dec_Lat.setText("-90");
					} else if( d > 90 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lat.message."+language), 							props.getProperty("error.lat.title."+language), 0);
//						errorDialog("The latitude must be a between -90 (South Pole) and 90 (North Pole).", "Coordinate Input Error", 0);
						decimallatitude = 90;
						txtT2Dec_Lat.setText("90");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.lat.message."+language), props.getProperty("error.lat.title."+language), 0);
//					errorDialog("The latitude must be a between -90 (South Pole) and 90 (North Pole).", "Coordinate Input Error", 0);
					decimallatitude = 0;
					txtT2Dec_Lat.setText("0");
				}
			}
		}

		if( txtT2Dec_Long.isVisible() ){
			s = txtT2Dec_Long.getText();
			if( s == null || s.length() == 0 ){
				txtT2Dec_Long.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					if( d < -180 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lon.message."+language), 							props.getProperty("error.lon.title."+language), 0);
//						errorDialog("The longitude must be a between -180 and 180.", "Coordinate Input Error", 0);
						decimallongitude = -180;
						txtT2Dec_Long.setText("-180");
					} else if( d > 180 ){
						decimallongitude = 180;
						errorDialog(props.getProperty("error.lon.message."+language), 							props.getProperty("error.lon.title."+language), 0);
//						errorDialog("The longitude must be a between -180 and 180.", "Coordinate Input Error", 0);
						txtT2Dec_Long.setText("180");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					decimallongitude = 0;
					errorDialog(props.getProperty("error.lon.message."+language), props.getProperty("error.lon.title."+language), 0);
//					errorDialog("The longitude must be a between -180 and 180.", "Coordinate Input Error", 0);
					txtT2Dec_Long.setText("0");
				}
			}
		}

		if( txtT7Lat_DegDMS.isVisible() ){
			s = txtT7Lat_DegDMS.getText();
			if( s == null || s.length() == 0 ){
				txtT7Lat_DegDMS.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					i = num.intValue();
					if( i < 0 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lat.message."+language), 							props.getProperty("error.lat.title."+language), 0);
//						errorDialog("The latitude must be a between 0 and 90.", "Coordinate Input Error", 0);
						txtT7Lat_DegDMS.setText("0");
					} else if( i > 90 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lat.message."+language), 							props.getProperty("error.lat.title."+language), 0);
//						errorDialog("The latitude must be a between 0 and 90.", "Coordinate Input Error", 0);
						decimallatitude = 90;
						txtT7Lat_DegDMS.setText("90");
						txtT7Lat_MinDMS.setText("0");
						txtT7Lat_Sec.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.lat.message."+language), props.getProperty("error.lat.title."+language), 0);
//					errorDialog("The latitude must be a between 0 and 90.", "Coordinate Input Error", 0);
					txtT7Lat_DegDMS.setText("0");
				}
			}
		}

		if( txtT7Long_DegDMS.isVisible() ){
			s = txtT7Long_DegDMS.getText();
			if( s == null || s.length() == 0 ){
				txtT7Long_DegDMS.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					i = num.intValue();
					if( i < 0 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lon.message."+language), 							props.getProperty("error.lon.title."+language), 0);
//						errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
						txtT7Long_DegDMS.setText("0");
					} else if( i > 180 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lon.message."+language), 							props.getProperty("error.lon.title."+language), 0);
//						errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
						txtT7Long_DegDMS.setText("180");
						txtT7Long_MinDMS.setText("0");
						txtT7Long_Sec.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.lon.message."+language), props.getProperty("error.lon.title."+language), 0);
//					errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
					txtT7Long_DegDMS.setText("0");
				}
			}
		}

		if( txtT7Lat_DegMM.isVisible() ){
			s = txtT7Lat_DegMM.getText();
			if( s == null || s.length() == 0 ){
				txtT7Lat_DegMM.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					i = num.intValue();
					if( i < 0 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lat.message."+language), 							props.getProperty("error.lat.title."+language), 0);
//						errorDialog("The latitude must be a between 0 and 90.", "Coordinate Input Error", 0);
						txtT7Lat_DegMM.setText("0");
					} else if( i > 90 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lat.message."+language), 							props.getProperty("error.lat.title."+language), 0);
//						errorDialog("The latitude must be a between 0 and 90.", "Coordinate Input Error", 0);
						txtT7Lat_DegMM.setText("90");
						txtT7Lat_MinMM.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.lat.message."+language), props.getProperty("error.lat.title."+language), 0);
//					errorDialog("The latitude must be a between 0 and 90.", "Coordinate Input Error", 0);
					txtT7Lat_DegMM.setText("0");
				}
			}
		}

		if( txtT7Long_DegMM.isVisible() ){
			s = txtT7Long_DegMM.getText();
			if( s == null || s.length() == 0 ){
				txtT7Long_DegMM.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					i = num.intValue();
					if( i < 0 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lon.message."+language), 							props.getProperty("error.lon.title."+language), 0);
//						errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
						txtT7Long_DegMM.setText("0");
					} else if( i > 180 ){
						testpasses = false;
						errorDialog(props.getProperty("error.lon.message."+language), 							props.getProperty("error.lon.title."+language), 0);
//						errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
						txtT7Long_DegMM.setText("180");
						txtT7Long_MinMM.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.lon.message."+language), props.getProperty("error.lon.title."+language), 0);
//					errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
					txtT7Long_DegMM.setText("0");
				}
			}
		}

		if( txtT7Lat_MinDMS.isVisible() ){
			s = txtT7Lat_MinDMS.getText();
			if( s == null || s.length() == 0 ){
				txtT7Lat_MinDMS.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					i = num.intValue();
					if( i < 0 || i >= 60 ){
						testpasses = false;
						errorDialog(props.getProperty("error.min.message."+language), 							props.getProperty("error.min.title."+language), 0);
//						errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
						txtT7Lat_MinDMS.setText("0");
						txtT7Lat_Sec.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.lon.message."+language), props.getProperty("error.lon.title."+language), 0);
//					errorDialog("The longitude must be a between 0 and 180.", "Coordinate Input Error", 0);
					txtT7Long_DegMM.setText("0");
				}
			}
		}

		if( txtT7Long_MinDMS.isVisible() ){
			s = txtT7Long_MinDMS.getText();
			if( s == null || s.length() == 0 ){
				txtT7Long_MinDMS.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					i = num.intValue();
					if( i < 0 || i >= 60 ){
						testpasses = false;
						errorDialog(props.getProperty("error.min.message."+language), 							props.getProperty("error.min.title."+language), 0);
//						errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
						txtT7Long_MinDMS.setText("0");
						txtT7Long_Sec.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.min.message."+language), props.getProperty("error.min.title."+language), 0);
//					errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
					txtT7Long_MinDMS.setText("0");
					txtT7Long_Sec.setText("0");
				}
			}
		}

		if( txtT7Lat_MinMM.isVisible() ){
			s = txtT7Lat_MinMM.getText();
			if( s == null || s.length() == 0 ){
				txtT7Lat_MinMM.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					if( d < 0 || d >= 60 ){
						testpasses = false;
						errorDialog(props.getProperty("error.min.message."+language), 							props.getProperty("error.min.title."+language), 0);
//						errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
						txtT7Lat_MinMM.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.min.message."+language), props.getProperty("error.min.title."+language), 0);
//					errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
					txtT7Lat_MinMM.setText("0");
				}
			}
		}

		if( txtT7Long_MinMM.isVisible() ){
			s = txtT7Long_MinMM.getText();
			if( s == null || s.length() == 0 ){
				txtT7Long_MinMM.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					if( d < 0 || d >= 60 ){
						testpasses = false;
						errorDialog(props.getProperty("error.min.message."+language), 							props.getProperty("error.min.title."+language), 0);
//						errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
						txtT7Long_MinMM.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.min.message."+language), props.getProperty("error.min.title."+language), 0);
//					errorDialog("The minutes must be a between 0 and 60.", "Coordinate Input Error", 0);
					txtT7Long_MinMM.setText("0");
				}
			}
		}

		if( txtT7Lat_Sec.isVisible() ){
			s = txtT7Lat_Sec.getText();
			if( s == null || s.length() == 0 ){
				txtT7Lat_Sec.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					if( d < 0 || d >= 60 ){
						testpasses = false;
						errorDialog(props.getProperty("error.sec.message."+language), 							props.getProperty("error.sec.title."+language), 0);
//						errorDialog("The seconds must be a between 0 and 60.", "Coordinate Input Error", 0);
						txtT7Lat_Sec.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.sec.message."+language), props.getProperty("error.sec.title."+language), 0);
//					errorDialog("The seconds must be a between 0 and 60.", "Coordinate Input Error", 0);
					txtT7Lat_Sec.setText("0");
				}
			}
		}

		if( txtT7Long_Sec.isVisible() ){
			s = txtT7Long_Sec.getText();
			if( s == null || s.length() == 0 ){
				txtT7Long_Sec.setText("0");
			} else { // test input within limits and valid
				try{
					num = numberFormatter.parse(s.trim());
					d = num.doubleValue();
					if( d < 0 || d >= 60 ){
						testpasses = false;
						errorDialog(props.getProperty("error.sec.message."+language), 							props.getProperty("error.sec.title."+language), 0);
//						errorDialog("The seconds must be a between 0 and 60.", "Coordinate Input Error", 0);
						txtT7Long_Sec.setText("0");
					}
				} catch(NumberFormatException e){
					testpasses = false;
					errorDialog(props.getProperty("error.sec.message."+language), props.getProperty("error.sec.title."+language), 0);
//					errorDialog("The seconds must be a between 0 and 60.", "Coordinate Input Error", 0);
					txtT7Long_Sec.setText("0");
				}
			}
		}
		return testpasses;
	}

	private boolean testOffsetLimits() throws ParseException{
		boolean testpasses = true;
		String s = null;
		double d = 0;
		Number num = null;

		s = TextFieldOffset.getText();
		if( s == null || s.length() == 0 ){
			TextFieldOffset.setText("0");
		} else {
			try{
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				if( d < 0 ){
					testpasses = false;
					errorDialog(props.getProperty("error.offset.message."+language), 						props.getProperty("error.offset.title."+language), 0);
//					errorDialog("The offset must be a non-negative value.", "Offset Input Error", 0);
					TextFieldOffset.setText("0");
				}
			} catch(NumberFormatException e){
				testpasses = false;
				errorDialog(props.getProperty("error.offset.message."+language), props.getProperty("error.offset.title."+language), 0);
//				errorDialog("The offset must be a non-negative value.", "Offset Input Error", 0);
				TextFieldOffset.setText("0");
			}
		}

		s = TextFieldOffsetEW.getText();
		if( s == null || s.length() == 0 ){
			TextFieldOffsetEW.setText("0");
		} else {
			try{
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				if( d < 0 ){
					testpasses = false;
					errorDialog(props.getProperty("error.offset.message."+language), 												props.getProperty("error.offset.title."+language), 0);
//					errorDialog("The offset must be a non-negative value.", "Offset Input Error", 0);
					TextFieldOffsetEW.setText("0");
				}
			} catch(NumberFormatException e){
				testpasses = false;
				errorDialog(props.getProperty("error.offset.message."+language), props.getProperty("error.offset.title."+language), 0);
//				errorDialog("The offset must be a non-negative value.", "Offset Input Error", 0);
				TextFieldOffsetEW.setText("0");
			}
		}

		s = TextFieldExtent.getText();
		if( s == null || s.length() == 0 ){
			TextFieldExtent.setText("0");
		} else { // test input within limits and valid
			try{
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				if( d < 0 ){
					testpasses = false;
					errorDialog(props.getProperty("error.extent.message."+language), 												props.getProperty("error.extent.title."+language), 0);
//					errorDialog("The extent must be a non-negative value.", "Extent Input Error", 0);
					TextFieldExtent.setText("0");
				}
			} catch(NumberFormatException e){
				testpasses = false;
				errorDialog(props.getProperty("error.extent.message."+language), props.getProperty("error.offset.extent."+language), 0);
//				errorDialog("The extent must be a non-negative value.", "Extent Input Error", 0);
				TextFieldExtent.setText("0");
			}
		}

		s = TextFieldMeasurementError.getText();
		if( s == null || s.length() == 0 ){
			TextFieldMeasurementError.setText("0");
		} else { // test input within limits and valid
			try{
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
				if( d < 0 ){
					testpasses = false;
					errorDialog(props.getProperty("error.measurementerror.message."+language), 												props.getProperty("error.measurementerror.title."+language), 0);
//					errorDialog("The measurement error must be a non-negative value.", "Measurement Input Error", 0);
					TextFieldMeasurementError.setText("0");
				}
			} catch(NumberFormatException e){
				testpasses = false;
				errorDialog(props.getProperty("error.measurementerror.message."+language), 					props.getProperty("error.measurement.title."+language), 0);
//				errorDialog("The measurement error must be a non-negative value.", "Measurement Input Error", 0);
				TextFieldMeasurementError.setText("0");
			}
		}
		return testpasses;
	}

	private boolean testParameterLimits() throws ParseException{
		boolean testspass = testLatLongLimits();
		testspass &= testHeadingLimits();
		testspass &= testOffsetLimits();
		return testspass;
	}

	private void testResultCoordinates() {
		if( newdecimallatitude > 90.0 ) newdecimallatitude = 90.0;
		if( newdecimallatitude < -90.0 ) newdecimallatitude = -90.0;
		if( newdecimallatitude == 90.0 || newdecimallatitude == -90.0 ){
			newdecimallongitude = decimallongitude;
		} else {
			while( newdecimallongitude > 180.0 ){
				newdecimallatitude -= 360.0;
			}
			while( newdecimallongitude < -180.0 ){
				newdecimallongitude += 360.0;
			}
		}
	}

	void TextFieldFromDistance_focusGained(){
		convertDistance();
	}

	void TextFieldToDistance_focusGained(){
		convertDistance();
	}

	void TextFieldScaleFromDistance_focusGained(){
		convertScale();
	}
	void TextFieldScaleToDistance_focusGained(){
		convertScale();
	}

	void TextFieldExtent_focusGained(){
		clearResults();
	}

	void TextFieldMeasurementError_focusGained(){
		clearResults();
	}

	void TextFieldHeading_focusGained(){
		clearResults();
	}

	void TextFieldOffset_focusGained(){
		clearResults();
	}

	void TextFieldOffsetEW_focusGained(){
		clearResults();
	}

	private void translateCoords() throws ParseException{
		double ddeclat = 0;
		double ddeclong = 0;
		Number num = null;
		String s = null;

		if( lastcoordsystem == 1 ){ // was decimal degrees
			s = txtT2Dec_Lat.getText();
			if( s == null || s.length() == 0 ){
				ddeclat = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				ddeclat = num.doubleValue();
			}
			decimallatitude = ddeclat;
			getDMSFromDecDegrees( decimallatitude );

			txtT7Lat_DegDMS.setText( formatDeg.format(degrees) );
			txtT7Lat_DegMM.setText( formatDeg.format(degrees) );
			txtT7Lat_MinDMS.setText( formatMin.format(minutes) );
			txtT7Lat_Sec.setText( formatSec.format(seconds) );
			if( decimallatitude >= 0 ) {
				ChoiceLatDirDMS.select(props.getProperty("headings.n."+language));
				ChoiceLatDirMM.select(props.getProperty("headings.n."+language));
//				ChoiceLatDirDMS.select("N");
//				ChoiceLatDirMM.select("N");
			} else {
				ChoiceLatDirDMS.select(props.getProperty("headings.s."+language));
				ChoiceLatDirMM.select(props.getProperty("headings.s."+language));
//				ChoiceLatDirDMS.select("S");
//				ChoiceLatDirMM.select("S");
			}

			double dmins = getDecimalMinutesFromMS( minutes, seconds );
			txtT7Lat_MinMM.setText( formatMinMM.format(dmins) );

			s = txtT2Dec_Long.getText();
			if( s == null || s.length() == 0 ){
				ddeclong = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				ddeclong = num.doubleValue();
			}

			decimallongitude = ddeclong;
			getDMSFromDecDegrees( decimallongitude );
			txtT7Long_DegDMS.setText( formatDeg.format(degrees) );
			txtT7Long_DegMM.setText( formatDeg.format(degrees) );
			txtT7Long_MinDMS.setText( formatMin.format(minutes) );
			txtT7Long_Sec.setText( formatSec.format(seconds) );
			if( decimallongitude >= 0 ) {
				ChoiceLongDirDMS.select(props.getProperty("headings.e."+language));
				ChoiceLongDirMM.select(props.getProperty("headings.e."+language));
//				ChoiceLongDirDMS.select("E");
//				ChoiceLongDirMM.select("E");
			} else {
				ChoiceLongDirDMS.select(props.getProperty("headings.w."+language));
				ChoiceLongDirMM.select(props.getProperty("headings.w."+language));
//				ChoiceLongDirDMS.select("W");
//				ChoiceLongDirMM.select("W");
			}

			dmins = getDecimalMinutesFromMS( minutes, seconds );
			txtT7Long_MinMM.setText( formatMinMM.format(dmins) );
		} else if( lastcoordsystem == 2 ){ // was degrees minutes seconds
			num = numberFormatter.parse(txtT7Lat_DegDMS.getText());
			degrees = num.intValue();
			num = numberFormatter.parse(txtT7Lat_MinDMS.getText());
			minutes = num.intValue();

//			degrees = Integer.parseInt( txtT7Lat_DegDMS.getText() );
//			minutes = Integer.parseInt( txtT7Lat_MinDMS.getText() );

			double d = 0;
			s = txtT7Lat_Sec.getText();
			if( s == null || s.length() == 0 ){
				d = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
			}
			seconds = d;

			decimallatitude = Math.abs( getDecimalDegreesFromDMS(degrees, minutes, seconds) );

			String SLatDirDMS = (String)ChoiceLatDirDMS.getSelectedItem();
			if( SLatDirDMS.equals(props.getProperty("headings.s."+language)) ){
				decimallatitude *= -1.0;
			}
			txtT2Dec_Lat.setText( formatDec.format(decimallatitude) );

			txtT7Lat_DegMM.setText( formatDeg.format(degrees) );
			decminutes = getDecimalMinutesFromMS( minutes, seconds );
			txtT7Lat_MinMM.setText( formatMinMM.format(decminutes) );

			num = numberFormatter.parse(txtT7Long_DegDMS.getText());
			degrees = num.intValue();
			num = numberFormatter.parse(txtT7Long_MinDMS.getText());
			minutes = num.intValue();

//			degrees = Integer.parseInt( txtT7Long_DegDMS.getText() );
//			minutes = Integer.parseInt( txtT7Long_MinDMS.getText() );
			s = txtT7Long_Sec.getText();
			if( s == null || s.length() == 0 ){
				d = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				d = num.doubleValue();
			}
			seconds = d;

			decimallongitude = Math.abs( getDecimalDegreesFromDMS(degrees, minutes, seconds) );
			String SLongDirDMS = (String)ChoiceLongDirDMS.getSelectedItem();
			if( SLongDirDMS.equals(props.getProperty("headings.w."+language)) ){
				decimallongitude *= -1;
			}
			txtT2Dec_Long.setText( formatDec.format(decimallongitude) );

			txtT7Long_DegMM.setText( formatDeg.format(degrees) );
			decminutes = getDecimalMinutesFromMS( minutes, seconds );
			txtT7Long_MinMM.setText( formatMinMM.format(decminutes) );
		} else if( lastcoordsystem == 3 ){ // was degrees decimal minutes
			num = numberFormatter.parse(txtT7Lat_DegMM.getText());
			degrees = num.intValue();

//			degrees = Integer.parseInt( txtT7Lat_DegMM.getText() );
			double m = 0;
			s = txtT7Lat_MinMM.getText();
			if( s == null || s.length() == 0 ){
				m = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				m = num.doubleValue();
			}
			decminutes = m;

			decimallatitude = Math.abs( getDecimalDegreesFromDegreesDecimalMinutes(degrees, decminutes) );
			String SLatDirMM = (String)ChoiceLatDirMM.getSelectedItem();
			if( SLatDirMM.equals(props.getProperty("headings.s."+language)) ){
				decimallatitude *= -1;
			}
			txtT2Dec_Lat.setText( formatDec.format(decimallatitude) );

			getMSFromDecMinutes(decminutes);
			txtT7Lat_DegDMS.setText( formatDeg.format(degrees) );
			txtT7Lat_MinDMS.setText( formatMin.format(minutes) );
			txtT7Lat_Sec.setText( formatSec.format(seconds) );
			ChoiceLatDirDMS.select( ChoiceLatDirMM.getSelectedItem() );

			num = numberFormatter.parse(txtT7Long_DegMM.getText());
			degrees = num.intValue();

//			degrees = Integer.parseInt( txtT7Long_DegMM.getText() );
			s = txtT7Long_MinMM.getText();
			if( s == null || s.length() == 0 ){
				m = 0;
			} else {
				num = numberFormatter.parse(s.trim());
				m = num.doubleValue();
			}
			decminutes = m;

			decimallongitude = Math.abs( getDecimalDegreesFromDegreesDecimalMinutes(degrees, decminutes) );
			String SLongDirMM = (String)ChoiceLongDirMM.getSelectedItem();
			if( SLongDirMM.equals(props.getProperty("headings.w."+language)) ){
				decimallongitude *= -1;
			}
			txtT2Dec_Long.setText( formatDec.format(decimallongitude) );

			getMSFromDecMinutes(decminutes);
			txtT7Long_DegDMS.setText( formatDeg.format(degrees) );
			txtT7Long_MinDMS.setText( formatMin.format(minutes) );
			txtT7Long_Sec.setText( formatSec.format(seconds) );
			ChoiceLongDirDMS.select( ChoiceLongDirMM.getSelectedItem() );
		}
		String SCoordSystem = (String)ChoiceCoordSystem.getSelectedItem();
		int index = canonicalcoordsystems.indexOf(SCoordSystem);

		lastcoordsystem = index+1;
	}

	void txtT2Dec_Lat_focusGained(){
		clearResults();
	}

	void txtT2Dec_Long_focusGained(){
		clearResults();
	}

	void txtT7Lat_DegDMS_focusGained(){
		clearResults();
	}

	void txtT7Lat_DegMM_focusGained(){
		clearResults();
	}

	void txtT7Lat_MinDMS_focusGained(){
		clearResults();
	}

	void txtT7Lat_MinMM_focusGained(){
		clearResults();
	}

	void txtT7Lat_Sec_focusGained(){
		clearResults();
	}

	void txtT7Long_DegDMS_focusGained(){
		clearResults();
	}

	void txtT7Long_DegMM_focusGained(){
		clearResults();
	}

	void txtT7Long_MinDMS_focusGained(){
		clearResults();
	}

	void txtT7Long_MinMM_focusGained(){
		clearResults();
	}

	void txtT7Long_Sec_focusGained(){
		clearResults();
	}

	public void itemStateChanged(ItemEvent e){
		ActionEvent ae = new ActionEvent(e.getSource(),e.getID(),null);
		actionPerformed(ae);
	}

	public void errorDialog(String error, String title, int style){
		Frame f=null;
		Container c=getParent();
		while(c!=null){
			if(c instanceof Frame){
				f=(Frame)c;
				break;
			}else c=c.getParent();
		}
		MinMaxDialog d=new MinMaxDialog(f, error, title, style);
		d.setVisible(true);
	}

	public static void main(String[] args) throws Exception {
		GC gc = new GC();
		Locale currentLocale = Locale.getDefault();
		currentLocale = Locale.FRENCH;

		String testString = new String("1:1000");
		String s0 = testString.substring(2, testString.length());

		NumberFormat numberFormatter = NumberFormat.getNumberInstance(currentLocale); 
		double d;
		boolean testpasses;
		String s = new String("1,234");
		try{
			Number num = numberFormatter.parse(s.trim());
			d = num.doubleValue();
			if( d < -90.0 ){
				testpasses = false;
			} else if( d > 90 ){
				testpasses = false;
			}
		} catch(NumberFormatException e){
			testpasses = false;
		}
	}
	// Control Declarations
	Panel pane = null;
	Choice ChoiceLanguage = null;
	Choice ChoiceOffsetEWDir = null;
	Button ButtonCalculate = null;
	Button ButtonPromote = null;
	Choice ChoiceOffsetNSDir = null;
	Label LabelVersion = null;
	Label LabelCopyright = null;
	Choice ChoiceCalcType = null;
	Label LabelCalcType = null;
	Label LabelOffset = null;
	TextField TextFieldOffsetEW = null;
	TextField TextFieldHeading = null;
	Label LabelTitle = null;
	Label LabelStepTwo = null;
	Label LabelOffsetEW = null;
	TextField TextFieldOffset = null;
	Label LabelCoordSource = null;
	Choice ChoiceCoordSource = null;
	Label LabelStepOne = null;
	Label LabelDirection = null;
	Label LabelDistancePrecision = null;
	Choice ChoiceDistancePrecision = null;
	Choice ChoiceDirection = null;
	TextField TextFieldExtent = null;
	Label LabelExtent = null;
	TextField TextFieldMeasurementError = null;
	Label LabelMeasurementError = null;

	Panel PanelResults = null;
	TextField TextFieldFullResult = null;
	TextField TextFieldCalcDecLat = null;
	Label LabelCalcDecLat = null;
	TextField TextFieldCalcDecLong = null;
	Label LabelCalcDecLong = null;
	Label LabelCalcMaxError = null;
	TextField TextFieldCalcErrorDist = null;
	TextField TextFieldCalcErrorUnits = null;
	Choice ChoiceModel = null;
	Label LabelModel = null;

	Panel PanelCoords = null;
	Label LabelDatum = null;
	Choice ChoiceDatum = null;
	Label lblT2Dec_Lat = null;
	Label lblT2Dec_Long = null;

	Panel PanelDecLatLong = null;
	TextField txtT2Dec_Lat = null;
	TextField txtT2Dec_Long = null;

	Panel PanelDecMin = null;
	Choice ChoiceLatDirMM = null;
	Choice ChoiceLongDirMM = null;
	Label Label2111111 = null;
	Label Label22111 = null;
	Label Label21212 = null;
	Label Label231 = null;
	TextField txtT7Lat_DegMM = null;
	TextField txtT7Lat_MinMM = null;
	TextField txtT7Long_DegMM = null;
	TextField txtT7Long_MinMM = null;

	Panel PanelDDMMSS = null;
	Choice ChoiceLongDirDMS = null;
	Choice ChoiceLatDirDMS = null;
	Label Label211111 = null;
	Label Label2211 = null;
	Label Label21121 = null;
	Label Label222 = null;
	Label Label2123 = null;
	Label Label23 = null;
	TextField txtT7Lat_DegDMS = null;
	TextField txtT7Lat_MinDMS = null;
	TextField txtT7Lat_Sec = null;
	TextField txtT7Long_DegDMS = null;
	TextField txtT7Long_MinDMS = null;
	TextField txtT7Long_Sec = null;

	Panel PanelCoordPrecision = null;
	Choice ChoiceLatPrecision = null;
	Label LabelLatPrecision = null;
	Label LabelDistUnits = null;
	Choice ChoiceDistUnits = null;

	Label LabelEquals = null;
	Label LabelDistanceConverter = null;
	Choice ChoiceFromDistUnits = null;
	Choice ChoiceToDistUnits = null;
	TextField TextFieldFromDistance = null;
	TextField TextFieldToDistance = null;
	
	Label LabelScaleEquals = null;
	Label LabelScaleConverter = null;
	Choice ChoiceScale = null;
	Choice ChoiceScaleFromDistUnits = null;
	Choice ChoiceScaleToDistUnits = null;
	TextField TextFieldScaleFromDistance = null;
	TextField TextFieldScaleToDistance = null;
	
	Label LabelCoordSystem = null;
	Choice ChoiceCoordSystem = null;
	Label LabelStepZero = null;

	DecimalFormat formatDec = null;
	DecimalFormat formatDeg = null; 
	DecimalFormat formatMin = null;
	DecimalFormat formatMinMM = null;
	DecimalFormat formatSec = null;
	DecimalFormat formatCalcError = null;
	DecimalFormat formatDistance = null;
	DecimalFormat formatCalcDec = null;

	/*
 	DecimalFormat formatDec = new DecimalFormat("0.0000000"); 
	DecimalFormat formatDeg = new DecimalFormat("##0"); 
	DecimalFormat formatMin = new DecimalFormat("#0");
	DecimalFormat formatMinMM = new DecimalFormat("#0.000000");
	DecimalFormat formatSec = new DecimalFormat("#0.00");
	DecimalFormat formatCalcError = new DecimalFormat("##0.000");
	DecimalFormat formatCalcDec = new DecimalFormat("##0.00000");
	 */

//	Declarations for instance variables used in the form
	private Datumerror datumErrorInst = null;
	private int lastcoordsystem = 1; // 1=dd.ddddd, 2=ddmmss.ss, 3=ddmm.mmmm
	private int sign = 1;
	private int degrees = 0;
	private int minutes = 0;
	private double seconds = 0;
	private double decminutes = 0;

	private double decimallatitude = 0; // holds the decimal latitude of the starting point
	private double decimallongitude = 0; // holds the decimal longitude of the starting point

	private double latmetersperdegree = 0; // holds number of meters per degree of latitude for the current coordinate and error calculation
	private double longmetersperdegree = 0; // holds number of meters per degree of longitude for the current coordinate and error calculation

	private double newdecimallatitude = 0; // holds the decimal latitude of the end point
	private double newdecimallongitude = 0; // holds the decimal longitude of the end point

	private double maxerrordistance = 0; // calculated max error distance

	private double fromdistance = 0;  // holds the value of the left-hand side of the distance conversion equation
	private double todistance = 0;    // holds the value of the right-hand side of the distance conversion equation
	private double scalefromdistance = 0;  // holds the value of the left-hand side of the distance conversion equation
	private double scaletodistance = 0;    // holds the value of the right-hand side of the distance conversion equation
	private double scalefactor = 1; // holds the decimal latitude of the end point

	private double lastdecimalminutes = 0;
	private double lastdecimaldegrees = 0;

	boolean datumbytesread = false;

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
	public void actionPerformed(ActionEvent e) {
		if(e.getSource() == ChoiceLanguage ){
			try {
				ChoiceLanguage_itemStateChanged(ChoiceLanguage.getSelectedIndex());				
			} catch (ParseException e2){
				e2.printStackTrace();
			}
		}
		if (e.getSource() == ButtonCalculate) {
			try {
				ButtonCalculate_afterActionPerformed();
			} catch (ParseException e1) {
				e1.printStackTrace();
			}
		}
		if (e.getSource() == ButtonPromote) {
			try {
				ButtonPromote_afterActionPerformed();
			} catch (ParseException e1) {
				e1.printStackTrace();
			}
		}
		if (e.getSource() == ChoiceCoordSystem) {
			try {
				ChoiceCoordSystem_itemStateChanged((String)ChoiceCoordSystem.getSelectedItem());
			} catch (ParseException e1) {
				e1.printStackTrace();
			}
		}
		if (e.getSource() == ChoiceModel) {
			ChoiceModel_itemStateChanged((String)ChoiceModel.getSelectedItem());
		}
		if (e.getSource() == ChoiceDistUnits) {
			ChoiceDistUnits_itemStateChanged((String)ChoiceDistUnits.getSelectedItem());
		}
		if (e.getSource() == ChoiceFromDistUnits) {
			ChoiceFromDistUnits_itemStateChanged((String)ChoiceFromDistUnits.getSelectedItem());
		}
		if (e.getSource() == ChoiceToDistUnits) {
			ChoiceToDistUnits_itemStateChanged((String)ChoiceToDistUnits.getSelectedItem());
		}
		if (e.getSource() == ChoiceScaleFromDistUnits) {
			ChoiceScaleFromDistUnits_itemStateChanged((String)ChoiceScaleFromDistUnits.getSelectedItem());
		}
		if (e.getSource() == ChoiceScaleToDistUnits) {
			ChoiceScaleToDistUnits_itemStateChanged((String)ChoiceScaleToDistUnits.getSelectedItem());
		}
		if (e.getSource() == ChoiceScale) {
			ChoiceScale_itemStateChanged((String)ChoiceScale.getSelectedItem());
		}
		if (e.getSource() == ChoiceLatDirDMS) {
			ChoiceLatDirDMS_itemStateChanged((String)ChoiceLatDirDMS.getSelectedItem());
		}
		if (e.getSource() == ChoiceLatDirMM) {
			ChoiceLatDirMM_itemStateChanged((String)ChoiceLatDirMM.getSelectedItem());
		}
		if (e.getSource()== ChoiceLongDirMM) {
			ChoiceLongDirMM_itemStateChanged((String)ChoiceLongDirMM.getSelectedItem());
		}
		if (e.getSource()== ChoiceLongDirDMS) {
			ChoiceLongDirDMS_itemStateChanged((String)ChoiceLongDirDMS.getSelectedItem());
		}
		if (e.getSource()== ChoiceCalcType) {
			ChoiceCalcType_itemStateChanged((String)ChoiceCalcType.getSelectedItem());
		}
		if (e.getSource()== ChoiceDirection) {
			ChoiceDirection_itemStateChanged((String)ChoiceDirection.getSelectedItem());
		}
		if (e.getSource()== ChoiceCoordSource) {
			ChoiceCoordSource_itemStateChanged((String)ChoiceCoordSource.getSelectedItem());
		}
		if (e.getSource()== ChoiceDatum) {
			ChoiceDatum_itemStateChanged((String)ChoiceDatum.getSelectedItem());
		}
		if (e.getSource()== ChoiceLatPrecision) {
			ChoiceLatPrecision_itemStateChanged((String)ChoiceLatPrecision.getSelectedItem());
		}
		if (e.getSource()== ChoiceOffsetNSDir) {
			ChoiceOffsetNSDir_itemStateChanged((String)ChoiceOffsetNSDir.getSelectedItem());
		}
		if (e.getSource()== ChoiceOffsetEWDir) {
			ChoiceOffsetEWDir_itemStateChanged((String)ChoiceOffsetEWDir.getSelectedItem());
		}
		if (e.getSource()== ChoiceDistancePrecision) {
			ChoiceDistancePrecision_itemStateChanged((String)ChoiceDistancePrecision.getSelectedItem());
		}
	}
	public void addListeners() {
		ChoiceLanguage.addItemListener(this);
		ButtonCalculate.addActionListener(this);
		ButtonPromote.addActionListener(this);
		ChoiceCalcType.addItemListener(this);
		ChoiceCoordSystem.addItemListener(this);
		ChoiceModel.addItemListener(this);
		ChoiceDistUnits.addItemListener(this);
		ChoiceFromDistUnits.addItemListener(this);
		ChoiceToDistUnits.addItemListener(this);
		ChoiceScaleFromDistUnits.addItemListener(this);
		ChoiceScaleToDistUnits.addItemListener(this);
		ChoiceScale.addItemListener(this);
		ChoiceLatDirDMS.addItemListener(this);
		ChoiceLatDirMM.addItemListener(this);
		ChoiceLongDirMM.addItemListener(this);
		ChoiceLongDirDMS.addItemListener(this);
		ChoiceDirection.addItemListener(this);
		ChoiceCoordSource.addItemListener(this);
		ChoiceDatum.addItemListener(this);
		ChoiceLatPrecision.addItemListener(this);
		ChoiceOffsetNSDir.addItemListener(this);
		ChoiceOffsetEWDir.addItemListener(this);
		ChoiceDistancePrecision.addItemListener(this);

		TextFieldFromDistance.addFocusListener(this);
		TextFieldToDistance.addFocusListener(this);
		TextFieldScaleFromDistance.addFocusListener(this);
		TextFieldScaleToDistance.addFocusListener(this);
		TextFieldExtent.addFocusListener(this);
		TextFieldMeasurementError.addFocusListener(this);
		txtT2Dec_Lat.addFocusListener(this);
		txtT2Dec_Long.addFocusListener(this);
		txtT7Lat_DegDMS.addFocusListener(this);
		txtT7Lat_DegMM.addFocusListener(this);
		txtT7Lat_MinDMS.addFocusListener(this);
		txtT7Lat_MinMM.addFocusListener(this);
		txtT7Lat_Sec.addFocusListener(this);
		txtT7Long_DegDMS.addFocusListener(this);
		txtT7Long_DegMM.addFocusListener(this);
		txtT7Long_MinDMS.addFocusListener(this);
		txtT7Long_MinMM.addFocusListener(this);
		txtT7Long_Sec.addFocusListener(this);
		TextFieldOffset.addFocusListener(this);
		TextFieldOffsetEW.addFocusListener(this);
		TextFieldHeading.addFocusListener(this);

		addKeyListener(this);
		ChoiceLanguage.addKeyListener(this);
		ChoiceCalcType.addKeyListener(this);
		ChoiceCoordSystem.addKeyListener(this);
		ChoiceModel.addKeyListener(this);
		ChoiceDistUnits.addKeyListener(this);
		ChoiceFromDistUnits.addKeyListener(this);
		ChoiceToDistUnits.addKeyListener(this);
		ChoiceScaleFromDistUnits.addKeyListener(this);
		ChoiceScaleToDistUnits.addKeyListener(this);
		ChoiceScale.addKeyListener(this);
		ChoiceLatDirDMS.addKeyListener(this);
		ChoiceLatDirMM.addKeyListener(this);
		ChoiceLongDirMM.addKeyListener(this);
		ChoiceLongDirDMS.addKeyListener(this);
		ChoiceDirection.addKeyListener(this);
		ChoiceCoordSource.addKeyListener(this);
		ChoiceDatum.addKeyListener(this);
		ChoiceLatPrecision.addKeyListener(this);
		ChoiceOffsetNSDir.addKeyListener(this);
		ChoiceOffsetEWDir.addKeyListener(this);
		ChoiceDistancePrecision.addKeyListener(this);
		TextFieldFromDistance.addKeyListener(this);
		TextFieldToDistance.addKeyListener(this);
		TextFieldScaleFromDistance.addKeyListener(this);
		TextFieldScaleToDistance.addKeyListener(this);
		TextFieldExtent.addKeyListener(this);
		TextFieldMeasurementError.addKeyListener(this);
		txtT2Dec_Lat.addKeyListener(this);
		txtT2Dec_Long.addKeyListener(this);
		txtT7Lat_DegDMS.addKeyListener(this);
		txtT7Lat_DegMM.addKeyListener(this);
		txtT7Lat_MinDMS.addKeyListener(this);
		txtT7Lat_MinMM.addKeyListener(this);
		txtT7Lat_Sec.addKeyListener(this);
		txtT7Long_DegDMS.addKeyListener(this);
		txtT7Long_DegMM.addKeyListener(this);
		txtT7Long_MinDMS.addKeyListener(this);
		txtT7Long_MinMM.addKeyListener(this);
		txtT7Long_Sec.addKeyListener(this);
		TextFieldOffset.addKeyListener(this);
		TextFieldOffsetEW.addKeyListener(this);
		TextFieldHeading.addKeyListener(this);
	}

	public void afterFormInitialize() {
		// Write code here for initializing your own control
		// or creating a new control.
		setDecimalFormat();
		populateStableControls();
		populateCoordinatePrecision(props.getProperty("coordsys.dd."+language));
//		populateCoordinatePrecision("decimal degrees");
	}

	void ButtonCalculate_afterActionPerformed() throws ParseException{
		clearResults();
		calculateResults();
		showResults(true);
	}

	void ButtonPromote_afterActionPerformed() throws ParseException{
//		newdecimallatitude = decimallatitude;
//		newdecimallongitude = decimallongitude;
		lastcoordsystem = 1;
//		TextFieldCalcDecLat.setText(formatCalcDec.format(newdecimallatitude));
//		TextFieldCalcDecLong.setText(formatCalcDec.format(newdecimallongitude));

		txtT2Dec_Lat.setText(formatCalcDec.format(newdecimallatitude));
		txtT2Dec_Long.setText(formatCalcDec.format(newdecimallongitude));
		try {
			ChoiceCoordSystem_itemStateChanged((String)ChoiceCoordSystem.getSelectedItem());
		} catch (ParseException e1) {
			e1.printStackTrace();
		}
	}

	private void calculateMaxErrorDistance() throws ParseException {
		maxerrordistance=0.0;
		String model = (String)ChoiceModel.getSelectedItem();
		int index = canonicalloctypes.indexOf(model);

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
/*
			maxerrordistance += getDatumError();
			maxerrordistance += getExtentsError();
			maxerrordistance += getMeasurementError();
			maxerrordistance += getMapScaleError();
			maxerrordistance += getDistancePrecisionError();
			maxerrordistance *= Math.sqrt(2.0);
			maxerrordistance += getCoordPrecisionError();
*/
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

	private void calculateLatLongMetersPerDegree(){
		// The distance between point A at a latitude equal to decimallatitude and point B
		// at a latitude one degree removed from point A, but at the same longitude, is here
		// estimated to be the length of an arc subtending an angle of one degree with a
		// radius equal to the distance from the center of the ellipsoid to the point A.

		// The distance between point A at a latitude equal to decimallatitude and point B
		// at the same latitude, but one degree removed from point A in longitude, is here
		// estimated to be the length of an arc subtending an angle of one degree with a
		// radius equal to the distance from point A to the polar axis and orthogonal to it.
		// The source for the following values is NIMA 8350.2, 4 Jul 1977

		String datumstr = (String)ChoiceDatum.getSelectedItem();
		double a = getSemiMajorAxis( getEllipsoidCode( datumstr ) );
		double f = getFlattening( getEllipsoidCode( datumstr ) );

		double e_squared = 2.0*f - Math.pow(f,2.0); // e^2 = 2f - f^2

		// N - radius of curvature in the prime vertical, (tangent to ellipsoid at latitude)
		double N = a/Math.sqrt(1.0 - e_squared*(Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0))); // N(lat) = a/(1-e^2*sin^2(lat))^0.5

		// M - radius of curvature in the prime meridian, (tangent to ellipsoid at latitude)
		double M = a*(1.0 - e_squared)/Math.pow(1.0 - e_squared*Math.pow(Math.sin(decimallatitude*Math.PI/180.0),2.0),1.5); // M(lat) = a(1-e^2)/(1-e^2*sin^2(lat))^1.5

		// longitude is irrelevant for the calculations to follow so simplify by using longitude = 0, so Y = 0
		double X = N*Math.cos(decimallatitude*Math.PI/180.0)*1.0; // X = Ncos(lat)cos(long). long = 0, so  cos(long) = 1.0

		latmetersperdegree = Math.PI*M/180.0; // M is a function of latitude.
		longmetersperdegree = Math.PI*X/180.0; // X is the orthogonal distance to the polar axis.
	}

	private void setVariables(String languagecode){
		// Do not change the following, the order is important
		canonicalheadings.clear();
		canonicalheadings.add(props.getProperty("headings.n."+language));
		canonicalheadings.add(props.getProperty("headings.e."+language));
		canonicalheadings.add(props.getProperty("headings.s."+language));
		canonicalheadings.add(props.getProperty("headings.w."+language));
		canonicalheadings.add(props.getProperty("headings.ne."+language));
		canonicalheadings.add(props.getProperty("headings.se."+language));
		canonicalheadings.add(props.getProperty("headings.sw."+language));
		canonicalheadings.add(props.getProperty("headings.nw."+language));
		canonicalheadings.add(props.getProperty("headings.nne."+language));
		canonicalheadings.add(props.getProperty("headings.ene."+language));
		canonicalheadings.add(props.getProperty("headings.ese."+language));
		canonicalheadings.add(props.getProperty("headings.sse."+language));
		canonicalheadings.add(props.getProperty("headings.ssw."+language));
		canonicalheadings.add(props.getProperty("headings.wsw."+language));
		canonicalheadings.add(props.getProperty("headings.wnw."+language));
		canonicalheadings.add(props.getProperty("headings.nnw."+language));
		canonicalheadings.add(props.getProperty("headings.nbe."+language));
		canonicalheadings.add(props.getProperty("headings.nebn."+language));
		canonicalheadings.add(props.getProperty("headings.nebe."+language));
		canonicalheadings.add(props.getProperty("headings.ebn."+language));
		canonicalheadings.add(props.getProperty("headings.ebs."+language));
		canonicalheadings.add(props.getProperty("headings.sebe."+language));
		canonicalheadings.add(props.getProperty("headings.sebs."+language));
		canonicalheadings.add(props.getProperty("headings.sbe."+language));
		canonicalheadings.add(props.getProperty("headings.sbw."+language));
		canonicalheadings.add(props.getProperty("headings.swbs."+language));
		canonicalheadings.add(props.getProperty("headings.swbw."+language));
		canonicalheadings.add(props.getProperty("headings.wbs."+language));
		canonicalheadings.add(props.getProperty("headings.wbn."+language));
		canonicalheadings.add(props.getProperty("headings.nwbw."+language));
		canonicalheadings.add(props.getProperty("headings.nwbn."+language));
		canonicalheadings.add(props.getProperty("headings.nbw."+language));
		canonicalheadings.add(props.getProperty("headings.nearestdegree."+language));

		// Do not change the following, the order is important
		canonicalcoordsystems.clear();
		canonicalcoordsystems.add(props.getProperty("coordsys.dd."+language));
		canonicalcoordsystems.add(props.getProperty("coordsys.dms."+language));
		canonicalcoordsystems.add(props.getProperty("coordsys.ddm."+language));

		// Do not change the following, the order is important
		canonicalloctypes.clear();
		canonicalloctypes.add(props.getProperty("loctype.coordonly."+language));
		canonicalloctypes.add(props.getProperty("loctype.namedplaceonly."+language));
		canonicalloctypes.add(props.getProperty("loctype.distanceonly."+language));
		canonicalloctypes.add(props.getProperty("loctype.distalongpath."+language));
		canonicalloctypes.add(props.getProperty("loctype.orthodist."+language));
		canonicalloctypes.add(props.getProperty("loctype.distatheading."+language));

		// Do not change the following, the order is important
		canonicalcalctypes.clear();
		canonicalcalctypes.add(props.getProperty("calctype.erroronly."+language));
		canonicalcalctypes.add(props.getProperty("calctype.coordsanderror."+language));
		canonicalcalctypes.add(props.getProperty("calctype.coordsonly."+language));

		// Do not change the following, the order is important
		canonicalsources.clear();
		canonicalsources.add(props.getProperty("coordsource.gaz."+language));
		canonicalsources.add(props.getProperty("coordsource.gps."+language));
		canonicalsources.add(props.getProperty("coordsource.loc."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs250000."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs100000."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs63360."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs62500."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs25000."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs24000."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs12000."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs10000."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs4800."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs2400."+language));
		canonicalsources.add(props.getProperty("coordsource.usgs1200."+language));
		canonicalsources.add(props.getProperty("coordsource.ntsa250000."+language));
		canonicalsources.add(props.getProperty("coordsource.ntsb250000."+language));
		canonicalsources.add(props.getProperty("coordsource.ntsc250000."+language));
		canonicalsources.add(props.getProperty("coordsource.ntsa50000."+language));
		canonicalsources.add(props.getProperty("coordsource.ntsb50000."+language));
		canonicalsources.add(props.getProperty("coordsource.ntsc50000."+language));
		canonicalsources.add(props.getProperty("coordsource.non3000000."+language));
		canonicalsources.add(props.getProperty("coordsource.non2500000."+language));
		canonicalsources.add(props.getProperty("coordsource.non1000000."+language));
		canonicalsources.add(props.getProperty("coordsource.non500000."+language));
		canonicalsources.add(props.getProperty("coordsource.non250000."+language));
		canonicalsources.add(props.getProperty("coordsource.non200000."+language));
		canonicalsources.add(props.getProperty("coordsource.non180000."+language));
		canonicalsources.add(props.getProperty("coordsource.non150000."+language));
		canonicalsources.add(props.getProperty("coordsource.non125000."+language));
		canonicalsources.add(props.getProperty("coordsource.non100000."+language));
		canonicalsources.add(props.getProperty("coordsource.non80000."+language));
		canonicalsources.add(props.getProperty("coordsource.non62500."+language));
		canonicalsources.add(props.getProperty("coordsource.non60000."+language));
		canonicalsources.add(props.getProperty("coordsource.non50000."+language));
		canonicalsources.add(props.getProperty("coordsource.non40000."+language));
		canonicalsources.add(props.getProperty("coordsource.non32500."+language));
		canonicalsources.add(props.getProperty("coordsource.non25000."+language));
		canonicalsources.add(props.getProperty("coordsource.non20000."+language));
		canonicalsources.add(props.getProperty("coordsource.non10000."+language));

		canonicalddprec.clear();
		canonicalddprec.add(props.getProperty("coordprec.dd.degree."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.01."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.001."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.0001."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.00001."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.000001."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.half."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.quarter."+language));
		canonicalddprec.add(props.getProperty("coordprec.dd.exact."+language));

		canonicaldmsprec.clear();
		canonicaldmsprec.add(props.getProperty("coordprec.dms.degree."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.30m."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.10m."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.5m."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.1m."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.30s."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.10s."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.5s."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.1s."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.01s."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.001s."+language));
		canonicaldmsprec.add(props.getProperty("coordprec.dms.exact."+language));

		canonicalddmprec.clear();
		canonicalddmprec.add(props.getProperty("coordprec.ddm.degree."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.30m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.10m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.5m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.1m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.01m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.001m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.0001m."+language));
		canonicalddmprec.add(props.getProperty("coordprec.ddm.exact."+language));
	}

	protected void initProps(String propsfile, Properties props) {
		InputStream inputStream;
		try {
			// Load the properties file
			ClassLoader loader = this.getClass().getClassLoader();
			inputStream = loader.getResourceAsStream(propsfile);
			props.load(inputStream);
		} catch (FileNotFoundException e1) {
			e1.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

//}