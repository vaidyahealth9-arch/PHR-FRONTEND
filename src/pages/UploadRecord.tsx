import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfiles, useUploadRecord } from '../hooks/useApi';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function UploadRecord() {
  const navigate = useNavigate();
  const { data: profiles } = useProfiles();
  const uploadMutation = useUploadRecord();
  
  const [formData, setFormData] = useState({
    profile_id: '',
    record_type: 'lab_report',
    title: '',
    description: '',
    issued_date: '',
    source_facility: '',
    source_doctor: '',
  });
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a file');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('file', file);
    formDataToSend.append('profile_id', formData.profile_id);
    formDataToSend.append('record_type', formData.record_type);
    formDataToSend.append('title', formData.title);
    if (formData.description) formDataToSend.append('description', formData.description);
    if (formData.issued_date) formDataToSend.append('issued_date', formData.issued_date);
    if (formData.source_facility) formDataToSend.append('source_facility', formData.source_facility);
    if (formData.source_doctor) formDataToSend.append('source_doctor', formData.source_doctor);

    try {
      await uploadMutation.mutateAsync(formDataToSend);
      navigate('/records');
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="text-3xl font-bold mb-6">Upload Medical Record</h2>
      
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile
            </label>
            <select
              value={formData.profile_id}
              onChange={(e) => setFormData({ ...formData, profile_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select profile...</option>
              {profiles?.map((profile: any) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Type
            </label>
            <select
              value={formData.record_type}
              onChange={(e) => setFormData({ ...formData, record_type: e.target.value })}
              className="input"
            >
              <option value="lab_report">Lab Report</option>
              <option value="radiology">Radiology</option>
              <option value="prescription">Prescription</option>
              <option value="clinical_note">Clinical Note</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File
            </label>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="input"
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" isLoading={uploadMutation.isPending}>
              Upload Record
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
