
g_factory = {};
g_factory.makeArrayList = function( name, source )
{
		var al = {};
		al.contents = [];
		al.name = name;
		al.source = source;
		al.length = function( )
		{
			return this.contents.length;
		};

		al.add = function( source )
		{
			this.contents.push( source );
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
				console.log( "ERROR ArrayList " + this.name + " with source " + this. source + " index not found for " + value );
			}
			return index;			
		};
		
		
		return al;
};
