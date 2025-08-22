import { useState, useEffect, useCallback } from "react";
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { motion, AnimatePresence } from "framer-motion";
import { Fuel, MapPin, TrendingUp, TrendingDown, Navigation, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface FuelStation {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  prices: {
    petrol: number;
    diesel: number;
    lastUpdated: string;
  };
  distance?: number;
  rating?: number;
  isOpen?: boolean;
}

const mapContainerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

// Default center (Srinagar, Kashmir)
const defaultCenter = {
  lat: 34.0837,
  lng: 74.7973
};

// Google Maps libraries to load
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

// Custom map styles for better UI
const mapStyles = [
  {
    featureType: "poi.business",
    elementType: "labels",
    stylers: [{ visibility: "on" }]
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "on" }]
  }
];

export default function FuelStationsMap() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(defaultCenter);
  const [stations, setStations] = useState<FuelStation[]>([]);
  const [selectedStation, setSelectedStation] = useState<FuelStation | null>(null);
  const [searchLocation, setSearchLocation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userPos);
          setCenter(userPos);
        },
        () => {
          console.log("Location access denied, using default location");
        }
      );
    }
  }, []);

  // Load nearby gas stations when map is ready
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    searchNearbyStations(map, center);
  }, [center]);

  // Search for nearby gas stations
  const searchNearbyStations = (map: google.maps.Map, location: { lat: number; lng: number }) => {
    const service = new google.maps.places.PlacesService(map);
    
    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius: 5000, // 5km radius
      type: 'gas_station' as any,
      keyword: 'petrol pump fuel station'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const stationsData: FuelStation[] = results.slice(0, 10).map((place, index) => ({
          id: place.place_id || `station-${index}`,
          name: place.name || "Fuel Station",
          address: place.vicinity || "Address not available",
          location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0
          },
          prices: {
            petrol: generateRealisticPrice(95, 105), // Realistic INR prices
            diesel: generateRealisticPrice(85, 95),
            lastUpdated: new Date(Date.now() - Math.random() * 3600000).toISOString()
          },
          distance: calculateDistance(
            location.lat,
            location.lng,
            place.geometry?.location?.lat() || 0,
            place.geometry?.location?.lng() || 0
          ),
          rating: place.rating,
          isOpen: place.opening_hours?.isOpen()
        }));
        
        setStations(stationsData);
      }
    });
  };

  // Generate realistic fuel prices
  const generateRealisticPrice = (min: number, max: number): number => {
    return parseFloat((Math.random() * (max - min) + min).toFixed(2));
  };

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return parseFloat((R * c).toFixed(1));
  };

  // Search for a specific location
  const handleLocationSearch = () => {
    if (!searchLocation || !map) return;
    
    setIsLoading(true);
    const geocoder = new google.maps.Geocoder();
    
    geocoder.geocode({ address: searchLocation }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const newLocation = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        };
        setCenter(newLocation);
        map.panTo(newLocation);
        searchNearbyStations(map, newLocation);
      }
      setIsLoading(false);
    });
  };

  // Custom marker icon for fuel stations
  const createMarkerIcon = (isSelected: boolean) => ({
    url: isSelected 
      ? "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%23ff6b6b' stroke='white' stroke-width='2'%3E%3Cpath d='M3 8.5v7.5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8.5M11 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2.5M14 11h2.5a1.5 1.5 0 0 1 1.5 1.5v4.5M14 11l2-2v6m0 0v2a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-5.5'/%3E%3C/svg%3E"
      : "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='%230066ff' stroke='white' stroke-width='2'%3E%3Cpath d='M3 8.5v7.5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V8.5M11 8.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v2.5M14 11h2.5a1.5 1.5 0 0 1 1.5 1.5v4.5M14 11l2-2v6m0 0v2a1 1 0 0 0 1 1h0a1 1 0 0 0 1-1v-5.5'/%3E%3C/svg%3E",
    scaledSize: new google.maps.Size(isSelected ? 40 : 32, isSelected ? 40 : 32),
    anchor: new google.maps.Point(isSelected ? 20 : 16, isSelected ? 40 : 32)
  });

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search location (e.g., Lal Chowk, Srinagar)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
              className="pl-10"
            />
          </div>
          <Button onClick={handleLocationSearch} disabled={isLoading}>
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          {userLocation && (
            <Button
              variant="outline"
              onClick={() => {
                if (map && userLocation) {
                  setCenter(userLocation);
                  map.panTo(userLocation);
                  searchNearbyStations(map, userLocation);
                }
              }}
            >
              <Navigation className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Map Container */}
      <Card className="overflow-hidden">
        <LoadScript 
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}
          libraries={libraries}
        >
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={13}
            onLoad={onMapLoad}
            options={{
              styles: mapStyles,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false
            }}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='%234285F4'%3E%3Ccircle cx='12' cy='12' r='8'/%3E%3Ccircle cx='12' cy='12' r='3' fill='white'/%3E%3C/svg%3E",
                  scaledSize: new google.maps.Size(20, 20),
                  anchor: new google.maps.Point(10, 10)
                }}
              />
            )}

            {/* Fuel Station Markers */}
            {stations.map((station) => (
              <Marker
                key={station.id}
                position={station.location}
                onClick={() => setSelectedStation(station)}
                icon={createMarkerIcon(selectedStation?.id === station.id)}
              />
            ))}

            {/* Info Window */}
            {selectedStation && (
              <InfoWindow
                position={selectedStation.location}
                onCloseClick={() => setSelectedStation(null)}
              >
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-blue-600" />
                    {selectedStation.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{selectedStation.address}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Petrol:</span>
                      <Badge className="bg-green-100 text-green-800">
                        ₹{selectedStation.prices.petrol}/L
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Diesel:</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        ₹{selectedStation.prices.diesel}/L
                      </Badge>
                    </div>
                    {selectedStation.distance && (
                      <div className="text-xs text-gray-500 pt-1 border-t">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {selectedStation.distance} km away
                      </div>
                    )}
                    {selectedStation.isOpen !== undefined && (
                      <div className="text-xs">
                        <Badge variant={selectedStation.isOpen ? "default" : "secondary"}>
                          {selectedStation.isOpen ? "Open Now" : "Closed"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Card>

      {/* Station List */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
          <Fuel className="w-5 h-5 text-blue-600" />
          Nearby Fuel Stations
        </h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {stations.length > 0 ? (
            stations
              .sort((a, b) => (a.distance || 0) - (b.distance || 0))
              .map((station) => (
                <motion.div
                  key={station.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    setSelectedStation(station);
                    map?.panTo(station.location);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{station.name}</h4>
                      <p className="text-xs text-gray-600">{station.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">
                        ₹{station.prices.petrol}
                      </div>
                      <div className="text-xs text-gray-500">Petrol/L</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="w-3 h-3 mr-1" />
                      {station.distance} km
                    </Badge>
                    <div className="text-xs text-gray-500">
                      Diesel: ₹{station.prices.diesel}/L
                    </div>
                  </div>
                </motion.div>
              ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              {isLoading ? "Searching for fuel stations..." : "No fuel stations found nearby"}
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}