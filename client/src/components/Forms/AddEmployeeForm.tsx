import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";

import { api } from "../../lib/api";
import { roleManager } from "../../lib/role";
import { useToast } from "@/hooks/use-toast";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

const addEmployeeSchema = z.object({
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  name: z.string().min(1, "Name is required"),
  mobile: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dateOfJoining: z.string().min(1, "Date of joining is required"),
  consent: z.boolean().refine(val => val === true, "Employee consent is required"),
});

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

interface AddEmployeeFormProps {
  open: boolean;
  onClose: () => void;
  dealerId?: string;
}

export default function AddEmployeeForm({ open, onClose, dealerId }: AddEmployeeFormProps) {
  const [conflictError, setConflictError] = useState<{
    dealerName: string;
    since: string;
  } | null>(null);
  const [searchData, setSearchData] = useState({
    name: "",
    mobile: "",
    email: ""
  });
  const [hasSimilarMatches, setHasSimilarMatches] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      aadhaar: "",
      name: "",
      mobile: "",
      email: "",
      address: "",
      dateOfBirth: "",
      dateOfJoining: "",
      consent: false,
    },
  });

  // Watch form values for similarity search
  const watchedValues = form.watch(["name", "mobile", "email"]);
  
  useEffect(() => {
    const [name, mobile, email] = watchedValues;
    setSearchData({ name: name || "", mobile: mobile || "", email: email || "" });
  }, [watchedValues]);

  const createEmployeeMutation = useMutation({
    mutationFn: (data: Omit<AddEmployeeForm, "consent">) => {
      if (!dealerId) {
        throw new Error("Dealer ID is required to add an employee");
      }
      return api.createEmployee({
        ...data,
        dealerId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/home"] });
      form.reset();
      setConflictError(null);
      onClose();
    },
    onError: (error: any) => {
      if (error.message.includes("EMPLOYEE_ACTIVE_ELSEWHERE")) {
        try {
          const errorData = JSON.parse(error.message.split(": ")[1]);
          setConflictError({
            dealerName: errorData.dealerName,
            since: errorData.since,
          });
        } catch {
          toast({
            title: "Error",
            description: "Employee is already active elsewhere",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to add employee",
          variant: "destructive",
        });
      }
    },
  });

  const onSubmit = (data: AddEmployeeForm) => {
    setConflictError(null);
    const { consent, ...employeeData } = data;
    createEmployeeMutation.mutate(employeeData);
  };

  const handleClose = () => {
    form.reset();
    setConflictError(null);
    setSearchData({ name: "", mobile: "", email: "" });
    setHasSimilarMatches(false);
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Add New Employee" size="lg">
      <div className="p-6">
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
                This employee is already active with <strong>{conflictError.dealerName}</strong> since{" "}
                {new Date(conflictError.since).toLocaleDateString()}. 
                Please contact the admin for transfer procedures.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Similar Employees Warning */}
            {dealerId && (
              <SimilarMatches 
                type="employee"
                searchData={searchData}
                dealerId={dealerId}
                onMatchFound={setHasSimilarMatches}
              />
            )}
            {/* Employee Consent */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <FormField
                control={form.control}
                name="consent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-amber-800 font-medium">
                        Employee Consent Required
                      </FormLabel>
                      <FormMessage />
                      <p className="text-xs text-amber-700">
                        I confirm that the employee has provided consent for their information to be recorded in the union registry system.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="aadhaar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhaar Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 12-digit Aadhaar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter mobile number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfJoining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Joining *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter complete address" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createEmployeeMutation.isPending}
                className="min-w-[120px]"
                variant={hasSimilarMatches ? "destructive" : "default"}
              >
                {createEmployeeMutation.isPending ? "Adding..." : hasSimilarMatches ? "Add Despite Matches" : "Add Employee"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
