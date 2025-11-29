import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useProfiles, useCreateProfile } from '../hooks/useApi';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Spinner } from '../components/Loading';

export default function Profiles() {
  const { data: profiles, isLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    relationship: 'self',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProfile.mutateAsync(formData);
      setShowForm(false);
      setFormData({
        name: '',
        date_of_birth: '',
        gender: '',
        blood_group: '',
        relationship: 'self',
      });
    } catch (error) {
      console.error('Error creating profile:', error);
    }
  };

  if (isLoading) {
    return <Spinner size="lg" />;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Profiles</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={18} className="mr-1" />
          <span className="text-sm">Add</span>
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="text-base font-semibold mb-3">Create New Profile</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Date of Birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="input"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Input
              label="Blood Group"
              value={formData.blood_group}
              onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
              placeholder="A+, B+, O-, etc."
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="input"
              >
                <option value="self">Self</option>
                <option value="spouse">Spouse</option>
                <option value="child">Child</option>
                <option value="parent">Parent</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" isLoading={createProfile.isPending}>
                Create Profile
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-3">
        {profiles?.map((profile: any) => (
          <Card key={profile.id}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold">{profile.name}</h3>
                {profile.is_primary && (
                  <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-cyan-100 text-cyan-800 rounded">
                    Primary
                  </span>
                )}
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  {profile.gender && (
                    <p>Gender: {profile.gender}</p>
                  )}
                  {profile.blood_group && (
                    <p>Blood Group: {profile.blood_group}</p>
                  )}
                  {profile.relationship && (
                    <p>Relationship: {profile.relationship}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
