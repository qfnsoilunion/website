import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Fuel,
  Zap,
  RotateCcw
} from "lucide-react";

interface FuelLocation {
  name: string;
  country: string;
  coordinates: { lat: number; lng: number };
  prices: {
    petrol: { regular: string; premium: string };
    diesel: string;
  };
  trend: string;
  changePercent: string;
}

export default function FuelPriceGlobe() {
  const [selectedLocation, setSelectedLocation] = useState<FuelLocation | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);
  const globeRef = useRef<HTMLDivElement>(null);

  // Auto-rotate the globe
  useEffect(() => {
    const interval = setInterval(() => {
      setRotationAngle(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Fetch global fuel prices
  const { data: globalData, isLoading, refetch } = useQuery({
    queryKey: [`/api/oil-prices/global`],
    queryFn: () => fetch('/api/oil-prices/global', {
      credentials: 'include'
    }).then(res => res.json()),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const locations = globalData?.locations || [];

  const getLocationStyle = (location: FuelLocation, index: number) => {
    const angle = (index * (360 / locations.length) + rotationAngle) % 360;
    const x = 50 + 35 * Math.cos((angle * Math.PI) / 180);
    const y = 50 + 35 * Math.sin((angle * Math.PI) / 180);
    
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      zIndex: angle > 90 && angle < 270 ? 1 : 10
    };
  };

  const getPriceColor = (price: string, type: 'petrol' | 'diesel') => {
    const numPrice = parseFloat(price);
    if (type === 'petrol') {
      return numPrice > 110 ? 'text-red-600' : numPrice > 100 ? 'text-orange-600' : 'text-green-600';
    } else {
      return numPrice > 95 ? 'text-red-600' : numPrice > 85 ? 'text-orange-600' : 'text-green-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Globe */}
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Global Fuel Price Map
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="ml-auto"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              ref={globeRef}
              className="relative w-full h-96 mx-auto"
              style={{ perspective: '1000px' }}
            >
              {/* Globe Background */}
              <div className="absolute inset-0 rounded-full border-4 border-slate-200 bg-gradient-to-br from-blue-50 to-blue-100 shadow-2xl">
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 opacity-30"></div>
              </div>

              {/* Location Markers */}
              {locations.map((location: FuelLocation, index: number) => (
                <motion.div
                  key={`${location.name}-${index}`}
                  className="absolute cursor-pointer"
                  style={getLocationStyle(location, index)}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedLocation(location)}
                >
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg">
                      <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
                      {location.name}
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* Grid Lines */}
              <div className="absolute inset-0 rounded-full border border-slate-300 opacity-30"></div>
              <div className="absolute inset-4 rounded-full border border-slate-300 opacity-20"></div>
              <div className="absolute inset-8 rounded-full border border-slate-300 opacity-10"></div>
            </div>

            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading global prices...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {selectedLocation ? selectedLocation.name : 'Select a Location'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedLocation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedLocation.country}</Badge>
                  <Badge variant={selectedLocation.trend === 'up' ? 'destructive' : 'default'}>
                    {selectedLocation.trend === 'up' ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : selectedLocation.trend === 'down' ? (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    ) : (
                      <Zap className="w-3 h-3 mr-1" />
                    )}
                    {selectedLocation.changePercent}%
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      Petrol Prices
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Regular:</span>
                        <span className={`font-mono font-semibold ${getPriceColor(selectedLocation.prices.petrol.regular, 'petrol')}`}>
                          ₹{selectedLocation.prices.petrol.regular}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Premium:</span>
                        <span className={`font-mono font-semibold ${getPriceColor(selectedLocation.prices.petrol.premium, 'petrol')}`}>
                          ₹{selectedLocation.prices.petrol.premium}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Fuel className="w-4 h-4" />
                      Diesel Price
                    </h4>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Per Liter:</span>
                      <span className={`font-mono font-semibold ${getPriceColor(selectedLocation.prices.diesel, 'diesel')}`}>
                        ₹{selectedLocation.prices.diesel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600">
                    Coordinates: {selectedLocation.coordinates.lat.toFixed(4)}, {selectedLocation.coordinates.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Globe className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600">
                  Click on any location marker on the globe to view detailed fuel prices
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Global Statistics */}
      {globalData && (
        <Card>
          <CardHeader>
            <CardTitle>Global Fuel Price Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {locations.length}
                </div>
                <div className="text-sm text-slate-600">Locations Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  ₹{globalData.averagePetrolPrice}
                </div>
                <div className="text-sm text-slate-600">Avg Petrol Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  ₹{globalData.averageDieselPrice}
                </div>
                <div className="text-sm text-slate-600">Avg Diesel Price</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  Live
                </div>
                <div className="text-sm text-slate-600">Real-time Data</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}