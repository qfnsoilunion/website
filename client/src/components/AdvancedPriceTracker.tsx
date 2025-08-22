import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Fuel,
  MapPin,
  Clock,
  BarChart3,
  Zap
} from "lucide-react";

interface PriceData {
  location: string;
  country: string;
  currency: string;
  currencySymbol: string;
  prices: {
    petrol: { regular: string; premium: string };
    diesel: string;
  };
  trend: string;
  changePercent: string;
  marketAnalysis: {
    volatility: string;
    supplyStatus: string;
    demandLevel: string;
  };
  nearbyStations: Array<{
    name: string;
    distance: string;
    petrolPrice: string;
    dieselPrice: string;
    rating: string;
  }>;
  historicalData: Array<{
    date: string;
    petrol: string;
    diesel: string;
  }>;
}

export default function AdvancedPriceTracker() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("petrol");
  const [refreshInterval, setRefreshInterval] = useState(5000);

  // Search for specific location prices
  const { data: locationData, isLoading, refetch } = useQuery({
    queryKey: [`/api/oil-prices/search`, searchLocation],
    enabled: searchLocation.length >= 3,
    queryFn: () => {
      const params = new URLSearchParams({ location: searchLocation });
      return fetch(`/api/oil-prices/search?${params}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
  });

  // Auto-refresh data
  useEffect(() => {
    if (!searchLocation) return;
    
    const interval = setInterval(() => {
      refetch();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [searchLocation, refreshInterval, refetch]);

  const handleSearch = () => {
    if (searchLocation.length >= 3) {
      refetch();
    }
  };

  const formatCurrency = (amount: string, symbol: string = '₹') => {
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  const getVolatilityColor = (volatility: string) => {
    const vol = parseFloat(volatility);
    if (vol > 70) return 'text-red-600 bg-red-50';
    if (vol > 40) return 'text-orange-600 bg-orange-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="space-y-6">
      {/* Search Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Fuel Price Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Enter location (city, country) - min 3 characters..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searchLocation.length < 3}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          <div className="flex gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Auto-refresh every {refreshInterval / 1000}s</span>
            </div>
            <Select value={refreshInterval.toString()} onValueChange={(value) => setRefreshInterval(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5000">5 seconds</SelectItem>
                <SelectItem value="10000">10 seconds</SelectItem>
                <SelectItem value="30000">30 seconds</SelectItem>
                <SelectItem value="60000">1 minute</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && searchLocation && (
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Searching global fuel prices for {searchLocation}...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {locationData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Prices */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {locationData.location}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{locationData.country}</Badge>
                <Badge variant={locationData.trend === 'up' ? 'destructive' : 'default'}>
                  {getTrendIcon(locationData.trend)}
                  {locationData.changePercent}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Fuel className="w-4 h-4" />
                  Current Prices
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm">Petrol (Regular)</span>
                    <span className="font-mono font-bold text-lg">
                      {formatCurrency(locationData.prices.petrol.regular, locationData.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                    <span className="text-sm">Petrol (Premium)</span>
                    <span className="font-mono font-bold text-lg">
                      {formatCurrency(locationData.prices.petrol.premium, locationData.currencySymbol)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                    <span className="text-sm">Diesel</span>
                    <span className="font-mono font-bold text-lg text-blue-600">
                      {formatCurrency(locationData.prices.diesel, locationData.currencySymbol)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Market Analysis
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Volatility</span>
                    <Badge className={getVolatilityColor(locationData.marketAnalysis.volatility)}>
                      {locationData.marketAnalysis.volatility}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Supply</span>
                    <Badge variant={locationData.marketAnalysis.supplyStatus === 'tight' ? 'destructive' : 'default'}>
                      {locationData.marketAnalysis.supplyStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Demand</span>
                    <Badge variant={locationData.marketAnalysis.demandLevel === 'high' ? 'destructive' : 'secondary'}>
                      {locationData.marketAnalysis.demandLevel}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                30-Day Price Trend
              </CardTitle>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="petrol">Petrol</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={locationData.historicalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    formatter={(value: any, name: string) => [
                      formatCurrency(value, locationData.currencySymbol),
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                  />
                  {(selectedMetric === 'petrol' || selectedMetric === 'both') && (
                    <Line 
                      type="monotone" 
                      dataKey="petrol" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                    />
                  )}
                  {(selectedMetric === 'diesel' || selectedMetric === 'both') && (
                    <Line 
                      type="monotone" 
                      dataKey="diesel" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Nearby Stations */}
      {locationData?.nearbyStations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Nearby Fuel Stations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locationData.nearbyStations.map((station: any, index: number) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{station.name}</h4>
                    <Badge variant="outline">{station.rating}★</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{station.distance} away</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Petrol:</span>
                      <span className="font-mono">{formatCurrency(station.petrolPrice, locationData.currencySymbol)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Diesel:</span>
                      <span className="font-mono">{formatCurrency(station.dieselPrice, locationData.currencySymbol)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}