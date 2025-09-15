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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiClient, formatDate, getStatusBadgeVariant } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToast, toast } from '@/components/ui/toast';
import { useConfirmationDialog, confirmations } from '@/components/ui/confirmation-dialog';
import {
  Search,
  FileText,
  Download,
  Mail,
  Phone,
  Calendar,
  User,
  Filter,
  Trash2,
  Eye,
  CheckCircle,
  X,
  Star,
} from "lucide-react";

interface CVApplication {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  job_title_en?: string;
  job_title_vn?: string;
  job_department?: string;
  years_experience?: number;
  current_company?: string;
  current_position?: string;
  education_level?: string;
  skills?: string;
  cover_letter?: string;
  cv_file_url?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  status: "new" | "reviewed" | "interviewed" | "hired" | "rejected";
  rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function CandidatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { showConfirmation, ConfirmationDialog } = useConfirmationDialog();

  React.useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const [applications, setApplications] = React.useState<CVApplication[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [selectedApplication, setSelectedApplication] =
    React.useState<CVApplication | null>(null);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);

  const fetchApplications = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = (await apiClient.getCVApplications({
        page,
        limit: 10,
      })) as unknown;
      const responseData = response as {
        data: unknown[];
        pagination: { totalPages: number };
      };
      setApplications(
        Array.isArray(responseData.data)
          ? (responseData.data as CVApplication[])
          : []
      );
      if (responseData.pagination) {
        setTotalPages(responseData.pagination.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch CV applications:", error);
      showToast(toast.error('Error Loading Data', 'Failed to load CV applications. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [page, showToast]);

  React.useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateApplicationStatus = async (
    id: string,
    status: string,
    rating?: number,
    notes?: string
  ) => {
    try {
      const updateData: Record<string, unknown> = { status };
      if (rating !== undefined) updateData.rating = rating;
      if (notes !== undefined) updateData.notes = notes;

      const response = await apiClient.updateCVApplication(id, updateData);
      if (response.success) {
        showToast(toast.success('Application Updated', 'Candidate status has been updated successfully'));
        await fetchApplications();
        setSelectedApplication(null);
      } else {
        showToast(toast.error('Update Failed', 'Failed to update candidate status'));
      }
    } catch (error) {
      console.error("Failed to update application:", error);
      showToast(toast.error('System Error', 'An error occurred while updating candidate status'));
    }
  };

  const deleteApplication = (application: CVApplication) => {
    const candidateName = `${application.first_name} ${application.last_name}`;
    showConfirmation(confirmations.delete(candidateName, async () => {
      try {
        const response = await apiClient.deleteCVApplication(application.id);
        if (response.success) {
          showToast(toast.success('Application Deleted', 'Candidate application has been removed'));
          await fetchApplications();
        } else {
          showToast(toast.error('Delete Failed', 'Failed to delete candidate application'));
        }
      } catch (error) {
        console.error("Failed to delete application:", error);
        showToast(toast.error('System Error', 'An error occurred while deleting candidate application'));
      }
    }));
  };

  const filteredApplications = applications.filter((app) => {
    const fullName = `${app.first_name} ${app.last_name}`;
    const position =
      app.job_title_vn || app.job_title_en || app.job_department || "";
    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStats = () => {
    return {
      total: applications.length,
      new: applications.filter((a) => a.status === "new").length,
      reviewed: applications.filter((a) => a.status === "reviewed").length,
      interviewed: applications.filter((a) => a.status === "interviewed")
        .length,
      hired: applications.filter((a) => a.status === "hired").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };
  };

  const stats = getStatusStats();

  const renderRating = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Candidate Profiles
        </h1>
        <p className="text-muted-foreground">
          Manage job applications and candidate evaluations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Badge variant="destructive" className="h-2 w-2 p-0" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interviewed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.interviewed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hired</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <X className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Candidate Applications</CardTitle>
          <CardDescription>
            Review and manage job applications from candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates by name, email, or position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applications Table */}
          {loading ? (
            <div className="text-center py-8">Loading applications...</div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No applications found matching your criteria
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Candidate</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{`${application.first_name} ${application.last_name}`}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {application.email}
                        </div>
                        {application.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {application.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {application.job_title_vn ||
                            application.job_title_en ||
                            "Position"}
                        </div>
                        {application.current_company && (
                          <div className="text-sm text-muted-foreground">
                            at {application.current_company}
                          </div>
                        )}
                        {application.job_department && (
                          <div className="text-xs text-muted-foreground">
                            {application.job_department}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {application.years_experience ? (
                        <Badge variant="outline">
                          {application.years_experience} years
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(application.status)}
                      >
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderRating(application.rating)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(application.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedApplication(application)
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Candidate Profile</DialogTitle>
                            </DialogHeader>
                            {selectedApplication && (
                              <CandidateProfileView
                                application={selectedApplication}
                                onUpdateStatus={updateApplicationStatus}
                                onClose={() => setSelectedApplication(null)}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteApplication(application)}
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

// Candidate Profile View Component
interface CandidateProfileViewProps {
  application: CVApplication;
  onUpdateStatus: (
    id: string,
    status: string,
    rating?: number,
    notes?: string
  ) => void;
  onClose: () => void;
}

function CandidateProfileView({
  application,
  onUpdateStatus,
  onClose,
}: CandidateProfileViewProps) {
  const [status, setStatus] = React.useState<
    "new" | "reviewed" | "interviewed" | "hired" | "rejected"
  >(application.status);
  const [rating, setRating] = React.useState(application.rating || 0);
  const [notes, setNotes] = React.useState(application.notes || "");

  const handleSave = () => {
    onUpdateStatus(
      application.id,
      status,
      rating || undefined,
      notes || undefined
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold">{`${application.first_name} ${application.last_name}`}</h3>
          <p className="text-lg text-muted-foreground">
            {application.job_title_vn || application.job_title_en || "Position"}
          </p>
        </div>
        <Badge
          variant={getStatusBadgeVariant(application.status)}
          className="text-sm"
        >
          {application.status.charAt(0).toUpperCase() +
            application.status.slice(1)}
        </Badge>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{application.email}</span>
            </div>
            {application.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{application.phone}</span>
              </div>
            )}
            {application.linkedin_url && (
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <a
                  href={application.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}
            {application.portfolio_url && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a
                  href={application.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Portfolio
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Professional Background</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {application.current_company && (
              <div>
                <Label className="text-sm font-medium">Current Company</Label>
                <div>{application.current_company}</div>
              </div>
            )}
            {application.current_position && (
              <div>
                <Label className="text-sm font-medium">Current Position</Label>
                <div>{application.current_position}</div>
              </div>
            )}
            {application.years_experience && (
              <div>
                <Label className="text-sm font-medium">Experience</Label>
                <div>{application.years_experience} years</div>
              </div>
            )}
            {application.education_level && (
              <div>
                <Label className="text-sm font-medium">Education</Label>
                <div>{application.education_level}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Skills */}
      {application.skills && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-md">{application.skills}</div>
          </CardContent>
        </Card>
      )}

      {/* Cover Letter */}
      {application.cover_letter && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cover Letter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted rounded-md whitespace-pre-wrap">
              {application.cover_letter}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CV File */}
      {application.cv_file_url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resume/CV</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a
                href={application.cv_file_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="mr-2 h-4 w-4" />
                Download CV
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Evaluation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evaluation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value: string) =>
                  setStatus(
                    value as
                      | "new"
                      | "reviewed"
                      | "interviewed"
                      | "hired"
                      | "rejected"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="interviewed">Interviewed</SelectItem>
                  <SelectItem value="hired">Hired</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rating">Rating</Label>
              <Select
                value={rating.toString()}
                onValueChange={(value) => setRating(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate candidate" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="0">No Rating</SelectItem>
                  <SelectItem value="1">⭐ (1/5)</SelectItem>
                  <SelectItem value="2">⭐⭐ (2/5)</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ (3/5)</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ (4/5)</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ (5/5)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add evaluation notes, interview feedback, etc..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Application Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Application Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              <span>Applied: {formatDate(application.created_at)}</span>
            </div>
            {application.updated_at !== application.created_at && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Last Updated: {formatDate(application.updated_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={handleSave}>Update Evaluation</Button>
      </div>
    </div>
  );
}
