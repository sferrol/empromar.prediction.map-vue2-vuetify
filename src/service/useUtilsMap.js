// GIS helpers
import * as turf from '@turf/turf'; // Import turf for GIS functions
import * as turfHelper from '@turf/helpers';  // Import turfHelper for GIS function helpers

export default function useUtilsMap() {

  // Poligon Coordinates --> Center
  // Create a latLng coordinate at the requested polygon
  const getCenterCoordinateOfPoligone = (coordinates) => {

    // Create a latLng coordinate at the requested polygon
    var poly = turfHelper.polygon(coordinates, { name: 'poly'});
    var center = turf.centerOfMass(poly);
    var coordinate = [center.geometry.coordinates[0], center.geometry.coordinates[1]]

    return coordinate
  }

  // Reverse coors: Si se indica un array lo invertimos
  //  Muy util para gestionar objetos Geojson porque vienen en LatLng
  const reverseCoord = (coord) => {
    if (Array.isArray(coord)) {
      return [coord[1], coord[0]] // Reverse
    }
    return coord
  }

  return {
    getCenterCoordinateOfPoligone,

    //
    reverseCoord
  }
}
