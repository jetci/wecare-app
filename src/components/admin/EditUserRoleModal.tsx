import React, { useState, useEffect } from 'react';
import { Role, Position, User } from '@prisma/client';

interface EditUserRoleModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userId: string, role?: Role, position?: Position) => Promise<void>;
}

const EditUserRoleModal: React.FC<EditUserRoleModalProps> = ({ user, isOpen, onClose, onSave }) => {
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [position, setPosition] = useState<Position | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setPosition(user.position || undefined);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    await onSave(user.id, role, position);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Edit Role for {user.firstName} {user.lastName}</h2>
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
          <select
            id="position"
            value={position || ''}
            onChange={(e) => setPosition(e.target.value as Position)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">- None -</option>
            {Object.values(Position).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EditUserRoleModal;
