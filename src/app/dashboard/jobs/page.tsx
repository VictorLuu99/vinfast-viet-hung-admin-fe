'use client'

import * as React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { BulletPointTextarea } from '@/components/BulletPointTextarea'
import { apiClient, formatDate, getStatusBadgeVariant } from '@/lib/utils'
import { Search, Plus, Edit, Trash2, Briefcase, MapPin, Clock, Calendar, Globe, Filter } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/toast'

interface Job {
  id: number
  title_en: string
  title_cn: string  
  title_vn: string
  description_en: string
  description_cn: string
  description_vn: string
  requirements_en: string
  requirements_cn: string
  requirements_vn: string
  benefits_en?: string
  benefits_cn?: string
  benefits_vn?: string
  location_en: string
  location_cn: string
  location_vn: string
  department: string
  employment_type: 'full-time' | 'part-time' | 'contract' | 'internship'
  experience_level: 'entry' | 'mid' | 'senior' | 'executive'
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  status: 'active' | 'published' | 'closed' | 'draft'
  priority: number
  featured?: boolean
  application_deadline?: string
  contact_email?: string
  contact_phone?: string
  created_at: string
  updated_at: string
  // Computed fields from API based on language
  title?: string
  description?: string
  location?: string
}

export default function JobsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  
  React.useEffect(() => {
    if (!user) {
      router.push('/login')
    }
  }, [user, router])

  const [jobs, setJobs] = React.useState<Job[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<string>('all')
  const [languageFilter, setLanguageFilter] = React.useState<string>('vn')
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const [page, setPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  
  // Form state for creating/editing jobs
  const [formData, setFormData] = React.useState({
    title_en: '',
    title_cn: '',
    title_vn: '',
    description_en: '',
    description_cn: '',
    description_vn: '',
    requirements_en: '',
    requirements_cn: '',
    requirements_vn: '',
    benefits_en: '',
    benefits_cn: '',
    benefits_vn: '',
    location_en: 'Vietnam',
    location_cn: '越南',
    location_vn: 'Việt Nam',
    salary_min: '',
    salary_max: '',
    salary_currency: 'USD',
    employment_type: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'internship',
    experience_level: 'mid' as 'entry' | 'mid' | 'senior' | 'executive',
    department: '',
    status: 'active' as 'active' | 'published' | 'closed' | 'draft',
    priority: 0,
    application_deadline: '',
    contact_email: '',
    contact_phone: '',
    slug: '',
    location: '',
    salary_range: '',
    expires_at: '',
    featured: false
  })

  const fetchJobs = React.useCallback(async () => {
    try {
      setLoading(true)
      const response = await apiClient.getJobs({ page, limit: 10, lang: languageFilter }) as unknown
      // Try to safely extract data and pagination
      const responseData = response as { data?: unknown[]; pagination?: { totalPages?: number } }
      setJobs(Array.isArray(responseData?.data) ? (responseData.data as Job[]) : [])
      setTotalPages(responseData?.pagination?.totalPages ?? 1)
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
      showToast({
        type: 'error',
        title: 'Failed to Load Jobs',
        description: 'An error occurred while loading job postings. Please refresh the page.'
      })
    } finally {
      setLoading(false)
    }
  }, [page, languageFilter, showToast])

  React.useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSave = async () => {
    try {
      const response = selectedJob 
        ? await apiClient.updateJob(selectedJob.id.toString(), formData)
        : await apiClient.createJob(formData)
      
      if (response) {
        await fetchJobs()
        setSelectedJob(null)
        setIsEditing(false)
        resetForm()
        showToast({
          type: 'success',
          title: selectedJob ? 'Job Updated Successfully' : 'Job Created Successfully',
          description: selectedJob ? 'The job posting has been updated.' : 'A new job posting has been created.'
        })
      }
    } catch (error) {
      console.error('Failed to save job:', error)
      showToast({
        type: 'error',
        title: 'Failed to Save Job',
        description: 'An error occurred while saving the job posting. Please try again.'
      })
    }
  }

  const deleteJob = async (id: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return

    try {
      const response = await apiClient.deleteJob(id.toString())
      if (response) {
        await fetchJobs()
        showToast({
          type: 'success',
          title: 'Job Deleted Successfully',
          description: 'The job posting has been removed.'
        })
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
      showToast({
        type: 'error',
        title: 'Failed to Delete Job',
        description: 'An error occurred while deleting the job posting. Please try again.'
      })
    }
  }

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_cn: '',
      title_vn: '',
      description_en: '',
      description_cn: '',
      description_vn: '',
      requirements_en: '',
      requirements_cn: '',
      requirements_vn: '',
      benefits_en: '',
      benefits_cn: '',
      benefits_vn: '',
      location_en: 'Vietnam',
      location_cn: '越南',
      location_vn: 'Việt Nam',
      salary_min: '',
      salary_max: '',
      salary_currency: 'USD',
      employment_type: 'full-time',
      experience_level: 'mid',
      department: '',
      status: 'active',
      priority: 0,
      application_deadline: '',
      contact_email: '',
      contact_phone: '',
      slug: '',
      location: '',
      salary_range: '',
      expires_at: '',
      featured: false
    })
  }

  const openEditor = (job?: Job) => {
    if (job) {
      setSelectedJob(job)
      setFormData({
        title_en: job.title_en || '',
        title_cn: job.title_cn || '',
        title_vn: job.title_vn || '',
        description_en: job.description_en || '',
        description_cn: job.description_cn || '',
        description_vn: job.description_vn || '',
        requirements_en: job.requirements_en || '',
        requirements_cn: job.requirements_cn || '',
        requirements_vn: job.requirements_vn || '',
        benefits_en: job.benefits_en || '',
        benefits_cn: job.benefits_cn || '',
        benefits_vn: job.benefits_vn || '',
        location_en: job.location_en || 'Vietnam',
        location_cn: job.location_cn || '越南',
        location_vn: job.location_vn || 'Việt Nam',
        salary_min: job.salary_min?.toString() || '',
        salary_max: job.salary_max?.toString() || '',
        salary_currency: job.salary_currency || 'USD',
        employment_type: job.employment_type || 'full-time',
        experience_level: job.experience_level || 'mid',
        department: job.department || '',
        status: job.status || 'active',
        priority: job.priority || 0,
        application_deadline: job.application_deadline ? job.application_deadline.split('T')[0] : '',
        contact_email: job.contact_email || '',
        contact_phone: job.contact_phone || '',
        slug: '',
        location: job.location || '',
        salary_range: '',
        expires_at: '',
        featured: job.featured || false
      })
    } else {
      setSelectedJob(null)
      resetForm()
    }
    setIsEditing(true)
  }

  const getTitle = (job: Job): string => {
    switch (languageFilter) {
      case 'en': return job.title_en || job.title_vn || job.title_cn
      case 'cn': return job.title_cn || job.title_vn || job.title_en
      default: return job.title_vn || job.title_en || job.title_cn
    }
  }

  const getDescription = (job: Job): string => {
    switch (languageFilter) {
      case 'en': return job.description_en || job.description_vn || job.description_cn
      case 'cn': return job.description_cn || job.description_vn || job.description_en
      default: return job.description_vn || job.description_en || job.description_cn
    }
  }

  const getLocation = (job: Job): string => {
    // Use API computed field first, then fallback to language-specific fields
    if (job.location) return job.location
    
    switch (languageFilter) {
      case 'en': return job.location_en || job.location_vn || job.location_cn
      case 'cn': return job.location_cn || job.location_vn || job.location_en
      default: return job.location_vn || job.location_en || job.location_cn
    }
  }

  const filteredJobs = jobs.filter(job => {
    const title = getTitle(job).toLowerCase()
    const location = getLocation(job).toLowerCase()
    const matchesSearch = title.includes(searchQuery.toLowerCase()) ||
                         job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusStats = () => {
    return {
      total: jobs.length,
      published: jobs.filter(j => j.status === 'published').length,
      active: jobs.filter(j => j.status === 'active').length,
      draft: jobs.filter(j => j.status === 'draft').length,
      closed: jobs.filter(j => j.status === 'closed').length
    }
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Job Descriptions</h1>
          <p className="text-muted-foreground">
            Manage job postings and recruitment content
          </p>
        </div>
        <Button onClick={() => openEditor()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Job Posting
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.published}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <div className="h-4 w-4 rounded-full bg-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Management Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Job Postings Management</CardTitle>
          <CardDescription>
            Create and manage job postings in multiple languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, department, or location..."
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
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Globe className="h-4 w-4 text-muted-foreground" />
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vn">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="cn">中文</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Jobs Table */}
          {loading ? (
            <div className="text-center py-8">Loading job postings...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No job postings found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          {getTitle(job)}
                          {job.featured && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground max-w-[300px] truncate">
                          {getDescription(job).slice(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{job.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {getLocation(job)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="secondary" className="text-xs">
                          {job.employment_type.replace('-', ' ').toUpperCase()}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(job.status)}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(job.created_at)}
                        </div>
                        {job.application_deadline && (
                          <div className="flex items-center gap-1 text-xs text-orange-600">
                            <Clock className="h-3 w-3" />
                            Expires: {formatDate(job.application_deadline)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditor(job)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteJob(job.id)}
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

      {/* Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={(open) => {
        setIsEditing(open)
        if (!open) {
          setSelectedJob(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedJob ? 'Edit Job Posting' : 'Create New Job Posting'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="job-posting-slug"
                />
              </div> */}
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Engineering, Sales, Marketing..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Ho Chi Minh City, Remote..."
                />
              </div>
              <div>
                <Label htmlFor="employment_type">Employment Type</Label>
                <Select value={formData.employment_type} onValueChange={(value: 'full-time' | 'part-time' | 'contract' | 'internship') => setFormData(prev => ({ ...prev, employment_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="experience_level">Experience Level</Label>
                <Select value={formData.experience_level} onValueChange={(value: 'entry' | 'mid' | 'senior' | 'executive') => setFormData(prev => ({ ...prev, experience_level: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="salary_range">Salary Range</Label>
                <Input
                  id="salary_range"
                  value={formData.salary_range || formData.salary_min}
                  onChange={(e) => setFormData(prev => ({ ...prev, salary_range: e.target.value }))}
                  placeholder="$50,000 - $70,000"
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'published' | 'closed') => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expires_at">Expires At</Label>
                <Input
                  id="expires_at"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
              />
              <Label htmlFor="featured">Featured Job Posting</Label>
            </div>

            {/* Multi-language Titles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Titles</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="title_vn">Title (Vietnamese)</Label>
                  <Input
                    id="title_vn"
                    value={formData.title_vn}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_vn: e.target.value }))}
                    placeholder="Tên vị trí tuyển dụng..."
                  />
                </div>
                <div>
                  <Label htmlFor="title_en">Title (English)</Label>
                  <Input
                    id="title_en"
                    value={formData.title_en}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_en: e.target.value }))}
                    placeholder="Job position title..."
                  />
                </div>
                <div>
                  <Label htmlFor="title_cn">Title (Chinese)</Label>
                  <Input
                    id="title_cn"
                    value={formData.title_cn}
                    onChange={(e) => setFormData(prev => ({ ...prev, title_cn: e.target.value }))}
                    placeholder="职位名称..."
                  />
                </div>
              </div>
            </div>

            {/* Multi-language Descriptions */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Descriptions</h3>
              <div className="space-y-4">
                <BulletPointTextarea
                  id="description_vn"
                  label="Description (Vietnamese)"
                  value={formData.description_vn}
                  onChange={(value) => setFormData(prev => ({ ...prev, description_vn: value }))}
                  placeholder="• Mô tả chi tiết về công việc&#10;• Trách nhiệm chính của vị trí&#10;• Môi trường làm việc"
                  minRows={4}
                  maxRows={8}
                />
                <BulletPointTextarea
                  id="description_en"
                  label="Description (English)"
                  value={formData.description_en}
                  onChange={(value) => setFormData(prev => ({ ...prev, description_en: value }))}
                  placeholder="• Detailed job description&#10;• Main responsibilities&#10;• Work environment details"
                  minRows={4}
                  maxRows={8}
                />
                <BulletPointTextarea
                  id="description_cn"
                  label="Description (Chinese)"
                  value={formData.description_cn}
                  onChange={(value) => setFormData(prev => ({ ...prev, description_cn: value }))}
                  placeholder="• 详细的工作描述&#10;• 主要职责&#10;• 工作环境详情"
                  minRows={4}
                  maxRows={8}
                />
              </div>
            </div>

            {/* Multi-language Requirements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Requirements</h3>
              <div className="space-y-4">
                <BulletPointTextarea
                  id="requirements_vn"
                  label="Requirements (Vietnamese)"
                  value={formData.requirements_vn}
                  onChange={(value) => setFormData(prev => ({ ...prev, requirements_vn: value }))}
                  placeholder="• Tốt nghiệp đại học chuyên ngành liên quan&#10;• Có kinh nghiệm làm việc tối thiểu 2 năm&#10;• Kỹ năng giao tiếp tốt"
                  minRows={4}
                  maxRows={10}
                  required
                />
                <BulletPointTextarea
                  id="requirements_en"
                  label="Requirements (English)"
                  value={formData.requirements_en}
                  onChange={(value) => setFormData(prev => ({ ...prev, requirements_en: value }))}
                  placeholder="• Bachelor's degree in related field&#10;• Minimum 2 years of relevant experience&#10;• Excellent communication skills"
                  minRows={4}
                  maxRows={10}
                  required
                />
                <BulletPointTextarea
                  id="requirements_cn"
                  label="Requirements (Chinese)"
                  value={formData.requirements_cn}
                  onChange={(value) => setFormData(prev => ({ ...prev, requirements_cn: value }))}
                  placeholder="• 相关专业本科学历&#10;• 至少2年相关工作经验&#10;• 优秀的沟通能力"
                  minRows={4}
                  maxRows={10}
                  required
                />
              </div>
            </div>

            {/* Multi-language Benefits */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Benefits (Optional)</h3>
              <div className="space-y-4">
                <BulletPointTextarea
                  id="benefits_vn"
                  label="Benefits (Vietnamese)"
                  value={formData.benefits_vn}
                  onChange={(value) => setFormData(prev => ({ ...prev, benefits_vn: value }))}
                  placeholder="• Lương thưởng cạnh tranh&#10;• Bảo hiểm sức khỏe toàn diện&#10;• Nghỉ phép có lương&#10;• Đào tạo phát triển nghề nghiệp"
                  minRows={3}
                  maxRows={8}
                />
                <BulletPointTextarea
                  id="benefits_en"
                  label="Benefits (English)"
                  value={formData.benefits_en}
                  onChange={(value) => setFormData(prev => ({ ...prev, benefits_en: value }))}
                  placeholder="• Competitive salary and bonuses&#10;• Comprehensive health insurance&#10;• Paid time off&#10;• Professional development opportunities"
                  minRows={3}
                  maxRows={8}
                />
                <BulletPointTextarea
                  id="benefits_cn"
                  label="Benefits (Chinese)"
                  value={formData.benefits_cn}
                  onChange={(value) => setFormData(prev => ({ ...prev, benefits_cn: value }))}
                  placeholder="• 有竞争力的薪资和奖金&#10;• 全面的健康保险&#10;• 带薪休假&#10;• 职业发展机会"
                  minRows={3}
                  maxRows={8}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {selectedJob ? 'Update' : 'Create'} Job
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}