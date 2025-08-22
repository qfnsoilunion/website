import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";

const endEmploymentSchema = z.object({
  separationDate: z.string().min(1, "Separation date is required"),
  separationType: z.enum(["RESIGNED", "PERFORMANCE", "CONDUCT", "REDUNDANCY", "OTHER"]),
  remarks: z.string().min(1, "Remarks are required"),
});

type EndEmploymentForm = z.infer<typeof endEmploymentSchema>;

interface Employee {
  employment: {
    id: string;
    currentStatus: string;
    dateOfJoining: string;
    dateOfResignation: string | null;
  };
  person: {
    id: string;
    name: string;
    aadhaar: string;
    mobile: string | null;
    email: string | null;
  };
}

interface EndEmploymentFormProps {
  open: boolean;
  onClose: () => void;
  employee: Employee;
}

export default function EndEmploymentForm({ open, onClose, employee }: EndEmploymentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EndEmploymentForm>({
    resolver: zodResolver(endEmploymentSchema),
    defaultValues: {
      separationDate: "",
      separationType: "RESIGNED",
      remarks: "",
    },
  });

  const endEmploymentMutation = useMutation({
    mutationFn: (data: EndEmploymentForm) => 
      api.endEmployment(employee.employment.id, data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employment ended successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/dealers"] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to end employment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EndEmploymentForm) => {
    endEmploymentMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>End Employment</DialogTitle>
          <DialogDescription>
            End employment for {employee.person.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="separationDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Separation Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="separationType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Separation Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select separation type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="RESIGNED">Resigned</SelectItem>
                      <SelectItem value="PERFORMANCE">Performance</SelectItem>
                      <SelectItem value="CONDUCT">Conduct</SelectItem>
                      <SelectItem value="REDUNDANCY">Redundancy</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter separation remarks..." 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={endEmploymentMutation.isPending}
                variant="destructive"
              >
                {endEmploymentMutation.isPending ? "Ending..." : "End Employment"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}