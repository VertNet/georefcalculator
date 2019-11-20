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

__author__ = "Aaron Steele"
__author__ = "John Wieczorek"
__copyright__ = "Copyright 2019 Rauthiflor LLC"
__version__ = "point.py 2019-11-20T14:57-3:00"

import math
from constants import Datums

"""A_WGS84 is the radius of the sphere at the equator for the WGS84 datum."""
A_WGS84 = 6378137.0

"""DEGREE_DIGITS is the number of significant digits to the right of the decimal
to use in latitude and longitude equality determination and representation. This 
should be set to 7 to preserve reversible transformations between coordinate systems 
down to a resolution of roughly 1 m."""
DEGREE_DIGITS = 7

class Point(object):
    """A degree-based geographic coordinate independent of a coordinate reference system."""

    def __init__(self, lng, lat):
        self._lng = lng
        self._lat = lat

    def get_lng(self):
        return self._lng
    lng = property(get_lng)

    def get_lat(self):
        return self._lat
    lat = property(get_lat)

    def isvalid(self):
        if math.fabs(self.lat) <= 90:
            if math.fabs(self.lng) <= 180:
                return True
        return False

    def __str__(self):
        return str(self.__dict__)

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        if self.lat != other.lat:
            return NotImplemented
        if self.lng != other.lng:
            return NotImplemented
        return True

    def __gt__(self, other):
        if self._lat > other._lat:
            return True
        if self._lng > other._lng:
            return True
        return False

    def __lt__(self, other):
        if self._lat < other._lat:
            return True
        if self._lng < other._lng:
            return True
        return False

    def __cmp__(self, other):
        if self.__gt__(other):
            return 1
        if self.__lt__(other):
            return -1
        return 0

    def __hash__(self):
        return hash('%s,%s' % (self._lat, self._lng))

    def get_point_on_rhumb_line(self, distance, bearing):
        """ Returns the destination point in degrees lng, lat truncated to the default number of
            digits of precision by going the given distance at the bearing from the start_lng_lat
            along a rhumb line.
        
        Arguments:
            distance - the distance from the starting Point, in meters
            bearing - the clockwise angle of the direction from the starting Point, in degrees from North
             
        Reference: http://www.movable-type.co.uk/scripts/latlong.html."""

        # bearing in assumed to be in degrees
        bearing_in_radians = math.radians(bearing)
        # ad is the angular distance (in radians) traveled.
        ad = distance/A_WGS84
        # dlat is the net change in latitude
        dlat = ad*math.cos(bearing_in_radians)
        # lat1 is the latitude of the starting point in radians.
        lat1 = math.radians(self.lat)
        # lng1 is the longitude of the starting point in radians.
        lng1 = math.radians(self.lng)
        # The new latitude, in radians, is the starting latitude plus the change in latitude
        lat2 = lat1 + dlat
        
        dPhi = math.log(math.tan(lat2/2+math.pi/4)/math.tan(lat1/2+math.pi/4))
        if dPhi == 0:
            q = math.cos(lat1)
        else:
            q = dlat/dPhi
        # The change in longitude
        dlng = ad*math.sin(bearing_in_radians)/q
        # If the latitude happens to go beyond the pole
        if math.fabs(lat2) > math.pi/2:
            # if the latitude is beyond 90 degrees north
            if lat2>0:
                # latitude should be 90 degree north
                lat2 = math.pi/2
            else:
                # latidude is beyond 90 degree south
                # latitude should be 90 degrees south
                lat2 = -1*math.pi/2
        # The new longitude, in radians        
        lng2 = (lng1+dlng+math.pi)%(2*math.pi)-math.pi
         
        lng2d = math.degrees(lng2)
        lat2d = math.degrees(lat2)
        return Point(float(truncate(lng2d,DEGREE_DIGITS)), float(truncate(lat2d,DEGREE_DIGITS)))
    
    def get_point_from_distance_along_great_circle(self, distance, bearing):
        """Returns the destination point in degrees lng, lat truncated to the default number of
        digits of precision by going the given distance at the bearing from the start_lng_lat.
        
        Arguments:
            distance - the distance from the starting Point, in meters
            bearing - the clockwise angle of the direction from the starting Point, in degrees from North
             
        Reference: http://www.movable-type.co.uk/scripts/latlong.html."""
    
        # ad is the angular distance (in radians) traveled.
        ad = distance/A_WGS84
        # lat1 is the latitude of the starting point in radians.
        lat1 = math.radians(self.lat)
        # lng1 is the longitude of the starting point in radians.
        lng1 = math.radians(self.lng)
        # b is the bearing direction in radians.
        b = math.radians(bearing)
        # lat2 is the latitude of the end point in radians.
        lat2 = math.asin( math.sin(lat1) * math.cos(ad) + math.cos(lat1) * math.sin(ad) * math.cos(b) )
        y = math.sin(b) * math.sin(ad) * math.cos(lat1)
        x = math.cos(ad) - math.sin(lat1) * math.sin(lat2)
        
        """Account for rounding errors. If x is very close to 0, set it to 0 to avoid 
        incorrect hemisphere determination.
        For example, if x = -1.1e-16, atan2(0,x) will be -math.pi when it should be 0."""
        if math.fabs(x) < 1e-10:
            x = 0
        # lng2 is the longitude of the end point in radians.
        lng2 = lng1 + math.atan2(y, x)
        lng2d = math.degrees(lng2)
        lat2d = math.degrees(lat2)
        return Point(float(truncate(lng2d,DEGREE_DIGITS)), float(truncate(lat2d,DEGREE_DIGITS)))
    
    def haversine_distance(self, end_point):
        """Returns the distance in meters along a great circle between two Points on the surface of a
        *sphere* of radius A_WGS84 (WGS84 radius) using the Haversine formula. This is an 
        approximation of the distance on an ellipsoid.
        Arguments:
            end_point - the Point of the end of the arc
        """
    
        dlng = math.radians(end_point.lng - self.lng) 
        dlat = math.radians(end_point.lat - self.lat)
        # a is the square of half the chord length between the points.'''
        a = math.sin(dlat/2) * math.sin(dlat/2) + math.cos( math.radians(self.lat) ) * math.cos( math.radians(end_point.lat) ) * math.sin(dlng/2) * math.sin(dlng/2)
        # Account for rounding errors. If a is very close to 1 set it to one to avoid domain exception.'''
        if math.fabs(1-a) < 1e-10:
            a = 1
        # c is the angular distance in radians between the points.'''
        x = math.sqrt(1-a)
        y = math.sqrt(a)
        c = 2 * math.atan2(y, x)
        return A_WGS84 * c 
    
    def point2wgs84(self, crsop):
        """Tested.
        Returns a Point in WGS84 given a Point in any datum using the Abridged Molodensky 
        Transformation.
        
        Arguments:
            datum - the Datum of the Point to transform
        
        Reference: Deakin, R.E. 2004. THE STANDARD AND ABRIDGED MOLDENSKY COORDINATE 
        TRANSFORMATION FORMULAE. Department of Mathematical and Geospatial Sciences, 
        RMIT University.
        http://user.gs.rmit.edu.au/rod/files/publications/Molodensky%20V2.pdf
        """
        latr = math.radians(self.lat)
        lngr = math.radians(self.lng)
        
        # a is the semi-major axis of given datum.
        a = crsop.SemimajorAxisInM
        
        # f is the flattening of given datum
        f = 1.0/crsop.InverseFlattening
        dx = crsop.dx
        dy = crsop.dy
        dz = crsop.dz
        
        # da is the difference between the WGS84 and source ellipsoid semi-major axes.
        da = 6378137.0 - a
        
        # df is the difference between the WGS84 and source CRS flattenings.
        df = 1.0/298.257223563 - f
        
        e_squared = f*(2-f)
        rho = a*(1-e_squared)/math.pow((1-e_squared*sqr(math.sin(latr))),1.5)
        nu = a/math.pow((1-e_squared*sqr(math.sin(latr))),0.5)
        dlat = (1/rho)*(-dx*math.sin(latr)*math.cos(lngr) - \
          dy*math.sin(latr)*math.sin(lngr) + \
          dz*math.cos(latr) + (f*da + a*df)*math.sin(2*latr))
        dlng = (-dx*math.sin(lngr) + dy*math.cos(lngr))/(nu*math.cos(latr))
        newlng = lng180(math.degrees(lngr + dlng))
        newlat = math.degrees(latr + dlat)
        return Point(float(truncate(newlng,DEGREE_DIGITS)), \
          float(truncate(newlat,DEGREE_DIGITS)))

    def point2wgs84_9603(self, datum):
      """
      Untested.
      Returns a Point in WGS84 given a Point in any datum using the EPSG 9603 
      coordinate transformation.
        
      Arguments:
        datum - the Datum of the Point to transform
        
      Reference: IOGP. 2013. Geomatics Guidance Note 7, part 2 Coordinate Conversions &
      Transformations including Formulas.
      http://www.epsg.org/Portals/0/373-07-2.pdf?ver=2019-03-08-165437-017
      """
      """
        h is the height above the ellipsoid. This is the height value that is 
        delivered by GPS satellite observations but is not the gravity-related height 
        value which is normally used for national mapping and levelling operations. The
        gravity-related height (H) is usually the height above mean sea level or an 
        alternative level reference for the country. If one starts with a gravity-related 
        height H, it will be necessary to convert it to an ellipsoid height (h) before 
        using the above transformation formulas. See section 4.11.1. For the WGS 84 
        ellipsoid the difference between ellipsoid and mean sea level can vary between 
        values of -100m in the Sri Lanka area to +80m in the North Atlantic.)
      """
      h=0
      # a is the semi-major axis of the ellipsoid of the given datum.
      a = datum.axis

      # f is the flattening of the ellipsoid of the given datum 
      # (get_flattening actually returns the inverse flattening).
      f = 1.0/datum.flattening
        
      # dx, dy, dz are the x, y, z offset parameters for the given datum transformation
      # to WGS84
      dx = datum.dx
      dy = datum.dy
      dz = datum.dz
        
      # latr, lngr are the latitude and longitude in radians
      latr = math.radians(self.lat)
      lngr = math.radians(self.lng)

      # e is the eccentricity of the ellipsoid
      e_squared = f*(2-f)

      # nu is the prime vertical radius of curvature at latr
      nu = a/math.pow((1-e_squared*sqr(math.sin(latr))),0.5)

      X = (nu+h)*math.cos(latr)*math.cos(vlambda)
      Y = (nu+h)*math.cos(latr)*math.sin(vlambda)
      Z = ((1 - math.pow(e,2))*nu + h)*math.sin(phi)

      Xwgs84 = X+dx
      Ywgs84 = Y+dy
      Zwgs84 = Z+dz

      epsilon = e_squared/(1-e_squared)
      b = a*(1-f)
      p = math.pow(sqr(Xwgs84)+sqr(Ywgs84),0.5)
      q = math.atan2((Zwgs84*a),(p*b))

      latrwgs84 = math.atan2( (Zwgs84 + epsilon*b*math.pow(math.sin(q)),3)), \
        (p - e_squared*a*math.pow(math.cos(q),3) )
      lngrwgs84 = math.atan2(Ywgs84, Xwgs84)
      hwgs84 = (p/math.cos(latrwgs84))-nu
      newlng = lng180(math.degrees(lngrwgs84))
      newlat = math.degrees(latrwgs84)
      return Point(float(truncate(newlng,DEGREE_DIGITS)), float(truncate(newlat,DEGREE_DIGITS)))

def truncate(x, digits):
    """Returns a string representation of x including a number of places to the right of 
    the decimal equal to digits.
    
    Arguments:
        x - the input float
        digits - the number of places of precision to the right of the decimal
    """
    if x==0:
        return '0'
    if digits==0:
        return str(int(round(x)))
    FORMAT = """.%sf"""
    format_x = FORMAT % str(int(digits))
    return format(x, format_x).rstrip('0').rstrip('.')

def sqr(x):
    """Returns the square of x."""
    return x * x

def lng180(lng):
    """Returns a longitude in degrees between {-180, 180] given a longitude in degrees."""
    newlng = float(lng)
    if lng <= -180:
        return lng + 360
    if newlng > 180:
        return lng - 360
    return lng

def main():
    pass

if __name__ == "__main__":
    main()
