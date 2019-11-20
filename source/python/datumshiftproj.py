#!/usr/bin/env python
# -*- coding: utf-8 -*-

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

__author__ = "John Wieczorek"
__copyright__ = "Rauthiflor LLC"
__version__ = "datumshiftproj.py 2019-11-20T15:22-03:00"

# Use the Point class to determine haversine distances between coordinates
from point import *

# Use the PROJ4 python package for datum transformations
import pyproj
from pyproj import CRS
from pyproj import Transformer
from pyproj.enums import PJType

GRIDDEGREES=40
LNGMIN=-180
LNGMAX=180
LATMIN=-90
LATMAX=90.01
griddiffs=[]
gridpoints=[]

# print only the datum shifts for each cell, one per line
def printdiffsonly():
    for diff in griddiffs:
        print('%s' % (diff))

# print the datum shifts for each cell with the longitude and latitude of the SW corner of
# cell, one per line
def printvallnglat():
    s = 'Value,Longitude,Latitude'
    print(s)
    i=0
    for diff in griddiffs:
        print('%s,%s,%s' % (diff, gridpoints[i].lng, gridpoints[i].lat))
        i+=1

# True is string can be used to represent a floating point number
def is_float(string):
  try:
    float(string)
    return True
  except ValueError:  # String is not a number
    return False

# Similar to range(), but to allow a floating point number in a ranged for loop
def frange(start, stop=None, step=None):

    # if stop and step argument is null set start=0.0 and step = 1.0
    if stop == None:
        stop = start + 0.0
        start = 0.0

    if step == None:
        step = 1.0

    while True:
        if step > 0 and start >= stop:
            break
        elif step < 0 and start <= stop:
            break
        yield ("%g" % start) # return float number
        start = start + step

def main():
    ''' 
    Create a csv file of datumshift maxima for ever grid cell of dimensions GRIDDEGREES
    within:
        LNGMIN, LNGMAX, LATMIN, LATMAX
    
    Invoke without parameters as:
       python datumshiftproj.py >> destfile.csv
    '''
    # Increment cells from LATMIN to LATMAX within LNGMIN to LNGMAX
    for x in frange(LNGMIN,LNGMAX,GRIDDEGREES):
        for y in frange(LATMIN,LATMAX,GRIDDEGREES):
            # Create the cell with a diff of 0 and the coordinates of the SW corner of
            # the cell
            griddiffs.append(0)
            gridpoints.append(Point(x,y))
    # Prepare variables for maximum shift searches
    # maxdiff - the overall biggest datum shift
    # maxdiffpoint - the coordinates of the SW corner of the cell with the biggest 
    # datum shift
    # maxcrs - the coordinate reference system  of the SW corner of the cell with the 
    # biggest datum shift
    maxdiff = 0
    maxdiffpoint = None
    maxcrs = None
    # Cycle through all EPSG code for which the type is a geographic coordinate system
    # and calculate datum shift for those that, like WGS84, use the Greenwich Meridian.
    for code in pyproj.get_codes('EPSG',PJType.GEOGRAPHIC_CRS):
        crs=CRS.from_user_input('epsg:%s' % code)
        if crs.prime_meridian.name=='Greenwich':
            i=0
            t = Transformer.from_crs("epsg:%s" % code, 'epsg:4326', always_xy=True)
            ops=t.operations
            # For each grid cell in the current coordinate reference system, find the 
            # transformed corner coordinate in WGS84
            for lng in frange(LNGMIN,LNGMAX,GRIDDEGREES):
                for lat in frange(LATMIN,LATMAX,GRIDDEGREES):
                    p = Point(float(lng), float(lat))
                    x, y = t.transform(lng,lat)
                    p_wgs84 = Point(x,y)
                    try:
                        # Find the haversine distance between the point in the current
                        # coordinate reference system and the location with the same 
                        # coordinate in WGS84
                        diff = p.haversine_distance(p_wgs84)
                        # If the datum shift for the current coordinate reference system 
                        # is greater than any other for the same location so far, store it 
                        if diff > griddiffs[i]:
                            griddiffs[i] = round(diff)
                        # If the datum shift for the current coordinate reference system 
                        # is greater than any other so far, store it, along with the 
                        # EPSG code for the coordinate reference system
                        if diff > maxdiff:
                            maxdiff=diff
                            maxdiffpoint = p
                            maxdiffwgs84 = Point(x,y)
                            maxcrs=crs
                    except ValueError:
                        pass
                    i+=1
#    print(griddiffs)
#    print("maxcrs: %s op:%s %.0fm at %s: WGS84: %s" % (maxcrs.to_wkt(), ops, maxdiff, maxdiffpoint, maxdiffwgs84))
#    printvallnglat()
    # print only the datum shifts for each cell
    printdiffsonly()

if __name__ == "__main__":
    main()