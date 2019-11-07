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
__version__ = "datumshiftproj.py 2019-11-07T19:16-03:00"

import setup_env

setup_env.fix_sys_path()

import pyproj
from pyproj import CRS
from pyproj import Transformer
from pyproj.enums import PJType
from geomancer.point import *

def is_float(string):
  try:
    float(string)
    return True
  except ValueError:  # String is not a number
    return False

def frange(start, stop=None, step=None):
    #Use float number in range() function

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
#end of function frange()

GRIDDEGREES=5
LNGMIN=-180
LNGMAX=180
LATMIN=-90
LATMAX=90.01
griddiffs=[]
gridpoints=[]
for x in frange(LNGMIN,LNGMAX,GRIDDEGREES):
    for y in frange(LATMIN,LATMAX,GRIDDEGREES):
        griddiffs.append(0)
        gridpoints.append(Point(x,y))
#print(griddiffs)
#print(gridpoints)
maxdiff = 0
llmaxdiff = 0
maxdiffpoint = None
maxcrs = None
ops=None
for code in pyproj.get_codes('EPSG',PJType.GEOGRAPHIC_CRS):
#Worst 4688 (), 8428 (), 4660 (), 4735 ()
#for code in ['4688']:
    pyproj.get_codes('EPSG',PJType.GEOGRAPHIC_CRS)
    crs=CRS.from_user_input('epsg:%s' % code)
#    print(crs.name)
    if crs.prime_meridian.name=='Greenwich':
        i=0
        t = Transformer.from_crs("epsg:%s" % code, 'epsg:4326', always_xy=True)
        ops=t.operations
        for lng in frange(LNGMIN,LNGMAX,GRIDDEGREES):
            for lat in frange(LATMIN,LATMAX,GRIDDEGREES):
                p = Point(float(lng), float(lat))
                x, y = t.transform(lng,lat)
                p_wgs84 = Point(x,y)
                try:
                    diff = p.haversine_distance(p_wgs84)
                    if diff > griddiffs[i]:
                        griddiffs[i] = round(diff)
                    if diff > maxdiff:
                        maxdiff=diff
                        maxdiffpoint = p
                        maxdiffwgs84 = Point(x,y)
                        maxcrs=crs
                except ValueError:
                    pass
#                s = '\t%s\t%s\t%s\t%s' % (lng, lat, truncate(llmaxdiff,0), truncate(maxdiff,0))
#                print("%s" % s)
                i+=1
#print(griddiffs)
#print("maxcrs: %s op:%s %.0fm at %s: WGS84: %s" % (maxcrs.to_wkt(), ops, maxdiff, maxdiffpoint, maxdiffwgs84))
s = 'Value,Longitude,Latitude'
#print(s)
i=0
for diff in griddiffs:
#    print('%s,%s,%s' % (diff, gridpoints[i].lng, gridpoints[i].lat))
    print('%s' % (diff))
    i+=1
