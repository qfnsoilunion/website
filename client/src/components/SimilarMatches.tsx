import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Building, 
  AlertTriangle, 
  Eye, 
  Phone, 
  Mail, 
  CreditCard,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SimilarEmployee {
  employment: {
    id: string;
    dealerId: string;
    dateOfJoining: string;
  };
  person: {
    id: string;
    name: string;
    aadhaar: string;
    mobile?: string;
    email?: string;
  };
  dealer: {
    id: string;
    legalName: string;
  };
  dealerName: string;
}

interface SimilarClient {
  client: {
    id: string;
    name: string;
    pan?: string;
    mobile?: string;
    email?: string;
    clientType: string;
  };
  link: {
    dealerId: string;
    dateOfOnboarding: string;
  };
  dealer: {
    id: string;
    legalName: string;
  };
  dealerName: string;
}

interface SimilarMatchesProps {
  type: "employee" | "client";
  searchData: {
    name?: string;
    mobile?: string;
    email?: string;
    pan?: string;
  };
  dealerId: string;
  onMatchFound?: (hasMatches: boolean) => void;
}

export default function SimilarMatches({ type, searchData, dealerId, onMatchFound }: SimilarMatchesProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Build search params
  const searchParams = new URLSearchParams();
  Object.entries(searchData).forEach(([key, value]) => {
    if (value && value.trim()) {
      searchParams.append(key, value.trim());
    }
  });
  searchParams.append("dealerId", dealerId);

  // Only query if we have some search criteria
  const hasSearchCriteria = Object.values(searchData).some(value => value && value.trim());

  const { data: matches, isLoading } = useQuery({
    queryKey: [`/api/${type}s/similar`, searchParams.toString()],
    queryFn: () => {
      if (!hasSearchCriteria) return Promise.resolve([]);
      return fetch(`/api/${type}s/similar?${searchParams}`, {
        credentials: 'include'
      }).then(res => res.json());
    },
    enabled: hasSearchCriteria,
    refetchOnWindowFocus: false,
  });

  const hasMatches = matches && matches.length > 0;

  useEffect(() => {
    if (onMatchFound) {
      onMatchFound(hasMatches);
    }
  }, [hasMatches, onMatchFound]);

  // Auto-expand if there are matches
  useEffect(() => {
    if (hasMatches) {
      setIsOpen(true);
    }
  }, [hasMatches]);

  if (!hasSearchCriteria || isLoading) {
    return null;
  }

  if (!hasMatches) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-4"
    >
      <Card className="border-amber-200 bg-amber-50">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-amber-100 transition-colors">
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <AlertTriangle className="w-5 h-5" />
                Similar {type === "employee" ? "Employees" : "Clients"} Found
                <Badge variant="secondary" className="ml-auto">
                  {matches?.length || 0} match{matches?.length !== 1 ? 'es' : ''}
                </Badge>
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <AnimatePresence>
            {isOpen && (
              <CollapsibleContent asChild>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardContent className="pt-0">
                    <p className="text-sm text-amber-700 mb-4">
                      We found similar {type}s in other dealers' records. Please review to avoid duplicates:
                    </p>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {matches?.map((match: SimilarEmployee | SimilarClient, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-3 bg-white rounded-lg border border-amber-200 shadow-sm"
                        >
                          {type === "employee" ? (
                            <EmployeeMatch match={match as SimilarEmployee} />
                          ) : (
                            <ClientMatch match={match as SimilarClient} />
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="mt-4 p-3 bg-amber-100 rounded-lg">
                      <p className="text-xs text-amber-800">
                        <strong>Note:</strong> If you recognize this {type}, consider contacting the dealer for a potential transfer instead of creating a duplicate record.
                      </p>
                    </div>
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </Card>
    </motion.div>
  );
}

function EmployeeMatch({ match }: { match: SimilarEmployee }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-gray-900">{match.person.name}</span>
          <Badge variant="outline" className="text-xs">
            {match.person.aadhaar?.slice(-4) || 'N/A'}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-3 h-3" />
            <span>Dealer: <strong>{match.dealerName}</strong></span>
          </div>
          
          {match.person.mobile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{match.person.mobile}</span>
            </div>
          )}
          
          {match.person.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3 h-3" />
              <span>{match.person.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>Joined: {new Date(match.employment.dateOfJoining).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientMatch({ match }: { match: SimilarClient }) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Building className="w-4 h-4 text-green-600" />
          <span className="font-semibold text-gray-900">{match.client.name}</span>
          <Badge variant="outline" className="text-xs">
            {match.client.clientType}
          </Badge>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="w-3 h-3" />
            <span>Dealer: <strong>{match.dealerName}</strong></span>
          </div>
          
          {match.client.pan && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-3 h-3" />
              <span>PAN: {match.client.pan}</span>
            </div>
          )}
          
          {match.client.mobile && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              <span>{match.client.mobile}</span>
            </div>
          )}
          
          {match.client.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-3 h-3" />
              <span>{match.client.email}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-3 h-3" />
            <span>Onboarded: {new Date(match.link.dateOfOnboarding).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}