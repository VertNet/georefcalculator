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
__version__ = "factories.js 2019-10-08T22:19-03:00"
*/

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

g_factory.makeFormat = function( name, type )
{
		var fm = {};
		fm.name = name;
		fm.type = type;
		fm.maxdigits=0;

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
		
		//TODO in here we would also need to check LOCAL when we allow for locals
		fm.throwFormatError = function( cnum )
		{
			var temp = Number(cnum);
			if(isNaN( temp ))
			{
				throw new Error( 'NaN: ' +  cnum );
			}
			return temp;
		}
		
		fm.checkFormat = function( cnum )
		{
			
			if(typeof(cnum) == "string") 
			{
				cnum=Number(cnum);
			}
			var nstr = cnum.toString();
			//var digit_len = nstr.substring(nstr.indexOf(".")+1, nstr.length ).length;
		 
			var newnum = cnum.toFixed( this.maxdigits );
			//to remove trailing zeros
			cnum = parseFloat( newnum );
			newnum = cnum.toString()

			return newnum;
		};
		
		return fm;
};
