import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Search,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  Fuel,
  Globe,
  Clock,
  IndianRupee,
  DollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LocalPrice {
  location: string;
  currency: string;
  currentPrice: number;
  previousPrice: number;
  change: string;
  changePercent: string;
  lastUpdated: string;
  marketOpen: boolean;
  regional: Record<string, number>;
}

interface SearchResult {
  location: string;
  price: number;
  currency: string;
  unit: string;
}

export default function OilPriceTracker() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");

  // Fetch local Srinagar prices by default
  const { data: localPrice, isLoading: localLoading } = useQuery<LocalPrice>({
    queryKey: ["/api/oil-prices/local"],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Fetch searched location prices
  const { data: searchResults, isLoading: searchLoading, refetch } = useQuery<{
    query: string;
    results: SearchResult[];
    timestamp: string;
  }>({
    queryKey: ["/api/oil-prices/search", selectedLocation],
    enabled: !!selectedLocation,
    refetchInterval: 300000,
  });

  const handleSearch = () => {
    if (searchLocation.trim()) {
      setSelectedLocation(searchLocation.trim());
      refetch();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "INR":
        return "₹";
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      case "AED":
        return "د.إ";
      case "JPY":
        return "¥";
      default:
        return currency;
    }
  };

  return (
    <div className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <Fuel className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900">
              Global Oil Price Intelligence
            </h2>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Real-time fuel prices with intelligent location search across the globe
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <Input
                    placeholder="Search any location worldwide (e.g., New York, London, Delhi)"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 h-12 text-slate-900 bg-white border-slate-300 focus:border-primary"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!searchLocation.trim() || searchLoading}
                  className="h-12 px-8 bg-primary hover:bg-primary/90 text-white font-medium"
                >
                  {searchLoading ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  Search Prices
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Current Location Price */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          {localLoading ? (
            <Card className="border-slate-200">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Fetching current prices for Srinagar, J&K...</p>
              </CardContent>
            </Card>
          ) : localPrice ? (
            <Card className="border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" />
                    <CardTitle className="text-xl">
                      Srinagar, Jammu and Kashmir
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                    Live
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Price */}
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900 mb-2">
                      ₹{localPrice.currentPrice}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">per liter (Petrol)</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className={`text-sm font-medium ${
                        localPrice.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {localPrice.change} ({localPrice.changePercent})
                      </span>
                      {localPrice.change.startsWith('+') ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </div>

                  {/* Regional Prices */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-slate-900 mb-3">Regional Comparison</h4>
                    {Object.entries(localPrice.regional).map(([city, price]) => (
                      <div key={city} className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-lg">
                        <span className="text-slate-700 font-medium">{city}</span>
                        <span className="text-slate-900 font-bold">₹{price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>Updated: {new Date(localPrice.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${localPrice.marketOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span>{localPrice.marketOpen ? 'Market Open' : 'Market Closed'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </motion.div>

        {/* Search Results */}
        {searchResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search Results for "{searchResults.query}"
                </CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults.results.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.results.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm">{result.location}</h4>
                          <Badge variant="outline" className="text-xs">
                            {result.currency}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-slate-900">
                            {getCurrencySymbol(result.currency)}{result.price}
                          </span>
                          <span className="text-sm text-slate-600">{result.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">No results found for "{searchResults.query}"</p>
                    <p className="text-sm text-slate-500 mt-1">Try searching for major cities or countries</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Location Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Popular Locations</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {["New York", "London", "Dubai", "Delhi", "Mumbai", "Tokyo", "Paris"].map((location) => (
                <Button
                  key={location}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchLocation(location);
                    setSelectedLocation(location);
                  }}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}