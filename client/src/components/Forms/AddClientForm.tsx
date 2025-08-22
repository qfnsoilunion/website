import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Building, Landmark, AlertTriangle } from "lucide-react";

import { api } from "../../lib/api";
import { roleManager } from "../../lib/role";
import { useToast } from "@/hooks/use-toast";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import SimilarMatches from "../SimilarMatches";

const privateClientSchema = z.object({
  clientType: z.literal("PRIVATE"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Invalid PAN format"),
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  vehicles: z.string().min(1, "At least one vehicle is required"),
});

const governmentClientSchema = z.object({
  clientType: z.literal("GOVERNMENT"),
  name: z.string().min(1, "Organization name is required"),
  contactPerson: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  gstin: z.string().optional(),
  orgName: z.string().min(1, "Organization name required"),
  officeCode: z.string().min(1, "Office code required"),
  officialEmailOrLetterNo: z.string().min(1, "Official email or letter number required"),
  vehicles: z.string().optional(),
});

type ClientType = "PRIVATE" | "GOVERNMENT";
type PrivateClientForm = z.infer<typeof privateClientSchema>;
type GovernmentClientForm = z.infer<typeof governmentClientSchema>;

interface AddClientFormProps {
  open: boolean;
  onClose: () => void;
  dealerId?: string;
}

export default function AddClientForm({ open, onClose, dealerId }: AddClientFormProps) {
  const [clientType, setClientType] = useState<ClientType>("PRIVATE");
  const [conflictError, setConflictError] = useState<{
    dealerName: string;
    since: string;
  } | null>(null);
  const [searchData, setSearchData] = useState({
    name: "",
    mobile: "",
    email: "",
    pan: ""
  });
  const [hasSimilarMatches, setHasSimilarMatches] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const privateForm = useForm<PrivateClientForm>({
    resolver: zodResolver(privateClientSchema),
    defaultValues: {
      clientType: "PRIVATE",
      pan: "",
      name: "",
      mobile: "",
      email: "",
      address: "",
      gstin: "",
      vehicles: "",
    },
  });

  const governmentForm = useForm<GovernmentClientForm>({
    resolver: zodResolver(governmentClientSchema),
    defaultValues: {
      clientType: "GOVERNMENT",
      name: "",
      contactPerson: "",
      mobile: "",
      email: "",
      address: "",
      gstin: "",
      orgName: "",
      officeCode: "",
      officialEmailOrLetterNo: "",
      vehicles: "",
    },
  });

  // Watch form values for similarity search
  const privateWatchedValues = privateForm.watch(["name", "mobile", "email", "pan"]);
  const governmentWatchedValues = governmentForm.watch(["name", "mobile", "email"]);
  
  useEffect(() => {
    if (clientType === "PRIVATE") {
      const [name, mobile, email, pan] = privateWatchedValues;
      setSearchData({ name: name || "", mobile: mobile || "", email: email || "", pan: pan || "" });
    } else {
      const [name, mobile, email] = governmentWatchedValues;
      setSearchData({ name: name || "", mobile: mobile || "", email: email || "", pan: "" });
    }
  }, [clientType, privateWatchedValues, governmentWatchedValues]);

  const createClientMutation = useMutation({
    mutationFn: (data: any) => {
      // Parse vehicles from textarea
      const vehicles = data.vehicles
        ? data.vehicles.split('\n').map((v: string) => v.trim()).filter(Boolean)
        : [];

      if (!dealerId) {
        throw new Error("Dealer ID is required to add a client");
      }
      return api.createClient({
        ...data,
        vehicles,
        dealerId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Client added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/home"] });
      resetForms();
      setConflictError(null);
      onClose();
    },
    onError: (error: any) => {
      if (error.message.includes("CLIENT_ACTIVE_ELSEWHERE")) {
        try {
          const errorData = JSON.parse(error.message.split(": ")[1]);
          setConflictError({
            dealerName: errorData.dealerName,
            since: errorData.since,
          });
        } catch {
          toast({
            title: "Error",
            description: "Client is already active elsewhere",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to add client",
          variant: "destructive",
        });
      }
    },
  });

  const resetForms = () => {
    privateForm.reset();
    governmentForm.reset();
    setClientType("PRIVATE");
  };

  const onSubmit = () => {
    const form = clientType === "PRIVATE" ? privateForm : governmentForm;
    form.handleSubmit((data) => {
      setConflictError(null);
      createClientMutation.mutate(data);
    })();
  };

  const handleClose = () => {
    resetForms();
    setConflictError(null);
    setSearchData({ name: "", mobile: "", email: "", pan: "" });
    setHasSimilarMatches(false);
    onClose();
  };

  const handleTransferRequest = () => {
    toast({
      title: "Transfer Request",
      description: "Transfer request functionality will be implemented",
    });
    setConflictError(null);
  };

  return (
    <>
      <Modal isOpen={open} onClose={handleClose} title="Add New Client" size="xl">
        <div className="p-6">
          {/* Similar Clients Warning */}
          {dealerId && (
            <SimilarMatches 
              type="client"
              searchData={searchData}
              dealerId={dealerId}
              onMatchFound={setHasSimilarMatches}
            />
          )}
          
          {/* Conflict Error Alert */}
          {conflictError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This client is already active with <strong>{conflictError.dealerName}</strong> since{" "}
                  {new Date(conflictError.since).toLocaleDateString()}.
                </AlertDescription>
              </Alert>
              <div className="mt-4 flex space-x-3">
                <Button variant="outline" onClick={() => setConflictError(null)}>
                  Close
                </Button>
                <Button onClick={handleTransferRequest} className="bg-secondary hover:bg-secondary/90">
                  Request Transfer
                </Button>
              </div>
            </motion.div>
          )}

          {/* Client Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Client Type *</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  clientType === "PRIVATE" 
                    ? "border-primary bg-primary text-white" 
                    : "border-slate-300 hover:border-slate-400"
                }`}
                onClick={() => setClientType("PRIVATE")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Building className="w-6 h-6 mr-3" />
                    <div>
                      <h4 className="font-semibold">Private Client</h4>
                      <p className={`text-sm ${clientType === "PRIVATE" ? "opacity-90" : "opacity-70"}`}>
                        Individual or private company
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  clientType === "GOVERNMENT" 
                    ? "border-primary bg-primary text-white" 
                    : "border-slate-300 hover:border-slate-400"
                }`}
                onClick={() => setClientType("GOVERNMENT")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Landmark className="w-6 h-6 mr-3" />
                    <div>
                      <h4 className="font-semibold">Government Client</h4>
                      <p className={`text-sm ${clientType === "GOVERNMENT" ? "opacity-90" : "opacity-70"}`}>
                        Government department or agency
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Private Client Form */}
          {clientType === "PRIVATE" && (
            <Form {...privateForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={privateForm.control}
                    name="pan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>PAN Number *</FormLabel>
                        <FormControl>
                          <Input placeholder="ABCTY1234D" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Client/Company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privateForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact mobile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={privateForm.control}
                    name="gstin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GSTIN</FormLabel>
                        <FormControl>
                          <Input placeholder="GST identification number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={privateForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Complete address" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={privateForm.control}
                  name="vehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Registration Numbers *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter vehicle registration numbers (one per line)" 
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-slate-500">At least one vehicle is required for private clients</p>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Government Client Form */}
          {clientType === "GOVERNMENT" && (
            <Form {...governmentForm}>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={governmentForm.control}
                    name="orgName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Department/Agency name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={governmentForm.control}
                    name="officeCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="Unit/Office code" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={governmentForm.control}
                    name="officialEmailOrLetterNo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Official Email/Letter No *</FormLabel>
                        <FormControl>
                          <Input placeholder="Official communication reference" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={governmentForm.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Person</FormLabel>
                        <FormControl>
                          <Input placeholder="Point of contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={governmentForm.control}
                    name="mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Contact mobile" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={governmentForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Official email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={governmentForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Official address" rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={governmentForm.control}
                  name="vehicles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Registration Numbers</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter vehicle registration numbers (one per line)" 
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={onSubmit}
              disabled={createClientMutation.isPending}
              className="min-w-[120px]"
              variant={hasSimilarMatches ? "destructive" : "default"}
            >
              {createClientMutation.isPending ? "Adding..." : hasSimilarMatches ? "Add Despite Matches" : "Add Client"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
