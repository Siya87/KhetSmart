/** Minimal Google Maps JS API types used by StorageMap and FarmerLocationMap. */
declare namespace google {
  namespace maps {
    class Map {
      constructor(el: HTMLElement, opts?: MapOptions);
      fitBounds(bounds: LatLngBounds, padding?: number | Padding): void;
      setCenter(latLng: LatLng | LatLngLiteral): void;
      setZoom(zoom: number): void;
      panTo(latLng: LatLng | LatLngLiteral): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setMap(map: Map | null): void;
      setPosition(position: LatLng | LatLngLiteral): void;
      addListener(event: string, handler: () => void): MapsEventListener;
    }

    class InfoWindow {
      constructor(opts?: InfoWindowOptions);
      setContent(content: string): void;
      open(map?: Map, anchor?: Marker): void;
      close(): void;
    }

    class LatLngBounds {
      constructor(sw?: LatLngLiteral, ne?: LatLngLiteral);
      extend(point: LatLng | LatLngLiteral): void;
    }

    class Polygon {
      constructor(opts?: PolygonOptions);
      setMap(map: Map | null): void;
    }

    class Polyline {
      constructor(opts?: PolylineOptions);
      setMap(map: Map | null): void;
    }

    interface MapOptions {
      center?: LatLngLiteral;
      zoom?: number;
      mapTypeControl?: boolean;
      streetViewControl?: boolean;
      fullscreenControl?: boolean;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      restriction?: { latLngBounds: LatLngBoundsLiteral; strictBounds?: boolean };
      styles?: MapTypeStyle[];
    }

    interface MapTypeStyle {
      featureType?: string;
      elementType?: string;
      stylers?: Record<string, string | number>[];
    }

    interface Padding {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    }

    interface MarkerOptions {
      position?: LatLngLiteral;
      map?: Map;
      title?: string;
      icon?: Symbol | Icon;
      zIndex?: number;
    }

    interface InfoWindowOptions {
      content?: string;
    }

    interface PolygonOptions {
      paths?: LatLngLiteral[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      fillColor?: string;
      fillOpacity?: number;
      map?: Map;
    }

    interface PolylineOptions {
      path?: LatLngLiteral[];
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
      map?: Map;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }

    interface LatLngBoundsLiteral {
      north: number;
      south: number;
      east: number;
      west: number;
    }

    interface LatLng {
      lat(): number;
      lng(): number;
    }

    interface Icon {
      path?: SymbolPath | string;
      scale?: number;
      fillColor?: string;
      fillOpacity?: number;
      strokeColor?: string;
      strokeWeight?: number;
    }

    interface MapsEventListener {
      remove(): void;
    }

    namespace event {
      function trigger(instance: object, eventName: string): void;
    }

    enum SymbolPath {
      CIRCLE = 0,
      BACKWARD_CLOSED_ARROW = 1,
      BACKWARD_OPEN_ARROW = 2,
      FORWARD_CLOSED_ARROW = 3,
      FORWARD_OPEN_ARROW = 4,
    }
  }
}

interface Window {
  google: typeof google;
}
