export default function useMap() {
  // OpenStreetMaps
  //  openstreetmap     https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  //  osmand            https://tile.osmand.net/hd/{z}/{x}/{y}.png
  //
  // Mapbox Tile Server (Custom to Google Style): Alt style: styles/parksideindoor/cki8uc2193zu919qv2uhe53dk
  //  mapbox            https://api.mapbox.com/styles/v1/parksideindoor/cki8uc2193zu919qv2uhe53dk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGFya3NpZGVpbmRvb3IiLCJhIjoiY2tnaGU1MHowMDN0czJ6bWU1ajVoeTlneCJ9.KfnSk61OsHyGuvWLn3M6bA
  //
  // Google
  //  Roadmap:          http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}
  //  Terrain:          http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}
  //  Altered roadmap:  http://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}
  //  Satellite only    http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}
  //  Terrain only      http://mt0.google.com/vt/lyrs=t&hl=en&x={x}&y={y}&z={z}
  //  Hybrid            http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}
  const tileLayerOptions = [
    {
      id: 'openstreetmap',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap contributors</a>',
    },
    {
      id: 'mapbox',
      url: 'https://api.mapbox.com/styles/v1/parksideindoor/cki8uc2193zu919qv2uhe53dk/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoicGFya3NpZGVpbmRvb3IiLCJhIjoiY2tnaGU1MHowMDN0czJ6bWU1ajVoeTlneCJ9.KfnSk61OsHyGuvWLn3M6bA',
      attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    },
    {
      id: 'osmand',
      url: 'https://tile.osmand.net/hd/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://osmand.net">OsmAnd</a>',
    },

    {
      id: 'google-roadmap',
      url: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-terrain',
      url: 'http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-roadmap-alt',
      url: 'http://mt0.google.com/vt/lyrs=r&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-satellite-only',
      url: 'http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-terrain-only',
      url: 'http://mt0.google.com/vt/lyrs=t&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
    {
      id: 'google-hybrid',
      url: 'http://mt0.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}',
      attribution: '&copy; <a href="https://developers.google.com/maps">Google Maps</a>',
    },
  ];

  return {
    tileLayerOptions,
  };
}
