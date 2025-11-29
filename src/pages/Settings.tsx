import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

export default function Settings() {
  const { logout } = useAuth();

  return (
    <div className="max-w-md mx-auto px-4 py-4 space-y-4">
      <h2 className="text-xl font-bold">Settings</h2>

      <Card>
        <h3 className="text-base font-semibold mb-3">Account</h3>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-600">Logged in as</p>
            <p className="font-medium text-sm">User</p>
          </div>
          <Button variant="secondary" onClick={logout} className="w-full">
            Logout
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold mb-3">Data & Privacy</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <p>• All data is encrypted at rest and in transit</p>
          <p>• You control who has access to your records</p>
          <p>• Your data is stored securely on our servers</p>
        </div>
      </Card>
    </div>
  );
}
