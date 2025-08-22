import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { api } from "../../lib/api";
import { roleManager } from "../../lib/role";
import { useToast } from "@/hooks/use-toast";
import Modal from "../Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const addDealerSchema = z.object({
  legalName: z.string().min(1, "Legal name is required"),
  outletName: z.string().min(1, "Outlet name is required"),
  location: z.string().min(1, "Location is required"),
});

type AddDealerForm = z.infer<typeof addDealerSchema>;

interface AddDealerFormProps {
  open: boolean;
  onClose: () => void;
}

export default function AddDealerForm({ open, onClose }: AddDealerFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AddDealerForm>({
    resolver: zodResolver(addDealerSchema),
    defaultValues: {
      legalName: "",
      outletName: "",
      location: "",
    },
  });

  const createDealerMutation = useMutation({
    mutationFn: api.createDealer,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Dealer added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dealers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics/home"] });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add dealer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AddDealerForm) => {
    createDealerMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={handleClose} title="Add New Dealer" size="md">
      <div className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Legal Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter legal business name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="outletName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outlet Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter outlet/brand name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location/city" {...field} />
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
                disabled={createDealerMutation.isPending}
                className="min-w-[120px]"
              >
                {createDealerMutation.isPending ? "Adding..." : "Add Dealer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
