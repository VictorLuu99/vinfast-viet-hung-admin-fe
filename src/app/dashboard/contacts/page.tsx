"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  apiClient,
  formatDate,
  getStatusBadgeVariant,
  getContactDisplayName
} from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast, toast } from '@/components/ui/toast';
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
} from "lucide-react";

import { Contact } from "@/lib/types";

export default function ContactsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(
    null
  );
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchContacts = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getContacts({ page, limit: 10 });
      const responseData = response as {
        data: Contact[];
        pagination?: { pages: number };
        success: boolean;
      };
      setContacts(Array.isArray(responseData.data) ? responseData.data : []);
      setTotalPages(responseData.pagination?.pages || 1);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
      showToast(toast.error('Error Loading Data', 'Failed to load contacts. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [page, showToast]);

  React.useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateContactStatus = async (id: string, status: string) => {
    try {
      const response = await apiClient.updateContact(id, { status });
      if (response.success) {
        showToast(toast.success('Status Updated', `Contact status changed to ${status}`));
        await fetchContacts();
        setSelectedContact(null);
      } else {
        showToast(toast.error('Update Failed', 'Failed to update contact status'));
      }
    } catch (error) {
      console.error("Failed to update contact:", error);
      showToast(toast.error('System Error', 'An error occurred while updating contact status'));
    }
  };

  const deleteContact = (contact: Contact) => {
    const contactName = getContactDisplayName(contact);
    showConfirmation(confirmations.delete(contactName, async () => {
      try {
        const response = await apiClient.deleteContact(contact.id);
        if (response.success) {
          showToast(toast.success('Contact Deleted', 'Contact has been successfully removed'));
          await fetchContacts();
        } else {
          showToast(toast.error('Delete Failed', 'Failed to delete contact'));
        }
      } catch (error) {
        console.error("Failed to delete contact:", error);
        showToast(toast.error('System Error', 'An error occurred while deleting contact'));
      }
    }));
  };

  const filteredContacts = contacts.filter((contact) => {
    const displayName = getContactDisplayName(contact);
    const matchesSearch =
      displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.phone && contact.phone.includes(searchQuery)) ||
      (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (contact.message && contact.message.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus =
      statusFilter === "all" || contact.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return {
      total: contacts.length,
      new: contacts.filter((c) => c.status === "new").length,
      replied: contacts.filter((c) => c.status === "replied").length,
      closed: contacts.filter((c) => c.status === "closed").length,
    };
  };

  const stats = getStatusStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Contact Submissions
        </h1>
        <p className="text-muted-foreground">
          Manage customer inquiries and support requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Contacts
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Messages</CardTitle>
            <Badge variant="destructive" className="h-2 w-2 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Replied</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.replied}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Management</CardTitle>
          <CardDescription>
            View and manage all customer contact submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, company, or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contacts Table */}
          {loading ? (
            <div className="text-center py-8">Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contacts found matching your criteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{getContactDisplayName(contact)}</div>
                        {contact.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {contact.company ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {contact.company}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(contact.status)}>
                        {contact.status.charAt(0).toUpperCase() +
                          contact.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(contact.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedContact(contact)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Contact Details</DialogTitle>
                            </DialogHeader>
                            {selectedContact && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Name
                                    </Label>
                                    <div className="mt-1 flex items-center gap-2">
                                      <User className="h-4 w-4 text-muted-foreground" />
                                      {getContactDisplayName(selectedContact)}
                                    </div>
                                  </div>
                                  {selectedContact.email && (
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Email
                                      </Label>
                                      <div className="mt-1 flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {selectedContact.email}
                                      </div>
                                    </div>
                                  )}
                                  {selectedContact.phone && (
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Phone
                                      </Label>
                                      <div className="mt-1 flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        {selectedContact.phone}
                                      </div>
                                    </div>
                                  )}
                                  {selectedContact.company && (
                                    <div>
                                      <Label className="text-sm font-medium">
                                        Company
                                      </Label>
                                      <div className="mt-1 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        {selectedContact.company}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {selectedContact.message && (
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Message
                                    </Label>
                                    <div className="mt-1 p-3 bg-muted rounded-md min-h-[100px]">
                                      {selectedContact.message}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label className="text-sm font-medium">
                                      Current Status
                                    </Label>
                                    <div className="mt-1">
                                      <Badge
                                        variant={getStatusBadgeVariant(
                                          selectedContact.status
                                        )}
                                      >
                                        {selectedContact.status
                                          .charAt(0)
                                          .toUpperCase() +
                                          selectedContact.status.slice(1)}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Select
                                      defaultValue={selectedContact.status}
                                      onValueChange={(value) =>
                                        updateContactStatus(
                                          selectedContact.id,
                                          value
                                        )
                                      }
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent position="popper">
                                        <SelectItem value="new">New</SelectItem>
                                        <SelectItem value="read">Read</SelectItem>
                                        <SelectItem value="replied">
                                          Replied
                                        </SelectItem>
                                        <SelectItem value="closed">
                                          Closed
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Submitted:{" "}
                                  {formatDate(selectedContact.created_at)}
                                  {selectedContact.updated_at &&
                                    selectedContact.updated_at !==
                                    selectedContact.created_at && (
                                    <>
                                      {" "}
                                      • Updated:{" "}
                                      {formatDate(selectedContact.updated_at)}
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteContact(contact)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Beautiful Confirmation Dialog */}
      <ConfirmationDialog />
    </div>
  );
}
