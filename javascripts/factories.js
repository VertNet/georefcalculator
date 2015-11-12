
g_factory = {};
g_factory.makeArrayList = function()
{
		var al = {};
		al.contents = [];
		al.add = function( source )
		{
			this.contents.push( source );
		};
		al.clear = function()
		{
			this.contents = [];
		};

		/*al.indexOf = function( value )
		{
			return this.indexOf( value );
		};*/

		
		return al;
};
