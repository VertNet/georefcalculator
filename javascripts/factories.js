
g_factory = {};
g_factory.makeArrayList = function( name, source )
{
		var al = {};
		al.contents = [];
		al.name = name;
		al.source = source;
		
		//Redundant with .size() on purpose
		al.length = function( )
		{
			return this.contents.length;
		};
		
		//Redundant with .length() on purpose
		al.size = function( )
		{
			return this.contents.length;
		};

		al.add = function( source )
		{
			this.contents.push( source );
		};
		
		al.get = function( i )
		{
			return this.contents[i];
		};

		al.clear = function()
		{
			this.contents = [];
		};

		//Why is this very logical function not used?
		//It fails to determine index of 1 of spanish calc types, and possibly
		//more issues. javascript bug or limitation is my guess
		//the new function works perfectly well on the same exact data, *shrugs*
		/*
		al.indexOfOrig = function( value )
		{
			return this.contents.indexOf( value );
		};
		*/
		
		al.indexOf = function( value )
		{
			var len = this.contents.length;
			var index = -1;
			for( i = 0; i < len; i++ )
			{
				var test=this.contents[ i ];
				if( test == value)
				{
					index= i;
					i= len;
				}
			}

			if ( index == -1 )
			{
				console.log( "ERROR ArrayList indexOf() " + this.name + " with source :" + this.source + ":, index not found for :" + value +":");
			}
			return index;			
		};
		
		
		return al;
};




		//numberFormatter = NumberFormat.getNumberInstance(currentLocale); 
/*
		var formatDec = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatDeg = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatMin = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatMinMM = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatSec = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatCalcError = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatDistance = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
		var formatCalcDec = (DecimalFormat)NumberFormat.getNumberInstance(currentLocale);
*/
g_factory.makeFormat = function( name, type )
{
		var fm = {};
		fm.name = name;
		fm.type = type;
		fm.maxdigits=0;

		//fm.minval = min;
		//fm.maxval = max;

		if( type == "formatDec" )
		{
			fm.maxdigits = 7;
		}
		else if( type == "formatDeg" )
		{
			fm.maxdigits = 0;
		}
		else if( type == "formatMin" )
		{
			fm.maxdigits = 0;
		}
		else if( type == "formatMinMM" )
		{
			fm.maxdigits = 6;
		}
		else if( type == "formatSec" )
		{
			fm.maxdigits = 2;		
		}
		else if( type == "formatCalcError" )
		{
			fm.maxdigits = 3;		
		}
		else if( type == "formatDistance" )
		{
			fm.maxdigits = 5;		
		}
		else if( type == "formatCalcDec" )
		{
			fm.maxdigits = 7;				
		}
		else
		{
			fm.maxdigits = -1;		
			console.log("ERROR: trying to make number formatter of type :"+type +":");
			return null;
		}
			
		fm.checkFormat = function( cnum )
		{
			
			//BUBUG error checking at this level?, throw dialog here?
			if(typeof(cnum) == "string") 
			{
				cnum=parseFloat(cnum);
			}
			var nstr = cnum.toString();
			//var digit_len = nstr.substring(nstr.indexOf(".")+1, nstr.length ).length;
		 
			var newnum = cnum.toFixed( this.maxdigits );
			//to remove trailing zeros
			cnum = parseFloat( newnum );
			newnum = cnum.toString()

			/*if( parseFloat( newnum ) !== parseFloat( nstr ) )
			{
				console.log("WARN changing decimals of num from :"+nstr+": to :"+newnum+": by format :"+ this.type + ": md="+ this.maxdigits );
			} */
			return newnum;
		};
		
		return fm;
};
